<?php

namespace App\Support;

/**
 * Parses the free-text "Titik Koordinat" field of a Berita Acara.
 *
 * The form asks for one "lon, lat" pair per line, but rows imported from
 * other sources arrive numbered ("1. 121.8,-2.2"). A number prefix is only
 * recognised when whitespace follows its dot; otherwise "122.2377,-3.39"
 * would be misread as point 122 with longitude 2377.
 */
class CoordinatePoints
{
    /**
     * @return array<int, array{no: string, lon: string, lat: string}>
     */
    public static function parse(?string $raw): array
    {
        $rows = [];
        $auto = 0;

        foreach (preg_split('/\r\n|\r|\n/', trim((string) $raw)) as $line) {
            if (! preg_match('/^\s*(?:(\d+)[.)]\s+)?(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)\s*$/', $line, $m)) {
                continue;
            }

            $auto++;
            $rows[] = [
                'no' => $m[1] !== '' ? $m[1] : (string) $auto,
                'lon' => $m[2],
                'lat' => $m[3],
            ];
        }

        return $rows;
    }
}
