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
            $table->foreignId('permohonan_konsultasi_id')
                ->nullable()
                ->after('id')
                ->constrained('permohonan_konsultasis')
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
