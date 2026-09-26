<?php

use App\Http\Controllers\AnalisisProposalController;
use App\Http\Controllers\Api\NotificationApiController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BeritaAcaraController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EgeraiManualController;
use App\Http\Controllers\EgeraiProposalController;
use App\Http\Controllers\GeneralDraftController;
use App\Http\Controllers\GenerateDocxController;
use App\Http\Controllers\GeolocationController;
use App\Http\Controllers\KkprlProposalController;
use App\Http\Controllers\LogHistoryController;
use App\Http\Controllers\Master\ChangelogController;
use App\Http\Controllers\Master\HolidayController;
use App\Http\Controllers\Master\JadwalKonsultasiController;
use App\Http\Controllers\Master\KkprlProposalMasterController;
use App\Http\Controllers\Master\LokasiKonsultasiController;
use App\Http\Controllers\Master\PermohonanKonsultasiController;
use App\Http\Controllers\Master\TandaTanganUserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Pegawai\DashboardController as PegawaiDashboardController;
use App\Http\Controllers\Pegawai\SignatureKonsultasiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProposalExtractionController;
use App\Http\Controllers\PublicBeritaAcaraCheckController;
use App\Http\Controllers\PublicUploadSignatureController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RequestFormController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\WilayahController;
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

Route::get('/signature-upload', [PublicUploadSignatureController::class, 'index'])->name('signature-upload');
Route::post('/signature-upload', [PublicUploadSignatureController::class, 'store'])->name('signature-upload.store');

Route::get('/cek-berita-acara', [PublicBeritaAcaraCheckController::class, 'index'])->name('cek-berita-acara');
Route::get('/cek-berita-acara/{beritaAcara}/pdf', [PublicBeritaAcaraCheckController::class, 'pdf'])->name('cek-berita-acara.pdf');
Route::get('/master/permohonan-konsultasi/{permohonanKonsultasi}/download-confirmation-pdf', [PermohonanKonsultasiController::class, 'downloadConfirmationPdf'])->name('master.permohonan-konsultasi.download-confirmation-pdf');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
});

Route::get('/kkprl', [KkprlProposalController::class, 'index_iframe'])->name('kkprl');
// The public wizard (kkprl-konsultasi-form.tsx) is retired in favor of the
// egerai pipeline (upload PDFs or manual entry -> extract/enter -> review with
// live preview -> finalize), which now creates the same KkprlProposal record
// the wizard used to, so the staff master panel/dashboard/assignment workflow
// keeps working unchanged. Old bookmarks/links to the wizard just land here.
Route::get('/kkprl-proposal', fn () => redirect()->route('egerai.create'))->name('kkprl-proposal.create');
Route::get('/kkprl-proposal/{kkprlProposal}/review', [KkprlProposalController::class, 'review'])->name('kkprl-proposal.review');
Route::post('/kkprl-proposal/{kkprlProposal}/finalize', [KkprlProposalController::class, 'finalize'])->name('kkprl-proposal.finalize');

// Faithful 1:1 port of the reference e-GeRAI Python app's core pipeline:
// upload 2 PDFs -> extract (regex + AI fallback) -> review/correct -> finalize -> download.
Route::prefix('egerai')->as('egerai.')->group(function () {
    Route::get('/', [EgeraiProposalController::class, 'create'])->name('create');
    Route::post('/', [EgeraiProposalController::class, 'store'])->name('store');
    Route::get('/{egeraiJob}/review', [EgeraiProposalController::class, 'review'])->name('review');
    Route::put('/{egeraiJob}/review', [EgeraiProposalController::class, 'update'])->name('update');
    Route::get('/{egeraiJob}/download', [EgeraiProposalController::class, 'download'])->name('download');
    // Experimental: same final document, but built by the standalone e-GerAI
    // Python API instead of the local ProposalDocumentGenerator. See
    // EgeraiProposalController::generateViaExternalApi().
    Route::get('/{egeraiJob}/download-api', [EgeraiProposalController::class, 'generateViaExternalApi'])->name('download-api');
    Route::get('/{egeraiJob}/image/{type}/{filename}', [EgeraiProposalController::class, 'image'])->name('image');
});

// Manual entry variant (no source PDF): faithful port of the reference app's
// /proposal-manual, /proposal-manual/simpan, /proposal-manual/draft routes,
// feeding the same EgeraiJob/review/finalize pipeline above.
Route::get('/proposal-manual', [EgeraiManualController::class, 'create'])->name('proposal-manual.create');
Route::post('/proposal-manual', [EgeraiManualController::class, 'store'])->name('proposal-manual.store');
Route::post('/proposal-manual/simpan', [EgeraiManualController::class, 'simpan'])->name('proposal-manual.simpan');
Route::post('/proposal-manual/draft', [EgeraiManualController::class, 'draft'])->name('proposal-manual.draft');

