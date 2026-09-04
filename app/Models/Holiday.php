<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = [
        'tanggal',
        'nama',
        'tipe',
        'is_recurring',
        'locked',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'is_recurring' => 'boolean',
            'locked' => 'boolean',
        ];
    }

}
