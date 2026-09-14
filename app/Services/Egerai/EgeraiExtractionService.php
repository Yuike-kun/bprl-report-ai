<?php

namespace App\Services\Egerai;

use App\Services\ClaudeService;
use RuntimeException;
use Smalot\PdfParser\Parser;

/**
 * Orchestrates text + image extraction for one uploaded document (proposal
 * or laporan), mirroring extract.py's extract_proposal_with_fallback() /
 * extract_laporan_with_fallback(): deterministic regex first, then an
 * AI fallback (Claude) for whatever fields the regex could not find.
 */
class EgeraiExtractionService
{
    public function __construct(
        private ProposalTextExtractor $proposalExtractor,
        private LaporanTextExtractor $laporanExtractor,
        private ClaudeService $claude,
    ) {}

    public function extractProposal(string $path): array
    {
        $text = $this->extractText($path);
        $data = $this->proposalExtractor->extract($text);
        $missing = $this->proposalExtractor->missing($data);

        if ($missing && config('services.claude.key')) {
            $filled = $this->claude->extractProposalFields(mb_substr($text, 0, 15000), $missing);
            foreach ($filled as $key => $value) {
                if (filled($value)) {
                    $data[$key] = $value;
                }
            }
        }

        return $data;
    }

    public function extractLaporan(string $path): array
    {
        $text = $this->extractText($path);
        $data = $this->laporanExtractor->extract($text);
        $missing = $this->laporanExtractor->missing($data);

        if ($missing && config('services.claude.key')) {
            $filled = $this->claude->extractProposalFields(mb_substr($text, 0, 15000), $missing);
            foreach ($filled as $key => $value) {
                if (filled($value)) {
                    $data[$key] = $value;
                }
            }
        }

        return $data;
    }

    private function extractText(string $path): string
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        if ($extension === 'docx') {
            return $this->extractTextFromDocx($path);
        }

        try {
            return (new Parser)->parseFile($path)->getText();
        } catch (\Throwable $exception) {
            try {
                return $this->extractTextFromDocx($path);
            } catch (\Throwable) {
                throw new RuntimeException('Dokumen tidak dapat dibaca.', previous: $exception);
            }
        }
    }

    private function extractTextFromDocx(string $path): string
    {
        $zip = new \ZipArchive;
        if ($zip->open($path) === true) {
            $index = $zip->locateName('word/document.xml');
            if ($index !== false) {
                $xml = $zip->getFromIndex($index);
                $zip->close();
                $xmlWithSpaces = str_replace(
                    ['</w:p>', '</w:tc>', '</w:tr>', '<w:tab/>', '</w:t>'],
                    ' ',
                    $xml
                );

                return html_entity_decode(preg_replace('/\s+/', ' ', trim(strip_tags($xmlWithSpaces))));
            }
            $zip->close();
        }
        throw new RuntimeException('Format DOCX tidak valid.');
    }
}
