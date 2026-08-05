<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $fillable = [
        'user_id',
        'position',
        'department',
        'phone',
        'joined_at',
        'is_active'
    ];

    public function user()
    {
        $this->belongsTo(User::class, 'user_id', 'id');
    }
}
