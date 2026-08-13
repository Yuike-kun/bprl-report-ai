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
        try {
            $text = (new Parser)->parseFile($path)->getText();
        } catch (\Throwable $exception) {
            throw new RuntimeException('PDF tidak dapat dibaca.', previous: $exception);
        }
        if (blank(trim($text))) {
            throw new RuntimeException('PDF tidak memiliki teks yang dapat diekstrak.');
        }

        $extracted = $this->fields->extract($text);
        $missing = $this->fields->missing($extracted);
        if ($useAiFallback && config('services.gemini.key') && $missing) {
            $extracted = $this->fallback->fill(mb_substr($text, 0, 30000), $extracted, $missing);
            $missing = $this->fields->missing($extracted);
        }

        return ['text' => $text, 'fields' => $extracted, 'missing_fields' => $missing];
    }
}
