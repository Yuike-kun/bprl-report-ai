<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kkprl_proposals', function (Blueprint $table) {
            $table->id();

            // ── 1. Reklamasi ─────────────────────────────────────────
            $table->boolean('is_reclamation')->default(false);

            // ── 2. Data Pemohon ──────────────────────────────────────
            $table->string('applicant_name');
            $table->string('applicant_position');
            $table->string('company_name');
            $table->string('nib')->nullable();
            $table->string('npwp')->nullable();
            $table->string('phone_number');
            $table->string('email');
            $table->string('status')->default('dikirim');

            // ── 3. Detail Kegiatan (checkbox) ────────────────────────
            $table->json('activity_details');

            // ── 4. Lokasi ────────────────────────────────────────────
            $table->string('village');
            $table->string('district');
            $table->string('regency');
            $table->string('province');
            $table->string('water_name');
            $table->decimal('area_size', 12, 4); // Luas area
            $table->text('coordinates');

                                                 // ── 5. Status & Kategori Kegiatan ────────────────────────
            $table->string('activity_status');   // Eksisting / Rencana
            $table->string('activity_category'); // Berusaha / Non Berusaha
            $table->string('activity_type');     // Strategis / Non-Strategis Nasional

            // ── 6. Instalasi Bangunan ────────────────────────────────
            $table->string('marine_installation')->nullable();
            $table->json('installation_location')->nullable();

            // ── 7. Deskripsi, Manfaat, Tujuan ────────────────────────
            $table->text('activity_description');
            $table->text('activity_benefit');
            $table->text('activity_purpose');

            // ── 8. Tenaga Kerja & Investasi ──────────────────────────
            $table->string('local_workers');
            $table->string('foreign_workers')->nullable();
            $table->string('investment_value');
            $table->text('schedule_description');

            // ── 9. Dokumen Pendukung (checkbox) ──────────────────────
            $table->json('supporting_documents');
            $table->string('map_source');

            // ── 10. Upload dokumen umum ──────────────────────────────
            $table->string('existing_doc_path')->nullable();
            $table->string('site_plan_path')->nullable();
            $table->string('location_map_path')->nullable();

            // ── 11. Sosial Ekonomi & Aksesibilitas ───────────────────
            $table->string('population_count');
            $table->string('village_area');
            $table->text('livelihood_description');
            $table->string('sosek_data_source');
            $table->string('sosek_data_year');
            $table->text('accessibility_description');
            $table->string('accessibility_map_path');

            // ── 12. Kondisi Terkini Lokasi ───────────────────────────
            $table->string('hydro_oceanography_doc_path');

            // Mangrove
            $table->boolean('has_mangrove')->default(false);
            $table->string('mangrove_species')->nullable();
            $table->decimal('mangrove_cover_percentage', 5, 2)->nullable();
            $table->string('mangrove_condition')->nullable();
            $table->string('mangrove_doc_path')->nullable();

            // Lamun
            $table->boolean('has_seagrass')->default(false);
            $table->string('seagrass_species')->nullable();
            $table->decimal('seagrass_cover_percentage', 5, 2)->nullable();
            $table->string('seagrass_condition')->nullable();
            $table->string('seagrass_doc_path')->nullable();

            // Terumbu Karang
            $table->boolean('has_coral_reef')->default(false);
            $table->string('coral_reef_species')->nullable();
            $table->decimal('coral_reef_cover_percentage', 5, 2)->nullable();
            $table->string('coral_reef_condition')->nullable();
            $table->string('coral_reef_doc_path')->nullable();

            // ── 13. Pemanfaatan Ruang Laut ───────────────────────────
            $table->text('marine_spatial_activity_description');
            $table->json('marine_spatial_docs_path')->nullable();

            // ── 14. Petugas & Dokumen Persyaratan Lainnya ───────────
            $table->string('officer_email');
            $table->string('land_certificate_path')->nullable();
            $table->string('socialization_doc_path')->nullable();
            $table->string('other_supporting_doc_path')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kkprl_proposals');
    }
};
