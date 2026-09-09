<?php

namespace App\Http\Controllers;

use App\Models\PermohonanKonsultasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicUploadSignatureController extends Controller
{
    public function index(Request $request): Response
    {
        $id = $request->query('id');
        $email = trim((string) $request->query('email', ''));
        $submission = null;

        if ($id || $email !== '') {
            $query = PermohonanKonsultasi::query()->with(['jadwal.lokasi']);

            if ($id) {
                $query->where('id', $id);
            }

            if ($email !== '') {
                $query->where('email', $email);
            }

            $submission = $query->first();
        }

        return Inertia::render('public/signature-upload', [
            'submission' => $submission,
            'queryParams' => [
                'id' => $id,
                'email' => $email,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'id' => ['required', 'exists:permohonan_konsultasis,id'],
            'email' => ['required', 'email'],
            'tanda_tangan' => ['required', 'string'],
        ]);

        $permohonan = PermohonanKonsultasi::where('id', $request->id)
            ->where('email', trim($request->email))
            ->first();

        if (!$permohonan) {
            return redirect()
                ->back()
                ->withErrors(['email' => 'Permohonan tidak ditemukan dengan ID dan email tersebut.']);
        }

        $permohonan->update([
            'tanda_tangan' => $request->tanda_tangan,
        ]);

        return redirect()
            ->route('signature-upload', ['id' => $permohonan->id, 'email' => $permohonan->email])
            ->with('success', 'Tanda tangan Anda berhasil disimpan/diperbarui.');
    }
}
