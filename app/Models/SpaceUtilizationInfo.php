<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SpaceUtilizationInfo extends Model
{
    protected $fillable = [
        'general_draft_id',
        'permukiman_nelayan',
        'alur_pelayaran',
        'area_tangkap',
        'aktivitas_lain',
        'peta_pemanfaatan',
    ];

    public function general_draft()
    {
        return $this->belongsTo(GeneralDraft::class);
    }

    public function getPetaPemanfaatanUrlAttribute()
    {
        return Storage::disk('reports')->url($this->peta_pemanfaatan);
    }
}
