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
        Schema::create('permohonan_konsultasis', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pemohon');
            $table->string('jabatan_pemohon');
            $table->string('instansi');
            $table->date('tanggal_konsultasi');
            $table->string('waktu_konsultasi');
            $table->enum('pelaksanaan', ['Luring', 'Daring', 'Hybrid']);
            $table->foreignId('lokasi_konsultasi_id')->nullable()->constrained('lokasi_konsultasis');
            $table->text('rencana_kegiatan');
            $table->string('kabupaten');
            $table->string('provinsi');
            $table->string('nomor_telepon');
            $table->string('email');
            $table->text('permintaan_khusus')->nullable();
            $table->boolean('setuju_syarat_ketentuan')->default(false);
            $table->longText('tanda_tangan')->nullable(); // base64 atau path file
            $table->enum('status', ['draft', 'dikirim', 'selesai'])->default('dikirim');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permohonan_konsultasis');
    }
};
