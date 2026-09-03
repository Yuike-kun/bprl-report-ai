<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Surat Konfirmasi KKPRL - {{ $permohonan->nama_pemohon }}</title>
    <style>
        @page {
            margin: 28mm 22mm 22mm;
        }

        body {
            color: #222;
            font-family: DejaVu Sans, sans-serif;
            font-size: 11pt;
            line-height: 1.55;
        }

        .header {
            border-bottom: 3px double #222;
            padding-bottom: 10px;
            text-align: center;
        }

        .header .title {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        .header .subtitle {
            font-size: 10pt;
            margin-top: 3px;
        }

        h1 {
            font-size: 14pt;
            margin: 28px 0 4px;
            text-align: center;
            text-transform: uppercase;
            text-decoration: underline;
        }

        .subject {
            margin-bottom: 24px;
            text-align: center;
        }

        p {
            margin: 0 0 12px;
            text-align: justify;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        .details {
            margin: 12px 0 18px;
        }

        .details td {
            padding: 4px 0;
            vertical-align: top;
        }

        .details td:first-child {
            width: 38%;
        }

        .details td:nth-child(2) {
            width: 4%;
        }

        .signature {
            margin-top: 34px;
            width: 100%;
        }

        .signature td {
            vertical-align: top;
            width: 50%;
        }

        .signature .right {
            text-align: center;
        }

        .signature-space {
            height: 76px;
        }

        .signature img {
            max-width: 150px;
            max-height: 60px;
        }

        .muted {
            color: #555;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="title">Balai Penataan Ruang Laut Makassar</div>
        <div class="subtitle">Layanan Konsultasi Kesesuaian Kegiatan Pemanfaatan Ruang Laut (KKPRL)</div>
    </div>

    <h1>Surat Konfirmasi KKPRL</h1>
    <div class="subject">Konfirmasi Permohonan Konsultasi</div>

    <p>Dengan hormat,</p>
    <p>
        Sehubungan dengan rencana kegiatan {{ $permohonan->rencana_kegiatan }} yang akan dilakukan oleh
        {{ $permohonan->instansi }} di wilayah {{ $permohonan->kabupaten }} {{ $permohonan->provinsi }}, dimana kegiatan
        tersebut memerlukan perizinan Kesesuaian Kegiatan pemanfaatan Ruang Laut (KKPRL), dengan ini kami sampaikan
        permohonan Konsultasi terkait pelaksanaan penyusunan dokumen serta hal-hal pendukung lainnya.
    </p>

    <p>
        Sebagaimana hal tersebut, kami mengajukan permohonan konsultasi pada:
    </p>

    <table class="details">
        <tr>
            <td>Hari/Tanggal</td>
            <td>:</td>
            <td>{{ $hariTanggal }}</td>
        </tr>
        <tr>
            <td>Pelaksanaan</td>
            <td>:</td>
            <td>{{ $permohonan->jadwal?->pelaksanaan ?? $permohonan->pelaksanaan }}</td>
        </tr>
        <tr>
            <td>Lokasi Konsultasi</td>
            <td>:</td>
            <td>{{ $permohonan->jadwal?->lokasi?->nama_lokasi ?? 'Daring' }}</td>
        </tr>
        <tr>
            <td>Agenda Konsultasi</td>
            <td>:</td>
            <td>{{ $permohonan->rencana_kegiatan ?? '-' }}</td>
        </tr>
    </table>

    <p>
        Demikian permohonan ini kami sampaikan. Besar harapan kami Bapak berkenan meluangkan waktu untuk agenda konsultasi ini. Atas perhatian dan arahan Bapak, kami ucapkan terima kasih.
    </p>

    <table class="signature">
        <tr>
            <td></td>
            <td class="right">
                Hormat kami,<br>
                <div class="signature-space">
                    @if ($signatureData)
                        <img src="{{ $signatureData }}" alt="Tanda tangan pemohon">
                    @endif
                </div>
                <strong><u>{{ $permohonan->nama_pemohon }}</u></strong><br>
                <span class="muted">{{ $permohonan->jabatan_pemohon }}</span>
            </td>
        </tr>
    </table>
</body>

</html>
