<?php

namespace App\Http\Controllers\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\PermohonanKonsultasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SignatureKonsultasiController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $user = $request->user();

        $konsultasi = PermohonanKonsultasi::query()
            ->with(['jadwal', 'beritaAcara'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner
                        ->where('nama_pemohon', 'like', '%'.$search.'%')
                        ->orWhere('instansi', 'like', '%'.$search.'%')
                        ->orWhere('status', 'like', '%'.$search.'%');
                });
            })
            ->whereHas('assign_to_staff', function ($query) use ($user) {
                $query->where('staff', $user->staff->id);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('backend/pegawai/signature-pad-konsul', [
            'konsultasi' => $konsultasi,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function signature(Request $request, PermohonanKonsultasi $permohonanKonsultasi): RedirectResponse
    {
        $validated = $request->validate([
            'staff_tanda_tangan' => ['required', 'string'],
        ]);

        $permohonanKonsultasi->update($validated);

        return redirect()
            ->route('pegawai.signature-konsultasi.index')
            ->with('success', 'Tanda tangan berhasil disimpan.');
    }
}