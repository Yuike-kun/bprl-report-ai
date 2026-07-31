<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeaConstructionAndInstallation extends Model
{
    protected $fillable = [
        'general_draft_id',
        'nama_perairan',
        'provinsi',
        'kabupaten',
        'kecamatan',
        'desa',
        'uraian_kegiatan',
        'jadwal_konstruksi',
        'luas_ruang_total',
    ];

    public function general_draft()
    {
        return $this->belongsTo(GeneralDraft::class);
    }
}
