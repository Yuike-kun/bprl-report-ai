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

    public function destroy(Changelog $changelog)
    {
        $changelog->delete();

        return redirect()->route('master.changelog.index')
            ->with('success', 'Changelog berhasil dihapus.');
    }
}
