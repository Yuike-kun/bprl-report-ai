<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermohonanKonsultasi extends Model
{
    protected $fillable = [
        'jadwal_konsultasi_id', 'child_schedule_id', 'waktu_konsultasi',
        'nama_pemohon', 'jabatan_pemohon', 'instansi',
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

    public function jadwal()
    {
        return $this->belongsTo(JadwalKonsultasi::class, 'jadwal_konsultasi_id');
    }

    public function child_schedules()
    {
        return $this->belongsTo(ChildSchedule::class, 'child_schedule_id');
    }
}
