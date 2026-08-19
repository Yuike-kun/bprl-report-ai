<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;
use ZipArchive;

class DocumentImageExtractor
{
    public function extract(string $document, string $source, string $outputDirectory): array
    {
        File::ensureDirectoryExists($outputDirectory);
        $extension = strtolower(pathinfo($document, PATHINFO_EXTENSION));
        if ($extension === 'pdf') {
            (new Process(['/usr/bin/pdfimages', '-png', $document, $outputDirectory . '/image']))->setTimeout(90)->run();
        }
        if ($extension === 'docx') {
            $zip = new ZipArchive();
            if ($zip->open($document) === true) {
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $name = $zip->getNameIndex($i);
                    if (str_starts_with($name, 'word/media/') && preg_match('/\.(png|jpe?g)$/i', $name)) {
                        file_put_contents($outputDirectory . '/' . basename($name), $zip->getFromIndex($i));
                    }
                }
                $zip->close();
            }
        }

        $tags = $source === 'proposal'
            ? ['siteplan', 'peta_lokasi', 'foto_pantai', 'foto_mangrove', 'foto_karang_insitu', 'peta_pola_ruang', 'dukung_dokumen']
            : ['peta_ekosistem', 'mawar_gelombang', 'mawar_arus', 'siklus_pasut', 'profil_batimetri'];
        $images = [];
        foreach (collect(File::files($outputDirectory))->sortBy(fn ($file) => $file->getFilename()) as $index => $file) {
            $images[$tags[$index] ?? 'dukung_dokumen'][] = $file->getPathname();
        }
        return $images;
    }
}
