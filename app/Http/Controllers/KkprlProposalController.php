<?php
namespace App\Http\Controllers;

use App\Models\KkprlProposal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KkprlProposalController extends Controller
{
    public function create()
    {
        return Inertia::render('kkprl-konsultasi-form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // ── Pemohon ──────────────────────────────────────
            'is_reclamation'                      => 'required|boolean',
            'applicant_name'                      => 'required|string|max:255',
            'applicant_position'                  => 'required|string|max:255',
            'company_name'                        => 'required|string|max:255',
            'nib'                                 => 'nullable|string|max:255',
            'npwp'                                => 'nullable|string|max:255',
            'phone_number'                        => 'required|string|max:20',
            'email'                               => 'required|email|max:255',

            // ── Kegiatan & Lokasi ────────────────────────────
            'activity_details'                    => 'required|array|min:1',
            'village'                             => 'required|string|max:255',
            'district'                            => 'required|string|max:255',
            'regency'                             => 'required|string|max:255',
            'province'                            => 'required|string|max:255',
            'water_name'                          => 'required|string|max:255',
            'area_size'                           => 'required|numeric|min:0',
            'coordinates'                         => 'required|string',

            'activity_status'                     => 'required|string|max:255',
            'activity_category'                   => 'required|string|max:255',
            'activity_type'                       => 'required|string|max:255',

            'marine_installation'                 => 'nullable|string|max:255',
            'installation_location'               => 'nullable|array',

            'activity_description'                => 'required|string',
            'activity_benefit'                    => 'required|string',
            'activity_purpose'                    => 'required|string',

            'local_workers'                       => 'required|string|max:255',
            'foreign_workers'                     => 'nullable|string|max:255',
            'investment_value'                    => 'required|string|max:255',
            'schedule_description'                => 'required|string',

            'supporting_documents'                => 'required|array|min:1',
            'map_source'                          => 'required|string|max:255',

            // ── Upload dokumen umum ──────────────────────────
            'existing_doc_path'                   => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
            'site_plan_path'                      => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'location_map_path'                   => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',

            // ── Sosial ekonomi ───────────────────────────────
            'population_count'                    => 'required|string|max:255',
            'village_area'                        => 'required|string|max:255',
            'livelihood_description'              => 'required|string',
            'sosek_data_source'                   => 'required|string|max:255',
            'sosek_data_year'                     => 'required|string|max:4',
            'accessibility_description'           => 'required|string',
            'accessibility_map_path'              => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',

            // ── Hidro-oseanografi ────────────────────────────
            'hydro_oceanography_doc_path'         => 'required|file|mimes:pdf,doc,docx|max:10240',

            // ── Mangrove ─────────────────────────────────────
            'has_mangrove'                        => 'required|boolean',
            'mangrove_species'                    => 'nullable|string|max:255',
            'mangrove_cover_percentage'           => 'nullable|numeric|min:0|max:100',
            'mangrove_condition'                  => 'nullable|string|max:255',
            'mangrove_doc_path'                   => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',

            // ── Lamun ────────────────────────────────────────
            'has_seagrass'                        => 'required|boolean',
            'seagrass_species'                    => 'nullable|string|max:255',
            'seagrass_cover_percentage'           => 'nullable|numeric|min:0|max:100',
            'seagrass_condition'                  => 'nullable|string|max:255',
            'seagrass_doc_path'                   => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',

            // ── Terumbu Karang ───────────────────────────────
            'has_coral_reef'                      => 'required|boolean',
            'coral_reef_species'                  => 'nullable|string|max:255',
            'coral_reef_cover_percentage'         => 'nullable|numeric|min:0|max:100',
            'coral_reef_condition'                => 'nullable|string|max:255',
            'coral_reef_doc_path'                 => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',

            // ── Pemanfaatan ruang laut ───────────────────────
            'marine_spatial_activity_description' => 'required|string',
            'marine_spatial_docs'                 => 'nullable|array|min:1|max:5',
            'marine_spatial_docs.*'               => 'file|mimes:pdf,jpg,jpeg,png|max:10240',

            // ── Petugas & dokumen lainnya ────────────────────
            'officer_email'                       => 'required|email|max:255',
            'land_certificate_path'               => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'socialization_doc_path'              => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'other_supporting_doc_path'           => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
        ]);

        // ── Mapping file upload ke path storage ──────────────
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

        // Multi-file: dokumentasi pemanfaatan ruang laut
        if ($request->hasFile('marine_spatial_docs')) {
            $validated['marine_spatial_docs_path'] = collect($request->file('marine_spatial_docs'))
                ->map(fn($file) => $file->store('kkprl/ruang-laut', 'public'))
                ->values()
                ->all();
        }

        // Hapus field file multi-file yang tidak ada di DB (yang dipakai marine_spatial_docs_path)
        unset($validated['marine_spatial_docs']);

        KkprlProposal::create($validated);

        return redirect()->back()->with('success', 'Formulir Proposal KKPRL berhasil disubmit.');
    }
}
