<?php

namespace App\Http\Controllers;

use App\Models\BeritaAcaraKonsultasi;
use App\Models\PermohonanKonsultasi;
use App\Support\BeritaAcaraPdfRenderer;
use App\Support\Phone;
use App\Support\TextCase;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class PublicBeritaAcaraCheckController extends Controller
{
    public function index(Request $request): Response
    {
        $email = trim((string) $request->query('email', ''));
        $nohp = trim((string) $request->query('nomor_telepon', ''));

        $lookupError = null;
        $results = collect();

        if ($email !== '' || $nohp !== '') {
            if ($email === '' || $nohp === '') {
                $lookupError = 'Email dan No. HP harus diisi keduanya.';
            } else {
                // Email is matched in SQL (case-insensitive collation); the
                // phone number is free-form text, so it is compared in PHP.
                $results = PermohonanKonsultasi::query()
                    ->with('beritaAcara')
                    ->where('email', $email)
                    ->get()
                    ->filter(fn (PermohonanKonsultasi $p) => Phone::matches($p->nomor_telepon, $nohp))
                    ->map(fn (PermohonanKonsultasi $p) => $this->present($p, $email, $nohp))
                    ->values();
            }
        }

        return Inertia::render('public/cek-berita-acara', [
            'results' => $results,
            'queryParams' => [
                'email' => $email,
                'nomor_telepon' => $nohp,
            ],
            'lookupError' => $lookupError,
        ]);
    }

    public function pdf(Request $request, BeritaAcaraKonsultasi $beritaAcara): SymfonyResponse
    {
        $email = trim((string) $request->query('email', ''));
        $nohp = trim((string) $request->query('nomor_telepon', ''));

        // Credentials are checked before status so probing ids never reveals
        // which letters are final.
        abort_unless($email !== '' && $nohp !== '', 403);

        $permohonan = PermohonanKonsultasi::query()
            ->where('id', $beritaAcara->request_form_id)
            ->where('email', $email)
            ->first();

        abort_unless($permohonan && Phone::matches($permohonan->nomor_telepon, $nohp), 403);

        abort_unless($beritaAcara->status === 'approved', 404);

        return BeritaAcaraPdfRenderer::render($beritaAcara);
    }

    /**
     * A non-final letter reports status only; its content stays internal.
     *
     * @return array<string, mixed>
     */
    private function present(PermohonanKonsultasi $permohonan, string $email, string $nohp): array
    {
        $beritaAcara = $permohonan->beritaAcara;
        $isFinal = $beritaAcara?->status === 'approved';

        return [
            'id' => $permohonan->id,
            'nama_pemohon' => $permohonan->nama_pemohon,
            'instansi' => $permohonan->instansi,
            'berita_acara' => $beritaAcara === null ? null : [
                'id' => $beritaAcara->id,
                'status' => $beritaAcara->status,
                'is_final' => $isFinal,
                ...($isFinal ? [
                    'berita_acara_number' => $beritaAcara->berita_acara_number,
                    'consultation_date' => $beritaAcara->consultation_date->toDateString(),
                    'implementation_mode' => $beritaAcara->implementation_mode,
                    'location' => TextCase::humanize($beritaAcara->location),
                    'location_other' => TextCase::humanize($beritaAcara->location_other),
                    'water_name' => TextCase::humanize($beritaAcara->water_name),
                    'requester_name' => $beritaAcara->requester_name,
                    'requester_position' => $beritaAcara->requester_position,
                    'legal_entity_name' => $beritaAcara->legal_entity_name,
                    'permit_type' => $beritaAcara->permit_type,
                    'activity_type' => $beritaAcara->activity_type,
                    'consultation_result' => $beritaAcara->consultation_result,
                    'pdf_url' => route('cek-berita-acara.pdf', [
                        'beritaAcara' => $beritaAcara->id,
                        'email' => $email,
                        'nomor_telepon' => $nohp,
                    ]),
                ] : []),
            ],
        ];
    }
}
