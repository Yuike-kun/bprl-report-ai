<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssignRequestToStaff extends Model
{
    protected $fillable = [
        'request_form_id',
        'staff',
        'requester',
    ];

    public function RequestForm() {
        return $this->belongsTo(PermohonanKonsultasi::class);
    }

    public function Staff() {
        return $this->belongsTo(Staff::class);
    }

    public function Requester() {
        return $this->belongsTo(Requester::class);
    }
}
