<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LokasiKonsultasi extends Model
{
    protected $fillable = [
        'nama_lokasi',
    ];

    public function permohonan()
    {
        return $this->hasMany(PermohonanKonsultasi::class, 'lokasi_konsultasi_id');
    }
}
