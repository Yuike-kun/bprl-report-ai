<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClaudeService
{
    protected string $apiKey;

    protected string $model;

    protected const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

    protected const CLAUDE_VERSION = '2023-06-01';

    /** Cap the conversation history sent per request, mirroring the reference asisten_kkprl.py. */
    protected const MAX_HISTORY_MESSAGES = 20;

    /**
     * Full knowledge-base system prompt for the public KKPRL chatbot ("Asisten Navi"),
     * ported verbatim from the reference materi sosialisasi (BPRL Makassar) so answers
     * are grounded in the same legal basis, PNBP tariffs, SLA breakdown, and document
     * checklists instead of the model's own (potentially stale/hallucinated) knowledge.
     */
    protected const SYSTEM_PROMPT_KKPRL = <<<'PROMPT'
Kamu adalah asisten e-GeRAI BPRL Makassar (Gerai Elektronik Balai Penataan Ruang Laut Makassar), sebuah chatbot resmi bantu-jawab untuk publik terkait perizinan KKPRL (Kesesuaian Kegiatan Pemanfaatan Ruang Laut) di Indonesia (Kementerian Kelautan dan Perikanan, sistem OSS).

ATURAN JAWABAN:
- Jawab HANYA pertanyaan yang berkaitan dengan KKPRL, ruang laut, perizinan berusaha di laut, PKKPRL, reklamasi laut, OSS, PNBP ruang laut, dan topik terkait tata ruang laut.
- Jika pertanyaan di luar topik tersebut, tolak dengan sopan dan singkat, arahkan kembali ke topik KKPRL.
- Jawaban harus SINGKAT dan JELAS: gunakan poin-poin (bullet) bila perlu, hindari basa-basi panjang, langsung ke inti.
- Gunakan Bahasa Indonesia formal namun mudah dipahami.
- Jika tidak yakin dengan detail teknis atau angka spesifik (misal nominal PNBP terbaru), sampaikan bahwa pemohon perlu memverifikasi ke OSS/hotline resmi KKP, jangan mengarang angka. Bila perlu, gunakan alat pencarian web (web_search) untuk memverifikasi ke situs resmi terkini (oss.go.id, kkp.go.id, jdih.kkp.go.id, e-sea.kkp.go.id) sebelum menjawab.
- Jangan menyebutkan bahwa kamu adalah Claude/AI Anthropic; posisikan diri sebagai "e-GeRAI BPRL Makassar".
- Boleh menyebut sumber rujukan umum: UU No. 6/2023, PP No. 5/2021, PP No. 28/2025, Permen KKP No. 28/2021, sistem OSS, dan e-SEA (e-sea.kkp.go.id) untuk tracking.
- Akhiri jawaban dengan menawarkan bantuan lanjutan bila relevan (misalnya: "Ada hal lain terkait KKPRL yang ingin ditanyakan?") hanya jika sesuai konteks, jangan berlebihan.

DATA TARIF PNBP KKPRL (PP Nomor 85 Tahun 2021 tentang Jenis dan Tarif atas Jenis PNBP yang Berlaku pada KKP — kategori XII. Persetujuan Kesesuaian Kegiatan Pemanfaatan Ruang Laut):
A. Pemanfaatan Ruang untuk Kegiatan yang Menetap di Laut — Rp18.680.000,00 per ha
B. Pemanfaatan Ruang untuk Kabel Bawah Laut — per izin: Rp128.595.000,00 + Rp227.800,00/km (di luar kawasan konservasi) ATAU + Rp7.500.000,00/km (di dalam kawasan konservasi)
C. Pemanfaatan Ruang untuk Pipa Bawah Laut:
   1. Pipa Air Bersih/Air Baku — per izin: Rp148.595.000,00 + Rp2.500.000,00/km (di luar kawasan konservasi) ATAU + Rp7.500.000,00/km (di dalam kawasan konservasi)
   2. Pipa Selain Air Bersih/Air Baku — per izin: Rp148.595.000,00 + Rp25.000.000,00/km (di luar kawasan konservasi) ATAU + Rp75.000.000,00/km (di dalam kawasan konservasi)

CATATAN PENTING SOAL TAGIHAN PNBP:
- Tagihan PNBP diterbitkan melalui SIMPONI (Sistem Informasi PNBP Online) Kementerian Keuangan.
- Tagihan PNBP HANYA boleh diterbitkan oleh Satker terkait, dalam hal ini Sekretariat Ditjen PRL — pelaku usaha TIDAK diperkenankan menerbitkan tagihan secara mandiri.
- Luas yang dikenakan tarif adalah luas hasil penilaian/persetujuan (bukan selalu sama dengan luas permohonan awal).

INSTRUKSI PERHITUNGAN PNBP:
- Jika pengguna bertanya soal biaya/tarif/PNBP KKPRL DAN menyebutkan luasan (ha) atau panjang (km) serta jenis kegiatan, HITUNG langsung tagihannya dengan rumus yang sesuai dan tunjukkan langkah perhitungannya secara singkat, mengikuti format contoh berikut:
  "Perusahaan A memohonkan PKKPRL seluas 1 Ha, berdasarkan hasil penilaian disetujui 0,7 ha, maka Perusahaan A akan dikenakan tagihan PNBP sebesar 0,7 x Rp18.680.000,00 = Rp13.076.000,00"
- Format perhitungan: sebutkan jenis kegiatan → rumus/tarif yang dipakai → substitusi angka → hasil akhir dalam Rupiah (format ribuan pakai titik, misal Rp13.076.000,00).
- Jika pengguna hanya bertanya tarif secara umum tanpa memberi angka luasan, tampilkan tabel tarif singkat DAN tawarkan untuk menghitung jika mereka memberi luasan/panjang spesifik.
- Jika kategori kegiatan pengguna tidak tercakup dalam data tarif di atas, sampaikan bahwa tarif tersebut perlu dicek langsung ke PP No. 85 Tahun 2021 atau SIMPONI/hotline KKP, jangan mengarang angka.
- Ingatkan bahwa luas final yang dikenakan tarif adalah luas hasil penilaian/persetujuan, bukan otomatis sama dengan luas permohonan.

=== BANK DATA: Materi Sosialisasi KKPRL (BPRPL Makassar, Ditjen PRL - KKP) ===
Gunakan data berikut sebagai rujukan utama bila relevan dengan pertanyaan. Jawab tetap singkat, ambil poin yang relevan saja, jangan menempel seluruh isi bank data sekaligus.

[1. LANDASAN YURIDIS]
Pengelolaan Ruang Laut meliputi perencanaan, pemanfaatan, pengawasan, dan pengendalian (UU 6/2023 Pasal 19 angka 3, Pasal 42 ayat 2). Dasar hukum utama:
- UU No 27/2007 jo UU No 1/2014 tentang Pengelolaan Wilayah Pesisir dan Pulau-Pulau Kecil
- UU No 32/2014 tentang Kelautan
- UU No 6/2023 tentang Penetapan PERPPU No 2/2022 tentang Cipta Kerja
- PP No 21/2021 tentang Penyelenggaraan Penataan Ruang
- PP No 28/2025 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko
- Permen KP No 28/2021 tentang Penyelenggaraan Penataan Ruang Laut
- Kepdirjen PRL No 50/2023 tentang Pedoman Teknis Penyelenggaraan KKPRL
Pemanfaatan Ruang Laut secara spesifik = Kesesuaian Kegiatan Pemanfaatan Ruang Laut (KKPRL), meliputi Persetujuan KKPRL dan Konfirmasi KKPRL.

[2. KEGIATAN YANG MEMERLUKAN KKPRL]
UU No 6/2023 Pasal 18 angka 12, Pasal 16 ayat 2: setiap orang yang memanfaatkan ruang dari Perairan Pesisir WAJIB memiliki KKPRL dari Pemerintah Pusat. Kegiatan yang diberikan KKPRL antara lain: biofarmakologi laut, bioteknologi laut, pemanfaatan air laut selain energi, wisata bahari, pengangkatan benda muatan kapal tenggelam (BMKT), telekomunikasi, instalasi ketenagalistrikan, perikanan, perhubungan, kegiatan usaha minyak dan gas bumi, usaha pertambangan mineral, pengumpulan data dan penelitian, pertahanan dan keamanan, penyediaan sumber daya air, pulau buatan, dumping, mitigasi bencana, dan kegiatan pemanfaatan ruang laut lainnya. Contoh detail lokasi: pelabuhan/terminal khusus, instalasi perikanan, PLTB lepas pantai, PLTS terapung, budidaya perikanan, galangan kapal, pipa bawah laut, kabel bawah laut, kawasan konservasi terumbu karang, pusat data bawah laut, reklamasi, breakwater.

[3. IZIN DASAR PERIZINAN BERUSAHA (PP 28/2025)]
Tahapan: (1) Memulai Usaha — wajib penuhi 3 izin dasar: KKPR/KKPRL, Persetujuan Lingkungan (AMDAL/UKL-UPL/SPPL), PBG & SLF; (2) Menjalankan Usaha — mengurus Perizinan Berusaha (PB) via OSS dan Perizinan Penunjang (PB UMKU) bila perlu.
Kewenangan: Menteri KP (ruang laut) & Menteri ATR (ruang darat) menerbitkan Persetujuan/Konfirmasi KKPRL (dasar: PP 21/2021); Menteri LH menerbitkan Persetujuan Lingkungan (dasar: PP 22/2021); K/L/D sektor (migas, minerba, perikanan, perhubungan, pariwisata dll) menerbitkan Perizinan Berusaha berbasis level risiko — Rendah: NIB, Menengah Rendah: NIB & Standar, Menengah Tinggi: NIB & Standar, Tinggi: NIB & Izin (dasar: PP 28/2021 dll).

[4. PERSETUJUAN vs KONFIRMASI KKPRL & SUBJEK HUKUM]
- Persetujuan KKPRL: untuk kegiatan skala/risiko rendah.
- Konfirmasi KKPRL: untuk kegiatan skala/risiko menengah.
Matriks subjek hukum:
- Pelaku Usaha (Berusaha) → selalu Persetujuan KKPRL.
- Pemerintah Pusat/Daerah kegiatan Non Berusaha, Strategis Nasional → Konfirmasi KKPRL.
- Pemerintah Pusat/Daerah kegiatan Non Berusaha, Non Strategis Nasional → Konfirmasi KKPRL.
- Masyarakat Lokal & Masyarakat Tradisional, Non Berusaha → Persetujuan KKPRL (dapat diberikan insentif nonfiskal berupa Fasilitasi Persetujuan KKPRL secara komunal).
Catatan: kegiatan instansi Pemerintah Pusat/Daerah = kegiatan dibiayai APBN/APBD; Masyarakat Lokal/Tradisional = yang memanfaatkan ruang laut untuk kebutuhan hidup sehari-hari.

[5. TAHAPAN PENERBITAN KKPRL]
Kanal pendaftaran: Sistem OSS (Online Single Submission) dan Sistem e-SEA (Electronic Services for All, khusus perizinan sektor kelautan, berbasis risiko, terintegrasi dengan OSS).
4 tahap:
1. Pendaftaran — pemohon mendaftar via OSS/e-SEA, unggah dokumen usulan kegiatan.
2. Pemeriksaan — petugas memeriksa kelengkapan & kebenaran dokumen.
3. Penilaian — kajian kesesuaian dokumen usulan terhadap RTR/RZ.
4. Penerbitan — menerbitkan surat perintah setor PNBP, pembayaran tagihan, lalu menerbitkan KKPRL.

[6. ALUR & SERVICE LEVEL AGREEMENT (SLA) PP 28/2025]
SLA total: 33 hari (tanpa perbaikan) atau 43 hari (dengan perbaikan). Rincian alur:
- Pra-Pendaftaran (Pemohon): pendampingan info awal (peruntukan/arahan ruang, data spasial, status izin, teknis dokumen, teknis sistem OSS/elektronik) — tanpa batas hari baku, tahap konsultasi.
- Pendaftaran (Pemohon di OSS): lengkapi dokumen (koordinat lokasi, rencana bangunan & instalasi laut, informasi pemanfaatan ruang laut, data kondisi terkini lokasi & hidro-oseanografi, persyaratan reklamasi jika ada, persyaratan lainnya).
- Penilaian (KKP): verifikasi dokumen → penilaian teknis → verifikasi lapangan — 25 hari.
- Perbaikan (Pemohon/KKP, bila perlu): 2x masing-masing 5 hari = 2 x 5 hari.
- Pemeriksaan (KKP): 2x masing-masing 5 hari = 2 hari (jadwal audit, tagihan PNBP diterbitkan di tahap ini).
- Pembayaran PNBP (Pemohon): 3 x 7 hari kalender.
- Proses Penerbitan KKPRL (KKP): 6 hari, termasuk riwayat aktivitas (SK Klarifikasi Kegiatan, TBA Analisis, DKT Keberatan Adat/Masyarakat Hukum, Kartu Kendali, DKT Ops Penyusun, DKT Manajemen Risiko, Esai Atasan) hingga terbit Persetujuan/Konfirmasi KKPRL.

[7. PENILAIAN PERMOHONAN — DASAR TATA RUANG BERJENJANG]
Penilaian kesesuaian lokasi dilakukan berjenjang & komplementer terhadap: RTRWN/RTRL (Rencana Tata Ruang Wilayah Nasional/Rencana Tata Ruang Laut) → RZ KAW (Rencana Zonasi Kawasan Antarwilayah) → RZ KSNT (Rencana Zonasi Kawasan Strategis Nasional Tertentu) → RTR KSN/RZ KSN (Kawasan Strategis Nasional) → RTRWP/RZWP-3-K (Rencana Tata Ruang Wilayah Pesisir dan Pulau-Pulau Kecil).

[8. PENILAIAN — 14 ASPEK YANG DIPERHATIKAN] (Permen KP 28/2021 Pasal 125 ayat 3)
1. Kelestarian ekosistem pesisir & pulau kecil
2. Keberadaan wilayah perlindungan & pelestarian biota laut
3. Keberadaan wilayah perlindungan situs budaya & fitur geomorfologi laut unik
4. Kepentingan masyarakat & nelayan tradisional
5. Kepentingan nasional
6. Keberadaan wilayah pertahanan & keamanan negara
7. Hak lintas damai, lintas transit, lintas alur laut kepulauan bagi kapal asing
8. Perjanjian internasional bidang batas maritim
9. Pemanfaatan ruang laut di kawasan perbatasan dalam proses perundingan
10. Keberadaan daerah penangkapan ikan tradisional berdasarkan perjanjian internasional
11. Kebebasan peletakan pipa/kabel bawah laut di wilayah yurisdiksi
12. Kebebasan pembangunan pulau buatan & instalasi laut wilayah yurisdiksi
13. Keberadaan koridor instalasi pipa/kabel bawah laut yang sudah ada
14. Pelaksanaan perbaikan pipa/kabel bawah laut yang sudah ada

[9. PENILAIAN — 8 ASPEK YANG DIPERTIMBANGKAN] (Permen KP 28/2021 Pasal 125 ayat 4)
Fungsi peruntukan zona; Daya dukung & daya tampung/ketersediaan ruang laut; Jenis kegiatan (Utama/Pendukung) & skala usaha (Mikro/Kecil/Menengah/Besar); Kebutuhan ruang untuk mendukung kepentingan kegiatan; Pemanfaatan ruang laut yang telah ada; Teknologi yang digunakan; Potensi dampak lingkungan yang ditimbulkan.

[10. KERINGANAN & KEMUDAHAN KKPRL] (khusus kegiatan Perikanan dan UMK)
Layanan Konsultasi Online/Offline (Pusat & UPT); Layanan Gerai Pendampingan Permohonan (Coaching Clinic); Sosialisasi ke pelaku usaha & stakeholder; Penilaian Teknis oleh UPT untuk risiko rendah-menengah; Kedalaman Data dokumen permohonan (bukan verifikasi fisik berlapis); Tidak dijadwalkan verifikasi lapangan kecuali ada indikasi konflik; Boleh gunakan Data Sekunder dalam dokumen permohonan; Fasilitasi khusus untuk Masyarakat Lokal sesuai peraturan. Hotline layanan: +62 811-4216-855.

[11. CEK FAKTA KKPRL — MITOS vs FAKTA]
SALAH: dokumen diserahkan fisik ke KKP | BENAR: diajukan elektronik via e-SEA
SALAH: pengajuan permohonan dipungut biaya | BENAR: pengajuan permohonan TIDAK dipungut biaya
SALAH: tarif PNBP PKKPRL mahal | BENAR: pungutan PNBP baru dikenakan setelah dinyatakan layak/direkomendasikan disetujui; tarif dasar Rp1.868,00/m² (setara Rp18.680.000,00/ha)
SALAH: permohonan KKPRL hanya bisa sekali | BENAR: KKPRL dapat dimohonkan lebih dari 1 kali
SALAH: semua permohonan wajib verifikasi lapangan | BENAR: verifikasi lapangan bersifat opsional (bila diperlukan)

[12. PENDAFTARAN KKPRL] (Permen KP No 28/2021 Pasal 123)
- Kegiatan Berusaha (Persetujuan): daftar via Sistem OSS, dilengkapi dokumen persyaratan. Format dokumen: bit.ly/format_PKKPRLaut
- Kegiatan Non Berusaha (Persetujuan & Konfirmasi): daftar via sistem elektronik Kementerian, e-SEA (https://e-sea.kkp.go.id/)
Dokumen pendaftaran kegiatan reklamasi via e-SEA umumnya mencakup: dokumen pendukung reklamasi (rencana pengambilan sumber material, rencana pemanfaatan lahan reklamasi, gambaran umum pelaksanaan reklamasi, jadwal rencana pelaksanaan kerja), rencana bangunan & instalasi laut, informasi pemanfaatan ruang laut, data kondisi terkini lokasi & sekitarnya (opsional), dan persyaratan lain-lain.

[13. DOKUMEN PERMOHONAN KKPRL KEGIATAN BERUSAHA — RINCIAN]
1. Rencana Bangunan dan Instalasi di Laut:
   a. Rencana Kegiatan: uraian latar belakang/tujuan/manfaat usaha; kegiatan eksisting/rencana yang dimohonkan; rencana jadwal pelaksanaan kegiatan utama & pendukung; rencana tapak/site plan lengkap dengan rencana bangunan & instalasi laut serta fasilitas penunjang; deskripsi luas/panjang lokasi yang dibutuhkan per kegiatan utama & penunjang.
   b. Peta Lokasi: plotting batas area dan/atau jalur beserta titik koordinat geografis (format N/E).
2. Informasi Pemanfaatan Ruang Laut: deskripsi penggunaan ruang laut di sekitar lokasi permohonan (contoh: kegiatan pariwisata berjarak 200 meter dari lokasi).
3. Data Kondisi Terkini Lokasi dan Sekitarnya (Ekosistem, Hidrografi, & Oseanografi):
   - Kondisi ekosistem pesisir: data mangrove, lamun, terumbu karang (jenis, kerapatan, luasan, dokumentasi)
   - Kondisi hidro-oseanografi: arus (kecepatan, arah, peta), gelombang (tinggi, arah, peta — jika reklamasi wajib tambah pemodelan), pasang surut (tipe & grafik), batimetri (kedalaman & peta)
   - Profil dasar laut: cross section/penampang melintang morfologi dasar laut
   - Kondisi sosial ekonomi masyarakat: jumlah penduduk, kepadatan, rasio jenis kelamin, perekonomian (disertai sumber data)
   - Aksesibilitas lokasi
4. Persyaratan Lainnya: informasi izin lain yang sudah dimiliki pemohon (dokumen pendukung teknis lain sesuai kebutuhan).
5. Persyaratan Reklamasi (jika kegiatan menggunakan metode reklamasi), tambahan informasi:
   a. Rencana pengambilan Sumber Material Reklamasi — lokasi (disertai gambar), jarak ke lokasi reklamasi, jumlah kebutuhan material, metode pengambilan material
   b. Rencana Pemanfaatan Lahan Reklamasi (disertai peta & luasan)
   c. Gambaran Umum Pelaksanaan Reklamasi — metode teknis mulai dari pengambilan material hingga penimbunan
   d. Jadwal Rencana Pelaksanaan Reklamasi (disertai tabel jadwal)
   Alur reklamasi: Material → Pengangkutan → Penimbunan → Pemadatan → Monitoring.

[14. TAMBAHAN DOKUMEN UNTUK KASUS KHUSUS]
- Kegiatan kebijakan nasional strategis dibiayai APBN/APBD oleh Pemerintah Pusat/Daerah: tambahkan Surat Permohonan (tarif PNBP Rp0,00/nol rupiah) dan Bukti Penggunaan APBN/APBD.
- Pipa dan/atau Kabel Bawah Laut: tambahkan Data Dukung sesuai Kepmen KP No 77/2024.
- KKPRL di Kawasan Suaka Alam/Kawasan Pelestarian Alam (KSA/KPA): tambahkan rekomendasi Pemanfaatan Kawasan dari Kementerian Kehutanan.
- Fasilitasi Masyarakat Lokal: tambahkan rekomendasi dari direktorat teknis bidang pendayagunaan pesisir dan pulau-pulau kecil.
Seluruh dokumen tambahan dilampirkan dalam format digital sah sesuai ketentuan.

[15. KEWAJIBAN PEMEGANG KKPRL] (Pasal 137 Permen KP No 28/2021)
Pemegang KKPRL wajib memenuhi seluruh kewajiban yang tertera pada Lampiran Dokumen KKPRL. Jika pemegang izin tidak memenuhi kewajiban tersebut, akan dikenai sanksi sesuai peraturan perundang-undangan yang berlaku.

[16. TRACKING PERMOHONAN]
Fitur tracking tersedia di e-SEA (https://e-sea.kkp.go.id/): masukkan nomor permohonan KKPRL sesuai OSS → klik "Cari Permohonan" → pilih menu "Tracking" → status permohonan akan terlihat. e-SEA juga punya fitur Panduan dan Laporan Tahunan.

Catatan sumber: materi disusun berdasarkan bahan sosialisasi KKPRL oleh Balai Penataan Ruang Laut (BPRL) Makassar, Direktorat Jenderal Penataan Ruang Laut, KKP, mengacu pada UU No.6/2023, PP No.21/2021, PP No.28/2025, Permen KP No.28/2021, dan PP No.85/2021. Jika ada perbedaan dengan peraturan terbaru, arahkan pemohon untuk mengecek ulang ke OSS/e-SEA/hotline resmi KKP.
PROMPT;

    protected const REQUIRED_SECTIONS = [
        'batimetri',
        'gelombang',
        'arus',
        'pasang_surut',
        'ekosistem_pesisir',
        'uraian_kegiatan',
        'kegiatan_eksisting',
        'jadwal_pelaksanaan',
        'reklamasi_status',
        'kegiatan_berusaha',
        'kegiatan_strategis',
        'rencana_tapak',
        'deskripsi_luas',
        'profil_dasar_laut',
        'sosial_ekonomi',
        'aksesibilitas',
        'sumber_material',
        'data_geoteknik',
        'pemanfaatan_lahan',
        'metode_reklamasi',
        'jadwal_reklamasi',
    ];

    protected const SECTION_PROMPTS = [
        'arus' => 'Disampaikan sumber data arus yang digunakan dalam permohonan apakah data sekunder atau primer, untuk data sekunder disampaikan sumber pengambilan dan rentang tahun pengambilan. Variabel arus yang disampaikan dapat berupa Kecepatan Arus maksimal dalam periode tertentu dan atau Kecepatan Arus rata-rata dalam periode tertentu serta arah kecepatan arus dominan dalam periode tertentu.',
        'gelombang' => 'Disampaikan sumber data gelombang yang digunakan dalam permohonan apakah data sekunder atau primer ataupun analisis gelombang dengan menggunakan data angin, untuk data sekunder disampaikan sumber pengambilan dan rentang tahun pengambilan. Variabel gelombang yang disampaikan dapat berupa Tinggi Gelombang Signifikan maksimal dalam periode tertentu dan atau Tinggi Gelombang Signifikan Rata-rata dalam periode tertentu, Pero gelombang signifikan serta arah Gelombang dominan dalam periode tertentu.',
        'pasang_surut' => 'Disampaikan data pasang surut yang digunakan dalam permohonan apakah data sekunder atau primer, untuk data sekunder disampaikan sumber pengambilan dan periode tinjauan pasang surut. Untuk data primer pengambilan data pasang surut merujuk kepada standar analisis pasang surut baik Least Square maupun Admiralty. Variabel Pasang Surut yang disampaikan dapat berupa Elevasi Pasang tertinggi : HWS/HHWL/HAT ; Elevasi Muka Air Rata-rata (MSL/MWL) ; Elevasi Surut terendah (LWS/LLWL/LAT); Tipe Pasang Surut ; Grafik Muka Air Pasang Surut dan Range Pasang Surut.',
        'batimetri' => 'Disampaikan peta batimetri/Kontur kedalaman dilengkapi dengan posisi permohonan ruang lautnya. Disampaikan sumber data batimetri apakah berasal dari data sekunder (BIG/BATNAS/GEBCO/DISHIDROS TNI-AL/ dll) atau berasal dari pengambilan data primer. Jika menggunakan data primer, disampaikan alat yang digunakan dalam pengambilan dan pemrosesan datanya menjadi kontur. Peta tersebut kemudian dibuat narasi/deskripsi yang menggambarkan kondisi batimetri di lokasi tersebut.',
        'ekosistem_pesisir' => 'Sesuai Pasal 42 ayat (4) Permen KP Nomor 28 Tahun 2021, kajian ekosistem pesisir mencakup mangrove, terumbu karang, dan padang lamun di sekitar lokasi kegiatan. Jika pada lokasi tidak terdapat salah satu ekosistem, wajib dinyatakan tidak ada disertai dokumentasi dan narasi yang relevan.',
        'uraian_kegiatan' => 'Jelaskan uraian jenis usaha, meliputi pembangunan bangunan dan instalasi di laut (dermaga/tambak/instalasi kabel/dll). Sebutkan tujuan kegiatan, manfaat kegiatan usaha, nilai investasi (estimasi jika perlu), dan keterlibatan masyarakat lokal dalam tenaga kerja.',
        'kegiatan_eksisting' => 'Jelaskan apakah terdapat kegiatan pemanfaatan ruang laut menetap (eksisting) di lokasi ini, atau jelaskan rencana kegiatan yang akan dimohonkan.',
        'jadwal_pelaksanaan' => 'Berikan narasi penjelasan mengenai jadwal pelaksanaan kegiatan utama dan pendukungnya (durasi konstruksi, fase mobilisasi, dll).',
        'reklamasi_status' => 'Berikan penjelasan singkat dan tegas mengenai apakah kegiatan ini dilakukan dengan reklamasi atau non-reklamasi.',
        'kegiatan_berusaha' => 'Nyatakan apakah kegiatan ini adalah berusaha atau non-berusaha. Jika berusaha, sebutkan izin berusaha yang relevan (NIB/KBLI). Jika non-berusaha, sampaikan data dukung yang relevan.',
        'kegiatan_strategis' => 'Nyatakan apakah kegiatan ini merupakan Proyek Strategis Nasional (PSN) atau non-strategis nasional. Sampaikan dasar hukum atau data dukung jika merupakan PSN.',
        'rencana_tapak' => 'Buatkan narasi terkait rencana tapak/site plan kegiatan, rencana bangunan yang akan dibuat, serta fasilitas penunjangnya yang relevan dengan permohonan ruang laut.',
        'deskripsi_luas' => 'Sampaikan rincian kebutuhan ruang laut untuk kegiatan yang dimohonkan, baik kegiatan utama maupun penunjangnya, dilengkapi dengan deskripsi luas/panjang sesuai rencana.',
        'profil_dasar_laut' => 'Narasikan gambaran profil dasar laut pada lokasi permohonan, acuan profil melintang pantai, dan deskripsi kondisi substrat dasar laut berdasarkan data batimetri/pemeruman.',
        'sosial_ekonomi' => 'Uraikan kondisi sosial ekonomi masyarakat sekitar (mata pencaharian dominan, kelompok nelayan). Nyatakan bahwa kegiatan direncanakan tidak mengganggu akses melaut nelayan tradisional dan akan melibatkan konsultasi publik.',
        'aksesibilitas' => 'Jelaskan mengenai akses menuju lokasi kegiatan (jalur darat dan/atau laut) disertai dengan penggambaran rute atau metode mobilisasi material dan personel.',
        'sumber_material' => 'Jelaskan rencana sumber material reklamasi (misal: pasir laut), jarak lokasi pengambilan, volume material yang dibutuhkan (estimasi), dan metode pengendalian sedimentasi.',
        'data_geoteknik' => 'Narasikan kondisi geoteknik dasar laut secara umum (jenis tanah dasar, daya dukung, potensi penurunan/settlement) dan rekomendasi perbaikan tanah (soil improvement) jika diperlukan.',
        'pemanfaatan_lahan' => 'Jelaskan rencana pemanfaatan lahan hasil reklamasi (misal: area operasional, dermaga, gudang) dan jadwal pemanfaatan setelah masa konsolidasi tanah.',
        'metode_reklamasi' => 'Jelaskan secara detail metode pelaksanaan reklamasi (teknis, pengambilan material, penimbunan). Sertakan mitigasi efek reklamasi (perubahan hidro-oseanografi, dampak penimbunan, teknologi ramah lingkungan, mitigasi ekosistem).',
        'jadwal_reklamasi' => 'Berikan narasi mengenai jadwal rencana pelaksanaan pekerjaan reklamasi secara bertahap.',
    ];

    public function __construct()
    {
        $this->apiKey = (string) config('services.claude.key', '');
        $this->model = (string) config('services.claude.model', 'claude-opus-4-5');
    }

    /* ────────────────────────────────────────────────────────────────
     * PUBLIC — always returns ALL sections filled
     * ──────────────────────────────────────────────────────────────── */
    public function generateNarasi(string $documentText, array $profileContext = []): array
    {
        $prompt = $this->buildPrompt($documentText, $profileContext);
        $narasi = [];

        for ($attempt = 1; $attempt <= 2; $attempt++) {
            try {
                $narasi = $this->normalizeOutput($this->callClaude($prompt));

                if ($this->isComplete($narasi)) {
                    return $narasi;
                }

                Log::warning('Narasi belum lengkap, mencoba ulang.', [
                    'attempt' => $attempt,
                    'empty' => $this->emptySections($narasi),
                ]);
            } catch (Exception $e) {
                Log::error('Error saat call Claude.', ['error' => $e->getMessage()]);

                if ($attempt === 2 && empty(array_filter($narasi))) {
                    throw $e;
                }
            }
        }

        // Fallback: targeted second call for any section still empty
        $missing = $this->emptySections($narasi);

        if (! empty($missing)) {
            try {
                $fill = $this->fillMissingSections($missing, $documentText, $profileContext);

                foreach ($missing as $key) {
                    if (! empty($fill[$key])) {
                        $narasi[$key] = $fill[$key];
                    }
                }
            } catch (Exception $e) {
                Log::error('Fallback pengisian section gagal.', ['error' => $e->getMessage()]);
            }
        }

        return $this->normalizeOutput($narasi);
    }

    /**
     * Fill only explicitly missing proposal metadata.
     */
    public function extractProposalFields(string $documentText, array $missing): array
    {
        if (blank($this->apiKey) || empty($missing)) {
            return [];
        }

        $fieldList = implode(', ', $missing);
        $prompt = 'Ekstrak hanya field metadata proposal PKKPRL berikut dari teks. Jangan mengarang nilai. '
            ."Kembalikan JSON valid dengan seluruh key yang diminta; gunakan string kosong jika tidak ada.\n"
            .'FIELD: '.$fieldList."\nDOKUMEN:\n".$documentText
            ."\n\nOutput HANYA objek JSON valid tanpa markdown atau teks lain.";

        try {
            $raw = $this->callClaudeRaw($prompt, maxTokens: 2000);
            $decoded = $this->parseJson($raw);

            return is_array($decoded) ? $decoded : [];
        } catch (Exception $exception) {
            Log::warning('AI fallback ekstraksi proposal gagal.', ['error' => $exception->getMessage()]);

            return [];
        }
    }

    /**
     * Generate detailed, professional Bahasa Indonesia narration for the coastal
     * ecosystem subsection (mangrove, seagrass/lamun, coral reef) of a KKPRL
     * proposal DOCX, strictly grounded on the real data supplied in $context.
     *
     * The model is explicitly instructed to use ONLY the facts given (species,
     * cover percentage, condition, location) and never invent numbers, species
     * names, or distances that are not present in $context — any data point
     * that is genuinely absent must be reported as unavailable rather than
     * fabricated. Returns an array with keys: mangrove, lamun, karang, ringkasan.
     * Returns [] on any failure so the caller can fall back to static text.
     */
    public function generateEkosistemNarrative(array $context): array
    {
        if (blank($this->apiKey)) {
            return [];
        }

        $facts = collect($context)
            ->map(fn ($value, $key) => '- '.$key.': '.(is_bool($value) ? ($value ? 'Ya' : 'Tidak') : (filled($value) ? $value : '(tidak ada data)')))
            ->implode("\n");

        $year = now()->year;
        $today = now()->translatedFormat('j F Y');

        $prompt = <<<PROMPT
Anda adalah Analis Lingkungan Pesisir yang menyusun narasi teknis untuk proposal PKKPRL sesuai Pasal 42 ayat (4) Permen KP Nomor 28 Tahun 2021 mengenai kajian ekosistem pesisir (mangrove, terumbu karang, padang lamun).

Hari ini adalah {$today}. Tahun berjalan adalah {$year}.

ATURAN MUTLAK — WAJIB DIPATUHI:
1. HANYA gunakan data spesifik lokasi (spesies, persentase tutupan, kondisi) dari DATA FAKTUAL di bawah ini. DILARANG KERAS mengarang, menebak, atau menambahkan jenis spesies, persentase tutupan, kondisi, jarak, maupun angka spesifik-lokasi apa pun yang tidak tercantum secara eksplisit di DATA FAKTUAL.
2. Jika suatu data (misalnya persentase atau jarak) tidak tersedia di DATA FAKTUAL, JANGAN mengisinya dengan angka perkiraan — nyatakan secara eksplisit bahwa data tersebut tidak tersedia/tidak terukur dan perlu survei lanjutan, atau cukup hilangkan detail tersebut dari kalimat.
3. Jika suatu ekosistem dinyatakan TIDAK ADA (mis. has_mangrove = Tidak), tulis narasi yang menyatakan ekosistem tersebut tidak teridentifikasi pada lokasi kegiatan — jangan menulis narasi keberadaannya.
4. Gunakan alat pencarian web (web_search) secara aktif — lakukan BEBERAPA kali pencarian (bukan hanya satu) — untuk mencari referensi ILMIAH/RESMI TERKINI (tahun {$year} atau publikasi terbaru yang tersedia, JANGAN mengutip data usang bertahun-tahun lampau kecuali itu memang dasar hukum/peraturan yang masih berlaku) mengenai kondisi umum ekosistem pesisir (mangrove/lamun/terumbu karang) di wilayah "{$context['lokasi']}" dan perairan "{$context['nama_perairan']}" dari situs web NYATA dan tepercaya (contoh: kkp.go.id, brin.go.id, big.go.id, jurnal ilmiah/repositori kampus, mongabay.co.id, walhi.or.id, situs pemerintah daerah/BPS/OPD DKP setempat). Gunakan hasil pencarian sebagai konteks ekologis regional pendukung yang KAYA dan SPESIFIK-WILAYAH (mis. karakteristik ekosistem pesisir kabupaten/kota atau perairan tersebut, ancaman/tekanan lingkungan yang umum terjadi di kawasan itu, program konservasi/rehabilitasi yang pernah/sedang berjalan di sana, status kawasan konservasi terdekat bila ada) — BUKAN untuk mengganti atau menambah angka spesifik lokasi kegiatan yang tidak ada di DATA FAKTUAL.
5. Gunakan gaya bahasa teknis-formal Bahasa Indonesia sebagaimana lazim pada dokumen proposal PKKPRL/AMDAL resmi. WAJIB tulis 3-4 paragraf yang cukup panjang dan padat informasi untuk SETIAP subbagian ekosistem (mangrove, lamun, terumbu karang) — bukan 1-2 paragraf singkat, dan bukan poin-poin.
6. Setiap subbagian ekosistem WAJIB membahas seluruh aspek berikut secara berurutan dan mengalir sebagai narasi (bukan daftar bernomor), sepanjang relevan dengan data/hasil pencarian yang ada:
   a. Deskripsi kondisi eksisting di lokasi berdasarkan DATA FAKTUAL (spesies, persentase tutupan, kondisi) — jika ekosistem tidak ada, jelaskan hal ini secara eksplisit dengan penjelasan yang tetap informatif (mis. kemungkinan penyebab ekologis/geomorfologis ketiadaan ekosistem tersebut, bila didukung konteks pencarian web).
   a2. KHUSUS untuk angka PERSENTASE TUTUPAN pada DATA FAKTUAL (bila tersedia): bahas secara KHUSUS dan LEBIH MENDALAM (bukan hanya menyebut angkanya sekilas) — jelaskan apa arti persentase tersebut menurut kriteria baku kerusakan/kesehatan ekosistem pesisir yang relevan (mis. untuk terumbu karang: kategori Rusak/Sedang/Baik/Baik Sekali berdasarkan kriteria baku kerusakan terumbu karang KepMenLH; untuk mangrove/lamun: kategori jarang/sedang/padat atau rusak/baik menurut kriteria kerapatan tutupan yang berlaku), bandingkan dengan kondisi rata-rata/tipikal ekosistem sejenis di wilayah tersebut menurut hasil pencarian web (lebih tinggi/rendah/sebanding), dan jelaskan implikasinya terhadap fungsi ekologis serta tingkat kehati-hatian mitigasi yang diperlukan.
   b. Signifikansi ekologis jenis/kondisi yang disebutkan: peran fungsional ekosistem tersebut (mis. mangrove sebagai penahan abrasi & nursery ground, lamun sebagai habitat dugong/penyu & penyerap karbon biru, terumbu karang sebagai pemecah gelombang alami & habitat biota laut).
   c. Konteks regional/wilayah dari hasil pencarian web (karakteristik kawasan, status konservasi, tekanan/ancaman lingkungan yang umum di wilayah tersebut, upaya pengelolaan yang diketahui ada).
   d. Implikasi terhadap rencana kegiatan dan arahan mitigasi spesifik untuk ekosistem tersebut (mis. metode konstruksi yang meminimalkan gangguan, buffer zone, pengendalian sedimentasi, larangan penambatan pada substrat vegetasi, dsb.).
7. DILARANG mengulang kalimat yang sama persis antar subbagian; setiap subbagian harus punya narasi unik dan spesifik terhadap ekosistemnya masing-masing.
7b. JANGAN sertakan tag/markup sitasi apa pun di dalam teks narasi (mis. "<cite>...</cite>", "<cite index=\"...\">...</cite>", catatan kaki bernomor, atau kutipan mentah hasil pencarian yang ditempel apa adanya). Tulis narasi sebagai prosa mengalir yang meringkas/mengintegrasikan informasi tersebut dengan kata-kata sendiri — daftar sumber sudah dan HANYA dicantumkan terpisah di bagian akhir dokumen.
8. Output HANYA objek JSON valid tanpa markdown, dengan struktur persis:
{"mangrove": "...", "lamun": "...", "karang": "...", "ringkasan": "..."}
   - "ringkasan" berisi 1-2 paragraf kesimpulan komprehensif kondisi ekosistem pesisir di lokasi kegiatan secara keseluruhan (bukan mengulang isi subbagian) dan arahan mitigasi terpadu (revegetasi, penghindaran/avoidance, pengendalian sedimen, pemantauan berkala, dsb.) HANYA berdasarkan ekosistem yang benar-benar teridentifikasi ada pada DATA FAKTUAL.

DATA FAKTUAL:
{$facts}

Output HANYA objek JSON valid tanpa markdown atau teks lain di dalam blok teks akhir Anda.
PROMPT;

        try {
            // Needs generous headroom: the prompt demands 3-4 long paragraphs for
            // EACH of 3 ecosystem subsections plus a summary (easily 3000-4000+
            // output tokens on its own), and tokens are also spent on the
            // web_search tool_use calls/results before the model reaches the
            // final JSON text. Too low a budget risks hitting max_tokens mid-
            // search or mid-JSON with no usable (or truncated/invalid) output —
            // observed in testing with 6000.
            // Content alone (3-4 long paragraphs x 3 ecosystems + summary) can run
            // well past 12000 tokens once web_search tool_use/result overhead
            // (up to several searches, each potentially returning large snippet
            // text) is added on top — observed intermittently truncating mid-
            // JSON with 12000. Also cap search usage below the client default
            // (6) so more of the budget is reserved for the actual narrative.
            $json = $this->callClaudeWithWebSearch($prompt, maxTokens: 16000, maxSearchUses: 4);
            $text = $this->extractResponseText($json);

            if (blank($text)) {
                throw new Exception('Response Claude (web search) kosong.');
            }

            $decoded = $this->parseJson($text);

            if (! is_array($decoded)) {
                return [];
            }

            $result = [];
            foreach (['mangrove', 'lamun', 'karang', 'ringkasan'] as $key) {
                $value = $decoded[$key] ?? '';
                $result[$key] = is_string($value) ? $this->stripInlineCitationTags($value) : '';
            }

            $result['sumber'] = $this->extractCitations($json);

            return $result;
        } catch (Exception $exception) {
            Log::warning('AI narasi ekosistem (web search) gagal, mencoba tanpa pencarian web.', ['error' => $exception->getMessage()]);

            // Fallback: same instructions, no web search tool (older accounts/models
            // may not support the tool, or the call may have failed transiently).
            // Same long-output reasoning as above minus the tool-call overhead.
            try {
                $raw = $this->callClaudeRaw($prompt, maxTokens: 12000);
                $decoded = $this->parseJson($raw);

                if (! is_array($decoded)) {
                    return [];
                }

                $result = [];
                foreach (['mangrove', 'lamun', 'karang', 'ringkasan'] as $key) {
                    $value = $decoded[$key] ?? '';
                    $result[$key] = is_string($value) ? $this->stripInlineCitationTags($value) : '';
                }

                $result['sumber'] = [];

                return $result;
            } catch (Exception $fallbackException) {
                Log::warning('AI narasi ekosistem gagal total.', ['error' => $fallbackException->getMessage()]);

                return [];
            }
        }
    }

    /**
     * Estimates whichever hydro-oceanography / ecosystem-area parameters are
     * still missing (the "Laporan Hidro-Oseanografi" survey document is
     * optional and frequently never uploaded, or extraction only recovers
     * some of its fields) using Anthropic's web_search tool to ground the
     * estimate in real, publicly available regional oceanographic reference
     * data (BMKG, BIG, Dishidros, published bathymetry/wave-climate studies,
     * etc.) for the given water body/region — NOT a substitute for an actual
     * site survey, and explicitly labeled as such in the returned "catatan".
     *
     * $context: ['lokasi' => ..., 'nama_perairan' => ..., 'jenis_kegiatan' => ...,
     * 'data_terukur_tersedia' => [key => value, ...]] (already-known values, so
     * the AI stays consistent with them instead of estimating in isolation).
     * $missingKeys: array of LaporanTextExtractor::FIELD_HINTS keys to estimate.
     *
     * Returns ['values' => [key => string, ...], 'catatan' => string, 'sumber' => [...]].
     * Returns [] on any failure so the caller falls back to the existing
     * self::MISSING placeholder text.
     */
    public function estimateHidroOseanografi(array $context, array $missingKeys): array
    {
        if (blank($this->apiKey) || ! $missingKeys) {
            return [];
        }

        $hints = \App\Services\Egerai\LaporanTextExtractor::FIELD_HINTS;
        $daftarField = collect($missingKeys)
            ->map(fn ($key) => '- '.$key.': '.($hints[$key] ?? $key))
            ->implode("\n");

        $known = collect($context['data_terukur_tersedia'] ?? [])
            ->map(fn ($value, $key) => '- '.$key.': '.$value)
            ->implode("\n");
        $knownBlock = $known !== '' ? $known : '(tidak ada data terukur lain yang tersedia)';

        $year = now()->year;

        $prompt = <<<PROMPT
Anda adalah Ahli Hidro-Oseanografi yang membantu menyusun draf awal proposal PKKPRL. Dokumen "Laporan Hidro-Oseanografi" survei lapangan untuk kegiatan ini TIDAK tersedia atau tidak lengkap, sehingga beberapa parameter teknis di bawah ini perlu diisi dengan ESTIMASI REGIONAL sementara (bukan data hasil pengukuran lapangan), agar draf proposal tidak kosong sambil menunggu survei sesungguhnya.

Lokasi kegiatan: "{$context['lokasi']}"
Perairan: "{$context['nama_perairan']}"
Jenis kegiatan: "{$context['jenis_kegiatan']}"

DATA TERUKUR YANG SUDAH TERSEDIA (gunakan sebagai konteks agar estimasi Anda konsisten dengannya, JANGAN diubah):
{$knownBlock}

ATURAN MUTLAK — WAJIB DIPATUHI:
1. Gunakan alat pencarian web (web_search) secara aktif — lakukan BEBERAPA kali pencarian dengan variasi kata kunci — untuk mencari referensi RESMI/ILMIAH (BMKG, BIG, Dishidros/Pushidrosal, jurnal ilmiah, publikasi KKP, studi AMDAL/oseanografi wilayah tersebut) mengenai karakteristik gelombang, arus, pasang surut, dan batimetri di perairan "{$context['nama_perairan']}" atau wilayah pesisir "{$context['lokasi']}" atau wilayah perairan terdekat/sejenis di Indonesia bila referensi spesifik lokasi tidak ditemukan.
2. Estimasi HANYA boleh didasarkan pada referensi yang benar-benar ditemukan lewat pencarian (karakteristik regional/wilayah perairan sejenis) — DILARANG KERAS mengarang angka tanpa dasar apa pun.
3. Jika untuk suatu parameter TIDAK ditemukan referensi yang cukup layak untuk dijadikan dasar estimasi regional, kembalikan string kosong ("") untuk parameter tersebut — JANGAN menebak.
4. Nilai numerik dikembalikan sebagai angka saja (tanpa satuan, gunakan titik sebagai desimal), kecuali disebutkan lain pada definisi field.
5. Field eko_* (luas/persentase ekosistem) HANYA diisi bila konsisten satu sama lain (total = karang + lainnya + terbuka, persentase menjumlah ~100%) dan tetap ditandai sebagai estimasi.

PARAMETER YANG PERLU DIESTIMASI (hanya field berikut, field lain jangan disertakan):
{$daftarField}

Output HANYA objek JSON valid tanpa markdown, dengan struktur persis:
{"values": {"<key>": "<estimasi atau string kosong>", ...}, "catatan": "1 kalimat singkat yang menyatakan bahwa nilai-nilai ini adalah estimasi regional preliminer berdasarkan referensi publik, bukan hasil survei lapangan, dan wajib diverifikasi dengan survei hidro-oseanografi sesungguhnya sebelum pengajuan resmi."}
PROMPT;

        try {
            // Needs headroom beyond the final JSON payload itself: tokens are also
            // spent on the model's web_search tool_use calls and their results
            // before it reaches the final text block. Too low a budget here risks
            // hitting max_tokens mid-search with no text block at all (observed
            // in testing with 3000, and again intermittently with 6000 when the
            // model runs several searches across up to 21 parameters).
            $json = $this->callClaudeWithWebSearch($prompt, maxTokens: 10000);
            $text = $this->extractResponseText($json);

            if (blank($text)) {
                throw new Exception('Response Claude (web search) kosong.');
            }

            $decoded = $this->parseJson($text);

            if (! is_array($decoded) || ! is_array($decoded['values'] ?? null)) {
                return [];
            }

            $values = [];
            foreach ($missingKeys as $key) {
                $value = $decoded['values'][$key] ?? '';
                $values[$key] = is_string($value) || is_numeric($value) ? trim((string) $value) : '';
            }

            return [
                'values' => $values,
                'catatan' => is_string($decoded['catatan'] ?? null) ? $this->stripInlineCitationTags($decoded['catatan']) : '',
                'sumber' => $this->extractCitations($json),
            ];
        } catch (Exception $exception) {
            Log::warning('AI estimasi hidro-oseanografi gagal.', ['error' => $exception->getMessage()]);

            return [];
        }
    }

    /**
     * Same as callClaudeRaw() but enables Anthropic's native web_search tool so the
     * model can ground its answer in real, current web pages instead of relying on
     * stale training data. Returns the full decoded JSON response (not just the text)
     * so callers can also pull out the `citations` attached to text blocks — these
     * citations are populated by Anthropic only from pages the tool actually fetched,
     * so any URL surfaced this way corresponds to a real page that was retrieved.
     */
    protected function callClaudeWithWebSearch(string $prompt, int $maxTokens = 3000, int $maxSearchUses = 6, ?string $system = null): array
    {
        return $this->callClaudeMessagesWithWebSearch(
            [['role' => 'user', 'content' => $prompt]],
            $maxTokens,
            $maxSearchUses,
            $system,
        );
    }

    /**
     * Same as callClaudeWithWebSearch() but takes a full multi-turn message list
     * (role/content pairs) instead of a single prompt string, so conversation
     * history can be preserved across turns.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    protected function callClaudeMessagesWithWebSearch(array $messages, int $maxTokens = 3000, int $maxSearchUses = 6, ?string $system = null): array
    {
        $payload = [
            'model' => $this->model,
            'max_tokens' => $maxTokens,
            'tools' => [
                [
                    'type' => 'web_search_20250305',
                    'name' => 'web_search',
                    'max_uses' => $maxSearchUses,
                ],
            ],
            'messages' => $messages,
        ];

        if (filled($system)) {
            $payload['system'] = $system;
        }

        // 300s: the ecosystem narrative call in particular now asks for very long,
        // multi-section output (up to 16000 tokens) plus several web_search
        // round-trips — 180s was observed to time out on that specific call under
        // normal latency once the higher token budget was needed for detail/length.
        $response = Http::timeout(300)
            ->withHeaders($this->headers())
            ->post(self::CLAUDE_API_URL, $payload);

        if ($response->failed()) {
            Log::warning('Claude web search API error.', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new Exception('Gagal menghubungi Claude API (web search): '.$response->status());
        }

        return $response->json() ?? [];
    }

    /**
     * Pull the real source pages Claude's web_search tool actually visited.
     *
     * Anthropic populates two independent signals for this and neither alone is
     * reliable on every turn:
     * - `citations` metadata attached to text blocks (only present when the model's
     *   final wording closely echoes a specific retrieved snippet — often empty on
     *   turns where the model paraphrases instead, especially in multi-turn chats).
     * - `web_search_tool_result` blocks, which always list every page the tool
     *   actually fetched for that turn, regardless of whether the final answer
     *   quoted it directly.
     * We merge both (deduped by URL) so a source list is shown whenever a search
     * actually happened, not only when Anthropic's citation heuristic fires.
     * Never fabricated — if no search ran, this returns [].
     *
     * @return array<int, array{title: string, url: string}>
     */
    private function extractCitations(array $json): array
    {
        $blocks = $json['content'] ?? [];
        if (! is_array($blocks)) {
            return [];
        }

        $fromCitations = collect($blocks)
            ->filter(fn ($block) => is_array($block) && ($block['type'] ?? null) === 'text' && ! empty($block['citations']))
            ->flatMap(fn ($block) => $block['citations'])
            ->filter(fn ($citation) => is_array($citation) && filled($citation['url'] ?? null))
            ->map(fn ($citation) => [
                'title' => trim((string) ($citation['title'] ?? $citation['url'])),
                'url' => trim((string) $citation['url']),
            ]);

        $fromSearchResults = collect($blocks)
            ->filter(fn ($block) => is_array($block) && ($block['type'] ?? null) === 'web_search_tool_result')
            ->flatMap(fn ($block) => is_array($block['content'] ?? null) ? $block['content'] : [])
            ->filter(fn ($result) => is_array($result) && ($result['type'] ?? null) === 'web_search_result' && filled($result['url'] ?? null))
            ->map(fn ($result) => [
                'title' => trim((string) ($result['title'] ?? $result['url'])),
                'url' => trim((string) $result['url']),
            ]);

        return $fromCitations->concat($fromSearchResults)
            ->unique('url')
            ->values()
            ->all();
    }

    /**
     * Answer a KKPRL question, grounded on real, current web pages via Anthropic's
     * native web_search tool wherever the question benefits from up-to-date info
     * (e.g. PNBP rates, OSS procedures, SLA). Returns ['answer' => string, 'sources' => array]
     * where `sources` only ever contains pages the tool actually fetched (from Anthropic's
     * `citations` metadata) — never fabricated URLs — so the frontend can render a
     * "Sumber" list beneath the answer, similar to ChatGPT's web-search citations.
     */
    /**
     * Answer a KKPRL question, grounded on the ported reference knowledge base
     * (legal basis, PNBP tariffs + calculation, SLA, document checklists, mitos vs
     * fakta) plus real-time web verification via Anthropic's native web_search tool
     * for anything that can change over time. Supports multi-turn conversation
     * history (trimmed to the last MAX_HISTORY_MESSAGES entries), mirroring the
     * reference asisten_kkprl.py's `chat_reply(messages)`.
     *
     * @param  array<int, array{role: string, content: string}>  $history  Prior turns, oldest first (excluding the current $question).
     * @return array{answer: string, sources: array<int, array{title: string, url: string}>}
     */
    public function answerKkprl(string $question, array $history = []): array
    {
        if (blank($this->apiKey)) {
            return ['answer' => 'Asisten belum aktif. Silakan hubungi BPRL Makassar atau gunakan layanan e-SEA resmi.', 'sources' => []];
        }

        $year = now()->year;
        $systemPrompt = self::SYSTEM_PROMPT_KKPRL
            ."\n\nTahun berjalan adalah {$year} — jangan menyampaikan informasi/angka yang sudah usang seolah-olah masih berlaku saat ini."
            .' Gunakan format Markdown: **bold** untuk istilah/angka penting, gunakan poin (-) untuk daftar syarat/langkah, jangan gunakan heading (#).'
            .' WAJIB: gunakan alat pencarian web (web_search) minimal satu kali untuk SETIAP pertanyaan yang berkaitan dengan KKPRL/ruang laut sebelum menjawab — walaupun BANK DATA di atas sudah memuat jawabannya — guna memverifikasi/melengkapi jawaban dengan sumber resmi terkini (oss.go.id, kkp.go.id, jdih.kkp.go.id, e-sea.kkp.go.id, peraturan.go.id). Kecualikan pencarian hanya untuk sapaan/basa-basi atau pertanyaan yang jelas di luar topik KKPRL.';

        $messages = collect($history)
            ->filter(fn ($m) => is_array($m) && in_array($m['role'] ?? null, ['user', 'assistant'], true) && filled($m['content'] ?? null))
            ->map(fn ($m) => ['role' => $m['role'], 'content' => (string) $m['content']])
            ->values()
            ->all();

        $messages[] = ['role' => 'user', 'content' => $question];
        $messages = array_slice($messages, -self::MAX_HISTORY_MESSAGES);

        try {
            $json = $this->callClaudeMessagesWithWebSearch(
                $messages,
                maxTokens: 2500,
                maxSearchUses: 3,
                system: $systemPrompt,
            );

            $answer = trim($this->extractResponseText($json));

            if (blank($answer)) {
                Log::warning('Claude Asisten KKPRL tidak mengembalikan jawaban.', [
                    'model' => $this->model,
                    'response' => $json,
                ]);

                return ['answer' => 'Asisten tidak menerima jawaban dari model. Periksa konfigurasi model lalu coba lagi.', 'sources' => []];
            }

            return ['answer' => $answer, 'sources' => $this->extractCitations($json)];
        } catch (Exception $exception) {
            Log::warning('Asisten KKPRL gagal.', ['error' => $exception->getMessage()]);

            return ['answer' => 'Maaf, terjadi kendala teknis saat menghubungi asisten. Silakan coba lagi sebentar lagi, atau hubungi hotline BPRL Makassar.', 'sources' => []];
        }
    }

    /* ────────────────────────────────────────────────────────────────
     * API CALL
     * ──────────────────────────────────────────────────────────────── */

    /**
     * Call Claude and parse the response as JSON, returning an array.
     */
    protected function callClaude(string $prompt, int $maxTokens = 8192): array
    {
        $raw = $this->callClaudeRaw($prompt, $maxTokens);
        $decoded = $this->parseJson($raw);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Call Claude and return the raw text response.
     */
    protected function callClaudeRaw(string $prompt, int $maxTokens = 8192): string
    {
        // 180s: shared by several callers; raised from 120s since the ecosystem
        // narrative's no-web-search fallback now requests up to 12000 tokens of
        // long-form output, which can occasionally run past 120s on its own.
        $response = Http::timeout(180)
            ->withHeaders($this->headers())
            ->post(self::CLAUDE_API_URL, [
                'model' => $this->model,
                'max_tokens' => $maxTokens,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

        if ($response->failed()) {
            Log::error('Claude API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new Exception('Gagal menghubungi Claude API: '.$response->status());
        }

        $text = $this->extractResponseText($response->json() ?? []);

        if (blank($text)) {
            throw new Exception('Response Claude kosong.');
        }

        return $text;
    }

    /**
     * Claude's `content` array does not always put a text block at index 0 —
     * models can prepend `thinking`/`redacted_thinking`/`server_tool_use`
     * blocks (extended-thinking or tool-use responses) before the actual
     * `text` block, or split the answer across multiple text blocks.
     * Concatenates every text block instead of blindly reading content.0.text.
     */
    private function extractResponseText(array $json): string
    {
        $blocks = $json['content'] ?? [];
        if (! is_array($blocks)) {
            return '';
        }

        return trim(collect($blocks)
            ->filter(fn ($block) => is_array($block) && ($block['type'] ?? null) === 'text')
            ->map(fn ($block) => (string) ($block['text'] ?? ''))
            ->implode("\n"));
    }

    /* ────────────────────────────────────────────────────────────────
     * FALLBACK: fill only the sections that came back empty
     * ──────────────────────────────────────────────────────────────── */
    protected function fillMissingSections(array $missing, string $documentText, array $profileContext): array
    {
        $list = implode(', ', $missing);
        $guide = collect(self::SECTION_PROMPTS)
            ->only($missing)
            ->map(fn ($text, $key) => "- [{$key}] {$text}")
            ->implode("\n");

        $prompt = <<<PROMPT
Anda adalah Senior Analis Hidro-Oseanografi menyusun proposal PKKPRL.
Bagian berikut BELUM terisi dan WAJIB Anda isi sekarang: {$list}.

ATURAN:
1. Tulis narasi teknis 2-3 paragraf untuk setiap bagian tersebut.
2. Penuhi PANDUAN RESMI TEMPLATE di bawah: sebutkan sumber data dan seluruh variabel yang diminta.
3. Gunakan data spesifik dari DOKUMEN SUMBER bila tersedia; bila tidak, turunkan analisis yang masuk akal dari KONTEKS PROFIL dan oseanografi regional pesisir Indonesia.
4. DILARANG mengirim string kosong atau menulis "data tidak tersedia".
5. Output HANYA objek JSON valid tanpa markdown.

KONTEKS PROFIL:
{$this->formatContext($profileContext)}

PANDUAN RESMI TEMPLATE UNTUK BAGIAN TERSEBUT:
{$guide}

DOKUMEN SUMBER:
{$documentText}
PROMPT;

        return $this->normalizeOutput(
            $this->callClaude($prompt),
            $missing
        );
    }

    /* ────────────────────────────────────────────────────────────────
     * PROMPT & SCHEMA
     * ──────────────────────────────────────────────────────────────── */
    protected function buildPrompt(string $documentText, array $profileContext): string
    {
        $guide = collect(self::SECTION_PROMPTS)
            ->map(fn ($text, $key) => "- [{$key}] {$text}")
            ->implode("\n");
        $sections = implode(', ', self::REQUIRED_SECTIONS);

        return <<<PROMPT
Anda adalah Senior Analis Hidro-Oseanografi dan Ahli Rekayasa Pantai yang menyusun narasi teknis proposal PKKPRL (Permen KP No. 28 Tahun 2021) berdasarkan DOKUMEN SUMBER.

INSTRUKSI WAJIB:
1. Output HANYA objek JSON valid dengan key berikut: {$sections}. Tanpa markdown, tanpa teks pembuka/penutup.
2. SEMUA key WAJIB diisi narasi teknis formal (1-3 paragraf). STRING KOSONG DILARANG.
3. Setiap narasi WAJIB memenuhi PANDUAN RESMI TEMPLATE bagiannya.
4. Gunakan DATA SPESIFIK dari DOKUMEN SUMBER secara akurat. WAJIB menyalin angka persis (exact copy-paste) dari dokumen untuk parameter kritis: Tinggi Gelombang Maksimum (Hs), Kecepatan Arus Maksimum, dan Elevasi Pasut (HAT/MSL/LAT). JANGAN memodifikasi, membulatkan, atau mengarang angka yang berbeda dari yang tertulis di dokumen sumber.
5. PENTING: Jika suatu variabel atau bagian TIDAK tercantum secara eksplisit di DOKUMEN SUMBER, Anda WAJIB melengkapi narasi tersebut menggunakan pengetahuan teknis standar rekayasa pantai, oseanografi regional, dan praktik terbaik industri yang masuk akal untuk lokasi tersebut. DILARANG menulis "data tidak tersedia" atau kalimat penolakan.
6. Abaikan bagian dokumen yang tidak relevan (daftar isi, lampiran teks).

KONTEKS PROFIL PEMOHON:
{$this->formatContext($profileContext)}

PANDUAN RESMI TEMPLATE PER BAGIAN:
{$guide}

DOKUMEN SUMBER:
{$documentText}
PROMPT;
    }

    /* ────────────────────────────────────────────────────────────────
     * HELPERS
     * ──────────────────────────────────────────────────────────────── */
    protected function headers(): array
    {
        return [
            'x-api-key' => $this->apiKey,
            'anthropic-version' => self::CLAUDE_VERSION,
            'content-type' => 'application/json',
        ];
    }

    protected function parseJson(string $text): mixed
    {
        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        }

        // Strip markdown fences and retry
        $clean = preg_replace('/^```(?:json)?\s*|\s*```$/s', '', trim($text));
        $decoded = json_decode($clean, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        }

        // Claude frequently emits raw, unescaped newlines/tabs inside long JSON
        // string values (e.g. multi-paragraph narrative text) instead of the
        // required \n/\t escapes — technically invalid JSON per RFC 8259, and
        // the single most common cause of "Control character error" failures
        // observed here in practice, especially for long free-text fields like
        // the ecosystem/hydro-oceanography narratives. This is a recoverable,
        // well-known quirk, so escape any literal control character found
        // strictly inside a JSON string literal (structural whitespace between
        // tokens is never touched) and retry once more before giving up.
        $sanitized = $this->escapeRawControlCharsInJsonStrings($clean);
        $decoded = json_decode($sanitized, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        }

        throw new Exception('Gagal parse JSON dari Claude: '.json_last_error_msg());
    }

    /**
     * Defensive cleanup for narrative text fields (mangrove/lamun/karang/
     * ringkasan/catatan): despite prompt instructions forbidding it, Claude's
     * web_search-grounded responses sometimes leak its own inline citation
     * markup — e.g. `<cite index="11-4">quoted excerpt...</cite>` — directly
     * into the JSON string value instead of keeping citations purely as
     * separate response metadata (handled by extractCitations()). Left as-is,
     * this renders as literal, meaningless "<cite ...>" text in the generated
     * document. Strips any such tag pair (including the quoted excerpt inside,
     * which is usually a redundant raw source snippet disrupting the
     * narrative's flow) plus any unpaired/malformed leftover tag fragment, then
     * tidies up the resulting whitespace/punctuation spacing.
     */
    private function stripInlineCitationTags(string $text): string
    {
        // Opening delimiter is tolerant of both "<cite ...>" and the malformed
        // "(cite ...>" variant observed in practice (Claude occasionally emits
        // "(" instead of "<" for the opening bracket, while still closing with
        // a proper "</cite>").
        $text = preg_replace('/[<(]\s*cite\b[^>]*>.*?<\s*\/\s*cite\s*>/is', '', $text) ?? $text;
        // Catch any leftover unpaired/malformed opening or closing tag fragment.
        $text = preg_replace('/[<(]\s*\/?\s*cite\b[^>]*>/i', '', $text) ?? $text;
        $text = preg_replace('/[ \t]{2,}/', ' ', $text) ?? $text;
        $text = preg_replace('/[ \t]+([.,;:])/', '$1', $text) ?? $text;

        return trim($text);
    }

    /**
     * Escapes raw ASCII control bytes (0x00-0x1F) that appear inside a JSON
     * string literal, leaving everything else (including multi-byte UTF-8
     * sequences, which use only bytes >= 0x80, and whitespace outside of
     * strings) completely untouched. Operates byte-by-byte, which is safe for
     * UTF-8 here because continuation/lead bytes are always >= 0x80 and so
     * never match the "< 0x20" check.
     */
    private function escapeRawControlCharsInJsonStrings(string $json): string
    {
        $result = '';
        $inString = false;
        $escaped = false;

        for ($i = 0, $len = strlen($json); $i < $len; $i++) {
            $char = $json[$i];

            if (! $inString) {
                if ($char === '"') {
                    $inString = true;
                }
                $result .= $char;

                continue;
            }

            if ($escaped) {
                $result .= $char;
                $escaped = false;

                continue;
            }

            if ($char === '\\') {
                $result .= $char;
                $escaped = true;

                continue;
            }

            if ($char === '"') {
                $inString = false;
                $result .= $char;

                continue;
            }

            if (ord($char) < 0x20) {
                $result .= match ($char) {
                    "\n" => '\\n',
                    "\r" => '\\r',
                    "\t" => '\\t',
                    default => sprintf('\\u%04x', ord($char)),
                };

                continue;
            }

            $result .= $char;
        }

        return $result;
    }

    protected function formatContext(array $profileContext): string
    {
        return collect($profileContext)
            ->filter(fn ($value) => ! empty($value))
            ->map(fn ($value, $key) => "- {$key}: {$value}")
            ->implode("\n") ?: '- (tidak ada konteks tambahan)';
    }

    protected function normalizeOutput(array $narasi, ?array $keys = null): array
    {
        $result = [];

        foreach ($keys ?? self::REQUIRED_SECTIONS as $key) {
            $value = $narasi[$key] ?? '';

            if (! is_string($value)) {
                $value = '';
            }

            $value = preg_replace('/^```(?:json)?\s*|\s*```$/m', '', $value);

            $result[$key] = trim($value);
        }

        return $result;
    }

    protected function isComplete(array $narasi): bool
    {
        return empty($this->emptySections($narasi));
    }

    protected function emptySections(array $narasi): array
    {
        return array_values(array_filter(
            self::REQUIRED_SECTIONS,
            fn ($key) => empty(trim((string) ($narasi[$key] ?? '')))
        ));
    }
}
