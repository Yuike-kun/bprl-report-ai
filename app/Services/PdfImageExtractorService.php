<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Imagick;
use Smalot\PdfParser\Parser as PdfParser;

class PdfImageExtractorService
{
    /**
     * key   = section key (harus sama dengan FIGURE_SECTIONS di controller)
     * value = keyword pendeteksi halaman figur (urutan = prioritas)
     */
    protected const SECTION_KEYWORDS = [
        'arus'         => ['MAWAR ARUS'],
        'gelombang'    => ['MAWAR GELOMBANG'],
        'pasang_surut' => ['SIKLUS PASUT', 'GRAFIK PASUT', 'PASANG SURUT'],
        'ekosistem'    => ['EKOSISTEM'],
        'batimetri'    => ['PROFIL GARIS', 'PEMERUMAN', 'PETA BATIMETRI'],
        'peta_lokasi'  => ['PETA LOKASI', 'TITIK KOORDINAT'],
    ];

    /**
     * Halaman figur hanya berisi judul/caption pendek.
     * Halaman narasi (teks panjang) TIDAK akan pernah diambil.
     */
    protected const MAX_FIGURE_PAGE_TEXT_LENGTH = 300;

    /**
     * Extract figure images from a survey PDF.
     *
     * @return array<string, string> section => path gambar PNG temp
     */
    public function extractSectionImages(string $pdfPath): array
    {
        try {
            // 1. Ambil teks per halaman untuk klasifikasi
            $pdf   = (new PdfParser())->parseFile($pdfPath);
            $pages = $pdf->getPages();

            $pageTexts = [];
            foreach ($pages as $i => $page) {
                $pageTexts[$i] = trim($page->getText());
            }

            // 2. Tentukan halaman mana yang merupakan figur
            $figurePages = []; // section => pageIndex
            foreach ($pageTexts as $i => $text) {
                // ✅ KUNCI PERBAIKAN: lewati halaman penuh teks (halaman narasi)
                if (strlen($text) > self::MAX_FIGURE_PAGE_TEXT_LENGTH) {
                    continue;
                }

                $section = $this->detectSection($text);
                if ($section && ! isset($figurePages[$section])) {
                    $figurePages[$section] = $i;
                }
            }

            if (empty($figurePages)) {
                return [];
            }

            // 3. Render hanya halaman figur tersebut menjadi PNG
            return $this->renderPages($pdfPath, $figurePages);
        } catch (\Exception $e) {
            Log::error('Ekstraksi gambar PDF gagal: ' . $e->getMessage());
            return [];
        }
    }

    protected function detectSection(string $text): ?string
    {
        $upper = strtoupper($text);

        foreach (self::SECTION_KEYWORDS as $section => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($upper, $keyword)) {
                    return $section;
                }
            }
        }

        return null;
    }

    /**
     * Render halaman terpilih ke PNG (Imagick, fallback pdftoppm).
     *
     * @param array<string, int> $figurePages section => page index (0-based)
     * @return array<string, string>
     */
    protected function renderPages(string $pdfPath, array $figurePages): array
    {
        $results = [];

        if (extension_loaded('imagick')) {
            $imagick = new Imagick();
            $imagick->setResolution(150, 150);
            $imagick->readImage($pdfPath);

            foreach ($figurePages as $section => $pageIndex) {
                try {
                    $imagick->setIteratorIndex($pageIndex);
                    $page = $imagick->current();
                    $page->setImageFormat('png');

                    // Buang margin putih agar gambar rapi di dokumen
                    try {
                        $page->trimImage(0);
                        $page->borderImage('white', 10, 10);
                    } catch (\Exception) {
                    }

                    $path = sys_get_temp_dir() . '/fig_' . uniqid() . '_' . $section . '.png';
                    $page->writeImage($path);
                    $results[$section] = $path;
                } catch (\Exception $e) {
                    Log::warning("Gagal render halaman {$section}: " . $e->getMessage());
                }
            }

            $imagick->clear();
            return $results;
        }

        // ── Fallback: pdftoppm (poppler-utils) ─────────────────────
        $dir = sys_get_temp_dir() . '/pdfpages_' . uniqid();
        mkdir($dir, 0755, true);

        exec(sprintf(
            'pdftoppm -png -r 150 %s %s/page 2>&1',
            escapeshellarg($pdfPath),
            escapeshellarg($dir)
        ), $output, $exitCode);

        if ($exitCode !== 0) {
            Log::error('pdftoppm gagal: ' . implode(' ', $output));
            return [];
        }

        foreach ($figurePages as $section => $pageIndex) {
            // pdftoppm menamai file mulai dari 1 (page-01.png, page-02.png, ...)
            $file = sprintf('%s/page-%02d.png', $dir, $pageIndex + 1);
            if (file_exists($file)) {
                $results[$section] = $file;
            }
        }

        return $results;
    }
}