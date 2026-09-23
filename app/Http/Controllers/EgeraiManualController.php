<?php

namespace App\Http\Controllers;

use App\Models\EgeraiJob;
use App\Services\Egerai\EgeraiExtractionService;
use App\Services\ProposalDocumentGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

/**
 * Faithful port of the reference e-GeRAI Python app's manual-entry variant
 * (`/proposal-manual`, `/proposal-manual/simpan`, `/proposal-manual/draft`):
 * type every field by hand instead of extracting from a source PDF, then
 * feed the exact same EgeraiJob -> review -> finalize pipeline as
 * EgeraiProposalController. Field `name`s below intentionally mirror the
 * original HTML form 1:1 so nothing needs re-mapping on the frontend.
 */
class EgeraiManualController extends Controller
{
    /** request key (prop__X) => prop dict key, mirrors extract.py's PROPOSAL_LABELS. */
    private const PROP_LABEL_MAP = [
        'prop__Nama_Pemohon' => 'Nama Pemohon',
        'prop__Jabatan_Pemohon' => 'Jabatan Pemohon',
        'prop__Nama_Perusahaan_Instansi' => 'Nama Perusahaan/Instansi',
        'prop__NIB' => 'NIB',
        'prop__NPWP' => 'NPWP',
        'prop__Nomor_Telepon_Selular' => 'Nomor Telepon Selular',
        'prop__Surat_Elektronik' => 'Surat Elektronik',
        'prop__Jenis_Kegiatan' => 'Jenis Kegiatan',
        'prop__Nama_Perairan' => 'Nama Perairan',
        'prop__Luas_Kebutuhan_Ruang' => 'Luas Kebutuhan Ruang',
        'prop__KBLI' => 'KBLI',
        'prop__Tanggal_Penyusunan' => 'Tanggal Penyusunan',
    ];

    /** request key => prop dict key, for fields that are already snake_case in both. */
    private const PROP_DIRECT_KEYS = [
        'prop__investasi' => 'investasi',
        'prop__tenaga_kerja' => 'tenaga_kerja',
        'prop__tenaga_kerja_asing' => 'tenaga_kerja_asing',
        'prop__mangrove_persen' => 'mangrove_persen',
        'prop__mangrove_kondisi' => 'mangrove_kondisi',
        'prop__desa_luas_ha' => 'desa_luas_ha',
        'prop__desa_penduduk' => 'desa_penduduk',
    ];

    /** request key => prop dict key, top-level (non prop__-prefixed) passthrough fields. */
    private const TOP_LEVEL_KEYS = [
        'deskripsi_kegiatan', 'manfaat_kegiatan', 'tujuan_kegiatan', 'instalasi_bangunan',
        'kegiatan_status', 'batas_utara', 'batas_timur', 'batas_selatan', 'batas_barat',
        'deskripsi_pemanfaatan_sekitar', 'mata_pencaharian', 'sumber_data_sosek',
        'tahun_data_sosek', 'aksesibilitas_lokasi', 'sumber_peta', 'mangrove_ada',
        'lamun_ada_manual', 'karang_ada', 'lamun_persen', 'lamun_kondisi',
        'karang_persen_manual', 'karang_kondisi',
    ];

    public function create()
    {
        return inertia('egerai/manual');
    }

    public function store(Request $request)
    {
        [$job, $dir] = $this->persistJob($request);

        return redirect()->route('egerai.review', $job);
    }

    public function simpan(Request $request)
    {
        $this->persistJob($request);

        return back()->with('success', 'Data draft proposal tersimpan.');
    }

    /** "Unduh Draft": generate + download immediately from whatever prop fields are filled, no laporan/review step. */
    public function draft(Request $request)
    {
        $prop = $this->mapPropFields($request);
        $lap = [];

        $outputPath = storage_path('app/tmp/Draft_Proposal_'.uniqid().'.docx');
        if (! is_dir(dirname($outputPath))) {
            mkdir(dirname($outputPath), 0755, true);
        }

        try {
            (new ProposalDocumentGenerator)->buildDocument($prop, [], $lap, [], $outputPath);

            return response()->download($outputPath, 'Draft_Proposal_'.now()->format('Ymd_His').'.docx')
                ->deleteFileAfterSend(true);
        } catch (\Throwable $exception) {
            Log::error('Gagal membuat draft proposal manual', ['message' => $exception->getMessage()]);

            return back()->withErrors(['proposal' => 'Gagal membuat draft: '.$exception->getMessage()]);
        }
    }

