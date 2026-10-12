<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * NIP doubles as an alternative login identifier for staff accounts
     * (see AuthController::login), alongside email and name.
     */
    public function up(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->string('nip', 50)->nullable()->unique()->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropUnique(['nip']);
            $table->dropColumn('nip');
        });
    }
};
