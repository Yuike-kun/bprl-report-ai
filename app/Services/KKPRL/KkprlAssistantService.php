<?php

namespace App\Services\KKPRL;

use App\Services\GeminiService;

class KkprlAssistantService
{
    public function __construct(private GeminiService $gemini) {}

    public function reply(string $question): string
    {
        return $this->gemini->answerKkprl($question);
    }
}
