<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BeritaAcaraController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GeneralDraftController;
use App\Http\Controllers\GenerateDocxController;
use App\Http\Controllers\GeolocationController;
use App\Http\Controllers\KkprlProposalController;
use App\Http\Controllers\Master\ChangelogController;
use App\Http\Controllers\Master\JadwalKonsultasiController;
use App\Http\Controllers\Master\KkprlProposalMasterController;
use App\Http\Controllers\Master\LokasiKonsultasiController;
use App\Http\Controllers\Master\HolidayController;
use App\Http\Controllers\Master\PermohonanKonsultasiController;
use App\Http\Controllers\Master\TandaTanganUserController;
use App\Http\Controllers\Pegawai\DashboardController as PegawaiDashboardController;
use App\Http\Controllers\Pegawai\SignatureKonsultasiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProposalExtractionController;
use App\Http\Controllers\RequestFormController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\LogHistoryController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->prefix('api/geolocation')->group(function () {
    Route::get('/provinces', [GeolocationController::class, 'provinces'])->name('geolocation.provinces');
    Route::get('/regencies', [GeolocationController::class, 'regencies'])->name('geolocation.regencies');
    Route::get('/districts', [GeolocationController::class, 'districts'])->name('geolocation.districts');
    Route::get('/villages', [GeolocationController::class, 'villages'])->name('geolocation.villages');
});

Route::inertia('/', 'welcome')->name('home');

Route::get('/request-form', [RequestFormController::class, 'index'])->name('request-form');
Route::post('/request-form', [RequestFormController::class, 'store'])->name('request-form.store');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
});

Route::get('/kkprl', [KkprlProposalController::class, 'index_iframe'])->name('kkprl');
Route::get('/kkprl-proposal', [KkprlProposalController::class, 'create'])->name('kkprl-proposal.create');
Route::post('/kkprl-proposal', [KkprlProposalController::class, 'store'])->name('kkprl-proposal.store');
Route::get('/kkprl-proposal/{kkprlProposal}/review', [KkprlProposalController::class, 'review'])->name('kkprl-proposal.review');
Route::post('/kkprl-proposal/{kkprlProposal}/finalize', [KkprlProposalController::class, 'finalize'])->name('kkprl-proposal.finalize');

