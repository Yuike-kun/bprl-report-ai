<?php

namespace App\Services;

use App\Models\KkprlProposal;
use PhpOffice\PhpWord\Element\Section;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Shared\Converter;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\SimpleType\JcTable;
use PhpOffice\PhpWord\SimpleType\VerticalJc;
use PhpOffice\PhpWord\Style\Language;
use PhpOffice\PhpWord\Writer\HTML;
use PhpOffice\PhpWord\Writer\Word2007;

class ProposalDocumentGenerator
{
    private const NAVY = '1F4E79';

    private const LIGHT_BLUE = 'DCE6F1';

    private const MISSING = '[data tidak terdeteksi otomatis – mohon lengkapi manual]';

    private array $images = [];

    private ?ClaudeService $claude = null;

    /** Cached result of the AI ecosystem narrative for the proposal currently being rendered. */
    private ?array $ekosistemNarasi = null;

    /** Cached result of the AI hydro-oceanography estimate for the proposal currently being rendered. */
    private ?array $hidroEstimasi = null;

    /** Cached result of the AI ecosystem narrative for the egerai (docChapterThree) pipeline currently being rendered. */
    private ?array $ekosistemNarasiDoc = null;

    /**
     * AI-sourced reference blocks (ecosystem narrative sources, hydro-oceanography
     * estimate sources/disclaimer) queued while rendering Chapter III, so they can
     * be printed together on the literal last page of the document (a dedicated
     * "LAMPIRAN: SUMBER REFERENSI" section after Chapter IV) instead of interrupting
     * the middle of the report. See queueReference() / renderPendingReferences().
     *
     * @var array<int, array{heading: string, intro: ?string, introItalic: bool, items: array}>
     */
    private array $pendingReferences = [];

    /**
     * The subset of LaporanTextExtractor::FIELD_HINTS keys this generator can
     * ask the AI to estimate when the (optional) hydro-oceanography survey
     * report was never uploaded or left these gaps unextracted. Excludes
     * lokasi_studi, which is not a numeric/technical parameter.
     */
    private const HIDRO_ESTIMABLE_KEYS = [
        'batimetri_titik_pusat', 'batimetri_panjang_lintasan', 'batimetri_terdalam',
        'hs_rata', 'hs_maks', 'hs_arah', 'arus_rata', 'arus_maks', 'arus_arah',
        'hat', 'msl', 'lat', 'tidal_range', 'formzahl',
        'eko_total_ha', 'eko_karang_ha', 'eko_karang_pct', 'eko_lainnya_ha',
        'eko_lainnya_pct', 'eko_terbuka_ha', 'eko_terbuka_pct', 'eko_jarak_terdekat_km',
    ];

    public function __construct(?ClaudeService $claude = null)
    {
        $this->claude = $claude;
    }

    private function claude(): ClaudeService
    {
        return $this->claude ??= new ClaudeService;
    }

    /** key (supporting_documents checkbox value) => label, mirrors DUKUNG_ITEMS in kkprl-konsultasi-form.tsx */
    private const DUKUNG_LABELS = [
        'nib' => 'NIB',
        'sertifikat' => 'Sertifikat Kepemilikan Lahan Darat',
        'izin_lingkungan' => 'Surat Izin Lingkungan',
        'ba_sosialisasi' => 'Berita Acara Sosialisasi',
        'identitas' => 'Dokumen Identitas dan Legalitas Pemohon/Perusahaan',
        'survei' => 'Dokumentasi Survei Lapangan Kondisi Eksisting Lokasi',
        'peta' => 'Peta Pendukung (Peta Lokasi, Site Plan, Pola Ruang Wilayah)',
        'dipa' => 'DIPA/RKAKL (Sumber Anggaran APBD/APBN) / Lainnya',
        'sk_kkprl' => 'SK Penetapan KNMP',
    ];

    private const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    /* ────────────────────────────────────────────────────────────────
     * FAITHFUL PORT of the reference app's generate_docx.py, driven by
     * KkprlProposal's own columns (public self-service /kkprl-proposal flow).
     * ──────────────────────────────────────────────────────────────── */
    public function createKkprlProposal(KkprlProposal $p, array $images, string $outputPath): void
    {
        $word = $this->buildKkprlWord($p, $images);
        (new Word2007($word))->save($outputPath);
    }

    public function buildKkprlWord(KkprlProposal $p, array $images): PhpWord
    {
        $this->images = $images;
        $this->pendingReferences = [];
        $word = new PhpWord;
        $word->getSettings()->setThemeFontLang(new Language('id-ID'));
        $section = $word->addSection([
            'marginLeft' => Converter::cmToTwip(2.5),
            'marginRight' => Converter::cmToTwip(2),
            'marginTop' => Converter::cmToTwip(2),
            'marginBottom' => Converter::cmToTwip(2),
        ]);

        $this->kkprlCover($section, $p);
        $section->addPageBreak();
        $this->kkprlChapterOne($section, $p);
        $section->addPageBreak();
        $this->kkprlChapterTwo($section, $p);
        $section->addPageBreak();
        $this->kkprlChapterThree($section, $p);
        $section->addPageBreak();
        $this->kkprlChapterFour($section, $p);
        $this->renderPendingReferences($section);

        return $word;
    }

    public function renderKkprlPreviewHtml(KkprlProposal $p, array $images = []): string
    {
        $word = $this->buildKkprlWord($p, $images);

        return $this->formatWordHtmlToA4Document((new HTML($word))->getContent());
    }

    private function pv(KkprlProposal $p, string $key, ?string $default = null): string
    {
        $value = $p->{$key} ?? null;
        $value = is_bool($value) ? ($value ? '1' : '') : trim((string) $value);

        return $value !== '' ? $value : ($default ?? self::MISSING);
    }

    private function pLokasi(KkprlProposal $p): string
    {
        return sprintf(
            'Desa %s, Kecamatan %s, %s, Provinsi %s',
            $this->pv($p, 'village'),
            $this->pv($p, 'district'),
            $this->pv($p, 'regency'),
            $this->pv($p, 'province')
        );
    }

    private function pArea(KkprlProposal $p): string
    {
        $area = $p->area_size;

        return $area !== null && $area !== '' ? rtrim(rtrim(number_format((float) $area, 2, '.', ''), '0'), '.').' Ha' : self::MISSING;
    }

    /** Parse "Nama Kegiatan : Bulan X - Bulan Y." repeated segments (see kkprl-konsultasi-form.tsx `jadwal_kegiatan` hint). */
    private function parseJadwal(string $text): array
    {
        if (trim($text) === '') {
            return [];
        }
        $result = [];
        preg_match_all('/([^.:]+?)\s*:\s*Bulan\s*(\d+)\s*(?:-|s\/d|sampai)\s*Bulan\s*(\d+)\s*\.?/i', $text, $matches, PREG_SET_ORDER);
        foreach ($matches as $m) {
            $nama = trim($m[1], " .\t\n\r\0\x0B");
            $mulai = (int) $m[2];
            $selesai = (int) $m[3];
            if ($nama !== '' && $selesai >= $mulai) {
                $result[] = [$nama, $mulai, $selesai];
            }
        }

        return $result;
    }

    /** Parse the free-text "lon lat" per line coordinate box into numbered rows. */
    /**
     * Parses the free-text "lon lat [keterangan]" per-line coordinate box into
     * numbered rows. Any text after the longitude/latitude pair on the same
     * line is kept verbatim as the point's "Keterangan" (e.g. "Dermaga",
     * "Intake") instead of being discarded.
     */
    private function parseCoordinates(string $raw): array
    {
        $rows = [];
        $no = 1;
        foreach (preg_split('/\r\n|\r|\n/', trim($raw)) as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }
            $parts = preg_split('/[\s,]+/', $line, 3);
            if (count($parts) >= 2 && is_numeric($parts[0]) && is_numeric($parts[1])) {
                $keterangan = isset($parts[2]) ? trim($parts[2]) : '';
                $rows[] = [(string) $no, $parts[0], $parts[1], $keterangan];
                $no++;
            }
        }

