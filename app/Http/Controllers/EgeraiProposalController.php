<?php

namespace App\Http\Controllers;

use App\Models\EgeraiJob;
use App\Models\KkprlProposal;
use App\Services\DocumentImageExtractor;
use App\Services\Egerai\EgeraiApiClient;
use App\Services\Egerai\EgeraiExtractionService;
use App\Services\Egerai\LaporanTextExtractor;
use App\Services\Egerai\ProposalTextExtractor;
use App\Services\ProposalDocumentGenerator;
use App\Support\TextCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Faithful 1:1 port of the reference e-GeRAI Python app's core pipeline:
 *   app.py `/` (upload) -> `/review` (extract + review form) -> `/finalize` (generate + download).
 * job_store.py's on-disk job folder becomes an `EgeraiJob` DB row (JSON field
 * columns) + a private storage folder for the extracted images.
 */
class EgeraiProposalController extends Controller
{
    public function create()
    {
        return inertia('egerai/create');
    }

    public function store(Request $request, EgeraiExtractionService $extractor)
    {
        $validated = $request->validate([
            'proposal' => ['required', 'file', 'extensions:pdf,doc,docx', 'max:30720'],
            'laporan' => ['nullable', 'file', 'extensions:pdf,doc,docx', 'max:30720'],
        ]);

        $this->cleanupExpiredJobs();

        $job = EgeraiJob::create(['status' => 'needs_review']);
        $dir = $job->storageDir();
        File::ensureDirectoryExists($dir);

        try {
            $propFile = $validated['proposal'];
            $propPath = $dir.'/proposal.'.$propFile->getClientOriginalExtension();
            $propFile->move($dir, basename($propPath));

            $propFields = $extractor->extractProposal($propPath);
            $propImages = (new DocumentImageExtractor)->extract($propPath, 'proposal', $dir.'/images-proposal');

            $lapFields = [];
            $lapImages = [];
            $lapSourcePath = null;
            $lapSourceFilename = null;
            if ($request->hasFile('laporan')) {
                $lapFile = $validated['laporan'];
                $lapPath = $dir.'/laporan.'.$lapFile->getClientOriginalExtension();
                $lapFile->move($dir, basename($lapPath));
                $lapFields = $extractor->extractLaporan($lapPath);
                $lapImages = (new DocumentImageExtractor)->extract($lapPath, 'laporan', $dir.'/images-laporan');
                $lapSourcePath = basename($lapPath);
                $lapSourceFilename = $lapFile->getClientOriginalName();
            }

            $propImageManifest = $this->manifest($propImages, $dir);
            $lapImageManifest = $this->manifest($lapImages, $dir);

            $job->update([
                'user_id' => $request->user()?->id,
                'prop_source_path' => basename($propPath),
                'prop_source_filename' => $propFile->getClientOriginalName(),
                'lap_source_path' => $lapSourcePath,
                'lap_source_filename' => $lapSourceFilename,
                'prop_fields' => $propFields,
                'lap_fields' => $lapFields,
                'prop_images' => $propImageManifest,
                'lap_images' => $lapImageManifest,
                'preview_html' => $this->renderPreview($propFields, $propImages, $lapFields, $lapImages),
            ]);
        } catch (\Throwable $exception) {
            File::deleteDirectory($dir);
            $job->delete();
            report($exception);

            return back()->withErrors(['proposal' => 'Gagal memproses dokumen: '.$exception->getMessage()]);
        }

        return redirect()->route('egerai.review', $job);
    }

    public function review(EgeraiJob $egeraiJob)
    {
        return inertia('egerai/review', [
            'job' => $this->present($egeraiJob),
        ]);
    }

    public function update(Request $request, EgeraiJob $egeraiJob)
    {
        $validated = $request->validate([
            'prop_fields' => ['required', 'array'],
            'prop_fields.*' => ['nullable'],
            'lap_fields' => ['nullable', 'array'],
            'lap_fields.*' => ['nullable'],
        ]);

        $propFields = array_merge($egeraiJob->prop_fields ?? [], $validated['prop_fields']);
        $lapFields = array_merge($egeraiJob->lap_fields ?? [], $validated['lap_fields'] ?? []);

        $dir = $egeraiJob->storageDir();
        $propImages = $this->resolveManifest($egeraiJob->prop_images ?? [], $dir);
        $lapImages = $this->resolveManifest($egeraiJob->lap_images ?? [], $dir);

        $egeraiJob->update([
            'prop_fields' => $propFields,
            'lap_fields' => $lapFields,
            'status' => 'ready',
            'preview_html' => $this->renderPreview($propFields, $propImages, $lapFields, $lapImages),
        ]);

        return back()->with('success', 'Perubahan tersimpan.');
    }

