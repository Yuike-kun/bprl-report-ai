<?php

namespace App\Services\KKPRL;

use ZipArchive;

class CoordinateExtractor
{
    public function extract(string $path, string $extension): array
    {
        $extension = strtolower($extension);
        $rows = match ($extension) {
            'csv' => $this->csvRows($path),
            'xlsx' => $this->xlsxRows($path),
            'docx' => $this->docxRows($path),
            default => [],
        };

        $coordinates = [];
        foreach ($rows as $row) {
            $coordinate = $this->pair($row[0] ?? null, $row[1] ?? null);
            if ($coordinate && ! in_array($coordinate, $coordinates, true)) {
                $coordinates[] = $coordinate;
            }
        }

        return $coordinates;
    }

    private function pair(mixed $first, mixed $second): ?array
    {
        $a = $this->number($first);
        $b = $this->number($second);
        if ($a === null || $b === null) {
            return null;
        }

        // Accept either longitude/latitude or latitude/longitude columns.
        [$latitude, $longitude] = abs($a) <= 90 && abs($b) <= 180 ? [$a, $b] : [$b, $a];
        if (abs($latitude) > 90 || abs($longitude) > 180) {
            return null;
        }

        return ['latitude' => $latitude, 'longitude' => $longitude];
    }

    private function number(mixed $value): ?float
    {
        $value = trim(str_replace(',', '.', (string) $value));

        return is_numeric($value) ? (float) $value : null;
    }

    private function csvRows(string $path): array
    {
        $rows = [];
        $firstLine = (string) @file_get_contents($path, false, null, 0, 2048);
        $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';
        if (($handle = fopen($path, 'r')) === false) {
            return $rows;
        }
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rows[] = $row;
        }
        fclose($handle);

        return $rows;
    }

    private function xlsxRows(string $path): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            return [];
        }
        $sharedStringsXml = $zip->getFromName('xl/sharedStrings.xml') ?: '';
        preg_match_all('/<t[^>]*>(.*?)<\\/t>/s', $sharedStringsXml, $sharedStringMatches);
        $sharedStrings = array_map(static fn ($value) => html_entity_decode(strip_tags($value)), $sharedStringMatches[1]);
        $rows = [];
        for ($i = 1; ($xml = $zip->getFromName("xl/worksheets/sheet{$i}.xml")) !== false; $i++) {
            preg_match_all('/<row[^>]*>(.*?)<\\/row>/s', $xml, $matchedRows);
            foreach ($matchedRows[1] as $row) {
                preg_match_all('/<c([^>]*)>(.*?)<\\/c>/s', $row, $cells, PREG_SET_ORDER);
                $rows[] = array_map(function ($cell) use ($sharedStrings) {
                    preg_match('/<v>(.*?)<\\/v>/s', $cell[2], $value);
                    $raw = strip_tags($value[1] ?? '');

                    return str_contains($cell[1], 't="s"') ? ($sharedStrings[(int) $raw] ?? '') : $raw;
                }, $cells);
            }
        }
        $zip->close();

        return $rows;
    }

    private function docxRows(string $path): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            return [];
        }
        $xml = $zip->getFromName('word/document.xml') ?: '';
        $zip->close();
        preg_match_all('/<w:tr[^>]*>(.*?)<\\/w:tr>/s', $xml, $matchedRows);

        return array_map(function ($row) {
            preg_match_all('/<w:t[^>]*>(.*?)<\\/w:t>/s', $row, $cells);

            return array_map(static fn ($cell) => html_entity_decode(strip_tags($cell)), $cells[1]);
        }, $matchedRows[1]);
    }
}