Route::prefix('api/wilayah')->as('api.wilayah.')->group(function () {
    Route::get('/regencies/{provinceCode}', [WilayahController::class, 'regencies'])->name('regencies');
    Route::get('/districts/{regencyCode}', [WilayahController::class, 'districts'])->name('districts');
    Route::get('/villages/{districtCode}', [WilayahController::class, 'villages'])->name('villages');
});

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
    });

    // NOTE: these must NOT be nested inside the 'role:admin,pemohon' group above —
    // pegawai users need access to them, and stacking that outer role check on top
    // of these routes' own 'role:admin,pegawai' middleware would reject pegawai
    // before their own middleware ever runs (both checks apply when nested).
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
        Route::get('/download-template', [ChangelogController::class, 'downloadTemplate'])->name('download-template');
        Route::post('/import', [ChangelogController::class, 'importMd'])->name('import');
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

    Route::middleware('role:admin,pegawai')->prefix('proposal-extractions')->as('proposal-extractions.')->group(function () {
        Route::get('/create', [ProposalExtractionController::class, 'create'])->name('create');
        Route::post('/', [ProposalExtractionController::class, 'store'])->name('store');
        Route::get('/{proposalExtraction}/edit', [ProposalExtractionController::class, 'edit'])->name('edit');
        Route::put('/{proposalExtraction}', [ProposalExtractionController::class, 'update'])->name('update');
        Route::get('/{proposalExtraction}/download', [ProposalExtractionController::class, 'download'])->name('download');
    });

    // "Analisis & Koreksi Proposal": proxies straight to the external
    // e-GerAI API's /api/v1/analisis/* endpoints (see EgeraiApiClient) —
    // no local extraction/generation pipeline like /egerai has.
    Route::middleware('role:admin,pegawai')->prefix('analisis-proposal')->as('analisis-proposal.')->group(function () {
        Route::get('/', [AnalisisProposalController::class, 'create'])->name('create');
        Route::post('/', [AnalisisProposalController::class, 'store'])->name('store');
        Route::post('/unduh', [AnalisisProposalController::class, 'unduh'])->name('unduh');
        Route::post('/simpan', [AnalisisProposalController::class, 'simpan'])->name('simpan');
        Route::get('/riwayat', [AnalisisProposalController::class, 'riwayat'])->name('riwayat');
        Route::get('/riwayat/{entryId}', [AnalisisProposalController::class, 'riwayatShow'])->name('riwayat.show');
        Route::get('/riwayat/{entryId}/unduh', [AnalisisProposalController::class, 'riwayatUnduh'])->name('riwayat.unduh');
        Route::delete('/riwayat/{entryId}', [AnalisisProposalController::class, 'riwayatHapus'])->name('riwayat.destroy');
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
    });

    Route::get('/berita-acara/{beritaAcara}/pdf', [BeritaAcaraController::class, 'pdf'])
        ->name('berita-acara.pdf');

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

    Route::middleware('role:admin,pegawai')->prefix('documents')->as('documents.')->group(function () {
        Route::get('/', [DocumentController::class, 'index'])->name('index');
        Route::get('/download/{source}/{id}', [DocumentController::class, 'download'])->name('download');
        Route::delete('/{source}/{id}', [DocumentController::class, 'destroy'])->name('destroy');
    });

    Route::middleware('role:admin,pegawai,pemohon')->prefix('reports')->as('reports.')->group(function () {
        Route::get('/permohonan-konsultasi', [ReportController::class, 'permohonanReport'])->name('permohonan-konsultasi');
        Route::get('/permohonan-konsultasi/export-csv', [ReportController::class, 'exportPermohonanCsv'])->name('permohonan-konsultasi.export-csv');
        Route::get('/berita-acara', [ReportController::class, 'beritaAcaraReport'])->name('berita-acara');
        Route::get('/berita-acara/export-csv', [ReportController::class, 'exportBeritaAcaraCsv'])->name('berita-acara.export-csv');
        Route::get('/berita-acara/export-xlsx', [ReportController::class, 'exportBeritaAcaraXlsx'])->name('berita-acara.export-xlsx');
        Route::get('/kkprl-proposal', [ReportController::class, 'kkprlProposalReport'])->name('kkprl-proposal');
        Route::get('/kkprl-proposal/export-csv', [ReportController::class, 'exportKkprlProposalCsv'])->name('kkprl-proposal.export-csv');
    });

    Route::middleware('role:pegawai,admin,pemohon')->prefix('master/reports')->as('master.reports.')->group(function () {
        Route::get('/permohonan-konsultasi', [ReportController::class, 'permohonanReport']);
        Route::get('/permohonan-konsultasi/export-csv', [ReportController::class, 'exportPermohonanCsv']);
        Route::get('/berita-acara', [ReportController::class, 'beritaAcaraReport']);
        Route::get('/berita-acara/export-csv', [ReportController::class, 'exportBeritaAcaraCsv']);
        Route::get('/berita-acara/export-xlsx', [ReportController::class, 'exportBeritaAcaraXlsx']);
    });

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    // Real-time notification polling endpoints (JSON, no Inertia render)
    Route::middleware('auth')->prefix('api/notifications')->as('api.notifications.')->group(function () {
        Route::get('/', [NotificationApiController::class, 'index'])->name('index');
        Route::post('/read-all', [NotificationApiController::class, 'readAll'])->name('read-all');
        Route::post('/{notification}/read', [NotificationApiController::class, 'read'])->name('read');
    });
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

// Chat itself is now served directly from the browser by the external
// e-GerAI Asisten API (see resources/js/pages/Assistant.tsx); no backend
// proxy route is needed here anymore.
Route::get('/asisten', fn () => inertia('Assistant'))->name('asisten');
