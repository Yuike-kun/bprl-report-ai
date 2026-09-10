<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Berita Acara {{ $beritaAcara->berita_acara_number }}</title>
    <style>
        /* ── Base & Typography ─────────────────────────── */
        @page {
            margin: 10mm 15mm 12mm 15mm;
        }

        body {
            font-family: "Times New Roman", Times, "DejaVu Serif", serif;
            font-size: 11pt;
            color: #000;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* ── Kop Surat 1:1 Resmi KKP ────────────────────── */
        .kop-surat {
            width: 100%;
            margin: 0 0 10px 0;
            padding: 0;
        }

        .kop-table {
            width: 100%;
            border-collapse: collapse;
        }

        .kop-table td {
            padding: 0;
            vertical-align: middle;
        }

        .kop-logo-cell {
            width: 120px;
            text-align: left;
        }

        .kop-logo-img {
            width: 120px;
            height: auto;
            display: block;
        }

        .kop-logo-spacer {
            width: 120px;
        }

        .kop-text-cell {
            text-align: center;
            padding: 0 8px;
        }

        .kop-line-1 {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            white-space: nowrap;
            line-height: 1.18;
            margin: 0;
            color: #000;
        }

        .kop-line-2 {
            font-size: 14.5pt;
            font-weight: normal;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            white-space: nowrap;
            line-height: 1.18;
            margin: 0;
            color: #000;
        }

        .kop-line-3 {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            white-space: nowrap;
            line-height: 1.18;
            margin: 0 0 3px 0;
            color: #000;
        }

        .kop-line-4 {
            font-size: 7.2pt;
            line-height: 1.25;
            text-transform: uppercase;
            white-space: nowrap;
            margin: 0;
            color: #000;
        }

        .kop-line-5 {
            font-size: 7.2pt;
            line-height: 1.25;
            text-transform: uppercase;
            white-space: nowrap;
            margin: 0;
            color: #000;
        }

        .kop-divider {
            width: 100%;
            margin-top: 5px;
            margin-bottom: 12px;
        }

        .kop-divider .line-thick {
            border-top: 2.5px solid #000;
            margin-bottom: 1.5px;
        }

        .kop-divider .line-thin {
            border-top: 0.8px solid #000;
        }

        /* ── Footer ────────────────────────────────────── */
        .footer {
            position: fixed;
            bottom: -8mm;
            left: 0;
            right: 0;
            height: 8mm;
            text-align: right;
            font-size: 8pt;
            color: #777;
            border-top: 0.5px solid #ccc;
            padding-top: 2px;
        }

        /* ── Document Titles ───────────────────────────── */
        h1.doc-title {
            text-align: center;
            font-size: 11.5pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 10px 0 2px 0;
            white-space: nowrap;
            letter-spacing: 0.2px;
        }

        .doc-number,
        .doc-subject {
            text-align: center;
            font-size: 11pt;
            margin: 0 0 2px 0;
            white-space: nowrap;
        }

        .doc-subject {
            margin-bottom: 14px;
        }

        /* ── Content Sections ──────────────────────────── */
        .intro {
            text-align: justify;
            margin: 10px 0;
            line-height: 1.4;
        }

        ol.attendees {
            margin: 0 0 10px 24px;
            padding: 0;
        }

        ol.attendees li {
            margin-bottom: 2px;
        }

        .section-title {
            font-weight: bold;
            font-size: 11pt;
            margin: 12px 0 4px 0;
            color: #000;
        }

        table.result-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        table.result-table td {
            border: none;
            padding: 4px 0;
            vertical-align: top;
            text-align: justify;
            background-color: transparent;
            font-size: 10.5pt;
            line-height: 1.4;
        }

        table.result-table td p {
            margin: 0 0 3px 0;
        }

        table.result-table td p:last-child {
            margin-bottom: 0;
        }

        table.hasil-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0 14px 0;
        }

        table.hasil-table td {
            border: 1px solid #777;
            padding: 8px 10px;
            width: 50%;
            text-align: center;
            font-weight: bold;
            font-size: 10.5pt;
            background-color: #fff;
        }

        table.hasil-table td.active {
            background-color: #eaf2fd;
            border-color: #1976d2;
            color: #0d47a1;
        }

        .chk-icon {
            width: 13px;
            height: 13px;
            vertical-align: -1px;
            margin-right: 6px;
            display: inline-block;
        }

        .closing {
            text-align: justify;
            margin: 12px 0 10px 0;
            line-height: 1.4;
        }

        /* ── Signatures ────────────────────────────────── */
        table.sign-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            page-break-inside: avoid;
        }

        table.sign-table th,
        table.sign-table td {
            border: 1px solid #444;
            padding: 5px 6px;
            font-size: 10pt;
        }

        table.sign-table th {
            background-color: #f7f7f7;
            text-align: center;
            font-weight: bold;
            color: #000;
        }

        table.sign-table td.no {
            text-align: center;
            width: 25px;
        }

        table.sign-table td.ttd {
            text-align: center;
            height: 52px;
            vertical-align: middle;
        }

        table.sign-table td.ttd img {
            max-height: 48px;
            max-width: 120px;
        }

        /* ── Page Breaks & Attachments ─────────────────── */
        .page-break {
            page-break-before: always;
        }


        .lampiran-title {
            font-weight: bold;
            font-size: 11pt;
            margin: 14px 0 6px 0;
            border-bottom: 1px solid #ccc;
            padding-bottom: 3px;
            color: #000;
        }

        table.doc-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        table.doc-grid td {
            width: 50%;
            border: 1px solid #ccc;
            padding: 6px;
            text-align: center;
            vertical-align: middle;
            background: #fafafa;
        }

        table.doc-grid img {
            max-width: 100%;
            max-height: 200px;
        }

        .file-line {
            padding: 4px 0;
            font-size: 10pt;
            border-bottom: 1px dotted #e2e2e2;
            margin: 0;
        }

        .file-line:last-child {
            border-bottom: none;
        }

        /* ── Coordinate Table ───────────────────────────────── */
        table.coord-table {
            width: auto;
            border-collapse: collapse;
            margin: 8px 0 14px 0;
            font-size: 10.5pt;
        }

        table.coord-table th {
            border: 1px solid #555;
            padding: 5px 12px;
            background: #f0f0f0;
            text-align: center;
            font-weight: bold;
        }

        table.coord-table td {
            border: 1px solid #555;
            padding: 5px 12px;
            text-align: center;
        }

        /* ── Lampiran Header (right-aligned) ────────────────── */
        .lampiran-header {
            margin-bottom: 12px;
            text-align: right;
        }

        .lampiran-header p {
            margin: 0 0 2px 0;
            font-size: 10.5pt;
        }
    </style>
