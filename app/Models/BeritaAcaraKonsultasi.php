<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        // Step 2 - Konsuktasi/Koordinasi
        'consultation_notes'
    ];

    protected $casts = [
        'consultation_date' => 'date',
        'owned_documents' => 'array',
        'planned_area' => 'decimal:4',
    ];

    // ── Relations ─────────────────────────────────────────────────────

    /**
     * @return BelongsTo<PermohonanKonsultasi, $this>
     */
    public function request_form(): BelongsTo
    {
        return $this->belongsTo(PermohonanKonsultasi::class, 'request_form_id');
    }

    /**
     * @return BelongsTo<PermohonanKonsultasi, $this>
     */
    public function permohonanKonsultasi(): BelongsTo
    {
        return $this->belongsTo(PermohonanKonsultasi::class, 'request_form_id');
    }

    /**
     * @return BelongsTo<Requester, $this>
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(Requester::class);
    }

    /**
     * @return BelongsTo<Staff, $this>
     */
    public function staff1(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_1_id');
    }

    /**
     * @return BelongsTo<Staff, $this>
     */
    public function staff2(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_2_id');
    }

    /**
     * @return BelongsTo<Staff, $this>
     */
    public function staff3(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_3_id');
    }

    /**
     * @return BelongsTo<Staff, $this>
     */
    public function staff4(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_4_id');
    }

    /**
     * @return BelongsToMany<Staff, $this>
     */
    public function staff(): BelongsToMany
    {
        return $this->belongsToMany(Staff::class, 'berita_acara_konsultasi_staff')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }

    /**
     * @return HasMany<BeritaAcaraDocument, $this>
     */
    public function documents(): HasMany
    {
        return $this->hasMany(BeritaAcaraDocument::class);
    }

    /**
     * @return HasMany<KkprlProposal, $this>
     */
    public function kkprlProposals(): HasMany
    {
        return $this->hasMany(KkprlProposal::class, 'berita_acara_id');
    }

    /**
     * @return HasMany<BeritaAcaraDocument, $this>
     */
    public function documentsByType(string $type): HasMany
    {
        return $this->documents()->where('document_type', $type);
    }
}
