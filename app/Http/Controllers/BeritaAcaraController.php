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

    private function staffIds(Request $request, ?int $currentStaffId = null, ?BeritaAcaraKonsultasi $record = null): array
    {
        $submittedIds = collect($request->input('staff_ids', []))
            ->filter()
            ->map(fn($id) => (int) $id)
            ->unique();

        if ($submittedIds->isNotEmpty()) {
            return $submittedIds
                ->merge($currentStaffId ? [$currentStaffId] : [])
                ->filter()
                ->unique()
                ->values()
                ->all();
        }

        $existingIds = $record?->staff()->pluck('staff.id')->all() ?? [];
        if ($record && empty($existingIds)) {
            $existingIds = collect([
                $record->staff_1_id,
                $record->staff_2_id,
                $record->staff_3_id,
                $record->staff_4_id,
            ])->filter()->all();
        }

        $requestFormId = $request->input('request_form_id') ?? $record?->request_form_id;
        $consultationAssignedIds = [];
        if ($requestFormId) {
            $consultation = PermohonanKonsultasi::with('assign_to_staff')->find($requestFormId);
            if ($consultation) {
                $consultationAssignedIds = $consultation->assign_to_staff
                    ->pluck('staff')
                    ->filter()
                    ->map(fn($id) => (int) $id)
                    ->all();
            }
        }

        return collect($existingIds)
            ->merge($consultationAssignedIds)
            ->merge([
                $request->input('staff_1_id'),
                $request->input('staff_2_id'),
                $request->input('staff_3_id'),
                $request->input('staff_4_id'),
                $currentStaffId,
            ])
            ->filter()
            ->map(fn($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    private function staffList(): \Illuminate\Support\Collection
    {
        return Staff::with('user:id,name')
            ->where('is_active', true)
            ->get(['id', 'user_id', 'position'])
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->user?->name ?? "Staff #{$s->id}",
                'position' => $s->position,
            ]);
    }

    private function syncPermohonanKonsultasi(PermohonanKonsultasi $konsultasi, array $data): void
    {
        $konsultasi->update([
            'nama_pemohon' => $data['requester_name'] ?? $konsultasi->nama_pemohon,
            'jabatan_pemohon' => $data['requester_position'] ?? $konsultasi->jabatan_pemohon,
            'instansi' => $data['legal_entity_name'] ?? $konsultasi->instansi,
            'email' => $data['contact_email'] ?? $konsultasi->email,
            'provinsi' => $data['province'] ?? $konsultasi->provinsi,
            'kabupaten' => $data['regency'] ?? $konsultasi->kabupaten,
            'status' => 'berita_acara',
        ]);
    }

    public function index(Request $request): Response
    {
        $rows = BeritaAcaraKonsultasi::query()
            ->with(['staff.user:id,name', 'documents'])
            ->when($request->search, fn($q, $s) =>
                $q
                    ->where('requester_name', 'like', "%{$s}%")
                    ->orWhere('berita_acara_number', 'like', "%{$s}%"))
            ->when($request->status, fn($q, $st) => $q->where('status', $st))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn($r) => [
                'id' => $r->id,
                'status' => $r->status,
                'consultation_stage' => $r->consultation_stage,
                'consultation_date' => $r->consultation_date?->format('d M Y'),
                'berita_acara_number' => $r->berita_acara_number,
                'requester_name' => $r->requester_name,
                'staff_1_name' => $r->staff->first()?->user?->name,
            ]);

        // Prepare chart data for Berita Acara creation volume (Line Chart)
        $selectedYear = (int) $request->query('chart_year', date('Y'));

        // Monthly data (12 months for selected year)
        $monthlyCategories = [];
        $monthlyCounts = [];
        for ($m = 1; $m <= 12; $m++) {
            $date = \Carbon\Carbon::createFromDate($selectedYear, $m, 1);
            $monthlyCategories[] = $date->translatedFormat('M');
            $monthlyCounts[] = BeritaAcaraKonsultasi::query()
                ->whereYear('created_at', $selectedYear)
                ->whereMonth('created_at', $m)
                ->count();
        }

        // Yearly data (last 5 years)
        $yearlyCategories = [];
        $yearlyCounts = [];
        $currentY = (int) date('Y');
        for ($y = $currentY - 4; $y <= $currentY; $y++) {
            $yearlyCategories[] = (string) $y;
            $yearlyCounts[] = BeritaAcaraKonsultasi::query()
                ->whereYear('created_at', $y)
                ->count();
        }

        $availableYears = BeritaAcaraKonsultasi::query()
            ->selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->pluck('year')
            ->filter()
            ->map(fn($y) => (int) $y)
            ->toArray();

        if (empty($availableYears)) {
            $availableYears = [$currentY];
        } else {
            if (!in_array($currentY, $availableYears, true)) {
                $availableYears[] = $currentY;
            }
            rsort($availableYears);
        }

        return Inertia::render('backend/berita-acara/index', [
            'rows' => $rows,
            'filters' => $request->only(['search', 'status']),
            'chartData' => [
                'monthly' => [
                    'categories' => $monthlyCategories,
                    'series' => [
                        [
                            'name' => 'Jumlah Berita Acara',
                            'data' => $monthlyCounts,
                        ],
                    ],
                ],
                'yearly' => [
                    'categories' => $yearlyCategories,
                    'series' => [
                        [
                            'name' => 'Jumlah Berita Acara',
                            'data' => $yearlyCounts,
                        ],
                    ],
                ],
                'availableYears' => array_values(array_unique($availableYears)),
                'selectedYear' => $selectedYear,
            ],
        ]);
    }

    public function index_pegawai(Request $request)
    {
        if ($request->konsultasi) {
            $konsultasi = PermohonanKonsultasi::with(['assign_to_staff.Staff.user', 'assign_to_staff.Staff'])->find($request->konsultasi);
            $berita_acara = BeritaAcaraKonsultasi::with(['staff.user', 'documents'])->where('request_form_id', $konsultasi?->id)->first();
            if ($berita_acara) {
                $berita_acara->setAttribute('staff_ids', $berita_acara->staff->pluck('id')->map(fn($id) => (string) $id)->values()->all());
            }

            return Inertia::render('backend/pegawai/berita-acara', [
                'staffList' => $this->staffList(),
                'konsultasi' => $konsultasi,
                'berita_acara' => $berita_acara,
            ]);
        }

        return redirect()
            ->route('pegawai.dashboard')
            ->with('error', 'Permohonan konsultasi tidak ditemukan.');
    }

    public function create(Request $request)
    {
        if ($request->konsultasi) {
            $konsultasi = PermohonanKonsultasi::with(['assign_to_staff.Staff.user', 'assign_to_staff.Staff'])->find($request->konsultasi);

            return Inertia::render('backend/pegawai/berita-acara', [
                'staffList' => $this->staffList(),
                'konsultasi' => $konsultasi,
                'berita_acara' => null,
                'adminMode' => true,
            ]);
        }

        return redirect()
            ->route('berita-acara.index')
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
                $data['status'] = 'draft';
                $data['requester'] = '-';
                $staffIds = $this->staffIds($request, auth()->user()->staff?->id);
                unset($data['staff_ids']);
                $data['staff_1_id'] = $staffIds[0] ?? null;
                $data['staff_2_id'] = $staffIds[1] ?? null;
                $data['staff_3_id'] = $staffIds[2] ?? null;
                $data['staff_4_id'] = $staffIds[3] ?? null;
                $record = BeritaAcaraKonsultasi::create($data);
                $record->staff()->sync($staffIds);
                $this->handleUploads($request, $record);

                $konsultasi = PermohonanKonsultasi::find($request->request_form_id);
                $this->syncPermohonanKonsultasi($konsultasi, $data);
                return $record;
            });

            return redirect()
                ->route('pegawai.dashboard')
                ->with('success', 'Berita Acara berhasil disimpan.');
        } catch (\Exception $e) {
            dd($e);
        }
    }

    public function show(BeritaAcaraKonsultasi $beritaAcara): Response
    {
        $beritaAcara->load([
            'requester.user:id,name,email',
            'documents',
            'permohonanKonsultasi.assign_to_staff.Staff.user',
            'staff.user:id,name',
        ]);
        $beritaAcara->setAttribute('staff_ids', $beritaAcara->staff->pluck('id')->map(fn($id) => (string) $id)->values()->all());

        return Inertia::render('backend/pegawai/berita-acara', [
            'berita_acara' => $beritaAcara,
            'konsultasi' => $beritaAcara->permohonanKonsultasi,
            'staffList' => $this->staffList(),
            'adminMode' => true,
        ]);
    }

    public function edit(BeritaAcaraKonsultasi $beritaAcara): Response
    {
        $beritaAcara->load([
            'documents',
            'permohonanKonsultasi.assign_to_staff.Staff.user',
            'staff.user:id,name',
        ]);
        $beritaAcara->setAttribute('staff_ids', $beritaAcara->staff->pluck('id')->map(fn($id) => (string) $id)->values()->all());

        return Inertia::render('backend/pegawai/berita-acara', [
            'berita_acara' => $beritaAcara,
            'konsultasi' => $beritaAcara->permohonanKonsultasi,
            'staffList' => $this->staffList(),
            'adminMode' => true,
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
            $staffIds = $this->staffIds($request, auth()->user()->staff?->id);
            unset($data['staff_ids']);
            $data['staff_1_id'] = $staffIds[0] ?? null;
            $data['staff_2_id'] = $staffIds[1] ?? null;
            $data['staff_3_id'] = $staffIds[2] ?? null;
            $data['staff_4_id'] = $staffIds[3] ?? null;
            $beritaAcara->update($data);
            $beritaAcara->staff()->sync($staffIds);
            $this->handleUploads($request, $beritaAcara);
            $konsultasi = PermohonanKonsultasi::find($request->request_form_id);
            $this->syncPermohonanKonsultasi($konsultasi, $data);
        });

        return redirect()
            ->route('berita-acara.edit', $beritaAcara)
            ->with('success', 'Berita Acara berhasil diperbarui.');
    }

    public function updatePegawai(StoreBeritaAcaraRequest $request, BeritaAcaraKonsultasi $beritaAcara): RedirectResponse
    {
        $data = $request->except(
            'dokumentasi_konsultasi', 'absensi_pendampingan', 'tanda_tangan_perwakilan',
            'peta_hasil_plotting', 'rencana_bangunan_instalasi', 'informasi_pemanfaatan_ruang_laut',
            'data_kondisi_terkini', 'persyaratan_lainnya', 'titik_koordinat', '_method'
        );

        try {
            DB::beginTransaction();

            $staffId = auth()->user()->staff->id;
            $staffIds = $this->staffIds($request, $staffId, $beritaAcara);
            unset($data['staff_ids']);
            $data['staff_1_id'] = $staffIds[0] ?? null;
            $data['staff_2_id'] = $staffIds[1] ?? null;
            $data['staff_3_id'] = $staffIds[2] ?? null;
            $data['staff_4_id'] = $staffIds[3] ?? null;

            if (!$beritaAcara) {
                $beritaAcara = BeritaAcaraKonsultasi::create($data);
            } else {
                $beritaAcara->update($data);
            }
            $beritaAcara->staff()->sync($staffIds);

            $this->handleUploads($request, $beritaAcara);

            $konsultasi = PermohonanKonsultasi::find($request->request_form_id);
            $this->syncPermohonanKonsultasi($konsultasi, $data);

            DB::commit();

            return redirect()
                ->route('berita-acara.index')
                ->with('success', 'Berita Acara berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('danger', 'Data gagal diinput. ' . $e->getMessage());
        }
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

        return redirect()
            ->route('berita-acara.index')
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
                        'document_type' => $slot,
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'mime_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }
        }

        // Single-file slots
        $singleSlots = [
            'absensi_pendampingan',
            'tanda_tangan_perwakilan',
            'peta_hasil_plotting',
            'rencana_bangunan_instalasi',
            'informasi_pemanfaatan_ruang_laut',
            'data_kondisi_terkini',
            'titik_koordinat',
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
                    'document_type' => $slot,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }
    }

    public function pdf(BeritaAcaraKonsultasi $beritaAcara)
    {
        if (!auth()->user()->hasRole('admin')) {
            $staffId = auth()->user()->staff->id ?? null;

            abort_unless(
                $staffId && ($beritaAcara->staff->contains('id', $staffId) || in_array($staffId, [
                    $beritaAcara->staff_1_id,
                    $beritaAcara->staff_2_id,
                    $beritaAcara->staff_3_id,
                    $beritaAcara->staff_4_id,
                ])),
                403
            );
        }

        $beritaAcara->load([
            'staff.user',
            'staff1.user',
            'staff2.user',
            'staff3.user',
            'staff4.user',
            'documents',
            'request_form.assign_to_staff.Staff.user',
            'permohonanKonsultasi.assign_to_staff.Staff.user',
        ]);

        $pdf = Pdf::loadView('pdf.berita-acara', [
            'beritaAcara' => $beritaAcara,
            'logoPath' => public_path('logo_klp.png'),
        ])->setPaper('a4', 'portrait');

        $time_file = $beritaAcara->created_at?->format('YmdHis') ?? now()->format('YmdHis');
        $requester_filename = $beritaAcara->request_form?->nama_pemohon ?? ($beritaAcara->requester_name ?? 'pemohon');
        $filename = "Berita Acara - {$requester_filename} - {$time_file}.pdf";

        $pdfDocs = $beritaAcara->documents
            ->filter(function ($doc) {
                if (!$doc->file_path) {
                    return false;
                }
                $ext = strtolower(pathinfo($doc->file_path, PATHINFO_EXTENSION));
                return $ext === 'pdf' && Storage::disk('public')->exists($doc->file_path);
            })
            ->values();

        if ($pdfDocs->isNotEmpty()) {
            try {
                $mainPdfContent = $pdf->output();
                $fpdi = new \setasign\Fpdi\Fpdi();

                $pageCount = $fpdi->setSourceFile(\setasign\Fpdi\PdfParser\StreamReader::createByString($mainPdfContent));
                for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                    $templateId = $fpdi->importPage($pageNo);
                    $size = $fpdi->getTemplateSize($templateId);
                    if (is_array($size)) {
                        $fpdi->AddPage($size['orientation'], [$size['width'], $size['height']]);
                    } else {
                        $fpdi->AddPage();
                    }
                    $fpdi->useTemplate($templateId);
                }

                foreach ($pdfDocs as $doc) {
                    $absolutePath = Storage::disk('public')->path($doc->file_path);
                    if (!file_exists($absolutePath)) {
                        continue;
                    }
                    $docPageCount = $fpdi->setSourceFile($absolutePath);
                    for ($pNo = 1; $pNo <= $docPageCount; $pNo++) {
                        $attTplId = $fpdi->importPage($pNo);
                        $attSize = $fpdi->getTemplateSize($attTplId);
                        if (is_array($attSize)) {
                            $fpdi->AddPage($attSize['orientation'], [$attSize['width'], $attSize['height']]);
                        } else {
                            $fpdi->AddPage();
                        }
                        $fpdi->useTemplate($attTplId);
                    }
                }

                $mergedContent = $fpdi->Output('S');

                return response($mergedContent, 200, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => "inline; filename=\"{$filename}\"",
                ]);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Gagal menggabungkan PDF lampiran: ' . $e->getMessage());
            }
        }

        return $pdf->stream($filename);
    }
}
