<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class CurrentLocationData extends Model
{
    protected $table = 'current_location_data';

    protected $fillable = [
        'general_draft_id',
        'analisis_oseanografi_file',
    ];

    public function general_draft()
    {
        return $this->belongsTo(GeneralDraft::class);
    }

    public function getAnalisisOseanografiFileUrlAttribute()
    {
        if (!$this->analisis_oseanografi_file) {
            return null;
        }
        return Storage::disk('reports')->url($this->analisis_oseanografi_file);
    }
}