</head>

<body>

    {{-- ── Kop Surat 1:1 Resmi KKP ── --}}
    <div class="kop-surat">
        <table class="kop-table">
            <tr>
                <td class="kop-logo-cell">
                    @if ($logoPath ?? false)
                        <img src="{{ $logoPath }}" class="kop-logo-img">
                    @endif
                </td>
                <td class="kop-text-cell">
                    <div class="kop-line-1">KEMENTERIAN KELAUTAN DAN PERIKANAN</div>
                    <div class="kop-line-2">DIREKTORAT JENDERAL PENATAAN RUANG LAUT</div>
                    <div class="kop-line-3">BALAI PENATAAN RUANG LAUT MAKASSAR</div>
                    <div class="kop-line-4">JALAN MAKMUR DAENG SITAKKA NOMOR 129 MAROS 90511, TELEPON (0411) 371337 FAKSIMILI (0411) 371337</div>
                    <div class="kop-line-5">LAMAN www.kkp.go.id SUREL bprlmakassar@kkp.go.id</div>
                </td>
                <td class="kop-logo-spacer"></td>
            </tr>
        </table>
        <div class="kop-divider">
            <div class="line-thick"></div>
            <div class="line-thin"></div>
        </div>
    </div>

    @php
        $tanggal = \Carbon\Carbon::parse($beritaAcara->consultation_date)->locale('id');
        $hari = $tanggal->translatedFormat('l');
        $tglAngka = $tanggal->format('d');
        $bulanKata = $tanggal->translatedFormat('F');
        $tahun = $tanggal->format('Y');

        $permitTypeLabel = [
            'persetujuan' => 'Persetujuan KKPRL',
            'konfirmasi' => 'Konfirmasi KKPRL',
        ][$beritaAcara->permit_type] ?? $beritaAcara->permit_type;

        $modeLabel = [
            'daring' => 'Daring (Online)',
            'luring' => 'Luring (Tatap Muka)',
            'hybrid' => 'Hybrid',
        ][$beritaAcara->implementation_mode] ?? $beritaAcara->implementation_mode;

        $activityDetailRaw = $beritaAcara->activity_detail;
        if (is_array($activityDetailRaw)) {
            $parts = array_map(function($item) use ($beritaAcara) {
                return $item === 'Yang lain' ? ($beritaAcara->activity_detail_other ?: 'Yang lain') : $item;
            }, $activityDetailRaw);
            $activityDetail = implode(', ', $parts);
        } else {
            $activityDetail = $activityDetailRaw === 'Yang lain'
                ? $beritaAcara->activity_detail_other
                : $activityDetailRaw;
        }

        $waterName = $beritaAcara->water_name === 'Lainnya'
            ? $beritaAcara->water_name_other
            : $beritaAcara->water_name;

        $location = $beritaAcara->location === 'Lainnya'
            ? $beritaAcara->location_other
            : $beritaAcara->location;

        $ownedDocs = collect($beritaAcara->owned_documents ?? [])
            ->map(fn($d) => $d === 'Yang lain' ? $beritaAcara->owned_documents_other : $d)
            ->filter()
            ->implode(', ');

        $locationName = static function ($value, string $modelClass) {
            if ($value === null || $value === '') {
                return $value;
            }

            if (is_numeric($value)) {
                return $modelClass::find($value)?->name ?? $value;
            }

            return $value;
        };

        $provinceName = $locationName($beritaAcara->province, \App\Models\Province::class);
        $regencyName = $locationName($beritaAcara->regency, \App\Models\Regency::class);
        $districtName = $locationName($beritaAcara->district, \App\Models\District::class);

        $docsByType = $beritaAcara->documents->groupBy('document_type');
        $sigDoc = optional($docsByType->get('tanda_tangan_perwakilan'))->first();

        $getSignatureSrc = static function ($sig) {
            if (!$sig) {
                return null;
            }
            if (str_starts_with($sig, 'data:image/')) {
                return $sig;
            }
            if (file_exists($sig)) {
                $type = pathinfo($sig, PATHINFO_EXTENSION);
                $data = file_get_contents($sig);
                return 'data:image/' . ($type ?: 'png') . ';base64,' . base64_encode($data);
            }
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($sig)) {
                $path = \Illuminate\Support\Facades\Storage::disk('public')->path($sig);
                $type = pathinfo($path, PATHINFO_EXTENSION);
                $data = file_get_contents($path);
                return 'data:image/' . ($type ?: 'png') . ';base64,' . base64_encode($data);
            }
            if (file_exists(public_path($sig))) {
                $type = pathinfo(public_path($sig), PATHINFO_EXTENSION);
                $data = file_get_contents(public_path($sig));
                return 'data:image/' . ($type ?: 'png') . ';base64,' . base64_encode($data);
            }
            if (base64_decode($sig, true) !== false && preg_match('%^[a-zA-Z0-9/+]*={0,2}$%', $sig)) {
                return 'data:image/png;base64,' . $sig;
            }
            return $sig;
        };

        $documentPath = static function ($document) {
            if (!$document || !\Illuminate\Support\Facades\Storage::disk('public')->exists($document->file_path)) {
                return null;
            }

            return \Illuminate\Support\Facades\Storage::disk('public')->path($document->file_path);
        };

        $rawRequesterSig = $documentPath($sigDoc);
        $signaturePath = $getSignatureSrc($rawRequesterSig);

        // Petugas Pembuat Berita Acara (prioritize staff1 / staffMaker)
        $staffMaker = $beritaAcara->staff1
            ?? $beritaAcara->staff->first()
            ?? ($beritaAcara->permohonanKonsultasi?->assign_to_staff->first()?->Staff)
            ?? ($beritaAcara->request_form?->assign_to_staff->first()?->Staff);

        $rawStaffSig = $beritaAcara->permohonanKonsultasi?->staff_tanda_tangan
            ?? $beritaAcara->request_form?->staff_tanda_tangan
            ?? $staffMaker?->user?->signature;

        $staffSignature = $getSignatureSrc($rawStaffSig);

        // ── Build full staff list ────────────────────────────────────────
        // Priority: BelongsToMany staff (ordered by sort_order), then fallback to staff1-4 columns
        $allStaff = $beritaAcara->staff->isNotEmpty()
            ? $beritaAcara->staff
            : collect(array_filter([
                $beritaAcara->staff1,
                $beritaAcara->staff2,
                $beritaAcara->staff3,
                $beritaAcara->staff4,
            ]));

        // Deduplicate by ID in case both sources overlap
        $allStaff = $allStaff->unique('id')->values();

        $svgChecked = 'data:image/svg+xml;base64,' . base64_encode('<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><rect width="18" height="18" rx="3" fill="#0d47a1"/><path d="M4 9.5L7.5 13L14 5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>');
        $svgUnchecked = 'data:image/svg+xml;base64,' . base64_encode('<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><rect x="1" y="1" width="16" height="16" rx="3" fill="#ffffff" stroke="#666666" stroke-width="1.8"/></svg>');

        $isAsistensi = $beritaAcara->consultation_stage === 'asistensi';
    @endphp

    <h1 class="doc-title">Berita Acara Pendampingan Permohonan</h1>
    <p class="doc-number">{{ $beritaAcara->berita_acara_number }}</p>
    <p class="doc-subject"><strong>{{ $beritaAcara->legal_entity_name }}</strong> di {{ $provinceName }}</p>

    <p class="intro">
        Pada hari ini <strong>{{ $hari }}</strong> tanggal <strong>{{ $tglAngka }}</strong> Bulan
        <strong>{{ $bulanKata }}</strong> Tahun <strong>{{ $tahun }}</strong>, kami yang bertanda tangan
        di bawah ini telah melaksanakan Pendampingan Permohonan atas rencana permohonan
        <strong>{{ $permitTypeLabel }}</strong> untuk permohonan
        <strong>{{ $activityDetail }}</strong> dengan KBLI {{ $beritaAcara->kbli ?: '-' }} oleh
        <strong>{{ $beritaAcara->legal_entity_name }}</strong> di Kecamatan {{ $districtName }},
        Kabupaten {{ $regencyName }}, Provinsi {{ $provinceName }} yang dilaksanakan secara
        <em>{{ $modeLabel }}</em> di {{ $location }} dan dihadiri oleh:
    </p>

    <ol class="attendees">
        @forelse ($allStaff as $s)
            <li>{{ $s->user->name ?? 'Petugas Pendamping' }} ({{ $s->position ?? 'Petugas Pendamping' }})</li>
        @empty
            <li>Petugas Pendamping (Petugas Pendamping)</li>
        @endforelse
        <li>{{ $beritaAcara->requester_name }} ({{ $beritaAcara->requester_position }})</li>
    </ol>

    <p>Berdasarkan hasil pelaksanaan pendampingan permohonan, diperoleh hasil sebagai berikut:</p>

    @if ($isAsistensi)
        <div class="section-title">1. Deskripsi rencana kegiatan untuk permohonan</div>
        <table class="result-table">
            <tr>
                <td>
                    <p><strong>Subjek Hukum</strong> : {{ $beritaAcara->legal_entity_name }}</p>
                    <p><strong>Rencana Kegiatan</strong> : {{ $activityDetail }}</p>
                    <p><strong>Luas/Panjang</strong> : {{ $beritaAcara->planned_area }} {{ $beritaAcara->planned_area_unit }}</p>
                    <p>{{ $beritaAcara->activity_description }}</p>
                </td>
            </tr>
        </table>

        <div class="section-title">2. Lokasi yang akan dimohonkan</div>
        <p class="intro">
            Adapun rencana lokasi kegiatan {{ $activityDetail }} yang akan dilakukan oleh
            {{ $beritaAcara->legal_entity_name }} terletak di perairan {{ $waterName }} di
            Kecamatan {{ $districtName }}, Kabupaten {{ $regencyName }}, Provinsi {{ $provinceName }}
            dengan titik koordinat sebagai berikut:
        </p>
        <table class="result-table">
            <tr>
                <td style="white-space: pre-line;">{{ $beritaAcara->coordinate_points }}</td>
            </tr>
        </table>

        <div class="section-title">3. Informasi Pemanfaatan Ruang Laut Sekitar</div>
        <table class="result-table">
            <tr>
                <td>{{ $beritaAcara->surrounding_utilization }}</td>
            </tr>
        </table>

        <div class="section-title">4. Data Kondisi Terkini Lokasi dan Sekitar</div>
        <table class="result-table">
            <tr>
                <td>{{ $beritaAcara->environmental_condition }}</td>
            </tr>
        </table>

        <div class="section-title">5. Perizinan yang telah dimiliki oleh calon pemohon</div>
        <table class="result-table">
            <tr>
                <td>{{ $ownedDocs ?: '-' }}</td>
            </tr>
        </table>

        <div class="section-title">6. Informasi Hal lainnya yang diperlukan</div>
        <table class="result-table">
            <tr>
                <td>{{ $beritaAcara->other_information ?: '-' }}</td>
            </tr>
        </table>

        <p style="margin: 8px 0 4px 0;"><strong>Hasil Konsultasi</strong></p>
        <table class="hasil-table">
            <tr>
                <td class="{{ $beritaAcara->consultation_result === 'dokumen_sesuai' ? 'active' : '' }}">
                    <img src="{{ $beritaAcara->consultation_result === 'dokumen_sesuai' ? $svgChecked : $svgUnchecked }}" class="chk-icon">
                    Dokumen Sudah Sesuai
                </td>
                <td class="{{ $beritaAcara->consultation_result === 'perlu_perbaikan' ? 'active' : '' }}">
                    <img src="{{ $beritaAcara->consultation_result === 'perlu_perbaikan' ? $svgChecked : $svgUnchecked }}" class="chk-icon">
                    Dokumen Perlu Perbaikan
                </td>
            </tr>
        </table>
    @else
        <div class="section-title">1. Lokasi yang akan dimohonkan</div>
        <p class="intro">
            Adapun rencana lokasi kegiatan {{ $activityDetail }} yang akan dilakukan oleh
            {{ $beritaAcara->legal_entity_name }} terletak di perairan {{ $waterName }} di
            Kecamatan {{ $districtName }}, Kabupaten {{ $regencyName }}, Provinsi {{ $provinceName }}.
        </p>

        <div class="section-title">2. Catatan Hasil Konsultasi/Koordinasi</div>
        <table class="result-table">
            <tr>
                <td style="white-space: pre-line;">{{ $beritaAcara->consultation_notes ?: '-' }}</td>
            </tr>
        </table>
    @endif

    <p class="closing">
        Demikian berita acara ini dibuat dengan sebenar-benarnya, untuk dapat dipergunakan sebagaimana mestinya.
    </p>

    <table class="sign-table">
        <thead>
            <tr>
                <th style="width: 25px;">No</th>
                <th>Nama</th>
                <th>Jabatan/Instansi</th>
                <th style="width: 130px;">Tanda Tangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($allStaff as $i => $staff)
                @php
                    $rawSig = ($i === 0 && $staffSignature)
                        ? $staffSignature
                        : $getSignatureSrc($staff->user?->signature ?? null);
                @endphp
                <tr>
                    <td class="no">{{ $i + 1 }}</td>
                    <td>{{ $staff->user->name ?? '-' }}</td>
                    <td>{{ $staff->position ?? 'Petugas Pendamping' }}</td>
                    <td class="ttd">
                        @if ($rawSig)
                            <img src="{{ $rawSig }}">
                        @endif
                    </td>
                </tr>
            @endforeach
            <tr>
                <td class="no">{{ $allStaff->count() + 1 }}</td>
                <td>{{ $beritaAcara->requester_name }}</td>
                <td>{{ $beritaAcara->requester_position }}</td>
                <td class="ttd">
                    @if ($signaturePath)
                        <img src="{{ $signaturePath }}">
                    @endif
                </td>
            </tr>
        </tbody>
    </table>

    {{-- ── Attachments ── --}}
    <div class="page-break"></div>
    <div class="lampiran-header">
        <p>Lampiran Berita Acara</p>
        <p>Nomor : {{ $beritaAcara->berita_acara_number }}</p>
        <p>Tanggal : {{ $tanggal->translatedFormat('d F Y') }}</p>
    </div>

    <div class="lampiran-title">Lampiran I: Dokumentasi</div>
    <table class="doc-grid">
        @foreach ($docsByType->get('dokumentasi_konsultasi', collect())->chunk(2) as $row)
            <tr>
                @foreach ($row as $doc)
                    <td>
                        @if (($p = $documentPath($doc)))
                            <img src="{{ $p }}">
                        @else
                            {{ $doc->file_name }}
                        @endif
                    </td>
                @endforeach
            </tr>
        @endforeach
    </table>

    <div class="lampiran-title">Lampiran II: Peta {{ $isAsistensi ? 'Hasil Plotting' : 'Plotting' }}</div>
    @php
        $petaDocs = $docsByType->get('peta_hasil_plotting', collect());
    @endphp
    @if ($petaDocs->isEmpty())
        <p class="file-line">-</p>
    @else
        @foreach ($petaDocs as $doc)
            @if (
                ($p = $documentPath($doc)) &&
                    in_array(strtolower(pathinfo($p, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png']))
                <div style="margin-bottom: 8px;">
                    <img src="{{ $p }}" style="max-width: 100%; max-height: 280px;">
                </div>
            @else
                <p class="file-line">
                    <strong>{{ $doc->file_name }}</strong> <em>(Dokumen PDF terlampir utuh pada halaman lanjutan berkas ini)</em>
                </p>
            @endif
        @endforeach
    @endif

    <div class="lampiran-title">Lampiran III: {{ $isAsistensi ? 'Absensi' : 'Absen' }}</div>
    @php
        $absensiDocs = $docsByType->get('absensi_pendampingan', collect());
    @endphp
    @if ($absensiDocs->isEmpty())
        <p class="file-line">-</p>
    @else
        @foreach ($absensiDocs as $doc)
            @if (
                ($p = $documentPath($doc)) &&
                    in_array(strtolower(pathinfo($p, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png']))
                <div style="margin-bottom: 8px;">
                    <img src="{{ $p }}" style="max-width: 100%; max-height: 280px;">
                </div>
            @else
                <p class="file-line">
                    <strong>{{ $doc->file_name }}</strong> <em>(Dokumen PDF terlampir utuh pada halaman lanjutan berkas ini)</em>
                </p>
            @endif
        @endforeach
    @endif

    @if ($isAsistensi)
        <div class="lampiran-title">Lampiran IV: Dokumen Konsultasi</div>
        @foreach ([
            'rencana_bangunan_instalasi' => 'Dokumen Rencana Bangunan dan Instalasi di Laut',
            'informasi_pemanfaatan_ruang_laut' => 'Dokumen Informasi Pemanfaatan Ruang Laut',
            'data_kondisi_terkini' => 'Dokumen Data Kondisi Terkini Lokasi dan Sekitar',
            'persyaratan_lainnya' => 'Dokumen Persyaratan Lainnya',
            'titik_koordinat' => 'Dokumen Titik Koordinat Lokasi',
        ] as $type => $label)
            @php
                $matchingDocs = $docsByType->get($type, collect());
            @endphp
            <p class="file-line">
                <strong>{{ $label }}:</strong>
                @if ($matchingDocs->isEmpty())
                    -
                @else
                    {{ $matchingDocs->pluck('file_name')->implode(', ') }}
                    @if ($matchingDocs->contains(fn($d) => strtolower(pathinfo($d->file_path ?? '', PATHINFO_EXTENSION)) === 'pdf'))
                        <em>(terlampir pada berkas PDF ini)</em>
                    @endif
                @endif
            </p>
        @endforeach
    @endif

</body>

</html>
