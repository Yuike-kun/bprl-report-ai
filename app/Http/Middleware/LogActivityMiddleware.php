<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\LogHistory;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class LogActivityMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        try {
            $this->logRequest($request);
        } catch (\Throwable $e) {
            // Silently log error to not break the application flow
            logger()->error('Failed to log activity: ' . $e->getMessage());
        }

        return $response;
    }

    /**
     * Log the request details.
     */
    protected function logRequest(Request $request): void
    {
        // Don't log api/geolocation routes or debugbar
        if ($request->is('api/*') || $request->is('_debugbar/*')) {
            return;
        }

        $method = $request->method();

        if ($method === 'GET') {
            // Only log GET requests that are Inertia or HTML pages
            if ($request->expectsJson() && !$request->hasHeader('X-Inertia')) {
                return;
            }

            // Exclude static files and assets
            if (preg_match('/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|otf|map|docx|pdf)$/i', $request->path())) {
                return;
            }

            // Don't log index_iframe or minor frame URLs if any
            if ($request->is('kkprl')) {
                return;
            }
        }

        $user = Auth::user();
        if ($user) {
            if (!$user->last_active_at || $user->last_active_at->diffInMinutes(now()) >= 1) {
                $user->update(['last_active_at' => now()]);
            }
        }
        $username = $user ? $user->name . ' (' . $user->email . ')' : 'Guest';
        $userId = $user ? $user->id : null;

        $activity = $this->getActivityDescription($request);

        if (!$activity) {
            return;
        }

        LogHistory::create([
            'user_id' => $userId,
            'username' => $username,
            'ip_address' => $request->ip(),
            'browser' => $request->header('User-Agent'),
            'activity' => $activity,
        ]);
    }

    /**
     * Get a human-readable activity description.
     */
    protected function getActivityDescription(Request $request): ?string
    {
        $method = $request->method();
        $path = '/' . ltrim($request->path(), '/');
        $routeName = $request->route()?->getName();

        if ($routeName) {
            switch ($routeName) {
                case 'login':
                    return $method === 'POST' ? 'Submitted login credentials' : 'Visited Login Page';
                case 'logout':
                    return 'Logged out';
                case 'dashboard':
                    return 'Visited Dashboard';
                case 'pegawai.dashboard':
                    return 'Visited Pegawai Dashboard';
                case 'home':
                    return 'Visited Welcome Page';
                case 'request-form':
                    return 'Visited Request Form Page';
                case 'request-form.store':
                    return 'Submitted Request Form';
                case 'users.index':
                    return 'Visited Users Management Page';
                case 'users.create':
                    return 'Visited Create User Page';
                case 'users.store':
                    return 'Created a new user';
                case 'users.edit':
                    return 'Visited Edit User Page';
                case 'users.update':
                    return 'Updated user details';
                case 'users.destroy':
                    return 'Deleted a user';
                case 'profile.edit':
                    return 'Visited Profile Settings Page';
                case 'profile.update':
                    return 'Updated Profile information';
                case 'profile.avatar':
                    return 'Uploaded a new avatar';
                case 'password.update':
                    return 'Updated user password';
            }
        }

        // Generic activity descriptors
        $action = 'Accessed';
        if ($method === 'POST') {
            $action = 'Submitted form / created resource on';
        } elseif ($method === 'PUT' || $method === 'PATCH') {
            $action = 'Updated resource on';
        } elseif ($method === 'DELETE') {
            $action = 'Deleted resource on';
        }

        return "{$action} {$path} [{$method}]";
    }
}
