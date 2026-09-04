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

    protected $casts = [
        'joined_at' => 'date',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function permohonanKonsultasi()
    {
        return $this->hasMany(AssignRequestToStaff::class, 'staff', 'id');
    }
}
