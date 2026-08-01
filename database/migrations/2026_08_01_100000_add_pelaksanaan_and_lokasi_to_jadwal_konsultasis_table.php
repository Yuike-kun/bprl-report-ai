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
        Schema::table('jadwal_konsultasis', function (Blueprint $table) {
            $table->enum('pelaksanaan', ['Luring', 'Daring', 'Hybrid'])->default('Daring')->after('waktu_akhir');
            $table->foreignId('lokasi_konsultasi_id')->nullable()->after('pelaksanaan')->constrained('lokasi_konsultasis')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jadwal_konsultasis', function (Blueprint $table) {
            $table->dropConstrainedForeignId('lokasi_konsultasi_id');
            $table->dropColumn('pelaksanaan');
        });
    }
};