    public function download(EgeraiJob $egeraiJob)
    {
        $dir = $egeraiJob->storageDir();
        $propImages = $this->resolveManifest($egeraiJob->prop_images ?? [], $dir);
        $lapImages = $this->resolveManifest($egeraiJob->lap_images ?? [], $dir);

        $outputPath = storage_path('app/tmp/Proposal_PKKPRL_'.$egeraiJob->job_id.'.docx');
        if (! is_dir(dirname($outputPath))) {
            mkdir(dirname($outputPath), 0755, true);
        }

        try {
            (new ProposalDocumentGenerator)->buildDocument(
                $egeraiJob->prop_fields ?? [],
                $propImages,
                $egeraiJob->lap_fields ?? [],
                $lapImages,
                $outputPath,
            );

            $filename = 'Proposal_PKKPRL_'.now()->format('Ymd_His').'.docx';

            // Persist a real KkprlProposal row so this submission shows up in
            // the staff master panel (assignment/dashboard/review workflow) —
            // egerai is the public data-collection front-end, but every
            // submission still needs to land in the same case-management
            // table the rest of the app already relies on.
            try {
                $this->createKkprlProposalFromJob($egeraiJob, $propImages, $lapImages);
            } catch (\Throwable $exception) {
                Log::error('Gagal mencatat KkprlProposal dari egerai job', ['job_id' => $egeraiJob->job_id, 'message' => $exception->getMessage()]);
            }

            // Job folder + row are only needed until the final document is
            // built; delete them now (matches job_store.py's "cleanup right
            // after finalize succeeds" behaviour) — the generated .docx at
            // $outputPath is independent and still gets streamed below.
            File::deleteDirectory($dir);
            $egeraiJob->delete();

            return response()->download($outputPath, $filename)->deleteFileAfterSend(true);
        } catch (\Throwable $exception) {
            Log::error('Gagal finalize dokumen e-GeRAI', ['job_id' => $egeraiJob->job_id, 'message' => $exception->getMessage()]);

            return back()->withErrors(['finalize' => 'Gagal membuat dokumen: '.$exception->getMessage()]);
        }
    }

