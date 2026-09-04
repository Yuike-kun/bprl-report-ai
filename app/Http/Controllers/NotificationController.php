<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markAsRead(Request $request, string $notification): RedirectResponse
    {
        $request->user()
            ->unreadNotifications()
            ->whereKey($notification)
            ->firstOrFail()
            ->markAsRead();

        return back();
    }
}
