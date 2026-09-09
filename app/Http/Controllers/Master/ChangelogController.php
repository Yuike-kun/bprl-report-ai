<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Changelog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChangelogController extends Controller
{
    public function index(Request $request)
    {
        $query = Changelog::query()->orderBy('release_date', 'desc')->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('version', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $changelogs = $query->paginate(10)->withQueryString();

        return Inertia::render('backend/master/changelog/index', [
            'changelogs' => $changelogs,
            'filters' => $request->only(['search', 'type']),
            'success' => session('success'),
        ]);
    }

    public function create()
    {
        return Inertia::render('backend/master/changelog/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'version' => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:feature,bugfix,improvement',
            'release_date' => 'required|date',
        ]);

        Changelog::create($validated);

        return redirect()->route('master.changelog.index')
            ->with('success', 'Changelog berhasil ditambahkan.');
    }

    public function edit(Changelog $changelog)
    {
        return Inertia::render('backend/master/changelog/edit', [
            'changelog' => $changelog,
        ]);
    }

    public function update(Request $request, Changelog $changelog)
    {
        $validated = $request->validate([
            'version' => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:feature,bugfix,improvement',
            'release_date' => 'required|date',
        ]);

        $changelog->update($validated);

        return redirect()->route('master.changelog.index')
            ->with('success', 'Changelog berhasil diperbarui.');
    }

    public function downloadTemplate()
    {
        $content = <<<MD
---
version: "1.0.0"
title: "Peluncuran Fitur Utama"
type: "feature"
release_date: "2026-09-01"
---

Sistem manajemen laporan BPRL dan permohonan konsultasi resmi diluncurkan.

---
version: "1.0.1"
title: "Perbaikan Bug Navigasi & Tabel"
type: "bugfix"
release_date: "2026-09-05"
---

Memperbaiki pencarian real-time pada tabel master dan penyesuaian tampilan grafik.
MD;

        return response($content, 200, [
            'Content-Type' => 'text/markdown; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="changelog-template.md"',
        ]);
    }

    public function importMd(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:txt,md,text,markdown|max:2048',
        ]);

        $content = file_get_contents($request->file('file')->getRealPath());
        
        $importedCount = 0;
        $items = $this->parseMarkdownChangelog($content);

        foreach ($items as $item) {
            if (empty($item['version']) || empty($item['title'])) {
                continue;
            }

            $type = in_array($item['type'] ?? '', ['feature', 'bugfix', 'improvement'])
                ? $item['type']
                : 'feature';

            $releaseDate = !empty($item['release_date'])
                ? date('Y-m-d', strtotime($item['release_date']))
                : date('Y-m-d');

            Changelog::create([
                'version' => substr($item['version'], 0, 50),
                'title' => substr($item['title'], 0, 255),
                'description' => $item['description'] ?? $item['title'],
                'type' => $type,
                'release_date' => $releaseDate,
            ]);

            $importedCount++;
        }

        if ($importedCount === 0) {
            return redirect()->back()->withErrors(['file' => 'Tidak ada data changelog valid yang ditemukan dalam file MD.']);
        }

        return redirect()->route('master.changelog.index')
            ->with('success', "Berhasil mengimpor {$importedCount} changelog.");
    }

    private function parseMarkdownChangelog(string $content): array
    {
        $items = [];

        // Match frontmatter blocks: --- yaml --- description content
        // Uses regex to find pattern --- ... --- (body)
        $pattern = '/(?:^|\n)---\s*\n(.*?)\n---\s*\n(.*?)(?=\n---\s*\n|$)/s';
        
        if (preg_match_all($pattern, $content, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $yaml = $match[1];
                $description = trim($match[2]);

                if (preg_match('/version\s*:\s*"?([^"\n]+)"?/i', $yaml, $vMatch)) {
                    $item = [
                        'version' => trim($vMatch[1]),
                        'title' => '',
                        'type' => 'feature',
                        'release_date' => date('Y-m-d'),
                        'description' => $description,
                    ];

                    if (preg_match('/title\s*:\s*"?([^"\n]+)"?/i', $yaml, $tMatch)) {
                        $item['title'] = trim($tMatch[1]);
                    }
                    if (preg_match('/type\s*:\s*"?([^"\n]+)"?/i', $yaml, $tpMatch)) {
                        $item['type'] = trim($tpMatch[1]);
                    }
                    if (preg_match('/release_date\s*:\s*"?([^"\n]+)"?/i', $yaml, $rdMatch)) {
                        $item['release_date'] = trim($rdMatch[1]);
                    }

                    $items[] = $item;
                }
            }
        }

        // Fallback: parse split blocks if frontmatter regex didn't catch single entry or non-standard format
        if (empty($items)) {
            $blocks = preg_split('/^---$/m', $content);
            $blocks = array_map('trim', $blocks);
            $blocks = array_values(array_filter($blocks));

            for ($i = 0; $i < count($blocks); $i++) {
                $block = $blocks[$i];
                if (preg_match('/version\s*:\s*"?([^"\n]+)"?/i', $block, $vMatch)) {
                    $item = [
                        'version' => trim($vMatch[1]),
                        'title' => '',
                        'type' => 'feature',
                        'release_date' => date('Y-m-d'),
                        'description' => '',
                    ];

                    if (preg_match('/title\s*:\s*"?([^"\n]+)"?/i', $block, $tMatch)) {
                        $item['title'] = trim($tMatch[1]);
                    }
                    if (preg_match('/type\s*:\s*"?([^"\n]+)"?/i', $block, $tpMatch)) {
                        $item['type'] = trim($tpMatch[1]);
                    }
                    if (preg_match('/release_date\s*:\s*"?([^"\n]+)"?/i', $block, $rdMatch)) {
                        $item['release_date'] = trim($rdMatch[1]);
                    }

                    if (isset($blocks[$i + 1]) && !preg_match('/version\s*:/i', $blocks[$i + 1])) {
                        $item['description'] = $blocks[$i + 1];
                        $i++;
                    }

                    $items[] = $item;
                }
            }
        }

        // Fallback to header-based parsing (# v1.0.0 Title)
        if (empty($items)) {
            $sections = preg_split('/^#+\s+/m', $content);
            foreach ($sections as $section) {
                $section = trim($section);
                if (empty($section)) continue;

                $lines = explode("\n", $section);
                $headerLine = array_shift($lines);

                if (preg_match('/v?(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?)(?:\s*-\s*(.*))?/i', $headerLine, $hMatches)) {
                    $version = $hMatches[1];
                    $title = !empty($hMatches[2]) ? trim($hMatches[2]) : "Rilis v{$version}";
                    $body = implode("\n", $lines);

                    $type = 'feature';
                    if (preg_match('/type\s*:\s*(feature|bugfix|improvement)/i', $body, $tpM)) {
                        $type = strtolower($tpM[1]);
                    }
                    $releaseDate = date('Y-m-d');
                    if (preg_match('/release_date\s*:\s*(\d{4}-\d{2}-\d{2})/i', $body, $rdM)) {
                        $releaseDate = $rdM[1];
                    }

                    $items[] = [
                        'version' => $version,
                        'title' => $title,
                        'type' => $type,
                        'release_date' => $releaseDate,
                        'description' => trim($body) ?: $title,
                    ];
                }
            }
        }

        return $items;
    }
}

