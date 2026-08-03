<?php
namespace App\Http\Controllers;

use App\Models\JadwalKonsultasi;
use App\Models\LokasiKonsultasi;
use App\Models\PermohonanKonsultasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RequestFormController extends Controller
{
    public function index(): Response
    {
        $usageBySlot = PermohonanKonsultasi::query()
            ->selectRaw('tanggal_konsultasi, waktu_konsultasi, pelaksanaan, lokasi_konsultasi_id, count(*) as total')
            ->groupBy('tanggal_konsultasi', 'waktu_konsultasi', 'pelaksanaan', 'lokasi_konsultasi_id')
            ->get()
            ->keyBy(function ($item) {
                return $item->tanggal_konsultasi . '|' . $item->waktu_konsultasi . '|' . $item->pelaksanaan . '|' . ($item->lokasi_konsultasi_id ?? 'null');
            });

        $schedules = JadwalKonsultasi::query()
            ->with('lokasi:id,nama_lokasi')
            ->orderBy('tanggal')
            ->orderBy('waktu_awal')
            ->get(['id', 'tanggal', 'waktu_awal', 'waktu_akhir', 'pelaksanaan', 'lokasi_konsultasi_id', 'kuota_konsultasi'])
            ->map(function ($schedule) use ($usageBySlot) {
                $slotKey   = $schedule->tanggal . '|' . $schedule->waktu_awal . '|' . $schedule->pelaksanaan . '|' . ($schedule->lokasi_konsultasi_id ?? 'null');
                $usedCount = (int) optional($usageBySlot->get($slotKey))->total;

                return [
                    'id'                   => $schedule->id,
                    'tanggal'              => $schedule->tanggal,
                    'waktu_awal'           => $schedule->waktu_awal,
                    'waktu_akhir'          => $schedule->waktu_akhir,
                    'pelaksanaan'          => $schedule->pelaksanaan,
                    'lokasi_konsultasi_id' => $schedule->lokasi_konsultasi_id,
                    'lokasi_nama'          => $schedule->lokasi?->nama_lokasi,
                    'kuota_konsultasi'     => $schedule->kuota_konsultasi,
                    'sisa_kuota'           => max(0, $schedule->kuota_konsultasi - $usedCount),
                ];
            })
            ->values();

        return Inertia::render('request-form', [
            'locations' => LokasiKonsultasi::query()
                ->orderBy('nama_lokasi')
                ->get(['id', 'nama_lokasi']),
            'schedules' => $schedules,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_pemohon'            => ['required', 'string', 'max:255'],
            'jabatan_pemohon'         => ['required', 'string', 'max:255'],
            'instansi'                => ['required', 'string', 'max:255'],
            'tanggal_konsultasi'      => ['required', 'date'],
            'waktu_konsultasi'        => ['required', 'date_format:H:i'],
            'pelaksanaan'             => ['required', 'in:Luring,Daring,Hybrid'],
            'lokasi_konsultasi_id'    => ['nullable', 'exists:lokasi_konsultasis,id'],
            'rencana_kegiatan'        => ['required', 'string'],
            'kabupaten'               => ['required', 'string', 'max:255'],
            'provinsi'                => ['required', 'string', 'max:255'],
            'nomor_telepon'           => ['required', 'string', 'max:30'],
            'email'                   => ['required', 'email', 'max:255'],
            'permintaan_khusus'       => ['nullable', 'string'],
            'setuju_syarat_ketentuan' => ['accepted'],
        ]);

        if (in_array($validated['pelaksanaan'], ['Luring', 'Hybrid'], true) && empty($validated['lokasi_konsultasi_id'])) {
            return back()
                ->withErrors(['lokasi_konsultasi_id' => 'Lokasi konsultasi wajib dipilih untuk pelaksanaan luring atau hybrid.'])
                ->withInput();
        }

        if ($validated['pelaksanaan'] === 'Daring') {
            $validated['lokasi_konsultasi_id'] = null;
        }

        $selectedSchedule = JadwalKonsultasi::query()
            ->whereDate('tanggal', $validated['tanggal_konsultasi'])
            ->where('waktu_awal', $validated['waktu_konsultasi'])
            ->where('pelaksanaan', $validated['pelaksanaan'])
            ->where(function ($query) use ($validated) {
                if (empty($validated['lokasi_konsultasi_id'])) {
                    $query->whereNull('lokasi_konsultasi_id');
                    return;
                }

                $query->where('lokasi_konsultasi_id', $validated['lokasi_konsultasi_id']);
            })
            ->first();

        if (! $selectedSchedule) {
            return back()
                ->withErrors(['waktu_konsultasi' => 'Jadwal konsultasi tidak valid. Pilih slot yang tersedia dari daftar jadwal.'])
                ->withInput();
        }

        $usedQuota = PermohonanKonsultasi::query()
            ->whereDate('tanggal_konsultasi', $validated['tanggal_konsultasi'])
            ->where('waktu_konsultasi', $validated['waktu_konsultasi'])
            ->where('pelaksanaan', $validated['pelaksanaan'])
            ->where(function ($query) use ($validated) {
                if (empty($validated['lokasi_konsultasi_id'])) {
                    $query->whereNull('lokasi_konsultasi_id');
                    return;
                }

                $query->where('lokasi_konsultasi_id', $validated['lokasi_konsultasi_id']);
            })
            ->count();

        if ($usedQuota >= $selectedSchedule->kuota_konsultasi) {
            return back()
                ->withErrors(['waktu_konsultasi' => 'Kuota jadwal yang dipilih sudah penuh. Silakan pilih jadwal lain.'])
                ->withInput();
        }

        PermohonanKonsultasi::create([
             ...$validated,
            'status'       => 'dikirim',
            'tanda_tangan' => null,
        ]);

        return redirect()
            ->route('request-form')
            ->with('success', 'Permohonan konsultasi berhasil dikirim. Tim kami akan menindaklanjuti segera.');
    }
}
