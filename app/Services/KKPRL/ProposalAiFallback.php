<?php

namespace App\Services\KKPRL;

use App\Services\ClaudeService;

class ProposalAiFallback
{
    public function __construct(private ClaudeService $claude) {}

    public function fill(string $text, array $fields, array $missing): array
    {
        if (empty($missing)) {
            return $fields;
        }

        return array_replace($fields, $this->claude->extractProposalFields($text, $missing));
    }
}
