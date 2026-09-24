<?php

namespace App\Http\Controllers;

use App\Models\PermohonanKonsultasi;
use App\Support\Phone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class PublicUploadSignatureController extends Controller
{
    public function index(Request $request): Response
    {
        $email = trim((string) $request->query('email', ''));
        $nohp = trim((string) $request->query('nomor_telepon', ''));

        $lookupError = null;
        $submissions = collect();

        if ($email !== '' || $nohp !== '') {
            if ($email === '' || $nohp === '') {
                $lookupError = 'Email dan No. HP harus diisi keduanya.';
            } else {
                // Email is matched in SQL (case-insensitive collation); the phone
                // number is free-form text, so it is compared in PHP below.
                $submissions = PermohonanKonsultasi::query()
                    ->with(['jadwal.lokasi'])
                    ->where('email', $email)
                    ->get()
                    ->filter(fn (PermohonanKonsultasi $p) => Phone::matches($p->nomor_telepon, $nohp))
                    ->values()
                    // The staff signature is not the applicant's data.
                    ->makeHidden(['staff_tanda_tangan']);
            }
        }

        return Inertia::render('public/signature-upload', [
            'submissions' => $submissions,
            'queryParams' => [
                'email' => $email,
                'nomor_telepon' => $nohp,
            ],
            'lookupError' => $lookupError,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'id' => ['required', 'integer', 'exists:permohonan_konsultasis,id'],
            'email' => ['required', 'email', 'max:255'],
            'nomor_telepon' => ['required', 'string', 'max:30'],
            'tanda_tangan' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors(
                $this->scopeErrors($request->input('id'), $validator->errors()->messages())
            );
        }

        $data = $validator->validated();

        // The id only selects which card to update; access still requires the
        // full email + phone pair to match that same permohonan.
        $permohonan = PermohonanKonsultasi::query()
            ->where('id', $data['id'])
            ->where('email', $data['email'])
            ->first();

        if (! $permohonan || ! Phone::matches($permohonan->nomor_telepon, $data['nomor_telepon'])) {
            return redirect()->back()->withErrors([
                "cards.{$data['id']}.nomor_telepon" => 'Email atau No. HP tidak sesuai dengan data permohonan.',
            ]);
        }

        $permohonan->update([
            'tanda_tangan' => $data['tanda_tangan'],
        ]);

        return redirect()
            ->route('signature-upload', [
                'email' => $data['email'],
                'nomor_telepon' => $data['nomor_telepon'],
            ])
            ->with('success', "Tanda tangan untuk permohonan #{$permohonan->id} berhasil disimpan/diperbarui.");
    }

    /**
     * One page can render a signature form per matching permohonan, so errors
     * are keyed as `cards.{id}.{field}` for the card they belong to.
     *
     * @param  array<string, array<int, string>>  $messages
     * @return array<string, array<int, string>>
     */
    private function scopeErrors(mixed $id, array $messages): array
    {
        $scope = is_numeric($id) ? $id : 'unknown';

        $scoped = [];
        foreach ($messages as $field => $fieldMessages) {
            $scoped["cards.{$scope}.{$field}"] = $fieldMessages;
        }

        return $scoped;
    }
}
