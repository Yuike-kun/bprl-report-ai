<x-mail::message>
@if ($confirmed)
# Permohonan Dikonfirmasi ✅

Yth. **{{ $permohonan->nama_pemohon }}**,

Kami dengan senang hati memberitahukan bahwa permohonan **konsultasi / asistensi KKPRL** Anda telah **dikonfirmasi** oleh tim BPRL Makassar.

<x-mail::panel>
**Detail Jadwal**

- **Tanggal:** {{ optional($permohonan->jadwal)->tanggal ? \Carbon\Carbon::parse($permohonan->jadwal->tanggal)->isoFormat('dddd, D MMMM Y') : $permohonan->tanggal_konsultasi }}
- **Waktu:** {{ optional($permohonan->jadwal)->waktu_awal ?? $permohonan->waktu_konsultasi }}{{ optional($permohonan->jadwal)->waktu_akhir ? ' – ' . $permohonan->jadwal->waktu_akhir : '' }}
- **Pelaksanaan:** {{ optional($permohonan->jadwal)->pelaksanaan ?? $permohonan->pelaksanaan }}
@if(optional($permohonan->jadwal)->lokasi)
- **Lokasi:** {{ $permohonan->jadwal->lokasi->nama_lokasi }}
@endif
</x-mail::panel>

Mohon hadir tepat waktu dan membawa dokumen yang diperlukan. Jika ada pertanyaan, silakan hubungi kami melalui email ini.

@else
# Permohonan Tidak Dapat Dikonfirmasi ❌

Yth. **{{ $permohonan->nama_pemohon }}**,

Mohon maaf, permohonan **konsultasi / asistensi KKPRL** Anda pada saat ini **tidak dapat kami konfirmasi** oleh tim BPRL Makassar.

Hal ini dapat disebabkan oleh keterbatasan jadwal atau kelengkapan berkas. Kami mengundang Anda untuk mengajukan permohonan kembali pada jadwal yang tersedia.

Jika ada pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.

@endif

Terima kasih atas kepercayaan Anda kepada BPRL Makassar.

Hormat kami,<br>
**Tim BPRL Makassar**<br>
Direktorat Jenderal Pengelolaan Ruang Laut – KKP RI
</x-mail::message>
