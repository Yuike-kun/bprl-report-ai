<?php

namespace App\Services;

use PhpOffice\PhpWord\Element\Section;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Shared\Converter;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\SimpleType\JcTable;
use PhpOffice\PhpWord\SimpleType\VerticalJc;
use PhpOffice\PhpWord\Style\Language;
use PhpOffice\PhpWord\Writer\Word2007;

class ProposalDocumentGenerator
{
    private const NAVY = '1F4E79';
    private const LIGHT_BLUE = 'DCE6F1';
    private const MISSING = '[data tidak terdeteksi otomatis – mohon lengkapi manual]';
    private array $images = [];

    public function create(array $data, string $path, array $images = []): void
    {
        $this->images = $images;
        $word = new PhpWord();
        $word->getSettings()->setThemeFontLang(new Language('id-ID'));
        $section = $word->addSection([
            'marginLeft'   => Converter::cmToTwip(2.5),
            'marginRight'  => Converter::cmToTwip(2),
            'marginTop'    => Converter::cmToTwip(2),
            'marginBottom' => Converter::cmToTwip(2),
        ]);
        $this->cover($section, $data);
        $section->addPageBreak();
        $this->chapterOne($section, $data);
        $section->addPageBreak();
        $this->chapterTwo($section, $data);
        $section->addPageBreak();
        $this->chapterThree($section, $data);
        $section->addPageBreak();
        $this->chapterFour($section, $data);
        (new Word2007($word))->save($path);
    }

    private function v(array $data, string $key, ?string $default = null): string
    {
        return trim((string) ($data[$key] ?? '')) ?: ($default ?? self::MISSING);
    }

    private function location(array $d): string
    {
        return $this->v($d, 'location', $this->v($d, 'Lokasi Kegiatan', $this->v($d, 'provinsi')));
    }

    private function company(array $d): string
    {
        return $this->v($d, 'company', $this->v($d, 'nama_perusahaan', $this->v($d, 'Nama Perusahaan/Instansi')));
    }

    private function activity(array $d): string
    {
        return $this->v($d, 'activity', $this->v($d, 'jenis_kegiatan', $this->v($d, 'Jenis Kegiatan')));
    }

    private function area(array $d): string
    {
        $area = $this->v($d, 'area', $this->v($d, 'luas_ruang_total', $this->v($d, 'Luas Kebutuhan Ruang')));
        return preg_match('/^[\d.,]+$/', $area) ? "$area Ha" : $area;
    }

    private function text(Section $s, string $text, bool $italic = false): void
    {
        $s->addText($text, ['name' => 'Calibri', 'size' => 11, 'italic' => $italic], ['alignment' => Jc::BOTH, 'spaceAfter' => 160, 'lineHeight' => 1.25]);
    }

    private function heading(Section $s, string $text, int $level): void
    {
        $sizes = [1 => 15, 2 => 13, 3 => 12];
        $s->addText($text, ['name' => 'Calibri', 'size' => $sizes[$level], 'bold' => true, 'color' => $level < 3 ? self::NAVY : '000000'], ['spaceBefore' => $level === 1 ? 280 : 200, 'spaceAfter' => $level === 1 ? 160 : 120]);
    }

    private function caption(Section $s, string $text): void
    {
        $s->addText($text, ['name' => 'Calibri', 'size' => 10, 'italic' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 220]);
    }

    private function missingImage(Section $s, string $label, string $caption): void
    {
        $image = $this->images[$label][0] ?? null;
        if ($image && is_file($image)) {
            $s->addImage($image, ['width' => 500, 'alignment' => Jc::CENTER]);
            $this->caption($s, $caption);
            return;
        }
        $s->addText("[GAMBAR '$label' TIDAK DITEMUKAN DI DOKUMEN SUMBER]", ['name' => 'Calibri', 'size' => 10, 'italic' => true, 'color' => 'AA0000'], ['alignment' => Jc::CENTER]);
        $this->caption($s, $caption);
    }

