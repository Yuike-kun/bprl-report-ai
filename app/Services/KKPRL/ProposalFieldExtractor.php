<?php

namespace App\Services\KKPRL;

class ProposalFieldExtractor
{
    /** Fields shared by the review form and the deterministic extractor. */
    public const FIELDS = [
        'nama_perusahaan' => ['Nama Perusahaan/Instansi', 'Nama Perusahaan'],
        'nib' => ['NIB'],
        'npwp' => ['NPWP'],
        'telp' => ['Nomor Telepon Selular', 'Nomor Telepon', 'Telepon'],
        'email' => ['Surat Elektronik', 'Email'],
        'jenis_kegiatan' => ['Jenis Kegiatan'],
        'no_referensi' => ['Nomor Referensi', 'No. Referensi'],
        'tanggal_penyusunan' => ['Tanggal Penyusunan'],
        'nama_perairan' => ['Nama Perairan'],
        'uraian_kegiatan' => ['Uraian Kegiatan', 'Rencana Kegiatan'],
        'luas_ruang_total' => ['Luas Kebutuhan Ruang', 'Luas Ruang'],
    ];

    public function extract(string $text): array
    {
        $normalized = $this->normalize($text);
        $values = array_fill_keys(array_keys(self::FIELDS), '');

        foreach (self::FIELDS as $field => $labels) {
            $values[$field] = $this->valueAfterLabel($normalized, $labels);
        }

        $values['nama_perusahaan'] = $values['nama_perusahaan'] ?: $this->valueAfterLabel($normalized, ['Nama Pemohon']);

        return $values;
    }

    public function missing(array $fields): array
    {
        return array_keys(array_filter($fields, fn ($value) => blank($value)));
    }

    private function valueAfterLabel(string $text, array $labels): string
    {
        foreach ($labels as $label) {
            $following = implode('|', array_map(fn ($item) => preg_quote($item, '/'), array_merge(...array_values(self::FIELDS))));
            $pattern = '/'.preg_quote($label, '/').'\\s*[:\\-]?\\s*(.{1,350}?)(?=\\s+(?:'.$following.')\\b|(?:\\s+[IVX]+\\.)|$)/iu';
            if (preg_match($pattern, $text, $matches)) {
                return $this->clean($matches[1]);
            }
        }

        return '';
    }

    private function normalize(string $value): string
    {
        return preg_replace('/\\s+/u', ' ', str_replace(["\xC2\xA0", "\xEF\xBB\xBF"], ' ', $value)) ?? '';
    }

    private function clean(string $value): string
    {
        return trim(preg_replace('/\\s+/u', ' ', $value) ?? '');
    }
}
