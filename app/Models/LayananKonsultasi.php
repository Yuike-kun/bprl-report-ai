<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LayananKonsultasi extends Model
{
    protected $fillable = ['permohonan_id', 'jenis_layanan'];

    public function permohonan()
    {
        return $this->belongsTo(PermohonanKonsultasi::class, 'permohonan_id');
    }
}
