<?php

namespace App\Services\Egerai;

/**
 * Faithful PHP port of the reference e-GeRAI Python app's extract.py
 * `_parse_laporan_text()` + `extract_narasi_sections()` — applied to text
 * extracted from the "Laporan Hidro-Oseanografi / Kondisi Eksisting Ekosistem" PDF/DOCX.
 */
class LaporanTextExtractor
{
    /** Fields used for the AI fallback prompt, mirrors llm_fallback.py's LAPORAN_FIELD_HINTS keys. */
    public const FIELD_HINTS = [
        'lokasi_studi' => 'nama lokasi/perairan studi',
        'batimetri_titik_pusat' => 'kedalaman pada titik pusat lokasi (meter, angka saja, boleh negatif)',
        'batimetri_panjang_lintasan' => 'panjang lintasan pemeruman batimetri (km, angka saja)',
        'batimetri_terdalam' => 'kedalaman terdalam pada profil batimetri (meter, angka saja, boleh negatif)',
        'hs_rata' => 'tinggi gelombang signifikan rata-rata (meter, angka saja)',
        'hs_maks' => 'tinggi gelombang signifikan maksimum ekstrem (meter, angka saja)',
        'hs_arah' => 'arah dominan gelombang ekstrem (derajat, angka saja)',
        'arus_rata' => 'kecepatan arus rata-rata (m/detik, angka saja)',
        'arus_maks' => 'kecepatan arus maksimum ekstrem (m/detik, angka saja)',
        'arus_arah' => 'arah dominan arus maksimum (derajat, angka saja)',
        'hat' => 'elevasi Highest Astronomical Tide/HAT (meter, angka saja)',
        'msl' => 'elevasi Mean Sea Level/MSL (meter, angka saja)',
        'lat' => 'elevasi Lowest Astronomical Tide/LAT (meter, angka saja, boleh negatif)',
        'tidal_range' => 'tunggang pasang surut/tidal range (meter, angka saja)',
        'formzahl' => 'bilangan Formzahl (angka saja)',
        'eko_total_ha' => 'total luas area kajian ekosistem (Ha, angka saja)',
        'eko_karang_ha' => 'luas tutupan terumbu karang (Ha, angka saja)',
        'eko_karang_pct' => 'persentase tutupan terumbu karang (angka saja)',
        'eko_lainnya_ha' => 'luas tutupan lainnya/non-terumbu (Ha, angka saja)',
        'eko_lainnya_pct' => 'persentase tutupan lainnya (angka saja)',
        'eko_terbuka_ha' => 'luas area laut terbuka tanpa ekosistem (Ha, angka saja)',
        'eko_terbuka_pct' => 'persentase area laut terbuka (angka saja)',
        'eko_jarak_terdekat_km' => 'jarak ekosistem terdekat dari titik pusat (km, angka saja)',
    ];

    private const NUM_PREFIX = '(?:[IVXLCDM]{1,4}|\d{1,2}|[A-Z])';

    private const NARASI_TAG_BY_KEYWORD = [
        ['/gelombang/iu', 'gelombang'],
        ['/arus/iu', 'arus'],
        ['/pasang\s*surut|pasut/iu', 'pasut'],
        ['/batimetri|profil\s*dasar\s*laut/iu', 'batimetri'],
        ['/ekosistem/iu', 'ekosistem'],
        ['/pendahuluan/iu', null],
        ['/penutup/iu', null],
    ];

    private const MAX_NARASI_LEN = 4000;

