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
            // true = kegiatan berusaha, false = kegiatan non-berusaha, null = belum dinyatakan
            $table->boolean('is_business_activity')->nullable()->after('activity_category');
            // true = strategis nasional, false = non-strategis nasional, null = belum dinyatakan
            $table->boolean('is_national_strategic')->nullable()->after('is_business_activity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kkprl_proposals', function (Blueprint $table) {
            $table->dropColumn(['is_business_activity', 'is_national_strategic']);
        });
    }
};
