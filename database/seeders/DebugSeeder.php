<?php

namespace Database\Seeders;

use App\Models\BeritaAcaraKonsultasi;
use App\Models\ChildSchedule;
use App\Models\JadwalKonsultasi;
use App\Models\KkprlProposal;
use App\Models\PermohonanKonsultasi;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Opt-in dummy data for local debugging. NEVER called from
 * DatabaseSeeder — run it explicitly:
 *
 *   php artisan db:seed --class=DebugSeeder
 *
 * Every record is keyed by a fixed debug email/NIP and written with
 * updateOrCreate, so re-running only refreshes the same rows instead
 * of duplicating them. All accounts use the password `password`.
 *
 * Handy logins after seeding:
 *   debug.admin@example.test   (admin)
 *   Debug Pegawai / DEBUGNIP001 (pegawai, also by name or NIP)
 *   debug.pemohon@example.test (pemohon)
 *
 * The public /cek-berita-acara page can be tried with
 * debug.mohon1@example.test + 081990001001 (has a final BA).
 */
class DebugSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Debug Admin', 'email' => 'debug.admin@example.test', 'role' => 'admin'],
            ['name' => 'Debug Pegawai', 'email' => 'debug.pegawai@example.test', 'role' => 'pegawai'],
            ['name' => 'Debug Pemohon', 'email' => 'debug.pemohon@example.test', 'role' => 'pemohon'],
        ];

        foreach ($users as $row) {
            User::updateOrCreate(
                ['email' => $row['email']],
                ['name' => $row['name'], 'password' => Hash::make('password'), 'role' => $row['role']],
            );
        }

        $pegawai = User::where('email', 'debug.pegawai@example.test')->firstOrFail();

        $staff = Staff::updateOrCreate(
            ['user_id' => $pegawai->id],
            [
                'nip' => 'DEBUGNIP001',
                'position' => 'Petugas Konsultasi',
                'department' => 'Pelayanan Konsultasi',
                'phone' => '081990001000',
                'joined_at' => '2026-01-05',
                'is_active' => true,
            ],
        );

        $jadwal1 = JadwalKonsultasi::updateOrCreate(
            ['tanggal' => '2026-10-20', 'waktu_awal' => '09:00:00'],
            ['waktu_akhir' => '12:00:00', 'pelaksanaan' => 'Luring', 'kuota_konsultasi' => 10],
        );

        $jadwal2 = JadwalKonsultasi::updateOrCreate(
            ['tanggal' => '2026-10-21', 'waktu_awal' => '13:00:00'],
            ['waktu_akhir' => '15:00:00', 'pelaksanaan' => 'Daring', 'kuota_konsultasi' => 10],
        );

        $slot1 = ChildSchedule::firstOrCreate(
            ['schedule_id' => $jadwal1->id, 'waktu' => '09:00'],
            ['kuota_konsultasi' => 5],
        );

        ChildSchedule::firstOrCreate(
            ['schedule_id' => $jadwal1->id, 'waktu' => '10:00'],
            ['kuota_konsultasi' => 5],
        );

        ChildSchedule::firstOrCreate(
            ['schedule_id' => $jadwal2->id, 'waktu' => '13:00'],
            ['kuota_konsultasi' => 5],
        );

        // Full record: schedule + slot assigned.
        $mohon1 = PermohonanKonsultasi::updateOrCreate(
            ['email' => 'debug.mohon1@example.test'],
            [
                'jadwal_konsultasi_id' => $jadwal1->id,
                'child_schedule_id' => $slot1->id,
                'waktu_konsultasi' => '09:00:00',
                'nama_pemohon' => 'Debug Pemohon Satu',
                'jabatan_pemohon' => 'Direktur',
                'instansi' => 'PT Debug Satu',
                'rencana_kegiatan' => 'Terminal Khusus',
                'kabupaten' => 'Makassar',
                'provinsi' => 'Sulawesi Selatan',
                'nomor_telepon' => '081990001001',
                'permintaan_khusus' => null,
                'setuju_syarat_ketentuan' => true,
                'status' => 'dikirim',
            ],
        );

        // No slot assigned yet — exercises the null child_schedules guard
        // on the master permohonan list.
        $mohon2 = PermohonanKonsultasi::updateOrCreate(
            ['email' => 'debug.mohon2@example.test'],
            [
                'jadwal_konsultasi_id' => $jadwal2->id,
                'child_schedule_id' => null,
                'waktu_konsultasi' => '13:00:00',
                'nama_pemohon' => 'Debug Pemohon Dua',
                'jabatan_pemohon' => 'Manager',
                'instansi' => 'PT Debug Dua',
                'rencana_kegiatan' => 'Pariwisata',
                'kabupaten' => 'Maros',
                'provinsi' => 'Sulawesi Selatan',
                'nomor_telepon' => '081990001002',
                'permintaan_khusus' => 'Mohon slot sore hari.',
                'setuju_syarat_ketentuan' => true,
                'status' => 'dikirim',
            ],
        );

        PermohonanKonsultasi::updateOrCreate(
            ['email' => 'debug.mohon3@example.test'],
            [
                'jadwal_konsultasi_id' => $jadwal1->id,
                'child_schedule_id' => $slot1->id,
                'waktu_konsultasi' => '10:00:00',
                'nama_pemohon' => 'Debug Pemohon Tiga',
                'jabatan_pemohon' => 'Staff',
                'instansi' => 'PT Debug Tiga',
                'rencana_kegiatan' => 'Perikanan Laut',
                'kabupaten' => 'Gowa',
                'provinsi' => 'Sulawesi Selatan',
                'nomor_telepon' => '081990001003',
                'permintaan_khusus' => null,
                'setuju_syarat_ketentuan' => true,
                'status' => 'selesai',
            ],
        );

        // Konsultasi path with WYSIWYG HTML notes (exercises the PDF
        // sanitizer + formatted output).
        BeritaAcaraKonsultasi::updateOrCreate(
            ['request_form_id' => $mohon1->id],
            [
                'staff_1_id' => $staff->id,
                'status' => 'final',
                'consultation_stage' => 'konsultasi',
                'consultation_date' => '2026-10-20',
                'implementation_mode' => 'luring',
                'location' => 'Kantor BPRL Makassar',
                'requester_name' => 'Debug Pemohon Satu',
                'requester_position' => 'Direktur',
                'legal_entity_name' => 'PT Debug Satu',
                'contact_email' => 'debug.mohon1@example.test',
                'permit_type' => 'persetujuan',
                'activity_type' => 'berusaha',
                'activity_detail' => ['Terminal Khusus'],
                'province' => 'Sulawesi Selatan',
                'regency' => 'Makassar',
                'water_name' => 'Selat Makassar',
                'consultation_notes' => '<h3>Kesepakatan</h3><p>Pemohon wajib melampirkan <strong>site plan</strong> dan <em>peta lokasi</em>:</p><ul><li>Posisi pipa pengambilan air laut</li><li>Batas area budidaya</li></ul><p style="text-align: center;">Disetujui bersama</p>',
            ],
        );

        // Asistensi path with formatted narrative fields.
        BeritaAcaraKonsultasi::updateOrCreate(
            ['request_form_id' => $mohon2->id],
            [
                'staff_1_id' => $staff->id,
                'status' => 'draft',
                'consultation_stage' => 'asistensi',
                'consultation_date' => '2026-10-21',
                'implementation_mode' => 'daring',
                'location' => 'Zoom Meeting',
                'requester_name' => 'Debug Pemohon Dua',
                'requester_position' => 'Manager',
                'legal_entity_name' => 'PT Debug Dua',
                'contact_email' => 'debug.mohon2@example.test',
                'permit_type' => 'konfirmasi',
                'activity_type' => 'non_berusaha',
                'activity_detail' => ['Pariwisata'],
                'province' => 'Sulawesi Selatan',
                'regency' => 'Maros',
                'water_name' => 'Selat Makassar',
                'activity_category' => 'Pariwisata Bahari',
                'planned_area' => 2.5,
                'planned_area_unit' => 'Ha',
                'existing_condition' => 'rencana',
                'coordinate_points' => "1. 119.4000,-5.1000\n2. 119.4100,-5.1100",
                'owned_documents' => ['NIB'],
                'activity_description' => '<p>Rencana <strong>wisata bahari</strong> terapung:</p><ol><li>Dermaga apung</li><li>Gazebo pantai</li></ol>',
                'surrounding_utilization' => '<p>Area sekitar dimanfaatkan untuk <em>perikanan tangkap</em> tradisional.</p>',
                'environmental_condition' => '<p>Kondisi perairan <u>baik</u>, kecerahan tinggi.</p>',
                'other_information' => '<p>Tidak ada informasi tambahan.</p>',
                'consultation_result' => 'dokumen_sesuai',
            ],
        );

        KkprlProposal::updateOrCreate(
            ['email' => 'debug.mohon1@example.test'],
            [
                'applicant_name' => 'Debug Pemohon Satu',
                'applicant_position' => 'Direktur',
                'company_name' => 'PT Debug Satu',
                'phone_number' => '081990001001',
                'status' => 'dikirim',
                'province' => 'Sulawesi Selatan',
                'regency' => 'Makassar',
                'water_name' => 'Selat Makassar',
                'activity_description' => 'Terminal khusus untuk kegiatan debug.',
            ],
        );

        $this->command->info('DebugSeeder: 3 users, 1 staff (NIP DEBUGNIP001), 2 jadwal, 3 permohonan, 2 BA, 1 proposal.');
    }
}
