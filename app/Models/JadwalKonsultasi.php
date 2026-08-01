<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalKonsultasi extends Model
{
    protected $fillable = [
        'tanggal',
        'waktu_awal',
        'waktu_akhir',
        'pelaksanaan',
        'lokasi_konsultasi_id',
        'kuota_konsultasi',
    ];

    public function lokasi()
    {
        return $this->belongsTo(LokasiKonsultasi::class, 'lokasi_konsultasi_id');
    }
}
