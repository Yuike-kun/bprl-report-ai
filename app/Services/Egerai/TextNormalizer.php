<?php

namespace App\Services\Egerai;

class TextNormalizer
{
    /** Mirrors extract.py's norm(): collapse all whitespace/zero-width chars to single spaces. */
    public static function norm(?string $s): string
    {
        $s = str_replace(["\u{200b}", "\u{feff}", "\u{a0}"], ' ', $s ?? '');

        return trim(preg_replace('/\s+/u', ' ', $s) ?? '');
    }
}
