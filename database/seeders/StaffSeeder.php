<?php

namespace Database\Seeders;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $staffMembers = [
            [
                'name' => 'Admin BPRL',
                'email' => 'admin.bprl@example.com',
                'position' => 'Koordinator BPRL',
                'department' => 'BPRL Makassar',
                'phone' => '081234567890',
                'joined_at' => '2026-01-01',
            ],
            [
                'name' => 'Petugas Konsultasi BPRL',
                'email' => 'petugas.konsultasi@example.com',
                'position' => 'Petugas Konsultasi',
                'department' => 'Pelayanan Konsultasi',
                'phone' => '081234567891',
                'joined_at' => '2026-01-01',
            ],
            [
                'name' => 'Evaluator KKPRL BPRL',
                'email' => 'evaluator.kkprl@example.com',
                'position' => 'Evaluator KKPRL',
                'department' => 'Evaluasi Teknis',
                'phone' => '081234567892',
                'joined_at' => '2026-01-01',
            ],
        ];

        foreach ($staffMembers as $staffMember) {
            $user = User::updateOrCreate(
                ['email' => $staffMember['email']],
                [
                    'name' => $staffMember['name'],
                    'password' => Hash::make('password'),
                    'role' => 'pegawai',
                ],
            );

            Staff::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'position' => $staffMember['position'],
                    'department' => $staffMember['department'],
                    'phone' => $staffMember['phone'],
                    'joined_at' => $staffMember['joined_at'],
                    'is_active' => true,
                ],
            );
        }
    }
}
