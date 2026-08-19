<?php

namespace App\Http\Controllers;

use App\Models\KkprlProposal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KkprlProposalController extends Controller
{
    public function index_iframe()
    {
        return Inertia::render('kkprl-dashboard');
    }

    public function create()
    {
        return Inertia::render('kkprl-konsultasi-form');
    }

    public function store(Request $request)
    {
        $propMap = [
            'prop__Nama_Pemohon' => 'applicant_name',
            'prop__Jabatan_Pemohon' => 'applicant_position',
            'prop__Nama_Perusahaan_Instansi' => 'company_name',
            'prop__NIB' => 'nib',
            'prop__NPWP' => 'npwp',
            'prop__Nomor_Telepon_Selular' => 'phone_number',
            'prop__Surat_Elektronik' => 'email',
            'prop__Jenis_Kegiatan' => 'activity_type',
            'prop__Nama_Perairan' => 'water_name',
            'prop__KBLI' => 'activity_category',
            'prop__Luas_Kebutuhan_Ruang' => 'area_size',
        ];
        foreach ($propMap as $frontend => $backend) {
            // Only merge when backend field not already directly provided
            if ($request->has($frontend) && !$request->filled($backend)) {
                $request->merge([$backend => $request->input($frontend)]);
            }
        }

        $validated = $request->validate([
            // ── Core applicant (nullable for direct file upload) ──
            'applicant_name' => 'nullable|string|max:255',
            'applicant_position' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'nib' => 'nullable|string|max:255',
            'npwp' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'officer_email' => 'nullable|email|max:255',
            // ── Activity & location (nullable for direct file upload) ──
            'activity_type' => 'nullable|string|max:255',
            'water_name' => 'nullable|string|max:255',
            'area_size' => 'nullable|numeric|min:0',
            'province' => 'nullable|string|max:255',
            'regency' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'village' => 'nullable|string|max:255',
            'activity_status' => 'nullable|string|max:255',
            'activity_description' => 'nullable|string',
            'activity_benefit' => 'nullable|string',
            'activity_purpose' => 'nullable|string',
            // ── Optional activity details ──────────────────────────
            'activity_details' => 'nullable|array',
            'activity_category' => 'nullable|string|max:255',
            'is_reclamation' => 'nullable|boolean',
            'coordinates' => 'nullable|string',
            'marine_installation' => 'nullable|string|max:255',
            'installation_location' => 'nullable|array',
            'schedule_description' => 'nullable|string',
            // ── Workforce & investment ─────────────────────────────
            'local_workers' => 'nullable|integer|min:0',
            'foreign_workers' => 'nullable|integer|min:0',
            'investment_value' => 'nullable|numeric|min:0',
            // ── Supporting documents ───────────────────────────────
            'supporting_documents' => 'nullable|array',
            'map_source' => 'nullable|string|max:255',
            // ── File uploads (all nullable — stored separately) ────
            'existing_doc_path' => 'nullable|file|extensions:pdf,jpg,jpeg,png,doc,docx|max:262144',
            'site_plan_path' => 'nullable|file|extensions:pdf,jpg,jpeg,png|max:262144',
            'location_map_path' => 'nullable|file|extensions:pdf,jpg,jpeg,png|max:262144',
            'accessibility_map_path' => 'nullable|file|extensions:pdf,jpg,jpeg,png|max:262144',
            'hydro_oceanography_doc_path' => 'nullable|file|extensions:pdf,doc,docx|max:262144',
            'mangrove_doc_path' => 'nullable|file|extensions:pdf,jpg,jpeg,png|max:262144',
            'seagrass_doc_path' => 'nullable|file|extensions:pdf,jpg,jpeg,png|max:262144',
            'coral_reef_doc_path' => 'nullable|file|extensions:pdf,jpg,jpeg,png|max:262144',
            'land_certificate_path' => 'nullable|file|extensions:pdf,jpg,jpeg,png|max:262144',
            'socialization_doc_path' => 'nullable|file|extensions:pdf,doc,docx,jpg,jpeg,png|max:262144',
            'other_supporting_doc_path' => 'nullable|file|extensions:pdf,doc,docx,jpg,jpeg,png|max:262144',
            'proposal' => 'nullable|file|max:51200',
            'report' => 'nullable|file|max:51200',
            // ── Socio-economic (nullable) ──────────────────────────
            'population_count' => 'nullable|integer|min:0',
            'village_area' => 'nullable|numeric|min:0',
            'livelihood_description' => 'nullable|string',
            'sosek_data_source' => 'nullable|string|max:255',
            'sosek_data_year' => 'nullable|string|max:4',
            'accessibility_description' => 'nullable|string',
            // ── Ecosystem (nullable) ───────────────────────────────
            'has_mangrove' => 'nullable|boolean',
            'mangrove_species' => 'nullable|string|max:1000',
            'mangrove_cover_percentage' => 'nullable|numeric|min:0|max:100',
            'mangrove_condition' => 'nullable|string|max:255',
            'has_seagrass' => 'nullable|boolean',
            'seagrass_species' => 'nullable|string|max:1000',
            'seagrass_cover_percentage' => 'nullable|numeric|min:0|max:100',
            'seagrass_condition' => 'nullable|string|max:255',
            'has_coral_reef' => 'nullable|boolean',
            'coral_reef_species' => 'nullable|string|max:1000',
            'coral_reef_cover_percentage' => 'nullable|numeric|min:0|max:100',
            'coral_reef_condition' => 'nullable|string|max:255',
            // ── Marine spatial (nullable) ──────────────────────────
            'marine_spatial_activity_description' => 'nullable|string',
            'marine_spatial_docs' => 'nullable|array|max:5',
            'marine_spatial_docs.*' => 'file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        // Store single file uploads
        $fileFields = [
            'existing_doc_path',
            'site_plan_path',
            'location_map_path',
            'accessibility_map_path',
            'hydro_oceanography_doc_path',
            'mangrove_doc_path',
            'seagrass_doc_path',
            'coral_reef_doc_path',
            'land_certificate_path',
            'socialization_doc_path',
            'other_supporting_doc_path',
        ];
        foreach ($fileFields as $field) {
            if ($request->hasFile($field)) {
                $validated[$field] = $request->file($field)->store('kkprl', 'public');
            }
        }

        if ($request->hasFile('proposal')) {
            $validated['existing_doc_path'] = $request->file('proposal')->store('kkprl', 'public');
        }
        if ($request->hasFile('report')) {
            $validated['hydro_oceanography_doc_path'] = $request->file('report')->store('kkprl', 'public');
        }
        unset($validated['proposal'], $validated['report']);

        // Store multi-file: marine spatial documentation
        if ($request->hasFile('marine_spatial_docs')) {
            $validated['marine_spatial_docs_path'] = collect($request->file('marine_spatial_docs'))
                ->map(fn($file) => $file->store('kkprl/ruang-laut', 'public'))
                ->values()
                ->all();
        }
        unset($validated['marine_spatial_docs']);

        $kkprlProposal = KkprlProposal::create($validated);

        return redirect()->route('kkprl-proposal.review', $kkprlProposal->id);
    }

    public function review(KkprlProposal $kkprlProposal)
    {
        return Inertia::render('kkprl-proposal-review', [
            'kkprlProposal' => $kkprlProposal,
        ]);
    }

    public function finalize(Request $request, KkprlProposal $kkprlProposal)
    {
        $validated = $request->validate([
            'applicant_name' => 'nullable|string|max:255',
            'applicant_position' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'nib' => 'nullable|string|max:255',
            'npwp' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'activity_type' => 'nullable|string|max:255',
            'water_name' => 'nullable|string|max:255',
            'area_size' => 'nullable|numeric|min:0',
            'province' => 'nullable|string|max:255',
            'regency' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'village' => 'nullable|string|max:255',
            'activity_description' => 'nullable|string',
            'activity_benefit' => 'nullable|string',
            'activity_purpose' => 'nullable|string',
        ]);

        $kkprlProposal->update($validated);

        // Download document if template generation exists or redirect with notification
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Proposal berhasil difinalisasi!',
                'proposal_id' => $kkprlProposal->id,
            ]);
        }

        return redirect()
            ->route('kkprl-proposal.review', $kkprlProposal->id)
            ->with('success', 'Dokumen proposal berhasil diperbarui dan disiapkan untuk diunduh.');
    }
}
