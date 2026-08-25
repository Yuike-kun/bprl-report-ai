<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermohonanKonsultasi extends Model
{
    protected $fillable = [
        'jadwal_konsultasi_id',
        'child_schedule_id',
        'waktu_konsultasi',
        'nama_pemohon',
        'jabatan_pemohon',
        'instansi',
        'rencana_kegiatan',
        'kabupaten',
        'provinsi',
        'nomor_telepon',
        'email',
        'permintaan_khusus',
        'setuju_syarat_ketentuan',
        'staff_tanda_tangan',
        'tanda_tangan',
        'status',
        'provinsi',
        'kabupaten',  // ← add these
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

    public function kabupaten()
    {
        return $this->belongsTo(District::class, 'kabupaten_id');
    }

    public function provinsi()
    {
        return $this->belongsTo(Province::class, 'provinsi_id');
    }

    public function assign_to_staff()
    {
        return $this->hasMany(AssignRequestToStaff::class, 'request_form_id');
    }

    public function kkprlProposals()
    {
        return $this->hasMany(KkprlProposal::class, 'permohonan_konsultasi_id');
    }

    public function beritaAcara()
    {
        return $this->hasOne(BeritaAcaraKonsultasi::class, 'request_form_id');
    }
}
