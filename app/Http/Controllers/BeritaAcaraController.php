<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBeritaAcaraRequest;
use App\Models\BeritaAcaraDocument;
use App\Models\BeritaAcaraKonsultasi;
use App\Models\PermohonanKonsultasi;
use App\Models\Staff;
use App\Support\BeritaAcaraPdfRenderer;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Settings;

class BeritaAcaraController extends Controller
{
    // ── Helpers ───────────────────────────────────────────────────────

    private function staffIds(Request $request, ?int $currentStaffId = null, ?BeritaAcaraKonsultasi $record = null): array
    {
        // If the client sent the staff_ids field (even empty), trust it completely.
        if ($request->has('staff_ids')) {
            $submittedIds = collect($request->input('staff_ids', []))
                ->filter()
                ->map(fn ($id) => (int) $id)
                ->unique();

            return $submittedIds
                ->merge($currentStaffId ? [$currentStaffId] : [])
                ->filter()
                ->unique()
                ->values()
                ->all();
        }

        // Fallback: used when staff_ids is not present in the request (e.g., show endpoints).
        $submittedIds = collect($request->input('staff_ids', []))
            ->filter()
            ->map(fn ($id) => (int) $id)
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
                    ->map(fn ($id) => (int) $id)
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
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    private function staffList(): Collection
    {
        return Staff::with('user:id,name')
            ->where('is_active', true)
            ->get(['id', 'user_id', 'position'])
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->user?->name ?? "Staff #{$s->id}",
                'position' => $s->position,
            ]);
    }

    private function syncPermohonanKonsultasi(PermohonanKonsultasi $konsultasi, array $data): void
    {
        // Note: `province`/`regency` on the Berita Acara are free-text names for
        // the activity site, while `provinsi`/`kabupaten` on the consultation are
        // province/regency *ids* for the requester's location. They are not the
        // same value, so they must not be synced here.
        $konsultasi->update([
            'nama_pemohon' => $data['requester_name'] ?? $konsultasi->nama_pemohon,
            'jabatan_pemohon' => $data['requester_position'] ?? $konsultasi->jabatan_pemohon,
            'instansi' => $data['legal_entity_name'] ?? $konsultasi->instansi,
            'email' => $data['contact_email'] ?? $konsultasi->email,
            'status' => 'berita_acara',
        ]);
    }

    public function index(Request $request): Response
    {
        $rows = BeritaAcaraKonsultasi::query()
            ->with(['staff.user:id,name', 'documents'])
            ->when($request->search, fn ($q, $s) => $q
                ->where('requester_name', 'like', "%{$s}%")
                ->orWhere('berita_acara_number', 'like', "%{$s}%"))
            ->when($request->status, fn ($q, $st) => $q->where('status', $st))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($r) => [
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
            $date = Carbon::createFromDate($selectedYear, $m, 1);
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
            ->map(fn ($y) => (int) $y)
            ->toArray();

        if (empty($availableYears)) {
            $availableYears = [$currentY];
        } else {
            if (! in_array($currentY, $availableYears, true)) {
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
                $berita_acara->setAttribute('staff_ids', $berita_acara->staff->pluck('id')->map(fn ($id) => (string) $id)->values()->all());
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
        $beritaAcara->setAttribute('staff_ids', $beritaAcara->staff->pluck('id')->map(fn ($id) => (string) $id)->values()->all());

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
        $beritaAcara->setAttribute('staff_ids', $beritaAcara->staff->pluck('id')->map(fn ($id) => (string) $id)->values()->all());

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

            if (! $beritaAcara) {
                $data['status'] = 'draft';
                $data['requester'] = '-';
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

            return back()->with('danger', 'Data gagal diinput. '.$e->getMessage());
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
        if (! auth()->user()->hasRole('admin')) {
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

        return BeritaAcaraPdfRenderer::render($beritaAcara);
    }

    public function docx(BeritaAcaraKonsultasi $beritaAcara)
    {
        // Authorization check - same as PDF endpoint
        if (! auth()->user()->hasRole('admin')) {
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

        // Load necessary relationships
        $beritaAcara->load([
            'staff.user:id,name',
            'documents',
            'permohonanKonsultasi.assign_to_staff.Staff.user',
            'request_form',
            'provinsi',
            'kabupaten',
        ]);

        // Determine if asistensi stage
        $isAsistensi = $beritaAcara->consultation_stage === 'asistensi';

        // Helper to get province name
        $provinceName = $beritaAcara->provinsi?->name ?? '';

        // Get date components
        $hari = $beritaAcara->created_at?->translatedFormat('dddd') ?? '';
        $tglAngka = $beritaAcara->created_at?->format('j') ?? '';
        $bulanKata = $beritaAcara->created_at?->translatedFormat('MMMM') ?? '';
        $tahun = $beritaAcara->created_at?->format('Y') ?? '';

        // Permit type label (assuming there's an accessor or method)
        $permitTypeLabel = $beritaAcara->jenis_permohonan_label ?? $beritaAcara->jenis_permohonan ?? '';

        // Activity detail (from request_form or computed)
        $activityDetail = $beritaAcara->request_form?->rencana_kegiatan ?? '';

        // Water name, district name, regency label (from relationships or computed)
        $waterName = $beritaAcara->lokasi?->nama_lokasi ?? '';
        $districtName = $beritaAcara->kecamatan ?? '';
        $regencyLabel = $beritaAcara->kabupaten?->name ?? '';

        // Coordinate points
        $coordinatePoints = $beritaAcara->coordinate_points ?? '';

        // Create new PHPWord document
        Settings::setPdfRendererPath(base_path('vendor/phpoffice/phpword'));
        Settings::setPdfRendererName('DomPDF');
        $phpWord = new PhpWord();

        // Add section with default style
        $section = $phpWord->addSection([
            'marginLeft' => 1500,   // 15mm in twips
            'marginRight' => 1500,
            'marginTop' => 1000,    // 10mm
            'marginBottom' => 1200, // 12mm
        ]);

        // Add logo (if exists)
        $logoPath = public_path('logo_klp.png');
        if (file_exists($logoPath)) {
            $section->addImage($logoPath, [
                'width' => 250,   // 25mm
                'height' => 250,
                'marginLeft' => 0,
                'marginRight' => 300, // spacer
                'align' => 'left',
                'padding' => 0,
            ]);
        }

        // Header table (kop surat) - simplified
        $headerTable = $section->addTable([
            'borderSize' => 0,
            'cellMargin' => 0,
            'width' => '100%', // full width
            'align' => 'left',
        ]);

        $headerTable->addRow();
        $headerTable->addCell(3000)->addText(''); // Logo cell spacer
        $headerTable->addCell(6000)->addTextBlock(
            "KEMENTERIAN KELAUTAN DAN PERIKANAN\n".
            "DIREKTORAT JENDERAL PENATAAN RUANG LAUT\n".
            "BALAI PENATAAN RUANG LAUT MAKASSAR\n".
            "JALAN MAKMUR DAENG SITAKKA NOMOR 129 MAROS 90511, TELEPON (0411) 371337\n".
            "FAKSIMILI (0411) 371337\n".
            "LAMAN WWW.KKP.GO.ID SUREL BPRLMAKASSAR@KKP.GO.ID",
            [
                'align' => 'center',
                'size' => 11,
                'bold' => true,
            ]
        );

        $section->addTextBreak(1);

        // Title
        $section->addText(
            "BERITA ACARA PENDAMPINGAN PERMOHONAN",
            [
                'align' => 'center',
                'size' => 12,
                'bold' => true,
            ]
        );

        $section->addTextBreak(1);

        // Document number and subject
        $section->addText(
            "Nomor: {$beritaAcara->berita_acara_number}",
            ['align' => 'center', 'size' => 11]
        );
        $section->addText(
            ucwords(strtolower($beritaAcara->legal_entity_name))." di ".$provinceName,
            ['align' => 'center', 'size' => 11]
        );

        $section->addTextBreak(2);

        // Introduction
        $section->addText(
            "Pada hari ini ".ucfirst($hari)." tanggal ".$tglAngka." Bulan ".$bulanKata." Tahun ".$tahun.", kami yang bertanda tangan di bawah ini telah melaksanakan Pendampingan Permohonan atas rencana permohonan ".$permitTypeLabel." untuk permohonan",
            ['align' => 'left', 'size' => 11]
        );

        $section->addTextBreak(1);

        // Attendees list
        $section->addText("Diikuti oleh:", ['size' => 11]);
        $attendeeList = $section->addTextList([]);
        $allStaff = $beritaAcara->staff
            ->map(fn($s) => [
                'name' => $s->user->name ?? 'Petugas Pendamping',
                'position' => $s->position ?? 'Petugas Pendamping',
            ])
            ->toArray();

        foreach ($allStaff as $staff) {
            $attendeeList->addListItem(
                $staff['name'].' ('.$staff['position'].')',
                []
            );
        }
        $attendeeList->addListItem(
            $beritaAcara->requester_name.' ('.$beritaAcara->requester_position.')',
            []
        );

        $section->addTextBreak(1);

        // Results section (only if asistensi)
        if ($isAsistensi) {
            $section->addText("Berdasarkan hasil pelaksanaan pendampingan permohonan, diperoleh hasil sebagai berikut:", ['size' => 11]);
            $section->addTextBreak(1);

            // 1. Deskripsi rencana kegiatan
            $section->addText("1. Deskripsi rencana kegiatan untuk permohonan", ['size' => 11, 'bold' => true]);
            $section->addTextBreak(1);
            $section->addText("Subjek Hukum : ".$beritaAcara->legal_entity_name, ['size' => 11]);
            $section->addText("Rencana Kegiatan : ".$activityDetail, ['size' => 11]);
            $section->addText("Luas/Panjang : ".$beritaAcara->planned_area.' '.$beritaAcara->planned_area_unit, ['size' => 11]);

            // Activity description (rendered HTML converted to text)
            $activityDesc = \App\Support\BeritaAcaraHtml::render($beritaAcara->activity_description);
            // Strip HTML tags for simple text conversion
            $plainDesc = strip_tags($activityDesc);
            $plainDesc = preg_replace('/\s+/', ' ', $plainDesc);
            $section->addText($plainDesc, ['size' => 11]);
            $section->addTextBreak(1);

            // 2. Lokasi
            $section->addText("2. Lokasi yang akan dimohonkan", ['size' => 11, 'bold' => true]);
            $section->addTextBreak(1);
            $section->addText(
                "Adapun rencana lokasi kegiatan ".$activityDetail." yang akan dilakukan oleh".
                " ".$beritaAcara->legal_entity_name." terletak di perairan ".$waterName." di".
                " Kecamatan ".$districtName.", ".$regencyLabel.", Provinsi ".$provinceName.
                " dengan titik koordinat sebagai berikut:",
                ['size' => 11]
            );
            $section->addTextBreak(1);

            // Coordinates table
            $coordTable = $section->addTable(['borderSize' => 0, 'cellMargin' => 50]);
            $coordTable->addRow();
            $coordTable->addCell(2000)->addText('No.', ['bold' => true]);
            $coordTable->addCell(3000)->addText('Longitude', ['bold' => true]);
            $coordTable->addCell(3000)->addText('Latitude', ['bold' => true]);

            $coordinateRows = collect(preg_split('/\r\n|\r|\n/', trim($coordinatePoints ?? '')))
                ->filter()
                ->map(function ($line) {
                    if (preg_match('/^\s*(\d+)\.\s*([\-\d.]+)\s*,\s*([\-\d.]+)\s*$/', $line, $m)) {
                        return [
                            'no' => $m[1],
                            'lon' => $m[2],
                            'lat' => $m[3],
                        ];
                    }
                    return null;
                })
                ->filter()
                ->values();

            foreach ($coordinateRows as $row) {
                $coordTable->addRow();
                $coordTable->addCell(2000)->addText($row['no'], []);
                $coordTable->addCell(3000)->addText($row['lon'], []);
                $coordTable->addCell(3000)->addText($row['lat'], []);
            }

            $section->addTextBreak(1);
        }

        // Lampiran section
        $section->addTextBreak(1);
        $section->addText("LAMPORAN", ['size' => 12, 'bold' => true, 'align' => 'center']);
        $section->addTextBreak(1);

        // Lampiran I: Dokumentasi
        $section->addText("Lampiran I: Dokumentasi", ['size' => 11, 'bold' => true]);
        $section->addTextBreak(1);
        $docsByType = $beritaAcara->documents->groupBy('document_type');
        $dokumentasi = $docsByType->get('dokumentasi_konsultasi', collect());
        if ($dokumentasi->isNotEmpty()) {
            foreach ($dokumentasi as $doc) {
                $section->addText("- ".$doc->file_name, ['size' => 11]);
            }
        } else {
            $section->addText("-", ['size' => 11]);
        }
        $section->addTextBreak(1);

        // Lampiran II: Peta/Hasil Plotting
        $section->addText(
            "Lampiran II: Peta " . ($isAsistensi ? 'Hasil Plotting' : 'Plotting'),
            ['size' => 11, 'bold' => true]
        );
        $section->addTextBreak(1);
        $petaDocs = $docsByType->get('peta_hasil_plotting', collect());
        if ($petaDocs->isNotEmpty()) {
            foreach ($petaDocs as $doc) {
                $section->addText("- ".$doc->file_name, ['size' => 11]);
            }
        } else {
            $section->addText("-", ['size' => 11]);
        }
        $section->addTextBreak(1);

        // Lampiran III: Absensi
        $section->addText(
            "Lampiran III: " . ($isAsistensi ? 'Absensi' : 'Absen'),
            ['size' => 11, 'bold' => true]
        );
        $section->addTextBreak(1);
        $absensiDocs = $docsByType->get('absensi_pendampingan', collect());
        if ($absensiDocs->isNotEmpty()) {
            foreach ($absensiDocs as $doc) {
                $section->addText("- ".$doc->file_name, ['size' => 11]);
            }
        } else {
            $section->addText("-", ['size' => 11]);
        }

        // Generate filename
        $time_file = $beritaAcara->created_at?->format('YmdHis') ?? now()->format('YmdHis');
        $requester_filename = $beritaAcara->request_form->nama_pemohon ?? ($beritaAcara->requester_name ?? 'pemohon');
        $filename = "Berita Acara - {$requester_filename} - {$time_file}.docx";

        // Save to temporary file and return response
        $tempFile = tempnam(sys_get_temp_dir(), 'berita_acara_');
        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save($tempFile);

        return response()->download($tempFile, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ])->deleteFileAfterSend(true);
    }
}
