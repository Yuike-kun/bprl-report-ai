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
        $this->apiKey = (string) config('services.claude.key', '');
        $this->model = (string) config('services.claude.model', 'claude-opus-4-5');
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
                    'empty' => $this->emptySections($narasi),
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
        $prompt = 'Ekstrak hanya field metadata proposal PKKPRL berikut dari teks. Jangan mengarang nilai. '
            ."Kembalikan JSON valid dengan seluruh key yang diminta; gunakan string kosong jika tidak ada.\n"
            .'FIELD: '.$fieldList."\nDOKUMEN:\n".$documentText
            ."\n\nOutput HANYA objek JSON valid tanpa markdown atau teks lain.";

        try {
            $raw = $this->callClaudeRaw($prompt, maxTokens: 2000);
            $decoded = $this->parseJson($raw);

            return is_array($decoded) ? $decoded : [];
        } catch (Exception $exception) {
            Log::warning('AI fallback ekstraksi proposal gagal.', ['error' => $exception->getMessage()]);

            return [];
        }
    }

    /**
     * Generate detailed, professional Bahasa Indonesia narration for the coastal
     * ecosystem subsection (mangrove, seagrass/lamun, coral reef) of a KKPRL
     * proposal DOCX, strictly grounded on the real data supplied in $context.
     *
     * The model is explicitly instructed to use ONLY the facts given (species,
     * cover percentage, condition, location) and never invent numbers, species
     * names, or distances that are not present in $context — any data point
     * that is genuinely absent must be reported as unavailable rather than
     * fabricated. Returns an array with keys: mangrove, lamun, karang, ringkasan.
     * Returns [] on any failure so the caller can fall back to static text.
     */
    public function generateEkosistemNarrative(array $context): array
    {
        if (blank($this->apiKey)) {
            return [];
        }

        $facts = collect($context)
            ->map(fn ($value, $key) => '- '.$key.': '.(is_bool($value) ? ($value ? 'Ya' : 'Tidak') : (filled($value) ? $value : '(tidak ada data)')))
            ->implode("\n");

        $year = now()->year;
        $today = now()->translatedFormat('j F Y');

        $prompt = <<<PROMPT
Anda adalah Analis Lingkungan Pesisir yang menyusun narasi teknis untuk proposal PKKPRL sesuai Pasal 42 ayat (4) Permen KP Nomor 28 Tahun 2021 mengenai kajian ekosistem pesisir (mangrove, terumbu karang, padang lamun).

Hari ini adalah {$today}. Tahun berjalan adalah {$year}.

ATURAN MUTLAK — WAJIB DIPATUHI:
1. HANYA gunakan data spesifik lokasi (spesies, persentase tutupan, kondisi) dari DATA FAKTUAL di bawah ini. DILARANG KERAS mengarang, menebak, atau menambahkan jenis spesies, persentase tutupan, kondisi, jarak, maupun angka spesifik-lokasi apa pun yang tidak tercantum secara eksplisit di DATA FAKTUAL.
2. Jika suatu data (misalnya persentase atau jarak) tidak tersedia di DATA FAKTUAL, JANGAN mengisinya dengan angka perkiraan — nyatakan secara eksplisit bahwa data tersebut tidak tersedia/tidak terukur dan perlu survei lanjutan, atau cukup hilangkan detail tersebut dari kalimat.
3. Jika suatu ekosistem dinyatakan TIDAK ADA (mis. has_mangrove = Tidak), tulis narasi yang menyatakan ekosistem tersebut tidak teridentifikasi pada lokasi kegiatan — jangan menulis narasi keberadaannya.
4. Gunakan alat pencarian web (web_search) secara aktif — lakukan BEBERAPA kali pencarian (bukan hanya satu) — untuk mencari referensi ILMIAH/RESMI TERKINI (tahun {$year} atau publikasi terbaru yang tersedia, JANGAN mengutip data usang bertahun-tahun lampau kecuali itu memang dasar hukum/peraturan yang masih berlaku) mengenai kondisi umum ekosistem pesisir (mangrove/lamun/terumbu karang) di wilayah "{$context['lokasi']}" dan perairan "{$context['nama_perairan']}" dari situs web NYATA dan tepercaya (contoh: kkp.go.id, brin.go.id, big.go.id, jurnal ilmiah/repositori kampus, mongabay.co.id, walhi.or.id, situs pemerintah daerah/BPS/OPD DKP setempat). Gunakan hasil pencarian sebagai konteks ekologis regional pendukung yang KAYA dan SPESIFIK-WILAYAH (mis. karakteristik ekosistem pesisir kabupaten/kota atau perairan tersebut, ancaman/tekanan lingkungan yang umum terjadi di kawasan itu, program konservasi/rehabilitasi yang pernah/sedang berjalan di sana, status kawasan konservasi terdekat bila ada) — BUKAN untuk mengganti atau menambah angka spesifik lokasi kegiatan yang tidak ada di DATA FAKTUAL.
5. Gunakan gaya bahasa teknis-formal Bahasa Indonesia sebagaimana lazim pada dokumen proposal PKKPRL/AMDAL resmi. WAJIB tulis 3-4 paragraf yang cukup panjang dan padat informasi untuk SETIAP subbagian ekosistem (mangrove, lamun, terumbu karang) — bukan 1-2 paragraf singkat, dan bukan poin-poin.
6. Setiap subbagian ekosistem WAJIB membahas seluruh aspek berikut secara berurutan dan mengalir sebagai narasi (bukan daftar bernomor), sepanjang relevan dengan data/hasil pencarian yang ada:
   a. Deskripsi kondisi eksisting di lokasi berdasarkan DATA FAKTUAL (spesies, persentase tutupan, kondisi) — jika ekosistem tidak ada, jelaskan hal ini secara eksplisit dengan penjelasan yang tetap informatif (mis. kemungkinan penyebab ekologis/geomorfologis ketiadaan ekosistem tersebut, bila didukung konteks pencarian web).
   b. Signifikansi ekologis jenis/kondisi yang disebutkan: peran fungsional ekosistem tersebut (mis. mangrove sebagai penahan abrasi & nursery ground, lamun sebagai habitat dugong/penyu & penyerap karbon biru, terumbu karang sebagai pemecah gelombang alami & habitat biota laut).
   c. Konteks regional/wilayah dari hasil pencarian web (karakteristik kawasan, status konservasi, tekanan/ancaman lingkungan yang umum di wilayah tersebut, upaya pengelolaan yang diketahui ada).
   d. Implikasi terhadap rencana kegiatan dan arahan mitigasi spesifik untuk ekosistem tersebut (mis. metode konstruksi yang meminimalkan gangguan, buffer zone, pengendalian sedimentasi, larangan penambatan pada substrat vegetasi, dsb.).
7. DILARANG mengulang kalimat yang sama persis antar subbagian; setiap subbagian harus punya narasi unik dan spesifik terhadap ekosistemnya masing-masing.
8. Output HANYA objek JSON valid tanpa markdown, dengan struktur persis:
{"mangrove": "...", "lamun": "...", "karang": "...", "ringkasan": "..."}
   - "ringkasan" berisi 1-2 paragraf kesimpulan komprehensif kondisi ekosistem pesisir di lokasi kegiatan secara keseluruhan (bukan mengulang isi subbagian) dan arahan mitigasi terpadu (revegetasi, penghindaran/avoidance, pengendalian sedimen, pemantauan berkala, dsb.) HANYA berdasarkan ekosistem yang benar-benar teridentifikasi ada pada DATA FAKTUAL.

DATA FAKTUAL:
{$facts}

Output HANYA objek JSON valid tanpa markdown atau teks lain di dalam blok teks akhir Anda.
PROMPT;

        try {
            $json = $this->callClaudeWithWebSearch($prompt, maxTokens: 6000);
            $text = $this->extractResponseText($json);

            if (blank($text)) {
                throw new Exception('Response Claude (web search) kosong.');
            }

            $decoded = $this->parseJson($text);

            if (! is_array($decoded)) {
                return [];
            }

            $result = [];
            foreach (['mangrove', 'lamun', 'karang', 'ringkasan'] as $key) {
                $value = $decoded[$key] ?? '';
                $result[$key] = is_string($value) ? trim($value) : '';
            }

            $result['sumber'] = $this->extractCitations($json);

            return $result;
        } catch (Exception $exception) {
            Log::warning('AI narasi ekosistem (web search) gagal, mencoba tanpa pencarian web.', ['error' => $exception->getMessage()]);

            // Fallback: same instructions, no web search tool (older accounts/models
            // may not support the tool, or the call may have failed transiently).
            try {
                $raw = $this->callClaudeRaw($prompt, maxTokens: 4000);
                $decoded = $this->parseJson($raw);

                if (! is_array($decoded)) {
                    return [];
                }

                $result = [];
                foreach (['mangrove', 'lamun', 'karang', 'ringkasan'] as $key) {
                    $value = $decoded[$key] ?? '';
                    $result[$key] = is_string($value) ? trim($value) : '';
                }

                $result['sumber'] = [];

                return $result;
            } catch (Exception $fallbackException) {
                Log::warning('AI narasi ekosistem gagal total.', ['error' => $fallbackException->getMessage()]);

                return [];
            }
        }
    }

    /**
     * Same as callClaudeRaw() but enables Anthropic's native web_search tool so the
     * model can ground its answer in real, current web pages instead of relying on
     * stale training data. Returns the full decoded JSON response (not just the text)
     * so callers can also pull out the `citations` attached to text blocks — these
     * citations are populated by Anthropic only from pages the tool actually fetched,
     * so any URL surfaced this way corresponds to a real page that was retrieved.
     */
    protected function callClaudeWithWebSearch(string $prompt, int $maxTokens = 3000, int $maxSearchUses = 6, ?string $system = null): array
    {
        $payload = [
            'model' => $this->model,
            'max_tokens' => $maxTokens,
            'tools' => [
                [
                    'type' => 'web_search_20250305',
                    'name' => 'web_search',
                    'max_uses' => $maxSearchUses,
                ],
            ],
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ];

        if (filled($system)) {
            $payload['system'] = $system;
        }

        $response = Http::timeout(180)
            ->withHeaders($this->headers())
            ->post(self::CLAUDE_API_URL, $payload);

        if ($response->failed()) {
            Log::warning('Claude web search API error.', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new Exception('Gagal menghubungi Claude API (web search): '.$response->status());
        }

        return $response->json() ?? [];
    }

    /**
     * Pull the real source pages Claude's web_search tool actually visited out of the
     * response's `citations` metadata (attached by Anthropic to the text spans that
     * used them). Never fabricated — if the tool found nothing, this returns [].
     *
     * @return array<int, array{title: string, url: string}>
     */
    private function extractCitations(array $json): array
    {
        $blocks = $json['content'] ?? [];
        if (! is_array($blocks)) {
            return [];
        }

        return collect($blocks)
            ->filter(fn ($block) => is_array($block) && ($block['type'] ?? null) === 'text' && ! empty($block['citations']))
            ->flatMap(fn ($block) => $block['citations'])
            ->filter(fn ($citation) => is_array($citation) && filled($citation['url'] ?? null))
            ->map(fn ($citation) => [
                'title' => trim((string) ($citation['title'] ?? $citation['url'])),
                'url' => trim((string) $citation['url']),
            ])
            ->unique('url')
            ->values()
            ->all();
    }

    /**
     * Answer a KKPRL question, grounded on real, current web pages via Anthropic's
     * native web_search tool wherever the question benefits from up-to-date info
     * (e.g. PNBP rates, OSS procedures, SLA). Returns ['answer' => string, 'sources' => array]
     * where `sources` only ever contains pages the tool actually fetched (from Anthropic's
     * `citations` metadata) — never fabricated URLs — so the frontend can render a
     * "Sumber" list beneath the answer, similar to ChatGPT's web-search citations.
     */
    public function answerKkprl(string $question): array
    {
        if (blank($this->apiKey)) {
            return ['answer' => 'Asisten belum aktif. Silakan hubungi BPRL Makassar atau gunakan layanan e-SEA resmi.', 'sources' => []];
        }

        $year = now()->year;
        $systemPrompt = 'Anda adalah Asisten KKPRL BPRL Makassar dengan Nama Navi. '
    ."Tahun berjalan adalah {$year} — jangan menyampaikan informasi/angka yang sudah usang seolah-olah masih berlaku saat ini. "
    .'Jawab ringkas dalam Bahasa Indonesia berdasarkan aturan KKPRL. '
    .'Gunakan format Markdown: **bold** untuk istilah/angka penting, '
    .'gunakan poin (-) untuk daftar syarat atau langkah. Jangan gunakan heading (#). '
    .'Jika pertanyaan menyangkut hal yang bisa berubah dari waktu ke waktu (biaya PNBP, prosedur OSS/e-SEA, SLA, dasar hukum), gunakan alat pencarian web (web_search) untuk memverifikasi jawaban dari situs resmi terkini (contoh: oss.go.id, kkp.go.id, peraturan.go.id, jdih.kkp.go.id) sebelum menjawab. '
    .'Jangan mengarang dasar hukum, angka, atau keputusan izin; jika tidak yakin walau sudah mencari, sarankan verifikasi langsung ke OSS/e-SEA resmi.';

        try {
            $json = $this->callClaudeWithWebSearch(
                $question,
                maxTokens: 1200,
                maxSearchUses: 3,
                system: $systemPrompt,
            );

            $answer = trim($this->extractResponseText($json));

            if (blank($answer)) {
                Log::warning('Claude Asisten KKPRL tidak mengembalikan jawaban.', [
                    'model' => $this->model,
                    'response' => $json,
                ]);

                return ['answer' => 'Asisten tidak menerima jawaban dari model. Periksa konfigurasi model lalu coba lagi.', 'sources' => []];
            }

            return ['answer' => $answer, 'sources' => $this->extractCitations($json)];
        } catch (Exception $exception) {
            Log::warning('Asisten KKPRL gagal.', ['error' => $exception->getMessage()]);

            return ['answer' => 'Maaf, asisten sedang tidak dapat dihubungi. Silakan coba lagi.', 'sources' => []];
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
        $raw = $this->callClaudeRaw($prompt, $maxTokens);
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
                'model' => $this->model,
                'max_tokens' => $maxTokens,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

        if ($response->failed()) {
            Log::error('Claude API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new Exception('Gagal menghubungi Claude API: '.$response->status());
        }

        $text = $this->extractResponseText($response->json() ?? []);

        if (blank($text)) {
            throw new Exception('Response Claude kosong.');
        }

        return $text;
    }

    /**
     * Claude's `content` array does not always put a text block at index 0 —
     * models can prepend `thinking`/`redacted_thinking`/`server_tool_use`
     * blocks (extended-thinking or tool-use responses) before the actual
     * `text` block, or split the answer across multiple text blocks.
     * Concatenates every text block instead of blindly reading content.0.text.
     */
    private function extractResponseText(array $json): string
    {
        $blocks = $json['content'] ?? [];
        if (! is_array($blocks)) {
            return '';
        }

        return trim(collect($blocks)
            ->filter(fn ($block) => is_array($block) && ($block['type'] ?? null) === 'text')
            ->map(fn ($block) => (string) ($block['text'] ?? ''))
            ->implode("\n"));
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
        $guide = collect(self::SECTION_PROMPTS)
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
            'x-api-key' => $this->apiKey,
            'anthropic-version' => self::CLAUDE_VERSION,
            'content-type' => 'application/json',
        ];
    }

    protected function parseJson(string $text): mixed
    {
        $decoded = json_decode($text, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            // Strip markdown fences and retry
            $clean = preg_replace('/^```(?:json)?\s*|\s*```$/s', '', trim($text));
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
