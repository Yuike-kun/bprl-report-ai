<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProposalExtraction extends Model
{
    protected $fillable = [
        'user_id', 'source_path', 'source_filename', 'fields', 'missing_fields',
        'coordinates', 'status',
    ];

    protected function casts(): array
    {
        return ['fields' => 'array', 'missing_fields' => 'array', 'coordinates' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
