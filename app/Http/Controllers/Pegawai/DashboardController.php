<?php

namespace App\Http\Controllers\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\KkprlProposal;
use App\Models\PermohonanKonsultasi;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Total Metrics for Admin & Petugas
        $totalPemohon = User::where('role', 'pemohon')->count();
        if ($totalPemohon === 0) {
            $totalPemohon = User::count();
        }

        $totalBeritaAcara = PermohonanKonsultasi::count();
        $totalProposal = KkprlProposal::count();
        $quotaAi = 1600; // Configured / static quota

        // 2. Chart Monthly Data (Last 6 Months)
        $chartMonthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $year = $date->year;
            $month = $date->month;
            $monthLabel = $date->format('M');

            $pemohonCount = User::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count();

            $baCount = PermohonanKonsultasi::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count();

            $proposalCount = KkprlProposal::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count();

            $chartMonthlyData[] = [
                'month' => $monthLabel,
                'Pemohon' => $pemohonCount,
                'BeritaAcara' => $baCount,
                'Proposal' => $proposalCount,
            ];
        }

        // 3. Petugas Tasks
        $pendingReviewsCount = PermohonanKonsultasi::whereIn('status', ['pending', 'diproses', 'menunggu_verifikasi'])->count();
        $proposalsToProcessCount = KkprlProposal::whereIn('status', ['pending', 'diproses', 'draft'])->count();
        $todayConsultationCount = PermohonanKonsultasi::whereDate('created_at', Carbon::today())->count();
        $evaluatedCount = PermohonanKonsultasi::whereIn('status', ['disetujui', 'selesai', 'approved'])->count();

        $recentTasks = PermohonanKonsultasi::latest()
            ->whereHas('assign_to_staff', function ($query) use ($user) {
                $query->where('staff', $user->staff->id);
            })
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'pemohon' => $item->nama_pemohon ?? $item->nama ?? 'Pemohon #'.$item->id,
                    'tipe' => $item->layanan ?? 'Permohonan Konsultasi',
                    'tgl' => $item->created_at ? $item->created_at->format('d M Y') : '-',
                    'status' => ucfirst($item->status ?? 'Menunggu Verifikasi'),
                    'color' => $item->status === 'disetujui' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
                ];
            });

        // 4. Pemohon Specific Stats & List
        $userProposals = KkprlProposal::latest()->get();
        $userConsultations = PermohonanKonsultasi::latest()->get();

        $pemohonTotal = $userProposals->count() + $userConsultations->count();
        $pemohonInReview = $userProposals->whereIn('status', ['pending', 'diproses'])->count() + $userConsultations->whereIn('status', ['pending', 'diproses'])->count();
        $pemohonApproved = $userProposals->whereIn('status', ['disetujui', 'approved', 'selesai'])->count() + $userConsultations->whereIn('status', ['disetujui', 'approved', 'selesai'])->count();
        $pemohonRejected = $userProposals->whereIn('status', ['ditolak', 'rejected'])->count() + $userConsultations->whereIn('status', ['ditolak', 'rejected'])->count();

        $pemohonRecentSubmissions = $userProposals->take(3)->map(function ($p) {
            return [
                'code' => 'PROPOSAL-'.$p->id,
                'title' => $p->judul_kegiatan ?? 'Proposal KKPRL #'.$p->id,
                'date' => $p->created_at ? $p->created_at->format('d M Y') : '-',
                'status' => ucfirst($p->status ?? 'Sedang Evaluasi'),
                'statusBg' => $p->status === 'disetujui' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
            ];
        });

        return Inertia::render('backend/pegawai/dashboard', [
            'dashboardData' => [
                'stats' => [
                    'totalPemohon' => $totalPemohon,
                    'totalBeritaAcara' => $totalBeritaAcara,
                    'totalProposal' => $totalProposal,
                    'quotaAi' => $quotaAi,
                ],
                'chartMonthlyData' => $chartMonthlyData,
                'petugas' => [
                    'pendingReviews' => $pendingReviewsCount,
                    'proposalsToProcess' => $proposalsToProcessCount,
                    'todayConsultation' => $todayConsultationCount,
                    'evaluated' => $evaluatedCount,
                    'recentTasks' => $recentTasks,
                ],
                'pemohon' => [
                    'total' => $pemohonTotal,
                    'inReview' => $pemohonInReview,
                    'approved' => $pemohonApproved,
                    'rejected' => $pemohonRejected,
                    'recentSubmissions' => $pemohonRecentSubmissions,
                ],
            ],
        ]);
    }
}
