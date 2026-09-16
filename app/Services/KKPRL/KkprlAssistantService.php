<?php

namespace App\Services\KKPRL;

use App\Services\ClaudeService;

class KkprlAssistantService
{
    public function __construct(private ClaudeService $claude) {}

    /**
     * @param  array<int, array{role: string, content: string}>  $history
     * @return array{answer: string, sources: array<int, array{title: string, url: string}>}
     */
    public function reply(string $question, array $history = []): array
    {
        return $this->claude->answerKkprl($question, $history);
    }
}
