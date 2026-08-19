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
        Schema::table('kkprl_proposals', function (Blueprint $table) {
            $table->string('applicant_name')->nullable()->change();
            $table->string('applicant_position')->nullable()->change();
            $table->string('company_name')->nullable()->change();
            $table->string('phone_number')->nullable()->change();
            $table->string('email')->nullable()->change();
            $table->string('village')->nullable()->change();
            $table->string('district')->nullable()->change();
            $table->string('regency')->nullable()->change();
            $table->string('province')->nullable()->change();
            $table->string('water_name')->nullable()->change();
            $table->decimal('area_size', 12, 4)->nullable()->change();
            $table->text('coordinates')->nullable()->change();
            $table->string('activity_status')->nullable()->change();
            $table->text('activity_description')->nullable()->change();
            $table->text('activity_benefit')->nullable()->change();
            $table->text('activity_purpose')->nullable()->change();
            $table->text('marine_spatial_activity_description')->nullable()->change();
            $table->string('officer_email')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kkprl_proposals', function (Blueprint $table) {
            $table->string('applicant_name')->nullable(false)->change();
            $table->string('applicant_position')->nullable(false)->change();
            $table->string('company_name')->nullable(false)->change();
            $table->string('phone_number')->nullable(false)->change();
            $table->string('email')->nullable(false)->change();
            $table->string('village')->nullable(false)->change();
            $table->string('district')->nullable(false)->change();
            $table->string('regency')->nullable(false)->change();
            $table->string('province')->nullable(false)->change();
            $table->string('water_name')->nullable(false)->change();
            $table->decimal('area_size', 12, 4)->nullable(false)->change();
            $table->text('coordinates')->nullable(false)->change();
            $table->string('activity_status')->nullable(false)->change();
            $table->text('activity_description')->nullable(false)->change();
            $table->text('activity_benefit')->nullable(false)->change();
            $table->text('activity_purpose')->nullable(false)->change();
            $table->text('marine_spatial_activity_description')->nullable(false)->change();
            $table->string('officer_email')->nullable(false)->change();
        });
    }
};
