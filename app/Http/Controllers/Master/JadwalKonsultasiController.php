<?php
namespace App\Http\Controllers\Master;

use Throwable;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Holiday;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use App\Models\JadwalKonsultasi;
use App\Models\LokasiKonsultasi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class JadwalKonsultasiController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        try {
            $schedules = JadwalKonsultasi::query()
                ->with('lokasi:id,nama_lokasi')
                ->withCount('child_schedules')
                ->when($search !== '', function ($query) use ($search) {
                    $query->whereDate('tanggal', $search)
                        ->orWhere('pelaksanaan', 'like', '%' . $search . '%')
                        ->orWhere('waktu_awal', 'like', '%' . $search . '%')
                        ->orWhere('waktu_akhir', 'like', '%' . $search . '%')
                        ->orWhereHas('lokasi', function ($lokasiQuery) use ($search) {
                            $lokasiQuery->where('nama_lokasi', 'like', '%' . $search . '%');
                        });
                })
                ->orderByDesc('tanggal')
                ->orderBy('waktu_awal')
                ->paginate(10)
                ->withQueryString();
        } catch (Throwable $e) {
            Log::error('Gagal memuat daftar jadwal konsultasi.', [
                'search' => $search,
                'error'  => $e->getMessage(),
            ]);

            return Inertia::render('backend/master/jadwal-konsultasi/index', [
                'schedules' => ['data' => [], 'links' => []],
                'filters'   => ['search' => $search],
                'error'     => 'Gagal memuat daftar jadwal konsultasi. Silakan coba lagi.',
            ]);
        }

        return Inertia::render('backend/master/jadwal-konsultasi/index', [
            'schedules' => $schedules,
            'filters'   => [
                'search' => $search,
            ],
            'success'   => session('success'),
        ]);
    }

    public function create(): Response
    {
        try {
            $locations = LokasiKonsultasi::query()
                ->orderBy('nama_lokasi')
                ->get(['id', 'nama_lokasi']);
        } catch (Throwable $e) {
            Log::error('Gagal memuat daftar lokasi konsultasi.', ['error' => $e->getMessage()]);
            $locations = collect();
        }

        return Inertia::render('backend/master/jadwal-konsultasi/create', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if ($request->has('sessions') && is_array($request->input('sessions'))) {
            $validated = $request->validate([
                'tanggal_mulai'                   => ['required_without:tanggal', 'nullable', 'date'],
                'tanggal_akhir'                   => ['required_without:tanggal', 'nullable', 'date', 'after_or_equal:tanggal_mulai'],
                'tanggal'                         => ['required_without:tanggal_mulai', 'nullable', 'date'],
                'sessions'                        => ['required', 'array', 'min:1', 'max:5'],
                'sessions.*.waktu_awal'           => ['required', 'date_format:H:i'],
                'sessions.*.waktu_akhir'          => ['required', 'date_format:H:i', 'after:sessions.*.waktu_awal'],
                'sessions.*.pelaksanaan'          => ['required', 'in:Luring,Daring,Hybrid'],
                'sessions.*.lokasi_konsultasi_id' => ['nullable', 'exists:lokasi_konsultasis,id'],
                'sessions.*.kuota_konsultasi'     => ['required', 'integer', 'min:1'],
                'sessions.*.jadwal'               => ['nullable', 'array'],
                'sessions.*.jadwal.*.waktu'       => ['required_with:sessions.*.jadwal', 'string'],
                'sessions.*.jadwal.*.kuota_konsultasi' => ['required_with:sessions.*.jadwal', 'integer', 'min:1'],
            ]);

            foreach ($validated['sessions'] as $session) {
                if ($error = $this->validateLokasi($session)) {
                    return $error;
                }
            }

            $sessions = $validated['sessions'];
            $startDate = $validated['tanggal_mulai'] ?? $validated['tanggal'];
            $endDate   = $validated['tanggal_akhir'] ?? $startDate;
        } else {
            $validated = $request->validate([
                'tanggal_mulai'             => ['required_without:tanggal', 'nullable', 'date'],
                'tanggal_akhir'             => ['required_without:tanggal', 'nullable', 'date', 'after_or_equal:tanggal_mulai'],
                'tanggal'                   => ['required_without:tanggal_mulai', 'nullable', 'date'],
                'waktu_awal'                => ['required', 'date_format:H:i'],
                'waktu_akhir'               => ['required', 'date_format:H:i', 'after:waktu_awal'],
                'pelaksanaan'               => ['required', 'in:Luring,Daring,Hybrid'],
                'lokasi_konsultasi_id'      => ['nullable', 'exists:lokasi_konsultasis,id'],
                'kuota_konsultasi'          => ['required', 'integer', 'min:1'],
                'jadwal'                    => ['nullable', 'array'],
                'jadwal.*.waktu'            => ['required_with:jadwal', 'string'],
                'jadwal.*.kuota_konsultasi' => ['required_with:jadwal', 'integer', 'min:1'],
            ]);

            if ($error = $this->validateLokasi($validated)) {
                return $error;
            }

            $sessions = [[
                'waktu_awal'           => $validated['waktu_awal'],
                'waktu_akhir'          => $validated['waktu_akhir'],
                'pelaksanaan'          => $validated['pelaksanaan'],
                'lokasi_konsultasi_id' => $validated['lokasi_konsultasi_id'] ?? null,
                'kuota_konsultasi'     => $validated['kuota_konsultasi'],
                'jadwal'               => $validated['jadwal'] ?? [],
            ]];

            $startDate = $validated['tanggal_mulai'] ?? $validated['tanggal'];
            $endDate   = $validated['tanggal_akhir'] ?? $startDate;
        }

        $holidays = Holiday::query()
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->get()
            ->map(fn($holiday) => $holiday->tanggal instanceof \Carbon\CarbonInterface ? $holiday->tanggal->format('Y-m-d') : (string) $holiday->tanggal)
            ->toArray();

        $period = CarbonPeriod::create($startDate, $endDate);
        $totalCreated = 0;

        try {
            DB::transaction(function () use ($period, $sessions, $holidays, &$totalCreated) {
                foreach ($period as $date) {
                    if ($date->isWeekend()) {
                        continue;
                    }

                    $formattedDate = $date->format('Y-m-d');

                    if (in_array($formattedDate, $holidays, true)) {
                        continue;
                    }

                    foreach ($sessions as $sess) {
                        $childSchedules = $sess['jadwal'] ?? [];
                        $lokasiId = $sess['pelaksanaan'] === 'Daring' ? null : ($sess['lokasi_konsultasi_id'] ?? null);

                        $exists = JadwalKonsultasi::query()
                            ->whereDate('tanggal', $formattedDate)
                            ->where('waktu_awal', $sess['waktu_awal'])
                            ->where('pelaksanaan', $sess['pelaksanaan'])
                            ->where(function ($query) use ($lokasiId) {
                                if (empty($lokasiId)) {
                                    $query->whereNull('lokasi_konsultasi_id');
                                    return;
                                }
                                $query->where('lokasi_konsultasi_id', $lokasiId);
                            })
                            ->exists();

                        if ($exists) {
                            continue;
                        }

                        $jadwalKonsultasi = JadwalKonsultasi::create([
                            'tanggal'              => $formattedDate,
                            'waktu_awal'           => $sess['waktu_awal'],
                            'waktu_akhir'          => $sess['waktu_akhir'],
                            'pelaksanaan'          => $sess['pelaksanaan'],
                            'lokasi_konsultasi_id' => $lokasiId,
                            'kuota_konsultasi'     => $sess['kuota_konsultasi'],
                        ]);

                        $this->syncChildSchedules($jadwalKonsultasi, $childSchedules);
                        $totalCreated++;
                    }
                }
            });
        } catch (Throwable $e) {
            Log::error('Gagal menambahkan jadwal konsultasi.', [
                'payload' => $request->all(),
                'error'   => $e->getMessage(),
            ]);

            return back()
                ->withErrors(['tanggal_mulai' => 'Gagal menyimpan jadwal konsultasi. Silakan coba lagi.'])
                ->withInput();
        }

        $message = $totalCreated > 0
            ? "{$totalCreated} jadwal konsultasi berhasil ditambahkan."
            : 'Jadwal konsultasi berhasil diproses (tidak ada jadwal baru yang perlu dibuat).';

        return redirect()
            ->route('master.jadwal-konsultasi.index')
            ->with('success', $message);
    }

    public function edit(JadwalKonsultasi $jadwalKonsultasi): Response
    {
        try {
            $childSchedules = $jadwalKonsultasi->child_schedules()
                ->orderBy('waktu')
                ->get(['id', 'schedule_id', 'waktu', 'kuota_konsultasi']);

            $locations = LokasiKonsultasi::query()
                ->orderBy('nama_lokasi')
                ->get(['id', 'nama_lokasi']);
        } catch (Throwable $e) {
            Log::error('Gagal memuat data untuk form edit jadwal konsultasi.', [
                'jadwal_konsultasi_id' => $jadwalKonsultasi->id,
                'error'                => $e->getMessage(),
            ]);

            $childSchedules = collect();
            $locations      = collect();
        }

        return Inertia::render('backend/master/jadwal-konsultasi/edit', [
            'schedule'       => $jadwalKonsultasi,
            'childSchedules' => $childSchedules,
            'locations'      => $locations,
        ]);
    }

    public function update(Request $request, JadwalKonsultasi $jadwalKonsultasi): RedirectResponse
    {
        $validated = $this->validateSchedule($request);

        if ($error = $this->validateLokasi($validated)) {
            return $error;
        }

        $childSchedules = $validated['jadwal'] ?? [];
        unset($validated['jadwal']);

        if ($validated['pelaksanaan'] === 'Daring') {
            $validated['lokasi_konsultasi_id'] = null;
        }

        try {
            DB::transaction(function () use ($jadwalKonsultasi, $validated, $childSchedules) {
                $jadwalKonsultasi->update($validated);

                $this->syncChildSchedules($jadwalKonsultasi, $childSchedules);
            });
        } catch (Throwable $e) {
            Log::error('Gagal memperbarui jadwal konsultasi.', [
                'jadwal_konsultasi_id' => $jadwalKonsultasi->id,
                'payload'              => $validated,
                'error'                => $e->getMessage(),
            ]);

            return back()
                ->withErrors(['tanggal' => 'Gagal memperbarui jadwal konsultasi. Silakan coba lagi.'])
                ->withInput();
        }

        return redirect()
            ->route('master.jadwal-konsultasi.index')
            ->with('success', 'Jadwal konsultasi berhasil diperbarui.');
    }

    public function destroy(JadwalKonsultasi $jadwalKonsultasi): RedirectResponse
    {
        try {
            DB::transaction(function () use ($jadwalKonsultasi) {
                $jadwalKonsultasi->child_schedules()->delete();
                $jadwalKonsultasi->delete();
            });
        } catch (Throwable $e) {
            Log::error('Gagal menghapus jadwal konsultasi.', [
                'jadwal_konsultasi_id' => $jadwalKonsultasi->id,
                'error'                => $e->getMessage(),
            ]);

            return redirect()
                ->route('master.jadwal-konsultasi.index')
                ->with('error', 'Gagal menghapus jadwal konsultasi. Silakan coba lagi.');
        }

        return redirect()
            ->route('master.jadwal-konsultasi.index')
            ->with('success', 'Jadwal konsultasi berhasil dihapus.');
    }

    private function validateSchedule(Request $request): array
    {
        return $request->validate([
            'tanggal'                   => ['required', 'date'],
            'waktu_awal'                => ['required', 'date_format:H:i'],
            'waktu_akhir'               => ['required', 'date_format:H:i', 'after:waktu_awal'],
            'pelaksanaan'               => ['required', 'in:Luring,Daring,Hybrid'],
            'lokasi_konsultasi_id'      => ['nullable', 'exists:lokasi_konsultasis,id'],
            'kuota_konsultasi'          => ['required', 'integer', 'min:1'],
            'jadwal'                    => ['nullable', 'array'],
            'jadwal.*.waktu'            => ['required_with:jadwal', 'string'],
            'jadwal.*.kuota_konsultasi' => ['required_with:jadwal', 'integer', 'min:1'],
        ]);
    }

    private function validateLokasi(array $validated): ?RedirectResponse
    {
        if (in_array($validated['pelaksanaan'], ['Luring', 'Hybrid'], true) && empty($validated['lokasi_konsultasi_id'])) {
            return back()
                ->withErrors(['lokasi_konsultasi_id' => 'Lokasi wajib dipilih untuk pelaksanaan luring atau hybrid.'])
                ->withInput();
        }

        return null;
    }

    private function syncChildSchedules(JadwalKonsultasi $jadwalKonsultasi, array $childSchedules): void
    {
        $jadwalKonsultasi->child_schedules()->delete();

        if (empty($childSchedules)) {
            return;
        }

        $jadwalKonsultasi->child_schedules()->createMany(
            collect($childSchedules)
                ->map(fn($slot) => [
                    'waktu'            => $slot['waktu'],
                    'kuota_konsultasi' => $slot['kuota_konsultasi'],
                ])
                ->all()
        );
    }
}
