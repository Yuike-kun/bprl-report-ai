<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GeneralDraftController;
use App\Http\Controllers\GenerateDocxController;
use App\Http\Controllers\Master\JadwalKonsultasiController;
use App\Http\Controllers\Master\LokasiKonsultasiController;
use App\Http\Controllers\Master\PermohonanKonsultasiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RequestFormController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/request-form', [RequestFormController::class, 'index'])->name('request-form');
Route::post('/request-form', [RequestFormController::class, 'store'])->name('request-form.store');

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
        Route::get('/create', [GeneralDraftController::class, 'create'])->name('create');
        Route::post('/store', [GeneralDraftController::class, 'store'])->name('store');
        Route::get('/{generalDraft}/edit', [GeneralDraftController::class, 'edit'])->name('edit');
        Route::delete('/{generalDraft}', [GeneralDraftController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('master/lokasi-konsultasi')->as('master.lokasi-konsultasi.')->group(function () {
        Route::get('/', [LokasiKonsultasiController::class, 'index'])->name('index');
        Route::get('/create', [LokasiKonsultasiController::class, 'create'])->name('create');
        Route::post('/', [LokasiKonsultasiController::class, 'store'])->name('store');
        Route::get('/{lokasiKonsultasi}/edit', [LokasiKonsultasiController::class, 'edit'])->name('edit');
        Route::put('/{lokasiKonsultasi}', [LokasiKonsultasiController::class, 'update'])->name('update');
        Route::delete('/{lokasiKonsultasi}', [LokasiKonsultasiController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('master/jadwal-konsultasi')->as('master.jadwal-konsultasi.')->group(function () {
        Route::get('/', [JadwalKonsultasiController::class, 'index'])->name('index');
        Route::get('/create', [JadwalKonsultasiController::class, 'create'])->name('create');
        Route::post('/', [JadwalKonsultasiController::class, 'store'])->name('store');
        Route::get('/{jadwalKonsultasi}/edit', [JadwalKonsultasiController::class, 'edit'])->name('edit');
        Route::put('/{jadwalKonsultasi}', [JadwalKonsultasiController::class, 'update'])->name('update');
        Route::delete('/{jadwalKonsultasi}', [JadwalKonsultasiController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('master/permohonan-konsultasi')->as('master.permohonan-konsultasi.')->group(function () {
        Route::get('/', [PermohonanKonsultasiController::class, 'index'])->name('index');
        Route::get('/{permohonanKonsultasi}', [PermohonanKonsultasiController::class, 'show'])->name('show');
        Route::get('/{permohonanKonsultasi}/edit', [PermohonanKonsultasiController::class, 'edit'])->name('edit');
        Route::put('/{permohonanKonsultasi}', [PermohonanKonsultasiController::class, 'update'])->name('update');
        Route::delete('/{permohonanKonsultasi}', [PermohonanKonsultasiController::class, 'destroy'])->name('destroy');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('password.update');

    Route::resource('users', UsersController::class);

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

Route::post('/pkkprl/analisis-ai', [GenerateDocxController::class, 'analyzeAi'])
    ->name('pkkprl.analisis-ai');
Route::post('/pkkprl/generate-docx-from-report', [GenerateDocxController::class, 'generate'])
    ->name('pkkprl.generate-docx-from-report');
Route::get('/pkkprl/download-proposal/{draftId}', [GenerateDocxController::class, 'generateFromDraft'])
    ->name('pkkprl.download-proposal');
