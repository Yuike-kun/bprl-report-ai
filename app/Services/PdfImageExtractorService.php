<?php
namespace App\Services;

use Smalot\PdfParser\Parser as PdfParser;

class PdfImageExtractorService
{
    protected const SECTION_KEYWORDS = [
        'gelombang'         => ['MAWAR GELOMBANG', 'GRAFIK GELOMBANG'],
        'arus'              => ['MAWAR ARUS', 'GRAFIK ARUS'],
        'pasang_surut'      => ['SIKLUS PASUT', 'PASANG SURUT', 'GRAFIK PASUT'],
        'ekosistem_pesisir' => ['EKOSISTEM PESISIR', 'PETA VISUAL - EKOSISTEM', 'SEBARAN EKOSISTEM'],
        'batimetri'         => ['BATIMETRI', 'PROFIL GARIS'],
    ];

    /**
     * Cari halaman PDF yang cocok untuk tiap section, render jadi PNG.
     *
     * @return array<string, string>  ['gelombang' => '/tmp/xxx.png', ...]
     *                                Hanya section yang ketemu halamannya yang ada.
     * @throws \RuntimeException jika Imagick extension tidak tersedia.
     */
    public function extractSectionImages(string $pdfPath): array
    {
        if (! extension_loaded('imagick')) {
            throw new \RuntimeException('ext-imagick tidak tersedia. Install php-imagick untuk mengekstrak gambar dari PDF.');
        }

        $parser = new PdfParser();
        $pdf    = $parser->parseFile($pdfPath);
        $pages  = $pdf->getPages();
        $images = [];

        foreach ($pages as $index => $page) {
            $text = strtoupper($page->getText());

            foreach (self::SECTION_KEYWORDS as $sectionKey => $keywords) {
                if (isset($images[$sectionKey])) {
                    continue;
                }
                foreach ($keywords as $keyword) {
                    if (str_contains($text, $keyword)) {
                        $images[$sectionKey] = $this->renderPageToImage($pdfPath, $index);
                        break;
                    }
                }
            }
        }

        return $images;
    }

    /**
     * Render satu halaman PDF (0-indexed) jadi file PNG sementara.
     * Membutuhkan ext-imagick + Ghostscript.
     */
    protected function renderPageToImage(string $pdfPath, int $pageIndex): string
    {
        // \Imagick is a global PHP class provided by the imagick extension.
        // Using FQCN to allow IDEs without imagick stubs to understand the code.
        $imagick = new \Imagick();
        $imagick->setResolution(150, 150);
        $imagick->readImage($pdfPath . '[' . $pageIndex . ']');
        $imagick->setImageFormat('png');
        $imagick->setImageBackgroundColor('white');
        $imagick = $imagick->flattenImages();

        // Trim excess whitespace around chart
        $imagick->trimImage(0.05);
        $imagick->setImagePage(0, 0, 0, 0);

        $outputPath = tempnam(sys_get_temp_dir(), 'pkkprl_img_') . '.png';
        $imagick->writeImage($outputPath);
        $imagick->clear();

        return $outputPath;
    }
}