    /** @return array{0: EgeraiJob, 1: string} */
    private function persistJob(Request $request): array
    {
        $prop = $this->mapPropFields($request);

        $job = EgeraiJob::create(['status' => 'ready']);
        $dir = $job->storageDir();
        File::ensureDirectoryExists($dir);

        $lapFields = [];
        $lapImages = [];
        $lapSourcePath = null;
        $lapSourceFilename = null;
        if ($request->hasFile('laporan')) {
            $lapFile = $request->file('laporan');
            $lapPath = $dir.'/laporan.'.$lapFile->getClientOriginalExtension();
            $lapFile->move($dir, basename($lapPath));
            $lapFields = app(EgeraiExtractionService::class)->extractLaporan($lapPath);
            $lapSourcePath = basename($lapPath);
            $lapSourceFilename = $lapFile->getClientOriginalName();
        }

        $propImages = $this->storeImages($request, $dir);

        $job->update([
            'user_id' => $request->user()?->id,
            'prop_source_filename' => 'Diisi manual',
            'lap_source_path' => $lapSourcePath,
            'lap_source_filename' => $lapSourceFilename,
            'prop_fields' => $prop,
            'lap_fields' => $lapFields,
            'prop_images' => $this->manifest($propImages, $dir),
            'lap_images' => [],
        ]);

        $preview = null;
        try {
            $preview = (new ProposalDocumentGenerator)->renderPreviewHtml($prop, $propImages, $lapFields, []);
        } catch (\Throwable $exception) {
            Log::warning('Gagal membuat pratinjau dokumen manual: '.$exception->getMessage());
        }
        $job->update(['preview_html' => $preview]);

        return [$job, $dir];
    }

    /**
     * Converts the "Tanggal Penyusunan" date-input value (Y-m-d, or blank) into
     * the Indonesian long-form display string ("17 September 2026"), defaulting
     * to today when blank or unparseable so the field is never left empty.
     */
    private function formatTanggalPenyusunan(string $raw): string
    {
        $raw = trim($raw);

        if ($raw === '') {
            return now()->translatedFormat('j F Y');
        }

        try {
            return \Carbon\Carbon::parse($raw)->translatedFormat('j F Y');
        } catch (\Throwable $exception) {
            return now()->translatedFormat('j F Y');
        }
    }

    private function mapPropFields(Request $request): array
    {
        $prop = [];

        foreach (self::PROP_LABEL_MAP as $requestKey => $propKey) {
            $prop[$propKey] = (string) $request->input($requestKey, '');
        }
        // The form submits this as a native HTML date input (Y-m-d); convert it to
        // the Indonesian long-form string ("17 September 2026") the generator
        // expects everywhere it renders/parses this field (docChapterOne()'s
        // identity table, parseTanggalIndonesia()'s Gantt-chart start date), and
        // default to today when left blank instead of leaving it empty.
        $prop['Tanggal Penyusunan'] = $this->formatTanggalPenyusunan((string) $request->input('prop__Tanggal_Penyusunan', ''));
        foreach (self::PROP_DIRECT_KEYS as $requestKey => $propKey) {
            $prop[$propKey] = (string) $request->input($requestKey, '');
        }
        foreach (self::TOP_LEVEL_KEYS as $key) {
            $prop[$key] = (string) $request->input($key, '');
        }

        $prop['_lokasi_parts'] = [
            (string) $request->input('prop_loc__0', ''), // Desa
            (string) $request->input('prop_loc__1', ''), // Kecamatan
            (string) $request->input('prop_loc__2', ''), // Kabupaten
            (string) $request->input('prop_loc__3', ''), // Provinsi
        ];

        $prop['mangrove_spesies'] = $this->joinSpecies($request, 'prop__mangrove_spesies', 'prop__mangrove_spesies_lainnya');
        $prop['lamun_spesies'] = $this->joinSpecies($request, 'lamun_spesies', 'lamun_spesies_lainnya');
        $prop['karang_spesies'] = $this->joinSpecies($request, 'karang_spesies', 'karang_spesies_lainnya');

        $prop['instalasi_posisi'] = implode(', ', (array) $request->input('instalasi_posisi', []));

        $prop['non_reklamasi'] = $request->boolean('non_reklamasi');
        $prop['reklamasi'] = $request->boolean('reklamasi');
        $prop['kegiatan_berusaha'] = $request->boolean('kegiatan_berusaha');
        $prop['non_berusaha'] = $request->boolean('non_berusaha');
        $prop['non_strategis'] = $request->boolean('non_strategis');

        $prop['jadwal_kegiatan'] = $this->buildJadwalText($request->input('jadwal_table_json'));
        $prop['koordinat'] = $this->buildKoordinatRows($request->input('koordinat_table_json'));

        [$dukungSentence, $dukungLabels] = $this->buildDukungSummary($request);
        $prop['dokumen_data_dukung'] = $dukungSentence;
        $prop['_dukung_checked_labels'] = $dukungLabels;

        return $prop;
    }

    private function joinSpecies(Request $request, string $checkboxKey, string $lainnyaKey): string
    {
        $checked = (array) $request->input($checkboxKey, []);
        $lainnya = (string) $request->input($lainnyaKey, '');
        $extra = array_filter(array_map('trim', explode(',', $lainnya)));

        return implode(', ', array_merge($checked, $extra));
    }

