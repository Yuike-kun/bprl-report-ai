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
        Schema::table('kkprl_proposals', function (Blueprint $table) {
            $table->foreignId('berita_acara_id')
                ->nullable()
                ->after('permohonan_konsultasi_id')
                ->constrained('berita_acara_konsultasis')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kkprl_proposals', function (Blueprint $table) {
            //
        });
    }
};
