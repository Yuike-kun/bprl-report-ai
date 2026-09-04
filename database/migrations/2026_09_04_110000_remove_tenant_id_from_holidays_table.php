<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('holidays', 'tenant_id')) {
            Schema::table('holidays', function (Blueprint $table) {
                $table->dropIndex(['tenant_id', 'tanggal']);
                $table->dropColumn('tenant_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('holidays', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->nullable()->index();
        });
    }
};