    public function extract(string $fullTextRaw): array
    {
        $fullText = TextNormalizer::norm($fullTextRaw);
        $data = [];
        $data['_narasi'] = $this->extractNarasiSections($fullTextRaw);

        $data['lokasi_studi'] = preg_match('/LOKASI TITIK PUSAT RENCANA KEGIATAN\s*(.+?)\s*I\.\s*PENDAHULUAN/su', $fullText, $m)
            ? TextNormalizer::norm($m[1]) : '';

        $data['batimetri_titik_pusat'] = preg_match('/Kedalaman\s*pada\s*titik\s*pusat\s*tercatat\s*sebesar\s*(-?[\d.]+)\s*meter/u', $fullText, $m) ? $m[1] : '';
        $data['batimetri_panjang_lintasan'] = preg_match('/panjang\s*lintasan\s*([\d.]+)\s*kilometer/u', $fullText, $m) ? $m[1] : '';
        $data['batimetri_terdalam'] = preg_match('/nilai\s*terdalam\s*mencapai\s*(-?[\d.]+)\s*meter/u', $fullText, $m) ? $m[1] : '';

        $data['hs_rata'] = preg_match('/Tinggi\s*Gelombang\s*Signifikan\s*\(Hs\)\s*Rata-rata:\s*([\d.]+)\s*meter/u', $fullText, $m) ? $m[1] : '';

        if (preg_match('/Maksimum\s*Ekstrem:\s*([\d.]+)\s*meter.*?arah\s*dominan\s*dari\s*([\d.]+)\s*derajat\s*\(sektor\s*barat/su', $fullText, $m)) {
            $data['hs_maks'] = $m[1];
            $data['hs_arah'] = $m[2];
        }

        $data['arus_rata'] = preg_match('/Kecepatan\s*Arus\s*Rata-rata:\s*([\d.]+)\s*meter\s*per\s*detik/u', $fullText, $m) ? $m[1] : '';

        if (preg_match('/Kecepatan\s*Arus\s*Maksimum\s*Ekstrem:\s*([\d.]+)\s*meter\s*per\s*detik.*?arah\s*dominan\s*dari\s*([\d.]+)\s*derajat/su', $fullText, $m)) {
            $data['arus_maks'] = $m[1];
            $data['arus_arah'] = $m[2];
        }

        $data['hat'] = preg_match('/Highest\s*Astronomical\s*Tide\s*\(HAT\):\s*\+?(-?[\d.]+)\s*meter/u', $fullText, $m) ? $m[1] : '';
        $data['msl'] = preg_match('/Mean\s*Sea\s*Level\s*\(MSL\):\s*(-?[\d.]+)\s*meter/u', $fullText, $m) ? $m[1] : '';
        $data['lat'] = preg_match('/Lowest\s*Astronomical\s*Tide\s*\(LAT\):\s*(-?[\d.]+)\s*meter/u', $fullText, $m) ? $m[1] : '';
        $data['tidal_range'] = preg_match('/Tidal\s*Range:\s*([\d.]+)\s*meter/u', $fullText, $m) ? $m[1] : '';
        $data['formzahl'] = preg_match('/Bilangan\s*Formzahl:\s*(\d+\.\d+)/u', $fullText, $m) ? $m[1] : '';
        $data['tipe_pasut'] = preg_match('/diklasifikasikan.*?sebagai\s*([A-Za-z ]+?),/su', $fullText, $m) ? TextNormalizer::norm($m[1]) : 'Mixed Diurnal';

        $data['eko_total_ha'] = preg_match('/area\s*rencana\s*kegiatan\s*seluas\s*([\d.]+)\s*Hektar/u', $fullText, $m) ? $m[1] : '';

        if (preg_match('/Terumbu\s*Karang:\s*([\d.]+)\s*Hektar\s*\(([\d.]+)\s*persen/u', $fullText, $m)) {
            $data['eko_karang_ha'] = $m[1];
            $data['eko_karang_pct'] = $m[2];
        }
        if (preg_match('/Lainnya\s*\(termasuk\s*substrat\s*dasar\s*non-terumbu\):\s*([\d.]+)\s*Hektar\s*\(([\d.]+)\s*persen/u', $fullText, $m)) {
            $data['eko_lainnya_ha'] = $m[1];
            $data['eko_lainnya_pct'] = $m[2];
        }
        if (preg_match('/Area\s*Laut\s*Terbuka\s*\(Tanpa\s*Ekosistem\):\s*([\d.]+)\s*Hektar\s*\(([\d.]+)\s*persen/u', $fullText, $m)) {
            $data['eko_terbuka_ha'] = $m[1];
            $data['eko_terbuka_pct'] = $m[2];
        }

        $data['eko_jarak_terdekat_km'] = preg_match('/jarak\s*ekosistem\s*terdekat\s*dari\s*titik\s*pusat\s*rencana\s*kegiatan\s*adalah\s*([\d.]+)\s*kilometer/u', $fullText, $m) ? $m[1] : '';

        $data['ada_lamun'] = str_contains(mb_strtolower($fullText), 'padang lamun teridentifikasi');

        return $data;
    }

    public function missing(array $data): array
    {
        return array_values(array_filter(
            array_keys(self::FIELD_HINTS),
            fn ($key) => blank($data[$key] ?? null)
        ));
    }

    /** Port of extract_narasi_sections(): captures whole-paragraph narrative between section headings. */
    private function extractNarasiSections(string $fullTextRaw): array
    {
        $lines = preg_split('/\n/', $fullTextRaw ?? '');
        $headingRe = '/^'.self::NUM_PREFIX.'\s*[.\-–:]?\s*'
            .'(GELOMBANG'
            .'|ARUS'
            .'|PASANG\s*SURUT|SIKLUS\s*PASUT'
            .'|PROFIL\s*(GARIS\s*)?BATIMETRI|PROFIL\s*DASAR\s*LAUT|BATIMETRI'
            .'|EKOSISTEM(\s*PESISIR)?'
            .'|PENDAHULUAN'
            .'|PENUTUP)'
            .'\s*$/iu';

        $headings = [];
        foreach ($lines as $i => $line) {
            $lineNorm = TextNormalizer::norm($line);
            if ($lineNorm === '') {
                continue;
            }
            if (preg_match($headingRe, $lineNorm)) {
                $tag = null;
                foreach (self::NARASI_TAG_BY_KEYWORD as [$pattern, $t]) {
                    if (preg_match($pattern, $lineNorm)) {
                        $tag = $t;
                        break;
                    }
                }
                $headings[] = [$i, $tag];
            }
        }

        if (! $headings) {
            return [];
        }

        $narasi = [];
        foreach ($headings as $idx => [$lineI, $tag]) {
            $nextLineI = $headings[$idx + 1][0] ?? count($lines);
            $chunkLines = array_slice($lines, $lineI + 1, max(0, $nextLineI - $lineI - 1));
            $chunk = trim(TextNormalizer::norm(implode(' ', $chunkLines)), ' .:-');
            $chunk = mb_substr($chunk, 0, self::MAX_NARASI_LEN);
            if ($tag && $chunk !== '' && ! isset($narasi[$tag])) {
                $narasi[$tag] = $chunk;
            }
        }

        return $narasi;
    }
}
