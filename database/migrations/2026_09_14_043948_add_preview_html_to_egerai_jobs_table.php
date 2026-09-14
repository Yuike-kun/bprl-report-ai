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
            // Full rendered "what you'll get" document preview (PhpWord HTML
            // writer output, images inlined as base64), mirrors the reference
            // Python app's mammoth-converted docx-to-HTML preview panel.
            $table->longText('preview_html')->nullable()->after('lap_images');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('egerai_jobs', function (Blueprint $table) {
            $table->dropColumn('preview_html');
        });
    }
};
