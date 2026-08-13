<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected string $apiKey;

    protected string $model;

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
        'arus' => 'Disampaikan sumber data arus yang digunakan dalam permohonan apakah data sekunder atau primer, untuk data sekunder disampaikan sumber pengambilan dan rentang tahun pengambilan. Variabel arus yang disampaikan dapat berupa Kecepatan Arus maksimal dalam periode tertentu dan atau Kecepatan Arus rata-rata dalam periode tertentu serta arah kecepatan arus dominan dalam periode tertentu.',
        'gelombang' => 'Disampaikan sumber data gelombang yang digunakan dalam permohonan apakah data sekunder atau primer ataupun analisis gelombang dengan menggunakan data angin, untuk data sekunder disampaikan sumber pengambilan dan rentang tahun pengambilan. Variabel gelombang yang disampaikan dapat berupa Tinggi Gelombang Signifikan maksimal dalam periode tertentu dan atau Tinggi Gelombang Signifikan Rata-rata dalam periode tertentu, Pero gelombang signifikan serta arah Gelombang dominan dalam periode tertentu.',
        'pasang_surut' => 'Disampaikan data pasang surut yang digunakan dalam permohonan apakah data sekunder atau primer, untuk data sekunder disampaikan sumber pengambilan dan periode tinjauan pasang surut. Untuk data primer pengambilan data pasang surut merujuk kepada standar analisis pasang surut baik Least Square maupun Admiralty. Variabel Pasang Surut yang disampaikan dapat berupa Elevasi Pasang tertinggi : HWS/HHWL/HAT ; Elevasi Muka Air Rata-rata (MSL/MWL) ; Elevasi Surut terendah (LWS/LLWL/LAT); Tipe Pasang Surut ; Grafik Muka Air Pasang Surut dan Range Pasang Surut.',
        'batimetri' => 'Disampaikan peta batimetri/Kontur kedalaman dilengkapi dengan posisi permohonan ruang lautnya. Disampaikan sumber data batimetri apakah berasal dari data sekunder (BIG/BATNAS/GEBCO/DISHIDROS TNI-AL/ dll) atau berasal dari pengambilan data primer. Jika menggunakan data primer, disampaikan alat yang digunakan dalam pengambilan dan pemrosesan datanya menjadi kontur. Peta tersebut kemudian dibuat narasi/deskripsi yang menggambarkan kondisi batimetri di lokasi tersebut.',
        'ekosistem_pesisir' => 'Sesuai Pasal 42 ayat (4) Permen KP Nomor 28 Tahun 2021, kajian ekosistem pesisir mencakup mangrove, terumbu karang, dan padang lamun di sekitar lokasi kegiatan. Jika pada lokasi tidak terdapat salah satu ekosistem, wajib dinyatakan tidak ada disertai dokumentasi dan narasi yang relevan.',
        'uraian_kegiatan' => 'Jelaskan uraian jenis usaha, meliputi pembangunan bangunan dan instalasi di laut (dermaga/tambak/instalasi kabel/dll). Sebutkan tujuan kegiatan, manfaat kegiatan usaha, nilai investasi (estimasi jika perlu), dan keterlibatan masyarakat lokal dalam tenaga kerja.',
        'kegiatan_eksisting' => 'Jelaskan apakah terdapat kegiatan pemanfaatan ruang laut menetap (eksisting) di lokasi ini, atau jelaskan rencana kegiatan yang akan dimohonkan.',
        'jadwal_pelaksanaan' => 'Berikan narasi penjelasan mengenai jadwal pelaksanaan kegiatan utama dan pendukungnya (durasi konstruksi, fase mobilisasi, dll).',
        'reklamasi_status' => 'Berikan penjelasan singkat dan tegas mengenai apakah kegiatan ini dilakukan dengan reklamasi atau non-reklamasi.',
        'kegiatan_berusaha' => 'Nyatakan apakah kegiatan ini adalah berusaha atau non-berusaha. Jika berusaha, sebutkan izin berusaha yang relevan (NIB/KBLI). Jika non-berusaha, sampaikan data dukung yang relevan.',
        'kegiatan_strategis' => 'Nyatakan apakah kegiatan ini merupakan Proyek Strategis Nasional (PSN) atau non-strategis nasional. Sampaikan dasar hukum atau data dukung jika merupakan PSN.',
        'rencana_tapak' => 'Buatkan narasi terkait rencana tapak/site plan kegiatan, rencana bangunan yang akan dibuat, serta fasilitas penunjangnya yang relevan dengan permohonan ruang laut.',
        'deskripsi_luas' => 'Sampaikan rincian kebutuhan ruang laut untuk kegiatan yang dimohonkan, baik kegiatan utama maupun penunjangnya, dilengkapi dengan deskripsi luas/panjang sesuai rencana.',
        'profil_dasar_laut' => 'Narasikan gambaran profil dasar laut pada lokasi permohonan, acuan profil melintang pantai, dan deskripsi kondisi substrat dasar laut berdasarkan data batimetri/pemeruman.',
        'sosial_ekonomi' => 'Uraikan kondisi sosial ekonomi masyarakat sekitar (mata pencaharian dominan, kelompok nelayan). Nyatakan bahwa kegiatan direncanakan tidak mengganggu akses melaut nelayan tradisional dan akan melibatkan konsultasi publik.',
        'aksesibilitas' => 'Jelaskan mengenai akses menuju lokasi kegiatan (jalur darat dan/atau laut) disertai dengan penggambaran rute atau metode mobilisasi material dan personel.',
        'sumber_material' => 'Jelaskan rencana sumber material reklamasi (misal: pasir laut), jarak lokasi pengambilan, volume material yang dibutuhkan (estimasi), dan metode pengendalian sedimentasi.',
        'data_geoteknik' => 'Narasikan kondisi geoteknik dasar laut secara umum (jenis tanah dasar, daya dukung, potensi penurunan/settlement) dan rekomendasi perbaikan tanah (soil improvement) jika diperlukan.',
        'pemanfaatan_lahan' => 'Jelaskan rencana pemanfaatan lahan hasil reklamasi (misal: area operasional, dermaga, gudang) dan jadwal pemanfaatan setelah masa konsolidasi tanah.',
        'metode_reklamasi' => 'Jelaskan secara detail metode pelaksanaan reklamasi (teknis, pengambilan material, penimbunan). Sertakan mitigasi efek reklamasi (perubahan hidro-oseanografi, dampak penimbunan, teknologi ramah lingkungan, mitigasi ekosistem).',
        'jadwal_reklamasi' => 'Berikan narasi mengenai jadwal rencana pelaksanaan pekerjaan reklamasi secara bertahap.',
    ];

    public function __construct()
    {
        $this->apiKey = (string) config('services.gemini.key', '');
        $this->model = (string) config('services.gemini.model', 'gemini-1.5-pro');
    }

    /* ────────────────────────────────────────────────────────────────
     * PUBLIC — always returns ALL 5 sections filled
     * ──────────────────────────────────────────────────────────────── */
    public function generateNarasi(string $documentText, array $profileContext = []): array
    {
        $prompt = $this->buildPrompt($documentText, $profileContext);
        $narasi = [];

        for ($attempt = 1; $attempt <= 2; $attempt++) {
            try {
                $narasi = $this->normalizeOutput($this->callGemini($prompt));

                if ($this->isComplete($narasi)) {
                    return $narasi;
                }

                Log::warning('Narasi belum lengkap, mencoba ulang.', [
                    'attempt' => $attempt,
                    'empty' => $this->emptySections($narasi),
                ]);
            } catch (Exception $e) {
                Log::error('Error saat call Gemini.', ['error' => $e->getMessage()]);

                // Only hard-fail if we have nothing at all
                if ($attempt === 2 && empty(array_filter($narasi))) {
                    throw $e;
                }
            }
        }

        // ✅ FALLBACK: targeted second call for any section that is STILL empty
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
     * Fill only explicitly missing proposal metadata. This keeps the PDF
     * deterministic parser as the source of truth and limits what is sent to AI.
     */
    public function extractProposalFields(string $documentText, array $missing): array
    {
        if (blank($this->apiKey) || empty($missing)) {
            return [];
        }

        $properties = collect($missing)->mapWithKeys(fn ($key) => [$key => [
            'type' => 'STRING',
            'description' => 'Nilai persis dari dokumen. Gunakan string kosong bila tidak ditemukan.',
        ]])->all();
        $prompt = 'Ekstrak hanya field metadata proposal PKKPRL berikut dari teks. Jangan mengarang nilai. '
            ."Kembalikan JSON valid dengan seluruh key yang diminta; gunakan string kosong jika tidak ada.\n"
            .'FIELD: '.implode(', ', $missing)."\nDOKUMEN:\n".$documentText;

        try {
            return $this->callGemini($prompt, [
                'type' => 'OBJECT',
                'properties' => $properties,
                'required' => array_values($missing),
            ]);
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
        $prompt = 'Anda adalah Asisten KKPRL BPRL Makassar. Jawab ringkas dalam Bahasa Indonesia berdasarkan aturan KKPRL. '
            ."Jangan mengarang dasar hukum atau keputusan izin; sarankan verifikasi ke OSS/e-SEA bila informasinya tidak pasti.\nPERTANYAAN: {$question}";
        try {
            $response = Http::timeout(30)->post("https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}", [
                'contents' => [['parts' => [['text' => $prompt]]]],
                'generationConfig' => ['temperature' => 0.2, 'maxOutputTokens' => 1000],
            ]);

            if ($response->failed()) {
                Log::warning('Gemini Asisten KKPRL API error.', [
                    'status' => $response->status(),
                    'model' => $this->model,
                    'body' => $response->json(),
                ]);

                return 'Asisten belum dapat dihubungi. Periksa GEMINI_API_KEY dan GEMINI_MODEL pada konfigurasi server.';
            }

            $answer = trim((string) $response->json('candidates.0.content.parts.0.text'));
            if (blank($answer)) {
                Log::warning('Gemini Asisten KKPRL tidak mengembalikan jawaban.', [
                    'model' => $this->model,
                    'finish_reason' => $response->json('candidates.0.finishReason'),
                    'response' => $response->json(),
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
    protected function callGemini(string $prompt, ?array $schema = null): array
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        $payload = [
            'contents' => [
                ['parts' => [['text' => $prompt]]],
            ],
            'generationConfig' => [
                'temperature' => 0.3,
                'maxOutputTokens' => 8192, // ✅ prevents truncation → empty trailing fields
                'responseMimeType' => 'application/json',
                'responseSchema' => $schema ?? $this->responseSchema(),
            ],
        ];

        $response = Http::timeout(120)->post($url, $payload);

        if ($response->failed()) {
            Log::error('Gemini API error', ['status' => $response->status(), 'body' => $response->body()]);
            throw new Exception('Gagal menghubungi Gemini API: '.$response->status());
        }

        $text = $response->json('candidates.0.content.parts.0.text');

        if (! $text) {
            throw new Exception('Response Gemini kosong.');
        }

        $decoded = json_decode($text, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $decoded = json_decode(preg_replace('/^```(?:json)?\s*|\s*```$/', '', trim($text)), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Gagal parse JSON dari Gemini: '.json_last_error_msg());
            }
        }

        return is_array($decoded) ? $decoded : [];
    }

    /* ────────────────────────────────────────────────────────────────
     * FALLBACK: fill only the sections that came back empty
     * ──────────────────────────────────────────────────────────────── */
    protected function fillMissingSections(array $missing, string $documentText, array $profileContext): array
    {
        $list = implode(', ', $missing);
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

        $properties = [];
        foreach ($missing as $key) {
            $properties[$key] = $this->sectionSchema();
        }

        return $this->normalizeOutput(
            $this->callGemini($prompt, [
                'type' => 'OBJECT',
                'properties' => $properties,
                'required' => array_values($missing),
            ]),
            $missing
        );
    }

    protected function sectionSchema(): array
    {
        return [
            'type' => 'STRING',
            'description' => 'Narasi teknis formal 1-3 paragraf yang memenuhi panduan resmi template PKKPRL untuk bagian ini. Gunakan data spesifik dari dokumen sumber; jika tidak ada, gunakan pengetahuan teknis standar kelautan/rekayasa pantai yang masuk akal. Wajib diisi, tidak boleh kosong.',
        ];
    }

    /* ────────────────────────────────────────────────────────────────
     * PROMPT & SCHEMA
     * ──────────────────────────────────────────────────────────────── */
    protected function buildPrompt(string $documentText, array $profileContext): string
    {
        $guide = collect(self::SECTION_PROMPTS)
            ->map(fn ($text, $key) => "- [{$key}] {$text}")
            ->implode("\n");

        return <<<PROMPT
Anda adalah Senior Analis Hidro-Oseanografi dan Ahli Rekayasa Pantai yang menyusun narasi teknis proposal PKKPRL (Permen KP No. 28 Tahun 2021) berdasarkan DOKUMEN SUMBER.

INSTRUKSI WAJIB:
1. Output HANYA objek JSON valid dengan key sesuai daftar di bawah. Tanpa markdown, tanpa teks pembuka/penutup.
2. SEMUA key WAJIB diisi narasi teknis formal (1-3 paragraf). STRING KOSONG DILARANG.
3. Setiap narasi WAJIB memenuhi PANDUAN RESMI TEMPLATE bagiannya.
4. Gunakan DATA SPESIFIK dari DOKUMEN SUMBER secara akurat. WAJIB menyalin angka persis (exact copy-paste) dari dokumen untuk parameter kritis: Tinggi Gelombang Maksimum (Hs), Kecepatan Arus Maksimum, dan Elevasi Pasut (HAT/MSL/LAT). JANGAN memodifikasi, membulatkan, atau mengarang angka yang berbeda dari yang tertulis di dokumen sumber.
5. PENTING: Jika suatu variabel atau bagian (seperti sosial ekonomi, aksesibilitas, geoteknik, atau detail reklamasi) TIDAK tercantum secara eksplisit di DOKUMEN SUMBER, Anda WAJIB melengkapi narasi tersebut menggunakan pengetahuan teknis standar rekayasa pantai, oseanografi regional, dan praktik terbaik industri (best practices) yang masuk akal untuk lokasi tersebut. DILARANG menulis "data tidak tersedia" atau kalimat penolakan.
6. Abaikan bagian dokumen yang tidak relevan (daftar isi, lampiran teks).

KONTEKS PROFIL PEMOHON:
{$this->formatContext($profileContext)}

PANDUAN RESMI TEMPLATE PER BAGIAN:
{$guide}

DOKUMEN SUMBER:
{$documentText}
PROMPT;
    }

    protected function responseSchema(): array
    {
        $properties = [];
        foreach (self::REQUIRED_SECTIONS as $key) {
            $properties[$key] = $this->sectionSchema();
        }

        return [
            'type' => 'OBJECT',
            'properties' => $properties,
            'required' => self::REQUIRED_SECTIONS,
        ];
    }

    /* ────────────────────────────────────────────────────────────────
     * HELPERS
     * ──────────────────────────────────────────────────────────────── */
    protected function formatContext(array $profileContext): string
    {
        return collect($profileContext)
            ->filter(fn ($value) => ! empty($value))
            ->map(fn ($value, $key) => "- {$key}: {$value}")
            ->implode("\n") ?: '- (tidak ada konteks tambahan)';
    }

    /** Strip markdown fences & normalize — does NOT blank out content anymore. */
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
