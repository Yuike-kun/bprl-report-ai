<?php

namespace App\Services\Egerai;

use App\Support\TextCase;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Thin HTTP client for the standalone e-GerAI Python API (see OpenAPI at
 * {base_url}/openapi.json — same service that powers the /asisten chat).
 * Two independent feature groups use it:
 *  - dokumen/*: the experimental "generate via external API" action on the
 *    /egerai review page, alongside (not replacing) the native
 *    ProposalDocumentGenerator/EgeraiExtractionService pipeline.
 *  - analisis/*: AnalisisProposalController's "Analisis & Koreksi Proposal"
 *    feature — this client is the only place that data ever touches; the
 *    markdown result and saved history both live on the external API, not
 *    in this app's own database.
 *
 * Important limitation: /api/v1/dokumen/generate only accepts corrections
 * ("koreksi") for the specific field set the Python app's review_fields.py
 * exposes (~35 fields) — see KOREKSI_FIELD_GROUPS below, which mirrors that
 * list exactly. Any locally-edited field outside this list is NOT sent, so
 * the external document may differ from what the local review form shows
 * for those fields (it falls back to the external API's own fresh
 * extraction for anything not in this whitelist).
 */
class EgeraiApiClient
{
    /**
     * Mirrors review_fields.py's FIELD_GROUPS exactly (source, key) pairs —
     * the only fields the external API's "koreksi" will actually apply.
     *
     * @var array<int, array{0: string, 1: string}>
     */
    private const KOREKSI_FIELDS = [
        ['prop', 'Nama Pemohon'],
        ['prop', 'Jabatan Pemohon'],
        ['prop', 'Nama Perusahaan/Instansi'],
        ['prop', 'NIB'],
        ['prop', 'NPWP'],
        ['prop', 'Nomor Telepon Selular'],
        ['prop', 'Surat Elektronik'],
        ['prop', 'Jenis Kegiatan'],
        ['prop', 'Nama Perairan'],
        ['prop', 'Luas Kebutuhan Ruang'],
        ['prop', 'KBLI'],
        ['prop', 'Tanggal Penyusunan'],
        ['prop_loc', '3'],
        ['prop_loc', '2'],
        ['prop_loc', '1'],
        ['prop_loc', '0'],
        ['prop', 'investasi'],
        ['prop', 'tenaga_kerja'],
        ['prop', 'tenaga_kerja_asing'],
        ['lap', 'eko_total_ha'],
        ['lap', 'eko_karang_ha'],
        ['lap', 'eko_karang_pct'],
        ['lap', 'eko_lainnya_ha'],
        ['lap', 'eko_lainnya_pct'],
        ['lap', 'eko_terbuka_ha'],
        ['lap', 'eko_terbuka_pct'],
        ['lap', 'eko_jarak_terdekat_km'],
        ['lap', 'batimetri_titik_pusat'],
        ['lap', 'batimetri_panjang_lintasan'],
        ['lap', 'batimetri_terdalam'],
        ['lap', 'hs_rata'],
        ['lap', 'hs_maks'],
        ['lap', 'hs_arah'],
        ['lap', 'arus_rata'],
        ['lap', 'arus_maks'],
        ['lap', 'arus_arah'],
        ['lap', 'hat'],
        ['lap', 'msl'],
        ['lap', 'lat'],
        ['lap', 'tidal_range'],
        ['lap', 'formzahl'],
        ['lap', 'tipe_pasut'],
        ['prop', 'desa_luas_ha'],
        ['prop', 'desa_penduduk'],
    ];

    private string $baseUrl;

