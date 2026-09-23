<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property string $name
 */
class Province extends Model
{
    protected $table = 'provinces';

    public function regencies()
    {
        return $this->hasMany(Regency::class);
    }
}
