<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $staff = Staff::query()
            ->with('user:id,name,email,role', 'permohonanKonsultasi.RequestForm')
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
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('backend/staff/index', [
            'staff' => $staff,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('backend/staff/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password'   => ['required', 'string', 'min:8', 'confirmed'],
            'position'   => ['required', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'],
            'phone'      => ['nullable', 'string', 'max:30'],
            'joined_at'  => ['required', 'date'],
            'is_active'  => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => 'pegawai',
            ]);

            Staff::create([
                'user_id'    => $user->id,
                'position'   => $validated['position'],
                'department' => $validated['department'],
                'phone'      => $validated['phone'] ?? null,
                'joined_at'  => $validated['joined_at'],
                'is_active'  => $validated['is_active'],
            ]);
        });

        return redirect()
            ->route('staff.index')
            ->with('success', 'Staff dan Akun Pegawai berhasil ditambahkan.');
    }

    public function edit(Staff $staff): Response
    {
        return Inertia::render('backend/staff/edit', [
            'staff' => $staff->load('user:id,name,email,role'),
        ]);
    }

    public function update(Request $request, Staff $staff): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($staff->user_id)],
            'password'   => ['nullable', 'string', 'min:8', 'confirmed'],
            'position'   => ['required', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'],
            'phone'      => ['nullable', 'string', 'max:30'],
            'joined_at'  => ['required', 'date'],
            'is_active'  => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($staff, $validated) {
            $userData = [
                'name'  => $validated['name'],
                'email' => $validated['email'],
            ];

            if (! empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            $staff->user()->update($userData);

            $staff->update([
                'position'   => $validated['position'],
                'department' => $validated['department'],
                'phone'      => $validated['phone'] ?? null,
                'joined_at'  => $validated['joined_at'],
                'is_active'  => $validated['is_active'],
            ]);
        });

        return redirect()
            ->route('staff.index')
            ->with('success', 'Data staff dan akun berhasil diperbarui.');
    }

    public function destroy(Staff $staff): RedirectResponse
    {
        DB::transaction(function () use ($staff) {
            $user = $staff->user;
            $staff->delete();
            if ($user) {
                $user->delete();
            }
        });

        return redirect()
            ->route('staff.index')
            ->with('success', 'Staff beserta akun berhasil dihapus.');
    }

    public function staff_json(Request $request): JsonResponse
    {
        $search = $request->input('search');

        $staff = Staff::query()
            ->with('user:id,name,email,role')
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