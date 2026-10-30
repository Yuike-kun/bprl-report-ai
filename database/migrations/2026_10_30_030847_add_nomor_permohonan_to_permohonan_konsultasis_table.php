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
            $table->string('nomor_permohonan')->nullable()->unique()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permohonan_konsultasis', function (Blueprint $table) {
            $table->dropColumn('nomor_permohonan');
        });
    }
};
