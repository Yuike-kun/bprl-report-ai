<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // `assign_request_to_staff.staff` / `.request_form_id` were created as
        // foreignId columns but never got a real constraint, so rows could
        // silently point at a deleted staff/consultation record. Clean up any
        // orphaned rows before adding the constraint so it doesn't fail.
        DB::table('assign_request_to_staff')
            ->whereNotIn('staff', function ($query) {
                $query->select('id')->from('staff');
            })
            ->orWhereNotIn('request_form_id', function ($query) {
                $query->select('id')->from('permohonan_konsultasis');
            })
            ->delete();

        Schema::table('assign_request_to_staff', function (Blueprint $table) {
            $table->foreign('staff')->references('id')->on('staff')->cascadeOnDelete();
            $table->foreign('request_form_id')->references('id')->on('permohonan_konsultasis')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assign_request_to_staff', function (Blueprint $table) {
            $table->dropForeign(['staff']);
            $table->dropForeign(['request_form_id']);
        });
    }
};
