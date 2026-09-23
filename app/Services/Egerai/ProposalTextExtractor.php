<?php

namespace App\Services\Egerai;

use App\Support\TextCase;

/**
 * Faithful PHP port of the reference e-GeRAI Python app's extract.py
 * `_parse_proposal_text()` — same field keys, same regex intent, applied to
 * text already extracted from the "Draft Proposal PKKPRL" PDF/DOCX.
 */
class ProposalTextExtractor
{
    public const LABELS = [
        'Nama Pemohon', 'Jabatan Pemohon', 'Nama Perusahaan/Instansi', 'NIB',
        'NPWP', 'Nomor Telepon Selular', 'Surat Elektronik', 'Jenis Kegiatan',
        'Lokasi Kegiatan', 'Nama Perairan', 'Luas Kebutuhan Ruang', 'KBLI',
        'Tanggal Penyusunan',
    ];

    /** Fields used for the AI fallback prompt, mirrors llm_fallback.py's PROPOSAL_FIELD_HINTS keys. */
    public const FIELD_HINTS = [
        'Nama Pemohon' => 'nama lengkap pemohon/direktur perusahaan',
        'Jabatan Pemohon' => 'jabatan pemohon di perusahaan',
        'Nama Perusahaan/Instansi' => 'nama perusahaan/instansi pemohon',
        'NIB' => 'Nomor Induk Berusaha',
        'NPWP' => 'Nomor Pokok Wajib Pajak',
        'Nomor Telepon Selular' => 'nomor telepon pemohon',
        'Surat Elektronik' => 'alamat email pemohon',
        'Jenis Kegiatan' => 'jenis kegiatan pemanfaatan ruang laut yang dimohonkan',
        'Nama Perairan' => 'nama perairan/laut lokasi kegiatan',
        'Luas Kebutuhan Ruang' => 'luas ruang laut yang dimohonkan (dengan satuan)',
        'KBLI' => 'kode KBLI kegiatan',
        'investasi' => "total nilai investasi/pendanaan kegiatan (angka saja, tanpa 'Rp')",
        'tenaga_kerja' => 'jumlah tenaga kerja per siklus (angka saja)',
        'mangrove_spesies' => 'nama spesies mangrove yang dominan di lokasi',
        'mangrove_persen' => 'persentase tutupan mangrove (angka saja)',
        'mangrove_kondisi' => 'kondisi/kepadatan tutupan mangrove',
        'lamun_spesies' => 'nama spesies lamun/seagrass yang dominan di lokasi (string kosong jika ekosistem lamun tidak disebutkan sama sekali)',
        'lamun_persen' => 'persentase tutupan lamun/seagrass (angka saja)',
        'lamun_kondisi' => 'kondisi/kepadatan tutupan lamun/seagrass',
        'karang_spesies' => 'nama spesies terumbu karang yang dominan di lokasi (string kosong jika ekosistem terumbu karang tidak disebutkan sama sekali)',
        'karang_persen_manual' => 'persentase tutupan terumbu karang (angka saja)',
        'karang_kondisi' => 'kondisi/kepadatan tutupan terumbu karang',
        'desa_luas_ha' => 'luas wilayah desa dalam Hektar (angka saja)',
        'desa_penduduk' => 'jumlah penduduk desa (angka saja)',
    ];

