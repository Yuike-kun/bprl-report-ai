<?php
namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected string $apiKey;
    protected string $model;

    /**
     * Kunci narasi yang WAJIB ada.
     * DISINKRONKAN dengan placeholder di Template DOCX dan ALL_FIELDS di Controller jika perlu,
     * atau dipetakan khusus di Controller.
     */
    protected const REQUIRED_SECTIONS = [
        'batimetri',
        'gelombang',
        'arus',
        'pasang_surut',
        'ekosistem_pesisir',
    ];

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
        // Gunakan model yang mendukung structured output dengan baik
        $this->model = config('services.gemini.model', 'gemini-1.5-pro');
    }

    public function generateNarasi(string $documentText, array $profileContext = []): array
    {
        $prompt = $this->buildPrompt($documentText, $profileContext);

        for ($attempt = 1; $attempt <= 2; $attempt++) {
            try {
                $narasi = $this->callGemini($prompt);

                if ($this->isComplete($narasi)) {
                    return $narasi;
                }

                Log::warning('Gemini response tidak lengkap, mencoba ulang.', [
                    'attempt' => $attempt,
                    'missing' => array_diff(self::REQUIRED_SECTIONS, array_keys($narasi)),
                ]);
            } catch (Exception $e) {
                if ($attempt === 2) {
                    throw $e;
                }

                Log::error('Error saat call Gemini, retrying...', ['error' => $e->getMessage()]);
            }
        }

        throw new Exception('Gagal mendapatkan narasi lengkap dari AI setelah beberapa percobaan.');
    }

    protected function callGemini(string $prompt): array
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        $payload = [
            'contents'         => [
                ['parts' => [['text' => $prompt]]],
            ],
            'generationConfig' => [
                'temperature'      => 0.2, // Rendah untuk konsistensi tinggi
                'responseMimeType' => 'application/json',
                // INI KUNCINYA: Mengirim schema ke Gemini
                'responseSchema'   => $this->responseSchema(),
            ],
        ];

        $response = Http::timeout(120) // Timeout lebih lama karena generate teks panjang
            ->post($url, $payload);

        if ($response->failed()) {
            Log::error('Gemini API error', ['status' => $response->status(), 'body' => $response->body()]);
            throw new Exception('Gagal menghubungi Gemini API: ' . $response->status());
        }

        $json = $response->json();

        // Ambil text dari response
        $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;

        if (! $text) {
            throw new Exception('Response Gemini kosong.');
        }

        // Karena kita pakai responseMimeType json, Gemini seharusnya mengembalikan JSON valid
        // Namun tetap kita decode untuk memastikan
        $decoded = json_decode($text, true);

        if (json_last_error() !== JSON_ERROR_NONE || ! is_array($decoded)) {
            // Fallback jika ternyata masih berupa string markdown ```json ... ```
            $cleaned = preg_replace('/^```json\s*|\s*```$/', '', trim($text));
            $decoded = json_decode($cleaned, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Gagal parse JSON dari response Gemini: ' . json_last_error_msg());
            }
        }

        return $decoded;
    }

    protected function isComplete(array $narasi): bool
    {
        foreach (self::REQUIRED_SECTIONS as $key) {
            if (! isset($narasi[$key]) || empty(trim($narasi[$key]))) {
                return false;
            }
        }
        return true;
    }

    protected function buildPrompt(string $documentText, array $profileContext): string
    {
        $context = collect($profileContext)
            ->filter(fn($value) => ! empty($value))
            ->map(fn($value, $key) => "- {$key}: {$value}")
            ->implode("\n");

        return <<<PROMPT
Anda adalah Senior Analis Hidro-Oseanografi. Susun narasi proposal PKKPRL berdasarkan DOKUMEN SUMBER berikut.

INSTRUKSI PENTING:
1. Output HARUS berupa objek JSON valid dengan key: batimetri, gelombang, arus, pasang_surut, ekosistem_pesisir.
2. Setiap bagian WAJIB berisi minimal 3 paragraf mendalam.
3. Gunakan DATA SPESIFIK dari dokumen sumber (contoh: kedalaman -19.07 m LWS, Hs maks 2.43m, Formzahl 1.84, dll). Jangan buat data fiktif.
4. Jika data tidak ada, jelaskan pentingnya parameter tersebut dan rekomendasikan metode pengukurannya.

KONTEKS PROFIL:
{$context}

DOKUMEN SUMBER:
{$documentText}

SUSUN NARASI KE DALAM FORMAT JSON BERIKUT:
- batimetri: Analisis morfologi dasar laut, variasi kedalaman, dan implikasi pondasi.
- gelombang: Karakteristik Hs rata-rata vs ekstrem, arah dominan, dan dampak desain struktur.
- arus: Pola sirkulasi, kecepatan ekstrem, potensi gerusan (scouring), dan arah dominan.
- pasang_surut: Tipe pasut (Mixed Diurnal), rentang vertikal, datum LAT/MSL/HAT, dan pengaruhnya terhadap elevasi struktur.
- ekosistem_pesisir: Tutupan terumbu karang/lamun, jarak terdekat, persentase area, dan strategi mitigasi avoidance.

PASTIKAN OUTPUT HANYA BERUPA OBJEK JSON VALID TANPA MARKDOWN.
PROMPT;
    }

    protected function responseSchema(): array
    {
        $sectionSchema = [
            'type'        => 'STRING',
            'description' => 'Narasi teknis formal minimal 3 paragraf berdasarkan data spesifik dari laporan.',
        ];

        return [
            'type'       => 'OBJECT',
            'properties' => [
                'batimetri'         => $sectionSchema,
                'gelombang'         => $sectionSchema,
                'arus'              => $sectionSchema,
                'pasang_surut'      => $sectionSchema,
                'ekosistem_pesisir' => $sectionSchema,
            ],
            'required'   => self::REQUIRED_SECTIONS,
        ];
    }

}
