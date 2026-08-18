<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kkprl_proposals', function (Blueprint $table) {
            $table->string('map_source')->nullable()->change();
            $table->string('accessibility_map_path')->nullable()->change();
            $table->string('hydro_oceanography_doc_path')->nullable()->change();
            $table->json('activity_details')->nullable()->change();
            $table->json('supporting_documents')->nullable()->change();
            $table->string('local_workers')->nullable()->change();
            $table->string('investment_value')->nullable()->change();
            $table->text('schedule_description')->nullable()->change();
            $table->string('population_count')->nullable()->change();
            $table->string('village_area')->nullable()->change();
            $table->text('livelihood_description')->nullable()->change();
            $table->string('sosek_data_source')->nullable()->change();
            $table->string('sosek_data_year')->nullable()->change();
            $table->text('accessibility_description')->nullable()->change();
            $table->string('activity_category')->nullable()->change();
            $table->string('activity_type')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('kkprl_proposals', function (Blueprint $table) {
            $table->string('map_source')->nullable(false)->change();
            $table->string('accessibility_map_path')->nullable(false)->change();
            $table->string('hydro_oceanography_doc_path')->nullable(false)->change();
            $table->json('activity_details')->nullable(false)->change();
            $table->json('supporting_documents')->nullable(false)->change();
            $table->string('local_workers')->nullable(false)->change();
            $table->string('investment_value')->nullable(false)->change();
            $table->text('schedule_description')->nullable(false)->change();
            $table->string('population_count')->nullable(false)->change();
            $table->string('village_area')->nullable(false)->change();
            $table->text('livelihood_description')->nullable(false)->change();
            $table->string('sosek_data_source')->nullable(false)->change();
            $table->string('sosek_data_year')->nullable(false)->change();
            $table->text('accessibility_description')->nullable(false)->change();
            $table->string('activity_category')->nullable(false)->change();
            $table->string('activity_type')->nullable(false)->change();
        });
    }
};
