<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('permohonan_konsultasis', function (Blueprint $table) {
            $table->string('disabilitas_penglihatan', 10)->default('tidak')->after('tanda_tangan');
            $table->string('disabilitas_pendengaran', 10)->default('tidak')->after('disabilitas_penglihatan');
            $table->string('disabilitas_mobilitas', 10)->default('tidak')->after('disabilitas_pendengaran');
            $table->string('disabilitas_ingatan', 10)->default('tidak')->after('disabilitas_mobilitas');
            $table->string('disabilitas_perawatan', 10)->default('tidak')->after('disabilitas_ingatan');
            $table->string('disabilitas_komunikasi', 10)->default('tidak')->after('disabilitas_perawatan');
        });
    }

    public function down(): void
    {
        Schema::table('permohonan_konsultasis', function (Blueprint $table) {
            $table->dropColumn([
                'disabilitas_penglihatan',
                'disabilitas_pendengaran',
                'disabilitas_mobilitas',
                'disabilitas_ingatan',
                'disabilitas_perawatan',
                'disabilitas_komunikasi',
            ]);
        });
    }
};
