<?php
namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Mail\KonsultasiDikonfirmasiMail;
use App\Models\AssignRequestToStaff;
use App\Models\LokasiKonsultasi;
use App\Models\PermohonanKonsultasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class PermohonanKonsultasiController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $submissions = PermohonanKonsultasi::query()
            ->with(['jadwal.lokasi', 'kabupaten', 'provinsi'])
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
        $permohonanKonsultasi->load(['jadwal.lokasi', 'kabupaten', 'provinsi']);

        return Inertia::render('backend/master/permohonan-konsultasi/show', [
            'submission' => $permohonanKonsultasi,
            'flash'      => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }

    public function edit(PermohonanKonsultasi $permohonanKonsultasi): Response
    {
        $permohonanKonsultasi->load(['jadwal.lokasi', 'kabupaten', 'provinsi']);

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
            'status'                  => ['required'],
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

    public function assign_request(Request $request, PermohonanKonsultasi $permohonanKonsultasi): RedirectResponse
    {
        $validated = $request->validate([
            'staff'     => ['required', 'array', 'min:1', 'max:3'],
            'staff.*'   => ['integer', 'exists:staff,id'],
            'requester' => ['nullable'],
        ]);

        foreach ($validated['staff'] as $staff) {
            AssignRequestToStaff::updateOrCreate([
                'request_form_id' => $permohonanKonsultasi->id,
                'staff'           => $staff,
            ], [
                'requester'       => $validated['requester'] ?? null,
            ]);
        }

        $permohonanKonsultasi->update([
            'status' => 'konsultasi',
        ]);

        return redirect()
            ->route('master.permohonan-konsultasi.index')
            ->with('success', 'Permohonan konsultasi berhasil ditugaskan.');
    }

    public function confirm(Request $request, PermohonanKonsultasi $permohonanKonsultasi): RedirectResponse
    {
        $request->validate([
            'confirmed' => ['required', 'boolean'],
        ]);

        $confirmed = (bool) $request->confirmed;

        $permohonanKonsultasi->update([
            'status' => $confirmed ? 'confirmed' : 'not_confirmed',
        ]);

        $permohonanKonsultasi->load(['jadwal.lokasi']);

        Mail::to($permohonanKonsultasi->email)
            ->send(new KonsultasiDikonfirmasiMail($permohonanKonsultasi, $confirmed));

        $message = $confirmed
            ? 'Permohonan dikonfirmasi dan email telah dikirim ke pemohon.'
            : 'Permohonan ditolak dan email telah dikirim ke pemohon.';

        return redirect()
            ->route('master.permohonan-konsultasi.show', $permohonanKonsultasi)
            ->with('success', $message);
    }
}
