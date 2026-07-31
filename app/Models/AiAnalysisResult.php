<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiAnalysisResult extends Model
{
    protected $fillable = [
        'general_draft_id',
        'analysis_result',
    ];

    protected $casts = [
        'analysis_result' => 'array',
    ];

    public function general_draft()
    {
        return $this->belongsTo(GeneralDraft::class);
    }
}
