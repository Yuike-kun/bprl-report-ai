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
        Schema::create('space_utilization_infos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('general_draft_id')->constrained()->cascadeOnDelete();
            $table->string('permukiman_nelayan');
            $table->string('alur_pelayaran');
            $table->string('area_tangkap');
            $table->string('aktivitas_lain');
            $table->text('peta_pemanfaatan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('space_utilization_infos');
    }
};
