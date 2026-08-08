<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreBeritaAcaraRequest;
use App\Models\BeritaAcaraDocument;
use App\Models\BeritaAcaraKonsultasi;
use App\Models\PermohonanKonsultasi;
use App\Models\Staff;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BeritaAcaraController extends Controller
{
    // ── Helpers ───────────────────────────────────────────────────────

    private function staffList(): \Illuminate\Support\Collection
    {
        return Staff::with('user:id,name')
            ->where('is_active', true)
            ->get(['id', 'user_id', 'position'])
            ->map(fn($s) => [
                'id'   => $s->id,
                'name' => $s->user?->name ?? "Staff #{$s->id}",
                'position'   => $s->position,
            ]);
    }

    public function index(Request $request): Response
    {
        $rows = BeritaAcaraKonsultasi::query()
            ->with(['staff1.user:id,name', 'documents'])
            ->when($request->search, fn($q, $s) =>
                $q->where('requester_name', 'like', "%{$s}%")
                    ->orWhere('berita_acara_number', 'like', "%{$s}%")
            )
            ->when($request->status, fn($q, $st) => $q->where('status', $st))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn($r) => [
                'id'                  => $r->id,
                'status'              => $r->status,
                'consultation_stage'  => $r->consultation_stage,
                'consultation_date'   => $r->consultation_date?->format('d M Y'),
                'berita_acara_number' => $r->berita_acara_number,
                'requester_name'      => $r->requester_name,
                'staff_1_name'        => $r->staff1?->user?->name,
            ]);

        return Inertia::render('backend/berita-acara/index', [
            'rows'    => $rows,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function index_pegawai(Request $request)
    {
        if ($request->konsultasi) {
            $konsultasi   = PermohonanKonsultasi::find($request->konsultasi);
            $berita_acara = BeritaAcaraKonsultasi::where('request_form_id', $konsultasi->id)->first();
            return Inertia::render('backend/pegawai/berita-acara', [
                'staffList'    => $this->staffList(),
                'konsultasi'   => $konsultasi,
                'berita_acara' => $berita_acara,
            ]);
        }

        return redirect()->route('berita-acara.index')
            ->with('error', 'Permohonan konsultasi tidak ditemukan.');
    }

    public function create(Request $request)
    {
        if ($request->konsultasi) {
            $konsultasi = PermohonanKonsultasi::find($request->konsultasi);

            return Inertia::render('backend/berita-acara/create', [
                'staffList'  => $this->staffList(),
                'konsultasi' => $konsultasi,
            ]);
        }

        return redirect()->route('berita-acara.index')
            ->with('error', 'Permohonan konsultasi tidak ditemukan.');
    }

    public function store(StoreBeritaAcaraRequest $request): RedirectResponse
    {
        try {
            $data = $request->except(
                'dokumentasi_konsultasi', 'absensi_pendampingan', 'tanda_tangan_perwakilan',
                'peta_hasil_plotting', 'rencana_bangunan_instalasi', 'informasi_pemanfaatan_ruang_laut',
                'data_kondisi_terkini', 'persyaratan_lainnya', 'titik_koordinat'
            );

            $beritaAcara = DB::transaction(function () use ($request, $data) {
                $data['request_form_id'] = $request->request_form_id;
                $data['status']          = 'draft';
                $data['requester']       = '-';
                $data['staff_1_id']      = auth()->user()->staff->id;
                $record                  = BeritaAcaraKonsultasi::create($data);
                $this->handleUploads($request, $record);

                $konsultasi = PermohonanKonsultasi::find($request->request_form_id);
                $konsultasi->update([
                    'status' => 'berita_acara',
                ]);
                return $record;
            });

            return redirect()->route('pegawai.dashboard')
                ->with('success', 'Berita Acara berhasil disimpan.');
        } catch (\Exception $e) {
            dd($e);
        }
    }

    public function show(BeritaAcaraKonsultasi $beritaAcara): Response
    {
        $beritaAcara->load([
            'requester.user:id,name,email',
            'staff1.user:id,name', 'staff2.user:id,name',
            'staff3.user:id,name', 'staff4.user:id,name',
            'documents',
        ]);

        return Inertia::render('backend/berita-acara/show', [
            'record'    => $beritaAcara,
            'staffList' => $this->staffList(),
        ]);
    }

    public function edit(BeritaAcaraKonsultasi $beritaAcara): Response
    {
        $beritaAcara->load('documents');

        return Inertia::render('backend/berita-acara/edit', [
            'record'    => $beritaAcara,
            'staffList' => $this->staffList(),
        ]);
    }

    public function update(StoreBeritaAcaraRequest $request, BeritaAcaraKonsultasi $beritaAcara): RedirectResponse
    {
        $data = $request->except(
            'dokumentasi_konsultasi', 'absensi_pendampingan', 'tanda_tangan_perwakilan',
            'peta_hasil_plotting', 'rencana_bangunan_instalasi', 'informasi_pemanfaatan_ruang_laut',
            'data_kondisi_terkini', 'persyaratan_lainnya', 'titik_koordinat'
        );

        DB::transaction(function () use ($request, $beritaAcara, $data) {
            $beritaAcara->update($data);
            $this->handleUploads($request, $beritaAcara);
            $konsultasi = PermohonanKonsultasi::find($request->request_form_id);
            $konsultasi->update([
                'status' => 'berita_acara',
            ]);
        });

        return redirect()->route('berita-acara.show', $beritaAcara)
            ->with('success', 'Berita Acara berhasil diperbarui.');
    }

    public function updatePegawai(StoreBeritaAcaraRequest $request, BeritaAcaraKonsultasi $beritaAcara): RedirectResponse
    {
        $data = $request->except(
            'dokumentasi_konsultasi', 'absensi_pendampingan', 'tanda_tangan_perwakilan',
            'peta_hasil_plotting', 'rencana_bangunan_instalasi', 'informasi_pemanfaatan_ruang_laut',
            'data_kondisi_terkini', 'persyaratan_lainnya', 'titik_koordinat', '_method'
        );

        DB::transaction(function () use ($request, $beritaAcara, $data) {
            $staffId = auth()->user()->staff->id;
            $slots   = ['staff_1_id', 'staff_2_id', 'staff_3_id', 'staff_4_id'];

            $alreadyAssigned = collect($slots)
                ->map(fn($slot) => $beritaAcara->{$slot})
                ->contains($staffId);

            if (! $alreadyAssigned) {
                foreach ($slots as $slot) {
                    if (! $beritaAcara->{$slot}) {
                        $data[$slot] = $staffId;
                        break;
                    }
                }
            }
            $beritaAcara->update($data);
            $this->handleUploads($request, $beritaAcara);

            $konsultasi = PermohonanKonsultasi::find($request->request_form_id);
            $konsultasi->update([
                'status' => 'berita_acara',
            ]);
        });

        return redirect()->route('pegawai.dashboard')
            ->with('success', 'Berita Acara berhasil diperbarui.');
    }

    public function updateStatus(Request $request, BeritaAcaraKonsultasi $beritaAcara): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:draft,submitted,under_review,approved,rejected'],
        ]);

        $beritaAcara->update(['status' => $request->status]);

        return back()->with('success', 'Status diperbarui.');
    }

    public function destroy(BeritaAcaraKonsultasi $beritaAcara): RedirectResponse
    {
        $beritaAcara->documents->each(function ($doc) {
            Storage::disk('public')->delete($doc->file_path);
        });
        $beritaAcara->delete();

        return redirect()->route('berita-acara.index')
            ->with('success', 'Data berhasil dihapus.');
    }

    public function destroyDocument(BeritaAcaraDocument $document): RedirectResponse
    {
        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return back()->with('success', 'Dokumen berhasil dihapus.');
    }

    // ── Upload helper ──────────────────────────────────────────────────

    private function handleUploads(Request $request, BeritaAcaraKonsultasi $record): void
    {
        $dir = "request-forms/{$record->id}";

        // Multi-file slots
        $multiSlots = ['dokumentasi_konsultasi', 'persyaratan_lainnya'];
        foreach ($multiSlots as $slot) {
            if ($request->hasFile($slot)) {
                foreach ($request->file($slot) as $file) {
                    $path = $file->store("{$dir}/{$slot}", 'public');
                    BeritaAcaraDocument::create([
                        'berita_acara_konsultasi_id' => $record->id,
                        'document_type'              => $slot,
                        'file_name'                  => $file->getClientOriginalName(),
                        'file_path'                  => $path,
                        'mime_type'                  => $file->getMimeType(),
                        'file_size'                  => $file->getSize(),
                    ]);
                }
            }
        }

        // Single-file slots
        $singleSlots = [
            'absensi_pendampingan', 'tanda_tangan_perwakilan', 'peta_hasil_plotting',
            'rencana_bangunan_instalasi', 'informasi_pemanfaatan_ruang_laut',
            'data_kondisi_terkini', 'titik_koordinat',
        ];
        foreach ($singleSlots as $slot) {
            if ($request->hasFile($slot)) {
                $record->documents()->where('document_type', $slot)->get()->each(function ($doc) {
                    Storage::disk('public')->delete($doc->file_path);
                    $doc->delete();
                });

                $file = $request->file($slot);
                $path = $file->store("{$dir}/{$slot}", 'public');
                BeritaAcaraDocument::create([
                    'berita_acara_konsultasi_id' => $record->id,
                    'document_type'              => $slot,
                    'file_name'                  => $file->getClientOriginalName(),
                    'file_path'                  => $path,
                    'mime_type'                  => $file->getMimeType(),
                    'file_size'                  => $file->getSize(),
                ]);
            }
        }
    }

    public function pdf(BeritaAcaraKonsultasi $beritaAcara)
    {
        if (! auth()->user()->hasRole('admin')) {
            $staffId = auth()->user()->staff->id ?? null;

            abort_unless(
                $staffId && in_array($staffId, [
                    $beritaAcara->staff_1_id, $beritaAcara->staff_2_id,
                    $beritaAcara->staff_3_id, $beritaAcara->staff_4_id,
                ]),
                403
            );
        }

        $beritaAcara->load([
            'staff1.user', 'staff2.user', 'staff3.user', 'staff4.user',
            'province', 'regency', 'district', // drop these three if not local relations
            'documents',
        ]);

        $pdf = Pdf::loadView('pdf.berita-acara', [
            'beritaAcara' => $beritaAcara,
            'logoPath'    => public_path('logo_klp.png'),
        ])->setPaper('a4', 'portrait');

        return $pdf->download("berita-acara-{$beritaAcara->id}.pdf");
    }
}
