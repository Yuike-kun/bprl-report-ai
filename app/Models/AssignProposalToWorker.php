<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'kkprl_proposals',
    'staff',
    'status',
])]
class AssignProposalToWorker extends Model
{
    public function kkprlProposal()
    {
        return $this->belongsTo(KkprlProposal::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
