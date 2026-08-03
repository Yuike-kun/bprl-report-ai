<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
        'schedule_id',
        'waktu',
        'kuota_konsultasi',
    ])]
class ChildSchedule extends Model
{
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(JadwalKonsultasi::class, 'schedule_id');
    }
}
