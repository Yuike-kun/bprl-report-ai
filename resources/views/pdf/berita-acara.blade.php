<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Berita Acara {{ $beritaAcara->berita_acara_number }}</title>
    <style>
        /* ── Base & Typography ─────────────────────────── */
        body {
            font-family: "DejaVu Sans", sans-serif;
            font-size: 11px;
            color: #222;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        @page {
            margin: 140px 50px 60px 50px;

            @top-center {
                content: element(pageHeader);
            }

            @bottom-center {
                content: element(pageFooter);
            }
        }

        /* ── Header & Footer ───────────────────────────── */
        .header {
            position: running(pageHeader);
            width: 100%;
            padding-bottom: 6px;
            border-bottom: 3px double #333;
        }

        .header table {
            width: 100%;
            border-collapse: collapse;
        }

        .header td {
            vertical-align: middle;
        }

        .header .logo-cell {
            width: 65px;
        }

        .header .logo-cell img {
            width: 60px;
            height: auto;
        }

        .header .text-cell {
            text-align: center;
            padding: 0 10px;
        }

        .header .text-cell .line1 {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }

        .header .text-cell .line2 {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.3;
        }

        .header .text-cell .line3 {
            font-size: 9px;
            line-height: 1.4;
            margin-top: 4px;
            color: #555;
        }

        .footer {
            position: running(pageFooter);
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 5px;
        }

        .footer .pageno::after {
            content: counter(page) " / " counter(pages);
            font-weight: bold;
            color: #333;
        }

        /* ── Document Titles ───────────────────────────── */
        h1.doc-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 15px 0 4px 0;
            text-decoration: underline;
        }

        .doc-number,
        .doc-subject {
            text-align: center;
            font-size: 11px;
            margin: 0 0 2px 0;
        }

        .doc-subject {
            margin-bottom: 18px;
        }

        /* ── Content Sections ──────────────────────────── */
        .intro {
            text-align: justify;
            margin: 14px 0;
        }

        ol.attendees {
            margin: 0 0 14px 24px;
            padding: 0;
        }

        ol.attendees li {
            margin-bottom: 4px;
        }

        .section-title {
            font-weight: bold;
            font-size: 11.5px;
            margin: 16px 0 6px 0;
            color: #111;
            border-left: 3px solid #0056b3;
            padding-left: 8px;
        }

        .box {
            border: 1px solid #ddd;
            padding: 10px 12px;
            margin-bottom: 12px;
            text-align: justify;
            background-color: #fcfcfc;
        }

        .box p {
            margin: 0 0 5px 0;
        }

        .box p:last-child {
            margin-bottom: 0;
        }

        table.result-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        table.result-table td {
            border: 1px solid #ccc;
            padding: 10px 12px;
            vertical-align: top;
            text-align: justify;
            background-color: #fff;
        }

        table.result-table td p {
            margin: 0 0 4px 0;
        }

        table.result-table td p:last-child {
            margin-bottom: 0;
        }

        table.hasil-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0 20px 0;
        }

        table.hasil-table td {
            border: 1px solid #ccc;
            padding: 12px;
            width: 50%;
            text-align: center;
            font-weight: bold;
            font-size: 11px;
            background-color: #fff;
        }

        table.hasil-table td.active {
            background-color: #e3f2fd;
            border-color: #90caf9;
            color: #0d47a1;
        }

        .chk {
            display: inline-block;
            width: 14px;
            font-size: 14px;
            vertical-align: middle;
            margin-right: 4px;
        }

        .closing {
            text-align: justify;
            margin: 20px 0;
        }

        /* ── Signatures ────────────────────────────────── */
        table.sign-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        table.sign-table th,
        table.sign-table td {
            border: 1px solid #999;
            padding: 8px;
            font-size: 10px;
        }

        table.sign-table th {
            background-color: #f4f4f4;
            text-align: center;
            font-weight: bold;
            color: #333;
        }

        table.sign-table td.no {
            text-align: center;
            width: 30px;
        }

        table.sign-table td.ttd {
            text-align: center;
            height: 60px;
            vertical-align: middle;
        }

        table.sign-table td.ttd img {
            max-height: 55px;
            max-width: 130px;
        }

        /* ── Page Breaks & Attachments ─────────────────── */
        .page-break {
            page-break-before: always;
        }

        .lampiran-header p {
            margin: 0 0 3px 0;
            font-size: 11px;
        }

        .lampiran-title {
            font-weight: bold;
            font-size: 12px;
            margin: 20px 0 8px 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
            color: #333;
        }

        table.doc-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        table.doc-grid td {
            width: 50%;
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
            vertical-align: middle;
            background: #fafafa;
        }

        table.doc-grid img {
            max-width: 100%;
            max-height: 220px;
        }

        .file-line {
            padding: 6px 0;
            font-size: 10.5px;
            border-bottom: 1px dotted #eee;
        }

        .file-line:last-child {
            border-bottom: none;
        }
    </style>
</head>

