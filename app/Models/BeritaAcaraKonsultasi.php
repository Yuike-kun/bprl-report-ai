<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BeritaAcaraKonsultasi extends Model
{
    use SoftDeletes;

    protected $table = 'berita_acara_konsultasis';

    protected $fillable = [
        'request_form_id',
        'requester_id',
        'staff_1_id',
        'staff_2_id',
        'staff_3_id',
        'staff_4_id',
        'status',
        // Step 1 – Session
        'consultation_stage',
        'consultation_date',
        'berita_acara_number',
        'implementation_mode',
        'location',
        'location_other',
        // Step 1 – Requester & Site
        'requester_name',
        'requester_position',
        'legal_entity_name',
        'contact_email',
        'permit_type',
        'activity_type',
        'activity_detail',
        'activity_detail_other',
        'kbli',
        'province',
        'regency',
        'district',
        'water_name',
        'water_name_other',
        'consultation_instruments',
        // Step 2 – Asistensi
        'activity_category',
        'planned_area',
        'planned_area_unit',
        'existing_condition',
        'coordinate_points',
        'owned_documents',
        'owned_documents_other',
        'activity_description',
        'surrounding_utilization',
        'environmental_condition',
        'other_information',
        'consultation_result',
    ];

    protected $casts = [
        'consultation_date' => 'date',
        'owned_documents' => 'array',
        'planned_area' => 'decimal:4',
    ];

    // ── Relations ─────────────────────────────────────────────────────

    public function request_form(): BelongsTo
    {
        return $this->belongsTo(PermohonanKonsultasi::class);
    }

    public function permohonanKonsultasi()
    {
        return $this->belongsTo(PermohonanKonsultasi::class, 'request_form_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(Requester::class);
    }

    public function staff1(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_1_id');
    }

    public function staff2(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_2_id');
    }

    public function staff3(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_3_id');
    }

    public function staff4(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_4_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(BeritaAcaraDocument::class);
    }

    public function kkprlProposals(): HasMany
    {
        return $this->hasMany(KkprlProposal::class, 'berita_acara_id');
    }

    public function documentsByType(string $type): HasMany
    {
        return $this->documents()->where('document_type', $type);
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Province::class, 'province');
    }

    public function regency(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Regency::class, 'regency');
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(\App\Models\District::class, 'district');
    }
}
