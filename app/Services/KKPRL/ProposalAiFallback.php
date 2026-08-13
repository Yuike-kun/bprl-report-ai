<?php

namespace App\Services\KKPRL;

use App\Services\GeminiService;

class ProposalAiFallback
{
    public function __construct(private GeminiService $gemini) {}

    public function fill(string $text, array $fields, array $missing): array
    {
        if (empty($missing)) {
            return $fields;
        }

        return array_replace($fields, $this->gemini->extractProposalFields($text, $missing));
    }
}