        return $rows;
    }

    /**
     * PhpWord does NOT auto-escape text written via addText()/addListItem()
     * (Settings::isOutputEscapingEnabled() defaults to false — see
     * vendor/phpoffice/phpword/src/PhpWord/Settings.php), so every dynamic
     * string (user input, uploaded-document extraction, AI narrative) MUST be
     * escaped here before being handed to PhpWord. Skipping this produces
     * invalid word/document.xml (e.g. a raw "&" breaks XML parsing) which
     * Word/LibreOffice reports as a corrupted .docx.
     */
    private function esc(string $text): string
    {
        return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Single source of truth for "does this ecosystem actually have data",
     * shared by docChapterThree() below (mangrove/lamun/karang) and by
     * EgeraiProposalController::createKkprlProposalFromJob(). Presence of the
     * species text is the primary signal (set by manual entry, regex
     * extraction, or the AI fallback); the "ada" flag string is only reliably
     * set by the manual-entry form, so it's treated as a secondary signal
     * rather than the sole gate. Centralized here so a future change to this
     * rule doesn't need to be repeated at every call site.
     */
    public static function hasEcosystemData(array $prop, string $speciesKey, string $adaKey, string $presentValue): bool
    {
        return filled($prop[$speciesKey] ?? null) || ($prop[$adaKey] ?? null) === $presentValue;
    }

    /**
     * Normalizes one coordinate row for the "D. Peta Lokasi" table, adding the
     * "Keterangan" column with a "-" fallback when empty. Shared by
     * kkprlChapterOne(), chapterOne(), and docChapterOne() so the fallback
     * formatting can't drift between the three parallel implementations.
     */
    private function formatCoordRow(string $no, string $longitude, string $latitude, ?string $keterangan): array
    {
        $keterangan = trim((string) $keterangan);

        return [$no, $longitude, $latitude, $keterangan !== '' ? $keterangan : '-'];
    }

    /**
     * Queues one AI-sourced reference block (heading + optional intro/disclaimer
     * text + cited source list) to be printed on the document's literal last
     * page by renderPendingReferences(), instead of rendering it immediately
     * where it's collected (mid Chapter III). No-op when there is nothing worth
     * printing (no intro and no items).
     */
    private function queueReference(string $heading, ?string $intro, array $items, bool $introItalic = false): void
    {
        if (blank($intro) && ! $items) {
            return;
        }

        $this->pendingReferences[] = [
            'heading' => $heading,
            'intro' => $intro,
            'introItalic' => $introItalic,
            'items' => $items,
        ];
    }

    /**
     * Prints every block queued via queueReference() on a dedicated final
     * "LAMPIRAN: SUMBER REFERENSI" page — called once, after the last chapter,
     * from buildWord()/buildKkprlWord(). No-op (no extra page added) when
     * nothing was queued.
     */
    private function renderPendingReferences(Section $s): void
    {
        if (! $this->pendingReferences) {
            return;
        }

        $s->addPageBreak();
        $this->heading($s, 'LAMPIRAN: SUMBER REFERENSI', 1);
        $this->text($s, 'Bagian berikut mencantumkan sumber referensi dan/atau catatan dari asisten AI yang digunakan untuk melengkapi narasi kondisi lapangan pada dokumen ini, sebagaimana dirujuk pada bagian-bagian terkait di atas.', true);

        foreach ($this->pendingReferences as $ref) {
            $this->heading($s, $ref['heading'], 2);
            if (filled($ref['intro'])) {
                $this->text($s, $ref['intro'], $ref['introItalic']);
            }
            foreach ($ref['items'] as $item) {
                $title = $item['title'] ?? $item['url'] ?? '';
                $url = $item['url'] ?? '';
                $s->addListItem($this->esc(trim($title.' — '.$url, ' —')), 0, ['name' => 'Arial', 'size' => 10, 'color' => '1F4E79']);
            }
        }

        $this->pendingReferences = [];
    }

    private function labeled(Section $s, string $label, string $text): void
    {
        $run = $s->addTextRun(['alignment' => Jc::BOTH, 'spaceAfter' => 160, 'lineHeight' => 1.25]);
        $run->addText($this->esc($label.': '), ['name' => 'Arial', 'size' => 11, 'bold' => true]);
        $run->addText($this->esc($text), ['name' => 'Arial', 'size' => 11]);
    }

    /** Insert every image found for a tag (0..n), or a red "not found" notice + caption when absent. */
    private function figure(Section $s, string $tag, string $caption, int $widthCm = 13): void
    {
        $paths = $this->images[$tag] ?? [];
        $paths = is_array($paths) ? $paths : [$paths];
        $paths = array_values(array_filter($paths, fn ($path) => is_string($path) && is_file($path)));

        if (empty($paths)) {
            // No image available for this tag — omit both the placeholder and its
            // caption entirely instead of leaving a dangling/orphaned "Gambar X. ..." label.
            return;
        }

        foreach ($paths as $path) {
            $s->addImage($path, ['width' => Converter::cmToPixel($widthCm), 'alignment' => Jc::CENTER]);
        }
        $this->caption($s, $caption);
    }

    private function ganttTable(Section $s, array $activities, int $startMonth, int $startYear): void
    {
        $maxBulan = max(array_map(fn ($a) => $a[2], $activities));
        $kalender = [];
        $m = $startMonth;
        $y = $startYear;
        for ($i = 0; $i < $maxBulan; $i++) {
            $kalender[] = [self::BULAN_SINGKAT[$m - 1], $y];
            $m++;
            if ($m > 12) {
                $m = 1;
                $y++;
            }
        }

        $table = $s->addTable(['borderSize' => 6, 'borderColor' => '666666', 'alignment' => JcTable::CENTER]);

        // Row 1: year header (merged across months of the same year)
        $table->addRow();
        $table->addCell(Converter::cmToTwip(3.6), ['bgColor' => self::NAVY]);
        $i = 0;
        while ($i < $maxBulan) {
            $year = $kalender[$i][1];
            $span = 0;
            while ($i + $span < $maxBulan && $kalender[$i + $span][1] === $year) {
                $span++;
            }
            $cell = $table->addCell(Converter::cmToTwip(1.0) * $span, ['bgColor' => self::NAVY, 'gridSpan' => $span, 'valign' => VerticalJc::CENTER]);
            $cell->addText($this->esc((string) $year), ['name' => 'Arial', 'size' => 10, 'bold' => true, 'color' => 'FFFFFF'], ['alignment' => Jc::CENTER]);
            $i += $span;
        }

        // Row 2: "Kegiatan" + short month labels
        $table->addRow();
        $head = $table->addCell(Converter::cmToTwip(3.6), ['bgColor' => self::NAVY, 'valign' => VerticalJc::CENTER]);
        $head->addText('Kegiatan', ['name' => 'Arial', 'size' => 10, 'bold' => true, 'color' => 'FFFFFF']);
        foreach ($kalender as [$bulan]) {
            $cell = $table->addCell(Converter::cmToTwip(1.0), ['bgColor' => self::NAVY, 'valign' => VerticalJc::CENTER]);
            $cell->addText($this->esc($bulan), ['name' => 'Arial', 'size' => 9.5, 'bold' => true, 'color' => 'FFFFFF'], ['alignment' => Jc::CENTER]);
        }

        // Activity rows, shaded across their active month range
        foreach ($activities as [$nama, $mulai, $selesai]) {
            $table->addRow();
            $labelCell = $table->addCell(Converter::cmToTwip(3.6), ['valign' => VerticalJc::CENTER]);
            $labelCell->addText($this->esc($nama), ['name' => 'Arial', 'size' => 9.5, 'bold' => true]);
            for ($bulanKe = 1; $bulanKe <= $maxBulan; $bulanKe++) {
                $active = $bulanKe >= $mulai && $bulanKe <= $selesai;
                $table->addCell(Converter::cmToTwip(1.0), $active ? ['bgColor' => self::NAVY, 'valign' => VerticalJc::CENTER] : ['valign' => VerticalJc::CENTER]);
            }
        }
    }

    private function kkprlCover(Section $s, KkprlProposal $p): void
    {
        $s->addText('PROPOSAL TEKNIS', ['name' => 'Arial', 'size' => 20, 'bold' => true, 'color' => self::NAVY], ['alignment' => Jc::CENTER, 'spaceAfter' => 160]);
        $s->addText('PERMOHONAN PERSETUJUAN KESESUAIAN KEGIATAN'.PHP_EOL.'PEMANFAATAN RUANG LAUT (PKKPRL)', ['name' => 'Arial', 'size' => 14, 'bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 240]);
        $s->addText('Disusun mengacu pada Peraturan Menteri Kelautan dan Perikanan Nomor 28 Tahun 2021 tentang Penyelenggaraan Penataan Ruang Laut', ['name' => 'Arial', 'size' => 10, 'italic' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 400]);
        $this->keyValueTable($s, [
            ['Nama Pemohon', $this->pv($p, 'applicant_name')],
            ['Jabatan Pemohon', $this->pv($p, 'applicant_position')],
            ['Nama Perusahaan/Instansi', $this->pv($p, 'company_name')],
            ['NIB', $this->pv($p, 'nib')],
            ['NPWP', $this->pv($p, 'npwp')],
            ['Nomor Telepon Selular', $this->pv($p, 'phone_number')],
            ['Surat Elektronik', $this->pv($p, 'email')],
            ['Jenis Kegiatan', $this->pv($p, 'activity_type')],
            ['Lokasi Kegiatan', $this->pLokasi($p)],
            ['Nama Perairan', $this->pv($p, 'water_name')],
            ['Luas Kebutuhan Ruang', $this->pArea($p)],
            ['KBLI', $this->pv($p, 'activity_category')],
            ['Tanggal Penyusunan', $p->created_at?->translatedFormat('j F Y') ?? self::MISSING],
        ]);
    }

    private function kkprlChapterOne(Section $s, KkprlProposal $p): void
    {
        $perusahaan = $this->pv($p, 'company_name');
        $perairan = $this->pv($p, 'water_name');
        $luas = $this->pArea($p);
        $jenis = $this->pv($p, 'activity_type');
        $lokasi = $this->pLokasi($p);
        $pemohon = $this->pv($p, 'applicant_name');

        $this->heading($s, 'I. RENCANA BANGUNAN DAN INSTALASI LAUT', 1);
        $this->heading($s, 'Pendahuluan', 2);
        $this->text($s, 'Proposal teknis ini disusun sebagai bagian dari persyaratan permohonan Persetujuan Kesesuaian Kegiatan Pemanfaatan Ruang Laut (PKKPRL), sebagaimana diatur dalam Peraturan Pemerintah Nomor 21 Tahun 2021 tentang Penyelenggaraan Penataan Ruang, Peraturan Menteri Kelautan dan Perikanan Nomor 28 Tahun 2021 tentang Penyelenggaraan Penataan Ruang Laut, serta ketentuan pelaksanaan pada sistem OSS Berbasis Risiko.');
        $this->text($s, "$perusahaan yang diwakili oleh $pemohon berencana menyelenggarakan kegiatan berusaha berupa $jenis. Rencana kegiatan ini berlokasi di $lokasi, menggunakan perairan $perairan dengan total kebutuhan luas ruang laut yang dimohonkan sebesar $luas.");

        $this->heading($s, 'A. Rencana Kegiatan Utama dan Penunjang', 2);
        $this->heading($s, '1. Uraian Kegiatan', 3);
        $this->text($s, "Kegiatan yang dimohonkan adalah $jenis, dengan kebutuhan ruang laut seluas $luas.");
        foreach ([
            'Deskripsi Kegiatan' => $p->activity_description,
            'Manfaat Kegiatan' => $p->activity_benefit,
            'Tujuan Kegiatan' => $p->activity_purpose,
        ] as $label => $value) {
            if (filled($value)) {
                $this->labeled($s, $label, (string) $value);
            }
        }

        $tenaga = $this->pv($p, 'local_workers');
        $tenagaAsing = $this->pv($p, 'foreign_workers', '0');
        $investasi = $p->investment_value !== null && $p->investment_value !== ''
            ? 'Rp'.number_format((float) $p->investment_value, 0, ',', '.')
            : self::MISSING;
        $this->text($s, "Rencana tenaga kerja yang digunakan berjumlah $tenaga orang WNI/lokal, dengan tenaga kerja asing berjumlah $tenagaAsing. Total komitmen pendanaan investasi kegiatan ini sebesar $investasi, mencakup perencanaan teknis, pengadaan sarana-prasarana, operasional, serta pengelolaan lingkungan hidup.");

        $instalasi = $p->marine_installation;
        $posisi = collect($p->installation_location ?? [])->implode(', ');
        if (filled($instalasi) || filled($posisi)) {
            $posisiTxt = filled($posisi) ? ', berada pada '.mb_strtolower($posisi) : '';
            $bangunanTxt = filled($instalasi) ? $instalasi : 'instalasi penunjang kegiatan';
            $this->text($s, "Instalasi bangunan menetap di laut yang direncanakan berupa $bangunanTxt$posisiTxt.");
        }

        $this->heading($s, '2. Kegiatan Eksisting atau Rencana yang Akan Dimohonkan', 3);
        $statusMap = [
            'Eksisting' => 'merupakan kegiatan yang sudah berjalan (eksisting)',
            'Rencana' => 'merupakan kegiatan yang baru akan direncanakan',
        ];
        $statusTxt = $statusMap[$p->activity_status ?? ''] ?? null;
        $statusSentence = $statusTxt ? " Kegiatan ini $statusTxt." : '';
        $this->text($s, "Kegiatan rencana yang dimohonkan adalah $jenis yang berada di $lokasi, menggunakan perairan $perairan dengan total kebutuhan luas ruang laut sebesar $luas.$statusSentence Pengajuan PKKPRL dilakukan dalam rangka pemenuhan perizinan dasar di lokasi yang dimohonkan sebelum mengajukan perizinan lanjutan.");
        $this->figure($s, 'siteplan', "Gambar 1. Peta Rencana Tapak (Site Plan) Kegiatan $perusahaan.");

        $this->heading($s, '3. Rencana Jadwal Pelaksanaan Kegiatan Utama dan Pendukungnya', 3);
        $activities = $this->parseJadwal((string) $p->schedule_description);
        if ($activities) {
            $bangunanTxt2 = filled($instalasi) ? $instalasi : 'instalasi penunjang kegiatan';
            $posisiTxt2 = filled($posisi) ? ' yang berada di '.mb_strtolower($posisi) : '';
            $this->text($s, "Adapun kegiatan utama yang akan dilakukan ialah pembangunan dan pengembangan lokasi $jenis akan dilakukan sebagaimana ditampilkan pada Tabel 1. Seluruh bangunan merupakan $bangunanTxt2$posisiTxt2.");
            $created = $p->created_at ?? now();
            $this->ganttTable($s, $activities, (int) $created->format('n'), (int) $created->format('Y'));
            $this->caption($s, 'Tabel 1. Rencana Jadwal Pelaksanaan Kegiatan Utama dan Pendukungnya.');
        } elseif (filled($p->schedule_description)) {
            $this->labeled($s, 'Jadwal Kegiatan', (string) $p->schedule_description);
        } else {
            $this->text($s, self::MISSING);
        }

        $this->heading($s, '4. Reklamasi / Non-Reklamasi', 3);
        $reklamasiTxt = $p->is_reclamation === null ? self::MISSING : ($p->is_reclamation ? 'dengan reklamasi' : 'tanpa reklamasi');
        $this->text($s, "Kegiatan $jenis yang dilakukan oleh $perusahaan merupakan kegiatan yang dilaksanakan $reklamasiTxt.");

        $this->heading($s, 'B. Kegiatan Berusaha atau Non-Berusaha', 2);
        $berusahaTxt = $p->is_business_activity === null ? self::MISSING : ($p->is_business_activity ? 'kegiatan berusaha' : 'kegiatan non-berusaha');
        $this->text($s, "Kegiatan $jenis yang dilakukan $perusahaan di $lokasi, yang menggunakan perairan $perairan, merupakan $berusahaTxt.");

        $this->heading($s, 'C. Kegiatan Strategis Nasional atau Nonstrategis Nasional', 2);
        $strategisTxt = $p->is_national_strategic === null ? self::MISSING : ($p->is_national_strategic ? 'kegiatan strategis nasional' : 'kegiatan non-strategis nasional/dasar');
        $this->text($s, "Rencana kegiatan pemanfaatan ruang laut ini tergolong sebagai $strategisTxt. Penetapan status ini digunakan sebagai acuan untuk memenuhi persyaratan teknis permohonan PKKPRL.");

        $this->heading($s, 'D. Peta Lokasi', 2);
        $coords = $this->parseCoordinates((string) $p->coordinates);
        if ($coords) {
            $this->text($s, 'Peta lokasi/plotting batas-batas area yang dimohonkan PKKPRL ditunjukkan oleh titik koordinat berikut:');
            $this->dataTable($s, ['Nomor Titik', 'Longitude', 'Latitude', 'Keterangan'], array_map(
                fn ($row) => $this->formatCoordRow($row[0], $row[1], $row[2], $row[3] ?? ''),
                $coords
            ));
            $this->caption($s, 'Tabel 1. Titik Koordinat Batas Area Permohonan PKKPRL.');
        } else {
            $this->text($s, self::MISSING);
        }
        $this->figure($s, 'peta_lokasi', 'Gambar 2. Peta Lokasi dan Sebaran Titik Koordinat Rencana Kegiatan.');
        if (filled($p->map_source)) {
            $this->caption($s, 'Sumber Peta: '.$p->map_source);
        }

        $this->heading($s, 'E. Deskripsi Luas/Panjang yang Dibutuhkan', 2);
        $this->text($s, "Luas perairan yang dimohonkan KKPRL adalah seluas $luas yang terletak di perairan $perairan, $lokasi.");
    }

    private function kkprlChapterTwo(Section $s, KkprlProposal $p): void
    {
        $this->heading($s, 'II. INFORMASI PEMANFAATAN RUANG LAUT', 1);
        $this->text($s, "Berdasarkan hasil identifikasi, pemanfaatan ruang laut eksisting di sekitar lokasi kegiatan {$this->pv($p, 'activity_type')} dari {$this->pv($p, 'company_name')} termasuk dalam wilayah perairan {$this->pv($p, 'water_name')}, pada administrasi {$this->pLokasi($p)}.");
        $this->text($s, 'Berdasarkan hasil survei/pengamatan langsung, tidak terdapat pemanfaatan ruang laut oleh pihak lain di sekitar lokasi permohonan. Rencana kegiatan disusun dengan memperhatikan kepentingan nelayan tradisional dan masyarakat, serta tidak menghalangi akses pelayaran yang sudah ada.');
        if (filled($p->marine_spatial_activity_description)) {
            $this->text($s, (string) $p->marine_spatial_activity_description);
        }
        $this->figure($s, 'foto_pantai', 'Gambar 3. Kondisi Eksisting Perairan dan Garis Pantai di Sekitar Lokasi Permohonan.');
        foreach ((array) ($p->marine_spatial_docs_path ?? []) as $index => $_) {
            // handled generically through the 'peta_pola_ruang' tag below; individual docs are not narrated per-item.
            unset($index);
            break;
        }
    }

    private function ekosistemTutupan(?string $species, $percentage, ?string $condition): array
    {
        return [
            'species' => filled($species) ? $species : self::MISSING,
            'percentage' => $percentage !== null && $percentage !== '' ? rtrim(rtrim((string) $percentage, '0'), '.') : self::MISSING,
            'condition' => filled($condition) ? $condition : self::MISSING,
        ];
    }

    /**
     * Builds the strictly-factual context sent to the AI and requests the
     * ecosystem narrative once per document render (cached in $this->ekosistemNarasi).
     * Falls back to [] (handled by callers via ?? static text) on any AI failure,
     * so the DOCX generation never breaks or blocks on the AI call.
     */
    private function ekosistemNarasi(KkprlProposal $p): array
    {
        if ($this->ekosistemNarasi !== null) {
            return $this->ekosistemNarasi;
        }

        $context = [
            'lokasi' => $this->pLokasi($p),
            'nama_perairan' => $this->pv($p, 'water_name', ''),
            'has_mangrove' => (bool) $p->has_mangrove,
            'mangrove_species' => $p->has_mangrove ? (string) $p->mangrove_species : null,
            'mangrove_cover_percentage' => $p->has_mangrove ? $p->mangrove_cover_percentage : null,
            'mangrove_condition' => $p->has_mangrove ? (string) $p->mangrove_condition : null,
            'has_seagrass' => (bool) $p->has_seagrass,
            'seagrass_species' => $p->has_seagrass ? (string) $p->seagrass_species : null,
            'seagrass_cover_percentage' => $p->has_seagrass ? $p->seagrass_cover_percentage : null,
            'seagrass_condition' => $p->has_seagrass ? (string) $p->seagrass_condition : null,
            'has_coral_reef' => (bool) $p->has_coral_reef,
            'coral_reef_species' => $p->has_coral_reef ? (string) $p->coral_reef_species : null,
            'coral_reef_cover_percentage' => $p->has_coral_reef ? $p->coral_reef_cover_percentage : null,
            'coral_reef_condition' => $p->has_coral_reef ? (string) $p->coral_reef_condition : null,
        ];

        return $this->ekosistemNarasi = $this->claude()->generateEkosistemNarrative($context);
    }

    /**
     * The (optional) "Laporan Hidro-Oseanografi" survey document is frequently
     * never uploaded, leaving every gelombang/arus/pasut/batimetri/luas-ekosistem
     * field in $lap blank — docChapterThree() then rendered a raw "[data tidak
     * terdeteksi otomatis]" placeholder for each one. This asks the AI to
     * research real regional oceanographic reference data (web search) for
     * whichever of those fields are still missing once per document render
     * (cached in $this->hidroEstimasi), so the draft shows a plausible,
     * source-cited regional estimate instead of a bare placeholder. Returns []
     * (handled by callers via the existing self::MISSING fallback) on any AI
     * failure or when nothing is actually missing, so generation never blocks.
     */
    private function hidroOseanografiEstimasi(array $prop, array $lap, string $lokasi): array
    {
        if ($this->hidroEstimasi !== null) {
            return $this->hidroEstimasi;
        }

        $missing = array_values(array_filter(
            self::HIDRO_ESTIMABLE_KEYS,
            fn ($key) => blank($lap[$key] ?? null)
        ));

        if (! $missing) {
            return $this->hidroEstimasi = [];
        }

        $context = [
            'lokasi' => $lokasi,
            'nama_perairan' => (string) ($prop['Nama Perairan'] ?? ''),
            'jenis_kegiatan' => (string) ($prop['Jenis Kegiatan'] ?? ''),
            // Whatever the survey report/extraction DID already provide, so the
            // AI stays consistent with it instead of estimating in isolation.
            'data_terukur_tersedia' => collect($lap)
                ->only(self::HIDRO_ESTIMABLE_KEYS)
                ->filter(fn ($v) => filled($v))
                ->all(),
        ];

        return $this->hidroEstimasi = $this->claude()->estimateHidroOseanografi($context, $missing);
    }

    /**
     * Same detailed, source-cited AI ecosystem narrative as ekosistemNarasi()
     * (used by the KkprlProposal-based kkprlChapterThree() flow), adapted for
     * docChapterThree()'s array-based $prop data (egerai upload/manual
     * pipeline). Reuses ClaudeService::generateEkosistemNarrative() as-is —
     * same strict "only real DATA FAKTUAL, no fabricated species/percentages,
     * web-search for regional context only" rules — so both pipelines produce
     * the same long-form (3-4 paragraph per subsection), cited quality
     * instead of docChapterThree()'s previous one-sentence template text.
     *
     * Deliberately NOT gated by the "isi dengan AI" checkbox
     * ($aiFillEnabled): unlike hidroOseanografiEstimasi() — which invents
     * numbers for parameters that are genuinely absent — this only elaborates
     * on ecosystem data that already exists (or explains a genuinely absent
     * ecosystem using existing has_mangrove/has_seagrass/has_coral_reef
     * signals), so it always runs. Returns [] (falls back to the static
     * one-sentence text) only on an AI failure.
     */
    private function ekosistemNarasiDoc(array $prop, string $lokasi): array
    {
        if ($this->ekosistemNarasiDoc !== null) {
            return $this->ekosistemNarasiDoc;
        }

        $hasMangrove = self::hasEcosystemData($prop, 'mangrove_spesies', 'mangrove_ada', 'Terdapat ekosistem mangrove');
        $hasLamun = self::hasEcosystemData($prop, 'lamun_spesies', 'lamun_ada_manual', 'Terdapat ekosistem lamun');
        $hasKarang = self::hasEcosystemData($prop, 'karang_spesies', 'karang_ada', 'Terdapat ekosistem terumbu karang');

        $context = [
            'lokasi' => $lokasi,
            'nama_perairan' => (string) ($prop['Nama Perairan'] ?? ''),
            'has_mangrove' => $hasMangrove,
            'mangrove_species' => $hasMangrove ? (string) ($prop['mangrove_spesies'] ?? '') : null,
            'mangrove_cover_percentage' => $hasMangrove ? ($prop['mangrove_persen'] ?? null) : null,
            'mangrove_condition' => $hasMangrove ? (string) ($prop['mangrove_kondisi'] ?? '') : null,
            'has_seagrass' => $hasLamun,
            'seagrass_species' => $hasLamun ? (string) ($prop['lamun_spesies'] ?? '') : null,
            'seagrass_cover_percentage' => $hasLamun ? ($prop['lamun_persen'] ?? null) : null,
            'seagrass_condition' => $hasLamun ? (string) ($prop['lamun_kondisi'] ?? '') : null,
            'has_coral_reef' => $hasKarang,
            'coral_reef_species' => $hasKarang ? (string) ($prop['karang_spesies'] ?? '') : null,
            'coral_reef_cover_percentage' => $hasKarang ? ($prop['karang_persen_manual'] ?? null) : null,
            'coral_reef_condition' => $hasKarang ? (string) ($prop['karang_kondisi'] ?? '') : null,
        ];

        return $this->ekosistemNarasiDoc = $this->claude()->generateEkosistemNarrative($context);
    }

    private function kkprlChapterThree(Section $s, KkprlProposal $p): void
    {
        $lokasi = $this->pLokasi($p);
        $this->heading($s, 'III. DATA KONDISI TERKINI LOKASI DAN SEKITARNYA', 1);
        $ai = $this->ekosistemNarasi($p);

        $this->heading($s, 'A. Ekosistem Sekitar', 2);
        $this->heading($s, '1. Mangrove', 3);
        if (filled($ai['mangrove'] ?? null)) {
            $this->text($s, $ai['mangrove']);
        } elseif ($p->has_mangrove === false) {
            $this->text($s, 'Berdasarkan hasil pengamatan langsung kondisi pesisir di sekitar lokasi kegiatan, tidak teridentifikasi keberadaan ekosistem mangrove pada area yang dimohonkan.');
        } else {
            $eco = $this->ekosistemTutupan($p->mangrove_species, $p->mangrove_cover_percentage, $p->mangrove_condition);
            $this->text($s, "Berdasarkan hasil pengamatan langsung kondisi pesisir di sekitar lokasi kegiatan, terdapat ekosistem mangrove yang didominasi oleh jenis {$eco['species']}, dengan persentase tutupan mencapai {$eco['percentage']}% pada kondisi {$eco['condition']}.");
        }
        $this->figure($s, 'foto_mangrove', 'Gambar 4. Kondisi Tutupan Vegetasi Mangrove di Sekitar Lokasi Kegiatan.');

        $this->heading($s, '2. Lamun', 3);
        if (filled($ai['lamun'] ?? null)) {
            $this->text($s, $ai['lamun']);
            if ($p->has_seagrass) {
                $this->figure($s, 'foto_lamun', 'Gambar 5. Dokumentasi Ekosistem Lamun di Sekitar Lokasi Kegiatan.');
            }
        } elseif ($p->has_seagrass) {
            $eco = $this->ekosistemTutupan($p->seagrass_species, $p->seagrass_cover_percentage, $p->seagrass_condition);
            $this->text($s, "Berdasarkan hasil pengamatan pemohon di lapangan, teridentifikasi ekosistem lamun yang didominasi oleh jenis {$eco['species']}, dengan persentase tutupan mencapai {$eco['percentage']}% pada kondisi {$eco['condition']}.");
            $this->figure($s, 'foto_lamun', 'Gambar 5. Dokumentasi Ekosistem Lamun di Sekitar Lokasi Kegiatan.');
        } else {
            $this->text($s, 'Berdasarkan data sekunder perairan di sekitar lokasi kegiatan, tidak teridentifikasi keberadaan ekosistem lamun (seagrass) pada area yang dimohonkan.');
        }

        $this->heading($s, '3. Terumbu Karang', 3);
        if (filled($ai['karang'] ?? null)) {
            $this->text($s, $ai['karang']);
        } elseif ($p->has_coral_reef) {
            $eco = $this->ekosistemTutupan($p->coral_reef_species, $p->coral_reef_cover_percentage, $p->coral_reef_condition);
            $this->text($s, "Berdasarkan hasil pengamatan pemohon di lapangan, teridentifikasi ekosistem terumbu karang yang didominasi oleh jenis {$eco['species']}, dengan persentase tutupan mencapai {$eco['percentage']}% pada kondisi {$eco['condition']}.");
        } else {
            $this->text($s, 'Berdasarkan hasil pengamatan pemohon di lapangan, tidak teridentifikasi keberadaan ekosistem terumbu karang secara langsung pada area yang dimohonkan.');
        }
        $this->figure($s, 'foto_karang_insitu', 'Gambar 6. Dokumentasi Survei In-Situ Koloni Terumbu Karang di Perairan Sekitar Lokasi Kegiatan.');
        $this->figure($s, 'peta_ekosistem', 'Gambar 7. Peta Sebaran Spasial Ekosistem Pesisir di Sekitar Titik Pusat Rencana Kegiatan.');
        if (filled($ai['ringkasan'] ?? null)) {
            $this->text($s, $ai['ringkasan']);
        } else {
            $this->text($s, 'Jarak ekosistem terdekat dari titik pusat rencana kegiatan adalah '.self::MISSING.' km, sehingga mitigasi dampak perlu difokuskan pada upaya penghindaran (avoidance) terhadap area terumbu karang, pengendalian sedimen, serta pengelolaan kualitas air.');
        }

        // Printed on the document's literal last page (LAMPIRAN: SUMBER
        // REFERENSI, after Chapter IV) instead of here — see queueReference().
        $this->queueReference(
            'Sumber Referensi Konteks Ekosistem',
            'Narasi kondisi ekosistem pesisir pada Bab III di atas disusun dengan mempertimbangkan konteks ekologis regional dari sumber daring resmi/ilmiah berikut, yang diakses secara langsung oleh asisten AI pada saat penyusunan dokumen ini:',
            $ai['sumber'] ?? []
        );

        $this->heading($s, 'B. Hidro-Oseanografi', 2);
        $this->heading($s, '1. Gelombang', 3);
        $this->text($s, 'Tinggi gelombang signifikan (Hs) rata-rata tercatat sebesar '.self::MISSING.' meter, sedangkan Hs maksimum ekstrem tercatat sebesar '.self::MISSING.' meter dengan arah dominan dari '.self::MISSING.'°. Parameter ini menjadi acuan utama dalam desain ketahanan struktur bangunan laut terhadap beban gelombang ekstrem.');
        $this->figure($s, 'mawar_gelombang', 'Gambar 8. Mawar Gelombang Ekstrem pada Titik Pusat Rencana Kegiatan.', 9);

        $this->heading($s, '2. Arus', 3);
        $this->text($s, 'Kecepatan arus rata-rata tercatat sebesar '.self::MISSING.' m/detik, dengan kecepatan maksimum ekstrem sebesar '.self::MISSING.' m/detik dan arah dominan dari '.self::MISSING.'°. Parameter ini menjadi indikator potensi gerusan (scouring) di sekitar struktur bangunan laut.');
        $this->figure($s, 'mawar_arus', 'Gambar 9. Mawar Arus pada Titik Pusat Rencana Kegiatan.', 9);
        $this->dataTable($s, ['Parameter', 'Nilai Rata-rata', 'Nilai Ekstrem', 'Arah Dominan'], [
            ['Tinggi Gelombang Signifikan (Hs)', self::MISSING, self::MISSING, self::MISSING],
            ['Kecepatan Arus', self::MISSING, self::MISSING, self::MISSING],
        ]);
        $this->caption($s, 'Tabel 3. Ringkasan Parameter Gelombang dan Arus pada Titik Pusat Rencana Kegiatan.');

        $this->heading($s, '3. Pasang Surut', 3);
        $this->text($s, 'Perairan ini memiliki tipe pasang surut '.self::MISSING.' (Bilangan Formzahl '.self::MISSING.'), dengan tunggang air (tidal range) sebesar '.self::MISSING.' meter, elevasi tertinggi (HAT) sebesar +'.self::MISSING.' meter, dan elevasi terendah (LAT) sebesar '.self::MISSING.' meter.');
        $this->dataTable($s, ['Parameter Pasang Surut', 'Elevasi'], [
            ['Highest Astronomical Tide (HAT)', '+'.self::MISSING.' m'],
            ['Mean Sea Level (MSL)', self::MISSING.' m'],
            ['Lowest Astronomical Tide (LAT)', self::MISSING.' m'],
            ['Tidal Range', self::MISSING.' m'],
            ['Bilangan Formzahl', self::MISSING],
        ]);
        $this->caption($s, 'Tabel 4. Parameter Pasang Surut pada Lokasi Kegiatan.');
        $this->figure($s, 'siklus_pasut', 'Gambar 10. Grafik Fluktuasi Pasang Surut Selama 14 Hari.');

        $this->heading($s, 'C. Profil Dasar Laut', 2);
        $this->text($s, 'Kedalaman pada titik pusat lokasi kegiatan tercatat sebesar '.self::MISSING.' meter terhadap Lowest Water Spring (LWS). Hasil pemeruman pada profil garis batimetri sepanjang lintasan '.self::MISSING.' km menunjukkan kedalaman terdalam mencapai '.self::MISSING.' meter.');
        $this->figure($s, 'profil_batimetri', 'Gambar 11. Profil Garis Batimetri pada Lintasan Pemeruman Titik Pusat Rencana Kegiatan.');

        $this->heading($s, 'D. Kondisi Sosial Ekonomi Masyarakat', 2);
        $sumber = filled($p->sosek_data_source) ? $p->sosek_data_source : 'Badan Pusat Statistik';
        $tahunTxt = filled($p->sosek_data_year) ? ' tahun '.$p->sosek_data_year : '';
        $this->text($s, "Berdasarkan data sekunder $sumber$tahunTxt, Desa {$this->pv($p, 'village')} memiliki luas wilayah {$this->pv($p, 'village_area')} Ha dengan jumlah penduduk sebanyak {$this->pv($p, 'population_count')} jiwa. Kehadiran rencana kegiatan ini diharapkan dapat mendukung struktur sosial-ekonomi kawasan secara harmonis dan melibatkan konsultasi publik dengan kelompok nelayan setempat sebelum pelaksanaan konstruksi.");
        if (filled($p->livelihood_description)) {
            $this->labeled($s, 'Mata Pencaharian Masyarakat Desa', (string) $p->livelihood_description);
        }

        $this->heading($s, 'E. Aksesibilitas Lokasi dan Sekitarnya', 2);
        if (filled($p->accessibility_description)) {
            $this->text($s, (string) $p->accessibility_description);
        } else {
            $this->text($s, "Aksesibilitas menuju lokasi kegiatan di $lokasi dapat ditempuh melalui jalur darat maupun laut.");
        }
        $this->figure($s, 'gambar_aksesibilitas', 'Gambar 12. Peta Aksesibilitas Menuju Lokasi Kegiatan.');
        $this->figure($s, 'peta_pola_ruang', 'Gambar 13. Peta Rencana Pola Ruang Wilayah dan Posisi Lokasi Permohonan.');
    }

    private function kkprlChapterFour(Section $s, KkprlProposal $p): void
    {
        $perusahaan = $this->pv($p, 'company_name');
        $this->heading($s, 'IV. DOKUMEN PERSYARATAN LAINNYA', 1);
        $this->text($s, "Dokumen pendukung untuk permohonan PKKPRL yang diajukan oleh $perusahaan meliputi:");

        $checked = (array) ($p->supporting_documents ?? []);
        if ($checked) {
            foreach ($checked as $key) {
                $label = self::DUKUNG_LABELS[$key] ?? ucfirst(str_replace('_', ' ', (string) $key));
                $s->addListItem($this->esc($label.'.'), 0, ['name' => 'Arial', 'size' => 11]);
            }
        } else {
            foreach ([
                'Sertifikat Kepemilikan Lahan Darat.',
                'Dokumen identitas dan legalitas pemohon/perusahaan.',
                'Dokumentasi survei lapangan kondisi eksisting lokasi.',
                'Peta pendukung (peta lokasi, peta site plan, dan peta pola ruang wilayah).',
            ] as $item) {
                $s->addListItem($this->esc($item), 0, ['name' => 'Arial', 'size' => 11]);
            }
        }

        $this->figure($s, 'sertifikat_lahan', 'Gambar 14. Sertifikat Kepemilikan Lahan Darat.');
        $this->figure($s, 'dok_sosialisasi', 'Gambar 15. Dokumen Hasil Sosialisasi dengan Masyarakat Sekitar.');
        $this->figure($s, 'dok_pendukung_lainnya', 'Gambar 16. Dokumen Pendukung Lainnya.');

        $this->text($s, "Demikian proposal teknis ini disusun sebagai bagian dari kelengkapan administrasi dan teknis permohonan PKKPRL atas nama $perusahaan.", true);
        $this->text($s, 'Catatan: Dokumen ini dibangkitkan otomatis oleh aplikasi e-GeRAI dari data permohonan KKPRL. Mohon verifikasi kembali seluruh data dan gambar sebelum digunakan untuk pengajuan resmi.', true);
    }

    public function create(array $data, string $path, array $images = []): void
    {
        $this->images = $images;
        $word = new PhpWord;
        $word->getSettings()->setThemeFontLang(new Language('id-ID'));
        $section = $word->addSection([
            'marginLeft' => Converter::cmToTwip(2.5),
            'marginRight' => Converter::cmToTwip(2),
            'marginTop' => Converter::cmToTwip(2),
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
        $s->addText($this->esc($text), ['name' => 'Arial', 'size' => 11, 'italic' => $italic], ['alignment' => Jc::BOTH, 'spaceAfter' => 160, 'lineHeight' => 1.25]);
    }

    private function heading(Section $s, string $text, int $level): void
    {
        $sizes = [1 => 15, 2 => 13, 3 => 12];
        $s->addText($this->esc($text), ['name' => 'Arial', 'size' => $sizes[$level], 'bold' => true, 'color' => $level < 3 ? self::NAVY : '000000'], ['spaceBefore' => $level === 1 ? 280 : 200, 'spaceAfter' => $level === 1 ? 160 : 120]);
    }

    private function caption(Section $s, string $text): void
    {
        $s->addText($this->esc($text), ['name' => 'Arial', 'size' => 10, 'italic' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 220]);
    }

    private function missingImage(Section $s, string $label, string $caption): void
    {
        $image = $this->images[$label][0] ?? null;
        if ($image && is_file($image)) {
            $s->addImage($image, ['width' => 500, 'alignment' => Jc::CENTER]);
            $this->caption($s, $caption);

            return;
        }
        // No image available — omit both the placeholder and its caption entirely
        // instead of leaving a dangling/orphaned "Gambar X. ..." label.
    }

    private function cover(Section $s, array $d): void
    {
        $s->addText('PROPOSAL TEKNIS', ['name' => 'Arial', 'size' => 20, 'bold' => true, 'color' => self::NAVY], ['alignment' => Jc::CENTER, 'spaceAfter' => 160]);
        $s->addText('PERMOHONAN PERSETUJUAN KESESUAIAN KEGIATAN'.PHP_EOL.'PEMANFAATAN RUANG LAUT (PKKPRL)', ['name' => 'Arial', 'size' => 14, 'bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 240]);
        $s->addText('Disusun mengacu pada Peraturan Menteri Kelautan dan Perikanan Nomor 28 Tahun 2021 tentang Penyelenggaraan Penataan Ruang Laut', ['name' => 'Arial', 'size' => 10, 'italic' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 400]);
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
        $c = $this->company($d);
        $a = $this->activity($d);
        $loc = $this->location($d);
        $area = $this->area($d);
        $app = $this->v($d, 'applicantName', $this->v($d, 'Nama Pemohon'));
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
        $this->text($s, "Kegiatan $a yang dilakukan oleh $c merupakan kegiatan yang dilaksanakan ".($isReklamasi ? 'dengan reklamasi.' : 'tanpa reklamasi.'));
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
                return $this->formatCoordRow(
                    (string) ($r['no'] ?? $index + 1),
                    (string) ($r['longitude'] ?? $r['lng'] ?? ''),
                    (string) ($r['latitude'] ?? $r['lat'] ?? ''),
                    (string) ($r['keterangan'] ?? $r['note'] ?? '')
                );
            }

            return $this->formatCoordRow((string) ($index + 1), '', '', '');
        }, $coords, array_keys($coords));
        $this->dataTable($s, ['Nomor Titik', 'Longitude', 'Latitude', 'Keterangan'], $formattedCoords);
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
            $s->addListItem($this->esc($item), 0, ['name' => 'Arial', 'size' => 11]);
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
            $left->addText($this->esc($key), ['name' => 'Arial', 'size' => 10.5, 'bold' => true]);
            $right = $table->addCell(5760, ['valign' => VerticalJc::CENTER]);
            $right->addText($this->esc($value), ['name' => 'Arial', 'size' => 10.5]);
        }
    }

    private function dataTable(Section $s, array $headers, array $rows): void
    {
        $table = $s->addTable(['borderSize' => 6, 'borderColor' => '666666', 'cellMarginTop' => 80, 'cellMarginBottom' => 80, 'cellMarginLeft' => 100, 'cellMarginRight' => 100, 'alignment' => JcTable::CENTER]);
        $table->addRow();
        foreach ($headers as $header) {
            $cell = $table->addCell(null, ['bgColor' => self::NAVY, 'valign' => VerticalJc::CENTER]);
            $cell->addText($this->esc($header), ['name' => 'Arial', 'size' => 10, 'bold' => true, 'color' => 'FFFFFF'], ['alignment' => Jc::CENTER]);
        }
        foreach ($rows as $row) {
            $table->addRow();
            foreach ($row as $i => $value) {
                $cell = $table->addCell(null, ['valign' => VerticalJc::CENTER]);
                $cell->addText($this->esc($value), ['name' => 'Arial', 'size' => 10], ['alignment' => $i ? Jc::CENTER : Jc::START]);
            }
        }
    }

    /* ════════════════════════════════════════════════════════════════
     * FAITHFUL 1:1 PORT of the reference e-GeRAI Python app's
     * generate_docx.py `build_document(prop, prop_imgs, lap, lap_imgs, path)`.
     * Operates directly on the same dict/array keys the Python app uses
     * (extract.py / review_fields.py), not on any Eloquent model — this is
     * the generator for the upload-PDF -> review -> finalize pipeline
     * (App\Http\Controllers\EgeraiProposalController).
     * ════════════════════════════════════════════════════════════════ */
    /**
     * $aiFillEnabled controls whether docChapterThree() may call the AI to
     * estimate missing hydro-oceanography/ecosystem-area fields (see
     * hidroOseanografiEstimasi()) — the user-facing "isi dengan AI" checkbox.
     * When false, the AI call is skipped entirely (not just its result
     * discarded) and the existing "[data tidak terdeteksi otomatis]"
     * placeholder is left as-is.
     */
    public function buildDocument(array $prop, array $propImages, array $lap, array $lapImages, string $outputPath, bool $aiFillEnabled = true): void
    {
        $word = $this->buildWord($prop, $propImages, $lap, $lapImages, $aiFillEnabled);
        (new Word2007($word))->save($outputPath);
    }

    /**
     * Renders the exact same document as buildDocument(), but as a
     * self-contained HTML string (images inlined as base64 data URIs) —
     * mirrors the reference Python app's /review page, which builds the real
     * .docx once and converts it with mammoth for a "what you'll get" preview.
     */
    public function renderPreviewHtml(array $prop, array $propImages, array $lap, array $lapImages, bool $aiFillEnabled = true): string
    {
        $word = $this->buildWord($prop, $propImages, $lap, $lapImages, $aiFillEnabled);

        return $this->formatWordHtmlToA4Document((new HTML($word))->getContent());
    }

    /**
     * Converts PhpWord HTML output into a styled multi-page A4 document format,
     * mirroring a 1:1 preview of a Microsoft Word (.docx) file.
     */
    public function formatWordHtmlToA4Document(string $rawHtml): string
    {
        if (preg_match('/<body[^>]*>(.*?)<\/body>/is', $rawHtml, $m)) {
            $bodyContent = $m[1];
        } else {
            $bodyContent = $rawHtml;
        }

        $pages = preg_split(
            '/<div[^>]*page-break-(?:before|after)\s*:\s*always[^>]*>.*?<\/div>|<br[^>]*page-break-(?:before|after)\s*:\s*always[^>]*\/?>/is',
            $bodyContent
        );

        $validPages = [];
        foreach ($pages as $p) {
            $cleaned = trim(strip_tags($p, '<img><svg><table><tr><td><th>'));
            if ($p !== '' && (strlen($cleaned) > 0 || str_contains($p, '<img') || str_contains($p, '<table'))) {
                $validPages[] = $p;
            }
        }

        if (empty($validPages)) {
            $validPages = [$bodyContent];
        }

        $totalPages = count($validPages);
        $pagesHtml = '';

        foreach ($validPages as $idx => $pageContent) {
            $pageNum = $idx + 1;

            $formattedContent = preg_replace_callback(
                '/\[GAMBAR\s+\'([^\']+)\'\s+TIDAK\s+DITEMUKAN\s+DI\s+DOKUMEN\s+SUMBER\]/u',
                function ($matches) {
                    $tag = htmlspecialchars($matches[1], ENT_QUOTES, 'UTF-8');

                    return '<div class="docx-img-placeholder">
                        <svg class="placeholder-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <div class="placeholder-title">Gambar \''.$tag.'\' belum terlampir</div>
                        <div class="placeholder-desc">Gambar akan ditampilkan otomatis setelah berkas pendukung diunggah</div>
                    </div>';
                },
                $pageContent
            );

            $pagesHtml .= '
            <div class="docx-page" id="page-'.$pageNum.'" data-page="'.$pageNum.'">
                <div class="docx-page-header">
                    <span class="header-doc-title">PROPOSAL TEKNIS PKKPRL</span>
                    <span class="header-status">DRAFT PREVIEW (.DOCX)</span>
                </div>
                <div class="docx-page-content">
                    '.$formattedContent.'
                </div>
                <div class="docx-page-footer">
                    <span class="footer-left">Kementerian Kelautan dan Perikanan RI</span>
                    <span class="footer-page-num">Halaman '.$pageNum.' dari '.$totalPages.'</span>
                </div>
            </div>';
        }

        return '<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pratinjau Dokumen Word (.docx)</title>
<style>
:root {
  --docx-bg: #e2e8f0;
  --docx-page-bg: #ffffff;
  --docx-navy: #1F4E79;
  --docx-text: #1e293b;
  --docx-border: #cbd5e1;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background-color: var(--docx-bg);
  font-family: "Arial", "Helvetica", sans-serif;
  color: var(--docx-text);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

.docx-viewer-bg {
  background-color: var(--docx-bg);
  padding: 28px 16px 48px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.docx-page {
  background: var(--docx-page-bg);
  width: 210mm;
  max-width: 100%;
  min-height: 297mm;
  padding: 2.5cm 2cm 2cm 2.5cm;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
  border-radius: 2px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 auto;
}

.docx-page-content {
  flex: 1 1 auto;
}

.docx-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 8.5pt;
  color: #94a3b8;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 6px;
  margin-bottom: 20px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.docx-page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 8.5pt;
  color: #94a3b8;
  border-top: 1px solid #e2e8f0;
  padding-top: 8px;
  margin-top: 24px;
  font-weight: 500;
}

.footer-page-num {
  font-weight: 600;
  color: #64748b;
}

p {
  font-size: 11pt;
  line-height: 1.38;
  margin-top: 0;
  margin-bottom: 6pt;
  color: #1e293b;
  text-align: justify;
}

h1, h2, h3, h4 {
  color: var(--docx-navy);
  font-family: "Arial", "Helvetica", sans-serif;
  margin-top: 14pt;
  margin-bottom: 6pt;
  font-weight: bold;
}

table {
  width: 100% !important;
  border-collapse: collapse !important;
  margin: 10pt 0 14pt 0 !important;
  font-size: 10pt !important;
}

td, th {
  padding: 6pt 9pt !important;
  border: 1px solid var(--docx-border) !important;
  vertical-align: middle !important;
  line-height: 1.3 !important;
}

td[bgcolor="#1F4E79"], th[bgcolor="#1F4E79"], th {
  background-color: var(--docx-navy) !important;
  color: #ffffff !important;
  font-weight: bold !important;
  text-align: center !important;
  border-color: #143756 !important;
}

tr:nth-child(even) td:not([bgcolor]) {
  background-color: #f8fafc;
}

.docx-page[data-page="1"] table {
  margin-top: 16pt !important;
  background-color: #ffffff;
}

.docx-page[data-page="1"] td:first-child {
  font-weight: 600;
  width: 36%;
  color: #334155;
  background-color: #f8fafc;
}

img {
  max-width: 100% !important;
  height: auto !important;
  display: block;
  margin: 12px auto;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.docx-img-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
  text-align: center;
}
.placeholder-icon {
  margin-bottom: 6px;
}
.placeholder-title {
  font-size: 9.5pt;
  font-weight: 700;
  color: #475569;
}
.placeholder-desc {
  font-size: 8pt;
  color: #94a3b8;
  margin-top: 2px;
}

@media print {
  body, .docx-viewer-bg {
    background: #ffffff !important;
    padding: 0 !important;
  }
  .docx-page {
    box-shadow: none !important;
    border: none !important;
    width: 100% !important;
    min-height: auto !important;
    page-break-after: always;
    padding: 0 !important;
  }
}
</style>
</head>
<body>
<div class="docx-viewer-bg">
'.$pagesHtml.'
</div>
</body>
</html>';
    }

    private function buildWord(array $prop, array $propImages, array $lap, array $lapImages, bool $aiFillEnabled = true): PhpWord
    {
        $this->images = $propImages + $lapImages;
        $this->pendingReferences = [];

        $word = new PhpWord;
        $word->getSettings()->setThemeFontLang(new Language('id-ID'));
        $section = $word->addSection([
            'marginLeft' => Converter::cmToTwip(2.5),
            'marginRight' => Converter::cmToTwip(2),
            'marginTop' => Converter::cmToTwip(2),
            'marginBottom' => Converter::cmToTwip(2),
        ]);

        $locationParts = $prop['_lokasi_parts'] ?? [];
        $desa = $locationParts[0] ?? self::MISSING;
        $kecamatan = $locationParts[1] ?? self::MISSING;
        $kabupaten = $locationParts[2] ?? self::MISSING;
        $provinsi = $locationParts[3] ?? self::MISSING;
        $lokasi = "Desa $desa, Kecamatan $kecamatan, $kabupaten, Provinsi $provinsi";

        $perusahaan = $this->g($prop, 'Nama Perusahaan/Instansi');
        $perairan = $this->g($prop, 'Nama Perairan');
        $luas = $this->formatLuasHa($this->g($prop, 'Luas Kebutuhan Ruang'));
        $jenis = $this->g($prop, 'Jenis Kegiatan');

        $this->docCover($section, $prop, $lokasi, $luas);
        $section->addPageBreak();
        $this->docChapterOne($section, $prop, $lap, $lokasi, $perusahaan, $perairan, $luas, $jenis);
        $section->addPageBreak();
        $this->docChapterTwo($section, $prop, $lokasi, $perusahaan, $perairan, $jenis);
        $section->addPageBreak();
        $this->docChapterThree($section, $prop, $lap, $lokasi, $desa, $aiFillEnabled);
        $section->addPageBreak();
        $this->docChapterFour($section, $perusahaan, $prop);
        $this->renderPendingReferences($section);

        return $word;
    }

    /** Mirrors extract.py/generate_docx.py's `g(d, key, default=NA)`. */
    private function g(array $d, string $key, ?string $default = null): string
    {
        $value = $d[$key] ?? null;
        $value = is_bool($value) ? ($value ? '1' : '') : trim((string) $value);

        return $value !== '' ? $value : ($default ?? self::MISSING);
    }

    /**
     * Same lookup as g(), but returns null instead of the self::MISSING
     * placeholder when the value is absent. Used when building a narrative
     * sentence out of several optional data points: a missing point should
     * simply be omitted from the sentence (never leave a "[data tidak
     * terdeteksi otomatis]" placeholder embedded in running prose) — unlike
     * data TABLES, which intentionally keep the placeholder in each cell as a
     * visible "needs manual completion" flag.
     */
    private function gOrNull(array $d, string $key): ?string
    {
        $value = $d[$key] ?? null;
        $value = is_bool($value) ? ($value ? '1' : '') : trim((string) $value);

        return $value !== '' ? $value : null;
    }

    /**
     * Joins present (non-null/non-empty) descriptive clause fragments into one
     * natural Indonesian sentence fragment — comma-separated, with "serta"
     * before the final clause when there is more than one — so a sentence
     * built from several optional data points reads naturally regardless of
     * which points are actually available. Returns '' when every clause was
     * missing, so the caller can omit the whole sentence instead of showing
     * an empty/nonsensical one.
     */
    private function joinFacts(array $clauses, string $lastConnector = 'serta'): string
    {
        $clauses = array_values(array_filter($clauses, fn ($c) => filled($c)));
        if (! $clauses) {
            return '';
        }
        if (count($clauses) === 1) {
            return $clauses[0];
        }
        $last = array_pop($clauses);

        return implode(', ', $clauses).' '.$lastConnector.' '.$last;
    }

    /** Mirrors generate_docx.py's `format_luas_ha()`. */
    private function formatLuasHa(string $value): string
    {
        if ($value === '' || $value === self::MISSING) {
            return $value;
        }

        return preg_match('/^-?[\d.,]+$/', $value) ? "$value Ha" : $value;
    }

    /** Mirrors generate_docx.py's `klasifikasi_karang()`. */
    private function klasifikasiKarang(string $persenStr): string
    {
        $v = (float) str_replace([',', '%'], ['.', ''], trim($persenStr));
        if ($persenStr === '' || $persenStr === self::MISSING) {
            return '';
        }
        if ($v >= 75) {
            return 'Baik Sekali';
        }
        if ($v >= 50) {
            return 'Baik';
        }
        if ($v >= 25) {
            return 'Sedang';
        }

        return 'Buruk';
    }

    private function docCover(Section $s, array $prop, string $lokasi, string $luas): void
    {
        $s->addText('PROPOSAL TEKNIS', ['name' => 'Arial', 'size' => 20, 'bold' => true, 'color' => self::NAVY], ['alignment' => Jc::CENTER, 'spaceAfter' => 160]);
        $s->addText('PERMOHONAN PERSETUJUAN KESESUAIAN KEGIATAN'.PHP_EOL.'PEMANFAATAN RUANG LAUT (PKKPRL)', ['name' => 'Arial', 'size' => 14, 'bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 240]);
        $s->addText('Disusun mengacu pada Peraturan Menteri Kelautan dan Perikanan Nomor 28 Tahun 2021 tentang Penyelenggaraan Penataan Ruang Laut', ['name' => 'Arial', 'size' => 10, 'italic' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 400]);
        $this->keyValueTable($s, [
            ['Nama Pemohon', $this->g($prop, 'Nama Pemohon')],
            ['Jabatan Pemohon', $this->g($prop, 'Jabatan Pemohon')],
            ['Nama Perusahaan/Instansi', $this->g($prop, 'Nama Perusahaan/Instansi')],
            ['NIB', $this->g($prop, 'NIB')],
            ['NPWP', $this->g($prop, 'NPWP')],
            ['Nomor Telepon Selular', $this->g($prop, 'Nomor Telepon Selular')],
            ['Surat Elektronik', $this->g($prop, 'Surat Elektronik')],
            ['Jenis Kegiatan', $this->g($prop, 'Jenis Kegiatan')],
            ['Lokasi Kegiatan', $lokasi],
            ['Nama Perairan', $this->g($prop, 'Nama Perairan')],
            ['Luas Kebutuhan Ruang', $luas],
            ['KBLI', $this->g($prop, 'KBLI')],
            ['Tanggal Penyusunan', $this->g($prop, 'Tanggal Penyusunan', now()->translatedFormat('j F Y'))],
        ]);
    }

    private function docChapterOne(Section $s, array $prop, array $lap, string $lokasi, string $perusahaan, string $perairan, string $luas, string $jenis): void
    {
        $this->heading($s, 'I. RENCANA BANGUNAN DAN INSTALASI LAUT', 1);
        $this->heading($s, 'Pendahuluan', 2);
        $this->text($s, 'Proposal teknis ini disusun sebagai bagian dari persyaratan permohonan Persetujuan Kesesuaian Kegiatan Pemanfaatan Ruang Laut (PKKPRL), sebagaimana diatur dalam Peraturan Pemerintah Nomor 21 Tahun 2021 tentang Penyelenggaraan Penataan Ruang, Peraturan Menteri Kelautan dan Perikanan Nomor 28 Tahun 2021 tentang Penyelenggaraan Penataan Ruang Laut, serta ketentuan pelaksanaan pada sistem OSS Berbasis Risiko.');
        $this->text($s, "$perusahaan yang diwakili oleh {$this->g($prop, 'Nama Pemohon')} berencana menyelenggarakan kegiatan berusaha berupa $jenis. Rencana kegiatan ini berlokasi di $lokasi, menggunakan perairan $perairan dengan total kebutuhan luas ruang laut yang dimohonkan sebesar $luas.");

        $this->heading($s, 'A. Rencana Kegiatan Utama dan Penunjang', 2);
        $this->heading($s, '1. Uraian Kegiatan', 3);
        $this->text($s, "Kegiatan yang dimohonkan adalah $jenis, dengan kebutuhan ruang laut seluas $luas.");
        foreach ([
            'Deskripsi Kegiatan' => $prop['deskripsi_kegiatan'] ?? null,
            'Manfaat Kegiatan' => $prop['manfaat_kegiatan'] ?? null,
            'Tujuan Kegiatan' => $prop['tujuan_kegiatan'] ?? null,
        ] as $label => $value) {
            if (filled($value)) {
                $this->labeled($s, $label, (string) $value);
            }
        }

        $invest = $this->g($prop, 'investasi');
        $investStr = $invest !== self::MISSING ? "Rp$invest" : self::MISSING;
        $tenaga = $this->g($prop, 'tenaga_kerja');
        $tenagaAsing = $this->g($prop, 'tenaga_kerja_asing', '0');
        $this->text($s, "Rencana tenaga kerja yang digunakan berjumlah $tenaga orang WNI/lokal, dengan tenaga kerja asing berjumlah $tenagaAsing. Total komitmen pendanaan investasi kegiatan ini sebesar $investStr, mencakup perencanaan teknis, pengadaan sarana-prasarana, operasional, serta pengelolaan lingkungan hidup.");

        $instalasiBangunan = (string) ($prop['instalasi_bangunan'] ?? '');
        $instalasiPosisi = (string) ($prop['instalasi_posisi'] ?? '');
        if ($instalasiBangunan !== '' || $instalasiPosisi !== '') {
            $posisiTxt = $instalasiPosisi !== '' ? ', berada pada '.mb_strtolower($instalasiPosisi) : '';
            $bangunanTxt = $instalasiBangunan !== '' ? $instalasiBangunan : 'instalasi penunjang kegiatan';
            $this->text($s, "Instalasi bangunan menetap di laut yang direncanakan berupa $bangunanTxt$posisiTxt.");
        }

        $dukung = (string) ($prop['dokumen_data_dukung'] ?? '');
        if ($dukung !== '') {
            $this->text($s, "Dokumen data dukung yang telah dimiliki oleh pelaku usaha meliputi: $dukung.");
        }

        $this->heading($s, '2. Kegiatan Eksisting atau Rencana yang Akan Dimohonkan', 3);
        $statusMap = [
            'Eksisting' => 'merupakan kegiatan yang sudah berjalan (eksisting)',
            'Rencana' => 'merupakan kegiatan yang baru akan direncanakan',
            'Eksisting dan Pengembangan' => 'merupakan kegiatan eksisting yang akan dikembangkan lebih lanjut',
        ];
        $statusTxt = $statusMap[$prop['kegiatan_status'] ?? ''] ?? '';
        $statusSentence = $statusTxt !== '' ? " Kegiatan ini $statusTxt." : '';
        $this->text($s, "Kegiatan rencana yang dimohonkan adalah $jenis yang berada di $lokasi, menggunakan perairan $perairan dengan total kebutuhan luas ruang laut sebesar $luas.$statusSentence Pengajuan PKKPRL dilakukan dalam rangka pemenuhan perizinan dasar di lokasi yang dimohonkan sebelum mengajukan perizinan lanjutan.");
        $this->figure($s, 'siteplan', "Gambar 1. Peta Rencana Tapak (Site Plan) Kegiatan $perusahaan.", 13);

        $this->heading($s, '3. Rencana Jadwal Pelaksanaan Kegiatan Utama dan Pendukungnya', 3);
        $jadwalText = (string) ($prop['jadwal_kegiatan'] ?? '');
        $activities = $this->parseJadwal($jadwalText);
        if ($activities) {
            $bangunanTxt2 = $instalasiBangunan !== '' ? $instalasiBangunan : 'instalasi penunjang kegiatan';
            $posisiTxt2 = $instalasiPosisi !== '' ? ' yang berada di '.mb_strtolower($instalasiPosisi) : '';
            $this->text($s, "Adapun kegiatan utama yang akan dilakukan ialah pembangunan dan pengembangan lokasi $jenis akan dilakukan sebagaimana ditampilkan pada Tabel 1. Seluruh bangunan merupakan $bangunanTxt2$posisiTxt2.");
            $startDate = $this->parseTanggalIndonesia($this->g($prop, 'Tanggal Penyusunan'));
            $this->ganttTable($s, $activities, $startDate[0] ?? (int) now()->format('n'), $startDate[1] ?? (int) now()->format('Y'));
            $this->caption($s, 'Tabel 1. Rencana Jadwal Pelaksanaan Kegiatan Utama dan Pendukungnya.');
        } elseif ($jadwalText !== '') {
            $this->labeled($s, 'Jadwal Kegiatan', $jadwalText);
        } else {
            $this->text($s, self::MISSING);
        }

        $this->heading($s, '4. Reklamasi / Non-Reklamasi', 3);
        if (! empty($prop['non_reklamasi'])) {
            $reklamasiTxt = 'tanpa reklamasi';
        } elseif (! empty($prop['reklamasi'])) {
            $reklamasiTxt = 'dengan reklamasi';
        } else {
            $reklamasiTxt = self::MISSING;
        }
        $this->text($s, "Kegiatan $jenis yang dilakukan oleh $perusahaan merupakan kegiatan yang dilaksanakan $reklamasiTxt.");

        $this->heading($s, 'B. Kegiatan Berusaha atau Non-Berusaha', 2);
        if (! empty($prop['kegiatan_berusaha'])) {
            $berusahaTxt = 'kegiatan berusaha';
        } elseif (! empty($prop['non_berusaha'])) {
            $berusahaTxt = 'kegiatan non-berusaha';
        } else {
            $berusahaTxt = self::MISSING;
        }
        $this->text($s, "Kegiatan $jenis yang dilakukan $perusahaan di $lokasi, yang menggunakan perairan $perairan, merupakan $berusahaTxt.");

        $this->heading($s, 'C. Kegiatan Strategis Nasional atau Nonstrategis Nasional', 2);
        $strategisTxt = ! empty($prop['non_strategis']) ? 'kegiatan non-strategis nasional/dasar' : 'kegiatan strategis nasional';
        $this->text($s, "Rencana kegiatan pemanfaatan ruang laut ini tergolong sebagai $strategisTxt. Penetapan status ini digunakan sebagai acuan untuk memenuhi persyaratan teknis permohonan PKKPRL.");

        $this->heading($s, 'D. Peta Lokasi', 2);
        $koordinat = $prop['koordinat'] ?? [];
        if ($koordinat) {
            $this->text($s, 'Peta lokasi/plotting batas-batas area yang dimohonkan PKKPRL ditunjukkan oleh titik koordinat berikut:');
            $this->dataTable($s, ['Nomor Titik', 'Longitude', 'Latitude', 'Keterangan'], array_map(
                fn ($row) => $this->formatCoordRow($row[0] ?? '', $row[1] ?? '', $row[2] ?? '', $row[3] ?? ''),
                $koordinat
            ));
            $this->caption($s, 'Tabel 1. Titik Koordinat Batas Area Permohonan PKKPRL.');
        } else {
            $this->text($s, self::MISSING);
        }
        $this->figure($s, 'peta_lokasi', 'Gambar 2. Peta Lokasi dan Sebaran Titik Koordinat Rencana Kegiatan.', 11);
        $sumberPeta = (string) ($prop['sumber_peta'] ?? '');
        if ($sumberPeta !== '') {
            $this->caption($s, 'Sumber Peta: '.$sumberPeta);
        }

        $this->heading($s, 'E. Deskripsi Luas/Panjang yang Dibutuhkan', 2);
        $this->text($s, "Luas perairan yang dimohonkan KKPRL adalah seluas $luas yang terletak di perairan $perairan, $lokasi.");
    }

    private function docChapterTwo(Section $s, array $prop, string $lokasi, string $perusahaan, string $perairan, string $jenis): void
    {
        $this->heading($s, 'II. INFORMASI PEMANFAATAN RUANG LAUT', 1);
        $this->text($s, "Berdasarkan hasil identifikasi, pemanfaatan ruang laut eksisting di sekitar lokasi kegiatan $jenis dari $perusahaan termasuk dalam wilayah perairan $perairan, pada administrasi $lokasi.");
        $this->text($s, 'Berdasarkan hasil survei/pengamatan langsung, tidak terdapat pemanfaatan ruang laut oleh pihak lain di sekitar lokasi permohonan. Rencana kegiatan disusun dengan memperhatikan kepentingan nelayan tradisional dan masyarakat, serta tidak menghalangi akses pelayaran yang sudah ada.');

        $batas = [
            'utara' => (string) ($prop['batas_utara'] ?? ''),
            'timur' => (string) ($prop['batas_timur'] ?? ''),
            'selatan' => (string) ($prop['batas_selatan'] ?? ''),
            'barat' => (string) ($prop['batas_barat'] ?? ''),
        ];
        if (array_filter($batas)) {
            $kalimat = ['Pemanfaatan ruang laut di sekitar lokasi permohonan didominasi oleh aktivitas penangkapan ikan skala kecil di seluruh penjuru arah mata angin.'];
            if ($batas['utara'] !== '') {
                $kalimat[] = "Di sebelah utara, lokasi berbatasan dengan {$batas['utara']}.";
            }
            if ($batas['timur'] !== '') {
                $kalimat[] = "Pada sisi timur, kawasan berbatasan dengan {$batas['timur']}.";
            }
            if ($batas['selatan'] !== '') {
                $kalimat[] = "Sementara itu, di sebelah selatan terdapat {$batas['selatan']}.";
            }
            if ($batas['barat'] !== '') {
                $kalimat[] = "Di sebelah barat berbatasan dengan {$batas['barat']}.";
            }
            $this->text($s, implode(' ', $kalimat));
        }

        $deskripsiSekitar = (string) ($prop['deskripsi_pemanfaatan_sekitar'] ?? '');
        if ($deskripsiSekitar !== '') {
            $this->text($s, $deskripsiSekitar);
        }

        $this->figure($s, 'foto_pantai', 'Gambar 3. Kondisi Eksisting Perairan dan Garis Pantai di Sekitar Lokasi Permohonan.', 11);
    }

    private function docChapterThree(Section $s, array $prop, array $lap, string $lokasi, string $desa, bool $aiFillEnabled = true): void
    {
        $this->heading($s, 'III. DATA KONDISI TERKINI LOKASI DAN SEKITARNYA', 1);

        // The "Laporan Hidro-Oseanografi" survey document is optional and often
        // never uploaded — fill whichever gelombang/arus/pasut/batimetri/luas-
        // ekosistem fields are still missing with an AI-researched, source-cited
        // regional estimate instead of leaving a bare "data tidak terdeteksi"
        // placeholder. Only ever fills gaps; real extracted/measured values in
        // $lap always take precedence and are never overwritten. Skipped
        // entirely (no AI call at all) when the user unchecks "isi dengan AI".
        $hidro = $aiFillEnabled ? $this->hidroOseanografiEstimasi($prop, $lap, $lokasi) : [];
        $hidroUsedKeys = [];
        foreach (($hidro['values'] ?? []) as $key => $value) {
            if (filled($value) && blank($lap[$key] ?? null)) {
                $lap[$key] = $value;
                $hidroUsedKeys[] = $key;
            }
        }

        // Detailed, source-cited AI narrative (3-4 paragraphs per subsection)
        // grounded strictly in the DATA FAKTUAL below — replaces the short
        // one-sentence template text when available. See ekosistemNarasiDoc().
        $ai = $this->ekosistemNarasiDoc($prop, $lokasi);

        $this->heading($s, 'A. Ekosistem Sekitar', 2);
        $this->heading($s, '1. Mangrove', 3);
        // Detect "has data" from the actual extracted/filled species value first —
        // the companion mangrove_ada flag is only reliably set by the manual-entry
        // form; automatic PDF/DOCX extraction rarely populates it, so gating solely
        // on that flag hid real, already-extracted species data ("not detected
        // despite data being present").
        $mangroveHasData = self::hasEcosystemData($prop, 'mangrove_spesies', 'mangrove_ada', 'Terdapat ekosistem mangrove');
        $mangroveExplicitlyAbsent = ($prop['mangrove_ada'] ?? null) === 'Tidak terdapat ekosistem mangrove';
        if (filled($ai['mangrove'] ?? null)) {
            $this->text($s, $ai['mangrove']);
        } elseif ($mangroveExplicitlyAbsent && ! $mangroveHasData) {
            $this->text($s, 'Berdasarkan hasil pengamatan langsung kondisi pesisir di sekitar lokasi kegiatan, tidak teridentifikasi keberadaan ekosistem mangrove pada area yang dimohonkan.');
        } else {
            // Omit whichever of species/persen/kondisi wasn't actually supplied,
            // instead of embedding a "[data tidak terdeteksi otomatis]"
            // placeholder in the middle of the sentence.
            $spesies = $this->gOrNull($prop, 'mangrove_spesies');
            $persen = $this->gOrNull($prop, 'mangrove_persen');
            $kondisi = $this->gOrNull($prop, 'mangrove_kondisi');
            $facts = $this->joinFacts([
                $spesies ? "didominasi oleh jenis $spesies" : null,
                $persen ? "persentase tutupan mencapai $persen%" : null,
                $kondisi ? "berada pada kondisi $kondisi" : null,
            ]);
            $this->text($s, $facts !== ''
                ? "Berdasarkan hasil pengamatan langsung kondisi pesisir di sekitar lokasi kegiatan, terdapat ekosistem mangrove yang $facts."
                : 'Berdasarkan hasil pengamatan langsung kondisi pesisir di sekitar lokasi kegiatan, terdapat ekosistem mangrove pada area yang dimohonkan.');
        }
        $this->figure($s, 'foto_mangrove', 'Gambar 4. Kondisi Tutupan Vegetasi Mangrove di Sekitar Lokasi Kegiatan.', 11);

        $this->heading($s, '2. Lamun', 3);
        $adaLamun = ! empty($lap['ada_lamun']);
        $jarakEko = $this->g($lap, 'eko_jarak_terdekat_km');
        if ($adaLamun) {
            $this->text($s, "Berdasarkan data sekunder hasil pengamatan lapangan awal, tidak teridentifikasi keberadaan ekosistem lamun (seagrass) secara langsung pada titik pengambilan sampel di area yang dimohonkan. Namun demikian, berdasarkan analisis spasial basis data ekosistem nasional, ekosistem padang lamun teridentifikasi berada di sekitar lokasi, dengan jarak ekosistem terdekat dari titik pusat rencana kegiatan sekitar $jarakEko km. Disarankan verifikasi lapangan lanjutan untuk memastikan keberadaan dan luasan ekosistem lamun secara lebih akurat.");
        } else {
            $this->text($s, 'Berdasarkan data sekunder perairan di sekitar lokasi kegiatan, tidak teridentifikasi keberadaan ekosistem lamun (seagrass) pada area yang dimohonkan.');
        }
        // Same fix as mangrove above: show real lamun data whenever species text is
        // actually present, instead of requiring the exact lamun_ada_manual string
        // (which automatic extraction never sets).
        $lamunHasData = self::hasEcosystemData($prop, 'lamun_spesies', 'lamun_ada_manual', 'Terdapat ekosistem lamun');
        if (filled($ai['lamun'] ?? null)) {
            $this->text($s, $ai['lamun']);
            if ($lamunHasData) {
                $this->figure($s, 'foto_lamun', 'Gambar 5. Dokumentasi Ekosistem Lamun di Sekitar Lokasi Kegiatan.', 11);
            }
        } elseif ($lamunHasData) {
            $lSpesies = $this->gOrNull($prop, 'lamun_spesies');
            $lPersen = $this->gOrNull($prop, 'lamun_persen');
            $lKondisi = $this->gOrNull($prop, 'lamun_kondisi');
            $lFacts = $this->joinFacts([
                $lSpesies ? "didominasi oleh jenis $lSpesies" : null,
                $lPersen ? "persentase tutupan mencapai $lPersen%" : null,
                $lKondisi ? "berada pada kondisi $lKondisi" : null,
            ]);
            $this->text($s, $lFacts !== ''
                ? "Berdasarkan hasil pengamatan pemohon di lapangan, teridentifikasi ekosistem lamun yang $lFacts."
                : 'Berdasarkan hasil pengamatan pemohon di lapangan, teridentifikasi ekosistem lamun pada area yang dimohonkan.');
            $this->figure($s, 'foto_lamun', 'Gambar 5. Dokumentasi Ekosistem Lamun di Sekitar Lokasi Kegiatan.', 11);
        }

        $this->heading($s, '3. Terumbu Karang', 3);
        // For the narrative paragraph: pull raw (possibly-null) values so any
        // still-missing area/percentage is simply left out of the sentence.
        // $karangHa/$karangPct/etc. below (self::MISSING-defaulted) are kept
        // separately for Tabel 2, which must still show the placeholder in
        // its cells.
        $karangHaN = $this->gOrNull($lap, 'eko_karang_ha');
        $karangPctN = $this->gOrNull($lap, 'eko_karang_pct');
        $lainnyaHaN = $this->gOrNull($lap, 'eko_lainnya_ha');
        $lainnyaPctN = $this->gOrNull($lap, 'eko_lainnya_pct');
        $terbukaHaN = $this->gOrNull($lap, 'eko_terbuka_ha');
        $terbukaPctN = $this->gOrNull($lap, 'eko_terbuka_pct');
        $totalHaN = $this->gOrNull($lap, 'eko_total_ha');
        $areaClause = function (?string $ha, ?string $pct, string $label): ?string {
            if ($ha === null && $pct === null) {
                return null;
            }
            $amount = trim(($ha !== null ? "$ha Ha" : '').($pct !== null ? " ($pct%)" : ''));

            return "$label seluas $amount";
        };
        $areaFacts = $this->joinFacts([
            $areaClause($karangHaN, $karangPctN, 'tutupan terumbu karang tercatat'),
            $areaClause($lainnyaHaN, $lainnyaPctN, 'substrat dasar non-terumbu'),
            $areaClause($terbukaHaN, $terbukaPctN, 'area laut terbuka tanpa ekosistem'),
        ]);
        $intro = 'Hasil survei in-situ pada perairan di sekitar lokasi menunjukkan dijumpainya koloni terumbu karang pada beberapa titik substrat berbatu.';
        if ($areaFacts !== '') {
            $totalClause = $totalHaN !== null ? " dari total area kajian seluas $totalHaN Ha," : '';
            $this->text($s, "$intro Berdasarkan analisis spasial basis data ekosistem,$totalClause $areaFacts.");
        } else {
            $this->text($s, $intro);
        }
        $karangHa = $this->g($lap, 'eko_karang_ha');
        $karangPct = $this->g($lap, 'eko_karang_pct');
        $lainnyaHa = $this->g($lap, 'eko_lainnya_ha');
        $lainnyaPct = $this->g($lap, 'eko_lainnya_pct');
        $terbukaHa = $this->g($lap, 'eko_terbuka_ha');
        $terbukaPct = $this->g($lap, 'eko_terbuka_pct');
        $totalHa = $this->g($lap, 'eko_total_ha');
        $kondisiKarangLap = $this->klasifikasiKarang($karangPct);
        if ($kondisiKarangLap !== '') {
            $this->text($s, "Berdasarkan kriteria baku kerusakan terumbu karang, persentase tutupan sebesar $karangPct% tersebut tergolong pada kategori kondisi \u{201c}$kondisiKarangLap\u{201d}.");
        }
        $this->dataTable($s, ['Jenis Tutupan', 'Luas (Ha)', 'Persentase (%)'], [
            ['Terumbu Karang', $karangHa, $karangPct],
            ['Lainnya (substrat dasar non-terumbu)', $lainnyaHa, $lainnyaPct],
            ['Area Laut Terbuka (tanpa ekosistem)', $terbukaHa, $terbukaPct],
            ['Total Area Kajian', $totalHa, '100,0'],
        ]);
        $this->caption($s, 'Tabel 2. Rincian Tutupan Ekosistem pada Area Kajian Spasial di Sekitar Titik Pusat Rencana Kegiatan.');

        // Same fix as mangrove/lamun: prefer the actual extracted species data over
        // the exact karang_ada string, which automatic extraction never sets.
        $karangHasData = self::hasEcosystemData($prop, 'karang_spesies', 'karang_ada', 'Terdapat ekosistem terumbu karang');
        if (filled($ai['karang'] ?? null)) {
            $this->text($s, $ai['karang']);
        } elseif ($karangHasData) {
            $kSpesies = $this->gOrNull($prop, 'karang_spesies');
            $kPersen = $this->gOrNull($prop, 'karang_persen_manual');
            $kKondisi = $this->gOrNull($prop, 'karang_kondisi');
            $kFacts = $this->joinFacts([
                $kSpesies ? "didominasi oleh jenis $kSpesies" : null,
                $kPersen ? "persentase tutupan mencapai $kPersen%" : null,
                $kKondisi ? "berada pada kondisi $kKondisi" : null,
            ]);
            $this->text($s, $kFacts !== ''
                ? "Berdasarkan hasil pengamatan pemohon di lapangan, teridentifikasi ekosistem terumbu karang yang $kFacts."
                : 'Berdasarkan hasil pengamatan pemohon di lapangan, teridentifikasi ekosistem terumbu karang pada area yang dimohonkan.');
        } elseif (($prop['karang_ada'] ?? null) === 'Tidak terdapat ekosistem terumbu karang') {
            $this->text($s, 'Berdasarkan hasil pengamatan pemohon di lapangan, tidak teridentifikasi keberadaan ekosistem terumbu karang secara langsung pada area yang dimohonkan.');
        }
        $this->figure($s, 'foto_karang_insitu', 'Gambar 6. Dokumentasi Survei In-Situ Koloni Terumbu Karang di Perairan Sekitar Lokasi Kegiatan.', 11);
        $this->figure($s, 'peta_ekosistem', 'Gambar 7. Peta Sebaran Spasial Ekosistem Pesisir di Sekitar Titik Pusat Rencana Kegiatan.', 11);
        $jarakEkoN = $this->gOrNull($lap, 'eko_jarak_terdekat_km');
        if (filled($ai['ringkasan'] ?? null)) {
            $this->text($s, $ai['ringkasan']);
        } else {
            $jarakClause = $jarakEkoN !== null ? "Jarak ekosistem terdekat dari titik pusat rencana kegiatan adalah $jarakEkoN km, sehingga mitigasi" : 'Mitigasi';
            $this->text($s, "$jarakClause dampak perlu difokuskan pada upaya penghindaran (avoidance) terhadap area terumbu karang, pengendalian sedimen, serta pengelolaan kualitas air.");
        }
        $narasiEko = $lap['_narasi']['ekosistem'] ?? null;
        if ($narasiEko) {
            $this->text($s, $narasiEko);
        }

        // Printed on the document's literal last page (LAMPIRAN: SUMBER
        // REFERENSI, after Chapter IV) instead of here — see queueReference().
        $this->queueReference(
            'Sumber Referensi Konteks Ekosistem',
            'Narasi kondisi ekosistem pesisir pada Bab III di atas disusun dengan mempertimbangkan konteks ekologis regional dari sumber daring resmi/ilmiah berikut, yang diakses secara langsung oleh asisten AI pada saat penyusunan dokumen ini:',
            $ai['sumber'] ?? []
        );

        $this->heading($s, 'B. Hidro-Oseanografi', 2);
        $narasi = $lap['_narasi'] ?? [];
        $this->heading($s, '1. Gelombang', 3);
        // Below: gOrNull()-sourced facts are only assembled into a sentence when
        // at least one is actually present, so a still-missing parameter is
        // simply left out of the narrative (never shown as a placeholder in
        // running prose) — Tabel 3 further down still shows every parameter's
        // cell, placeholder included, since tables must stay complete.
        $hsRata = $this->gOrNull($lap, 'hs_rata');
        $hsMaks = $this->gOrNull($lap, 'hs_maks');
        $hsArah = $this->gOrNull($lap, 'hs_arah');
        $gelombangFacts = $this->joinFacts([
            $hsRata ? "tinggi gelombang signifikan (Hs) rata-rata tercatat sebesar $hsRata meter" : null,
            $hsMaks ? "Hs maksimum ekstrem tercatat sebesar $hsMaks meter" : null,
            $hsArah ? "arah dominan dari {$hsArah}°" : null,
        ]);
        if ($gelombangFacts !== '') {
            $this->text($s, ucfirst($gelombangFacts).'.');
        }
        $this->text($s, 'Parameter ini menjadi acuan utama dalam desain ketahanan struktur bangunan laut terhadap beban gelombang ekstrem.');
        if (! empty($narasi['gelombang'])) {
            $this->text($s, $narasi['gelombang']);
        }
        $mawarGelombangCaption = $hsArah !== null
            ? "Gambar 8. Mawar Gelombang Ekstrem pada Titik Pusat Rencana Kegiatan (Arah Dominan {$hsArah}°)."
            : 'Gambar 8. Mawar Gelombang Ekstrem pada Titik Pusat Rencana Kegiatan.';
        $this->figure($s, 'mawar_gelombang', $mawarGelombangCaption, 9);

        $this->heading($s, '2. Arus', 3);
        $arusRata = $this->gOrNull($lap, 'arus_rata');
        $arusMaks = $this->gOrNull($lap, 'arus_maks');
        $arusArah = $this->gOrNull($lap, 'arus_arah');
        $arusFacts = $this->joinFacts([
            $arusRata ? "kecepatan arus rata-rata tercatat sebesar $arusRata m/detik" : null,
            $arusMaks ? "kecepatan maksimum ekstrem sebesar $arusMaks m/detik" : null,
            $arusArah ? "arah dominan dari {$arusArah}°" : null,
        ]);
        if ($arusFacts !== '') {
            $this->text($s, ucfirst($arusFacts).'.');
        }
        $this->text($s, 'Parameter ini menjadi indikator potensi gerusan (scouring) di sekitar struktur bangunan laut.');
        if (! empty($narasi['arus'])) {
            $this->text($s, $narasi['arus']);
        }
        $mawarArusCaption = $arusArah !== null
            ? "Gambar 9. Mawar Arus pada Titik Pusat Rencana Kegiatan (Arah Dominan {$arusArah}°)."
            : 'Gambar 9. Mawar Arus pada Titik Pusat Rencana Kegiatan.';
        $this->figure($s, 'mawar_arus', $mawarArusCaption, 9);

        $this->dataTable($s, ['Parameter', 'Nilai Rata-rata', 'Nilai Ekstrem', 'Arah Dominan'], [
            ['Tinggi Gelombang Signifikan (Hs)', "{$this->g($lap, 'hs_rata')} m", "{$this->g($lap, 'hs_maks')} m", "{$this->g($lap, 'hs_arah')}°"],
            ['Kecepatan Arus', "{$this->g($lap, 'arus_rata')} m/detik", "{$this->g($lap, 'arus_maks')} m/detik", "{$this->g($lap, 'arus_arah')}°"],
        ]);
        $this->caption($s, 'Tabel 3. Ringkasan Parameter Gelombang dan Arus pada Titik Pusat Rencana Kegiatan.');

        $this->heading($s, '3. Pasang Surut', 3);
        $tipePasut = $this->gOrNull($lap, 'tipe_pasut');
        $formzahl = $this->gOrNull($lap, 'formzahl');
        $tidalRange = $this->gOrNull($lap, 'tidal_range');
        $hat = $this->gOrNull($lap, 'hat');
        $latN = $this->gOrNull($lap, 'lat');
        $pasutFacts = $this->joinFacts([
            $tipePasut ? "memiliki tipe pasang surut $tipePasut" : null,
            $formzahl ? "Bilangan Formzahl sebesar $formzahl" : null,
            $tidalRange ? "tunggang air (tidal range) sebesar $tidalRange meter" : null,
            $hat ? "elevasi tertinggi (HAT) sebesar +$hat meter" : null,
            $latN ? "elevasi terendah (LAT) sebesar $latN meter" : null,
        ]);
        if ($pasutFacts !== '') {
            $this->text($s, "Perairan ini $pasutFacts.");
        }
        if (! empty($narasi['pasut'])) {
            $this->text($s, $narasi['pasut']);
        }
        $this->dataTable($s, ['Parameter Pasang Surut', 'Elevasi'], [
            ['Highest Astronomical Tide (HAT)', "+{$this->g($lap, 'hat')} m"],
            ['Mean Sea Level (MSL)', "{$this->g($lap, 'msl')} m"],
            ['Lowest Astronomical Tide (LAT)', "{$this->g($lap, 'lat')} m"],
            ['Tidal Range', "{$this->g($lap, 'tidal_range')} m"],
            ['Bilangan Formzahl', "{$this->g($lap, 'formzahl')} ({$this->g($lap, 'tipe_pasut')})"],
        ]);
        $this->caption($s, 'Tabel 4. Parameter Pasang Surut pada Lokasi Kegiatan.');
        $siklusPasutCaption = $tipePasut !== null
            ? "Gambar 10. Grafik Fluktuasi Pasang Surut Selama 14 Hari (Tipe {$tipePasut})."
            : 'Gambar 10. Grafik Fluktuasi Pasang Surut Selama 14 Hari.';
        $this->figure($s, 'siklus_pasut', $siklusPasutCaption, 13);

        $this->heading($s, 'C. Profil Dasar Laut', 2);
        $titikPusat = $this->gOrNull($lap, 'batimetri_titik_pusat');
        $panjangLintasan = $this->gOrNull($lap, 'batimetri_panjang_lintasan');
        $terdalam = $this->gOrNull($lap, 'batimetri_terdalam');
        if ($titikPusat !== null) {
            $this->text($s, "Kedalaman pada titik pusat lokasi kegiatan tercatat sebesar $titikPusat meter terhadap Lowest Water Spring (LWS).");
        }
        if ($panjangLintasan !== null || $terdalam !== null) {
            $lintasanClause = $panjangLintasan !== null ? " sepanjang lintasan $panjangLintasan km" : '';
            $terdalamClause = $terdalam !== null ? " menunjukkan kedalaman terdalam mencapai $terdalam meter" : '';
            $this->text($s, "Hasil pemeruman pada profil garis batimetri{$lintasanClause}{$terdalamClause}.");
        }
        if (! empty($narasi['batimetri'])) {
            $this->text($s, $narasi['batimetri']);
        }
        $this->figure($s, 'profil_batimetri', 'Gambar 11. Profil Garis Batimetri pada Lintasan Pemeruman Titik Pusat Rencana Kegiatan.', 13);

        // Printed on the document's literal last page (LAMPIRAN: SUMBER
        // REFERENSI, after Chapter IV) instead of here — see queueReference().
        if ($hidroUsedKeys) {
            $this->queueReference(
                'Catatan Estimasi Data Hidro-Oseanografi (AI)',
                $hidro['catatan'] ?: 'Sebagian nilai gelombang, arus, pasang surut, dan/atau batimetri pada Bab III di atas merupakan estimasi regional preliminer berdasarkan referensi publik (bukan hasil survei lapangan) karena Laporan Hidro-Oseanografi belum diunggah/lengkap, dan wajib diverifikasi dengan survei hidro-oseanografi sesungguhnya sebelum pengajuan resmi.',
                $hidro['sumber'] ?? [],
                introItalic: true
            );
        }

        $this->heading($s, 'D. Kondisi Sosial Ekonomi Masyarakat', 2);
        $sumberSosek = (string) ($prop['sumber_data_sosek'] ?? '') ?: 'Badan Pusat Statistik';
        $tahunSosek = (string) ($prop['tahun_data_sosek'] ?? '');
        $tahunTxt = $tahunSosek !== '' ? ' tahun '.$tahunSosek : '';
        $desaLuas = $this->gOrNull($prop, 'desa_luas_ha');
        $desaPenduduk = $this->gOrNull($prop, 'desa_penduduk');
        $sosekFacts = $this->joinFacts([
            $desaLuas ? "memiliki luas wilayah $desaLuas Ha" : null,
            $desaPenduduk ? "jumlah penduduk sebanyak $desaPenduduk jiwa" : null,
        ]);
        if ($sosekFacts !== '') {
            $this->text($s, "Berdasarkan data sekunder $sumberSosek$tahunTxt, $desa $sosekFacts.");
        }
        $this->text($s, 'Kehadiran rencana kegiatan ini diharapkan dapat mendukung struktur sosial-ekonomi kawasan secara harmonis dan melibatkan konsultasi publik dengan kelompok nelayan setempat sebelum pelaksanaan konstruksi.');
        $mataPencaharian = (string) ($prop['mata_pencaharian'] ?? '');
        if ($mataPencaharian !== '') {
            $this->labeled($s, 'Mata Pencaharian Masyarakat Desa', $mataPencaharian);
        }

        $this->heading($s, 'E. Aksesibilitas Lokasi dan Sekitarnya', 2);
        $aksesibilitasManual = (string) ($prop['aksesibilitas_lokasi'] ?? '');
        if ($aksesibilitasManual !== '') {
            $this->text($s, $aksesibilitasManual);
        } else {
            $this->text($s, "Aksesibilitas menuju lokasi kegiatan di $lokasi dapat ditempuh melalui jalur darat maupun laut.");
        }
        $this->figure($s, 'peta_pola_ruang', 'Gambar 12. Peta Rencana Pola Ruang Wilayah dan Posisi Lokasi Permohonan.', 13);
    }

    private function docChapterFour(Section $s, string $perusahaan, array $prop = []): void
    {
        $this->heading($s, 'IV. DOKUMEN PERSYARATAN LAINNYA', 1);
        $this->text($s, "Dokumen pendukung untuk permohonan PKKPRL yang diajukan oleh $perusahaan meliputi:");
        $checked = $prop['_dukung_checked_labels'] ?? [];
        $items = $checked ?: [
            'Sertifikat Kepemilikan Lahan Darat.',
            'Dokumen identitas dan legalitas pemohon/perusahaan.',
            'Dokumentasi survei lapangan kondisi eksisting lokasi.',
            'Peta pendukung (peta lokasi, peta site plan, dan peta pola ruang wilayah).',
        ];
        foreach ($items as $item) {
            $s->addListItem($this->esc(rtrim($item, '.').'.'), 0, ['name' => 'Arial', 'size' => 11]);
        }
        $this->figure($s, 'dukung_dokumen', 'Gambar 13. Dokumen Data Dukung Terlampir.', 13);

        $this->text($s, "Demikian proposal teknis ini disusun sebagai bagian dari kelengkapan administrasi dan teknis permohonan PKKPRL atas nama $perusahaan.", true);
        $this->text($s, 'Catatan: Dokumen ini dibangkitkan otomatis oleh aplikasi penggabung proposal PKKPRL dari dua sumber dokumen. Mohon verifikasi kembali seluruh data dan gambar sebelum digunakan untuk pengajuan resmi.', true);
    }

    /** Mirrors generate_docx.py's `parse_tanggal_indonesia()` — returns [month, year] or null. */
    private function parseTanggalIndonesia(string $text): ?array
    {
        if (! preg_match('/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/u', $text, $m)) {
            return null;
        }
        $bulanMap = ['januari' => 1, 'februari' => 2, 'maret' => 3, 'april' => 4, 'mei' => 5, 'juni' => 6, 'juli' => 7, 'agustus' => 8, 'september' => 9, 'oktober' => 10, 'november' => 11, 'desember' => 12];
        $bulan = $bulanMap[mb_strtolower(trim($m[2]))] ?? null;

        return $bulan ? [$bulan, (int) $m[3]] : null;
    }
}