    public function extract(string $fullTextRaw): array
    {
        $fullText = TextNormalizer::norm($fullTextRaw);
        $data = [];

        foreach (self::LABELS as $idx => $label) {
            $nextLabel = self::LABELS[$idx + 1] ?? null;
            $nextPattern = $nextLabel !== null ? preg_quote($nextLabel, '/') : 'I\.\s*RENCANA';
            $pattern = '/'.preg_quote($label, '/').'\s*(.*?)\s*'.$nextPattern.'/su';
            $data[$label] = preg_match($pattern, $fullText, $m) ? TextNormalizer::norm($m[1]) : '';
        }

        $lokasiRaw = $data['Lokasi Kegiatan'] ?? '';
        $data['_lokasi_parts'] = array_values(array_filter(preg_split('/\s{1,}/u', $lokasiRaw) ?: []));

        // Prefer the raw (non-normalized) multi-line block between the two labels,
        // since normalization collapses the newlines that separate desa/kecamatan/kabupaten/provinsi.
        if (preg_match('/Lokasi Kegiatan\s*\n(.*?)\nNama Perairan/su', $fullTextRaw, $mLoc)) {
            $lines = array_values(array_filter(array_map(
                fn ($l) => TextNormalizer::norm($l),
                preg_split('/\n/', $mLoc[1])
            )));
            if (count($lines) >= 4) {
                $data['_lokasi_parts'] = array_slice($lines, 0, 4);
            } elseif (count($lines) === 1 && substr_count($lines[0], ',') >= 2) {
                $commaParts = array_values(array_filter(array_map(
                    fn ($p) => TextNormalizer::norm($p),
                    explode(',', $lines[0])
                )));
                if (count($commaParts) >= 4) {
                    $cleaned = [];
                    foreach (array_slice($commaParts, 0, 4) as $i => $part) {
                        if (in_array($i, [0, 1, 3], true)) {
                            $part = preg_replace('/^(desa|kecamatan|provinsi)\s+/iu', '', $part);
                        }
                        $cleaned[] = $part;
                    }
                    $data['_lokasi_parts'] = $cleaned;
                } elseif ($lines) {
                    $data['_lokasi_parts'] = $lines;
                }
            } elseif ($lines) {
                $data['_lokasi_parts'] = $lines;
            }
        }

        // The source proposal prints the wilayah block in ALL CAPS
        // ("BUNTUSU", "KOTA MAKASSAR") — normalise each part once here so the
        // review form, the persisted KkprlProposal and both document engines
        // (local + external API koreksi) all see normal casing.
        $data['_lokasi_parts'] = array_map(
            fn ($part) => TextCase::humanize(is_string($part) ? $part : null) ?? $part,
            $data['_lokasi_parts']
        );

        if (preg_match('/PT\.\s*[A-Z .]+?(?=\s+yang diwakili|\s+berencana)/u', $fullText, $m)) {
            $data['Nama Perusahaan/Instansi'] = TextNormalizer::norm($m[0]);
        }

        preg_match_all(
            '/(\d+)\s+(\d+°\s*\d+\'\s*[\d,]+"\s*(?:BT|E))\s+(\d+°\s*\d+\'\s*[\d,]+"\s*(?:LS|S))/u',
            $fullText,
            $koordMatches,
            PREG_SET_ORDER
        );
        $data['koordinat'] = array_map(fn ($m) => [$m[1], $m[2], $m[3]], $koordMatches);

        $data['investasi'] = preg_match('/komitmen\s*pendanaan\s*investasi\s*secara\s*keseluruhan\s*sebesar\s*([\d.,]+)/u', $fullText, $m)
            ? rtrim($m[1], '.') : '';

        $data['tenaga_kerja'] = preg_match('/berjumlah\s*(\d+)\s*orang\s*per\s*siklus/u', $fullText, $m) ? $m[1] : '';
        $data['tenaga_kerja_asing'] = preg_match('/tenaga\s*kerja\s*asing\s*berjumlah\s*(\d+)/u', $fullText, $m) ? $m[1] : '0';

        if (preg_match(
            '/didominasi\s*oleh\s*([A-Za-z][A-Za-z .]+?)\s*dengan\s*persentase\s*tutupan\s*mangrove\s*(\d+)%\s*kondisi\s*([A-Za-z ]+?)\s*serta/u',
            $fullText,
            $m
        )) {
            $data['mangrove_spesies'] = TextNormalizer::norm($m[1]);
            $data['mangrove_persen'] = $m[2];
            $data['mangrove_kondisi'] = TextNormalizer::norm($m[3]);
        }

        if (preg_match('/seluas\s*(\d+)\s*Ha\s*dengan\s*jumlah\s*penduduk\s*sebanyak\s*([\d.]+)/u', $fullText, $m)) {
            $data['desa_luas_ha'] = $m[1];
            $data['desa_penduduk'] = rtrim($m[2], '.');
        }

        $lower = mb_strtolower($fullText);
        $data['non_reklamasi'] = str_contains($lower, 'tanpa reklamasi');
        $data['kegiatan_berusaha'] = str_contains($lower, 'kegiatan berusaha');
        $data['non_strategis'] = str_contains($lower, 'non-strategis nasional');

        return $data;
    }

    public function missing(array $data): array
    {
        return array_values(array_filter(
            array_keys(self::FIELD_HINTS),
            fn ($key) => blank($data[$key] ?? null)
        ));
    }
}
