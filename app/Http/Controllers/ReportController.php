<?php

namespace App\Http\Controllers;

use App\Models\BeritaAcaraKonsultasi;
use App\Models\KkprlProposal;
use App\Models\PermohonanKonsultasi;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Display Permohonan Konsultasi Report Dashboard.
     */
    public function permohonanReport(Request $request): Response
    {
        $year = (int) $request->query('year', date('Y'));
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $status = $request->query('status');
        $search = trim((string) $request->query('search', ''));

        // Query builder for filtering table records
        $query = PermohonanKonsultasi::query()
            ->with(['jadwal.lokasi', 'kabupaten', 'provinsi', 'assign_to_staff.Staff.user']);

        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner->where('nama_pemohon', 'like', "%{$search}%")
                    ->orWhere('instansi', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('rencana_kegiatan', 'like', "%{$search}%");
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        if (! $dateFrom && ! $dateTo && $year) {
            $query->whereYear('created_at', $year);
        }

        $submissions = (clone $query)->latest()->paginate(15)->withQueryString();

        // Key metrics calculation
        $totalCount = PermohonanKonsultasi::count();
        $approvedCount = PermohonanKonsultasi::whereIn('status', ['disetujui', 'approved', 'selesai'])->count();
        $pendingCount = PermohonanKonsultasi::whereIn('status', ['menunggu', 'pending'])->count();
        $rejectedCount = PermohonanKonsultasi::whereIn('status', ['ditolak', 'rejected'])->count();
        $baCount = PermohonanKonsultasi::where('status', 'berita_acara')->count();

        // Monthly trends for selected year
        $monthlyCategories = [];
        $monthlyCounts = [];
        for ($m = 1; $m <= 12; $m++) {
            $dt = Carbon::createFromDate($year, $m, 1);
            $monthlyCategories[] = $dt->translatedFormat('M');
            $monthlyCounts[] = PermohonanKonsultasi::whereYear('created_at', $year)
                ->whereMonth('created_at', $m)
                ->count();
        }

        // Status breakdown
        $statusBreakdown = [
            'Menunggu' => $pendingCount,
            'Disetujui' => $approvedCount,
            'Berita Acara' => $baCount,
            'Ditolak' => $rejectedCount,
        ];

        // Available years dropdown list
        $availableYears = PermohonanKonsultasi::selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->pluck('year')
            ->filter()
            ->map(fn ($y) => (int) $y)
            ->toArray();

        $currentYear = (int) date('Y');
        if (empty($availableYears)) {
            $availableYears = [$currentYear];
        } else {
            if (! in_array($currentYear, $availableYears, true)) {
                $availableYears[] = $currentYear;
            }
            rsort($availableYears);
        }

        return Inertia::render('backend/reports/permohonan-konsultasi', [
            'submissions' => $submissions,
            'filters' => [
                'year' => $year,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'status' => $status,
                'search' => $search,
            ],
            'stats' => [
                'total' => $totalCount,
                'approved' => $approvedCount,
                'pending' => $pendingCount,
                'rejected' => $rejectedCount,
                'berita_acara' => $baCount,
            ],
            'charts' => [
                'monthly' => [
                    'categories' => $monthlyCategories,
                    'series' => [
                        ['name' => 'Jumlah Permohonan', 'data' => $monthlyCounts],
                    ],
                ],
                'status' => $statusBreakdown,
            ],
            'availableYears' => $availableYears,
        ]);
    }

    /**
     * Export Permohonan Konsultasi Report to CSV.
     */
    public function exportPermohonanCsv(Request $request): StreamedResponse
    {
        $year = (int) $request->query('year', date('Y'));
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $status = $request->query('status');
        $search = trim((string) $request->query('search', ''));

        $query = PermohonanKonsultasi::query();

        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner->where('nama_pemohon', 'like', "%{$search}%")
                    ->orWhere('instansi', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('rencana_kegiatan', 'like', "%{$search}%");
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        if (! $dateFrom && ! $dateTo && $year) {
            $query->whereYear('created_at', $year);
        }

        $records = $query->latest()->get();

        $filename = 'Laporan_Permohonan_Konsultasi_'.now()->format('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($records) {
            $handle = fopen('php://output', 'w');

            // BOM for UTF-8 Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, [
                'No',
                'ID Permohonan',
                'Tanggal Pengajuan',
                'Nama Pemohon',
                'Jabatan',
                'Perusahaan / Instansi',
                'Email',
                'Nomor Telepon',
                'Rencana Kegiatan',
                'Status',
            ]);

            foreach ($records as $index => $row) {
                fputcsv($handle, [
                    $index + 1,
                    'REQ-'.str_pad((string) $row->id, 5, '0', STR_PAD_LEFT),
                    $row->created_at ? $row->created_at->format('d/m/Y H:i') : '-',
                    $row->nama_pemohon ?? '-',
                    $row->jabatan_pemohon ?? '-',
                    $row->instansi ?? '-',
                    $row->email ?? '-',
                    $row->nomor_telepon ?? '-',
                    $row->rencana_kegiatan ?? '-',
                    strtoupper((string) $row->status),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Display Berita Acara Report Dashboard.
     */
    public function beritaAcaraReport(Request $request): Response
    {
        $year = (int) $request->query('year', date('Y'));
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $search = trim((string) $request->query('search', ''));

        $query = BeritaAcaraKonsultasi::query()
            ->with(['request_form', 'staff1.user', 'staff2.user']);

        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner->where('berita_acara_number', 'like', "%{$search}%")
                    ->orWhere('requester_name', 'like', "%{$search}%")
                    ->orWhere('legal_entity_name', 'like', "%{$search}%")
                    ->orWhere('activity_type', 'like', "%{$search}%");
            });
        }

        if ($dateFrom) {
            $query->whereDate('consultation_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('consultation_date', '<=', $dateTo);
        }

        if (! $dateFrom && ! $dateTo && $year) {
            $query->whereYear('consultation_date', $year);
        }

        $records = (clone $query)->latest('consultation_date')->paginate(15)->withQueryString();

        // Key Metrics
        $totalCount = BeritaAcaraKonsultasi::count();
        $thisMonthCount = BeritaAcaraKonsultasi::whereMonth('consultation_date', date('m'))
            ->whereYear('consultation_date', date('Y'))
            ->count();
        $thisYearCount = BeritaAcaraKonsultasi::whereYear('consultation_date', date('Y'))->count();

        // Monthly trends for selected year
        $monthlyCategories = [];
        $monthlyCounts = [];
        for ($m = 1; $m <= 12; $m++) {
            $dt = Carbon::createFromDate($year, $m, 1);
            $monthlyCategories[] = $dt->translatedFormat('M');
            $monthlyCounts[] = BeritaAcaraKonsultasi::whereYear('consultation_date', $year)
                ->whereMonth('consultation_date', $m)
                ->count();
        }

        // Available years
        $availableYears = BeritaAcaraKonsultasi::selectRaw('YEAR(consultation_date) as year')
            ->distinct()
            ->pluck('year')
            ->filter()
            ->map(fn ($y) => (int) $y)
            ->toArray();

        $currentYear = (int) date('Y');
        if (empty($availableYears)) {
            $availableYears = [$currentYear];
        } else {
            if (! in_array($currentYear, $availableYears, true)) {
                $availableYears[] = $currentYear;
            }
            rsort($availableYears);
        }

        return Inertia::render('backend/reports/berita-acara', [
            'records' => $records,
            'filters' => [
                'year' => $year,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'search' => $search,
            ],
            'stats' => [
                'total' => $totalCount,
                'this_month' => $thisMonthCount,
                'this_year' => $thisYearCount,
            ],
            'charts' => [
                'monthly' => [
                    'categories' => $monthlyCategories,
                    'series' => [
                        ['name' => 'Berita Acara Diterbitkan', 'data' => $monthlyCounts],
                    ],
                ],
            ],
            'availableYears' => $availableYears,
        ]);
    }

    /**
     * Export Berita Acara Report to CSV.
     */
    public function exportBeritaAcaraCsv(Request $request): StreamedResponse
    {
        $year = (int) $request->query('year', date('Y'));
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $search = trim((string) $request->query('search', ''));

        $query = BeritaAcaraKonsultasi::query()->with(['staff1.user']);

        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner->where('berita_acara_number', 'like', "%{$search}%")
                    ->orWhere('requester_name', 'like', "%{$search}%")
                    ->orWhere('legal_entity_name', 'like', "%{$search}%")
                    ->orWhere('activity_type', 'like', "%{$search}%");
            });
        }

        if ($dateFrom) {
            $query->whereDate('consultation_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('consultation_date', '<=', $dateTo);
        }

        if (! $dateFrom && ! $dateTo && $year) {
            $query->whereYear('consultation_date', $year);
        }

        $records = $query->latest('consultation_date')->get();

        $filename = 'Laporan_Berita_Acara_'.now()->format('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($records) {
            $handle = fopen('php://output', 'w');

            // BOM for UTF-8 Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, [
                'No',
                'Nomor Berita Acara',
                'Tanggal Konsultasi',
                'Nama Pemohon',
                'Jabatan',
                'Perusahaan / Instansi',
                'Email',
                'Jenis Kegiatan',
                'Lokasi / Perairan',
                'Petugas Pendamping',
                'Status',
            ]);

            foreach ($records as $index => $row) {
                fputcsv($handle, [
                    $index + 1,
                    $row->berita_acara_number ?? '-',
                    $row->consultation_date ? $row->consultation_date->format('d/m/Y') : '-',
                    $row->requester_name ?? '-',
                    $row->requester_position ?? '-',
                    $row->legal_entity_name ?? '-',
                    $row->contact_email ?? '-',
                    $row->activity_type ?? '-',
                    $row->water_name ?? $row->location ?? '-',
                    $row->staff1?->user?->name ?? '-',
                    strtoupper((string) ($row->status ?? 'Draft')),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Build the filtered KkprlProposal query shared by the report page and CSV export.
     */
    private function kkprlProposalQuery(Request $request)
    {
        $year = (int) $request->query('year', date('Y'));
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $search = trim((string) $request->query('search', ''));
        $province = $request->query('province');

        $query = KkprlProposal::query();

        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner->where('applicant_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('activity_type', 'like', "%{$search}%");
            });
        }

        if ($province && $province !== 'all') {
            $query->where('province', $province);
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        if (! $dateFrom && ! $dateTo && $year) {
            $query->whereYear('created_at', $year);
        }

        return $query;
    }

    /**
     * Display Proposal KKPRL Report Dashboard.
     *
     * Note: KkprlProposal::status is not used here — it always defaults to
     * 'dikirim' at creation and is never updated anywhere in the app, so it
     * carries no real signal. `activity_status` (Eksisting/Rencana/Eksisting
     * dan Pengembangan) is used instead for the breakdown chart.
     */
    public function kkprlProposalReport(Request $request): Response
    {
        $year = (int) $request->query('year', date('Y'));
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $search = trim((string) $request->query('search', ''));
        $province = $request->query('province');

        $submissions = $this->kkprlProposalQuery($request)
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // Key metrics calculation
        $totalCount = KkprlProposal::count();
        $investmentTotal = (float) KkprlProposal::sum('investment_value');
        $localWorkersTotal = (int) KkprlProposal::sum('local_workers');
        $foreignWorkersTotal = (int) KkprlProposal::sum('foreign_workers');
        $reclamationCount = KkprlProposal::where('is_reclamation', true)->count();
        $businessCount = KkprlProposal::where('is_business_activity', true)->count();

        // Monthly trends for selected year
        $monthlyCategories = [];
        $monthlyCounts = [];
        for ($m = 1; $m <= 12; $m++) {
            $dt = Carbon::createFromDate($year, $m, 1);
            $monthlyCategories[] = $dt->translatedFormat('M');
            $monthlyCounts[] = KkprlProposal::whereYear('created_at', $year)
                ->whereMonth('created_at', $m)
                ->count();
        }

        // Activity status breakdown (Eksisting / Rencana / Eksisting dan Pengembangan)
        $activityStatusBreakdown = KkprlProposal::query()
            ->selectRaw('activity_status, count(*) as count')
            ->groupBy('activity_status')
            ->get()
            ->mapWithKeys(fn ($row) => [blank($row->activity_status) ? 'Belum diisi' : $row->activity_status => $row->count])
            ->toArray();

        // Ecosystem presence counts
        $ecosystemCounts = [
            'Mangrove' => KkprlProposal::where('has_mangrove', true)->count(),
            'Lamun' => KkprlProposal::where('has_seagrass', true)->count(),
            'Terumbu Karang' => KkprlProposal::where('has_coral_reef', true)->count(),
        ];

        // Top 5 provinces by proposal count
        $topProvinces = KkprlProposal::query()
            ->selectRaw('province, count(*) as count')
            ->groupBy('province')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->mapWithKeys(fn ($row) => [blank($row->province) ? 'Belum diisi' : $row->province => $row->count])
            ->toArray();

        // Distinct provinces for the filter dropdown
        $provinces = KkprlProposal::query()
            ->whereNotNull('province')
            ->where('province', '!=', '')
            ->distinct()
            ->orderBy('province')
            ->pluck('province')
            ->toArray();

        // Available years dropdown list
        $availableYears = KkprlProposal::selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->pluck('year')
            ->filter()
            ->map(fn ($y) => (int) $y)
            ->toArray();

        $currentYear = (int) date('Y');
        if (empty($availableYears)) {
            $availableYears = [$currentYear];
        } else {
            if (! in_array($currentYear, $availableYears, true)) {
                $availableYears[] = $currentYear;
            }
            rsort($availableYears);
        }

        return Inertia::render('backend/reports/kkprl-proposal', [
            'submissions' => $submissions,
            'filters' => [
                'year' => $year,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'search' => $search,
                'province' => $province,
            ],
            'stats' => [
                'total' => $totalCount,
                'investment_total' => $investmentTotal,
                'local_workers_total' => $localWorkersTotal,
                'foreign_workers_total' => $foreignWorkersTotal,
                'reclamation_count' => $reclamationCount,
                'business_count' => $businessCount,
            ],
            'charts' => [
                'monthly' => [
                    'categories' => $monthlyCategories,
                    'series' => [
                        ['name' => 'Jumlah Proposal', 'data' => $monthlyCounts],
                    ],
                ],
                'activityStatus' => $activityStatusBreakdown,
                'ecosystem' => $ecosystemCounts,
                'topProvinces' => $topProvinces,
            ],
            'availableYears' => $availableYears,
            'provinces' => $provinces,
        ]);
    }

    /**
     * Export Proposal KKPRL Report to CSV.
     */
    public function exportKkprlProposalCsv(Request $request): StreamedResponse
    {
        $records = $this->kkprlProposalQuery($request)->latest()->get();

        $filename = 'Laporan_Proposal_KKPRL_'.now()->format('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($records) {
            $handle = fopen('php://output', 'w');

            // BOM for UTF-8 Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, [
                'No',
                'Nama Pemohon',
                'Jabatan',
                'Perusahaan / Instansi',
                'Email',
                'Jenis Kegiatan',
                'Lokasi',
                'Nama Perairan',
                'Luas Area',
                'Reklamasi',
                'Berusaha',
                'Strategis Nasional',
                'Investasi',
                'TK Lokal',
                'TK Asing',
                'Mangrove',
                'Lamun',
                'Terumbu Karang',
                'Tanggal Dibuat',
            ]);

            foreach ($records as $index => $row) {
                $lokasi = implode(', ', array_filter([
                    $row->village,
                    $row->district,
                    $row->regency,
                    $row->province,
                ]));

                fputcsv($handle, [
                    $index + 1,
                    $row->applicant_name ?? '-',
                    $row->applicant_position ?? '-',
                    $row->company_name ?? '-',
                    $row->email ?? '-',
                    $row->activity_type ?? '-',
                    $lokasi !== '' ? $lokasi : '-',
                    $row->water_name ?? '-',
                    $row->area_size ?? '-',
                    $row->is_reclamation ? 'Ya' : 'Tidak',
                    $row->is_business_activity ? 'Ya' : 'Tidak',
                    $row->is_national_strategic ? 'Ya' : 'Tidak',
                    $row->investment_value ?? '-',
                    $row->local_workers ?? '-',
                    $row->foreign_workers ?? '-',
                    $row->has_mangrove ? 'Ya' : 'Tidak',
                    $row->has_seagrass ? 'Ya' : 'Tidak',
                    $row->has_coral_reef ? 'Ya' : 'Tidak',
                    $row->created_at ? $row->created_at->format('d/m/Y H:i') : '-',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
