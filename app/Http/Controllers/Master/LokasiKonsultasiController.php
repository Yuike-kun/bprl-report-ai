<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\LokasiKonsultasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LokasiKonsultasiController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $locations = LokasiKonsultasi::query()
            ->when($search !== '', fn ($query) => $query->where('nama_lokasi', 'like', '%' . $search . '%'))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('backend/master/lokasi-konsultasi/index', [
            'locations' => $locations,
            'filters' => [
                'search' => $search,
            ],
            'success' => session('success'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('backend/master/lokasi-konsultasi/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lokasi' => ['required', 'string', 'max:255', 'unique:lokasi_konsultasis,nama_lokasi'],
        ]);

        LokasiKonsultasi::create($validated);

        return redirect()
            ->route('master.lokasi-konsultasi.index')
            ->with('success', 'Lokasi konsultasi berhasil ditambahkan.');
    }

    public function edit(LokasiKonsultasi $lokasiKonsultasi): Response
    {
        return Inertia::render('backend/master/lokasi-konsultasi/edit', [
            'location' => $lokasiKonsultasi,
        ]);
    }

    public function update(Request $request, LokasiKonsultasi $lokasiKonsultasi): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lokasi' => [
                'required',
                'string',
                'max:255',
                Rule::unique('lokasi_konsultasis', 'nama_lokasi')->ignore($lokasiKonsultasi->id),
            ],
        ]);

        $lokasiKonsultasi->update($validated);

        return redirect()
            ->route('master.lokasi-konsultasi.index')
            ->with('success', 'Lokasi konsultasi berhasil diperbarui.');
    }

    public function destroy(LokasiKonsultasi $lokasiKonsultasi): RedirectResponse
    {
        $lokasiKonsultasi->delete();

        return redirect()
            ->route('master.lokasi-konsultasi.index')
            ->with('success', 'Lokasi konsultasi berhasil dihapus.');
    }
}
