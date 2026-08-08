<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('berita_acara_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('berita_acara_konsultasi_id')
                  ->constrained('berita_acara_konsultasis')
                  ->cascadeOnDelete();

            // document_type maps to the upload slot name
            $table->string('document_type');   // e.g. dokumentasi_konsultasi, absensi_pendampingan …
            $table->string('file_name');       // original filename
            $table->string('file_path');       // relative storage path
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('file_size')->nullable(); // bytes

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('berita_acara_documents');
    }
};
