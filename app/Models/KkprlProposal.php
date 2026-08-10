<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KkprlProposal extends Model
{
    use HasFactory;

    protected $table = 'kkprl_proposals';

    protected $fillable = [
        'permohonan_konsultasi_id',
        'berita_acara_id',
        // Reklamasi & Pemohon
        'is_reclamation', 'applicant_name', 'applicant_position', 'company_name',
        'nib', 'npwp', 'phone_number', 'email', 'status',

        // Kegiatan & Lokasi
        'activity_details', 'village', 'district', 'regency', 'province',
        'water_name', 'area_size', 'coordinates',

        // Status Kegiatan
        'activity_status', 'activity_category', 'activity_type',
        'marine_installation', 'installation_location',

        // Deskripsi & TK
        'activity_description', 'activity_benefit', 'activity_purpose',
        'local_workers', 'foreign_workers', 'investment_value', 'schedule_description',

        // Dokumen umum
        'supporting_documents', 'map_source',
        'existing_doc_path', 'site_plan_path', 'location_map_path',

        // Sosial ekonomi
        'population_count', 'village_area', 'livelihood_description',
        'sosek_data_source', 'sosek_data_year',
        'accessibility_description', 'accessibility_map_path',

        // Hidro + ekosistem
        'hydro_oceanography_doc_path',
        'has_mangrove', 'mangrove_species', 'mangrove_cover_percentage',
        'mangrove_condition', 'mangrove_doc_path',
        'has_seagrass', 'seagrass_species', 'seagrass_cover_percentage',
        'seagrass_condition', 'seagrass_doc_path',
        'has_coral_reef', 'coral_reef_species', 'coral_reef_cover_percentage',
        'coral_reef_condition', 'coral_reef_doc_path',

        // Ruang laut & persyaratan
        'marine_spatial_activity_description', 'marine_spatial_docs_path',
        'officer_email', 'land_certificate_path',
        'socialization_doc_path', 'other_supporting_doc_path',
    ];

    protected function casts(): array
    {
        return [
            // Boolean
            'is_reclamation'              => 'boolean',
            'has_mangrove'                => 'boolean',
            'has_seagrass'                => 'boolean',
            'has_coral_reef'              => 'boolean',

            // Array / JSON
            'activity_details'            => 'array',
            'installation_location'       => 'array',
            'supporting_documents'        => 'array',
            'marine_spatial_docs_path'    => 'array',

            // Numeric
            'area_size'                   => 'decimal:4',
            'mangrove_cover_percentage'   => 'decimal:2',
            'seagrass_cover_percentage'   => 'decimal:2',
            'coral_reef_cover_percentage' => 'decimal:2',
        ];
    }

    public function permohonanKonsultasi()
    {
        return $this->belongsTo(PermohonanKonsultasi::class, 'permohonan_konsultasi_id');
    }

    public function beritaAcara()
    {
        return $this->belongsTo(BeritaAcaraKonsultasi::class, 'berita_acara_id');
    }
}