<body>

    <div class="header">
        <table>
            <tr>
                <td class="logo-cell">
                    @if ($logoPath ?? false)
                        <img src="{{ $logoPath }}">
                    @endif
                </td>
                <td class="text-cell">
                    <div class="line1">KEMENTERIAN KELAUTAN DAN PERIKANAN</div>
                    <div class="line2">DIREKTORAT JENDERAL PENATAAN RUANG LAUT<br>BALAI PENATAAN RUANG LAUT MAKASSAR</div>
                    <div class="line3">
                        Jalan Makmur Daeng Sitakka Nomor 129 Maros 90511, Telepon (0411) 371337 Faksimili (0411) 371337<br>
                        Laman www.kkp.go.id &nbsp;|&nbsp; Surel bprlmakassar@kkp.go.id
                    </div>
                </td>
                <td class="logo-cell"></td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Berita Acara {{ $beritaAcara->berita_acara_number }} — Halaman <span class="pageno"></span>
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

        $activityDetail = $beritaAcara->activity_detail === 'Yang lain'
            ? $beritaAcara->activity_detail_other
            : $beritaAcara->activity_detail;

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

        $provinceName = optional($beritaAcara->province)->name ?? $beritaAcara->province;
        $regencyName = optional($beritaAcara->regency)->name ?? $beritaAcara->regency;
        $districtName = optional($beritaAcara->district)->name ?? $beritaAcara->district;

        $docsByType = $beritaAcara->documents->groupBy('document_type');
        $sigDoc = optional($docsByType->get('tanda_tangan_perwakilan'))->first();
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
        @foreach ([$beritaAcara->staff1, $beritaAcara->staff2, $beritaAcara->staff3, $beritaAcara->staff4] as $staff)
            @if ($staff)
                <li>{{ $staff->user->name }} ({{ $staff->position }})</li>
            @endif
        @endforeach
        <li>{{ $beritaAcara->requester_name }} ({{ $beritaAcara->requester_position }})</li>
    </ol>

    <p>Berdasarkan hasil pelaksanaan pendampingan permohonan, diperoleh hasil sebagai berikut:</p>

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

    <p><strong>Hasil Konsultasi</strong></p>
    <table class="hasil-table">
        <tr>
            <td class="{{ $beritaAcara->consultation_result === 'dokumen_sesuai' ? 'active' : '' }}">
                <span class="chk">{{ $beritaAcara->consultation_result === 'dokumen_sesuai' ? '☑' : '☐' }}</span>
                Dokumen Sudah Sesuai
            </td>
            <td class="{{ $beritaAcara->consultation_result === 'perlu_perbaikan' ? 'active' : '' }}">
                <span class="chk">{{ $beritaAcara->consultation_result === 'perlu_perbaikan' ? '☑' : '☐' }}</span>
                Dokumen Perlu Perbaikan
            </td>
        </tr>
    </table>

    <p class="closing">
        Demikian berita acara ini dibuat dengan sebenar-benarnya, untuk dapat dipergunakan sebagaimana mestinya.
    </p>

    <table class="sign-table">
        <thead>
            <tr>
                <th style="width: 30px;">No</th>
                <th>Nama</th>
                <th>Jabatan/Instansi</th>
                <th style="width: 140px;">Tanda Tangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach ([$beritaAcara->staff1, $beritaAcara->staff2, $beritaAcara->staff3, $beritaAcara->staff4] as $i => $staff)
                @if ($staff)
                    <tr>
                        <td class="no">{{ $i + 1 }}</td>
                        <td>{{ $staff->user->name }}</td>
                        <td>{{ $staff->position }}</td>
                        <td class="ttd"></td>
                    </tr>
                @endif
            @endforeach
            <tr>
                <td class="no">5</td>
                <td>{{ $beritaAcara->requester_name }}</td>
                <td>{{ $beritaAcara->requester_position }}</td>
                <td class="ttd">
                    @if ($sigDoc && ($sigPath = public_path('storage/' . $sigDoc->file_path)) && file_exists($sigPath))
                        <img src="{{ $sigPath }}">
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
                        @if (($p = public_path('storage/' . $doc->file_path)) && file_exists($p))
                            <img src="{{ $p }}">
                        @else
                            {{ $doc->file_name }}
                        @endif
                    </td>
                @endforeach
            </tr>
        @endforeach
    </table>

    <div class="lampiran-title">Lampiran II: Peta Hasil Plotting</div>
    @foreach ($docsByType->get('peta_hasil_plotting', collect()) as $doc)
        @if (
            ($p = public_path('storage/' . $doc->file_path)) &&
                file_exists($p) &&
                in_array(strtolower(pathinfo($p, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png']))
            <img src="{{ $p }}" style="max-width: 100%; max-height: 320px;">
        @else
            <p class="file-line">{{ $doc->file_name }}</p>
        @endif
    @endforeach

    <div class="lampiran-title">Lampiran III: Absensi</div>
    @foreach ($docsByType->get('absensi_pendampingan', collect()) as $doc)
        @if (
            ($p = public_path('storage/' . $doc->file_path)) &&
                file_exists($p) &&
                in_array(strtolower(pathinfo($p, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png']))
            <img src="{{ $p }}" style="max-width: 100%; max-height: 320px;">
        @else
            <p class="file-line">{{ $doc->file_name }}</p>
        @endif
    @endforeach

    <div class="lampiran-title">Lampiran IV: Dokumen Konsultasi</div>
    @foreach ([
        'rencana_bangunan_instalasi' => 'Dokumen Rencana Bangunan dan Instalasi di Laut',
        'informasi_pemanfaatan_ruang_laut' => 'Dokumen Informasi Pemanfaatan Ruang Laut',
        'data_kondisi_terkini' => 'Dokumen Data Kondisi Terkini Lokasi dan Sekitar',
        'persyaratan_lainnya' => 'Dokumen Persyaratan Lainnya',
        'titik_koordinat' => 'Dokumen Titik Koordinat Lokasi',
    ] as $type => $label)
        <p class="file-line"><strong>{{ $label }}:</strong>
            {{ $docsByType->get($type, collect())->pluck('file_name')->implode(', ') ?: '-' }}
        </p>
    @endforeach

</body>

</html>