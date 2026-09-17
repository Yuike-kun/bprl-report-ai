<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('egerai_jobs', function (Blueprint $table) {
            // User-controlled toggle for the AI-estimated hydro-oceanography /
            // ecosystem-area fallback in ProposalDocumentGenerator::docChapterThree()
            // (gelombang, arus, pasang surut, batimetri, luas ekosistem terumbu
            // karang) — lets the user choose between an AI-researched, source-cited
            // regional estimate or leaving the "[data tidak terdeteksi otomatis]"
            // placeholder as-is when the optional hydro-oceanography survey report
            // was never uploaded or is incomplete. Defaults to true (previous
            // behavior) so existing jobs keep working unchanged.
            $table->boolean('ai_fill_enabled')->default(true)->after('preview_html');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('egerai_jobs', function (Blueprint $table) {
            $table->dropColumn('ai_fill_enabled');
        });
    }
};
