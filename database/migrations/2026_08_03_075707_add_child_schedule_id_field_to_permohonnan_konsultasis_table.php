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
            $table->foreignId('child_schedule_id')
                ->nullable()
                ->after('jadwal_konsultasi_id')
                ->constrained('child_schedules')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permohonan_konsultasis', function (Blueprint $table) {
            $table->dropConstrainedForeignId('child_schedule_id');
        });
    }
};