    /** Mirrors the manual form's jadwal_table_json -> "Nama : Bulan X - Bulan Y." conversion. */
    private function buildJadwalText(?string $json): string
    {
        $rows = json_decode((string) $json, true) ?: [];
        $rows = array_values(array_filter($rows, fn ($r) => filled($r['nama'] ?? null) && filled($r['tahun_mulai'] ?? null) && filled($r['bulan_mulai'] ?? null) && filled($r['tahun_selesai'] ?? null) && filled($r['bulan_selesai'] ?? null)));
        if (! $rows) {
            return '';
        }

        $toIndex = fn ($tahun, $bulan) => ((int) $tahun) * 12 + (int) $bulan;
        $minIndex = min(array_map(fn ($r) => $toIndex($r['tahun_mulai'], $r['bulan_mulai']), $rows));

        $segments = [];
        foreach ($rows as $row) {
            $start = $toIndex($row['tahun_mulai'], $row['bulan_mulai']) - $minIndex + 1;
            $end = $toIndex($row['tahun_selesai'], $row['bulan_selesai']) - $minIndex + 1;
            $segments[] = trim($row['nama']).' : Bulan '.$start.' - Bulan '.$end.'.';
        }

        return implode(' ', $segments);
    }

    /** Mirrors the manual form's koordinat_table_json -> koordinat rows used by dataTable(). */
    private function buildKoordinatRows(?string $json): array
    {
        $decoded = json_decode((string) $json, true) ?: [];
        $rows = $decoded['rows'] ?? [];
        $rows = array_values(array_filter($rows, fn ($r) => filled($r[0] ?? null) && filled($r[1] ?? null)));

        // $r[2] is the row's "Keterangan" (KoordinatRow = [longitude, latitude,
        // keterangan] on the frontend) — keep it instead of discarding it, so it
        // reaches the generated docx's coordinate table.
        return collect($rows)->values()->map(fn ($r, $i) => [(string) ($i + 1), (string) $r[0], (string) $r[1], (string) ($r[2] ?? '')])->all();
    }

    /** @return array{0: string, 1: string[]} [sentence for chapter I, checked labels for chapter IV] */
    private function buildDukungSummary(Request $request): array
    {
        $items = [
            'nib' => 'NIB', 'sertifikat' => 'Sertifikat Kepemilikan Lahan Darat',
            'izin_lingkungan' => 'Surat Izin Lingkungan', 'ba_sosialisasi' => 'Berita Acara Sosialisasi',
            'identitas' => 'Dokumen Identitas dan Legalitas Pemohon/Perusahaan',
            'survei' => 'Dokumentasi Survei Lapangan Kondisi Eksisting Lokasi',
            'peta' => 'Peta Pendukung (Peta Lokasi, Site Plan, Pola Ruang Wilayah)',
            'dipa' => 'DIPA/RKAKL (Sumber Anggaran APBD/APBN) / Lainnya', 'sk_kkprl' => 'SK Penetapan KNMP',
        ];
        $labels = [];
        foreach ($items as $key => $label) {
            if ($request->boolean("dukung_$key")) {
                $labels[] = $label;
            }
        }
        foreach ((array) $request->input('dukung_custom_nama', []) as $nama) {
            if (filled($nama)) {
                $labels[] = trim($nama);
            }
        }

        return [implode(', ', $labels), $labels];
    }

    private function storeImages(Request $request, string $dir): array
    {
        $fields = [
            'siteplan' => 'img_siteplan', 'peta_lokasi' => 'img_peta_lokasi',
            'foto_mangrove' => 'img_foto_mangrove', 'foto_karang_insitu' => 'img_foto_karang_insitu',
            'foto_lamun' => 'img_foto_lamun', 'gambar_aksesibilitas' => 'img_aksesibilitas',
            'sertifikat_lahan' => 'img_sertifikat_lahan', 'dok_sosialisasi' => 'img_dok_sosialisasi',
            'dukung_dokumen' => 'img_dok_pendukung_lainnya', 'foto_pantai' => 'img_dok_kegiatan',
            'peta_pola_ruang' => 'img_dok_pemanfaatan_sekitar',
        ];
        $images = [];
        $imagesDir = $dir.'/images-manual';
        File::ensureDirectoryExists($imagesDir);

        foreach ($fields as $tag => $requestField) {
            if (! $request->hasFile($requestField)) {
                continue;
            }
            foreach ($request->file($requestField) as $index => $file) {
                $filename = "$tag-$index.".$file->getClientOriginalExtension();
                $file->move($imagesDir, $filename);
                $images[$tag][] = $imagesDir.'/'.$filename;
            }
        }

        return $images;
    }

    private function manifest(array $imagesByTag, string $dir): array
    {
        $manifest = [];
        foreach ($imagesByTag as $tag => $paths) {
            foreach ((array) $paths as $path) {
                $manifest[] = ['tag' => $tag, 'file' => ltrim(str_replace($dir, '', $path), '/')];
            }
        }

        return $manifest;
    }
}
