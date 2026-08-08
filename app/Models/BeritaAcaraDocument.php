<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BeritaAcaraDocument extends Model
{
    protected $table = 'berita_acara_documents';

    protected $fillable = [
        'berita_acara_konsultasi_id',
        'document_type',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    public function beritaAcara(): BelongsTo
    {
        return $this->belongsTo(BeritaAcaraKonsultasi::class, 'berita_acara_konsultasi_id');
    }
}
