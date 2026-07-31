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
        Schema::create('sea_construction_and_installations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('general_draft_id')->constrained()->cascadeOnDelete();

            $table->string("nama_perairan");
            $table->string("provinsi");
            $table->string("kabupaten");
            $table->string("kecamatan");
            $table->string("desa");
            $table->text("uraian_kegiatan");
            $table->string("jadwal_konstruksi");
            $table->string("luas_ruang_total");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sea_construction_and_installations');
    }
};
