<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationApiController extends Controller
{
    /**
     * Return the latest notifications for the authenticated user
     * together with an unread count, used by the dashboard to
     * refresh in real-time without a full page reload.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->unreadNotifications()
            ->latest()
            ->take(8)
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'title'      => $n->data['title'] ?? 'Notifikasi baru',
                'message'    => $n->data['message'] ?? '',
                'url'        => $n->data['url'] ?? '/dashboard',
                'permohonan_id' => $n->data['permohonan_id'] ?? null,
                'created_at' => $n->created_at?->toIso8601String(),
            ])
            ->values();

        $unreadCount = $request->user()->unreadNotifications()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function read(Request $request, string $notification): JsonResponse
    {
        $n = $request->user()
            ->unreadNotifications()
            ->whereKey($notification)
            ->first();

        if (! $n) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan.'], 404);
        }

        $n->markAsRead();

        return response()->json([
            'message' => 'Notifikasi ditandai sebagai dibaca.',
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * Mark every notification for the user as read.
     */
    public function readAll(Request $request): JsonResponse
    {
        $request->user()
            ->unreadNotifications()
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Semua notifikasi ditandai sebagai dibaca.',
            'unread_count' => 0,
        ]);
    }
}