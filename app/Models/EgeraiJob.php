<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * DB-backed equivalent of the reference e-GeRAI Python app's job_store.py
 * (a job folder on disk holding prop_data/lap_data JSON + extracted images
 * between the /review and /finalize steps). Here the JSON payloads live in
 * columns and the image files live under storage/app/private/egerai/{job_id}.
 */
class EgeraiJob extends Model
{
    protected $table = 'egerai_jobs';

    protected $fillable = [
        'job_id', 'user_id', 'status',
        'prop_source_path', 'prop_source_filename',
        'lap_source_path', 'lap_source_filename',
        'prop_fields', 'lap_fields', 'prop_images', 'lap_images', 'preview_html',
    ];

    protected function casts(): array
    {
        return [
            'prop_fields' => 'array',
            'lap_fields' => 'array',
            'prop_images' => 'array',
            'lap_images' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'job_id';
    }

    protected static function booted(): void
    {
        static::creating(function (self $job) {
            $job->job_id ??= (string) Str::uuid();
        });
    }

    public function storageDir(): string
    {
        return storage_path('app/private/egerai-jobs/'.$this->job_id);
    }

    /** Mirrors job_store.py's JOB_MAX_AGE_SECONDS (2 hours). */
    public const MAX_AGE_MINUTES = 120;
}
