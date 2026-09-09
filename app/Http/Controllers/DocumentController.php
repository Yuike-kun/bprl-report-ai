<?php

namespace App\Http\Controllers;

use App\Models\BeritaAcaraDocument;
use App\Models\DokumenKonsultasi;
use App\Models\ProposalExtraction;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    /**
     * Display a listing of all documents across the application.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $categoryFilter = (string) $request->query('category', 'all');
        $extensionFilter = (string) $request->query('extension', 'all');

        // 1. Dokumen Permohonan Konsultasi
        $dokumenKonsultasi = DokumenKonsultasi::with('permohonan')
            ->get()
            ->map(function ($doc) {
                $permohonan = $doc->permohonan;
                $url = $doc->file_url ?? '';
                $filePath = Str::after($url, '/storage/');
                $size = Storage::disk('public')->exists($filePath) ? Storage::disk('public')->size($filePath) : null;
                $ext = strtolower(pathinfo($doc->file_name ?? '', PATHINFO_EXTENSION));

                return [
                    'id' => $doc->id,
                    'source' => 'dokumen_konsultasi',
                    'file_name' => $doc->file_name ?? 'Dokumen Permohonan',
                    'category_type' => 'permohonan',
                    'category_label' => 'Permohonan Konsultasi',
                    'sub_type' => str_contains(strtolower($doc->file_name ?? ''), 'konfirmasi') ? 'Surat Konfirmasi' : 'Bahan Konsultasi',
                    'sender_name' => $permohonan?->nama_pemohon ?? 'Pemohon Konsultasi',
                    'sender_detail' => $permohonan?->instansi ?: ($permohonan?->email ?: '-'),
                    'sender_email' => $permohonan?->email ?? '',
                    'created_at' => $doc->created_at?->format('d M Y, H:i') ?? '-',
                    'created_at_raw' => $doc->created_at?->timestamp ?? 0,
                    'file_size' => $size,
                    'file_size_formatted' => $size ? $this->formatBytes($size) : '-',
                    'extension' => $ext ?: 'pdf',
                    'view_url' => $permohonan ? "/master/permohonan-konsultasi/{$permohonan->id}" : null,
                ];
            });

        // 2. Dokumen Berita Acara
        $beritaAcaraDocs = BeritaAcaraDocument::with('beritaAcara')
            ->get()
            ->map(function ($doc) {
                $ba = $doc->beritaAcara;
                $ext = strtolower(pathinfo($doc->file_name ?? '', PATHINFO_EXTENSION));
                $typeLabel = ucwords(str_replace('_', ' ', $doc->document_type ?? 'Dokumen'));

                return [
                    'id' => $doc->id,
                    'source' => 'berita_acara_document',
                    'file_name' => $doc->file_name ?? 'Dokumen Berita Acara',
                    'category_type' => 'berita_acara',
                    'category_label' => 'Berita Acara',
                    'sub_type' => $typeLabel,
                    'sender_name' => $ba?->requester_name ?? 'Petugas / Pemohon',
                    'sender_detail' => $ba?->legal_entity_name ?: ($ba?->berita_acara_number ?: '-'),
                    'sender_email' => $ba?->contact_email ?? '',
                    'created_at' => $doc->created_at?->format('d M Y, H:i') ?? '-',
                    'created_at_raw' => $doc->created_at?->timestamp ?? 0,
                    'file_size' => $doc->file_size,
                    'file_size_formatted' => $doc->file_size ? $this->formatBytes($doc->file_size) : '-',
                    'extension' => $ext ?: 'file',
                    'view_url' => $ba ? "/berita-acara/{$ba->id}" : null,
                ];
            });

        // 3. Proposal Extractions
        $proposalExtractions = ProposalExtraction::with('user')
            ->whereNotNull('source_filename')
            ->get()
            ->map(function ($doc) {
                $path = $doc->source_path ?? '';
                $size = Storage::disk('public')->exists($path) ? Storage::disk('public')->size($path) : null;
                $ext = strtolower(pathinfo($doc->source_filename ?? '', PATHINFO_EXTENSION));

                return [
                    'id' => $doc->id,
                    'source' => 'proposal_extraction',
                    'file_name' => $doc->source_filename ?? 'Ekstraksi Proposal',
                    'category_type' => 'proposal_extraction',
                    'category_label' => 'Ekstraksi Proposal',
                    'sub_type' => 'File Proposal Upload',
                    'sender_name' => $doc->user?->name ?? 'Pengunggah Proposal',
                    'sender_detail' => $doc->user?->email ?: 'Pengguna Sistem',
                    'sender_email' => $doc->user?->email ?? '',
                    'created_at' => $doc->created_at?->format('d M Y, H:i') ?? '-',
                    'created_at_raw' => $doc->created_at?->timestamp ?? 0,
                    'file_size' => $size,
                    'file_size_formatted' => $size ? $this->formatBytes($size) : '-',
                    'extension' => $ext ?: 'pdf',
                    'view_url' => "/proposal-extractions/{$doc->id}/edit",
                ];
            });

        // Merge all documents
        $allDocuments = collect()
            ->concat($dokumenKonsultasi)
            ->concat($beritaAcaraDocs)
            ->concat($proposalExtractions);

        // Stats summary
        $stats = [
            'total' => $allDocuments->count(),
            'permohonan' => $dokumenKonsultasi->count(),
            'berita_acara' => $beritaAcaraDocs->count(),
            'proposal_extraction' => $proposalExtractions->count(),
        ];

        // Apply Category Filter
        if ($categoryFilter !== 'all') {
            $allDocuments = $allDocuments->where('category_type', $categoryFilter);
        }

        // Apply Extension Filter
        if ($extensionFilter !== 'all') {
            if ($extensionFilter === 'pdf') {
                $allDocuments = $allDocuments->where('extension', 'pdf');
            } elseif ($extensionFilter === 'image') {
                $allDocuments = $allDocuments->whereIn('extension', ['jpg', 'jpeg', 'png', 'webp', 'gif']);
            } elseif ($extensionFilter === 'document') {
                $allDocuments = $allDocuments->whereIn('extension', ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']);
            }
        }

        // Apply Search
        if ($search !== '') {
            $searchLower = strtolower($search);
            $allDocuments = $allDocuments->filter(function ($doc) use ($searchLower) {
                return str_contains(strtolower($doc['file_name']), $searchLower)
                    || str_contains(strtolower($doc['sender_name']), $searchLower)
                    || str_contains(strtolower($doc['sender_detail']), $searchLower)
                    || str_contains(strtolower($doc['sub_type']), $searchLower);
            });
        }

        // Sort by created_at_raw desc
        $sortedDocuments = $allDocuments->sortByDesc('created_at_raw')->values();

        // Paginate manually
        $page = (int) $request->query('page', 1);
        $perPage = 12;
        $totalItems = $sortedDocuments->count();

        $itemsForCurrentPage = $sortedDocuments->slice(($page - 1) * $perPage, $perPage)->values();

        $paginatedDocuments = new LengthAwarePaginator(
            $itemsForCurrentPage,
            $totalItems,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('backend/documents/index', [
            'documents' => $paginatedDocuments,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'category' => $categoryFilter,
                'extension' => $extensionFilter,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Download specified document file.
     */
    public function download(Request $request, string $source, int $id)
    {
        try {
            if ($source === 'dokumen_konsultasi') {
                $doc = DokumenKonsultasi::findOrFail($id);
                $path = Str::after($doc->file_url, '/storage/');

                if (Storage::disk('public')->exists($path)) {
                    return Storage::disk('public')->download($path, $doc->file_name);
                }

                if (file_exists(public_path($doc->file_url))) {
                    return response()->download(public_path($doc->file_url), $doc->file_name);
                }
            } elseif ($source === 'berita_acara_document') {
                $doc = BeritaAcaraDocument::findOrFail($id);

                if (Storage::disk('public')->exists($doc->file_path)) {
                    return Storage::disk('public')->download($doc->file_path, $doc->file_name);
                }
            } elseif ($source === 'proposal_extraction') {
                $doc = ProposalExtraction::findOrFail($id);

                if (Storage::disk('public')->exists($doc->source_path)) {
                    return Storage::disk('public')->download($doc->source_path, $doc->source_filename);
                }
            }

            return back()->with('error', 'Berkas dokumen tidak ditemukan di server.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal mengunduh berkas: ' . $e->getMessage());
        }
    }

    /**
     * Delete document (Admin only).
     */
    public function destroy(string $source, int $id)
    {
        if (! auth()->user()->isAdmin()) {
            abort(403, 'Akses tidak diizinkan.');
        }

        try {
            if ($source === 'dokumen_konsultasi') {
                $doc = DokumenKonsultasi::findOrFail($id);
                $path = Str::after($doc->file_url, '/storage/');
                Storage::disk('public')->delete($path);
                $doc->delete();
            } elseif ($source === 'berita_acara_document') {
                $doc = BeritaAcaraDocument::findOrFail($id);
                Storage::disk('public')->delete($doc->file_path);
                $doc->delete();
            } elseif ($source === 'proposal_extraction') {
                $doc = ProposalExtraction::findOrFail($id);
                Storage::disk('public')->delete($doc->source_path);
                $doc->delete();
            }

            return back()->with('success', 'Dokumen berhasil dihapus.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus dokumen: ' . $e->getMessage());
        }
    }

    /**
     * Format byte sizes into readable string.
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
