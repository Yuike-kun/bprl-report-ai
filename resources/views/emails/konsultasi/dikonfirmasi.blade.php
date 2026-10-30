<x-mail::message>
@if ($confirmed)
# Permohonan Konsultasi Dikonfirmasi

Kepada Yth.
**{{ $permohonan->nama_pemohon }}**
di Tempat

Sehubungan dengan permohonan konsultasi/asistensi **Kesesuaian Kegiatan Pemanfaatan Ruang Laut (KKPRL)** yang telah Bapak/Ibu ajukan, dengan ini kami sampaikan bahwa permohonan tersebut **telah dikonfirmasi** oleh Tim BPRL Makassar, dengan rincian sebagai berikut:

<div style="background:#f0f4ff;border:1px solid #d0d9f2;border-radius:6px;padding:10px 14px;margin:16px 0;">
    <strong>Nomor Permohonan:</strong> {{ $permohonan->nomor_permohonan ?? '-' }}
</div>

<x-mail::panel>
Hari, Tanggal &nbsp; : {{ optional($permohonan->jadwal)->tanggal ? \Carbon\Carbon::parse($permohonan->jadwal->tanggal)->isoFormat('dddd, D MMMM Y') : $permohonan->tanggal_konsultasi }}

Waktu &nbsp; : {{ optional($permohonan->child_schedules)->waktu }}

Pelaksanaan &nbsp; : {{ optional($permohonan->jadwal)->pelaksanaan ?? $permohonan->pelaksanaan }}
@if(optional($permohonan->jadwal)->lokasi)

Lokasi / Media &nbsp; : {{ $permohonan->jadwal->lokasi->nama_lokasi }}
@endif
</x-mail::panel>

Demikian pemberitahuan ini kami sampaikan. Mohon Bapak/Ibu berkenan hadir tepat waktu dan membawa dokumen yang diperlukan. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.

@else
# Permohonan Konsultasi Tidak Dapat Dikonfirmasi

Kepada Yth.
**{{ $permohonan->nama_pemohon }}**
di Tempat

Sehubungan dengan permohonan konsultasi/asistensi **Kesesuaian Kegiatan Pemanfaatan Ruang Laut (KKPRL)** yang telah Bapak/Ibu ajukan, dengan ini kami sampaikan mohon maaf bahwa permohonan tersebut **belum dapat kami konfirmasi** pada saat ini, yang disebabkan oleh keterbatasan jadwal atau kelengkapan berkas.

<div style="background:#fff0f0;border:1px solid #ffd0d0;border-radius:6px;padding:10px 14px;margin:16px 0;">
    <strong>Nomor Permohonan:</strong> {{ $permohonan->nomor_permohonan ?? '-' }}
</div>

Kami mengundang Bapak/Ibu untuk mengajukan permohonan kembali pada jadwal yang tersedia.

Demikian pemberitahuan ini kami sampaikan. Atas perhatian dan pengertian Bapak/Ibu, kami ucapkan terima kasih.

@endif

Hormat Kami,

**Tim BPRL Makassar**
Direktorat Jenderal Pengelolaan Ruang Laut – KKP RI
</x-mail::message>