    private ?string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.egerai_api.url'), '/');
        $this->apiKey = config('services.egerai_api.key') ?: null;
    }

    /**
     * POST /api/v1/dokumen/ekstrak — uploads both source files and returns
     * ['job_id' => string, 'prop_data' => array, 'lap_data' => array,
     * 'expires_in_seconds' => int]. Both files are required by this
     * endpoint (unlike the local flow, where "laporan" is optional).
     */
    public function extract(string $proposalPath, string $laporanPath): array
    {
        $response = $this->http()
            ->attach('proposal', file_get_contents($proposalPath), basename($proposalPath))
            ->attach('laporan', file_get_contents($laporanPath), basename($laporanPath))
            ->post("{$this->baseUrl}/api/v1/dokumen/ekstrak");

        $body = $response->json();

        if (! $response->successful() || ! ($body['success'] ?? false)) {
            throw new RuntimeException(
                'Ekstraksi API eksternal gagal: '.($body['error']['message'] ?? $response->status())
            );
        }

        return $body['data'];
    }

    /**
     * POST /api/v1/dokumen/generate — consumes the job (the external API
     * deletes it server-side once this succeeds), returns the raw .docx
     * bytes. $prop/$lap are this app's own prop_fields/lap_fields arrays;
     * they're translated into the "source__key" => value koreksi map the
     * external API expects, restricted to KOREKSI_FIELDS (see class docblock).
     */
    public function generate(string $jobId, array $prop, array $lap): string
    {
        $koreksi = $this->buildKoreksi($prop, $lap);

        $response = $this->http()
            ->post("{$this->baseUrl}/api/v1/dokumen/generate", [
                'job_id' => $jobId,
                'koreksi' => $koreksi,
            ]);

        if (! $response->successful()) {
            $body = $response->json();

            throw new RuntimeException(
                'Generate dokumen API eksternal gagal: '.($body['error']['message'] ?? $response->status())
            );
        }

        return $response->body();
    }

    /** DELETE /api/v1/dokumen/job/{job_id} — best-effort cleanup, never throws. */
    public function deleteJob(string $jobId): void
    {
        try {
            $this->http()->delete("{$this->baseUrl}/api/v1/dokumen/job/{$jobId}");
        } catch (\Throwable) {
            // Housekeeping only; the job auto-expires after ~2 hours regardless.
        }
    }

    /**
     * POST /api/v1/analisis/proposal — uploads 1..10 proposal files and
     * 0..10 comparison "laporan" files, returns
     * ['hasil_markdown' => string, 'nama_proposal' => string, 'nama_laporan' => string].
     * Nothing is persisted server-side by this call; the markdown only
     * becomes permanent once it's sent to analisisSimpan().
     *
     * @param  array<int, string>  $proposalPaths
     * @param  array<int, string>  $laporanPaths
     * @return array{hasil_markdown: string, nama_proposal: string, nama_laporan: string}
     */
    public function analisisProposal(array $proposalPaths, array $laporanPaths): array
    {
        $request = $this->http();
        foreach ($proposalPaths as $path) {
            $request = $request->attach('proposal', file_get_contents($path), basename($path));
        }
        foreach ($laporanPaths as $path) {
            $request = $request->attach('laporan', file_get_contents($path), basename($path));
        }

        $response = $request->post("{$this->baseUrl}/api/v1/analisis/proposal");
        $body = $response->json();

        if (! $response->successful() || ! ($body['success'] ?? false)) {
            throw new RuntimeException(
                'Analisis proposal gagal: '.($body['error']['message'] ?? $response->status())
            );
        }

        return $body['data'];
    }

    /** POST /api/v1/analisis/unduh — turns a markdown analysis result into a .docx, returns the raw bytes. */
    public function analisisUnduh(string $hasilMarkdown, string $namaProposal = '', string $namaLaporan = ''): string
    {
        $response = $this->http()->post("{$this->baseUrl}/api/v1/analisis/unduh", [
            'hasil_markdown' => $hasilMarkdown,
            'nama_proposal' => $namaProposal,
            'nama_laporan' => $namaLaporan,
        ]);

        if (! $response->successful()) {
            $body = $response->json();

            throw new RuntimeException(
                'Unduh dokumen analisis gagal: '.($body['error']['message'] ?? $response->status())
            );
        }

        return $response->body();
    }

    /** POST /api/v1/analisis/simpan — persists the markdown result server-side, returns its entry_id. */
    public function analisisSimpan(string $hasilMarkdown, string $namaProposal, string $namaLaporan, string $disimpanOleh): string
    {
        $response = $this->http()->post("{$this->baseUrl}/api/v1/analisis/simpan", [
            'hasil_markdown' => $hasilMarkdown,
            'nama_proposal' => $namaProposal,
            'nama_laporan' => $namaLaporan,
            'disimpan_oleh' => $disimpanOleh,
        ]);
        $body = $response->json();

        if (! $response->successful() || ! ($body['success'] ?? false)) {
            throw new RuntimeException(
                'Simpan hasil analisis gagal: '.($body['error']['message'] ?? $response->status())
            );
        }

        return $body['data']['entry_id'];
    }

    /**
     * GET /api/v1/analisis/riwayat — list of saved entries, each
     * ['id', 'waktu', 'nama_proposal', 'nama_laporan', 'disimpan_oleh'].
     *
     * @return array<int, array<string, mixed>>
     */
    public function analisisRiwayatList(?string $disimpanOleh = null, int $limit = 200): array
    {
        $response = $this->http()->get("{$this->baseUrl}/api/v1/analisis/riwayat", array_filter([
            'disimpan_oleh' => $disimpanOleh,
            'limit' => $limit,
        ]));
        $body = $response->json();

        if (! $response->successful() || ! ($body['success'] ?? false)) {
            throw new RuntimeException(
                'Ambil riwayat analisis gagal: '.($body['error']['message'] ?? $response->status())
            );
        }

        return $body['data']['items'];
    }

    /**
     * GET /api/v1/analisis/riwayat/{entry_id} — returns ['meta' => [...], 'hasil_markdown' => string].
     *
     * @return array{meta: array<string, mixed>, hasil_markdown: string}
     */
    public function analisisRiwayatGet(string $entryId): array
    {
        $response = $this->http()->get("{$this->baseUrl}/api/v1/analisis/riwayat/{$entryId}");

        if ($response->status() === 404) {
            throw new RuntimeException('not_found');
        }

        $body = $response->json();
        if (! $response->successful() || ! ($body['success'] ?? false)) {
            throw new RuntimeException(
                'Ambil hasil analisis gagal: '.($body['error']['message'] ?? $response->status())
            );
        }

        return $body['data'];
    }

    /** DELETE /api/v1/analisis/riwayat/{entry_id} — best-effort, never throws (mirrors deleteJob()). */
    public function analisisRiwayatHapus(string $entryId): void
    {
        try {
            $this->http()->delete("{$this->baseUrl}/api/v1/analisis/riwayat/{$entryId}");
        } catch (\Throwable) {
            // Best-effort cleanup; a stray entry left behind isn't fatal.
        }
    }

    /** GET /api/v1/analisis/riwayat/{entry_id}/unduh — returns the raw .docx bytes of a saved entry. */
    public function analisisRiwayatUnduh(string $entryId): string
    {
        $response = $this->http()->get("{$this->baseUrl}/api/v1/analisis/riwayat/{$entryId}/unduh");

        if ($response->status() === 404) {
            throw new RuntimeException('not_found');
        }

        if (! $response->successful()) {
            throw new RuntimeException('Unduh hasil analisis tersimpan gagal: '.$response->status());
        }

        return $response->body();
    }

    private function buildKoreksi(array $prop, array $lap): array
    {
        $koreksi = [];
        $lokasiParts = $prop['_lokasi_parts'] ?? ['', '', '', ''];

        foreach (self::KOREKSI_FIELDS as [$source, $key]) {
            $fieldName = $source.'__'.str_replace(['/', ' '], ['_', '_'], $key);

            $value = match ($source) {
                'prop' => $prop[$key] ?? '',
                'lap' => $lap[$key] ?? '',
                // The external API renders these straight into its own docx —
                // send normal casing or the caps come back in the download.
                'prop_loc' => TextCase::humanize(is_string($lokasiParts[(int) $key] ?? null) ? $lokasiParts[(int) $key] : null) ?? '',
                default => '',
            };

            $koreksi[$fieldName] = is_scalar($value) ? (string) $value : '';
        }

        return $koreksi;
    }

    private function http()
    {
        // /api/v1/dokumen/generate can run several AI "narrative polish" calls
        // internally (mangrove/lamun/karang/gelombang/arus/pasut/batimetri),
        // capped at a cumulative 150s budget on the server side
        // (NARASI_TIME_BUDGET_SECONDS in generate_docx.py) — 240s here leaves
        // comfortable headroom under that plus normal doc-building overhead.
        $request = Http::timeout(240);

        if ($this->apiKey) {
            $request = $request->withHeaders(['X-API-Key' => $this->apiKey]);
        }

        return $request;
    }
}
