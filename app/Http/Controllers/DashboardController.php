<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Models\KkprlProposal;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\PermohonanKonsultasi;
use App\Models\BeritaAcaraKonsultasi;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Total Metrics for Admin & Petugas
        $totalPemohon = PermohonanKonsultasi::count();
        $totalBeritaAcara = BeritaAcaraKonsultasi::count();
        $totalProposal = KkprlProposal::count();
        $quotaAi = 1600; // Configured / static quota

        // 2. Chart Monthly Data (Last 6 Months)
        $chartMonthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $year = $date->year;
            $month = $date->month;
            $monthLabel = $date->format('M');

            $pemohonCount = PermohonanKonsultasi::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count();

            $baCount = BeritaAcaraKonsultasi::whereYear('created_at', $year)
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

        $loginHistory = User::orderBy('last_login_at', 'desc')
            ->take(12)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'avatar' => $u->avatar,
                    'last_login_at' => $u->last_login_at ? $u->last_login_at->toIso8601String() : null,
                    'is_online' => $u->last_active_at && $u->last_active_at->diffInMinutes(now()) < 5,
                ];
            });

        return Inertia::render('backend/dashboard', [
            'dashboardData' => [
                'stats' => [
                    'totalPemohon' => $totalPemohon,
                    'totalBeritaAcara' => $totalBeritaAcara,
                    'totalProposal' => $totalProposal,
                    'quotaAi' => $quotaAi,
                ],
                'chartMonthlyData' => $chartMonthlyData,
                'loginHistory' => $loginHistory,
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
