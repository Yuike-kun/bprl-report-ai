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
        Schema::table('permohonan_konsultasis', function (Blueprint $table) {
            $table->longText('staff_tanda_tangan')->nullable()->after('setuju_syarat_ketentuan'); // base64 atau path file
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permohonan_konsultasis', function (Blueprint $table) {
            $table->dropColumn('staff_tanda_tangan');
        });
    }
};
