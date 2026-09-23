<?php

namespace App\Http\Controllers;

use App\Models\GeneralDraft;
use App\Models\KkprlProposal;
use App\Services\ClaudeService;
use App\Services\DocumentImageExtractor;
use App\Services\KKPRL\ProposalExtractionService;
use App\Services\PdfImageExtractorService;
use App\Services\ProposalDocumentGenerator;
use App\Support\TextCase;
use DOMDocument;
use DOMXPath;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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

    // ──────────────────────────────────────────────────────────────
    // Dummy / simulation content cleanup
    // ──────────────────────────────────────────────────────────────

    /** Entire <w:p> paragraph containing these markers will be deleted. */
    protected const DUMMY_PARAGRAPH_MARKERS = [
        'DRAF SIMULASI',                                      // banner atas
        'CONTOH FORMAT / SIMULASI',                           // paragraf CATATAN
        'WAJIB digantikan dengan data hasil survei',          // catatan penutup
        'waktu tinjauan pengambilan data selama 14 hari',     // lead-in dummy B.3
        'garispink',                                          // contoh dummy III.3
        'Contoh : Penggunaan ruang sekitar',                  // contoh dummy II.1
        'elaskan mengenai akses ke lokasi',                   // instruksi III.5
        'Lokasi kegiatan dapat ditempuh melalui jalur darat', // contoh dummy III.5
        // Section I Instructions
        'Kegiatan yang dimohonkan adalah [uraian jenis usaha]',
        'Tujuan kegiatan: mendukung [aktivitas usaha',
        'Manfaat kegiatan usaha adalah ...',
        'Nilai investasi',
        'Keterlibatan masyarakat lokal dalam tenaga kerja',
        'Kegiatan eksisting:  berupa penjelasan jika',
        'Kegiatan Rencana : berupa penjelasan jika',
        'Berisi penjelasan mengenai jadwal kegiatan',
        'Berisi penjelasan mengenai apakah kegiatan dilakukan',
        'Sampaikan data-data atau bukti dukung penguat',
        'Sampaikan apakah kegiatan ini adalah berusaaha',
        'Sampaikan apakah kegiatan ini adalah strategis',
        'Plotting  batas-batas area',
        'Sampaikan rencana kegiatan yang menggunakan ruang laut',
        'Sampaikan rincian kebutuhan ruang laut',

        // Section III Instructions
        'Disampaikan Informasi terkait gambaran profil dasar laut',
        'Profil dasar laut itu kemudian dinarasikan',
        'Kondisi sosial ekonomi dapat mengacu kepada data resmi',
        'Jika dilakukan survey primer sosial ekonomi',
        'Kegiatan direncanakan tidak mengganggu akses melaut', // Optional: remove if you want to keep this generic statement

        // Section IV Instructions & Dummy Lines
        'Sumber material: pasir laut dari lokasi pengambilan',
        'Volume material dibutuhkan: ±125.000',
        'Metode pelaksanaan: hydraulic filling',
        'Lahan hasil reklamasi direncanakan dimanfaatkan untuk [fasilitas',
        'Gambaran umum pelaksanaan reklamasi yang dijelaskan',
        'Jadwal rencana pelaksanaan pekerjaan reklamasi',

        // Data Dukung
        'Silahkan ditambahkan jika telah memiliki data',

        // Standalone "CONTOH" labels (be careful with this one, might match other things)
        // 'CONTOH',
    ];

    /** Entire <w:tr> table row containing these markers will be deleted. */
    protected const DUMMY_ROW_MARKERS = [
        // Tabel ekosistem (dummy)
        'Rhizophora', 'tutupan sedang', 'tutupan karang hidup ±38%',
        // Tabel sosial ekonomi (dummy)
        '3.200 jiwa', 'Nelayan (±62%)', '2 kelompok terdaftar', 'Jalur tangkap ikan harian',
        // Tabel geoteknik (dummy)
        'Lempung berpasir', 'N-SPT', 'soil improvement', 'monitoring pasca-reklamasi',
        // Reklamasi (dummy)
        'pasir laut dari lokasi pengambilan', 'Volume material dibutuhkan', 'hydraulic filling',
        // Tabel koordinat contoh
        '6°03',
    ];

    /**
     * Remove dummy/simulation remnants from the saved DOCX:
     *  1. delete whole dummy paragraphs,
     *  2. delete whole dummy table rows,
     *  3. strip inline fragments ("Sebagai contoh ilustrasi...", "(Data Simulasi)")
     *     WITHOUT deleting the paragraph that contains them (e.g. AI narasi).
     */
    private function cleanDummyContent(string $docxPath): void
    {
        $zip = new ZipArchive;
        if ($zip->open($docxPath) !== true) {
            return;
        }

        $xml = $zip->getFromName('word/document.xml');
        if ($xml === false) {
            $zip->close();

            return;
        }

        // 1. Delete dummy paragraphs
        foreach (self::DUMMY_PARAGRAPH_MARKERS as $marker) {
            $xml = preg_replace(
                '/<w:p\b[^>]*>(?:(?!<\/w:p>).)*?'.preg_quote($marker, '/').'(?:(?!<\/w:p>).)*?<\/w:p>/s',
                '',
                $xml
            );
        }

        // 2. Delete dummy table rows
        foreach (self::DUMMY_ROW_MARKERS as $marker) {
            $xml = preg_replace(
                '/<w:tr\b[^>]*>(?:(?!<\/w:tr>).)*?'.preg_quote($marker, '/').'(?:(?!<\/w:tr>).)*?<\/w:tr>/s',
                '',
                $xml
            );
        }

        // 3. Inline strips — keep the paragraph (AI text), remove only the fragment
        $xml = preg_replace('/> *Sebagai contoh ilustrasi[^<]*</i', '><', $xml);
        $xml = preg_replace('/\s*\(Data Simulasi\)/i', '', $xml);
        $xml = preg_replace('/\s*\(Simulasi\)/', '', $xml);
        $xml = preg_replace('/\s*\(estimasi\)/', '', $xml);

        $zip->addFromString('word/document.xml', $xml);
        $zip->close();
    }

    /**
     * Hapus seluruh bagian IV. PERSYARATAN REKLAMASI (termasuk tabel & narasi)
     * jika status reklamasi adalah Tidak / False.
     */
    private function removeReklamasiSection(string $docxPath, bool $hasReklamasi): void
    {
        if ($hasReklamasi) {
            return; // Jika true, biarkan section tetap ada
        }

        $zip = new ZipArchive;
        if ($zip->open($docxPath) !== true) {
            return;
        }

        $xml = $zip->getFromName('word/document.xml');
        if ($xml === false) {
            $zip->close();

            return;
        }

        libxml_use_internal_errors(true);
        if (strpos($xml, '<?xml') === false) {
            $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'."\n".$xml;
        }

        $dom = new DOMDocument;
        if (! $dom->loadXML($xml)) {
            $zip->close();

            return;
        }

        $xpath = new DOMXPath($dom);
        $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

        $body = $xpath->query('//w:body')->item(0);
        if (! $body) {
            $zip->close();

            return;
        }

        $isInsideReklamasi = false;
        $nodesToRemove = [];

        // Iterasi semua node anak di dalam <w:body> (paragraf, tabel, dll) secara berurutan
        foreach ($body->childNodes as $node) {
            $text = trim($node->textContent);

            // 1. Mulai hapus saat menemukan judul Reklamasi
            if (stripos($text, 'PERSYARATAN REKLAMASI') !== false) {
                $isInsideReklamasi = true;
            }

            // 2. Berhenti hapus saat menemukan bab selanjutnya (Data Dukung / Penutup)
            if ($isInsideReklamasi && (stripos($text, 'DATA DUKUNG LAINNYA') !== false || stripos($text, 'PENUTUP') !== false)) {
                $isInsideReklamasi = false;

                continue; // Node ini jangan dihapus
            }

            // 3. Kumpulkan node yang berada di dalam zona Reklamasi
            if ($isInsideReklamasi) {
                $nodesToRemove[] = $node;
            }
        }

        // Eksekusi penghapusan node secara aman
        foreach ($nodesToRemove as $node) {
            $body->removeChild($node);
        }

        $cleanedXml = $dom->saveXML();
        // Hapus deklarasi XML ganda jika ada
        $cleanedXml = preg_replace('/<\?xml.*?\?>\s*/', '', $cleanedXml);

        $zip->addFromString('word/document.xml', $cleanedXml);
        $zip->close();
    }

    public function __construct(
        protected ClaudeService $claude,
        protected PdfImageExtractorService $imageExtractor,
    ) {}

    public function generateFromProposal(int $proposalId)
    {
        $proposal = KkprlProposal::findOrFail($proposalId);

        // Direct per-purpose uploads already stored on the `public` disk by
        // KkprlProposalController::store() — map 1:1 onto the figure tags used
        // by ProposalDocumentGenerator (a faithful port of the reference app's
        // generate_docx.py). Only real image files are embedded; PDFs stored in
        // these slots are intentionally skipped (shown as a "not found" note)
        // rather than guessed at.
        $images = [];
        $publicImagePaths = [
            'siteplan' => $proposal->site_plan_path,
            'peta_lokasi' => $proposal->location_map_path,
            'foto_mangrove' => $proposal->mangrove_doc_path,
            'foto_lamun' => $proposal->seagrass_doc_path,
            'foto_karang_insitu' => $proposal->coral_reef_doc_path,
            'gambar_aksesibilitas' => $proposal->accessibility_map_path,
            'sertifikat_lahan' => $proposal->land_certificate_path,
            'dok_sosialisasi' => $proposal->socialization_doc_path,
            'dok_pendukung_lainnya' => $proposal->other_supporting_doc_path,
        ];
        foreach ($publicImagePaths as $tag => $path) {
            $resolved = $this->resolvePublicImage($path);
            if ($resolved) {
                $images[$tag] = [$resolved];
            }
        }
        $polaRuang = collect((array) ($proposal->marine_spatial_docs_path ?? []))
            ->map(fn ($path) => $this->resolvePublicImage($path))
            ->filter()
            ->values()
            ->all();
        if ($polaRuang) {
            $images['peta_pola_ruang'] = $polaRuang;
        }

        // Hidro-oceanography figures (mawar gelombang/arus, siklus pasut, profil
        // batimetri, peta ekosistem) are keyword-detected from the single
        // uploaded PDF laporan, since there is no separate per-figure upload.
        $tempImages = [];
        $hydroDocPath = $proposal->hydro_oceanography_doc_path;
        if ($hydroDocPath && Storage::disk('public')->exists($hydroDocPath)) {
            $hydroFullPath = Storage::disk('public')->path($hydroDocPath);
            if (strtolower(pathinfo($hydroFullPath, PATHINFO_EXTENSION)) === 'pdf') {
                try {
                    $tempImages = $this->imageExtractor->extractSectionImages($hydroFullPath);
                } catch (Exception $e) {
                    Log::warning('Image extraction from hydro doc skipped: '.$e->getMessage());
                }
            }
        }
        $sectionTagMap = [
            'gelombang' => 'mawar_gelombang',
            'arus' => 'mawar_arus',
            'pasang_surut' => 'siklus_pasut',
            'batimetri' => 'profil_batimetri',
            'ekosistem' => 'peta_ekosistem',
        ];
        foreach ($sectionTagMap as $section => $tag) {
            if (! empty($tempImages[$section])) {
                $images[$tag] = [$tempImages[$section]];
            }
        }

        $outputPath = storage_path('app/tmp/Proposal_PKKPRL_'.uniqid().'.docx');
        if (! is_dir(dirname($outputPath))) {
            mkdir(dirname($outputPath), 0755, true);
        }

        try {
            (new ProposalDocumentGenerator($this->claude))->createKkprlProposal($proposal, $images, $outputPath);

            $timestamp = now()->format('HisYmd');

            return response()->download($outputPath, 'Proposal_PKKPRL_'.$timestamp.'.docx')
                ->deleteFileAfterSend(true);
        } catch (Exception $e) {
            Log::error('Gagal generate docx from proposal', ['message' => $e->getMessage()]);

            return response()->json(['message' => 'Gagal memproses dokumen: '.$e->getMessage()], 500);
        } finally {
            foreach ($tempImages as $imgPath) {
                @unlink($imgPath);
            }
        }
    }

    /** Resolve a `public` disk path to an absolute file path, only when it is a real image. */
    private function resolvePublicImage(?string $path): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }
        if (! in_array(strtolower(pathinfo($path, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'gif', 'bmp'], true)) {
            return null;
        }

        return Storage::disk('public')->path($path);
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

        $sea = $draft->seaConstructionAndInstallation;
        $space = $draft->spaceUtilizationInfo;
        $rec = $draft->reclamationRequirement;
        $ai = $draft->aiAnalysisResult;

        $data = [
            // Identitas
            'nama_perusahaan' => $draft->nama_perusahaan ?? '',
            'nib' => $draft->nib ?? '',
            'npwp' => $draft->npwp ?? '',
            'telp' => $draft->telp ?? '',
            'email' => $draft->email ?? '',
            'jenis_kegiatan' => $draft->jenis_kegiatan ?? '',
            'no_referensi' => $draft->no_referensi ?? '',
            'tanggal_penyusunan' => $draft->tanggal_penyusunan?->format('d F Y') ?? '',
            // Bab I — wilayah from the cascading dropdowns is ALL CAPS as
            // stored by database/dump/indonesia.sql; normalise for output.
            'nama_perairan' => $sea?->nama_perairan ?? '',
            'provinsi' => TextCase::humanize($sea?->provinsi) ?? '',
            'kabupaten' => TextCase::humanize($sea?->kabupaten) ?? '',
            'kecamatan' => TextCase::humanize($sea?->kecamatan) ?? '',
            'desa' => TextCase::humanize($sea?->desa) ?? '',
            'uraian_kegiatan' => $sea?->uraian_kegiatan ?? '',
            'jadwal_konstruksi' => $sea?->jadwal_konstruksi ?? '',
            'luas_ruang_total' => $sea?->luas_ruang_total ?? '',
            // Bab II
            'permukiman_nelayan' => $space?->permukiman_nelayan ?? '',
            'alur_pelayaran' => $space?->alur_pelayaran ?? '',
            'area_tangkap' => $space?->area_tangkap ?? '',
            'aktivitas_lain' => $space?->aktivitas_lain ?? '',
            // Bab IV
            'ada_reklamasi' => $rec?->ada_reklamasi ?? 'Tidak',
            'sumber_material' => $rec?->sumber_material ?? '',
            'metode_reklamasi' => $rec?->metode_reklamasi ?? '',
            'jenis_tanah' => $rec?->jenis_tanah ?? '',
            'daya_dukung' => $rec?->daya_dukung ?? '',
            'pemanfaatan_lahan' => $rec?->pemanfaatan_lahan ?? '',
            'jadwal_reklamasi' => $rec?->jadwal_reklamasi ?? '',
        ];

        $adaReklamasi = $rec?->ada_reklamasi ?? 'Tidak';
        $isReklamasi = in_array(
            strtolower(trim((string) $adaReklamasi)),
            ['ya', 'ada', 'true', '1', 'reklamasi', 'yes']
        );
        $narasi = $ai?->analysis_result ?? [];
        $tempImages = [];
        $templatePath = public_path('template-docx.docx');
        $outputPath = storage_path('app/tmp/Proposal_PKKPRL_'.uniqid().'.docx');

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
                    } catch (Exception $e) {
                        Log::warning('Image extraction skipped: '.$e->getMessage());
                    }
                }
            }

            if (file_exists($templatePath)) {
                $this->fillTemplate($templatePath, $outputPath, $data, $narasi, $tempImages);
            } else {
                Log::warning('template-docx.docx not found in public/, generating from scratch.');
                $this->buildDocxFromScratch($data, $narasi, $outputPath);
            }

            $this->removeReklamasiSection($outputPath, $isReklamasi);

            $timestamp_name = now()->format('HisYmd');

            return response()->download($outputPath, 'Proposal_PKKPRL_'.$timestamp_name.'.docx')
                ->deleteFileAfterSend(true);
        } catch (Exception $e) {
            Log::error('Gagal generate docx from draft', ['message' => $e->getMessage()]);

            return response()->json(['message' => 'Gagal memproses dokumen: '.$e->getMessage()], 500);
        } finally {
            foreach ($tempImages as $imgPath) {
                @unlink($imgPath);
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DASHBOARD: Upload files → extract via AI → save as "on_review" → redirect
    // Accepts: proposal (required), laporan/report (optional)
    // Returns: Redirect to kkprl-proposal.review for user correction & download
    // ──────────────────────────────────────────────────────────────────────────
    public function reviewAndGenerate(Request $request, ProposalExtractionService $extractor)
    {
        $request->validate([
            'proposal' => ['required', 'file', 'extensions:pdf,doc,docx', 'max:262144'],
            'laporan' => ['nullable', 'file', 'extensions:pdf,doc,docx', 'max:262144'],
            'report' => ['nullable', 'file', 'extensions:pdf,doc,docx', 'max:262144'],
        ]);

        $proposalFile = $request->file('proposal');
        $laporanFile = $request->file('laporan') ?? $request->file('report');

        try {
            $jobId = Str::uuid()->toString();
            $base = storage_path('app/private/egerai/'.$jobId);
            File::ensureDirectoryExists($base);

            $images = [];
            $extractedFields = [];

            // Extract images and fields from proposal
            if ($proposalFile) {
                $propPath = $base.'/proposal.'.$proposalFile->getClientOriginalExtension();
                $proposalFile->move($base, basename($propPath));
                foreach ((new DocumentImageExtractor)->extract($propPath, 'proposal', $base.'/images-proposal') as $tag => $paths) {
                    $images[$tag] = array_merge($images[$tag] ?? [], $paths);
                }

                try {
                    $result = $extractor->extract($propPath);
                    $extractedFields = $result['fields'] ?? [];
                } catch (\Throwable $e) {
                    Log::warning('Auto-fill extraction failed: '.$e->getMessage());
                }
            }

            // Extract images from laporan/report if provided
            if ($laporanFile) {
                $repPath = $base.'/report.'.$laporanFile->getClientOriginalExtension();
                $laporanFile->move($base, basename($repPath));
                foreach ((new DocumentImageExtractor)->extract($repPath, 'report', $base.'/images-report') as $tag => $paths) {
                    $images[$tag] = array_merge($images[$tag] ?? [], $paths);
                }
            }

            $request->session()->put('egerai_jobs.'.$jobId, ['images' => $images]);

            // Clean up area size string
            $areaSize = null;
            if (isset($extractedFields['luas_ruang_total'])) {
                $cleaned = preg_replace('/[^0-9.]/', '', str_replace(',', '.', $extractedFields['luas_ruang_total']));
                if ($cleaned !== '') {
                    $areaSize = (float) $cleaned;
                }
            }

            // Save to DB for review page editing
            $kkprlProposal = KkprlProposal::create([
                'status' => 'on_review',
                'existing_doc_path' => $base.'/proposal',
                'company_name' => $extractedFields['nama_perusahaan'] ?? null,
                'applicant_name' => $extractedFields['nama_perusahaan'] ?? null,
                'nib' => $extractedFields['nib'] ?? null,
                'npwp' => $extractedFields['npwp'] ?? null,
                'phone_number' => $extractedFields['telp'] ?? null,
                'email' => $extractedFields['email'] ?? null,
                'activity_type' => $extractedFields['jenis_kegiatan'] ?? null,
                'water_name' => $extractedFields['nama_perairan'] ?? null,
                'area_size' => $areaSize,
                'activity_description' => $extractedFields['uraian_kegiatan'] ?? null,
            ]);

            return redirect()->route('kkprl-proposal.review', $kkprlProposal->id);

        } catch (\Throwable $e) {
            Log::error('reviewAndGenerate failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->withErrors([
                'proposal' => 'Gagal memproses dokumen: '.$e->getMessage(),
            ]);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // LEGACY: Upload PDF + DOCX template together, generate on the fly
    // ──────────────────────────────────────────────────────────────────────────
    public function generate(Request $request)
    {
        $request->validate([
            'laporan_pdf' => ['nullable', 'file', 'extensions:pdf,doc,docx', 'max:262144'],
            'template_docx' => ['nullable', 'file', 'extensions:docx', 'max:262144'],
            'proposal' => ['nullable', 'file', 'extensions:pdf,doc,docx', 'max:262144'],
            'report' => ['nullable', 'file', 'extensions:pdf,doc,docx', 'max:262144'],
            'nama_perusahaan' => ['nullable', 'string', 'max:255'],
            'nib' => ['nullable', 'string', 'max:255'],
            'npwp' => ['nullable', 'string', 'max:255'],
            'telp' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'max:255'],
            'jenis_kegiatan' => ['nullable', 'string', 'max:255'],
            'no_referensi' => ['nullable', 'string', 'max:255'],
            'tanggal_penyusunan' => ['nullable', 'string', 'max:255'],
            'luas_ruang_total' => ['nullable', 'string', 'max:255'],
        ]);

        $pdfPath = $request->file('laporan_pdf')->getRealPath();
        $tempImages = [];

        try {
            $parser = new PdfParser;
            $pdf = $parser->parseFile($pdfPath);
            $documentText = $pdf->getText();

            $narasi = $this->claude->generateNarasi($documentText, [
                'nama_perusahaan' => $request->input('nama_perusahaan'),
                'jenis_kegiatan' => $request->input('jenis_kegiatan'),
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
                        'path' => $imagePath,
                        'width' => 400,
                        'height' => 300,
                        'ratio' => true,
                    ]);
                } catch (Exception $e) {
                    Log::warning("Image placeholder gambar_{$section} not found in template, skipping.");
                }
            }

            $inserted = $this->insertSectionImages($templateProcessor, $tempImages);
            $this->purgeRemainingPlaceholders($templateProcessor);

            $outputPath = storage_path('app/tmp/Proposal_Terisi_'.uniqid().'.docx');
            if (! is_dir(dirname($outputPath))) {
                mkdir(dirname($outputPath), 0755, true);
            }
            $templateProcessor->saveAs($outputPath);

            $this->removeOrphanCaptions($outputPath, $inserted);

            return response()->download($outputPath, 'Proposal_Terisi.docx')
                ->deleteFileAfterSend(true);
        } catch (Exception $e) {
            Log::error('Gagal generate docx dari laporan', ['message' => $e->getMessage()]);

            return response()->json([
                'message' => 'Gagal memproses dokumen: '.$e->getMessage(),
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
            $dokumen = $request->input('dokumen');
            $filePath = $this->resolveFilePath($dokumen, $tmpFile);

            if (! $filePath || ! file_exists($filePath)) {
                return response()->json(['message' => 'Dokumen survei tidak ditemukan.'], 422);
            }

            $documentText = $this->extractTextFromFile($filePath, basename($filePath));

            // ✅ STEP 1: Clean the raw PDF text
            $documentText = $this->cleanDocumentText($documentText);

            if (empty(trim($documentText))) {
                return response()->json(['message' => 'Dokumen tidak mengandung teks yang relevan.'], 422);
            }

            $profileContext = array_filter(
                $request->only(self::ALL_FIELDS),
                fn ($val) => ! is_null($val) && $val !== ''
            );

            // The narrative may quote the location verbatim — send normal
            // casing instead of the ALL CAPS wilayah values from the form.
            foreach (['provinsi', 'kabupaten', 'kecamatan', 'desa'] as $locKey) {
                if (is_string($profileContext[$locKey] ?? null)) {
                    $profileContext[$locKey] = TextCase::humanize($profileContext[$locKey]);
                }
            }

            $rawResponse = $this->claude->generateNarasi($documentText, $profileContext);

            // ✅ STEP 2: Clean the AI output
            $cleanedNarasi = $this->cleanAiOutput($rawResponse);

            // ✅ FIX: Return ALL sections dynamically, not just the hardcoded 5
            return response()->json([
                'success' => true,
                'narasi' => $cleanedNarasi,
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

        // 1. Fill simple identity fields
        foreach ($data as $key => $value) {
            try {
                $tp->setValue($key, htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'));
            } catch (Exception) {
            }
        }

        // 2. Fill ALL AI narrative sections dynamically
        foreach ($narasi as $key => $value) {
            try {
                $tp->setValue($key, htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'));
            } catch (Exception) {
            }
        }

        // 3. Images & Cleanup
        $inserted = $this->insertSectionImages($tp, $sectionImages);
        $this->purgeRemainingPlaceholders($tp);

        $tp->saveAs($outputPath);

        $this->removeOrphanCaptions($outputPath, $inserted);
        $this->cleanDummyContent($outputPath); // The safe DOM version
    }

    private function buildDocxFromScratch(array $data, array $narasi, string $outputPath, array $tempImages = []): void
    {
        $mergedData = array_merge($data, $narasi);
        (new ProposalDocumentGenerator)->create($mergedData, $outputPath, $tempImages);
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

    private function resolveFilePath(mixed $dokumen, ?string &$tmpFile): ?string
    {
        if (is_array($dokumen) && isset($dokumen['data'])) {
            $fileName = $dokumen['name'] ?? 'document.pdf';
            $base64Data = $dokumen['data'];
            if (preg_match('/^data:(.*?);base64,/', $base64Data)) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
            }
            $decoded = base64_decode($base64Data);
            $tmpFile = storage_path('app/tmp/'.uniqid('ai_doc_').'_'.$fileName);
            if (! is_dir(dirname($tmpFile))) {
                mkdir(dirname($tmpFile), 0755, true);
            }
            file_put_contents($tmpFile, $decoded);

            return $tmpFile;
        }

        if ($dokumen instanceof UploadedFile) {
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
                return (new PdfParser)->parseFile($filePath)->getText();
            } catch (Exception $e) {
                Log::error('PDF Parsing Error: '.$e->getMessage());

                return '';
            }
        }

        if ($ext === 'docx') {
            $zip = new ZipArchive;
            if ($zip->open($filePath) === true) {
                $index = $zip->locateName('word/document.xml');
                if ($index !== false) {
                    $xml = $zip->getFromIndex($index);
                    $zip->close();
                    $xmlWithSpaces = str_replace(
                        ['</w:p>', '</w:tc>', '</w:tr>', '<w:tab/>', '</w:t>'],
                        ' ',
                        $xml
                    );
                    $text = preg_replace('/\s+/', ' ', trim(strip_tags($xmlWithSpaces)));

                    return html_entity_decode($text);
                }
                $zip->close();
            }
        }

        return '';
    }

    private function cleanAiOutput(array $narasi): array
    {
        $cleaned = [];
        $fillerPhrases = [
            'berdasarkan dokumen', 'berdasarkan teks', 'berikut adalah',
            'secara keseluruhan', 'tidak ada informasi', 'data tidak tersedia',
            'data tidak ditemukan', 'maaf',
        ];

        foreach ($narasi as $key => $value) {
            if (! is_string($value)) {
                $cleaned[$key] = '';

                continue;
            }

            // Remove markdown code blocks if the AI accidentally wraps text in ```
            $value = preg_replace('/^```(?:json)?\s*|\s*```$/m', '', $value);

            // Remove introductory filler phrases
            foreach ($fillerPhrases as $phrase) {
                $value = preg_replace('/^'.preg_quote($phrase, '/').'.*?[.:]\s*/i', '', $value);
            }

            // Discard if it's essentially empty or a refusal to answer
            if (strlen(trim($value)) < 15 || stripos($value, 'tidak disebutkan') !== false) {
                $value = '';
            }

            $cleaned[$key] = trim($value);
        }

        return $cleaned;
    }

    private function cleanDocumentText(string $text): string
    {
        // 1. Cut off irrelevant sections at the end of the document
        $stopWords = ['DAFTAR PUSTAKA', 'LAMPIRAN', 'REFERENSI', 'DAFTAR ISI', 'KATA PENGANTAR'];
        foreach ($stopWords as $word) {
            $pos = stripos($text, $word);
            if ($pos !== false) {
                $text = substr($text, 0, $pos); // Delete everything from this word onwards
            }
        }

        // 2. Remove common PDF artifacts, page numbers, and repetitive headers
        $text = preg_replace('/\n\s*(Halaman|Page)\s*\d+.*?\n/i', ' ', $text);
        $text = preg_replace('/\n\s*\d+\s*\n/', ' ', $text); // Removes standalone page numbers

        // 3. Normalize whitespace
        $text = preg_replace('/[ \t]+/', ' ', $text);
        $text = preg_replace('/\n{3,}/', "\n\n", $text);

        return trim($text);
    }

    // ──────────────────────────────────────────────────────────────
    // Dynamic figure insertion & placeholder cleanup
    // ──────────────────────────────────────────────────────────────

    /**
     * key   = section key returned by PdfImageExtractorService::extractSectionImages()
     * value = caption keyword ("Gambar N. ...") used to locate orphan captions.
     */
    protected const FIGURE_SECTIONS = [
        'peta_lokasi' => 'Peta Lokasi',
        'batimetri' => 'Peta Batimetri',
        'arus' => 'Mawar Arus',
        'gelombang' => 'Mawar Gelombang',
        'pasang_surut' => 'Grafik Pasang Surut',
        'ekosistem' => 'Peta Sebaran Ekosistem',
        'pemanfaatan_ruang' => 'Pemanfaatan Ruang Laut',
        'profil_dasar_laut' => 'Profil Dasar Laut',
    ];

    /**
     * Insert extracted images ONLY where the template has a ${gambar_<section>}
     * placeholder. Returns the list of sections that were actually inserted.
     */
    private function insertSectionImages(TemplateProcessor $tp, array $sectionImages): array
    {
        $inserted = [];
        $variables = $tp->getVariables();

        foreach ($sectionImages as $section => $imagePath) {
            $placeholder = "gambar_{$section}";

            if (! is_string($imagePath) || ! file_exists($imagePath)) {
                continue;
            }

            // Template doesn't ask for this figure → skip silently
            if (! in_array($placeholder, $variables, true)) {
                continue;
            }

            try {
                [$w, $h] = $this->fitImageDimensions($imagePath, 450, 300);

                $tp->setImageValue($placeholder, [
                    'path' => $imagePath,
                    'width' => $w,
                    'height' => $h,
                    'ratio' => true,
                ]);

                $inserted[] = $section;
            } catch (Exception $e) {
                Log::warning("Gagal menyisipkan gambar {$section}: ".$e->getMessage());
            }
        }

        return $inserted;
    }

    /** Fit image inside max bounds while keeping aspect ratio. */
    private function fitImageDimensions(string $path, int $maxW, int $maxH): array
    {
        $size = @getimagesize($path);

        if (! $size || $size[0] === 0 || $size[1] === 0) {
            return [$maxW, $maxH];
        }

        $scale = min($maxW / $size[0], $maxH / $size[1], 1);

        return [(int) round($size[0] * $scale), (int) round($size[1] * $scale)];
    }

    /** Blank-out every ${...} token that was never filled. */
    private function purgeRemainingPlaceholders(TemplateProcessor $tp): void
    {
        foreach ($tp->getVariables() as $variable) {
            $tp->setValue($variable, '');
        }
    }

    /**
     * Post-save cleanup on the DOCX XML:
     *  1. Delete "Gambar N. ..." caption paragraphs whose image was NOT inserted.
     *  2. Strip any leftover ${...} macros (tolerant of macros split across XML runs).
     */
    private function removeOrphanCaptions(string $docxPath, array $insertedSections): void
    {
        $zip = new ZipArchive;
        if ($zip->open($docxPath) !== true) {
            return;
        }

        $xml = $zip->getFromName('word/document.xml');
        if ($xml === false) {
            $zip->close();

            return;
        }

        // 1. Orphan captions (image missing → remove its caption line)
        foreach (self::FIGURE_SECTIONS as $section => $keyword) {
            if (in_array($section, $insertedSections, true)) {
                continue; // image present → keep caption
            }

            $pattern = '/<w:p\b[^>]*>(?:(?!<\/w:p>).)*?Gambar\s*\d+\.(?:(?!<\/w:p>).)*?'
            .preg_quote($keyword, '/')
                .'(?:(?!<\/w:p>).)*?<\/w:p>/s';

            $xml = preg_replace($pattern, '', $xml);
        }

        // 2. Leftover macros, tolerant of run-splitting like <w:t>${</w:t><w:t>gambar_x}</w:t>
        $xml = preg_replace('/\$(?:<[^>]+>)*\{(?:(?:<[^>]+>)|[^{}<])*\}/s', '', $xml);

        $zip->addFromString('word/document.xml', $xml);
        $zip->close();
    }
}
