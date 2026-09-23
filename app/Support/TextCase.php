<?php

namespace App\Support;

/**
 * Normalises location labels for PDF output.
 *
 * The wilayah tables (provinces/regencies/districts, loaded from
 * database/dump/indonesia.sql) store names in ALL CAPS — e.g.
 * "KABUPATEN BANTAENG", "SULAWESI SELATAN" — which reads as shouting when
 * printed inline in the Berita Acara and Permohonan Konsultasi letters.
 * This converts ONLY fully-uppercase strings to sentence casing
 * ("Kabupaten bantaeng" via ucfirst(strtolower(...))); anything already
 * mixed or lower case ("Kantor BPRL", "Daring", "-") is returned untouched,
 * so free-text values typed by users are never rewritten.
 */
class TextCase
{
    public static function humanize(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        // Not entirely uppercase: already normal, leave as stored.
        if (mb_strtoupper($value, 'UTF-8') !== $value) {
            return $value;
        }

        // Uppercase but contains no cased letters at all (numbers,
        // punctuation): nothing to normalise.
        if (mb_strtolower($value, 'UTF-8') === $value) {
            return $value;
        }

        return ucfirst(strtolower($value));
    }
}
