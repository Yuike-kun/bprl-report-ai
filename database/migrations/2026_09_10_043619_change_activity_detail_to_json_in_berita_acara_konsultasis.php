<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Migrate existing string values to JSON arrays.
        // Wrap each existing non-null, non-empty string in a JSON array.
        DB::table('berita_acara_konsultasis')
            ->whereNotNull('activity_detail')
            ->get(['id', 'activity_detail'])
            ->each(function ($row) {
                // Only convert if it doesn't already look like a JSON array
                $value = $row->activity_detail;
                if ($value && $value[0] !== '[') {
                    DB::table('berita_acara_konsultasis')
                        ->where('id', $row->id)
                        ->update(['activity_detail' => json_encode([$value])]);
                }
            });

        Schema::table('berita_acara_konsultasis', function (Blueprint $table) {
            $table->json('activity_detail')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Revert JSON arrays back to plain strings (take first element)
        DB::table('berita_acara_konsultasis')
            ->whereNotNull('activity_detail')
            ->get(['id', 'activity_detail'])
            ->each(function ($row) {
                $decoded = json_decode($row->activity_detail, true);
                if (is_array($decoded)) {
                    DB::table('berita_acara_konsultasis')
                        ->where('id', $row->id)
                        ->update(['activity_detail' => implode(', ', $decoded)]);
                }
            });

        Schema::table('berita_acara_konsultasis', function (Blueprint $table) {
            $table->string('activity_detail')->nullable(false)->change();
        });
    }
};
