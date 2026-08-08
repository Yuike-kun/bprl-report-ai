<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: "DejaVu Sans", sans-serif;
            font-size: 11px;
            color: #111;
            line-height: 1.5;
        }

        @page {
            margin: 145px 60px 65px 60px;

            @top-center {
                content: element(pageHeader);
            }

            @bottom-center {
                content: element(pageFooter);
            }
        }

        .header {
            position: running(pageHeader);
            width: 100%;
            padding-bottom: 6px;
            border-bottom: 2px solid #000;
        }

        .header table {
            width: 100%;
            border-collapse: collapse;
        }

        .header td {
            vertical-align: middle;
        }

        .header .logo-cell {
            width: 60px;
        }

        .header .logo-cell img {
            width: 55px;
            height: auto;
        }

        .header .text-cell {
            text-align: center;
        }

        .header .text-cell .line1 {
            font-size: 12px;
            font-weight: bold;
        }

        .header .text-cell .line2 {
            font-size: 13px;
            font-weight: bold;
        }

        .header .text-cell .line3 {
            font-size: 9px;
        }

        .footer {
            position: running(pageFooter);
            width: 100%;
            text-align: center;
            font-size: 8px;
            color: #555;
        }

        .footer .pageno::after {
            content: counter(page) " / " counter(pages);
        }

        h1.doc-title {
            text-align: center;
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 4px 0;
        }

        .doc-number,
        .doc-subject {
            text-align: center;
            font-size: 11px;
            margin: 0 0 2px 0;
        }

        .intro {
            text-align: justify;
            margin: 14px 0;
        }

        ol.attendees {
            margin: 0 0 14px 22px;
            padding: 0;
        }

        ol.attendees li {
            margin-bottom: 2px;
        }

        .section-title {
            font-weight: bold;
            margin: 10px 0 4px 0;
        }

        .box {
            border: 1px solid #000;
            padding: 8px 10px;
            margin-bottom: 10px;
            text-align: justify;
        }

        .box p {
            margin: 0 0 4px 0;
        }

        .box p:last-child {
            margin-bottom: 0;
        }

        table.result-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        table.result-table td {
            border: 1px solid #000;
            padding: 8px 10px;
            vertical-align: top;
            text-align: justify;
        }

        table.hasil-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 16px 0;
        }

        table.hasil-table td {
            border: 1px solid #000;
            padding: 10px;
            width: 50%;
            text-align: center;
            font-weight: bold;
        }

        table.hasil-table td.active {
            background-color: #eaf3ff;
        }

        .chk {
            display: inline-block;
            width: 12px;
        }

        .closing {
            text-align: justify;
            margin: 14px 0;
        }

        table.sign-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        table.sign-table th,
        table.sign-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            font-size: 10px;
        }

        table.sign-table th {
            background-color: #f2f2f2;
            text-align: center;
        }

        table.sign-table td.no {
            text-align: center;
            width: 24px;
        }

        table.sign-table td.ttd {
            text-align: center;
            height: 55px;
        }

        table.sign-table td.ttd img {
            max-height: 50px;
            max-width: 130px;
        }

        .page-break {
            page-break-before: always;
        }

        .lampiran-header p {
            margin: 0 0 2px 0;
            font-size: 11px;
        }

        .lampiran-title {
            font-weight: bold;
            font-size: 12px;
            margin: 14px 0 8px 0;
        }

        table.doc-grid {
            width: 100%;
            border-collapse: collapse;
        }

        table.doc-grid td {
            width: 50%;
            border: 1px solid #ccc;
            padding: 6px;
            text-align: center;
            vertical-align: middle;
        }

        table.doc-grid img {
            max-width: 100%;
            max-height: 220px;
        }

        .file-line {
            padding: 4px 0;
            font-size: 10.5px;
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
                    <div class="line2">DIREKTORAT JENDERAL PENATAAN RUANG LAUT<br>BALAI PENATAAN RUANG LAUT MAKASSAR
                    </div>
                    <div class="line3">
                        Jalan Makmur Daeng Sitakka Nomor 129 Maros 90511, Telepon (0411) 371337 Faksimili (0411)
                        371337<br>
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

        $activityDetail =
            $beritaAcara->activity_detail === 'Yang lain'
                ? $beritaAcara->activity_detail_other
                : $beritaAcara->activity_detail;

        $waterName = $beritaAcara->water_name === 'Lainnya' ? $beritaAcara->water_name_other : $beritaAcara->water_name;

        $location = $beritaAcara->location === 'Lainnya' ? $beritaAcara->location_other : $beritaAcara->location;

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
                <p><strong>Luas/Panjang</strong> : {{ $beritaAcara->planned_area }}
                    {{ $beritaAcara->planned_area_unit }}</p>
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
                <th style="width: 24px;">No</th>
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
