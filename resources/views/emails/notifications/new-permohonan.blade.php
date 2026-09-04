<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Permohonan konsultasi baru</title>
</head>
<body style="margin:0;background:#f5f7fa;color:#243142;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fa;padding:28px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e3e8ef;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="background:#102a43;padding:24px 28px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.2px;">BPRL</td>
                                    <td align="right" style="color:#b9d9f5;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Admin Intake</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px 28px 12px;">
                            <div style="display:inline-block;background:#e8f3ff;border:1px solid #c9e3fb;border-radius:999px;color:#1261a0;font-size:11px;font-weight:700;letter-spacing:.6px;padding:6px 10px;text-transform:uppercase;">Permohonan baru</div>
                            <h1 style="color:#102a43;font-size:24px;line-height:1.25;margin:16px 0 10px;">Ada permohonan konsultasi baru</h1>
                            <p style="color:#526579;font-size:15px;line-height:1.6;margin:0;">Pengajuan baru telah masuk dan menunggu pemeriksaan Tim BPRL.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:12px 28px 22px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f9fc;border:1px solid #e3e8ef;border-radius:8px;">
                                <tr>
                                    <td style="border-bottom:1px solid #e3e8ef;padding:14px 16px;">
                                        <div style="color:#7b8b9b;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Pemohon</div>
                                        <div style="color:#243142;font-size:15px;font-weight:700;margin-top:5px;">{{ $permohonan->nama_pemohon }}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="border-bottom:1px solid #e3e8ef;padding:14px 16px;">
                                        <div style="color:#7b8b9b;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Instansi</div>
                                        <div style="color:#243142;font-size:14px;margin-top:5px;">{{ $permohonan->instansi ?: '-' }}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:14px 16px;">
                                        <div style="color:#7b8b9b;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Kontak email</div>
                                        <div style="color:#243142;font-size:14px;margin-top:5px;">{{ $permohonan->email ?: '-' }}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:0 28px 28px;">
                            <a href="{{ $url }}" style="background:#1479c9;border-radius:7px;color:#ffffff;display:inline-block;font-size:14px;font-weight:700;padding:13px 22px;text-decoration:none;">Periksa permohonan</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top:1px solid #edf0f4;padding:18px 28px 24px;">
                            <p style="color:#8493a3;font-size:12px;line-height:1.6;margin:0;">Notifikasi ini dikirim otomatis oleh sistem BPRL. Silakan buka dashboard untuk meninjau detail, jadwal, dan dokumen pengajuan.</p>
                            <p style="color:#a2adb8;font-size:11px;margin:14px 0 0;">Direktorat Jenderal Pengelolaan Ruang Laut · BPRL</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
