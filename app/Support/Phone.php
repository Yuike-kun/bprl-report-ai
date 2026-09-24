<?php

namespace App\Support;

class Phone
{
    /**
     * Phone numbers are stored as free-form strings (creation only validates
     * string|max:30), so compare them ignoring separators and letter case.
     */
    public static function matches(?string $stored, string $input): bool
    {
        $normalize = static fn (string $value): string => mb_strtolower(
            preg_replace('/[\s\-()]/u', '', $value) ?? ''
        );

        $stored = $normalize((string) $stored);
        $input = $normalize($input);

        return $stored !== '' && $stored === $input;
    }
}
