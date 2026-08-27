<?php

namespace App\Http\Controllers;

use App\Models\LogHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogHistoryController extends Controller
{
    /**
     * Display a listing of the log histories.
     */
    public function index(Request $request)
    {
        $query = LogHistory::query()->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('browser', 'like', "%{$search}%")
                  ->orWhere('activity', 'like', "%{$search}%");
            });
        }

        $logs = $query->paginate(15)->withQueryString();

        return Inertia::render('backend/log-histories/index', [
            'logs' => $logs,
            'filters' => $request->only(['search']),
            'success' => session('success'),
        ]);
    }

    /**
     * Clear all log histories.
     */
    public function destroyAll()
    {
        LogHistory::truncate();

        return redirect()->route('log-histories.index')
            ->with('success', 'Semua riwayat log berhasil dihapus.');
    }
}
