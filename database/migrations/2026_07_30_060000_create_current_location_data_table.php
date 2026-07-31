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
        Schema::create('current_location_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('general_draft_id')->constrained()->cascadeOnDelete();
            $table->text('analisis_oseanografi_file')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('current_location_data');
    }
};
