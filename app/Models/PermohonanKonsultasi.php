<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermohonanKonsultasi extends Model
{
    protected $fillable = [
        'nama_pemohon', 'jabatan_pemohon', 'instansi', 'tanggal_konsultasi',
        'waktu_konsultasi', 'pelaksanaan', 'lokasi_konsultasi_id',
        'rencana_kegiatan', 'kabupaten', 'provinsi', 'nomor_telepon',
        'email', 'permintaan_khusus', 'setuju_syarat_ketentuan',
        'tanda_tangan', 'status',
    ];

    public function layanan()
    {
        return $this->hasMany(LayananKonsultasi::class, 'permohonan_id');
    }

    public function dokumen()
    {
        return $this->hasMany(DokumenKonsultasi::class, 'permohonan_id');
    }

    public function lokasi()
    {
        return $this->belongsTo(LokasiKonsultasi::class, 'lokasi_konsultasi_id');
    }
}
