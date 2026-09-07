<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('berita_acara_konsultasi_staff');

        Schema::create('berita_acara_konsultasi_staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('berita_acara_konsultasi_id')
                ->constrained('berita_acara_konsultasis')
                ->cascadeOnDelete();
            $table->foreignId('staff_id')
                ->constrained('staff')
                ->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['berita_acara_konsultasi_id', 'staff_id'], 'bak_staff_unique');
        });

        DB::table('berita_acara_konsultasis')->orderBy('id')->each(function (object $record): void {
            $staffIds = collect([
                $record->staff_1_id,
                $record->staff_2_id,
                $record->staff_3_id,
                $record->staff_4_id,
            ])->filter()->unique()->values();

            foreach ($staffIds as $index => $staffId) {
                DB::table('berita_acara_konsultasi_staff')->insert([
                    'berita_acara_konsultasi_id' => $record->id,
                    'staff_id' => $staffId,
                    'sort_order' => $index,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('berita_acara_konsultasi_staff');
    }
};
