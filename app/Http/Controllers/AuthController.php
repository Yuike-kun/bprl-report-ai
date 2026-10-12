<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show the login form.
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/login');
    }

    /**
     * Handle login request.
     */
    public function login(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'login' => ['required', 'string', 'max:255'],
            'password' => ['required'],
        ]);

        $login = trim($validated['login']);

        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            $credentials = ['email' => $login, 'password' => $validated['password']];
        } else {
            // Non-email identifiers resolve against the `users.name`
            // column (the username) and the `staff.nip` column. Neither is
            // guaranteed unique on its own, so only proceed when both
            // lookups together point at exactly one account — otherwise
            // reject rather than pick an account arbitrarily.
            $userIds = User::where('name', $login)->pluck('id')
                ->merge(Staff::where('nip', $login)->pluck('user_id'))
                ->unique()
                ->values();

            if ($userIds->count() !== 1) {
                return $this->failedLogin();
            }

            $credentials = ['email' => User::whereKey($userIds->first())->value('email'), 'password' => $validated['password']];
        }

        $remember = $request->boolean('remember');

        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();

            $user = Auth::user();
            $user->update([
                'last_login_at' => now(),
                'last_active_at' => now(),
            ]);

            if ($user->role === 'pemohon') {
                return redirect()->intended(route('dashboard'));
            }
            if ($user->role === 'pegawai') {
                return redirect()->intended(route('pegawai.dashboard'));
            }

            return redirect()->intended(route('dashboard'));
        }

        return $this->failedLogin();
    }

    /**
     * Generic failed-login response (same message whether the identifier
     * or the password was wrong, so account existence is not leaked).
     */
    private function failedLogin(): RedirectResponse
    {
        return back()->withErrors([
            'login' => 'Email/username atau password yang Anda masukkan salah.',
        ])->onlyInput('login');
    }

    /**
     * Handle logout request.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
