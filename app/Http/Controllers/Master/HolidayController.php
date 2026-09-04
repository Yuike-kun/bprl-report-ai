<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HolidayController extends Controller
{
    public function index(Request $request): Response
    {
        $year = (int) $request->query('year', now()->year);
        $search = trim((string) $request->query('search', ''));
        $query = Holiday::query()
            ->whereYear('tanggal', $year)
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('tipe', 'like', "%{$search}%");
            }))
            ->orderBy('tanggal')
            ->orderBy('nama');

        return Inertia::render('backend/master/hari-libur/index', [
            'holidays' => $query->paginate(15)->withQueryString(),
            'calendarHolidays' => Holiday::query()
                ->whereYear('tanggal', $year)
                ->orderBy('tanggal')
                ->get(['id', 'tanggal', 'nama', 'tipe', 'locked']),
            'filters' => ['year' => $year, 'search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('backend/master/hari-libur/form', [
            'mode' => 'create',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateHoliday($request);
        $validated['locked'] = false;

        Holiday::create($validated);

        return redirect()->route('master.hari-libur.index')
            ->with('success', 'Hari libur berhasil ditambahkan.');
    }

    public function edit(Request $request, Holiday $holiday): Response
    {
        return Inertia::render('backend/master/hari-libur/form', [
            'mode' => 'edit',
            'holiday' => $holiday,
        ]);
    }

    public function update(Request $request, Holiday $holiday): RedirectResponse
    {
        if ($holiday->locked) {
            return back()->with('error', 'Hari libur nasional terkunci dan tidak dapat diubah.');
        }

        $holiday->update($this->validateHoliday($request));

        return redirect()->route('master.hari-libur.index')
            ->with('success', 'Hari libur berhasil diperbarui.');
    }

    public function destroy(Request $request, Holiday $holiday): RedirectResponse
    {
        if ($holiday->locked) {
            return back()->with('error', 'Hari libur nasional terkunci dan tidak dapat dihapus.');
        }

        $holiday->delete();

        return redirect()->route('master.hari-libur.index')
            ->with('success', 'Hari libur berhasil dihapus.');
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate(['year' => ['required', 'integer', 'min:2000', 'max:2100']]);

        return back()->with('success', "Import hari libur nasional tahun {$request->integer('year')} siap dikonfigurasi.");
    }

    private function validateHoliday(Request $request): array
    {
        return $request->validate([
            'tanggal' => ['required', 'date'],
            'nama' => ['required', 'string', 'max:255'],
            'tipe' => ['required', 'in:Nasional,Perusahaan,Custom'],
            'is_recurring' => ['sometimes', 'boolean'],
        ]);
    }

}
