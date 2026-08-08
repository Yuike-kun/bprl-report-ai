<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('berita_acara_konsultasis', function (Blueprint $table) {
            $table->id();

            // --- Relations ---
            $table->foreignId('requester_id')->nullable()->constrained('requesters')->nullOnDelete();
            $table->foreignId('staff_1_id')->nullable()->constrained('staff')->nullOnDelete();
            $table->foreignId('staff_2_id')->nullable()->constrained('staff')->nullOnDelete();
            $table->foreignId('staff_3_id')->nullable()->constrained('staff')->nullOnDelete();
            $table->foreignId('staff_4_id')->nullable()->constrained('staff')->nullOnDelete();

            // --- Status ---
            $table->string('status');

            // ── STEP 1 : Session Info ──────────────────────────────────────────
            $table->enum('consultation_stage', ['konsultasi', 'asistensi']);
            $table->date('consultation_date');
            $table->string('berita_acara_number')->nullable();
            $table->enum('implementation_mode', ['daring', 'luring', 'hybrid']);
            $table->string('location');                  // predefined option
            $table->string('location_other')->nullable(); // "Lainnya" free text

            // ── STEP 1 : Requester & Site ─────────────────────────────────────
            $table->string('requester_name');
            $table->string('requester_position');
            $table->string('legal_entity_name');
            $table->string('contact_email');
            $table->enum('permit_type', ['persetujuan', 'konfirmasi']);
            $table->enum('activity_type', ['berusaha', 'non_berusaha']);
            $table->string('activity_detail');           // predefined option
            $table->string('activity_detail_other')->nullable();
            $table->string('kbli')->nullable();
            $table->string('province');
            $table->string('regency');
            $table->string('district')->nullable();
            $table->string('water_name');
            $table->string('water_name_other')->nullable();
            $table->string('consultation_instruments')->nullable();

            // ── STEP 2 : Asistensi Fields (nullable — only when stage=asistensi) ──
            $table->string('activity_category')->nullable();
            $table->decimal('planned_area', 15, 4)->nullable();
            $table->string('planned_area_unit')->nullable(); // Ha or Km
            $table->enum('existing_condition', ['rencana', 'eksisting', 'konstruksi'])->nullable();
            $table->text('coordinate_points')->nullable();   // "lon, lat" Decimal Degree
            $table->json('owned_documents')->nullable();     // array of checkboxes
            $table->string('owned_documents_other')->nullable();

            // 4 long-text narrative fields
            $table->longText('activity_description')->nullable();
            $table->longText('surrounding_utilization')->nullable();
            $table->longText('environmental_condition')->nullable();
            $table->longText('other_information')->nullable();

            $table->enum('consultation_result', ['dokumen_sesuai', 'perlu_perbaikan'])->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('berita_acara_konsultasis');
    }
};
