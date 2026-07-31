<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReclamationRequirement extends Model
{
    protected $fillable = [
        'general_draft_id',
        'ada_reklamasi',
        'sumber_material',
        'metode_reklamasi',
        'jenis_tanah',
        'daya_dukung',
        'pemanfaatan_lahan',
        'jadwal_reklamasi',
    ];

    public function general_draft()
    {
        return $this->belongsTo(GeneralDraft::class);
    }
}
