<?php
namespace App\Http\Controllers;

use App\Models\AiAnalysisResult;
use App\Models\CurrentLocationData;
use App\Models\GeneralDraft;
use App\Models\ReclamationRequirement;
use App\Models\SeaConstructionAndInstallation;
use App\Models\SpaceUtilizationInfo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GeneralDraftController extends Controller
{
    public function index(Request $request)
    {
        $drafts = GeneralDraft::latest()->paginate(15);

        return inertia('backend/general-draft/index', [
            'drafts'  => $drafts,
            'success' => session('success'),
        ]);
    }

    public function create()
    {
        return inertia('backend/general-draft/create');
    }

    public function edit(GeneralDraft $generalDraft)
    {
        $generalDraft->load([
            'seaConstructionAndInstallation',
            'spaceUtilizationInfo',
            'currentLocationData',
            'reclamationRequirement',
        ]);

        return inertia('backend/general-draft/create', [
            'draft'   => $generalDraft,
            'draftId' => $generalDraft->id,
        ]);
    }

    public function destroy(GeneralDraft $generalDraft)
    {
        $generalDraft->seaConstructionAndInstallation?->delete();
        $generalDraft->spaceUtilizationInfo?->delete();
        $generalDraft->currentLocationData?->delete();
        $generalDraft->reclamationRequirement?->delete();
        $generalDraft->aiAnalysisResult?->delete();
        $generalDraft->delete();

        return redirect()->route('general-draft.index')
            ->with('success', 'Draft berhasil dihapus.');
    }

    public function store_applicant_identity(Request $request)
    {
        $validated = $request->validate([
            'nama_perusahaan'    => 'required|string',
            'nib'                => 'required|string',
            'npwp'               => 'required|string',
            'telp'               => 'required|string',
            'email'              => 'required|email',
            'jenis_kegiatan'     => 'required|string',
            'no_referensi'       => 'required|string',
            'tanggal_penyusunan' => 'required',
        ]);

        return response()->json($validated);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Identitas Pemohon
            'nama_perusahaan'           => 'required|string|max:255',
            'nib'                       => 'required|string|max:255',
            'npwp'                      => 'required|string|max:255',
            'telp'                      => 'required|string|max:255',
            'email'                     => 'required|string|email|max:255',
            'jenis_kegiatan'            => 'required|string|max:255',
            'no_referensi'              => 'required|string|max:255',
            'tanggal_penyusunan'        => 'required',

            // Bab I: Bangunan & Instalasi Laut
            'nama_perairan'             => 'nullable|string|max:255',
            'provinsi'                  => 'nullable|string|max:255',
            'kabupaten'                 => 'nullable|string|max:255',
            'kecamatan'                 => 'nullable|string|max:255',
            'desa'                      => 'nullable|string|max:255',
            'uraian_kegiatan'           => 'nullable|string',
            'jadwal_konstruksi'         => 'nullable|string',
            'luas_ruang_total'          => 'nullable|string|max:255',

            // Bab II: Informasi Pemanfaatan Ruang Laut
            'permukiman_nelayan'        => 'nullable|string',
            'alur_pelayaran'            => 'nullable|string',
            'area_tangkap'              => 'nullable|string',
            'aktivitas_lain'            => 'nullable|string',
            'peta_pemanfaatan'          => 'nullable',

            // Bab III: Data Kondisi Terkini Lokasi
            'analisis_oseanografi_file' => 'nullable',

            // Bab IV: Persyaratan Reklamasi
            'ada_reklamasi'             => 'nullable|string',
            'sumber_material'           => 'nullable|string',
            'metode_reklamasi'          => 'nullable|string',
            'jenis_tanah'               => 'nullable|string',
            'daya_dukung'               => 'nullable|string',
            'pemanfaatan_lahan'         => 'nullable|string',
            'jadwal_reklamasi'          => 'nullable|string',

            // THE AI
            'ai_narasi'                 => 'nullable',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // 1. Process files
            $petaPemanfaatanPath     = $this->handleFileUpload($request->input('peta_pemanfaatan'), 'peta_pemanfaatan');
            $analisisOseanografiPath = $this->handleFileUpload($request->input('analisis_oseanografi_file'), 'analisis_oseanografi');

            // 2. Create or Update GeneralDraft record
            $draft = GeneralDraft::updateOrCreate(
                ['no_referensi' => $validated['no_referensi']],
                [
                    'nama_perusahaan'    => $validated['nama_perusahaan'],
                    'nib'                => $validated['nib'],
                    'npwp'               => $validated['npwp'],
                    'telp'               => $validated['telp'],
                    'email'              => $validated['email'],
                    'jenis_kegiatan'     => $validated['jenis_kegiatan'],
                    'tanggal_penyusunan' => $validated['tanggal_penyusunan'],
                ]
            );

            // 3. Save Bab I - Sea Construction & Installation
            SeaConstructionAndInstallation::updateOrCreate(
                ['general_draft_id' => $draft->id],
                [
                    'nama_perairan'     => $validated['nama_perairan'] ?? '',
                    'provinsi'          => $validated['provinsi'] ?? '',
                    'kabupaten'         => $validated['kabupaten'] ?? '',
                    'kecamatan'         => $validated['kecamatan'] ?? '',
                    'desa'              => $validated['desa'] ?? '',
                    'uraian_kegiatan'   => $validated['uraian_kegiatan'] ?? '',
                    'jadwal_konstruksi' => $validated['jadwal_konstruksi'] ?? '',
                    'luas_ruang_total'  => $validated['luas_ruang_total'] ?? '',
                ]
            );

            // 4. Save Bab II - Space Utilization Info
            SpaceUtilizationInfo::updateOrCreate(
                ['general_draft_id' => $draft->id],
                [
                    'permukiman_nelayan' => $validated['permukiman_nelayan'] ?? '',
                    'alur_pelayaran'     => $validated['alur_pelayaran'] ?? '',
                    'area_tangkap'       => $validated['area_tangkap'] ?? '',
                    'aktivitas_lain'     => $validated['aktivitas_lain'] ?? '',
                    'peta_pemanfaatan'   => $petaPemanfaatanPath ?? '',
                ]
            );

            // 5. Save Bab III - Current Location Data
            CurrentLocationData::updateOrCreate(
                ['general_draft_id' => $draft->id],
                [
                    'analisis_oseanografi_file' => $analisisOseanografiPath ?? '',
                ]
            );

            // 6. Save Bab IV - Reclamation Requirements
            ReclamationRequirement::updateOrCreate(
                ['general_draft_id' => $draft->id],
                [
                    'ada_reklamasi'     => $validated['ada_reklamasi'] ?? 'Tidak',
                    'sumber_material'   => $validated['sumber_material'] ?? '',
                    'metode_reklamasi'  => $validated['metode_reklamasi'] ?? '',
                    'jenis_tanah'       => $validated['jenis_tanah'] ?? '',
                    'daya_dukung'       => $validated['daya_dukung'] ?? '',
                    'pemanfaatan_lahan' => $validated['pemanfaatan_lahan'] ?? '',
                    'jadwal_reklamasi'  => $validated['jadwal_reklamasi'] ?? '',
                ]
            );

            AiAnalysisResult::updateOrCreate(
                ['general_draft_id' => $draft->id],
                ['analysis_result' => $validated['ai_narasi']]
            );

            return redirect()->back()->with([
                'success'  => 'General Draft berhasil disimpan!',
                'draft_id' => $draft->id,
            ]);
        });
    }

    /**
     * Store base64 orUploadedFile payloads into reports storage disk.
     */
    private function handleFileUpload($fileData, string $prefix): ?string
    {
        if (! $fileData) {
            return null;
        }

        if (is_string($fileData)) {
            return $fileData;
        }

        if (is_array($fileData) && isset($fileData['data']) && isset($fileData['name'])) {
            $base64Data = $fileData['data'];
            if (preg_match('/^data:(.*?);base64,/', $base64Data, $match)) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
            }

            $decodedFile = base64_decode($base64Data);
            $extension   = pathinfo($fileData['name'], PATHINFO_EXTENSION) ?: 'file';
            $filename    = $prefix . '_' . Str::random(10) . '.' . $extension;

            Storage::disk('reports')->put($filename, $decodedFile);
            return $filename;
        }

        return null;
    }
}
