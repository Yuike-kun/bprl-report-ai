<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\LokasiKonsultasi;
use App\Models\JadwalKonsultasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JadwalKonsultasiController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $schedules = JadwalKonsultasi::query()
            ->with('lokasi:id,nama_lokasi')
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

        return Inertia::render('backend/master/jadwal-konsultasi/index', [
            'schedules' => $schedules,
            'filters' => [
                'search' => $search,
            ],
            'success' => session('success'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('backend/master/jadwal-konsultasi/create', [
            'locations' => LokasiKonsultasi::query()
                ->orderBy('nama_lokasi')
                ->get(['id', 'nama_lokasi']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'waktu_awal' => ['required', 'date_format:H:i'],
            'waktu_akhir' => ['required', 'date_format:H:i', 'after:waktu_awal'],
            'pelaksanaan' => ['required', 'in:Luring,Daring,Hybrid'],
            'lokasi_konsultasi_id' => ['nullable', 'exists:lokasi_konsultasis,id'],
            'kuota_konsultasi' => ['required', 'integer', 'min:1'],
        ]);

        if (in_array($validated['pelaksanaan'], ['Luring', 'Hybrid'], true) && empty($validated['lokasi_konsultasi_id'])) {
            return back()
                ->withErrors(['lokasi_konsultasi_id' => 'Lokasi wajib dipilih untuk pelaksanaan luring atau hybrid.'])
                ->withInput();
        }

        if ($validated['pelaksanaan'] === 'Daring') {
            $validated['lokasi_konsultasi_id'] = null;
        }

        if(JadwalKonsultasi::query()
            ->whereDate('tanggal', $validated['tanggal'])
            ->where('waktu_awal', $validated['waktu_awal'])
            ->where('pelaksanaan', $validated['pelaksanaan'])
            ->where(function ($query) use ($validated) {
                if (empty($validated['lokasi_konsultasi_id'])) {
                    $query->whereNull('lokasi_konsultasi_id');
                    return;
                }
                $query->where('lokasi_konsultasi_id', $validated['lokasi_konsultasi_id']);
            })
            ->exists()
        ) {
            return back()
                ->withErrors(['waktu_awal' => 'Jadwal konsultasi dengan waktu dan lokasi yang sama sudah ada.'])
                ->withInput();
        }

        JadwalKonsultasi::create($validated);

        return redirect()
            ->route('master.jadwal-konsultasi.index')
            ->with('success', 'Jadwal konsultasi berhasil ditambahkan.');
    }

    public function edit(JadwalKonsultasi $jadwalKonsultasi): Response
    {
        return Inertia::render('backend/master/jadwal-konsultasi/edit', [
            'schedule' => $jadwalKonsultasi,
            'locations' => LokasiKonsultasi::query()
                ->orderBy('nama_lokasi')
                ->get(['id', 'nama_lokasi']),
        ]);
    }

    public function update(Request $request, JadwalKonsultasi $jadwalKonsultasi): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'waktu_awal' => ['required', 'date_format:H:i'],
            'waktu_akhir' => ['required', 'date_format:H:i', 'after:waktu_awal'],
            'pelaksanaan' => ['required', 'in:Luring,Daring,Hybrid'],
            'lokasi_konsultasi_id' => ['nullable', 'exists:lokasi_konsultasis,id'],
            'kuota_konsultasi' => ['required', 'integer', 'min:1'],
        ]);

        if (in_array($validated['pelaksanaan'], ['Luring', 'Hybrid'], true) && empty($validated['lokasi_konsultasi_id'])) {
            return back()
                ->withErrors(['lokasi_konsultasi_id' => 'Lokasi wajib dipilih untuk pelaksanaan luring atau hybrid.'])
                ->withInput();
        }

        if ($validated['pelaksanaan'] === 'Daring') {
            $validated['lokasi_konsultasi_id'] = null;
        }

        $jadwalKonsultasi->update($validated);

        return redirect()
            ->route('master.jadwal-konsultasi.index')
            ->with('success', 'Jadwal konsultasi berhasil diperbarui.');
    }

    public function destroy(JadwalKonsultasi $jadwalKonsultasi): RedirectResponse
    {
        $jadwalKonsultasi->delete();

        return redirect()
            ->route('master.jadwal-konsultasi.index')
            ->with('success', 'Jadwal konsultasi berhasil dihapus.');
    }
}
