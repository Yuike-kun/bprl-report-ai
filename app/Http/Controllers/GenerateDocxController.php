<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\GeneralDraft;
use App\Services\GeminiService;
use App\Services\PdfImageExtractorService;
use DOMDocument;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\TemplateProcessor;
use Smalot\PdfParser\Parser as PdfParser;
use ZipArchive;

class GenerateDocxController extends Controller
{
    protected const IDENTITY_FIELDS = [
        'nama_perusahaan', 'nib', 'npwp', 'telp', 'email',
        'jenis_kegiatan', 'no_referensi', 'tanggal_penyusunan', 'luas_ruang_total',
    ];

    protected const ALL_FIELDS = [
        'nama_perusahaan', 'nib', 'npwp', 'telp', 'email',
        'jenis_kegiatan', 'no_referensi', 'tanggal_penyusunan',
        'nama_perairan', 'provinsi', 'kabupaten', 'kecamatan', 'desa',
        'uraian_kegiatan', 'jadwal_konstruksi', 'luas_ruang_total',
        'permukiman_nelayan', 'alur_pelayaran', 'area_tangkap',
        'aktivitas_lain', 'ada_reklamasi', 'sumber_material',
        'metode_reklamasi', 'jenis_tanah', 'daya_dukung',
        'pemanfaatan_lahan', 'jadwal_reklamasi',
    ];

