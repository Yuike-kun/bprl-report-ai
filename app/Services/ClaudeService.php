<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClaudeService
{
    protected string $apiKey;

    protected string $model;

    protected const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

    protected const CLAUDE_VERSION = '2023-06-01';

    protected const REQUIRED_SECTIONS = [
        'batimetri',
        'gelombang',
        'arus',
        'pasang_surut',
        'ekosistem_pesisir',
        'uraian_kegiatan',
        'kegiatan_eksisting',
        'jadwal_pelaksanaan',
        'reklamasi_status',
        'kegiatan_berusaha',
        'kegiatan_strategis',
        'rencana_tapak',
        'deskripsi_luas',
        'profil_dasar_laut',
        'sosial_ekonomi',
        'aksesibilitas',
        'sumber_material',
        'data_geoteknik',
        'pemanfaatan_lahan',
        'metode_reklamasi',
        'jadwal_reklamasi',
    ];

    protected const SECTION_PROMPTS = [
        'arus'             => 'Disampaikan sumber data arus yang digunakan dalam permohonan apakah data sekunder atau primer, untuk data sekunder disampaikan sumber pengambilan dan rentang tahun pengambilan. Variabel arus yang disampaikan dapat berupa Kecepatan Arus maksimal dalam periode tertentu dan atau Kecepatan Arus rata-rata dalam periode tertentu serta arah kecepatan arus dominan dalam periode tertentu.',
        'gelombang'        => 'Disampaikan sumber data gelombang yang digunakan dalam permohonan apakah data sekunder atau primer ataupun analisis gelombang dengan menggunakan data angin, untuk data sekunder disampaikan sumber pengambilan dan rentang tahun pengambilan. Variabel gelombang yang disampaikan dapat berupa Tinggi Gelombang Signifikan maksimal dalam periode tertentu dan atau Tinggi Gelombang Signifikan Rata-rata dalam periode tertentu, Pero gelombang signifikan serta arah Gelombang dominan dalam periode tertentu.',
        'pasang_surut'     => 'Disampaikan data pasang surut yang digunakan dalam permohonan apakah data sekunder atau primer, untuk data sekunder disampaikan sumber pengambilan dan periode tinjauan pasang surut. Untuk data primer pengambilan data pasang surut merujuk kepada standar analisis pasang surut baik Least Square maupun Admiralty. Variabel Pasang Surut yang disampaikan dapat berupa Elevasi Pasang tertinggi : HWS/HHWL/HAT ; Elevasi Muka Air Rata-rata (MSL/MWL) ; Elevasi Surut terendah (LWS/LLWL/LAT); Tipe Pasang Surut ; Grafik Muka Air Pasang Surut dan Range Pasang Surut.',
        'batimetri'        => 'Disampaikan peta batimetri/Kontur kedalaman dilengkapi dengan posisi permohonan ruang lautnya. Disampaikan sumber data batimetri apakah berasal dari data sekunder (BIG/BATNAS/GEBCO/DISHIDROS TNI-AL/ dll) atau berasal dari pengambilan data primer. Jika menggunakan data primer, disampaikan alat yang digunakan dalam pengambilan dan pemrosesan datanya menjadi kontur. Peta tersebut kemudian dibuat narasi/deskripsi yang menggambarkan kondisi batimetri di lokasi tersebut.',
        'ekosistem_pesisir' => 'Sesuai Pasal 42 ayat (4) Permen KP Nomor 28 Tahun 2021, kajian ekosistem pesisir mencakup mangrove, terumbu karang, dan padang lamun di sekitar lokasi kegiatan. Jika pada lokasi tidak terdapat salah satu ekosistem, wajib dinyatakan tidak ada disertai dokumentasi dan narasi yang relevan.',
        'uraian_kegiatan'  => 'Jelaskan uraian jenis usaha, meliputi pembangunan bangunan dan instalasi di laut (dermaga/tambak/instalasi kabel/dll). Sebutkan tujuan kegiatan, manfaat kegiatan usaha, nilai investasi (estimasi jika perlu), dan keterlibatan masyarakat lokal dalam tenaga kerja.',
        'kegiatan_eksisting' => 'Jelaskan apakah terdapat kegiatan pemanfaatan ruang laut menetap (eksisting) di lokasi ini, atau jelaskan rencana kegiatan yang akan dimohonkan.',
        'jadwal_pelaksanaan' => 'Berikan narasi penjelasan mengenai jadwal pelaksanaan kegiatan utama dan pendukungnya (durasi konstruksi, fase mobilisasi, dll).',
        'reklamasi_status' => 'Berikan penjelasan singkat dan tegas mengenai apakah kegiatan ini dilakukan dengan reklamasi atau non-reklamasi.',
        'kegiatan_berusaha' => 'Nyatakan apakah kegiatan ini adalah berusaha atau non-berusaha. Jika berusaha, sebutkan izin berusaha yang relevan (NIB/KBLI). Jika non-berusaha, sampaikan data dukung yang relevan.',
        'kegiatan_strategis' => 'Nyatakan apakah kegiatan ini merupakan Proyek Strategis Nasional (PSN) atau non-strategis nasional. Sampaikan dasar hukum atau data dukung jika merupakan PSN.',
        'rencana_tapak'    => 'Buatkan narasi terkait rencana tapak/site plan kegiatan, rencana bangunan yang akan dibuat, serta fasilitas penunjangnya yang relevan dengan permohonan ruang laut.',
        'deskripsi_luas'   => 'Sampaikan rincian kebutuhan ruang laut untuk kegiatan yang dimohonkan, baik kegiatan utama maupun penunjangnya, dilengkapi dengan deskripsi luas/panjang sesuai rencana.',
        'profil_dasar_laut' => 'Narasikan gambaran profil dasar laut pada lokasi permohonan, acuan profil melintang pantai, dan deskripsi kondisi substrat dasar laut berdasarkan data batimetri/pemeruman.',
        'sosial_ekonomi'   => 'Uraikan kondisi sosial ekonomi masyarakat sekitar (mata pencaharian dominan, kelompok nelayan). Nyatakan bahwa kegiatan direncanakan tidak mengganggu akses melaut nelayan tradisional dan akan melibatkan konsultasi publik.',
        'aksesibilitas'    => 'Jelaskan mengenai akses menuju lokasi kegiatan (jalur darat dan/atau laut) disertai dengan penggambaran rute atau metode mobilisasi material dan personel.',
        'sumber_material'  => 'Jelaskan rencana sumber material reklamasi (misal: pasir laut), jarak lokasi pengambilan, volume material yang dibutuhkan (estimasi), dan metode pengendalian sedimentasi.',
        'data_geoteknik'   => 'Narasikan kondisi geoteknik dasar laut secara umum (jenis tanah dasar, daya dukung, potensi penurunan/settlement) dan rekomendasi perbaikan tanah (soil improvement) jika diperlukan.',
        'pemanfaatan_lahan' => 'Jelaskan rencana pemanfaatan lahan hasil reklamasi (misal: area operasional, dermaga, gudang) dan jadwal pemanfaatan setelah masa konsolidasi tanah.',
        'metode_reklamasi' => 'Jelaskan secara detail metode pelaksanaan reklamasi (teknis, pengambilan material, penimbunan). Sertakan mitigasi efek reklamasi (perubahan hidro-oseanografi, dampak penimbunan, teknologi ramah lingkungan, mitigasi ekosistem).',
        'jadwal_reklamasi' => 'Berikan narasi mengenai jadwal rencana pelaksanaan pekerjaan reklamasi secara bertahap.',
    ];

    public function __construct()
    {
        $this->apiKey = (string) config('services.claude.key', '');
        $this->model  = (string) config('services.claude.model', 'claude-opus-4-5');
    }

    /* ────────────────────────────────────────────────────────────────
     * PUBLIC — always returns ALL sections filled
     * ──────────────────────────────────────────────────────────────── */
    public function generateNarasi(string $documentText, array $profileContext = []): array
    {
        $prompt = $this->buildPrompt($documentText, $profileContext);
        $narasi = [];

        for ($attempt = 1; $attempt <= 2; $attempt++) {
            try {
                $narasi = $this->normalizeOutput($this->callClaude($prompt));

                if ($this->isComplete($narasi)) {
                    return $narasi;
                }

                Log::warning('Narasi belum lengkap, mencoba ulang.', [
                    'attempt' => $attempt,
                    'empty'   => $this->emptySections($narasi),
                ]);
            } catch (Exception $e) {
                Log::error('Error saat call Claude.', ['error' => $e->getMessage()]);

                if ($attempt === 2 && empty(array_filter($narasi))) {
                    throw $e;
                }
            }
        }

        // Fallback: targeted second call for any section still empty
        $missing = $this->emptySections($narasi);

        if (! empty($missing)) {
            try {
                $fill = $this->fillMissingSections($missing, $documentText, $profileContext);

                foreach ($missing as $key) {
                    if (! empty($fill[$key])) {
                        $narasi[$key] = $fill[$key];
                    }
                }
            } catch (Exception $e) {
                Log::error('Fallback pengisian section gagal.', ['error' => $e->getMessage()]);
            }
        }

        return $this->normalizeOutput($narasi);
    }

    /**
     * Fill only explicitly missing proposal metadata.
     */
    public function extractProposalFields(string $documentText, array $missing): array
    {
        if (blank($this->apiKey) || empty($missing)) {
            return [];
        }

        $fieldList = implode(', ', $missing);
        $prompt    = 'Ekstrak hanya field metadata proposal PKKPRL berikut dari teks. Jangan mengarang nilai. '
            ."Kembalikan JSON valid dengan seluruh key yang diminta; gunakan string kosong jika tidak ada.\n"
            .'FIELD: '.$fieldList."\nDOKUMEN:\n".$documentText
            ."\n\nOutput HANYA objek JSON valid tanpa markdown atau teks lain.";

        try {
            $raw     = $this->callClaudeRaw($prompt, maxTokens: 2000);
            $decoded = $this->parseJson($raw);

            return is_array($decoded) ? $decoded : [];
        } catch (Exception $exception) {
            Log::warning('AI fallback ekstraksi proposal gagal.', ['error' => $exception->getMessage()]);

            return [];
        }
    }

    public function answerKkprl(string $question): string
    {
        if (blank($this->apiKey)) {
            return 'Asisten belum aktif. Silakan hubungi BPRL Makassar atau gunakan layanan e-SEA resmi.';
        }

        $systemPrompt = 'Anda adalah Asisten KKPRL BPRL Makassar. Jawab ringkas dalam Bahasa Indonesia berdasarkan aturan KKPRL. '
            .'Jangan mengarang dasar hukum atau keputusan izin; sarankan verifikasi ke OSS/e-SEA bila informasinya tidak pasti.';

        try {
            $response = Http::timeout(30)
                ->withHeaders($this->headers())
                ->post(self::CLAUDE_API_URL, [
                    'model'      => $this->model,
                    'max_tokens' => 1000,
                    'system'     => $systemPrompt,
                    'messages'   => [
                        ['role' => 'user', 'content' => $question],
                    ],
                ]);

            if ($response->failed()) {
                Log::warning('Claude Asisten KKPRL API error.', [
                    'status' => $response->status(),
                    'model'  => $this->model,
                    'body'   => $response->json(),
                ]);

                return 'Asisten belum dapat dihubungi. Periksa CLAUDE_API_KEY dan CLAUDE_MODEL pada konfigurasi server.';
            }

            $answer = trim((string) $response->json('content.0.text'));

            if (blank($answer)) {
                Log::warning('Claude Asisten KKPRL tidak mengembalikan jawaban.', [
                    'model'         => $this->model,
                    'stop_reason'   => $response->json('stop_reason'),
                    'response'      => $response->json(),
                ]);

                return 'Asisten tidak menerima jawaban dari model. Periksa konfigurasi model lalu coba lagi.';
            }

            return $answer;
        } catch (Exception $exception) {
            Log::warning('Asisten KKPRL gagal.', ['error' => $exception->getMessage()]);

            return 'Maaf, asisten sedang tidak dapat dihubungi. Silakan coba lagi.';
        }
    }

    /* ────────────────────────────────────────────────────────────────
     * API CALL
     * ──────────────────────────────────────────────────────────────── */

    /**
     * Call Claude and parse the response as JSON, returning an array.
     */
    protected function callClaude(string $prompt, int $maxTokens = 8192): array
    {
        $raw     = $this->callClaudeRaw($prompt, $maxTokens);
        $decoded = $this->parseJson($raw);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Call Claude and return the raw text response.
     */
    protected function callClaudeRaw(string $prompt, int $maxTokens = 8192): string
    {
        $response = Http::timeout(120)
            ->withHeaders($this->headers())
            ->post(self::CLAUDE_API_URL, [
                'model'      => $this->model,
                'max_tokens' => $maxTokens,
                'messages'   => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

        if ($response->failed()) {
            Log::error('Claude API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new Exception('Gagal menghubungi Claude API: '.$response->status());
        }

        $text = $response->json('content.0.text');

        if (! $text) {
            throw new Exception('Response Claude kosong.');
        }

        return (string) $text;
    }

    /* ────────────────────────────────────────────────────────────────
     * FALLBACK: fill only the sections that came back empty
     * ──────────────────────────────────────────────────────────────── */
    protected function fillMissingSections(array $missing, string $documentText, array $profileContext): array
    {
        $list  = implode(', ', $missing);
        $guide = collect(self::SECTION_PROMPTS)
            ->only($missing)
            ->map(fn ($text, $key) => "- [{$key}] {$text}")
            ->implode("\n");

        $prompt = <<<PROMPT
Anda adalah Senior Analis Hidro-Oseanografi menyusun proposal PKKPRL.
Bagian berikut BELUM terisi dan WAJIB Anda isi sekarang: {$list}.

ATURAN:
1. Tulis narasi teknis 2-3 paragraf untuk setiap bagian tersebut.
2. Penuhi PANDUAN RESMI TEMPLATE di bawah: sebutkan sumber data dan seluruh variabel yang diminta.
3. Gunakan data spesifik dari DOKUMEN SUMBER bila tersedia; bila tidak, turunkan analisis yang masuk akal dari KONTEKS PROFIL dan oseanografi regional pesisir Indonesia.
4. DILARANG mengirim string kosong atau menulis "data tidak tersedia".
5. Output HANYA objek JSON valid tanpa markdown.

KONTEKS PROFIL:
{$this->formatContext($profileContext)}

PANDUAN RESMI TEMPLATE UNTUK BAGIAN TERSEBUT:
{$guide}

DOKUMEN SUMBER:
{$documentText}
PROMPT;

        return $this->normalizeOutput(
            $this->callClaude($prompt),
            $missing
        );
    }

    /* ────────────────────────────────────────────────────────────────
     * PROMPT & SCHEMA
     * ──────────────────────────────────────────────────────────────── */
    protected function buildPrompt(string $documentText, array $profileContext): string
    {
        $guide    = collect(self::SECTION_PROMPTS)
            ->map(fn ($text, $key) => "- [{$key}] {$text}")
            ->implode("\n");
        $sections = implode(', ', self::REQUIRED_SECTIONS);

        return <<<PROMPT
Anda adalah Senior Analis Hidro-Oseanografi dan Ahli Rekayasa Pantai yang menyusun narasi teknis proposal PKKPRL (Permen KP No. 28 Tahun 2021) berdasarkan DOKUMEN SUMBER.

INSTRUKSI WAJIB:
1. Output HANYA objek JSON valid dengan key berikut: {$sections}. Tanpa markdown, tanpa teks pembuka/penutup.
2. SEMUA key WAJIB diisi narasi teknis formal (1-3 paragraf). STRING KOSONG DILARANG.
3. Setiap narasi WAJIB memenuhi PANDUAN RESMI TEMPLATE bagiannya.
4. Gunakan DATA SPESIFIK dari DOKUMEN SUMBER secara akurat. WAJIB menyalin angka persis (exact copy-paste) dari dokumen untuk parameter kritis: Tinggi Gelombang Maksimum (Hs), Kecepatan Arus Maksimum, dan Elevasi Pasut (HAT/MSL/LAT). JANGAN memodifikasi, membulatkan, atau mengarang angka yang berbeda dari yang tertulis di dokumen sumber.
5. PENTING: Jika suatu variabel atau bagian TIDAK tercantum secara eksplisit di DOKUMEN SUMBER, Anda WAJIB melengkapi narasi tersebut menggunakan pengetahuan teknis standar rekayasa pantai, oseanografi regional, dan praktik terbaik industri yang masuk akal untuk lokasi tersebut. DILARANG menulis "data tidak tersedia" atau kalimat penolakan.
6. Abaikan bagian dokumen yang tidak relevan (daftar isi, lampiran teks).

KONTEKS PROFIL PEMOHON:
{$this->formatContext($profileContext)}

PANDUAN RESMI TEMPLATE PER BAGIAN:
{$guide}

DOKUMEN SUMBER:
{$documentText}
PROMPT;
    }

    /* ────────────────────────────────────────────────────────────────
     * HELPERS
     * ──────────────────────────────────────────────────────────────── */
    protected function headers(): array
    {
        return [
            'x-api-key'         => $this->apiKey,
            'anthropic-version' => self::CLAUDE_VERSION,
            'content-type'      => 'application/json',
        ];
    }

    protected function parseJson(string $text): mixed
    {
        $decoded = json_decode($text, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            // Strip markdown fences and retry
            $clean   = preg_replace('/^```(?:json)?\s*|\s*```$/s', '', trim($text));
            $decoded = json_decode($clean, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Gagal parse JSON dari Claude: '.json_last_error_msg());
            }
        }

        return $decoded;
    }

    protected function formatContext(array $profileContext): string
    {
        return collect($profileContext)
            ->filter(fn ($value) => ! empty($value))
            ->map(fn ($value, $key) => "- {$key}: {$value}")
            ->implode("\n") ?: '- (tidak ada konteks tambahan)';
    }

    protected function normalizeOutput(array $narasi, ?array $keys = null): array
    {
        $result = [];

        foreach ($keys ?? self::REQUIRED_SECTIONS as $key) {
            $value = $narasi[$key] ?? '';

            if (! is_string($value)) {
                $value = '';
            }

            $value = preg_replace('/^```(?:json)?\s*|\s*```$/m', '', $value);

            $result[$key] = trim($value);
        }

        return $result;
    }

    protected function isComplete(array $narasi): bool
    {
        return empty($this->emptySections($narasi));
    }

    protected function emptySections(array $narasi): array
    {
        return array_values(array_filter(
            self::REQUIRED_SECTIONS,
            fn ($key) => empty(trim((string) ($narasi[$key] ?? '')))
        ));
    }
}
