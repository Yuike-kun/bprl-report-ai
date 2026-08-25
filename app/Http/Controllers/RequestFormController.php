<?php
namespace App\Http\Controllers;

use App\Models\ChildSchedule;
use App\Models\DokumenKonsultasi;
use App\Models\JadwalKonsultasi;
use App\Models\LokasiKonsultasi;
use App\Models\PermohonanKonsultasi;
use App\Models\Province;
use App\Models\Regency;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RequestFormController extends Controller
{
    public function index(): Response
    {
        $usageByChildSchedule = PermohonanKonsultasi::query()
            ->whereNotNull('child_schedule_id')
            ->selectRaw('child_schedule_id, count(*) as total')
            ->groupBy('child_schedule_id')
            ->pluck('total', 'child_schedule_id');

        $schedules = JadwalKonsultasi::query()
            ->with(['lokasi:id,nama_lokasi', 'child_schedules'])
            ->where('tanggal', '>=', now()->format('Y-m-d'))
            ->orderBy('tanggal')
            ->orderBy('waktu_awal')
            ->get(['id', 'tanggal', 'waktu_awal', 'waktu_akhir', 'pelaksanaan', 'lokasi_konsultasi_id', 'kuota_konsultasi'])
            ->map(function ($schedule) use ($usageByChildSchedule) {
                $childSchedules = $schedule->child_schedules
                    ->map(function ($child) use ($usageByChildSchedule) {
                        $used = (int) ($usageByChildSchedule[$child->id] ?? 0);

                        return [
                            'id'               => $child->id,
                            'waktu'            => $child->waktu,
                            'kuota_konsultasi' => $child->kuota_konsultasi,
                            'sisa_kuota'       => max(0, $child->kuota_konsultasi - $used),
                        ];
                    })
                    ->values();

                return [
                    'id'                   => $schedule->id,
                    'tanggal'              => $schedule->tanggal,
                    'waktu_awal'           => $schedule->waktu_awal,
                    'waktu_akhir'          => $schedule->waktu_akhir,
                    'pelaksanaan'          => $schedule->pelaksanaan,
                    'lokasi_konsultasi_id' => $schedule->lokasi_konsultasi_id,
                    'lokasi_nama'          => $schedule->lokasi?->nama_lokasi,
                    'kuota_konsultasi'     => $schedule->kuota_konsultasi,
                    'child_schedules'      => $childSchedules,
                ];
            })
            ->values();

        return Inertia::render('request-form', [
            'locations' => LokasiKonsultasi::query()
                ->orderBy('nama_lokasi')
                ->get(['id', 'nama_lokasi']),
            'schedules' => $schedules
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_pemohon'            => ['required', 'string', 'max:255'],
            'jabatan_pemohon'         => ['required', 'string', 'max:255'],
            'instansi'                => ['required', 'string', 'max:255'],
            'tanggal_konsultasi'      => ['required', 'date'],
            'child_schedule_id'       => ['required', 'integer', 'exists:child_schedules,id'],
            'pelaksanaan'             => ['required', 'in:Luring,Daring,Hybrid'],
            'lokasi_konsultasi_id'    => ['nullable', 'exists:lokasi_konsultasis,id'],
            'rencana_kegiatan'        => ['required', 'string'],
            'kabupaten'               => ['required', 'string', 'max:255'],
            'provinsi'                => ['required', 'string', 'max:255'],
            'nomor_telepon'           => ['required', 'string', 'max:30'],
            'email'                   => ['required', 'email', 'max:255'],
            'permintaan_khusus'       => ['nullable', 'string'],
            'tanda_tangan'            => ['required', 'string'],
            'setuju_syarat_ketentuan' => ['accepted'],
            'bahan_konsultasi'        => ['nullable', 'array', 'max:5'],
            'bahan_konsultasi.*'      => ['file', 'max:10240', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png'],
        ]);

        if (in_array($validated['pelaksanaan'], ['Luring', 'Hybrid'], true) && empty($validated['lokasi_konsultasi_id'])) {
            return back()
                ->withErrors(['lokasi_konsultasi_id' => 'Lokasi konsultasi wajib dipilih untuk pelaksanaan luring atau hybrid.'])
                ->withInput();
        }

        if ($validated['pelaksanaan'] === 'Daring') {
            $validated['lokasi_konsultasi_id'] = null;
        }

        $childSchedule  = ChildSchedule::with('schedule')->find($validated['child_schedule_id']);
        $parentSchedule = $childSchedule?->schedule;

        $isValidSlot = $parentSchedule
        && Carbon::parse($parentSchedule->tanggal)->format('Y-m-d') === $validated['tanggal_konsultasi']
        && $parentSchedule->pelaksanaan === $validated['pelaksanaan']
        && (string) ($parentSchedule->lokasi_konsultasi_id ?? '') === (string) ($validated['lokasi_konsultasi_id'] ?? '');

        if (! $isValidSlot) {
            return back()
                ->withErrors(['child_schedule_id' => 'Jadwal konsultasi tidak valid. Pilih slot yang tersedia dari daftar jadwal.'])
                ->withInput();
        }

        $usedQuota = PermohonanKonsultasi::query()
            ->where('child_schedule_id', $childSchedule->id)
            ->count();

        if ($usedQuota >= $childSchedule->kuota_konsultasi) {
            return back()
                ->withErrors(['child_schedule_id' => 'Kuota slot yang dipilih sudah penuh. Silakan pilih slot lain.'])
                ->withInput();
        }

        $permohonan = PermohonanKonsultasi::create([
            'jadwal_konsultasi_id'    => $parentSchedule->id,
            'child_schedule_id'       => $childSchedule->id,
            'waktu_konsultasi'        => $childSchedule->waktu,
            'nama_pemohon'            => $validated['nama_pemohon'],
            'jabatan_pemohon'         => $validated['jabatan_pemohon'],
            'instansi'                => $validated['instansi'],
            'rencana_kegiatan'        => $validated['rencana_kegiatan'],
            'kabupaten'               => $validated['kabupaten'],
            'provinsi'                => $validated['provinsi'],
            'nomor_telepon'           => $validated['nomor_telepon'],
            'email'                   => $validated['email'],
            'permintaan_khusus'       => $validated['permintaan_khusus'],
            'setuju_syarat_ketentuan' => $validated['setuju_syarat_ketentuan'],
            'tanda_tangan'            => $validated['tanda_tangan'],
            'status'                  => 'draft',
        ]);

        if (! empty($validated['bahan_konsultasi'])) {
            foreach ($validated['bahan_konsultasi'] as $file) {
                $path = $file->store("bahan_konsultasi/{$permohonan->id}", 'public');
                DokumenKonsultasi::create([
                    'permohonan_id' => $permohonan->id,
                    'file_url'      => Storage::url($path),
                    'file_name'     => $file->getClientOriginalName(),
                ]);
            }
        }

        return redirect()
            ->route('request-form')
            ->with('success', 'Permohonan konsultasi berhasil dikirim. Tim kami akan menindaklanjuti segera.');
    }
}
