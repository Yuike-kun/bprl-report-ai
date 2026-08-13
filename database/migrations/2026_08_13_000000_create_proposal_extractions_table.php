<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposal_extractions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('source_path');
            $table->string('source_filename');
            $table->json('fields');
            $table->json('missing_fields')->nullable();
            $table->json('coordinates')->nullable();
            $table->string('status')->default('needs_review');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposal_extractions');
    }
};
