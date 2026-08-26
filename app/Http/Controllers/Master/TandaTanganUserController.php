<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TandaTanganUserController extends Controller
{
    public function index(Request $request)
    {
        $signatures = User::when($request->search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%");
        })
        ->paginate(10)
        ->withQueryString();

        return Inertia::render('backend/master/tanda-tangan-user/index', [
            'signatures' => $signatures,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'signature' => ['required', 'string'],
        ]);

        $user->update([
            'signature' => $validated['signature'],
        ]);

        return redirect()
            ->back()
            ->with('success', 'Tanda tangan berhasil disimpan.');
    }

    public function destroy(User $user)
    {
        $user->update([
            'signature' => null,
        ]);

        return redirect()
            ->back()
            ->with('success', 'Tanda tangan berhasil dihapus.');

            }
}
