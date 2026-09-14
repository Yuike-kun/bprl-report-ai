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
        Schema::create('egerai_jobs', function (Blueprint $table) {
            $table->id();
            $table->uuid('job_id')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('needs_review'); // needs_review | ready

            $table->string('prop_source_path')->nullable();
            $table->string('prop_source_filename')->nullable();
            $table->string('lap_source_path')->nullable();
            $table->string('lap_source_filename')->nullable();

            $table->json('prop_fields')->nullable();
            $table->json('lap_fields')->nullable();
            $table->json('prop_images')->nullable(); // manifest: [{tag,file,ext}]
            $table->json('lap_images')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('egerai_jobs');
    }
};
