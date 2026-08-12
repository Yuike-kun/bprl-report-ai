<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('berita_acara_konsultasis', function (Blueprint $table) {
            $table->text('consultation_notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('berita_acara_konsultasis', function (Blueprint $table) {
            $table->dropColumn('consultation_notes');
        });
    }
};
