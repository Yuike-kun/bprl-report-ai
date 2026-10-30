<?php

namespace App\Http\Controllers;

use App\Models\BeritaAcaraDocument;
use App\Models\BeritaAcaraKonsultasi;
use App\Models\PermohonanKonsultasi;
use App\Support\Phone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * One page can render a signature form per matching permohonan, so errors
 * are keyed as `cards.{id}.{field}` for the card they belong to.
 *
 * @param  array<string, array<int, string>>  $messages
 * @return array<string, array<int, string>>
 */
class PublicUploadSignatureController extends Controller
{
    public function index(Request $request): Response
    {
        $nomorPermohonan = trim((string) $request->query('nomor_permohonan', ''));
        $email = trim((string) $request->query('email', ''));
        $nohp = trim((string) $request->query('nomor_telepon', ''));

        $lookupError = null;
        $submissions = collect();

        if ($nomorPermohonan !== '') {
            $submissions = PermohonanKonsultasi::query()
                ->with(['jadwal.lokasi'])
                ->where('nomor_permohonan', $nomorPermohonan)
                ->get();

            if ($submissions->isEmpty()) {
                $lookupError = 'Nomor permohonan tidak ditemukan.';
            }
        } elseif ($email !== '' || $nohp !== '') {
            if ($email === '' || $nohp === '') {
                $lookupError = 'Email dan No. HP harus diisi keduanya jika tidak menggunakan Nomor Permohonan.';
            } else {
                $submissions = PermohonanKonsultasi::query()
                    ->with(['jadwal.lokasi'])
                    ->where('email', $email)
                    ->get()
                    ->filter(fn (PermohonanKonsultasi $p) => Phone::matches($p->nomor_telepon, $nohp))
                    ->values();
            }
        }

        return Inertia::render('public/signature-upload', [
            'submissions' => $submissions,
            'queryParams' => [
                'nomor_permohonan' => $nomorPermohonan,
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
            'nomor_permohonan' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'nomor_telepon' => ['nullable', 'string', 'max:30'],
            'tanda_tangan' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors(
                $this->scopeErrors($request->input('id'), $validator->errors()->messages())
            );
        }

        $data = $validator->validated();

        $query = PermohonanKonsultasi::query()->where('id', $data['id']);

        if (! empty($data['nomor_permohonan'])) {
            $query->where('nomor_permohonan', $data['nomor_permohonan']);
            $permohonan = $query->first();

            if (! $permohonan) {
                return redirect()->back()->withErrors([
                    "cards.{$data['id']}.nomor_permohonan" => 'Nomor permohonan tidak sesuai.',
                ]);
            }
        } else {
            if (empty($data['email']) || empty($data['nomor_telepon'])) {
                return redirect()->back()->withErrors([
                    "cards.{$data['id']}.email" => 'Email dan Nomor Telepon diperlukan jika tanpa Nomor Permohonan.',
                ]);
            }

            $query->where('email', $data['email']);
            $permohonan = $query->first();

            if (! $permohonan || ! Phone::matches($permohonan->nomor_telepon, $data['nomor_telepon'])) {
                return redirect()->back()->withErrors([
                    "cards.{$data['id']}.nomor_telepon" => 'Email atau No. HP tidak sesuai dengan data permohonan.',
                ]);
            }
        }

        // Find the BA for this permohonan
        $beritaAcara = BeritaAcaraKonsultasi::where('request_form_id', $permohonan->id)->first();

        if (! $beritaAcara) {
            return redirect()->back()->withErrors([
                'general' => 'Berita Acara belum dibuat oleh petugas. Silakan hubungi petugas pendamping.',
            ]);
        }

        // Process the uploaded signature string (base64) and store it as a document
        $dir = "request-forms/{$beritaAcara->id}/tanda_tangan_perwakilan";

        // Delete existing documents of this type for this BA
        BeritaAcaraDocument::where('berita_acara_konsultasi_id', $beritaAcara->id)
            ->where('document_type', 'tanda_tangan_perwakilan')
            ->get()
            ->each(function ($doc) {
                Storage::disk('public')->delete($doc->file_path);
                $doc->delete();
            });

        // Handle the base64 string
        $imageData = $data['tanda_tangan'];
        $mime = 'image/png';
        if (Str::startsWith($imageData, 'data:image/')) {
            // Extract mime type and base64 data
            $parts = explode(';', $imageData);
            $mimePart = $parts[0]; // e.g., 'data:image/png'
            $mime = explode('/', $mimePart)[1]; // e.g., 'png'
            $base64 = explode(',', $imageData)[1];
        } else {
            $base64 = $imageData;
        }

        $image = base64_decode($base64);
        if ($image === false) {
            return redirect()->back()->withErrors([
                'tanda_tangan' => 'Data tanda tangan tidak valid.',
            ]);
        }

        $extension = $mime;
        $filename = uniqid().'.'.$extension;
        $path = "{$dir}/{$filename}";

        // Store the file
        Storage::disk('public')->put($path, $image);

        // Create the document record
        BeritaAcaraDocument::create([
            'berita_acara_konsultasi_id' => $beritaAcara->id,
            'document_type' => 'tanda_tangan_perwakilan',
            'file_name' => $filename,
            'file_path' => $path,
            'mime_type' => $mime,
            'file_size' => strlen($image),
        ]);

        // Switch the BA to asistensi stage after the pemohon uploads their
        // tanda_tangan so the generated PDF renders the full BA body (narrative
        // sections) instead of only the consultation-note section.
        $beritaAcara->update(['consultation_stage' => 'asistensi']);

        // Also update the permohonan's tanda_tangan field so the signature
        // upload page shows the newly uploaded signature immediately.
        $permohonan->update(['tanda_tangan' => $imageData]);

        $redirectParams = [];
        if (! empty($data['nomor_permohonan'])) {
            $redirectParams['nomor_permohonan'] = $data['nomor_permohonan'];
        } elseif (! empty($data['email']) && ! empty($data['nomor_telepon'])) {
            $redirectParams['email'] = $data['email'];
            $redirectParams['nomor_telepon'] = $data['nomor_telepon'];
        }

        return redirect()
            ->route('signature-upload', $redirectParams)
            ->with('success', "Tanda tangan untuk permohonan " . ($permohonan->nomor_permohonan ? "#{$permohonan->nomor_permohonan}" : "#{$permohonan->id}") . " berhasil disimpan/diperbarui.");
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
