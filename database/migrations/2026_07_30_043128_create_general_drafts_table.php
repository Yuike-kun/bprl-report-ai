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
        Schema::create('general_drafts', function (Blueprint $table) {
            $table->id();
            $table->string('nama_perusahaan');
            $table->string('nib');
            $table->string('npwp');
            $table->string('telp');
            $table->string('email');
            $table->string('jenis_kegiatan');
            $table->string('no_referensi');
            $table->datetime('tanggal_penyusunan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('general_drafts');
    }
};