Route::middleware('auth')->group(function () {
    Route::middleware('role:admin')->prefix('master/tanda-tangan-user')->as('master.tanda-tangan-user.')->group(function () {
        Route::get('/', [TandaTanganUserController::class, 'index'])->name('index');
        Route::put('/{user}', [TandaTanganUserController::class, 'update'])->name('update');
        Route::delete('/{user}', [TandaTanganUserController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('/pegawai')->as('pegawai.')->middleware('role:pegawai')->group(function () {
        Route::get('/dashboard', [PegawaiDashboardController::class, 'index'])->name('dashboard');
        Route::prefix('signature-konsultasi')->as('signature-konsultasi.')->group(function () {
            Route::get('/', [SignatureKonsultasiController::class, 'index'])->name('index');
            Route::post('/{permohonanKonsultasi}', [SignatureKonsultasiController::class, 'signature'])->name('signature');
        });
    });

    Route::middleware('role:admin,pemohon')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::prefix('general-draft')->as('general-draft.')->middleware('role:admin,pegawai')->group(function () {
            Route::get('/', [GeneralDraftController::class, 'index'])->name('index');
            Route::get('/create', [GeneralDraftController::class, 'create'])->name('create');
            Route::post('/store', [GeneralDraftController::class, 'store'])->name('store');
            Route::get('/{generalDraft}/edit', [GeneralDraftController::class, 'edit'])->name('edit');
            Route::delete('/{generalDraft}', [GeneralDraftController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('master/lokasi-konsultasi')->as('master.lokasi-konsultasi.')->middleware('role:admin,pegawai')->group(function () {
            Route::get('/', [LokasiKonsultasiController::class, 'index'])->name('index');
            Route::get('/create', [LokasiKonsultasiController::class, 'create'])->name('create');
            Route::post('/', [LokasiKonsultasiController::class, 'store'])->name('store');
            Route::get('/{lokasiKonsultasi}/edit', [LokasiKonsultasiController::class, 'edit'])->name('edit');
            Route::put('/{lokasiKonsultasi}', [LokasiKonsultasiController::class, 'update'])->name('update');
            Route::delete('/{lokasiKonsultasi}', [LokasiKonsultasiController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('master/changelog')->as('master.changelog.')->middleware('role:admin,pegawai')->group(function () {
            Route::get('/', [ChangelogController::class, 'index'])->name('index');
            Route::get('/create', [ChangelogController::class, 'create'])->name('create');
            Route::post('/', [ChangelogController::class, 'store'])->name('store');
            Route::get('/{changelog}/edit', [ChangelogController::class, 'edit'])->name('edit');
            Route::put('/{changelog}', [ChangelogController::class, 'update'])->name('update');
            Route::delete('/{changelog}', [ChangelogController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('master/jadwal-konsultasi')->as('master.jadwal-konsultasi.')->middleware('role:admin,pegawai')->group(function () {
            Route::get('/', [JadwalKonsultasiController::class, 'index'])->name('index');
            Route::get('/create', [JadwalKonsultasiController::class, 'create'])->name('create');
            Route::post('/', [JadwalKonsultasiController::class, 'store'])->name('store');
            Route::get('/{jadwalKonsultasi}/edit', [JadwalKonsultasiController::class, 'edit'])->name('edit');
            Route::put('/{jadwalKonsultasi}', [JadwalKonsultasiController::class, 'update'])->name('update');
            Route::delete('/{jadwalKonsultasi}', [JadwalKonsultasiController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('master/hari-libur')->as('master.hari-libur.')->middleware('role:admin,pegawai')->group(function () {
            Route::get('/', [HolidayController::class, 'index'])->name('index');
            Route::get('/create', [HolidayController::class, 'create'])->name('create');
            Route::post('/', [HolidayController::class, 'store'])->name('store');
            Route::post('/import', [HolidayController::class, 'import'])->name('import');
            Route::get('/{holiday}/edit', [HolidayController::class, 'edit'])->name('edit');
            Route::put('/{holiday}', [HolidayController::class, 'update'])->name('update');
            Route::delete('/{holiday}', [HolidayController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('master/permohonan-konsultasi')->as('master.permohonan-konsultasi.')->middleware('role:admin,pegawai')->group(function () {
            Route::get('/', [PermohonanKonsultasiController::class, 'index'])->name('index');
            Route::get('/create', [RequestFormController::class, 'index'])->name('create');
            Route::get('/search', [KkprlProposalMasterController::class, 'searchPermohonanKonsultasi'])->name('search');
            Route::get('/{permohonanKonsultasi}/download-confirmation-pdf', [PermohonanKonsultasiController::class, 'downloadConfirmationPdf'])->name('download-confirmation-pdf');
            Route::get('/{permohonanKonsultasi}', [PermohonanKonsultasiController::class, 'show'])->name('show');
            Route::get('/{permohonanKonsultasi}/edit', [PermohonanKonsultasiController::class, 'edit'])->name('edit');
            Route::put('/{permohonanKonsultasi}', [PermohonanKonsultasiController::class, 'update'])->name('update');
            Route::delete('/{permohonanKonsultasi}', [PermohonanKonsultasiController::class, 'destroy'])->name('destroy');
            Route::post('/{permohonanKonsultasi}/kirim', [PermohonanKonsultasiController::class, 'assign_request'])->name('assign_request');
            Route::patch('/{permohonanKonsultasi}/confirm', [PermohonanKonsultasiController::class, 'confirm'])->name('confirm');
        });

        Route::prefix('master/kkprl-proposal')->as('master.kkprl-proposal.')->middleware('role:admin,pegawai')->group(function () {
            Route::get('/', [KkprlProposalMasterController::class, 'index'])->name('index');
            Route::get('/create', [KkprlProposalMasterController::class, 'create'])->name('create');
            Route::get('/search-berita-acara', [KkprlProposalMasterController::class, 'searchBeritaAcara'])->name('search-berita-acara');
            Route::post('/', [KkprlProposalMasterController::class, 'store'])->name('store');
            Route::get('/{kkprlProposal}', [KkprlProposalMasterController::class, 'show'])->name('show');
            Route::put('/{kkprlProposal}', [KkprlProposalMasterController::class, 'update'])->name('update');
            Route::delete('/{kkprlProposal}', [KkprlProposalMasterController::class, 'destroy'])->name('destroy');
        });
    });

    Route::middleware('role:admin,pegawai')->prefix('proposal-extractions')->as('proposal-extractions.')->group(function () {
        Route::get('/create', [ProposalExtractionController::class, 'create'])->name('create');
        Route::post('/', [ProposalExtractionController::class, 'store'])->name('store');
        Route::get('/{proposalExtraction}/edit', [ProposalExtractionController::class, 'edit'])->name('edit');
        Route::put('/{proposalExtraction}', [ProposalExtractionController::class, 'update'])->name('update');
        Route::get('/{proposalExtraction}/download', [ProposalExtractionController::class, 'download'])->name('download');
    });

    Route::prefix('berita-acara')->as('berita-acara.')->group(function () {
        Route::middleware(['auth', 'role:pegawai'])->group(function () {
            Route::get('/pegawai', [BeritaAcaraController::class, 'index_pegawai'])->name('index.pegawai');
            Route::post('/{beritaAcara}/pegawai', [BeritaAcaraController::class, 'updatePegawai'])->name('update.pegawai');
            Route::delete('/documents/{document}/pegawai', [BeritaAcaraController::class, 'destroyDocument'])->name('documents.destroy.pegawai');
        });
        Route::middleware(['auth', 'role:admin'])->group(function () {
            Route::get('/', [BeritaAcaraController::class, 'index'])->name('index');
            Route::get('/create', [BeritaAcaraController::class, 'create'])->name('create');
            Route::get('/{beritaAcara}', [BeritaAcaraController::class, 'show'])->name('show');
            Route::get('/{beritaAcara}/edit', [BeritaAcaraController::class, 'edit'])->name('edit');
            Route::put('/{beritaAcara}', [BeritaAcaraController::class, 'update'])->name('update');
            Route::patch('/{beritaAcara}/status', [BeritaAcaraController::class, 'updateStatus'])->name('update-status');
            Route::delete('/{beritaAcara}', [BeritaAcaraController::class, 'destroy'])->name('destroy');
            Route::delete('/documents/{document}', [BeritaAcaraController::class, 'destroyDocument'])->name('document.destroy');
        });
        Route::post('/', [BeritaAcaraController::class, 'store'])->name('store');
        Route::get('/{beritaAcara}/pdf', [BeritaAcaraController::class, 'pdf'])
            ->name('pdf');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('password.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');

    Route::resource('staff', StaffController::class)->except(['show']);
    Route::get('staff/json', [StaffController::class, 'staff_json'])->name('staff.json');

    Route::resource('users', UsersController::class)->middleware('role:admin');
    Route::middleware('role:admin')->group(function () {
        Route::get('/log-histories', [LogHistoryController::class, 'index'])->name('log-histories.index');
        Route::delete('/log-histories/clear', [LogHistoryController::class, 'destroyAll'])->name('log-histories.clear');
    });

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
});

Route::post('/pkkprl/analisis-ai', [GenerateDocxController::class, 'analyzeAi'])
    ->name('pkkprl.analisis-ai');
Route::post('/pkkprl/generate-docx-from-report', [GenerateDocxController::class, 'generate'])
    ->name('pkkprl.generate-docx-from-report');
Route::get('/pkkprl/download-proposal/{draftId}', [GenerateDocxController::class, 'generateFromDraft'])
    ->name('pkkprl.download-proposal');
Route::get('/pkkprl/download-kkprl-proposal/{proposalId}', [GenerateDocxController::class, 'generateFromProposal'])
    ->name('pkkprl.download-kkprl-proposal');

Route::post('/kkprl/review', [GenerateDocxController::class, 'reviewAndGenerate'])
    ->name('kkprl.review');

Route::get('/asisten', fn() => inertia('Assistant'))->name('asisten');

Route::post('/kkprl/assistant', [ProposalExtractionController::class, 'assistant'])
    ->middleware(['throttle:20,1', 'api'])
    ->name('kkprl.assistant');
