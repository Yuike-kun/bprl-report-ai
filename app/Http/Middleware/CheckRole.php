<?php

namespace App\Http\Middleware;

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
        if (! $request->user() || ! in_array($request->user()->role, $roles, true)) {
            if ($request->user()->role === 'pegawai') {
                return redirect()->route('pegawai.dashboard');
            }
            if(in_array($request->user()->role, ['admin', 'pemohon'])) {
                return redirect()->route('dashboard');
            }

            abort(403);
        }

        return $next($request);
    }
}
