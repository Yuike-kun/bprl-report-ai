<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal')->index();
            $table->string('nama');
            $table->enum('tipe', ['Nasional', 'Perusahaan', 'Custom'])->default('Custom');
            $table->boolean('is_recurring')->default(false);
            $table->boolean('locked')->default(false);
            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};
