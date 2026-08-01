<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DokumenKonsultasi extends Model
{
    protected $fillable = ['permohonan_id', 'file_url', 'file_name'];

    public function permohonan()
    {
        return $this->belongsTo(PermohonanKonsultasi::class, 'permohonan_id');
    }
}
