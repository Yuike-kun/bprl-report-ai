<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class GeneralDraft extends Model
{
    protected $fillable = [
        'nama_perusahaan',
        'nib',
        'npwp',
        'telp',
        'email',
        'jenis_kegiatan',
        'no_referensi',
        'tanggal_penyusunan',
    ];

    protected $casts = [
        'tanggal_penyusunan' => 'datetime',
    ];

    public function seaConstructionAndInstallation(): HasOne
    {
        return $this->hasOne(SeaConstructionAndInstallation::class);
    }

    public function spaceUtilizationInfo(): HasOne
    {
        return $this->hasOne(SpaceUtilizationInfo::class);
    }

    public function currentLocationData(): HasOne
    {
        return $this->hasOne(CurrentLocationData::class);
    }

    public function reclamationRequirement(): HasOne
    {
        return $this->hasOne(ReclamationRequirement::class);
    }

    public function aiAnalysisResult(): HasOne
    {
        return $this->hasOne(\App\Models\AiAnalysisResult::class);
    }
}
