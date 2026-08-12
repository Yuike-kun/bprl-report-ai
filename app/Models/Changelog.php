<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Changelog extends Model
{
    use HasFactory;

    protected $fillable = [
        'version',
        'title',
        'description',
        'type',
        'release_date',
    ];

    protected $casts = [
        'release_date' => 'date',
    ];
}