    private function cover(Section $s, array $d): void
    {
        $s->addText('PROPOSAL TEKNIS', ['name' => 'Calibri', 'size' => 20, 'bold' => true, 'color' => self::NAVY], ['alignment' => Jc::CENTER, 'spaceAfter' => 160]);
        $s->addText('PERMOHONAN PERSETUJUAN KESESUAIAN KEGIATAN' . PHP_EOL . 'PEMANFAATAN RUANG LAUT (PKKPRL)', ['name' => 'Calibri', 'size' => 14, 'bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 240]);
        $s->addText('Disusun mengacu pada Peraturan Menteri Kelautan dan Perikanan Nomor 28 Tahun 2021 tentang Penyelenggaraan Penataan Ruang Laut', ['name' => 'Calibri', 'size' => 10, 'italic' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 400]);
        $this->keyValueTable($s, [
            ['Nama Pemohon', $this->v($d, 'applicantName', $this->v($d, 'Nama Pemohon'))],
            ['Jabatan Pemohon', $this->v($d, 'position', $this->v($d, 'Jabatan Pemohon'))],
            ['Nama Perusahaan/Instansi', $this->company($d)],
            ['NIB', $this->v($d, 'nib', $this->v($d, 'NIB'))],
            ['NPWP', $this->v($d, 'npwp', $this->v($d, 'NPWP'))],
            ['Nomor Telepon Selular', $this->v($d, 'phone', $this->v($d, 'telp', $this->v($d, 'Nomor Telepon Selular')))],
            ['Surat Elektronik', $this->v($d, 'email', $this->v($d, 'email', $this->v($d, 'Surat Elektronik')))],
            ['Jenis Kegiatan', $this->activity($d)],
            ['Lokasi Kegiatan', $this->location($d)],
            ['Nama Perairan', $this->v($d, 'waterName', $this->v($d, 'nama_perairan', $this->v($d, 'Nama Perairan')))],
            ['Luas Kebutuhan Ruang', $this->area($d)],
            ['KBLI', $this->v($d, 'kbli', $this->v($d, 'KBLI'))],
            ['Tanggal Penyusunan', $this->v($d, 'date', $this->v($d, 'tanggal_penyusunan', now()->translatedFormat('j F Y')))],
        ]);
    }

    private function chapterOne(Section $s, array $d): void
    {
        $c    = $this->company($d);
        $a    = $this->activity($d);
        $loc  = $this->location($d);
        $area = $this->area($d);
        $app  = $this->v($d, 'applicantName', $this->v($d, 'Nama Pemohon'));
        $this->heading($s, 'I. RENCANA BANGUNAN DAN INSTALASI LAUT', 1);
        $this->heading($s, 'Pendahuluan', 2);
        $this->text($s, 'Proposal teknis ini disusun sebagai bagian dari persyaratan permohonan Persetujuan Kesesuaian Kegiatan Pemanfaatan Ruang Laut (PKKPRL), sebagaimana diatur dalam Peraturan Pemerintah Nomor 21 Tahun 2021 tentang Penyelenggaraan Penataan Ruang, Peraturan Menteri Kelautan dan Perikanan Nomor 28 Tahun 2021 tentang Penyelenggaraan Penataan Ruang Laut, serta ketentuan pelaksanaan pada sistem OSS Berbasis Risiko.');
        $this->text($s, "$c yang diwakili oleh $app berencana menyelenggarakan kegiatan berusaha berupa $a. Rencana kegiatan ini berlokasi di $loc dengan total kebutuhan luas ruang laut yang dimohonkan sebesar $area.");
        $this->heading($s, 'A. Rencana Kegiatan Utama dan Penunjang', 2);
        $this->heading($s, '1. Uraian Kegiatan', 3);
        $this->text($s, "Kegiatan yang dimohonkan adalah $a, dengan kebutuhan ruang laut seluas $area. Rencana kegiatan disusun dengan memperhatikan keselamatan pelayaran, keberlanjutan ekosistem, dan kepentingan masyarakat pesisir.");
        $this->text($s, 'Rencana tenaga kerja, sarana-prasarana, dan pembiayaan kegiatan akan dilaksanakan sesuai ketentuan perizinan berusaha berbasis risiko serta hasil verifikasi teknis instansi berwenang.');
        $this->heading($s, '2. Kegiatan Eksisting atau Rencana yang Akan Dimohonkan', 3);
        $this->text($s, "Kegiatan rencana yang dimohonkan adalah $a yang berada di $loc. Pengajuan PKKPRL dilakukan dalam rangka pemenuhan perizinan dasar sebelum mengajukan perizinan lanjutan.");
        $this->missingImage($s, 'siteplan', "Gambar 1. Peta Rencana Tapak (Site Plan) Kegiatan $c.");
        $this->heading($s, '3. Rencana Jadwal Pelaksanaan Kegiatan Utama dan Pendukungnya', 3);
        $this->text($s, $this->v($d, 'schedule', $this->v($d, 'jadwal_konstruksi')));
        $this->heading($s, '4. Reklamasi / Non-Reklamasi', 3);
        $isReklamasi = in_array(strtolower($this->v($d, 'ada_reklamasi', 'tidak')), ['ya', 'ada', 'true', '1', 'yes']);
        $this->text($s, "Kegiatan $a yang dilakukan oleh $c merupakan kegiatan yang dilaksanakan " . ($isReklamasi ? "dengan reklamasi." : "tanpa reklamasi."));
        $this->heading($s, 'B. Kegiatan Berusaha atau Non-Berusaha', 2);
        $this->text($s, "Kegiatan $a yang dilakukan $c di $loc merupakan kegiatan berusaha.");
        $this->heading($s, 'C. Kegiatan Strategis Nasional atau Nonstrategis Nasional', 2);
        $this->text($s, 'Rencana kegiatan pemanfaatan ruang laut ini tergolong sebagai kegiatan non-strategis nasional/dasar. Penetapan status ini digunakan sebagai acuan untuk memenuhi persyaratan teknis permohonan PKKPRL.');
        $this->heading($s, 'D. Peta Lokasi', 2);
        $this->text($s, 'Peta lokasi/plotting batas-batas area yang dimohonkan PKKPRL ditunjukkan oleh titik koordinat berikut:');
        $coords = $d['coordinates'] ?? [];
        if (is_string($coords)) {
            $coords = json_decode($coords, true) ?? [];
        }
        $formattedCoords = array_map(function ($r, $index) {
            if (is_array($r)) {
                return [(string) ($r['no'] ?? $index + 1), (string) ($r['longitude'] ?? $r['lng'] ?? ''), (string) ($r['latitude'] ?? $r['lat'] ?? '')];
            }
            return [(string) ($index + 1), '', ''];
        }, $coords, array_keys($coords));
        $this->dataTable($s, ['Nomor Titik', 'Longitude', 'Latitude'], $formattedCoords);
        $this->caption($s, 'Tabel 1. Titik Koordinat Batas Area Permohonan PKKPRL.');
        $this->missingImage($s, 'peta_lokasi', 'Gambar 2. Peta Lokasi dan Sebaran Titik Koordinat Rencana Kegiatan.');
        $this->heading($s, 'E. Deskripsi Luas/Panjang yang Dibutuhkan', 2);
        $this->text($s, "Luas perairan yang dimohonkan KKPRL adalah seluas $area yang terletak di $loc.");
    }

    private function chapterTwo(Section $s, array $d): void
    {
        $this->heading($s, 'II. INFORMASI PEMANFAATAN RUANG LAUT', 1);
        $this->text($s, "Berdasarkan hasil identifikasi, pemanfaatan ruang laut eksisting di sekitar lokasi kegiatan {$this->activity($d)} dari {$this->company($d)} berada di {$this->location($d)}.");
        $this->text($s, 'Berdasarkan hasil survei/pengamatan langsung, tidak terdapat pemanfaatan ruang laut oleh pihak lain di sekitar lokasi permohonan. Rencana kegiatan disusun dengan memperhatikan kepentingan nelayan tradisional dan masyarakat, serta tidak menghalangi akses pelayaran yang sudah ada.');
        $this->missingImage($s, 'foto_pantai', 'Gambar 3. Kondisi Eksisting Perairan dan Garis Pantai di Sekitar Lokasi Permohonan.');
    }

    private function chapterThree(Section $s, array $d): void
    {
        $this->heading($s, 'III. DATA KONDISI TERKINI LOKASI DAN SEKITARNYA', 1);
        $this->heading($s, 'A. Ekosistem Sekitar', 2);
        $this->heading($s, '1. Mangrove', 3);
        $this->text($s, 'Berdasarkan hasil pengamatan langsung kondisi pesisir di sekitar lokasi kegiatan, data ekosistem mangrove perlu diverifikasi melalui survei lapangan dan dokumen pendukung pemohon.');
        $this->missingImage($s, 'foto_mangrove', 'Gambar 4. Kondisi Tutupan Vegetasi Mangrove di Sekitar Lokasi Kegiatan.');
        $this->heading($s, '2. Lamun', 3);
        $this->text($s, 'Berdasarkan data sekunder perairan di sekitar lokasi kegiatan, keberadaan ekosistem lamun perlu dipastikan dengan pengamatan lapangan lanjutan.');
        $this->heading($s, '3. Terumbu Karang', 3);
        $this->text($s, 'Hasil survei in-situ dan analisis spasial menjadi dasar identifikasi kondisi terumbu karang pada area kajian.');
        $this->dataTable($s, ['Jenis Tutupan', 'Luas (Ha)', 'Persentase (%)'], [
            ['Terumbu Karang', self::MISSING, self::MISSING],
            ['Lainnya (substrat dasar non-terumbu)', self::MISSING, self::MISSING],
            ['Area Laut Terbuka (tanpa ekosistem)', self::MISSING, self::MISSING],
            ['Total Area Kajian', self::MISSING, '100,0'],
        ]);
        $this->caption($s, 'Tabel 2. Rincian Tutupan Ekosistem pada Area Kajian Spasial di Sekitar Titik Pusat Rencana Kegiatan.');
        $this->missingImage($s, 'foto_karang_insitu', 'Gambar 5. Dokumentasi Survei In-Situ Koloni Terumbu Karang di Perairan Sekitar Lokasi Kegiatan.');
        $this->missingImage($s, 'peta_ekosistem', 'Gambar 6. Peta Sebaran Spasial Ekosistem Pesisir di Sekitar Titik Pusat Rencana Kegiatan.');
        $this->heading($s, 'B. Hidro-Oseanografi', 2);
        $this->heading($s, '1. Gelombang', 3);
        $this->text($s, 'Tinggi gelombang signifikan, arah dominan, dan kondisi ekstrem perlu dilengkapi dari laporan hidro-oseanografi. Parameter ini menjadi acuan utama dalam desain ketahanan struktur bangunan laut terhadap beban gelombang ekstrem.');
        $this->heading($s, '2. Arus', 3);
        $this->text($s, 'Kecepatan arus rata-rata, kecepatan maksimum, dan arah dominan menjadi indikator potensi gerusan di sekitar struktur bangunan laut.');
        $this->dataTable($s, ['Parameter', 'Nilai Rata-rata', 'Nilai Ekstrem', 'Arah Dominan'], [
            ['Tinggi Gelombang Signifikan (Hs)', self::MISSING, self::MISSING, self::MISSING],
            ['Kecepatan Arus', self::MISSING, self::MISSING, self::MISSING],
        ]);
        $this->caption($s, 'Tabel 3. Ringkasan Parameter Gelombang dan Arus pada Titik Pusat Rencana Kegiatan.');
        $this->heading($s, '3. Pasang Surut', 3);
        $this->dataTable($s, ['Parameter Pasang Surut', 'Elevasi'], [
            ['Highest Astronomical Tide (HAT)', self::MISSING],
            ['Mean Sea Level (MSL)', self::MISSING],
            ['Lowest Astronomical Tide (LAT)', self::MISSING],
            ['Tidal Range', self::MISSING],
        ]);
        $this->caption($s, 'Tabel 4. Parameter Pasang Surut pada Lokasi Kegiatan.');
        $this->heading($s, 'C. Profil Dasar Laut', 2);
        $this->text($s, 'Kedalaman dan profil batimetri pada titik pusat lokasi kegiatan perlu dilengkapi dari hasil pemeruman yang tervalidasi.');
        $this->heading($s, 'D. Kondisi Sosial Ekonomi Masyarakat', 2);
        $this->text($s, 'Kehadiran rencana kegiatan diharapkan dapat mendukung struktur sosial-ekonomi kawasan secara harmonis dan melibatkan konsultasi publik dengan kelompok nelayan setempat sebelum pelaksanaan konstruksi.');
        $this->heading($s, 'E. Aksesibilitas Lokasi dan Sekitarnya', 2);
        $this->text($s, "Aksesibilitas menuju lokasi kegiatan di {$this->location($d)} dapat ditempuh melalui jalur darat maupun laut.");
    }

    private function chapterFour(Section $s, array $d): void
    {
        $this->heading($s, 'IV. DOKUMEN PERSYARATAN LAINNYA', 1);
        $this->text($s, "Dokumen pendukung untuk permohonan PKKPRL yang diajukan oleh {$this->company($d)} meliputi:");
        foreach ([
            'Sertifikat Kepemilikan Lahan Darat.',
            'Dokumen identitas dan legalitas pemohon/perusahaan.',
            'Dokumentasi survei lapangan kondisi eksisting lokasi.',
            'Peta pendukung (peta lokasi, peta site plan, dan peta pola ruang wilayah).',
        ] as $item) {
            $s->addListItem($item, 0, ['name' => 'Calibri', 'size' => 11]);
        }
        $this->text($s, "Demikian proposal teknis ini disusun sebagai bagian dari kelengkapan administrasi dan teknis permohonan PKKPRL atas nama {$this->company($d)}.", true);
        $this->text($s, 'Catatan: Dokumen ini dibangkitkan otomatis oleh aplikasi e-GeRAI. Mohon verifikasi kembali seluruh data dan gambar sebelum digunakan untuk pengajuan resmi.', true);
    }

    private function keyValueTable(Section $s, array $rows): void
    {
        $table = $s->addTable(['borderSize' => 6, 'borderColor' => '666666', 'cellMarginTop' => 80, 'cellMarginBottom' => 80, 'cellMarginLeft' => 120, 'cellMarginRight' => 120, 'alignment' => JcTable::CENTER]);
        foreach ($rows as [$key, $value]) {
            $table->addRow();
            $left = $table->addCell(3600, ['bgColor' => self::LIGHT_BLUE, 'valign' => VerticalJc::CENTER]);
            $left->addText($key, ['name' => 'Calibri', 'size' => 10.5, 'bold' => true]);
            $right = $table->addCell(5760, ['valign' => VerticalJc::CENTER]);
            $right->addText($value, ['name' => 'Calibri', 'size' => 10.5]);
        }
    }

    private function dataTable(Section $s, array $headers, array $rows): void
    {
        $table = $s->addTable(['borderSize' => 6, 'borderColor' => '666666', 'cellMarginTop' => 80, 'cellMarginBottom' => 80, 'cellMarginLeft' => 100, 'cellMarginRight' => 100, 'alignment' => JcTable::CENTER]);
        $table->addRow();
        foreach ($headers as $header) {
            $cell = $table->addCell(null, ['bgColor' => self::NAVY, 'valign' => VerticalJc::CENTER]);
            $cell->addText($header, ['name' => 'Calibri', 'size' => 10, 'bold' => true, 'color' => 'FFFFFF'], ['alignment' => Jc::CENTER]);
        }
        foreach ($rows as $row) {
            $table->addRow();
            foreach ($row as $i => $value) {
                $cell = $table->addCell(null, ['valign' => VerticalJc::CENTER]);
                $cell->addText($value, ['name' => 'Calibri', 'size' => 10], ['alignment' => $i ? Jc::CENTER : Jc::START]);
            }
        }
    }
}