    public function __construct(
        protected GeminiService $gemini,
        protected PdfImageExtractorService $imageExtractor,
    ) {
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PRIMARY: Generate DOCX from a saved draft ID (DB-backed, recommended path)
    // ──────────────────────────────────────────────────────────────────────────
    public function generateFromDraft(int $draftId)
    {
        $draft = GeneralDraft::with([
            'seaConstructionAndInstallation',
            'spaceUtilizationInfo',
            'currentLocationData',
            'reclamationRequirement',
            'aiAnalysisResult',
        ])->findOrFail($draftId);

        $sea   = $draft->seaConstructionAndInstallation;
        $space = $draft->spaceUtilizationInfo;
        $rec   = $draft->reclamationRequirement;
        $ai    = $draft->aiAnalysisResult;

        $data = [
            // Identitas
            'nama_perusahaan'    => $draft->nama_perusahaan ?? '',
            'nib'                => $draft->nib ?? '',
            'npwp'               => $draft->npwp ?? '',
            'telp'               => $draft->telp ?? '',
            'email'              => $draft->email ?? '',
            'jenis_kegiatan'     => $draft->jenis_kegiatan ?? '',
            'no_referensi'       => $draft->no_referensi ?? '',
            'tanggal_penyusunan' => $draft->tanggal_penyusunan?->format('d F Y') ?? '',
            // Bab I
            'nama_perairan'      => $sea?->nama_perairan ?? '',
            'provinsi'           => $sea?->provinsi ?? '',
            'kabupaten'          => $sea?->kabupaten ?? '',
            'kecamatan'          => $sea?->kecamatan ?? '',
            'desa'               => $sea?->desa ?? '',
            'uraian_kegiatan'    => $sea?->uraian_kegiatan ?? '',
            'jadwal_konstruksi'  => $sea?->jadwal_konstruksi ?? '',
            'luas_ruang_total'   => $sea?->luas_ruang_total ?? '',
            // Bab II
            'permukiman_nelayan' => $space?->permukiman_nelayan ?? '',
            'alur_pelayaran'     => $space?->alur_pelayaran ?? '',
            'area_tangkap'       => $space?->area_tangkap ?? '',
            'aktivitas_lain'     => $space?->aktivitas_lain ?? '',
            // Bab IV
            'ada_reklamasi'      => $rec?->ada_reklamasi ?? 'Tidak',
            'sumber_material'    => $rec?->sumber_material ?? '',
            'metode_reklamasi'   => $rec?->metode_reklamasi ?? '',
            'jenis_tanah'        => $rec?->jenis_tanah ?? '',
            'daya_dukung'        => $rec?->daya_dukung ?? '',
            'pemanfaatan_lahan'  => $rec?->pemanfaatan_lahan ?? '',
            'jadwal_reklamasi'   => $rec?->jadwal_reklamasi ?? '',
        ];

        $narasi       = $ai?->analysis_result ?? [];
        $tempImages   = [];
        $templatePath = public_path('template-docx.docx');
        $outputPath   = storage_path('app/tmp/Proposal_PKKPRL_' . uniqid() . '.docx');

        if (! is_dir(dirname($outputPath))) {
            mkdir(dirname($outputPath), 0755, true);
        }

        try {
            // Try to extract section images from the stored survey doc
            $surveyDocPath = $draft->currentLocationData?->analisis_oseanografi_file;
            if ($surveyDocPath && Storage::disk('reports')->exists($surveyDocPath)) {
                $fullPath = Storage::disk('reports')->path($surveyDocPath);
                if (strtolower(pathinfo($fullPath, PATHINFO_EXTENSION)) === 'pdf') {
                    try {
                        $tempImages = $this->imageExtractor->extractSectionImages($fullPath);
                    } catch (\Exception $e) {
                        Log::warning('Image extraction skipped: ' . $e->getMessage());
                    }
                }
            }

            if (file_exists($templatePath)) {
                $this->fillTemplate($templatePath, $outputPath, $data, $narasi, $tempImages);
            } else {
                Log::warning('template-docx.docx not found in public/, generating from scratch.');
                $this->buildDocxFromScratch($data, $narasi, $outputPath);
            }

            return response()->download($outputPath, 'Proposal_PKKPRL.docx')
                ->deleteFileAfterSend(true);
        } catch (Exception $e) {
            Log::error('Gagal generate docx from draft', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memproses dokumen: ' . $e->getMessage()], 500);
        } finally {
            foreach ($tempImages as $imgPath) {
                @unlink($imgPath);
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // LEGACY: Upload PDF + DOCX template together, generate on the fly
    // ──────────────────────────────────────────────────────────────────────────
    public function generate(Request $request)
    {
        $request->validate([
            'laporan_pdf'        => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'template_docx'      => ['required', 'file', 'mimes:docx', 'max:20480'],
            'nama_perusahaan'    => ['nullable', 'string', 'max:255'],
            'nib'                => ['nullable', 'string', 'max:255'],
            'npwp'               => ['nullable', 'string', 'max:255'],
            'telp'               => ['nullable', 'string', 'max:255'],
            'email'              => ['nullable', 'string', 'max:255'],
            'jenis_kegiatan'     => ['nullable', 'string', 'max:255'],
            'no_referensi'       => ['nullable', 'string', 'max:255'],
            'tanggal_penyusunan' => ['nullable', 'string', 'max:255'],
            'luas_ruang_total'   => ['nullable', 'string', 'max:255'],
        ]);

        $pdfPath    = $request->file('laporan_pdf')->getRealPath();
        $tempImages = [];

        try {
            $parser       = new PdfParser();
            $pdf          = $parser->parseFile($pdfPath);
            $documentText = $pdf->getText();

            $narasi = $this->gemini->generateNarasi($documentText, [
                'nama_perusahaan' => $request->input('nama_perusahaan'),
                'jenis_kegiatan'  => $request->input('jenis_kegiatan'),
            ]);

            $tempImages = $this->imageExtractor->extractSectionImages($pdfPath);

            $templateProcessor = new TemplateProcessor($request->file('template_docx')->getRealPath());

            foreach ($narasi as $key => $value) {
                $templateProcessor->setValue($key, htmlspecialchars($value, ENT_QUOTES, 'UTF-8'));
            }

            foreach (self::IDENTITY_FIELDS as $field) {
                $value = $request->input($field);
                if ($value !== null) {
                    $templateProcessor->setValue($field, htmlspecialchars($value, ENT_QUOTES, 'UTF-8'));
                }
            }

            foreach ($tempImages as $section => $imagePath) {
                try {
                    $templateProcessor->setImageValue("gambar_{$section}", [
                        'path'   => $imagePath,
                        'width'  => 400,
                        'height' => 300,
                        'ratio'  => true,
                    ]);
                } catch (\Exception $e) {
                    Log::warning("Image placeholder gambar_{$section} not found in template, skipping.");
                }
            }

            $outputPath = storage_path('app/tmp/Proposal_Terisi_' . uniqid() . '.docx');
            if (! is_dir(dirname($outputPath))) {
                mkdir(dirname($outputPath), 0755, true);
            }
            $templateProcessor->saveAs($outputPath);

            return response()->download($outputPath, 'Proposal_Terisi.docx')
                ->deleteFileAfterSend(true);
        } catch (Exception $e) {
            Log::error('Gagal generate docx dari laporan', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Gagal memproses dokumen: ' . $e->getMessage(),
            ], 422);
        } finally {
            foreach ($tempImages as $imagePath) {
                @unlink($imagePath);
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Analyze PDF/DOCX with Gemini — returns structured AI narasi JSON
    // ──────────────────────────────────────────────────────────────────────────
    public function analyzeAi(Request $request)
    {
        $request->validate([
            'dokumen' => ['required'],
        ]);

        $tmpFile = null;
        try {
            $dokumen  = $request->input('dokumen');
            $filePath = $this->resolveFilePath($dokumen, $tmpFile);

            if (! $filePath || ! file_exists($filePath)) {
                return response()->json(['message' => 'Dokumen survei tidak ditemukan.'], 422);
            }

            $documentText = $this->extractTextFromFile($filePath, basename($filePath));

            if (empty(trim($documentText))) {
                return response()->json(['message' => 'Dokumen tidak mengandung teks yang dapat dibaca.'], 422);
            }

            $profileContext = array_filter(
                $request->only(self::ALL_FIELDS),
                fn($val) => ! is_null($val) && $val !== ''
            );

            $rawResponse = $this->gemini->generateNarasi($documentText, $profileContext);

            return response()->json([
                'success' => true,
                'narasi'  => [
                    'batimetri'         => $rawResponse['batimetri'] ?? '',
                    'gelombang'         => $rawResponse['gelombang'] ?? '',
                    'arus'              => $rawResponse['arus'] ?? '',
                    'pasang_surut'      => $rawResponse['pasang_surut'] ?? '',
                    'ekosistem_pesisir' => $rawResponse['ekosistem_pesisir'] ?? '',
                ],
            ]);
        } catch (Exception $e) {
            Log::error('AI Analysis Failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 500);
        } finally {
            if ($tmpFile && file_exists($tmpFile)) {
                @unlink($tmpFile);
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private function fillTemplate(
        string $templatePath,
        string $outputPath,
        array $data,
        array $narasi,
        array $sectionImages = []
    ): void {
        $tp = new TemplateProcessor($templatePath);

        foreach ($data as $key => $value) {
            try {
                $tp->setValue($key, htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'));
            } catch (\Exception) {
                // Placeholder missing in template — skip silently
            }
        }

        foreach (['batimetri', 'gelombang', 'arus', 'pasang_surut', 'ekosistem_pesisir'] as $key) {
            try {
                $tp->setValue($key, htmlspecialchars((string) ($narasi[$key] ?? ''), ENT_QUOTES, 'UTF-8'));
            } catch (\Exception) {
            }
        }

        foreach ($sectionImages as $section => $imagePath) {
            try {
                $tp->setImageValue("gambar_{$section}", [
                    'path'   => $imagePath,
                    'width'  => 400,
                    'height' => 300,
                    'ratio'  => true,
                ]);
            } catch (\Exception) {
                Log::warning("Image placeholder gambar_{$section} missing in template.");
            }
        }

        $tp->saveAs($outputPath);
    }

    private function buildDocxFromScratch(array $data, array $narasi, string $outputPath): void
    {
        $phpWord = new PhpWord();
        $phpWord->addTitleStyle(1, ['bold' => true, 'size' => 16], ['spaceAfter' => 200, 'alignment' => 'center']);
        $phpWord->addTitleStyle(2, ['bold' => true, 'size' => 13, 'color' => '1E40AF'], ['spaceBefore' => 300, 'spaceAfter' => 100]);
        $phpWord->addTitleStyle(3, ['bold' => true, 'size' => 11], ['spaceBefore' => 150, 'spaceAfter' => 50]);
        $phpWord->addTableStyle('T', ['borderSize' => 6, 'borderColor' => 'D1D5DB', 'cellMargin' => 80]);

        $section = $phpWord->addSection();
        $section->addTitle('PROPOSAL PERSETUJUAN KESESUAIAN KEGIATAN PEMANFAATAN RUANG LAUT (PKKPRL)');
        $section->addTextBreak();

        $this->addTableRows($section, $phpWord, 'IDENTITAS PEMOHON', [
            'Nama Perusahaan' => $data['nama_perusahaan'], 'NIB'          => $data['nib'],
            'NPWP'            => $data['npwp'], 'Telepon'                 => $data['telp'], 'Email' => $data['email'],
            'Jenis Kegiatan'  => $data['jenis_kegiatan'], 'No. Referensi' => $data['no_referensi'],
            'Tanggal'         => $data['tanggal_penyusunan'],
        ]);

        $this->addTableRows($section, $phpWord, 'I. RENCANA BANGUNAN & INSTALASI LAUT', [
            'Nama Perairan'     => $data['nama_perairan'], 'Provinsi' => $data['provinsi'],
            'Kabupaten'         => $data['kabupaten'], 'Kecamatan'    => $data['kecamatan'],
            'Desa'              => $data['desa'], 'Uraian Kegiatan'   => $data['uraian_kegiatan'],
            'Jadwal Konstruksi' => $data['jadwal_konstruksi'], 'Luas' => $data['luas_ruang_total'],
        ]);

        $this->addTableRows($section, $phpWord, 'II. PEMANFAATAN RUANG LAUT', [
            'Permukiman Nelayan' => $data['permukiman_nelayan'],
            'Alur Pelayaran'     => $data['alur_pelayaran'],
            'Area Tangkap'       => $data['area_tangkap'],
            'Aktivitas Lain'     => $data['aktivitas_lain'],
        ]);

        $section->addTitle('III. DATA KONDISI TERKINI LOKASI & ANALISIS TEKNIS (AI)', 2);
        foreach (['Batimetri' => 'batimetri', 'Gelombang' => 'gelombang', 'Arus' => 'arus', 'Pasang Surut' => 'pasang_surut', 'Ekosistem Pesisir' => 'ekosistem_pesisir'] as $label => $key) {
            $section->addTitle($label, 3);
            $content = $narasi[$key] ?? null;
            if ($content) {
                foreach (explode("\n", (string) $content) as $p) {
                    if (trim($p)) {
                        $section->addText(trim($p), ['size' => 11], ['spaceAfter' => 100]);
                    }

                }
            } else {
                $section->addText('Data narasi belum tersedia.', ['italic' => true, 'color' => '6B7280']);
            }
        }

        if (! empty($data['ada_reklamasi']) && strtolower((string) $data['ada_reklamasi']) !== 'tidak') {
            $this->addTableRows($section, $phpWord, 'IV. PERSYARATAN REKLAMASI', [
                'Ada Reklamasi'    => $data['ada_reklamasi'], 'Sumber Material' => $data['sumber_material'],
                'Metode'           => $data['metode_reklamasi'], 'Jenis Tanah'  => $data['jenis_tanah'],
                'Daya Dukung'      => $data['daya_dukung'], 'Pemanfaatan Lahan' => $data['pemanfaatan_lahan'],
                'Jadwal Reklamasi' => $data['jadwal_reklamasi'],
            ]);
        }

        IOFactory::createWriter($phpWord, 'Word2007')->save($outputPath);
    }

    private function addTableRows($section, PhpWord $phpWord, string $title, array $rows): void
    {
        $section->addTitle($title, 2);
        $table = $section->addTable('T');
        foreach ($rows as $label => $val) {
            $table->addRow();
            $table->addCell(4000)->addText($label, ['bold' => true]);
            $table->addCell(6000)->addText((string) ($val ?: '-'));
        }
    }

    private function resolveFilePath(mixed $dokumen,  ? string &$tmpFile): ?string
    {
        if (is_array($dokumen) && isset($dokumen['data'])) {
            $fileName   = $dokumen['name'] ?? 'document.pdf';
            $base64Data = $dokumen['data'];
            if (preg_match('/^data:(.*?);base64,/', $base64Data)) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
            }
            $decoded = base64_decode($base64Data);
            $tmpFile = storage_path('app/tmp/' . uniqid('ai_doc_') . '_' . $fileName);
            if (! is_dir(dirname($tmpFile))) {
                mkdir(dirname($tmpFile), 0755, true);
            }
            file_put_contents($tmpFile, $decoded);
            return $tmpFile;
        }

        if ($dokumen instanceof \Illuminate\Http\UploadedFile) {
            return $dokumen->getRealPath();
        }

        if (is_string($dokumen)) {
            if (Storage::disk('reports')->exists($dokumen)) {
                return Storage::disk('reports')->path($dokumen);
            }
            if (file_exists($dokumen)) {
                return $dokumen;
            }
        }

        return null;
    }

    private function extractTextFromFile(string $filePath, string $filename): string
    {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if ($ext === 'pdf') {
            try {
                return (new PdfParser())->parseFile($filePath)->getText();
            } catch (\Exception $e) {
                Log::error('PDF Parsing Error: ' . $e->getMessage());
                return '';
            }
        }

        if ($ext === 'docx') {
            $zip = new ZipArchive();
            if ($zip->open($filePath) === true) {
                $index = $zip->locateName('word/document.xml');
                if ($index !== false) {
                    $dom = new DOMDocument();
                    @$dom->loadXML($zip->getFromIndex($index));
                    $text = preg_replace('/\s+/', ' ', trim($dom->textContent));
                    $zip->close();
                    return $text;
                }
                $zip->close();
            }
        }

        return '';
    }
}
