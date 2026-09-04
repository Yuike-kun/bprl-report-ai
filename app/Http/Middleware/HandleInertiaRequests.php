<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'notifications' => fn () => $request->user()?->unreadNotifications()
                ->latest()
                ->take(8)
                ->get()
                ->map(fn ($notification) => [
                    'id' => $notification->id,
                    'title' => $notification->data['title'] ?? 'Notifikasi baru',
                    'message' => $notification->data['message'] ?? '',
                    'url' => $notification->data['url'] ?? '/dashboard',
                    'created_at' => $notification->created_at?->toIso8601String(),
                ])
                ->values(),
            'flash' => [
                'success'      => fn () => $request->session()->get('success'),
                'error'        => fn () => $request->session()->get('error'),
                'document_url' => fn () => $request->session()->get('document_url'),
            ],
        ];
    }
}
