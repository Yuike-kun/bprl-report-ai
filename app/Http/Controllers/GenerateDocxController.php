<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\GeneralDraft;
use App\Services\GeminiService;
use App\Services\PdfImageExtractorService;
use DOMDocument;
use DOMXPath;
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
        $zip = new ZipArchive();
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
                '/<w:p\b[^>]*>(?:(?!<\/w:p>).)*?' . preg_quote($marker, '/') . '(?:(?!<\/w:p>).)*?<\/w:p>/s',
                '',
                $xml
            );
        }

        // 2. Delete dummy table rows
        foreach (self::DUMMY_ROW_MARKERS as $marker) {
            $xml = preg_replace(
                '/<w:tr\b[^>]*>(?:(?!<\/w:tr>).)*?' . preg_quote($marker, '/') . '(?:(?!<\/w:tr>).)*?<\/w:tr>/s',
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

        $zip = new ZipArchive();
        if ($zip->open($docxPath) !== true) {
            return;
        }

        $xml = $zip->getFromName('word/document.xml');
        if ($xml === false) {$zip->close();return;}

        libxml_use_internal_errors(true);
        if (strpos($xml, '<?xml') === false) {
            $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" . $xml;
        }

        $dom = new DOMDocument();
        if (! $dom->loadXML($xml)) {$zip->close();return;}

        $xpath = new DOMXPath($dom);
        $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

        $body = $xpath->query('//w:body')->item(0);
        if (! $body) {$zip->close();return;}

        $isInsideReklamasi = false;
        $nodesToRemove     = [];

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
        protected GeminiService $gemini,
        protected PdfImageExtractorService $imageExtractor,
    ) {
    }

    public function generateFromProposal(int $proposalId)
    {
        $proposal = \App\Models\KkprlProposal::findOrFail($proposalId);

        $data = [
            // Identitas Pemohon
            'Nama Pemohon'             => $proposal->applicant_name ?? '',
            'Jabatan Pemohon'          => $proposal->applicant_position ?? '',
            'Nama Perusahaan/Instansi' => $proposal->company_name ?? '',
            'NIB'                      => $proposal->nib ?? '',
            'NPWP'                     => $proposal->npwp ?? '',
            'Nomor Telepon Selular'    => $proposal->phone_number ?? '',
            'Surat Elektronik'         => $proposal->email ?? '',

            // Kegiatan & Lokasi
            'Jenis Kegiatan'           => $proposal->activity_type ?? '',
            'Nama Perairan'            => $proposal->water_name ?? '',
            'Luas Kebutuhan Ruang'     => $proposal->area_size ? $proposal->area_size . ' Ha' : '',
            'KBLI'                     => $proposal->activity_category ?? '',
            'Tanggal Penyusunan'       => $proposal->created_at ? $proposal->created_at->format('d F Y') : now()->format('d F Y'),
            'Provinsi'                 => $proposal->province ?? '',
            'Kabupaten'                => $proposal->regency ?? '',
            'Kecamatan'                => $proposal->district ?? '',
            'Desa'                     => $proposal->village ?? '',

            // Investasi & Tenaga Kerja
            'investasi'                => $proposal->investment_value ? 'Rp ' . number_format((float) $proposal->investment_value, 0, ',', '.') : '',
            'tenaga_kerja'             => $proposal->local_workers ?? '0',
            'tenaga_kerja_asing'       => $proposal->foreign_workers ?? '0',

            // Social & Eco
            'desa_luas_ha'             => $proposal->village_area ?? '',
            'desa_penduduk'            => $proposal->population_count ?? '',

            // Legacy keys compatibility
            'nama_perusahaan'          => $proposal->company_name ?? '',
            'nib'                      => $proposal->nib ?? '',
            'npwp'                     => $proposal->npwp ?? '',
            'telp'                     => $proposal->phone_number ?? '',
            'email'                    => $proposal->email ?? '',
            'jenis_kegiatan'           => $proposal->activity_type ?? '',
            'no_referensi'             => 'KKPRL-' . str_pad((string) $proposal->id, 5, '0', STR_PAD_LEFT),
            'tanggal_penyusunan'       => $proposal->created_at ? $proposal->created_at->format('d F Y') : now()->format('d F Y'),
            'nama_perairan'            => $proposal->water_name ?? '',
            'provinsi'                 => $proposal->province ?? '',
            'kabupaten'                => $proposal->regency ?? '',
            'kecamatan'                => $proposal->district ?? '',
            'desa'                     => $proposal->village ?? '',
            'uraian_kegiatan'          => $proposal->activity_description ?? '',
            'jadwal_konstruksi'        => $proposal->schedule_description ?? '',
            'luas_ruang_total'         => $proposal->area_size ? $proposal->area_size . ' Ha' : '',
            'ada_reklamasi'            => $proposal->is_reclamation ? 'Ya' : 'Tidak',
        ];

        // ── AI narasi: try to extract from uploaded proposal file ──────────
        $narasi = [
            'nama_pemohon'       => $proposal->applicant_name ?? '',
            'jabatan_pemohon'    => $proposal->applicant_position ?? '',
            'tujuan_kegiatan'    => $proposal->activity_purpose ?? '',
            'manfaat_kegiatan'   => $proposal->activity_benefit ?? '',
            'deskripsi_kegiatan' => $proposal->activity_description ?? '',
            'nilai_investasi'    => $proposal->investment_value ? 'Rp ' . number_format((float) $proposal->investment_value, 0, ',', '.') : '',
        ];

        $tempImages = [];

        // 1. Extract text from the uploaded proposal (existing_doc_path)
        $proposalDocPath = $proposal->existing_doc_path;
        if ($proposalDocPath) {
            $fullPath = Storage::disk('public')->exists($proposalDocPath)
                ? Storage::disk('public')->path($proposalDocPath)
                : null;

            if ($fullPath && file_exists($fullPath)) {
                try {
                    $documentText = $this->extractTextFromFile($fullPath, basename($fullPath));
                    $documentText = $this->cleanDocumentText($documentText);

                    if (!empty(trim($documentText))) {
                        $profileContext = array_filter($data, fn($v) => !is_null($v) && $v !== '');
                        $aiNarasi = $this->gemini->generateNarasi($documentText, $profileContext);
                        $aiNarasi = $this->cleanAiOutput($aiNarasi);
                        // Merge AI output into narasi (AI wins over empty defaults)
                        foreach ($aiNarasi as $key => $value) {
                            if (!empty($value)) {
                                $narasi[$key] = $value;
                            }
                        }
                    }
                } catch (\Exception $e) {
                    Log::warning('AI narasi extraction skipped for proposal ' . $proposalId . ': ' . $e->getMessage());
                }
            }
        }

        // 2. Extract images from hydro-oceanography report (hydro_oceanography_doc_path)
        $hydroDocPath = $proposal->hydro_oceanography_doc_path;
        if ($hydroDocPath) {
            $hydroFullPath = Storage::disk('public')->exists($hydroDocPath)
                ? Storage::disk('public')->path($hydroDocPath)
                : null;

            if ($hydroFullPath && file_exists($hydroFullPath)) {
                if (strtolower(pathinfo($hydroFullPath, PATHINFO_EXTENSION)) === 'pdf') {
                    try {
                        $tempImages = $this->imageExtractor->extractSectionImages($hydroFullPath);
                    } catch (\Exception $e) {
                        Log::warning('Image extraction from hydro doc skipped: ' . $e->getMessage());
                    }
                }
            }
        }

        $templatePath = public_path('template-docx.docx');
        $outputPath   = storage_path('app/tmp/Proposal_PKKPRL_' . uniqid() . '.docx');

        if (! is_dir(dirname($outputPath))) {
            mkdir(dirname($outputPath), 0755, true);
        }

        try {
            if (file_exists($templatePath)) {
                $this->fillTemplate($templatePath, $outputPath, $data, $narasi, $tempImages);
            } else {
                $this->buildDocxFromScratch($data, $narasi, $outputPath);
            }

            $this->removeReklamasiSection($outputPath, (bool) $proposal->is_reclamation);

            $timestamp = now()->format("HisYmd");

            return response()->download($outputPath, 'Proposal_PKKPRL_' . $timestamp . '.docx')
                ->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            Log::error('Gagal generate docx from proposal', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memproses dokumen: ' . $e->getMessage()], 500);
        } finally {
            foreach ($tempImages as $imgPath) {
                @unlink($imgPath);
            }
        }
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

        $adaReklamasi = $rec?->ada_reklamasi ?? 'Tidak';
        $isReklamasi  = in_array(
            strtolower(trim((string) $adaReklamasi)),
            ['ya', 'ada', 'true', '1', 'reklamasi', 'yes']
        );
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

            $this->removeReklamasiSection($outputPath, $isReklamasi);

            $timestamp_name = now()->format("HisYmd");

            return response()->download($outputPath, 'Proposal_PKKPRL_'.$timestamp_name.'.docx')
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
    // DASHBOARD: Upload files → extract via AI → save as "on_review" → redirect
    // Accepts: proposal (required), laporan/report (optional)
    // Returns: Redirect to kkprl-proposal.review for user correction & download
    // ──────────────────────────────────────────────────────────────────────────
    public function reviewAndGenerate(Request $request)
    {
        $request->validate([
            'proposal' => ['required', 'file', 'mimes:pdf,docx', 'max:262144'],
            'laporan'  => ['nullable', 'file', 'mimes:pdf,docx', 'max:262144'],
            'report'   => ['nullable', 'file', 'mimes:pdf,docx', 'max:262144'],
        ]);

        $proposalFile = $request->file('proposal');
        // Python uses "laporan", dashboard sends "report" — accept both
        $laporanFile  = $request->file('laporan') ?? $request->file('report');

        try {
            // ── 1. Extract text from proposal ─────────────────────────────
            $proposalPath = $proposalFile->getRealPath();
            $proposalText = $this->extractTextFromFile($proposalPath, $proposalFile->getClientOriginalName());
            $proposalText = $this->cleanDocumentText($proposalText);

            // ── 2. Extract text from laporan (if provided) ─────────────────
            $laporanText = '';
            if ($laporanFile) {
                $laporanPath = $laporanFile->getRealPath();
                $laporanText = $this->extractTextFromFile($laporanPath, $laporanFile->getClientOriginalName());
                $laporanText = $this->cleanDocumentText($laporanText);
            }

            // ── 3. AI extraction from combined text ────────────────────────
            $combinedText = trim($proposalText . "\n\n" . $laporanText);
            $narasi = [];
            if (!empty($combinedText)) {
                $rawNarasi = $this->gemini->generateNarasi($combinedText, []);
                $narasi    = $this->cleanAiOutput($rawNarasi);
            }

            // ── 4. Store uploaded files permanently ───────────────────────
            $storedProposalPath = $proposalFile->store('kkprl', 'public');
            $storedLaporanPath  = $laporanFile ? $laporanFile->store('kkprl', 'public') : null;

            // ── 5. Save to kkprl_proposals DB with status = on_review ─────
            $kkprlProposal = \App\Models\KkprlProposal::create([
                'status'                      => 'on_review',
                'applicant_name'              => $narasi['nama_pemohon'] ?? null,
                'applicant_position'          => $narasi['jabatan_pemohon'] ?? null,
                'company_name'                => $narasi['nama_perusahaan'] ?? null,
                'phone_number'                => $narasi['telp'] ?? null,
                'email'                       => $narasi['email'] ?? null,
                'activity_type'               => $narasi['jenis_kegiatan'] ?? null,
                'water_name'                  => $narasi['nama_perairan'] ?? null,
                'area_size'                   => is_numeric($narasi['luas_ruang_total'] ?? null)
                                                    ? $narasi['luas_ruang_total']
                                                    : null,
                'province'                    => $narasi['provinsi'] ?? null,
                'regency'                     => $narasi['kabupaten'] ?? null,
                'district'                    => $narasi['kecamatan'] ?? null,
                'village'                     => $narasi['desa'] ?? null,
                'activity_description'        => $narasi['deskripsi_kegiatan'] ?? ($narasi['uraian_kegiatan'] ?? null),
                'activity_purpose'            => $narasi['tujuan_kegiatan'] ?? null,
                'activity_benefit'            => $narasi['manfaat_kegiatan'] ?? null,
                'schedule_description'        => $narasi['jadwal_konstruksi'] ?? null,
                'is_reclamation'              => in_array(
                                                    strtolower((string) ($narasi['ada_reklamasi'] ?? 'tidak')),
                                                    ['ya', 'yes', '1', 'true']
                                                ),
                'existing_doc_path'           => $storedProposalPath,
                'hydro_oceanography_doc_path' => $storedLaporanPath,
            ]);

            // ── 6. Redirect to review page so user can verify & download ──
            return redirect()->route('kkprl-proposal.review', $kkprlProposal->id);

        } catch (Exception $e) {
            Log::error('reviewAndGenerate failed', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Gagal memproses dokumen: ' . $e->getMessage(),
            ], 500);
        }
    }


    // ──────────────────────────────────────────────────────────────────────────
    // LEGACY: Upload PDF + DOCX template together, generate on the fly
    // ──────────────────────────────────────────────────────────────────────────
    public function generate(Request $request)
    {
        $request->validate([
            'laporan_pdf'        => ['nullable', 'file', 'mimes:pdf,docx', 'max:30720'],
            'template_docx'      => ['nullable', 'file', 'mimes:docx', 'max:30720'],
            'proposal'           => ['nullable', 'file', 'mimes:pdf,docx', 'max:30720'],
            'report'             => ['nullable', 'file', 'mimes:pdf,docx', 'max:30720'],
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

            $inserted = $this->insertSectionImages($templateProcessor, $tempImages);
            $this->purgeRemainingPlaceholders($templateProcessor);

            $outputPath = storage_path('app/tmp/Proposal_Terisi_' . uniqid() . '.docx');
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

            // ✅ STEP 1: Clean the raw PDF text
            $documentText = $this->cleanDocumentText($documentText);

            if (empty(trim($documentText))) {
                return response()->json(['message' => 'Dokumen tidak mengandung teks yang relevan.'], 422);
            }

            $profileContext = array_filter(
                $request->only(self::ALL_FIELDS),
                fn($val) => ! is_null($val) && $val !== ''
            );

            $rawResponse = $this->gemini->generateNarasi($documentText, $profileContext);

            // ✅ STEP 2: Clean the AI output
            $cleanedNarasi = $this->cleanAiOutput($rawResponse);

            // ✅ FIX: Return ALL sections dynamically, not just the hardcoded 5
            return response()->json([
                'success' => true,
                'narasi'  => $cleanedNarasi,
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
            } catch (\Exception) {}
        }

        // 2. Fill ALL AI narrative sections dynamically
        foreach ($narasi as $key => $value) {
            try {
                $tp->setValue($key, htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'));
            } catch (\Exception) {}
        }

        // 3. Images & Cleanup
        $inserted = $this->insertSectionImages($tp, $sectionImages);
        $this->purgeRemainingPlaceholders($tp);

        $tp->saveAs($outputPath);

        $this->removeOrphanCaptions($outputPath, $inserted);
        $this->cleanDummyContent($outputPath); // The safe DOM version
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
        $sectionsToCheck = [
            'Batimetri'         => 'batimetri',
            'Gelombang'         => 'gelombang',
            'Arus'              => 'arus',
            'Pasang Surut'      => 'pasang_surut',
            'Ekosistem Pesisir' => 'ekosistem_pesisir',
        ];
        foreach ($sectionsToCheck as $label => $key) {
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

    private function cleanAiOutput(array $narasi): array
    {
        $cleaned       = [];
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
                $value = preg_replace('/^' . preg_quote($phrase, '/') . '.*?[.:]\s*/i', '', $value);
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
        'peta_lokasi'       => 'Peta Lokasi',
        'batimetri'         => 'Peta Batimetri',
        'arus'              => 'Mawar Arus',
        'gelombang'         => 'Mawar Gelombang',
        'pasang_surut'      => 'Grafik Pasang Surut',
        'ekosistem'         => 'Peta Sebaran Ekosistem',
        'pemanfaatan_ruang' => 'Pemanfaatan Ruang Laut',
        'profil_dasar_laut' => 'Profil Dasar Laut',
    ];

    /**
     * Insert extracted images ONLY where the template has a ${gambar_<section>}
     * placeholder. Returns the list of sections that were actually inserted.
     */
    private function insertSectionImages(TemplateProcessor $tp, array $sectionImages): array
    {
        $inserted  = [];
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
                    'path'   => $imagePath,
                    'width'  => $w,
                    'height' => $h,
                    'ratio'  => true,
                ]);

                $inserted[] = $section;
            } catch (\Exception $e) {
                Log::warning("Gagal menyisipkan gambar {$section}: " . $e->getMessage());
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
        $zip = new ZipArchive();
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
            . preg_quote($keyword, '/')
                . '(?:(?!<\/w:p>).)*?<\/w:p>/s';

            $xml = preg_replace($pattern, '', $xml);
        }

        // 2. Leftover macros, tolerant of run-splitting like <w:t>${</w:t><w:t>gambar_x}</w:t>
        $xml = preg_replace('/\$(?:<[^>]+>)*\{(?:(?:<[^>]+>)|[^{}<])*\}/s', '', $xml);

        $zip->addFromString('word/document.xml', $xml);
        $zip->close();
    }
}
