<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Requester extends Model
{
    protected $fillable = [
        'user_id',
        'institution_name',
        'license_number',
        'phone',
        'address',
        'is_active'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
