<?php
namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // indonesia.sql contains raw CREATE TABLE statements, so loading it
        // twice fatals with "Table already exists" and StaffSeeder below
        // never runs. Skip it once the wilayah data is already in place.
        if (!Schema::hasTable('provinces') || DB::table('provinces')->count() === 0) {
            DB::unprepared(file_get_contents(database_path('dump/indonesia.sql')));
        }

        $this->call(StaffSeeder::class);
    }
}
