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
        Schema::create('reclamation_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('general_draft_id')->constrained()->cascadeOnDelete();
            $table->string('ada_reklamasi')->default('Tidak');
            $table->text('sumber_material')->nullable();
            $table->text('metode_reklamasi')->nullable();
            $table->text('jenis_tanah')->nullable();
            $table->text('daya_dukung')->nullable();
            $table->text('pemanfaatan_lahan')->nullable();
            $table->text('jadwal_reklamasi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reclamation_requirements');
    }
};
