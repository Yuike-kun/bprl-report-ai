<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return $request->expectsJson()
                ? abort(401, 'Unauthenticated.')
                : redirect()->route('login');
        }

        // Super admin has full access to all role-gated routes.
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        if (! in_array($user->role, $roles, true)) {
            if ($user->hasRole([User::ROLE_ADMIN, User::ROLE_PEMOHON])) {
                return redirect()->route('dashboard');
            }
            if ($user->hasRole(User::ROLE_PEGAWAI)) {
                return redirect()->route('pegawai.dashboard');
            }

            abort(403);
        }

        return $next($request);
    }
}
