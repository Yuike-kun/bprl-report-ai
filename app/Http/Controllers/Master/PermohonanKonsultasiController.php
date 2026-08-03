<?php
namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\LokasiKonsultasi;
use App\Models\PermohonanKonsultasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermohonanKonsultasiController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $submissions = PermohonanKonsultasi::query()
            ->with('jadwal')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('nama_pemohon', 'like', '%' . $search . '%')
                        ->orWhere('instansi', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%')
                        ->orWhere('status', 'like', '%' . $search . '%');
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('backend/master/permohonan-konsultasi/index', [
            'submissions' => $submissions,
            'filters'     => [
                'search' => $search,
            ],
            'success'     => session('success'),
        ]);
    }

    public function show(PermohonanKonsultasi $permohonanKonsultasi): Response
    {
        $permohonanKonsultasi->load('jadwal.lokasi');

        return Inertia::render('backend/master/permohonan-konsultasi/show', [
            'submission' => $permohonanKonsultasi,
        ]);
    }

    public function edit(PermohonanKonsultasi $permohonanKonsultasi): Response
    {
        $permohonanKonsultasi->load('jadwal.lokasi');

        return Inertia::render('backend/master/permohonan-konsultasi/edit', [
            'submission' => $permohonanKonsultasi,
            'locations'  => LokasiKonsultasi::query()
                ->orderBy('nama_lokasi')
                ->get(['id', 'nama_lokasi']),
        ]);
    }

    public function update(Request $request, PermohonanKonsultasi $permohonanKonsultasi): RedirectResponse
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
            'setuju_syarat_ketentuan' => ['required', 'boolean'],
            'status'                  => ['required', 'in:draft,dikirim,selesai'],
        ]);

        if (in_array($validated['pelaksanaan'], ['Luring', 'Hybrid'], true) && empty($validated['lokasi_konsultasi_id'])) {
            return back()
                ->withErrors(['lokasi_konsultasi_id' => 'Lokasi konsultasi wajib dipilih untuk pelaksanaan luring atau hybrid.'])
                ->withInput();
        }

        if ($validated['pelaksanaan'] === 'Daring') {
            $validated['lokasi_konsultasi_id'] = null;
        }

        $permohonanKonsultasi->update($validated);

        return redirect()
            ->route('master.permohonan-konsultasi.index')
            ->with('success', 'Permohonan konsultasi berhasil diperbarui.');
    }

    public function destroy(PermohonanKonsultasi $permohonanKonsultasi): RedirectResponse
    {
        $permohonanKonsultasi->delete();

        return redirect()
            ->route('master.permohonan-konsultasi.index')
            ->with('success', 'Permohonan konsultasi berhasil dihapus.');
    }
}
