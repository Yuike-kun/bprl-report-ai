<?php

namespace App\Http\Controllers;

use App\Services\Egerai\EgeraiApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * "Analisis & Koreksi Proposal": upload a finished PKKPRL Proposal (+
 * optional comparison Laporan Kondisi/Hidro-Oseanografi files) and get back
 * an AI-written consistency report. Unlike the /egerai pipeline, nothing is
 * extracted or generated locally — every step proxies straight to the
 * external e-GerAI API's /api/v1/analisis/* endpoints (see
 * EgeraiApiClient), which also owns the "saved history" storage.
 */
class AnalisisProposalController extends Controller
{
    private const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'xlsx', 'xlsm'];

    private const MAX_FILES = 10;

    public function create(): Response
    {
        return inertia('backend/analisis-proposal/create');
    }

    public function store(Request $request, EgeraiApiClient $client): Response|RedirectResponse
    {
        $validated = $request->validate([
            'proposal' => ['required', 'array', 'min:1', 'max:'.self::MAX_FILES],
            'proposal.*' => ['file', 'mimes:'.implode(',', self::ALLOWED_EXTENSIONS), 'max:10240'],
            'laporan' => ['nullable', 'array', 'max:'.self::MAX_FILES],
            'laporan.*' => ['file', 'mimes:'.implode(',', self::ALLOWED_EXTENSIONS), 'max:10240'],
        ]);

        $proposalFiles = $validated['proposal'];
        $laporanFiles = $validated['laporan'] ?? [];

        $tmpDir = storage_path('app/tmp/analisis-'.uniqid());
        mkdir($tmpDir, 0755, true);

        try {
            $proposalPaths = [];
            foreach ($proposalFiles as $index => $file) {
                $path = $tmpDir.'/proposal_'.$index.'_'.$file->getClientOriginalName();
                $file->move($tmpDir, basename($path));
                $proposalPaths[] = $path;
            }

            $laporanPaths = [];
            foreach ($laporanFiles as $index => $file) {
                $path = $tmpDir.'/laporan_'.$index.'_'.$file->getClientOriginalName();
                $file->move($tmpDir, basename($path));
                $laporanPaths[] = $path;
            }

            $result = $client->analisisProposal($proposalPaths, $laporanPaths);
        } catch (RuntimeException $exception) {
            Log::error('Gagal menganalisis proposal via API eksternal', ['message' => $exception->getMessage()]);

            return back()->withErrors(['proposal' => $exception->getMessage()]);
        } finally {
            $this->deleteDirectory($tmpDir);
        }

        return inertia('backend/analisis-proposal/hasil', [
            'hasil_markdown' => $result['hasil_markdown'],
            'nama_proposal' => $result['nama_proposal'],
            'nama_laporan' => $result['nama_laporan'],
            'entry_id' => null,
            'saved_notice' => null,
        ]);
    }

    public function unduh(Request $request, EgeraiApiClient $client): SymfonyResponse
    {
        $validated = $request->validate([
            'hasil_markdown' => ['required', 'string'],
            'nama_proposal' => ['nullable', 'string'],
            'nama_laporan' => ['nullable', 'string'],
        ]);

        try {
            $docx = $client->analisisUnduh(
                $validated['hasil_markdown'],
                $validated['nama_proposal'] ?? '',
                $validated['nama_laporan'] ?? '',
            );
        } catch (RuntimeException $exception) {
            return back()->withErrors(['unduh' => $exception->getMessage()]);
        }

        $filename = 'Analisis_Proposal_'.now()->format('Ymd_His').'.docx';

        return response($docx, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    public function simpan(Request $request, EgeraiApiClient $client): Response|RedirectResponse
    {
        $validated = $request->validate([
            'hasil_markdown' => ['required', 'string'],
            'nama_proposal' => ['nullable', 'string'],
            'nama_laporan' => ['nullable', 'string'],
        ]);

        try {
            $entryId = $client->analisisSimpan(
                $validated['hasil_markdown'],
                $validated['nama_proposal'] ?? '',
                $validated['nama_laporan'] ?? '',
                $request->user()->name,
            );
        } catch (RuntimeException $exception) {
            return back()->withErrors(['simpan' => $exception->getMessage()]);
        }

        return inertia('backend/analisis-proposal/hasil', [
            'hasil_markdown' => $validated['hasil_markdown'],
            'nama_proposal' => $validated['nama_proposal'] ?? '',
            'nama_laporan' => $validated['nama_laporan'] ?? '',
            'entry_id' => $entryId,
            'saved_notice' => 'Hasil analisis berhasil disimpan ke Riwayat Tersimpan.',
        ]);
    }

    public function riwayat(Request $request, EgeraiApiClient $client): Response
    {
        // Admins can see every staff member's saved analyses; regular staff
        // only see their own (disimpan_oleh was set to the user's name at
        // save time — see simpan() above).
        $disimpanOleh = $request->user()->isAdmin() ? null : $request->user()->name;

        try {
            $items = $client->analisisRiwayatList($disimpanOleh);
        } catch (RuntimeException $exception) {
            Log::error('Gagal mengambil riwayat analisis', ['message' => $exception->getMessage()]);
            $items = [];
        }

        return inertia('backend/analisis-proposal/riwayat', [
            'items' => $items,
            'showsAllStaff' => $request->user()->isAdmin(),
        ]);
    }

    public function riwayatShow(string $entryId, EgeraiApiClient $client): Response|RedirectResponse
    {
        try {
            $entry = $client->analisisRiwayatGet($entryId);
        } catch (RuntimeException $exception) {
            abort_if($exception->getMessage() === 'not_found', 404);
            report($exception);

            return back()->withErrors(['riwayat' => 'Gagal mengambil hasil analisis tersimpan.']);
        }

        return inertia('backend/analisis-proposal/hasil', [
            'hasil_markdown' => $entry['hasil_markdown'],
            'nama_proposal' => $entry['meta']['nama_proposal'] ?? '',
            'nama_laporan' => $entry['meta']['nama_laporan'] ?? '',
            'entry_id' => $entryId,
            'saved_notice' => null,
        ]);
    }

    public function riwayatUnduh(string $entryId, EgeraiApiClient $client): SymfonyResponse
    {
        try {
            $docx = $client->analisisRiwayatUnduh($entryId);
        } catch (RuntimeException $exception) {
            abort_if($exception->getMessage() === 'not_found', 404);
            report($exception);

            return back()->withErrors(['riwayat' => 'Gagal mengunduh hasil analisis tersimpan.']);
        }

        return response($docx, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="Analisis_Proposal_'.$entryId.'.docx"',
        ]);
    }

    public function riwayatHapus(string $entryId, EgeraiApiClient $client): RedirectResponse
    {
        $client->analisisRiwayatHapus($entryId);

        return redirect()->route('analisis-proposal.riwayat')->with('success', 'Hasil analisis dihapus dari Riwayat Tersimpan.');
    }

    private function deleteDirectory(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }
        foreach (glob($dir.'/*') ?: [] as $file) {
            @unlink($file);
        }
        @rmdir($dir);
    }
}
