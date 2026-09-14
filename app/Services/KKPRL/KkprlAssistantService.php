<?php

namespace App\Services\KKPRL;

use App\Services\ClaudeService;

class KkprlAssistantService
{
    public function __construct(private ClaudeService $claude) {}

    public function reply(string $question): string
    {
        return $this->claude->answerKkprl($question);
    }
}
