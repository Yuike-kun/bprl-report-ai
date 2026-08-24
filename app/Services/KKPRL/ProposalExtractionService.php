<?php

namespace App\Services\KKPRL;

use RuntimeException;
use Smalot\PdfParser\Parser;

class ProposalExtractionService
{
    public function __construct(
        private ProposalFieldExtractor $fields,
        private ProposalAiFallback $fallback,
    ) {}

    public function extract(string $path, bool $useAiFallback = true): array
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $text = '';

        if ($extension === 'docx') {
            try {
                $text = $this->extractTextFromDocx($path);
            } catch (\Throwable $exception) {
                throw new RuntimeException('Word tidak dapat dibaca.', previous: $exception);
            }
        } else {
            try {
                $text = (new Parser)->parseFile($path)->getText();
            } catch (\Throwable $exception) {
                // Try fallback to DOCX parser if the file doesn't have an extension or Parser failed
                try {
                    $text = $this->extractTextFromDocx($path);
                } catch (\Throwable) {
                    throw new RuntimeException('PDF tidak dapat dibaca.', previous: $exception);
                }
            }
        }

        if (blank(trim($text))) {
            throw new RuntimeException('Dokumen tidak memiliki teks yang dapat diekstrak.');
        }

        $extracted = $this->fields->extract($text);
        $missing = $this->fields->missing($extracted);
        if ($useAiFallback && config('services.gemini.key') && $missing) {
            $extracted = $this->fallback->fill(mb_substr($text, 0, 30000), $extracted, $missing);
            $missing = $this->fields->missing($extracted);
        }

        return ['text' => $text, 'fields' => $extracted, 'missing_fields' => $missing];
    }

    private function extractTextFromDocx(string $path): string
    {
        $zip = new \ZipArchive();
        if ($zip->open($path) === true) {
            $index = $zip->locateName('word/document.xml');
            if ($index !== false) {
                $xml = $zip->getFromIndex($index);
                $zip->close();
                // Replace closing paragraph, table cell, and text tags with a space to preserve word boundaries
                $xmlWithSpaces = str_replace(
                    ['</w:p>', '</w:tc>', '</w:tr>', '<w:tab/>', '</w:t>'],
                    ' ',
                    $xml
                );
                $text = preg_replace('/\s+/', ' ', trim(strip_tags($xmlWithSpaces)));
                return html_entity_decode($text);
            }
            $zip->close();
        }
        throw new RuntimeException('Format DOCX tidak valid.');
    }
}
