<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GeneralDraftController;
use App\Http\Controllers\GenerateDocxController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return inertia('backend/dashboard');
    })->name('dashboard');
    Route::prefix('general-draft')->as('general-draft.')->group(function () {
        Route::get('/', [GeneralDraftController::class, 'index'])->name('index');
        Route::post('/store', [GeneralDraftController::class, 'store'])->name('store');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('password.update');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

Route::post('/pkkprl/analisis-ai', [GenerateDocxController::class, 'analyzeAi'])
    ->name('pkkprl.analisis-ai');
Route::post('/pkkprl/generate-docx-from-report', [GenerateDocxController::class, 'generate'])
    ->name('pkkprl.generate-docx-from-report');
Route::get('/pkkprl/download-proposal/{draftId}', [GenerateDocxController::class, 'generateFromDraft'])
    ->name('pkkprl.download-proposal');
