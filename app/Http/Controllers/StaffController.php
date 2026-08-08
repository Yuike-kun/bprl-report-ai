<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $staff = Staff::query()
            ->with('user:id,name,email')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('position', 'like', "%{$search}%")
                        ->orWhere('department', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($u) use ($search) {
                            $u->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('is_active')
            ->orderBy('joined_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('backend/staff/index', [
            'staff' => $staff,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        $users = User::query()
            ->whereDoesntHave('staff') // only show users not already linked to staff
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('backend/staff/create', [
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id'    => ['required', 'integer', 'exists:users,id', Rule::unique('staff', 'user_id')],
            'position'   => ['required', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'],
            'phone'      => ['nullable', 'string', 'max:30'],
            'joined_at'  => ['required', 'date'],
            'is_active'  => ['required', 'boolean'],
        ]);

        Staff::create($validated);

        return redirect()
            ->route('staff.index')
            ->with('success', 'Staff berhasil ditambahkan.');
    }

    public function edit(Staff $staff): Response
    {
        // Include current user + other unlinked users so the select doesn't lose the current assignment
        $users = User::query()
            ->where(function ($q) use ($staff) {
                $q->where('id', $staff->user_id)
                    ->orWhereDoesntHave('staff');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('backend/staff/edit', [
            'staff' => $staff->load('user:id,name,email'),
            'users' => $users,
        ]);
    }

    public function update(Request $request, Staff $staff): RedirectResponse
    {
        $validated = $request->validate([
            'user_id'    => ['required', 'integer', 'exists:users,id', Rule::unique('staff', 'user_id')->ignore($staff->id)],
            'position'   => ['required', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'],
            'phone'      => ['nullable', 'string', 'max:30'],
            'joined_at'  => ['required', 'date'],
            'is_active'  => ['required', 'boolean'],
        ]);

        $staff->update($validated);

        return redirect()
            ->route('staff.index')
            ->with('success', 'Data staff berhasil diperbarui.');
    }

    public function destroy(Staff $staff): RedirectResponse
    {
        $staff->delete();

        return redirect()
            ->route('staff.index')
            ->with('success', 'Staff berhasil dihapus.');
    }

    public function staff_json(Request $request): JsonResponse
    {
        $search = $request->input('search');

        $staff = Staff::query()
    ->with('user:id,name,email')
    ->when($search, function ($q) use ($search) {
        $q->where(function ($sub) use ($search) {
            $sub->where('position', 'like', "%{$search}%")
                ->orWhere('department', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhereHas('user', function ($u) use ($search) {
                    $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
        });
    })
    ->orderByDesc('is_active')
    ->orderBy('joined_at')
    ->paginate(20)
    ->map(function ($staffMember) {
        return [
            'id'         => $staffMember->id,
            'name'       => $staffMember->user?->name,
            'email'      => $staffMember->user?->email,
            'position'   => $staffMember->position,
            'department' => $staffMember->department,
            'phone'      => $staffMember->phone,
            'is_active'  => $staffMember->is_active,
            'joined_at'  => $staffMember->joined_at,
        ];
    });

        return response()->json($staff);
    }
}