    /**
     * Experimental alternate engine: generates the final document via the
     * standalone e-GerAI Python API instead of the local
     * ProposalDocumentGenerator. Both source files are required because the
     * external /api/v1/dokumen/ekstrak endpoint mandates both proposal AND
     * laporan (unlike the local flow, where laporan is optional). Only the
     * ~35 fields EgeraiApiClient::KOREKSI_FIELDS covers can be corrected —
     * anything else reflects the external API's own fresh extraction, not
     * this job's locally-edited prop_fields/lap_fields. See EgeraiApiClient
     * class docblock for the full explanation.
     */
    public function generateViaExternalApi(EgeraiJob $egeraiJob, EgeraiApiClient $client)
    {
        $dir = $egeraiJob->storageDir();
        $propPath = $egeraiJob->prop_source_path ? $dir.'/'.$egeraiJob->prop_source_path : null;
        $lapPath = $egeraiJob->lap_source_path ? $dir.'/'.$egeraiJob->lap_source_path : null;

        if (! $propPath || ! is_file($propPath) || ! $lapPath || ! is_file($lapPath)) {
            return back()->withErrors([
                'finalize' => 'API eksternal membutuhkan dokumen Proposal DAN Laporan (keduanya wajib diunggah); job ini tidak memiliki salah satunya.',
            ]);
        }

        try {
            $extracted = $client->extract($propPath, $lapPath);
            $docxBytes = $client->generate(
                $extracted['job_id'],
                $egeraiJob->prop_fields ?? [],
                $egeraiJob->lap_fields ?? [],
            );

            try {
                $propImages = $this->resolveManifest($egeraiJob->prop_images ?? [], $dir);
                $lapImages = $this->resolveManifest($egeraiJob->lap_images ?? [], $dir);
                $this->createKkprlProposalFromJob($egeraiJob, $propImages, $lapImages);
            } catch (\Throwable $exception) {
                Log::error('Gagal mencatat KkprlProposal dari egerai job (API eksternal)', ['job_id' => $egeraiJob->job_id, 'message' => $exception->getMessage()]);
            }

            $filename = 'Proposal_PKKPRL_API_'.now()->format('Ymd_His').'.docx';

            File::deleteDirectory($dir);
            $egeraiJob->delete();

            return response($docxBytes, 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            ]);
        } catch (\Throwable $exception) {
            Log::error('Gagal generate dokumen via API eksternal e-GeRAI', ['job_id' => $egeraiJob->job_id, 'message' => $exception->getMessage()]);

            return back()->withErrors(['finalize' => 'Gagal membuat dokumen via API eksternal: '.$exception->getMessage()]);
        }
    }

    /**
     * Maps the job's prop/lap dict fields onto KkprlProposal's columns and
     * moves its images onto the `public` disk, so the submission is visible
     * to the staff master panel / assignment / dashboard workflow exactly
     * like a submission from the old wizard would have been.
     */
    private function createKkprlProposalFromJob(EgeraiJob $egeraiJob, array $propImages, array $lapImages): KkprlProposal
    {
        $prop = $egeraiJob->prop_fields ?? [];
        $loc = $prop['_lokasi_parts'] ?? ['', '', '', ''];
        // Parts may still be ALL CAPS for jobs extracted before
        // ProposalTextExtractor normalised them — fix at the persistence
        // boundary so the master panel and previews never show caps.
        $locAt = fn (int $i): string => TextCase::humanize(is_string($loc[$i] ?? null) ? $loc[$i] : null) ?? '-';

        $isReclamation = ! empty($prop['reklamasi']) ? true : (! empty($prop['non_reklamasi']) ? false : false);
        $isBusiness = ! empty($prop['kegiatan_berusaha']) ? true : (! empty($prop['non_berusaha']) ? false : null);
        $isStrategic = ! empty($prop['non_strategis']) ? false : null;

        // Shared with ProposalDocumentGenerator::docChapterThree() so the docx
        // narrative and this KkprlProposal row never disagree on whether an
        // ecosystem was actually detected.
        $hasMangrove = ProposalDocumentGenerator::hasEcosystemData($prop, 'mangrove_spesies', 'mangrove_ada', 'Terdapat ekosistem mangrove');
        $hasSeagrass = ProposalDocumentGenerator::hasEcosystemData($prop, 'lamun_spesies', 'lamun_ada_manual', 'Terdapat ekosistem lamun');
        $hasCoral = ProposalDocumentGenerator::hasEcosystemData($prop, 'karang_spesies', 'karang_ada', 'Terdapat ekosistem terumbu karang');

        $coordinatesText = collect($prop['koordinat'] ?? [])
            ->map(fn ($row) => trim(($row[1] ?? '').' '.($row[2] ?? '')))
            ->filter()
            ->implode("\n");

        $marineSpatialDescription = collect([
            filled($prop['batas_utara'] ?? null) ? "Utara: {$prop['batas_utara']}." : null,
            filled($prop['batas_timur'] ?? null) ? "Timur: {$prop['batas_timur']}." : null,
            filled($prop['batas_selatan'] ?? null) ? "Selatan: {$prop['batas_selatan']}." : null,
            filled($prop['batas_barat'] ?? null) ? "Barat: {$prop['batas_barat']}." : null,
            $prop['deskripsi_pemanfaatan_sekitar'] ?? null,
        ])->filter()->implode(' ');

        $data = [
            'applicant_name' => $prop['Nama Pemohon'] ?? '-',
            'applicant_position' => $prop['Jabatan Pemohon'] ?? '-',
            'company_name' => $prop['Nama Perusahaan/Instansi'] ?? '-',
            'nib' => $prop['NIB'] ?? null,
            'npwp' => $prop['NPWP'] ?? null,
            'phone_number' => $prop['Nomor Telepon Selular'] ?? '-',
            'email' => $prop['Surat Elektronik'] ?? '-',
            'officer_email' => $prop['Surat Elektronik'] ?? '-',
            'activity_type' => $prop['Jenis Kegiatan'] ?? '-',
            'water_name' => $prop['Nama Perairan'] ?? '-',
            'area_size' => (float) preg_replace('/[^\d.]/', '', (string) ($prop['Luas Kebutuhan Ruang'] ?? '0')) ?: 0,
            'village' => $locAt(0),
            'district' => $locAt(1),
            'regency' => $locAt(2),
            'province' => $locAt(3),
            'activity_status' => ($prop['kegiatan_status'] ?? '') ?: 'Rencana',
            'activity_category' => $prop['KBLI'] ?? '-',
            'activity_details' => array_filter([$prop['Jenis Kegiatan'] ?? null]),
            'is_reclamation' => $isReclamation,
            'is_business_activity' => $isBusiness,
            'is_national_strategic' => $isStrategic,
            'coordinates' => $coordinatesText ?: '-',
            'marine_installation' => $prop['instalasi_bangunan'] ?? null,
            'installation_location' => array_values(array_filter(explode(', ', (string) ($prop['instalasi_posisi'] ?? '')))),
            'activity_description' => ($prop['deskripsi_kegiatan'] ?? '') ?: '-',
            'activity_benefit' => ($prop['manfaat_kegiatan'] ?? '') ?: '-',
            'activity_purpose' => ($prop['tujuan_kegiatan'] ?? '') ?: '-',
            'local_workers' => ($prop['tenaga_kerja'] ?? '') ?: '0',
            'foreign_workers' => ($prop['tenaga_kerja_asing'] ?? '') ?: '0',
            'investment_value' => ($prop['investasi'] ?? '') ?: '0',
            'schedule_description' => ($prop['jadwal_kegiatan'] ?? '') ?: '-',
            'supporting_documents' => $this->mapDukungLabelsToKeys($prop['_dukung_checked_labels'] ?? []),
            'map_source' => ($prop['sumber_peta'] ?? '') ?: '-',
            'population_count' => ($prop['desa_penduduk'] ?? '') ?: '0',
            'village_area' => ($prop['desa_luas_ha'] ?? '') ?: '0',
            'livelihood_description' => ($prop['mata_pencaharian'] ?? '') ?: '-',
            'sosek_data_source' => ($prop['sumber_data_sosek'] ?? '') ?: 'Badan Pusat Statistik',
            'sosek_data_year' => ($prop['tahun_data_sosek'] ?? '') ?: (string) now()->year,
            'accessibility_description' => ($prop['aksesibilitas_lokasi'] ?? '') ?: '-',
            'accessibility_map_path' => '',
            'hydro_oceanography_doc_path' => '',
            'has_mangrove' => $hasMangrove,
            'mangrove_species' => ($prop['mangrove_spesies'] ?? '') ?: null,
            'mangrove_cover_percentage' => filled($prop['mangrove_persen'] ?? null) ? $prop['mangrove_persen'] : null,
            'mangrove_condition' => ($prop['mangrove_kondisi'] ?? '') ?: null,
            'has_seagrass' => $hasSeagrass,
            'seagrass_species' => ($prop['lamun_spesies'] ?? '') ?: null,
            'seagrass_cover_percentage' => filled($prop['lamun_persen'] ?? null) ? $prop['lamun_persen'] : null,
            'seagrass_condition' => ($prop['lamun_kondisi'] ?? '') ?: null,
            'has_coral_reef' => $hasCoral,
            'coral_reef_species' => ($prop['karang_spesies'] ?? '') ?: null,
            'coral_reef_cover_percentage' => filled($prop['karang_persen_manual'] ?? null) ? $prop['karang_persen_manual'] : null,
            'coral_reef_condition' => ($prop['karang_kondisi'] ?? '') ?: null,
            'marine_spatial_activity_description' => $marineSpatialDescription ?: '-',
        ];

        $tagToColumn = [
            'siteplan' => 'site_plan_path',
            'peta_lokasi' => 'location_map_path',
            'foto_mangrove' => 'mangrove_doc_path',
            'foto_karang_insitu' => 'coral_reef_doc_path',
            'foto_lamun' => 'seagrass_doc_path',
            'gambar_aksesibilitas' => 'accessibility_map_path',
            'sertifikat_lahan' => 'land_certificate_path',
            'dok_sosialisasi' => 'socialization_doc_path',
            'dukung_dokumen' => 'other_supporting_doc_path',
        ];
        foreach ($tagToColumn as $tag => $column) {
            $path = $propImages[$tag][0] ?? $lapImages[$tag][0] ?? null;
            if ($path) {
                $data[$column] = $this->moveToPublicDisk($path);
            }
        }
        $polaRuang = array_merge($propImages['peta_pola_ruang'] ?? [], $propImages['foto_pantai'] ?? []);
        if ($polaRuang) {
            $data['marine_spatial_docs_path'] = collect($polaRuang)->map(fn ($p) => $this->moveToPublicDisk($p))->all();
        }

        $dir = $egeraiJob->storageDir();
        if ($egeraiJob->prop_source_path && is_file($dir.'/'.$egeraiJob->prop_source_path)) {
            $data['existing_doc_path'] = $this->moveToPublicDisk($dir.'/'.$egeraiJob->prop_source_path);
        }
        if ($egeraiJob->lap_source_path && is_file($dir.'/'.$egeraiJob->lap_source_path)) {
            $data['hydro_oceanography_doc_path'] = $this->moveToPublicDisk($dir.'/'.$egeraiJob->lap_source_path);
        }

        return KkprlProposal::create($data);
    }

    private function moveToPublicDisk(string $absolutePath): string
    {
        $relativePath = 'kkprl/'.uniqid().'-'.basename($absolutePath);
        Storage::disk('public')->put($relativePath, file_get_contents($absolutePath));

        return $relativePath;
    }

    /** Reverse of DUKUNG_LABELS in ProposalDocumentGenerator — checked label text back to supporting_documents keys. */
    private function mapDukungLabelsToKeys(array $labels): array
    {
        $labelToKey = [
            'NIB' => 'nib',
            'Sertifikat Kepemilikan Lahan Darat' => 'sertifikat',
            'Surat Izin Lingkungan' => 'izin_lingkungan',
            'Berita Acara Sosialisasi' => 'ba_sosialisasi',
            'Dokumen Identitas dan Legalitas Pemohon/Perusahaan' => 'identitas',
            'Dokumentasi Survei Lapangan Kondisi Eksisting Lokasi' => 'survei',
            'Peta Pendukung (Peta Lokasi, Site Plan, Pola Ruang Wilayah)' => 'peta',
            'DIPA/RKAKL (Sumber Anggaran APBD/APBN) / Lainnya' => 'dipa',
            'SK Penetapan KNMP' => 'sk_kkprl',
        ];

        return collect($labels)->map(fn ($label) => $labelToKey[$label] ?? null)->filter()->values()->all();
    }

    public function image(EgeraiJob $egeraiJob, string $type, string $filename)
    {
        $path = $egeraiJob->storageDir()."/images-$type/".basename($filename);
        abort_unless(in_array($type, ['proposal', 'laporan'], true) && is_file($path), 404);

        return response()->file($path);
    }

    /** Renders the full "what you'll get" document preview; never fatal if it fails. */
    private function renderPreview(array $propFields, array $propImages, array $lapFields, array $lapImages): ?string
    {
        try {
            return (new ProposalDocumentGenerator)->renderPreviewHtml($propFields, $propImages, $lapFields, $lapImages);
        } catch (\Throwable $exception) {
            Log::warning('Gagal membuat pratinjau dokumen e-GeRAI: '.$exception->getMessage());

            return null;
        }
    }

    private function manifest(array $imagesByTag, string $dir): array
    {
        $manifest = [];
        foreach ($imagesByTag as $tag => $paths) {
            foreach ((array) $paths as $path) {
                $manifest[] = ['tag' => $tag, 'file' => ltrim(str_replace($dir, '', $path), '/')];
            }
        }

        return $manifest;
    }

    private function resolveManifest(array $manifest, string $dir): array
    {
        $resolved = [];
        foreach ($manifest as $item) {
            $path = $dir.'/'.$item['file'];
            if (is_file($path)) {
                $resolved[$item['tag']][] = $path;
            }
        }

        return $resolved;
    }

    private function present(EgeraiJob $egeraiJob): array
    {
        $imageUrl = fn ($type, $file) => route('egerai.image', ['egeraiJob' => $egeraiJob, 'type' => $type, 'filename' => basename($file)]);

        return [
            'job_id' => $egeraiJob->job_id,
            'status' => $egeraiJob->status,
            'prop_source_filename' => $egeraiJob->prop_source_filename,
            'lap_source_filename' => $egeraiJob->lap_source_filename,
            'prop_fields' => $egeraiJob->prop_fields ?? [],
            'lap_fields' => $egeraiJob->lap_fields ?? [],
            'preview_html' => $egeraiJob->preview_html,
            'prop_field_hints' => ProposalTextExtractor::FIELD_HINTS,
            'lap_field_hints' => LaporanTextExtractor::FIELD_HINTS,
            'prop_images' => collect($egeraiJob->prop_images ?? [])->map(fn ($i) => ['tag' => $i['tag'], 'url' => $imageUrl('proposal', $i['file'])])->all(),
            'lap_images' => collect($egeraiJob->lap_images ?? [])->map(fn ($i) => ['tag' => $i['tag'], 'url' => $imageUrl('laporan', $i['file'])])->all(),
        ];
    }

    /** Mirrors job_store.py's cleanup_old_jobs(): drop jobs older than 2 hours whenever a new one is created. */
    private function cleanupExpiredJobs(): void
    {
        EgeraiJob::where('created_at', '<', now()->subMinutes(EgeraiJob::MAX_AGE_MINUTES))
            ->get()
            ->each(function (EgeraiJob $job) {
                File::deleteDirectory($job->storageDir());
                $job->delete();
            });
    }
}
