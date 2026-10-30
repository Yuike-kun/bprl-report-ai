<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Berita Acara {{ $beritaAcara->berita_acara_number }}</title>
    <style>
        /* ── Base & Typography ─────────────────────────── */
        @page {
            margin: 1in;
        }

        body {
            font-family: "Arial", sans-serif;
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

        .kop-logo-cell {
            width: 30mm;
            text-align: left;
            padding: 0 4mm 0 0;
            vertical-align: middle;
        }

        .kop-logo-img {
            width: 25mm;
            height: auto;
            display: block;
        }

        .kop-logo-spacer {
            width: 30mm;
        }

        .kop-text-cell {
            width: 120mm;
            vertical-align: middle;
            text-align: center;
            padding: 0 3mm;
        }

        .kop-link {
            color: #0b3ea6;
            text-decoration: underline;
        }

        .kop-line-1,
        .kop-line-2,
        .kop-line-3 {
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            line-height: 1.2;
            margin: 0;
            color: #0b3ea6;
            white-space: normal;
        }

        .kop-line-1 {
            font-size: 12.5pt;
        }

        .kop-line-2 {
            font-size: 13.5pt;
            font-weight: normal;
        }

        .kop-line-3 {
            font-size: 12.5pt;
            margin-bottom: 3px;
        }

        .kop-line-4,
        .kop-line-5 {
            font-size: 8pt;
            line-height: 1.3;
            text-transform: uppercase;
            white-space: normal;
            word-wrap: break-word;
            overflow-wrap: break-word;
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

        .result-box {
            padding: 4px 0;
            margin-bottom: 10px;
            text-align: justify;
            font-size: 10.5pt;
            line-height: 1.4;
        }

        table.hasil-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0 14px 0;
        }

        table.hasil-table td {
            border: none;
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

        table.hasil-table thead, table.hasil-table tbody > tr > td,
        table.sign-table thead, table.sign-table tbody > tr > td,
        table.coord-table thead, table.coord-table tbody > tr > td
        {
            border: 1px solid black;
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
            border: none;
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
            border: none;
            padding: 6px;
            text-align: left;
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
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0 14px 0;
            font-size: 10.5pt;
        }

        table.coord-table th {
            border: none;
            padding: 5px 12px;
            background: #f0f0f0;
            text-align: center;
            font-weight: bold;
        }

        table.coord-table td {
            border: none;
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

        /* ── Detail Lampiran — full-width ───── */
        .lampiran-column {
            page-break-before: always;
            width: 100%;
            float: none;
            margin: 0;
            font-size: 8.5pt;
            line-height: 1.35;
            color: #333;
        }

        .lampiran-column .lampiran-title {
            font-weight: bold;
            font-size: 9pt;
            margin: 8px 0 3px 0;
            border-bottom: 1px solid #ccc;
            padding-bottom: 2px;
            color: #000;
        }

        .lampiran-column .file-line {
            padding: 1px 0;
            font-size: 8.5pt;
            border-bottom: 1px dotted #e2e2e2;
            margin: 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .lampiran-column .link-line {
            margin: 0 0 3px 12px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .lampiran-column .link-line a {
            color: #0b3ea6;
            font-size: 8pt;
            text-decoration: underline;
        }

        .lampiran-column .file-line:last-child {
            border-bottom: none;
        }

        .lampiran-column .lampiran-header {
            margin-bottom: 8px;
            text-align: right;
        }

        .lampiran-column .lampiran-header p {
            margin: 0 0 1px 0;
            font-size: 8.5pt;
        }
    </style>
</head>

<body>

    {{-- ── Kop Surat 1:1 Resmi KKP ── --}}
    <div class="kop-surat">
        <table class="kop-table">
            <colgroup>
                <col style="width: 30mm;">
                <col style="width: 120mm;">
                <col style="width: 30mm;">
            </colgroup>
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
                    <div class="kop-line-4">JALAN MAKMUR DAENG SITAKKA NOMOR 129 MAROS 90511, TELEPON (0411) 371337
                        FAKSIMILI (0411) 371337</div>
                    <div class="kop-line-5">LAMAN <span class="kop-link">www.kkp.go.id</span> SUREL <span
                            class="kop-link">bprlmakassar@kkp.go.id</span></div>
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

        $permitTypeLabel =
            [
                'persetujuan' => 'Persetujuan KKPRL',
                'konfirmasi' => 'Konfirmasi KKPRL',
            ][$beritaAcara->permit_type] ?? $beritaAcara->permit_type;

        $modeLabel =
            [
                'daring' => 'Daring (Online)',
                'luring' => 'Luring (Tatap Muka)',
                'hybrid' => 'Hybrid',
            ][$beritaAcara->implementation_mode] ?? $beritaAcara->implementation_mode;

        $activityDetailRaw = $beritaAcara->activity_detail;
        if (is_array($activityDetailRaw)) {
            $parts = array_map(function ($item) use ($beritaAcara) {
                return $item === 'Yang lain' ? ($beritaAcara->activity_detail_other ?: 'Yang lain') : $item;
            }, $activityDetailRaw);
            $activityDetail = implode(', ', $parts);
        } else {
            $activityDetail =
                $activityDetailRaw === 'Yang lain' ? $beritaAcara->activity_detail_other : $activityDetailRaw;
        }

        // Wilayah/lokasi values are ALL CAPS in their source tables; render
        // them as normal text in the letter body (see App\Support\TextCase).
        $waterName = \App\Support\TextCase::humanize(
            $beritaAcara->water_name === 'Lainnya' ? $beritaAcara->water_name_other : $beritaAcara->water_name,
        );

        $location = \App\Support\TextCase::humanize(
            $beritaAcara->location === 'Lainnya' ? $beritaAcara->location_other : $beritaAcara->location,
        );

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

        $provinceName = \App\Support\TextCase::humanize($locationName($beritaAcara->province, \App\Models\Province::class));
        $regencyName = \App\Support\TextCase::humanize($locationName($beritaAcara->regency, \App\Models\Regency::class));
        $districtName = \App\Support\TextCase::humanize($locationName($beritaAcara->district, \App\Models\District::class));

        // The letter body writes the literal word "Kabupaten" before the
        // regency name, but names from the wilayah dump already start with
        // "Kabupaten "/"Kota " — fold them together so the line reads
        // "Kabupaten Bantaeng" instead of "Kabupaten Kabupaten Bantaeng",
        // and let cities keep their correct "Kota" label.
        $regencyLabel = preg_match('/^(Kabupaten|Kota)\b/i', (string) $regencyName)
            ? (string) $regencyName
            : 'Kabupaten '.$regencyName;

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

        // First try the uploaded representative signature document
        $rawRequesterSig = $sigDoc ? $documentPath($sigDoc) : null;

        // Fallback: use the original tanda_tangan from the consultation request (pemohon's drawn signature)
        if (!$rawRequesterSig && $beritaAcara->permohonanKonsultasi) {
            $rawRequesterSig = $beritaAcara->permohonanKonsultasi->tanda_tangan;
        }

        $signaturePath = $getSignatureSrc($rawRequesterSig);

        // Petugas Pembuat Berita Acara (prioritize staff1 / staffMaker)
        $staffMaker =
            $beritaAcara->staff1 ??
            ($beritaAcara->staff->first() ??
                ($beritaAcara->permohonanKonsultasi?->assign_to_staff->first()?->Staff ??
                    $beritaAcara->request_form?->assign_to_staff->first()?->Staff));

        // NOTE: Do NOT use permohonanKonsultasi->staff_tanda_tangan here.
        // That field stores a signature collected on the consultation signature-pad
        // page and is NOT guaranteed to belong to any particular staff member.
        // Each staff should display their own user signature below.
        $staffSignature = null;

        // ── Build full staff list ────────────────────────────────────────
        // Merge BelongsToMany staff (ordered by sort_order) with the legacy
        // staff_1..staff_4 columns so no member is ever omitted.
        $allStaff = $beritaAcara->staff->isNotEmpty()
            ? $beritaAcara->staff
            : collect();

        $columnStaff = collect(
            array_filter([
                $beritaAcara->staff1,
                $beritaAcara->staff2,
                $beritaAcara->staff3,
                $beritaAcara->staff4,
            ]),
        );

        $allStaff = $allStaff
            ->merge($columnStaff)
            ->unique('id')
            ->values();

        $svgChecked =
            'data:image/svg+xml;base64,' .
            base64_encode(
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><rect width="18" height="18" rx="3" fill="#0d47a1"/><path d="M4 9.5L7.5 13L14 5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
            );
        $svgUnchecked =
            'data:image/svg+xml;base64,' .
            base64_encode(
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><rect x="1" y="1" width="16" height="16" rx="3" fill="#ffffff" stroke="#666666" stroke-width="1.8"/></svg>',
            );

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
        {{ $regencyLabel }}, Provinsi {{ $provinceName }} yang dilaksanakan secara
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
        <div class="result-box">
                    <p><strong>Subjek Hukum</strong> : {{ $beritaAcara->legal_entity_name }}</p>
                    <p><strong>Rencana Kegiatan</strong> : {{ $activityDetail }}</p>
                    <p><strong>Luas/Panjang</strong> : {{ $beritaAcara->planned_area }}
                        {{ $beritaAcara->planned_area_unit }}</p>
                    <div>{!! \App\Support\BeritaAcaraHtml::render($beritaAcara->activity_description) !!}</div>
                </div>

        <div class="section-title">2. Lokasi yang akan dimohonkan</div>
        <p class="intro">
            Adapun rencana lokasi kegiatan {{ $activityDetail }} yang akan dilakukan oleh
            {{ $beritaAcara->legal_entity_name }} terletak di perairan {{ $waterName }} di
            Kecamatan {{ $districtName }}, {{ $regencyLabel }}, Provinsi {{ $provinceName }}
            dengan titik koordinat sebagai berikut:
        </p>
        @php
            $coordinateRows = collect(\App\Support\CoordinatePoints::parse($beritaAcara->coordinate_points));
        @endphp
        @if ($coordinateRows->isNotEmpty())
            <table class="result-table coord-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Bujur (Longitude)</th>
                        <th>Lintang (Latitude)</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($coordinateRows as $row)
                        <tr>
                            <td>{{ $row['no'] }}</td>
                            <td>{{ $row['lon'] }}</td>
                            <td>{{ $row['lat'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p style="white-space: pre-line; text-align: left;">{{ $beritaAcara->coordinate_points ?: '-' }}</p>
        @endif

        <div class="section-title">3. Informasi Pemanfaatan Ruang Laut Sekitar</div>
        <div class="result-box">{!! \App\Support\BeritaAcaraHtml::render($beritaAcara->surrounding_utilization) !!}</div>

        <div class="section-title">4. Data Kondisi Terkini Lokasi dan Sekitar</div>
        <div class="result-box">{!! \App\Support\BeritaAcaraHtml::render($beritaAcara->environmental_condition) !!}</div>

        <div class="section-title">5. Perizinan yang telah dimiliki oleh calon pemohon</div>
        <div class="result-box">{{ $ownedDocs ?: '-' }}</div>

        <div class="section-title">6. Informasi Hal lainnya yang diperlukan</div>
        <div class="result-box">{!! \App\Support\BeritaAcaraHtml::render($beritaAcara->other_information) !!}</div>

        <p style="margin: 8px 0 4px 0;"><strong>Hasil Konsultasi</strong></p>
        <table class="hasil-table">
            <tr>
                <td class="{{ $beritaAcara->consultation_result === 'dokumen_sesuai' ? 'active' : '' }}">
                    <img src="{{ $beritaAcara->consultation_result === 'dokumen_sesuai' ? $svgChecked : $svgUnchecked }}"
                        class="chk-icon">
                    Dokumen Sudah Sesuai
                </td>
                <td class="{{ $beritaAcara->consultation_result === 'perlu_perbaikan' ? 'active' : '' }}">
                    <img src="{{ $beritaAcara->consultation_result === 'perlu_perbaikan' ? $svgChecked : $svgUnchecked }}"
                        class="chk-icon">
                    Dokumen Perlu Perbaikan
                </td>
            </tr>
        </table>
    @else
        <div class="section-title">1. Lokasi yang akan dimohonkan</div>
        <p class="intro">
            Adapun rencana lokasi kegiatan {{ $activityDetail }} yang akan dilakukan oleh
            {{ $beritaAcara->legal_entity_name }} terletak di perairan {{ $waterName }} di
            Kecamatan {{ $districtName }}, {{ $regencyLabel }}, Provinsi {{ $provinceName }}.
        </p>

        <div class="section-title">2. Catatan Hasil Konsultasi/Koordinasi</div>
        <div class="result-box">{!! \App\Support\BeritaAcaraHtml::render($beritaAcara->consultation_notes) !!}</div>
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
                    $rawSig = $getSignatureSrc($staff->user?->signature ?? null);
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

    {{-- ── Attachments (full-width below main body) ── --}}
    <div class="lampiran-column">
    <div class="lampiran-header">
        <p>Lampiran Berita Acara</p>
        <p>Nomor : {{ $beritaAcara->berita_acara_number }}</p>
        <p>Tanggal : {{ $tanggal->translatedFormat('d F Y') }}</p>
    </div>
    @php
        $docUrl = static fn($d) => $d->file_path
            ? \Illuminate\Support\Facades\Storage::disk('public')->url($d->file_path)
            : null;
        $isImageFile = static fn($p) => $p && in_array(strtolower(pathinfo($p, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png'], true);
    @endphp

    <div class="lampiran-title">Lampiran I: Dokumentasi</div>
    <table class="doc-grid">
        @foreach ($docsByType->get('dokumentasi_konsultasi', collect())->chunk(2) as $row)
            <tr>
                @foreach ($row as $doc)
                    <td>
                        @if ($isImageFile($p = $documentPath($doc)))
                            <img src="{{ $p }}">
                        @else
                            {{ $doc->file_name }}
                            @if ($url = $docUrl($doc))
                                <br><a href="{{ $url }}" style="font-size: 8pt;">{{ $url }}</a>
                            @endif
                        @endif
                    </td>
                @endforeach
            </tr>
        @endforeach
    </table>

    @foreach ([
        ['Lampiran II: Peta ' . ($isAsistensi ? 'Hasil Plotting' : 'Plotting'), 'peta_hasil_plotting'],
        ['Lampiran III: ' . ($isAsistensi ? 'Absensi' : 'Absen'), 'absensi_pendampingan'],
    ] as [$sectionTitle, $type])
        <div class="lampiran-title">{{ $sectionTitle }}</div>
        @php
            $sectionDocs = $docsByType->get($type, collect());
        @endphp
        @if ($sectionDocs->isEmpty())
            <p class="file-line">-</p>
        @else
            @foreach ($sectionDocs as $doc)
                @if ($isImageFile($p = $documentPath($doc)))
                    <div style="margin-bottom: 8px;">
                        <img src="{{ $p }}" style="max-width: 100%; max-height: 280px;">
                    </div>
                @else
                    <p class="file-line link-line">
                        {{ $doc->file_name }}
                        @if ($url = $docUrl($doc))
                            <br><a href="{{ $url }}">{{ $url }}</a>
                        @endif
                    </p>
                @endif
            @endforeach
        @endif
    @endforeach

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
            <p class="file-line"><strong>{{ $label }}:</strong>{{ $matchingDocs->isEmpty() ? ' -' : '' }}</p>
            @foreach ($matchingDocs as $doc)
                <p class="file-line link-line">
                    {{ $loop->iteration }}. {{ $doc->file_name }}
                    @if ($url = $docUrl($doc))
                        <br><a href="{{ $url }}">{{ $url }}</a>
                    @endif
                </p>
            @endforeach
        @endforeach
    @endif
    </div><!-- /lampiran-column -->

</body>

</html>
