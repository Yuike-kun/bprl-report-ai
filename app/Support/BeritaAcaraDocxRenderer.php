<?php

namespace App\Support;

use App\Models\BeritaAcaraKonsultasi;
use App\Models\District;
use App\Models\Province;
use App\Models\Regency;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\Element\AbstractContainer;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Shared\Html;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\SimpleType\TblWidth;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BeritaAcaraDocxRenderer
{
    private const CONTENT_WIDTH = 9026;

    private const BLUE = '0B3EA6';

    private const NO_BORDERS = [
        'borderTopStyle' => 'none',
        'borderLeftStyle' => 'none',
        'borderRightStyle' => 'none',
        'borderBottomStyle' => 'none',
        'borderInsideHStyle' => 'none',
        'borderInsideVStyle' => 'none',
    ];

    /** @var array<int, string> */
    private array $tempFiles = [];

    public static function render(BeritaAcaraKonsultasi $beritaAcara): BinaryFileResponse
    {
        // PhpWord 1.4 emits "null as array offset" deprecations on PHP 8.5.
        $previous = error_reporting(error_reporting() & ~E_DEPRECATED);

        try {
            return (new self)->build($beritaAcara);
        } finally {
            error_reporting($previous);
        }
    }

    private function build(BeritaAcaraKonsultasi $ba): BinaryFileResponse
    {
        $ba->load([
            'staff.user',
            'staff1.user',
            'staff2.user',
            'staff3.user',
            'staff4.user',
            'documents',
            'request_form',
            'permohonanKonsultasi',
        ]);

        $phpWord = new PhpWord;
        $phpWord->setDefaultFontName('Arial');
        $phpWord->setDefaultFontSize(11);
        $phpWord->setDefaultParagraphStyle([
            'spaceBefore' => 0,
            'spaceAfter' => 60,
            'lineHeight' => 1.1,
        ]);

        $section = $phpWord->addSection([
            'pageSizeW' => 11906,
            'pageSizeH' => 16838,
            'marginLeft' => 1440,
            'marginRight' => 1440,
            'marginTop' => 1440,
            'marginBottom' => 1440,
        ]);

        $isAsistensi = $ba->consultation_stage === 'asistensi';
        $docsByType = $ba->documents->groupBy('document_type');

        $this->kopSurat($section);
        $this->heading($section, $ba);
        $this->intro($section, $ba);

        $allStaff = $ba->staff
            ->merge(collect([$ba->staff1, $ba->staff2, $ba->staff3, $ba->staff4])->filter())
            ->unique('id')
            ->values();

        $this->attendees($section, $ba, $allStaff);

        $this->p($section, 'Berdasarkan hasil pelaksanaan pendampingan permohonan, diperoleh hasil sebagai berikut:', ['spaceAfter' => 80]);

        if ($isAsistensi) {
            $this->asistensiBody($section, $ba);
        } else {
            $this->konsultasiBody($section, $ba);
        }

        $this->p($section, 'Demikian berita acara ini dibuat dengan sebenar-benarnya, untuk dapat dipergunakan sebagaimana mestinya.', [
            'alignment' => Jc::BOTH,
            'spaceBefore' => 160,
            'spaceAfter' => 120,
            'keepNext' => true,
        ]);

        $this->signatures($section, $ba, $allStaff, $docsByType);
        $this->lampiran($section, $ba, $docsByType, $isAsistensi);

        $requesterName = $ba->request_form->nama_pemohon ?? ($ba->requester_name ?? 'pemohon');
        $timeFile = $ba->created_at?->format('YmdHis') ?? now()->format('YmdHis');
        $filename = 'Berita Acara - '.$this->safeFilename($requesterName)." - {$timeFile}.docx";

        $tempFile = tempnam(sys_get_temp_dir(), 'berita_acara_');
        IOFactory::createWriter($phpWord, 'Word2007')->save($tempFile);

        foreach ($this->tempFiles as $file) {
            @unlink($file);
        }

        return response()->download($tempFile, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ])->deleteFileAfterSend(true);
    }

    // ── Kop & heading ────────────────────────────────────────────────

    private function kopSurat($section): void
    {
        $table = $section->addTable(self::NO_BORDERS + ['cellMargin' => 0, 'width' => self::CONTENT_WIDTH, 'unit' => TblWidth::TWIP, 'layout' => 'fixed']);
        $table->addRow();

        $logoCell = $table->addCell(1300, ['valign' => 'center']);
        $logo = public_path('logo_klp.png');
        if (is_file($logo)) {
            $this->scaledImage($logoCell, $logo, 71, 71, ['alignment' => Jc::LEFT]);
        }

        $textCell = $table->addCell(6426, ['valign' => 'center']);
        $center = ['alignment' => Jc::CENTER, 'spaceAfter' => 0, 'lineHeight' => 1.0];
        $textCell->addText('KEMENTERIAN KELAUTAN DAN PERIKANAN', ['bold' => true, 'size' => 12, 'color' => self::BLUE], $center);
        $textCell->addText('DIREKTORAT JENDERAL PENATAAN RUANG LAUT', ['size' => 12.5, 'color' => self::BLUE], $center);
        $textCell->addText('BALAI PENATAAN RUANG LAUT MAKASSAR', ['bold' => true, 'size' => 12, 'color' => self::BLUE], array_merge($center, ['spaceAfter' => 40]));
        $textCell->addText('JALAN MAKMUR DAENG SITAKKA NOMOR 129 MAROS 90511, TELEPON (0411) 371337 FAKSIMILI (0411) 371337', ['size' => 7.5], $center);

        $run = $textCell->addTextRun($center);
        $run->addText('LAMAN ', ['size' => 7.5]);
        $run->addText('WWW.KKP.GO.ID', ['size' => 7.5, 'color' => self::BLUE, 'underline' => 'single']);
        $run->addText(' SUREL ', ['size' => 7.5]);
        $run->addText('BPRLMAKASSAR@KKP.GO.ID', ['size' => 7.5, 'color' => self::BLUE, 'underline' => 'single']);

        $table->addCell(1300);

        $section->addText('', ['size' => 2], [
            'spaceBefore' => 60,
            'spaceAfter' => 0,
            'lineHeight' => 1.0,
            'borderBottomSize' => 18,
            'borderBottomColor' => '000000',
        ]);
        $section->addText('', ['size' => 2], [
            'spaceAfter' => 160,
            'lineHeight' => 1.0,
            'borderBottomSize' => 6,
            'borderBottomColor' => '000000',
        ]);
    }

    private function heading($section, BeritaAcaraKonsultasi $ba): void
    {
        $center = ['alignment' => Jc::CENTER, 'spaceAfter' => 40];

        $section->addText('BERITA ACARA PENDAMPINGAN PERMOHONAN', ['bold' => true, 'size' => 11.5], $center);
        $section->addText((string) $ba->berita_acara_number, ['size' => 11], $center);

        $run = $section->addTextRun(array_merge($center, ['spaceAfter' => 200]));
        $run->addText((string) $ba->legal_entity_name, ['bold' => true, 'size' => 11]);
        $run->addText(' di '.$this->provinceName($ba), ['size' => 11]);
    }

    private function intro($section, BeritaAcaraKonsultasi $ba): void
    {
        $tanggal = Carbon::parse($ba->consultation_date)->locale('id');

        $permitTypeLabel = [
            'persetujuan' => 'Persetujuan KKPRL',
            'konfirmasi' => 'Konfirmasi KKPRL',
        ][$ba->permit_type] ?? $ba->permit_type;

        $modeLabel = [
            'daring' => 'Daring (Online)',
            'luring' => 'Luring (Tatap Muka)',
            'hybrid' => 'Hybrid',
        ][$ba->implementation_mode] ?? $ba->implementation_mode;

        $run = $section->addTextRun(['alignment' => Jc::BOTH, 'spaceAfter' => 80]);
        $this->runs($run, [
            'Pada hari ini ', ['b', $tanggal->translatedFormat('l')],
            ' tanggal ', ['b', $tanggal->format('d')],
            ' Bulan ', ['b', $tanggal->translatedFormat('F')],
            ' Tahun ', ['b', $tanggal->format('Y')],
            ', kami yang bertanda tangan di bawah ini telah melaksanakan Pendampingan Permohonan atas rencana permohonan ',
            ['b', $permitTypeLabel],
            ' untuk permohonan ', ['b', $this->activityDetail($ba)],
            ' dengan KBLI '.($ba->kbli ?: '-').' oleh ',
            ['b', (string) $ba->legal_entity_name],
            ' di Kecamatan '.$this->districtName($ba).', '.$this->regencyLabel($ba).', Provinsi '.$this->provinceName($ba),
            ' yang dilaksanakan secara ', ['i', $modeLabel],
            ' di '.$this->location($ba).' dan dihadiri oleh:',
        ]);
    }

    private function attendees($section, BeritaAcaraKonsultasi $ba, $allStaff): void
    {
        $style = ['indentation' => ['left' => 567, 'hanging' => 283], 'spaceAfter' => 20];
        $i = 1;

        if ($allStaff->isEmpty()) {
            $this->p($section, ($i++).'.  Petugas Pendamping (Petugas Pendamping)', $style);
        }

        foreach ($allStaff as $staff) {
            $name = $staff->user->name ?? 'Petugas Pendamping';
            $position = $staff->position ?? 'Petugas Pendamping';
            $this->p($section, ($i++).".  {$name} ({$position})", $style);
        }

        $this->p($section, ($i++).".  {$ba->requester_name} ({$ba->requester_position})", array_merge($style, ['spaceAfter' => 120]));
    }

    // ── Body ─────────────────────────────────────────────────────────

    private function asistensiBody($section, BeritaAcaraKonsultasi $ba): void
    {
        $this->sectionTitle($section, '1. Deskripsi rencana kegiatan untuk permohonan');
        $this->labelLine($section, 'Subjek Hukum', (string) $ba->legal_entity_name);
        $this->labelLine($section, 'Rencana Kegiatan', $this->activityDetail($ba));
        $this->labelLine($section, 'Luas/Panjang', trim($ba->planned_area.' '.$ba->planned_area_unit));
        $this->htmlField($section, $ba->activity_description);

        $this->sectionTitle($section, '2. Lokasi yang akan dimohonkan');
        $this->p($section, 'Adapun rencana lokasi kegiatan '.$this->activityDetail($ba).' yang akan dilakukan oleh '
            .$ba->legal_entity_name.' terletak di perairan '.$this->waterName($ba).' di Kecamatan '.$this->districtName($ba)
            .', '.$this->regencyLabel($ba).', Provinsi '.$this->provinceName($ba).' dengan titik koordinat sebagai berikut:', [
                'alignment' => Jc::BOTH,
            ]);
        $this->coordinates($section, $ba);

        $this->sectionTitle($section, '3. Informasi Pemanfaatan Ruang Laut Sekitar');
        $this->htmlField($section, $ba->surrounding_utilization);

        $this->sectionTitle($section, '4. Data Kondisi Terkini Lokasi dan Sekitar');
        $this->htmlField($section, $ba->environmental_condition);

        $ownedDocs = collect($ba->owned_documents ?? [])
            ->map(fn ($d) => $d === 'Yang lain' ? $ba->owned_documents_other : $d)
            ->filter()
            ->implode(', ');
        $this->sectionTitle($section, '5. Perizinan yang telah dimiliki oleh calon pemohon');
        $this->p($section, $ownedDocs !== '' ? $ownedDocs : '-', ['alignment' => Jc::BOTH]);

        $this->sectionTitle($section, '6. Informasi Hal lainnya yang diperlukan');
        $this->htmlField($section, $ba->other_information);

        $this->p($section, 'Hasil Konsultasi', ['spaceBefore' => 120, 'spaceAfter' => 60], ['bold' => true]);

        $table = $section->addTable(['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 80, 'width' => 5000, 'unit' => TblWidth::PERCENT]);
        $table->addRow();
        foreach ([
            'dokumen_sesuai' => 'Dokumen Sudah Sesuai',
            'perlu_perbaikan' => 'Dokumen Perlu Perbaikan',
        ] as $value => $label) {
            $active = $ba->consultation_result === $value;
            $cell = $table->addCell(self::CONTENT_WIDTH / 2, $active ? ['bgColor' => 'EAF2FD'] : []);
            $run = $cell->addTextRun(['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $run->addText($active ? "\u{2612}  " : "\u{2610}  ", ['name' => 'Segoe UI Symbol', 'size' => 12]);
            $run->addText($label, ['bold' => true, 'size' => 10.5, 'color' => $active ? '0D47A1' : '000000']);
        }
        $section->addTextBreak(0, ['size' => 4]);
    }

    private function konsultasiBody($section, BeritaAcaraKonsultasi $ba): void
    {
        $this->sectionTitle($section, '1. Lokasi yang akan dimohonkan');
        $this->p($section, 'Adapun rencana lokasi kegiatan '.$this->activityDetail($ba).' yang akan dilakukan oleh '
            .$ba->legal_entity_name.' terletak di perairan '.$this->waterName($ba).' di Kecamatan '.$this->districtName($ba)
            .', '.$this->regencyLabel($ba).', Provinsi '.$this->provinceName($ba).'.', ['alignment' => Jc::BOTH]);

        $this->sectionTitle($section, '2. Catatan Hasil Konsultasi/Koordinasi');
        $this->htmlField($section, $ba->consultation_notes);
    }

    private function coordinates($section, BeritaAcaraKonsultasi $ba): void
    {
        $raw = trim((string) $ba->coordinate_points);

        $rows = collect(CoordinatePoints::parse($raw));

        if ($rows->isEmpty()) {
            $this->p($section, $raw !== '' ? $raw : '-', ['alignment' => Jc::LEFT]);

            return;
        }

        $table = $section->addTable(['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 50, 'width' => 5000, 'unit' => TblWidth::PERCENT]);
        $center = ['alignment' => Jc::CENTER, 'spaceAfter' => 0];

        $table->addRow();
        $table->addCell(1100, ['bgColor' => 'F0F0F0'])->addText('No', ['bold' => true, 'size' => 10.5], $center);
        $table->addCell(3963, ['bgColor' => 'F0F0F0'])->addText('Bujur (Longitude)', ['bold' => true, 'size' => 10.5], $center);
        $table->addCell(3963, ['bgColor' => 'F0F0F0'])->addText('Lintang (Latitude)', ['bold' => true, 'size' => 10.5], $center);

        foreach ($rows as $row) {
            $table->addRow();
            $table->addCell(1100)->addText($row['no'], ['size' => 10.5], $center);
            $table->addCell(3963)->addText($row['lon'], ['size' => 10.5], $center);
            $table->addCell(3963)->addText($row['lat'], ['size' => 10.5], $center);
        }

        $section->addTextBreak(0, ['size' => 4]);
    }

    private function signatures($section, BeritaAcaraKonsultasi $ba, $allStaff, $docsByType): void
    {
        $table = $section->addTable(['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 60, 'width' => 5000, 'unit' => TblWidth::PERCENT]);
        $table->setWidth(self::CONTENT_WIDTH);
        $center = ['alignment' => Jc::CENTER, 'spaceAfter' => 0];

        $table->addRow(null, ['cantSplit' => true]);
        foreach ([[600, 'No'], [2900, 'Nama'], [2926, 'Jabatan/Instansi'], [2600, 'Tanda Tangan']] as [$w, $label]) {
            $table->addCell($w, ['bgColor' => 'F7F7F7', 'valign' => 'center'])->addText($label, ['bold' => true, 'size' => 10], $center + ['keepNext' => true]);
        }

        $no = 1;
        foreach ($allStaff as $staff) {
            $this->signatureRow(
                $table,
                $no++,
                $staff->user->name ?? '-',
                $staff->position ?? 'Petugas Pendamping',
                $this->signatureFile($staff->user?->signature ?? null),
                true,
            );
        }

        $sigDoc = optional($docsByType->get('tanda_tangan_perwakilan'))->first();
        $requesterSig = null;
        if ($sigDoc && Storage::disk('public')->exists($sigDoc->file_path)) {
            $requesterSig = Storage::disk('public')->path($sigDoc->file_path);
        }
        $requesterSig ??= $this->signatureFile($ba->permohonanKonsultasi?->tanda_tangan);

        $this->signatureRow($table, $no, (string) $ba->requester_name, (string) $ba->requester_position, $requesterSig);
    }

    private function signatureRow($table, int $no, string $name, string $position, ?string $imagePath, bool $keepNext = false): void
    {
        $center = ['alignment' => Jc::CENTER, 'spaceAfter' => 0, 'keepNext' => $keepNext];
        $left = ['spaceAfter' => 0, 'keepNext' => $keepNext];

        $table->addRow(850, ['cantSplit' => true]);
        $table->addCell(600, ['valign' => 'center'])->addText((string) $no, ['size' => 10], $center);
        $table->addCell(2900, ['valign' => 'center'])->addText($name, ['size' => 10], $left);
        $table->addCell(2926, ['valign' => 'center'])->addText($position, ['size' => 10], $left);

        $cell = $table->addCell(2600, ['valign' => 'center']);
        if ($imagePath) {
            $this->scaledImage($cell, $imagePath, 100, 36, ['alignment' => Jc::CENTER]);
        } else {
            $cell->addText('', ['size' => 10], $center);
        }
    }

    // ── Lampiran ─────────────────────────────────────────────────────

    private function lampiran($section, BeritaAcaraKonsultasi $ba, $docsByType, bool $isAsistensi): void
    {
        $tanggal = Carbon::parse($ba->consultation_date)->locale('id');
        $right = ['alignment' => Jc::RIGHT, 'spaceAfter' => 0, 'keepNext' => true];
        $section->addText('Lampiran Berita Acara', ['size' => 10.5], array_merge($right, ['pageBreakBefore' => true]));
        $section->addText('Nomor : '.$ba->berita_acara_number, ['size' => 10.5], $right);
        $section->addText('Tanggal : '.$tanggal->translatedFormat('d F Y'), ['size' => 10.5], array_merge($right, ['spaceAfter' => 160, 'keepNext' => false]));

        $this->lampiranTitle($section, 'Lampiran I: Dokumentasi');
        $dokumentasi = $docsByType->get('dokumentasi_konsultasi', collect());
        if ($dokumentasi->isEmpty()) {
            $this->p($section, '-', [], ['size' => 9]);
        } else {
            $table = $section->addTable(self::NO_BORDERS + ['cellMargin' => 60, 'width' => self::CONTENT_WIDTH, 'unit' => TblWidth::TWIP, 'layout' => 'fixed']);
            foreach ($dokumentasi->chunk(2) as $pair) {
                $table->addRow();
                foreach ($pair->values() as $doc) {
                    $cell = $table->addCell(self::CONTENT_WIDTH / 2, ['valign' => 'center']);
                    $this->documentInto($cell, $doc, 205, 170);
                }
                if ($pair->count() === 1) {
                    $table->addCell(self::CONTENT_WIDTH / 2);
                }
            }
        }

        $this->lampiranTitle($section, 'Lampiran II: Peta '.($isAsistensi ? 'Hasil Plotting' : 'Plotting'));
        $this->documentList($section, $docsByType->get('peta_hasil_plotting', collect()));

        $this->lampiranTitle($section, 'Lampiran III: '.($isAsistensi ? 'Absensi' : 'Absen'));
        $this->documentList($section, $docsByType->get('absensi_pendampingan', collect()));

        if (! $isAsistensi) {
            return;
        }

        $this->lampiranTitle($section, 'Lampiran IV: Dokumen Konsultasi');
        foreach ([
            'rencana_bangunan_instalasi' => 'Dokumen Rencana Bangunan dan Instalasi di Laut',
            'informasi_pemanfaatan_ruang_laut' => 'Dokumen Informasi Pemanfaatan Ruang Laut',
            'data_kondisi_terkini' => 'Dokumen Data Kondisi Terkini Lokasi dan Sekitar',
            'persyaratan_lainnya' => 'Dokumen Persyaratan Lainnya',
            'titik_koordinat' => 'Dokumen Titik Koordinat Lokasi',
        ] as $type => $label) {
            $files = $docsByType->get($type, collect())->pluck('file_name')->implode(', ');
            $run = $section->addTextRun(['spaceAfter' => 40]);
            $run->addText($label.': ', ['bold' => true, 'size' => 9]);
            $run->addText($files !== '' ? $files : '-', ['size' => 9]);
        }
    }

    private function documentList($section, $docs): void
    {
        if ($docs->isEmpty()) {
            $this->p($section, '-', [], ['size' => 9]);

            return;
        }

        foreach ($docs as $doc) {
            $this->documentInto($section, $doc, 440, 280);
        }
    }

    private function documentInto(AbstractContainer $container, $doc, int $maxW, int $maxH): void
    {
        $path = $doc->file_path && Storage::disk('public')->exists($doc->file_path)
            ? Storage::disk('public')->path($doc->file_path)
            : null;

        $isImage = $path && in_array(strtolower(pathinfo($path, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'gif'], true);

        if ($isImage && $this->scaledImage($container, $path, $maxW, $maxH, ['alignment' => Jc::CENTER])) {
            return;
        }

        $container->addText((string) $doc->file_name, ['size' => 9], ['spaceAfter' => 40]);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private function p($container, string $text, array $paragraph = [], array $font = []): void
    {
        $container->addText($text, $font + ['size' => 11], $paragraph);
    }

    private function sectionTitle($section, string $text): void
    {
        $section->addText($text, ['bold' => true, 'size' => 11], ['spaceBefore' => 100, 'spaceAfter' => 40, 'keepNext' => true]);
    }

    private function lampiranTitle($section, string $text): void
    {
        $section->addText($text, ['bold' => true, 'size' => 10], [
            'spaceBefore' => 200,
            'spaceAfter' => 80,
            'keepNext' => true,
            'borderBottomSize' => 6,
            'borderBottomColor' => 'CCCCCC',
        ]);
    }

    private function labelLine($section, string $label, string $value): void
    {
        $run = $section->addTextRun(['spaceAfter' => 20]);
        $run->addText($label, ['bold' => true, 'size' => 10.5]);
        $run->addText(' : '.$value, ['size' => 10.5]);
    }

    /**
     * @param  array<int, string|array{0: string, 1: string}>  $parts
     */
    private function runs($run, array $parts): void
    {
        foreach ($parts as $part) {
            if (is_string($part)) {
                $run->addText($part, ['size' => 11]);

                continue;
            }

            $run->addText($part[1], [
                'size' => 11,
                'bold' => $part[0] === 'b',
                'italic' => $part[0] === 'i',
            ]);
        }
    }

    private function htmlField($section, ?string $value): void
    {
        $html = BeritaAcaraHtml::render($value);

        if ($html === '-') {
            $this->p($section, '-', ['alignment' => Jc::BOTH], ['size' => 10.5]);

            return;
        }

        try {
            Html::addHtml($section, $this->toXhtml($html), false, false);
        } catch (\Throwable) {
            $plain = trim(html_entity_decode(strip_tags(str_ireplace(['<br>', '<br/>', '</p>', '</li>'], "\n", $html))));
            foreach (preg_split('/\n+/', $plain) as $line) {
                $this->p($section, trim($line), ['alignment' => Jc::BOTH], ['size' => 10.5]);
            }
        }
    }

    private function toXhtml(string $html): string
    {
        $dom = new \DOMDocument('1.0', 'UTF-8');
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="utf-8" ?><body>'.$html.'</body>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $body = $dom->getElementsByTagName('body')->item(0);
        $out = '';
        foreach ($body?->childNodes ?? [] as $child) {
            $out .= $dom->saveXML($child);
        }

        return $out;
    }

    private function scaledImage($container, string $path, int $maxW, int $maxH, array $style = []): bool
    {
        $size = @getimagesize($path);
        if (! $size || ! in_array($size[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_GIF], true)) {
            return false;
        }

        [$w, $h] = $size;
        $scale = min($maxW / $w, $maxH / $h, 1);

        $container->addImage($path, $style + [
            'width' => max(1, (int) round($w * $scale)),
            'height' => max(1, (int) round($h * $scale)),
        ]);

        return true;
    }

    private function signatureFile(?string $sig): ?string
    {
        if (! $sig) {
            return null;
        }

        $binary = null;

        if (str_starts_with($sig, 'data:image/')) {
            $binary = base64_decode((string) substr($sig, (int) strpos($sig, ',') + 1), true);
        } elseif (strlen($sig) < 1024 && @is_file($sig)) {
            $binary = file_get_contents($sig);
        } elseif (strlen($sig) < 1024 && Storage::disk('public')->exists($sig)) {
            $binary = Storage::disk('public')->get($sig);
        } elseif (strlen($sig) < 1024 && @is_file(public_path($sig))) {
            $binary = file_get_contents(public_path($sig));
        } elseif (preg_match('%^[a-zA-Z0-9/+]+={0,2}$%', $sig)) {
            $binary = base64_decode($sig, true);
        }

        if (! $binary || ! @getimagesizefromstring($binary)) {
            return null;
        }

        $file = tempnam(sys_get_temp_dir(), 'ba_sig_');
        file_put_contents($file, $binary);
        $this->tempFiles[] = $file;

        return $file;
    }

    private function safeFilename(string $name): string
    {
        return trim((string) preg_replace('/[\\\\\/:*?"<>|\r\n]+/', ' ', $name));
    }

    // ── Wilayah / labels (same rules as the PDF blade) ───────────────

    private function lookup(?string $value, string $modelClass): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        if (is_numeric($value)) {
            $value = $modelClass::find($value)?->name ?? $value;
        }

        return TextCase::humanize($value);
    }

    private function provinceName(BeritaAcaraKonsultasi $ba): string
    {
        return (string) $this->lookup($ba->province, Province::class);
    }

    private function districtName(BeritaAcaraKonsultasi $ba): string
    {
        return (string) $this->lookup($ba->district, District::class);
    }

    private function regencyLabel(BeritaAcaraKonsultasi $ba): string
    {
        $name = (string) $this->lookup($ba->regency, Regency::class);

        return preg_match('/^(Kabupaten|Kota)\b/i', $name) ? $name : 'Kabupaten '.$name;
    }

    private function waterName(BeritaAcaraKonsultasi $ba): string
    {
        return (string) TextCase::humanize($ba->water_name === 'Lainnya' ? $ba->water_name_other : $ba->water_name);
    }

    private function location(BeritaAcaraKonsultasi $ba): string
    {
        return (string) TextCase::humanize($ba->location === 'Lainnya' ? $ba->location_other : $ba->location);
    }

    private function activityDetail(BeritaAcaraKonsultasi $ba): string
    {
        $raw = $ba->activity_detail;

        if (is_array($raw)) {
            return implode(', ', array_map(
                fn ($item) => $item === 'Yang lain' ? ($ba->activity_detail_other ?: 'Yang lain') : $item,
                $raw,
            ));
        }

        return (string) ($raw === 'Yang lain' ? $ba->activity_detail_other : $raw);
    }
}
