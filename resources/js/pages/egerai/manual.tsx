import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Check,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Compass,
    FileCheck2,
    FileText,
    Image as ImageIcon,
    Leaf,
    MapPin,
    MapPinned,
    Route,
    Sparkles,
    UploadCloud,
    UserRound,
    Users,
    Waves,
} from 'lucide-react';
import { useState } from 'react';
import type { ComponentType, FormEvent, ReactNode } from 'react';
import { ImageField } from '@/components/ImageField';
import {
    EXAMPLE_JADWAL,
    EXAMPLE_KOORDINAT,
    JadwalTable,
    KoordinatTable,
    emptyJadwalRows,
    emptyKoordinatRows,
} from '@/components/ScheduleCoordinateTables';
import type {
    JadwalRow,
    KoordinatRow,
} from '@/components/ScheduleCoordinateTables';
import {
    accordionBodyClass,
    accordionItemClass,
    accordionSummaryClass,
    checkboxRowClass,
    classifyCondition,
    DecimalField,
    DigitsField,
    draftButtonClass,
    DUKUNG_ITEMS,
    DukungDocuments,
    emptyDukungState,
    fieldHintClass,
    fieldInputClass,
    fieldLabelClass,
    KARANG_SPECIES,
    LAMUN_SPECIES,
    MANGROVE_SPECIES,
    MoneyField,
    NpwpField,
    primaryButtonClass,
    resolveOther,
    SelectWithOther,
    SpeciesPicker,
    TextAreaField,
    TextField,
    WilayahCascade,
} from '../kkprl-konsultasi-form';
import type {
    CustomDukungRow,
    DukungState,
    WilayahValue,
} from '../kkprl-konsultasi-form';
import AppLayout from '../layout';

function SectionIcon({
    icon: Icon,
    className,
}: {
    icon: ComponentType<{ className?: string }>;
    className: string;
}) {
    return (
        <span
            className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg ${className}`}
        >
            <Icon className="h-4 w-4" />
        </span>
    );
}

function SectionTitle({
    icon,
    iconClassName,
    children,
}: {
    icon: ComponentType<{ className?: string }>;
    iconClassName: string;
    children: ReactNode;
}) {
    return (
        <span className="flex items-center gap-2.5">
            <SectionIcon icon={icon} className={iconClassName} />
            {children}
        </span>
    );
}

const JENIS_KEGIATAN_OPTIONS = [
    {
        value: 'Pemanfaatan Air Laut untuk Budi Daya',
        label: 'Pemanfaatan Air Laut untuk Budi Daya',
    },
    { value: 'Keramba Jaring Apung', label: 'Keramba Jaring Apung' },
    { value: 'Dermaga', label: 'Dermaga' },
];

const NAMA_PERAIRAN_OPTIONS = [
    'Laut Banda',
    'Laut Sulawesi',
    'Laut Bali',
    'Laut Sawu',
    'Laut Flores',
    'Selat Makassar',
    'Teluk Bone',
    'Teluk Tomini',
].map((v) => ({ value: v, label: v }));

const KBLI_OPTIONS = [
    '93295 - Wisata Pantai',
    '93296 - Wisata Agro',
    '93297 - Wisata Tirta',
    '93299 - Aktivitas Hiburan dan Rekreasi Lainnya YTDL',
    '55101 - Aktivitas Hotel Bintang Lima',
    '55102 - Aktivitas Hotel Bintang Empat',
    '55103 - Aktivitas Hotel Bintang Tiga',
    '55104 - Aktivitas Hotel Bintang Dua',
    '55105 - Aktivitas Hotel Bintang Satu',
    '50113 - Angkutan Laut Dalam Negeri untuk Wisata',
    '03110 - Penangkapan Ikan dan Biota Air Lainnya di Laut',
    '03120 - Penangkapan Ikan dan Biota Air Lainnya di Perairan Air Tawar',
    '03211 - Pembudidayaan Ikan Bersirip (Selain Ikan Hias) dan Biota Air Laut Lainnya yang Tidak Dilindungi',
    '03212 - Pembudidayaan Ikan Hias Air Laut yang Tidak Dilindungi',
    '03213 - Pembudidayaan Tumbuhan Air Laut yang Tidak Dilindungi',
    '03214 - Pengembangbiakan Ikan dan Biota Air Laut yang Dilindungi',
    '03231 - Pembudidayaan Ikan Bersirip (Selain Ikan Hias) dan Biota Air Payau Lainnya yang Tidak Dilindungi',
    '03232 - Pembudidayaan Ikan Hias Air Payau yang Tidak Dilindungi',
    '03233 - Pembudidayaan Tumbuhan Air Payau yang Tidak Dilindungi',
    '03234 - Pengembangbiakan Biota Air Payau yang Dilindungi',
].map((v) => ({ value: v, label: v }));

// Default shown in the "Tanggal Penyusunan" date picker when the user hasn't
// picked one yet; the backend also independently defaults to today if this
// is ever submitted blank (see EgeraiManualController::mapPropFields()).
const todayIso = new Date().toISOString().split('T')[0];

export default function EgeraiManual() {
    const [values, setValues] = useState<Record<string, string>>({});
    const setValue = (name: string, value: string) =>
        setValues((prev) => ({ ...prev, [name]: value }));

    const [otherValues, setOtherValues] = useState<Record<string, string>>({});
    const setOtherValue = (name: string, value: string) =>
        setOtherValues((prev) => ({ ...prev, [name]: value }));

    const [wilayah, setWilayah] = useState<WilayahValue>({
        provinsi: '',
        kabupaten: '',
        kecamatan: '',
        desa: '',
    });

    const [laporanFile, setLaporanFile] = useState<File | null>(null);
    const [images, setImages] = useState<Record<string, File[]>>({});
    const setImageField = (name: string, files: File[]) =>
        setImages((prev) => ({ ...prev, [name]: files }));

    const [jenisPermohonan, setJenisPermohonan] = useState<
        'Persetujuan' | 'Konfirmasi'
    >('Persetujuan');
    const isKonfirmasi = jenisPermohonan === 'Konfirmasi';

    const [nonReklamasi, setNonReklamasi] = useState(false);
    const [reklamasi, setReklamasi] = useState(false);
    const [kegiatanBerusaha, setKegiatanBerusaha] = useState(false);
    const [nonBerusaha, setNonBerusaha] = useState(false);
    const [strategis, setStrategis] = useState(false);
    const [nonStrategis, setNonStrategis] = useState(false);

    const [instalasiPosisi, setInstalasiPosisi] = useState<string[]>([]);
    const toggleInstalasiPosisi = (v: string) =>
        setInstalasiPosisi((prev) =>
            prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
        );

    const [mangroveSpecies, setMangroveSpecies] = useState<string[]>([]);
    const [mangroveLainnya, setMangroveLainnya] = useState('');
    const [lamunSpecies, setLamunSpecies] = useState<string[]>([]);
    const [lamunLainnya, setLamunLainnya] = useState('');
    const [karangSpecies, setKarangSpecies] = useState<string[]>([]);
    const [karangLainnya, setKarangLainnya] = useState('');

    const [dukung, setDukung] = useState<DukungState>(emptyDukungState());
    const [customDukungRows, setCustomDukungRows] = useState<CustomDukungRow[]>(
        [],
    );

    const [jadwalRows, setJadwalRows] =
        useState<JadwalRow[]>(emptyJadwalRows());
    const [koordinatRows, setKoordinatRows] =
        useState<KoordinatRow[]>(emptyKoordinatRows());

    const [processing, setProcessing] = useState(false);
    const { errors } = usePage().props as unknown as {
        errors: Record<string, string>;
    };

    const mangroveAda = values.mangrove_ada ?? '';
    const lamunAda = values.lamun_ada_manual ?? '';
    const karangAda = values.karang_ada ?? '';
    const mangroveLocked = !mangroveAda.startsWith('Terdapat ekosistem');
    const lamunLocked = !lamunAda.startsWith('Terdapat ekosistem');
    const karangLocked = !karangAda.startsWith('Terdapat ekosistem');

    const buildFormData = (): FormData => {
        const fd = new FormData();

        fd.append('jenis_permohonan', jenisPermohonan);

        if (laporanFile) {
            fd.append('laporan', laporanFile);
        }

        const textFields: Record<string, string> = {
            prop__Nama_Pemohon: values.prop__Nama_Pemohon ?? '',
            prop__Jabatan_Pemohon: values.prop__Jabatan_Pemohon ?? '',
            prop__Nama_Perusahaan_Instansi:
                values.prop__Nama_Perusahaan_Instansi ?? '',
            prop__NIB: values.prop__NIB ?? '',
            prop__NPWP: values.prop__NPWP ?? '',
            prop__Nomor_Telepon_Selular:
                values.prop__Nomor_Telepon_Selular ?? '',
            prop__Surat_Elektronik: values.prop__Surat_Elektronik ?? '',
            prop__Jenis_Kegiatan: resolveOther(
                values.prop__Jenis_Kegiatan ?? '',
                otherValues.prop__Jenis_Kegiatan ?? '',
            ),
            prop__Nama_Perairan: resolveOther(
                values.prop__Nama_Perairan ?? '',
                otherValues.prop__Nama_Perairan ?? '',
            ),
            prop__Luas_Kebutuhan_Ruang: values.prop__Luas_Kebutuhan_Ruang ?? '',
            prop__KBLI: resolveOther(
                values.prop__KBLI ?? '',
                otherValues.prop__KBLI ?? '',
            ),
            prop__Tanggal_Penyusunan:
                values.prop__Tanggal_Penyusunan ?? todayIso,
            prop_loc__3: wilayah.provinsi,
            prop_loc__2: wilayah.kabupaten,
            prop_loc__1: wilayah.kecamatan,
            prop_loc__0: wilayah.desa,
            prop__investasi: values.prop__investasi ?? '',
            prop__tenaga_kerja: values.prop__tenaga_kerja ?? '',
            prop__tenaga_kerja_asing: values.prop__tenaga_kerja_asing ?? '0',
            prop__desa_luas_ha: values.prop__desa_luas_ha ?? '',
            prop__desa_penduduk: values.prop__desa_penduduk ?? '',
            deskripsi_kegiatan: values.deskripsi_kegiatan ?? '',
            manfaat_kegiatan: values.manfaat_kegiatan ?? '',
            tujuan_kegiatan: values.tujuan_kegiatan ?? '',
            instalasi_bangunan: values.instalasi_bangunan ?? '',
            kegiatan_status: values.kegiatan_status ?? '',
            batas_utara: values.batas_utara ?? '',
            batas_timur: values.batas_timur ?? '',
            batas_selatan: values.batas_selatan ?? '',
            batas_barat: values.batas_barat ?? '',
            deskripsi_pemanfaatan_sekitar:
                values.deskripsi_pemanfaatan_sekitar ?? '',
            mata_pencaharian: values.mata_pencaharian ?? '',
            sumber_data_sosek: values.sumber_data_sosek ?? '',
            tahun_data_sosek: values.tahun_data_sosek ?? '',
            aksesibilitas_lokasi: values.aksesibilitas_lokasi ?? '',
            sumber_peta: values.sumber_peta ?? '',
            mangrove_ada: mangroveAda,
            prop__mangrove_persen: values.prop__mangrove_persen ?? '',
            prop__mangrove_kondisi: values.prop__mangrove_kondisi ?? '',
            lamun_ada_manual: lamunAda,
            lamun_persen: values.lamun_persen ?? '',
            lamun_kondisi: values.lamun_kondisi ?? '',
            karang_ada: karangAda,
            karang_persen_manual: values.karang_persen_manual ?? '',
            karang_kondisi: values.karang_kondisi ?? '',
        };
        Object.entries(textFields).forEach(([k, v]) => fd.append(k, v));

        mangroveSpecies.forEach((s) =>
            fd.append('prop__mangrove_spesies[]', s),
        );
        fd.append('prop__mangrove_spesies_lainnya', mangroveLainnya);
        lamunSpecies.forEach((s) => fd.append('lamun_spesies[]', s));
        fd.append('lamun_spesies_lainnya', lamunLainnya);
        karangSpecies.forEach((s) => fd.append('karang_spesies[]', s));
        fd.append('karang_spesies_lainnya', karangLainnya);

        instalasiPosisi.forEach((v) => fd.append('instalasi_posisi[]', v));

        fd.append('non_reklamasi', nonReklamasi ? '1' : '0');
        fd.append('reklamasi', reklamasi ? '1' : '0');
        fd.append('kegiatan_berusaha', kegiatanBerusaha ? '1' : '0');
        fd.append('non_berusaha', nonBerusaha ? '1' : '0');
        fd.append('strategis', strategis ? '1' : '0');
        fd.append('non_strategis', nonStrategis ? '1' : '0');

        fd.append('jadwal_table_json', JSON.stringify(jadwalRows));
        fd.append(
            'koordinat_table_json',
            JSON.stringify({ columns: ['Keterangan'], rows: koordinatRows }),
        );

        Object.entries(dukung).forEach(([key, d]) => {
            fd.append(`dukung_${key}`, d.checked ? '1' : '0');
            fd.append(`dukung_${key}_drive`, d.drive);
        });
        customDukungRows.forEach((row) => {
            fd.append('dukung_custom_nama[]', row.nama);
            fd.append('dukung_custom_drive[]', row.drive);
        });

        Object.entries(images).forEach(([field, files]) => {
            files.forEach((f) => fd.append(`${field}[]`, f));
        });

        return fd;
    };

    const submit = (action: string, e?: FormEvent) => {
        e?.preventDefault();
        setProcessing(true);
        router.post(action, buildFormData(), {
            forceFormData: true,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Isi Formulir Draft Proposal — e-GeRAI KKPRL" />
            <div className="bg-[#eef3f8] text-[#1c2b3a]">
                <section
                    className="relative -mx-6 -mt-20 overflow-hidden px-8 pt-24 pb-9 lg:-mx-8"
                    style={{
                        background:
                            'linear-gradient(135deg,#eaf2fb 0%,#cfe1f6 55%,#a9cdec 100%)',
                    }}
                >
                    <div
                        className="pointer-events-none absolute -top-16 -right-16 h-[260px] w-[260px] rounded-full"
                        style={{
                            background:
                                'radial-gradient(circle, rgba(30,99,199,.16), transparent 70%)',
                        }}
                    />
                    <div className="relative mx-auto max-w-[1400px]">
                        <a
                            href="/egerai"
                            className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#1E63C7] hover:text-[#123A63]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke
                            e-GeRAI
                        </a>
                        <div className="flex flex-wrap items-center gap-3.5">
                            <div>
                                <h1 className="text-2xl font-extrabold text-[#123A63]">
                                    Isi Formulir Draft Proposal PKKPRL
                                </h1>
                                <p className="mt-1 max-w-[640px] text-[13.5px] leading-relaxed text-[#33495e]">
                                    Belum punya file Draft Proposal PKKPRL siap
                                    pakai? Isi data di bawah ini secara manual,
                                    lalu unggah Laporan Kondisi Eksisting /
                                    Hidro-Oseanografi (PDF). Sistem akan
                                    menggabungkan otomatis menjadi 1 dokumen
                                    Word final — sama seperti alur unggah 2
                                    PDF.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-[1400px] px-8 pt-6 pb-10">
                    <form onSubmit={(e) => submit('/proposal-manual', e)}>
                        <div className="mb-[18px] rounded-2xl bg-white p-6 shadow-[0_6px_24px_rgba(18,58,99,0.08)]">
                            <h3 className="mb-3.5 text-[14.5px] font-extrabold text-[#123A63]">
                                <SectionTitle
                                    icon={Waves}
                                    iconClassName="bg-[#e0f2fe] text-[#0891b2]"
                                >
                                    Laporan Kondisi Eksisting /
                                    Hidro-Oseanografi (PDF/Word) — Opsional
                                </SectionTitle>
                            </h3>
                            <p className={fieldHintClass}>
                                Belum punya dokumennya? Peroleh data Hidro-Oseanografi melalui portal <a href="https://fadly2002-gerai-pelayanan-bprl.hf.space/" target="_blank" className=
                                "text-[#1E63C7] hover:underline">
                                    Gerai Pelayanan Balai Penataan Ruang Laut Makassar</a>, unduh hasilnya (PDF atau Word), lalu unggah di bawah ini. Belum sempat siap? Boleh dikosongkan dulu — pakai tombol "Unduh Draft" di bawah untuk mengunduh draft Proposal saja terlebih dulu, lengkapi Laporannya nanti.
                            </p>
                            <label
                                className={
                                    'mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-7 text-center transition-colors ' +
                                    (laporanFile
                                        ? 'border-[#1E63C7] bg-[#eaf3fd]'
                                        : 'border-[#cfe0f5] bg-[#f7fafd] hover:border-[#aac6e8] hover:bg-[#eef5fc]')
                                }
                            >
                                <input
                                    type="file"
                                    accept="application/pdf,.docx"
                                    onChange={(e) =>
                                        setLaporanFile(
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="hidden"
                                />
                                <span
                                    className={
                                        'flex h-10 w-10 items-center justify-center rounded-full ' +
                                        (laporanFile
                                            ? 'bg-[#1E63C7] text-white'
                                            : 'bg-white text-[#1E63C7] shadow-[0_2px_8px_rgba(18,58,99,0.12)]')
                                    }
                                >
                                    <UploadCloud className="h-5 w-5" />
                                </span>
                                {laporanFile ? (
                                    <div>
                                        <div className="text-[13.5px] font-bold text-[#123A63]">
                                            {laporanFile.name}
                                        </div>
                                        <div className="mt-0.5 text-[11px] text-[#5b6b7c]">
                                            Klik untuk mengganti file
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-[13.5px] font-bold text-[#123A63]">
                                            Klik untuk pilih file, atau seret
                                            ke sini
                                        </div>
                                        <div className="mt-0.5 text-[11px] text-[#5b6b7c]">
                                            PDF atau .docx
                                        </div>
                                    </div>
                                )}
                            </label>
                            {errors.laporan && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.laporan}
                                </p>
                            )}
                        </div>

                        <div className="mb-[18px] flex flex-wrap items-center gap-2.5 rounded-2xl border border-[#e7eef6] bg-white/95 p-3 shadow-[0_8px_24px_rgba(18,58,99,0.10)] backdrop-blur-sm">
                            <div className="flex items-center justify-center w-full gap-2.5">
                                <button
                                    type="button"
                                    className={draftButtonClass}
                                    onClick={() => {
                                        setValues((prev) => ({
                                            ...prev,
                                            prop__Nama_Pemohon:
                                                'Andi Wijaya, S.T., M.M.',
                                            prop__Jabatan_Pemohon: 'Direktur Utama',
                                            prop__Nama_Perusahaan_Instansi:
                                                'PT. Bahari Sejahtera Makassar',
                                            prop__NIB: '1234567890123',
                                            prop__NPWP: '01.234.567.8-901.000',
                                            prop__Nomor_Telepon_Selular:
                                                '081234567890',
                                            prop__Surat_Elektronik:
                                                'pemohon@baharisejahtera.co.id',
                                            prop__Jenis_Kegiatan:
                                                'Pemanfaatan Air Laut untuk Budi Daya',
                                            prop__Nama_Perairan: 'Laut Banda',
                                            prop__Luas_Kebutuhan_Ruang: '2.5',
                                            prop__KBLI:
                                                '03211 - Pembudidayaan Ikan Bersirip (Selain Ikan Hias) dan Biota Air Laut Lainnya yang Tidak Dilindungi',
                                            prop__Tanggal_Penyusunan:
                                                '2026-08-18',
                                            prop__investasi: '500000000',
                                            prop__tenaga_kerja: '10',
                                            prop__tenaga_kerja_asing: '0',
                                            prop__desa_luas_ha: '150',
                                            prop__desa_penduduk: '2500',
                                            deskripsi_kegiatan:
                                                'Kegiatan usaha yang diusulkan adalah pembesaran biota laut budidaya, melalui pengoperasian keramba jaring apung (KJA) sebagai sarana penampungan dan pemeliharaan sementara ikan hidup sebelum dipasarkan.',
                                            manfaat_kegiatan:
                                                'Meningkatkan taraf hidup masyarakat pesisir dan mendorong perekonomian daerah melalui pemanfaatan ruang laut yang optimal.',
                                            tujuan_kegiatan:
                                                'Pembangunan sarana dan prasarana pendukung budidaya air laut berupa keramba jaring apung beserta fasilitas penunjangnya.',
                                            instalasi_bangunan:
                                                'Saluran Inlet dan Outlet',
                                            kegiatan_status: 'Rencana',
                                            batas_utara: 'Perairan laut lepas',
                                            batas_timur: 'Daratan desa pesisir',
                                            batas_selatan:
                                                'Kawasan budidaya nelayan',
                                            batas_barat: 'Perairan terbuka',
                                            deskripsi_pemanfaatan_sekitar:
                                                'Selain keempat arah tersebut, tidak terdapat pemanfaatan ruang laut lain yang berpotensi menimbulkan konflik dengan rencana kegiatan yang dimohonkan.',
                                            mata_pencaharian:
                                                'Mata pencaharian utama masyarakat desa adalah nelayan dan pembudidaya, didukung oleh potensi perairan yang memiliki sumber daya ikan, biota laut, padang lamun, mangrove, dan terumbu karang.',
                                            sumber_data_sosek: 'BPS Kabupaten',
                                            tahun_data_sosek: '2025',
                                            aksesibilitas_lokasi:
                                                'Dapat diakses melalui jalan darat utama dan dilanjutkan dengan perahu motor menuju lokasi kegiatan.',
                                            sumber_peta:
                                                'Citra Satelit Google Earth & Survei Lapangan',
                                            mangrove_ada:
                                                'Terdapat ekosistem mangrove',
                                            prop__mangrove_persen: '65',
                                            prop__mangrove_kondisi: 'Sedang',
                                            lamun_ada_manual:
                                                'Terdapat ekosistem lamun',
                                            lamun_persen: '70',
                                            lamun_kondisi: 'Baik (Kaya/Sehat)',
                                            karang_ada:
                                                'Terdapat ekosistem terumbu karang',
                                            karang_persen_manual: '80',
                                            karang_kondisi: 'Baik Sekali',
                                        }));
                                        setWilayah({
                                            provinsi: 'SULAWESI SELATAN',
                                            kabupaten: 'KOTA MAKASSAR',
                                            kecamatan: 'TAMALANREA',
                                            desa: 'BUNTUSU',
                                        });
                                        setNonReklamasi(true);
                                        setReklamasi(false);
                                        setKegiatanBerusaha(true);
                                        setNonBerusaha(false);
                                        setStrategis(false);
                                        setNonStrategis(true);
                                        setInstalasiPosisi([
                                            'Kolom Laut',
                                            'Dasar Laut',
                                        ]);
                                        setMangroveSpecies([
                                            'Rhizophora apiculata',
                                        ]);
                                        setLamunSpecies(['Enhalus acoroides']);
                                        setKarangSpecies(['Acropora hyacinthus']);
                                        setJadwalRows(EXAMPLE_JADWAL);
                                        setKoordinatRows(EXAMPLE_KOORDINAT);
                                        setDukung((prev) => {
                                            const next = { ...prev };
                                            DUKUNG_ITEMS.forEach((item) => {
                                                next[item.key] = {
                                                    ...next[item.key],
                                                    checked: true,
                                                    drive: 'https://drive.google.com/drive/folders/contoh-dokumen-pendukung',
                                                };
                                            });

                                            return next;
                                        });
                                    }}
                                >
                                    Isi Contoh Data
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={primaryButtonClass}
                                >
                                    Proses &amp; Lanjut ke Tinjau Data
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={draftButtonClass}
                                >
                                    Simpan
                                </button>
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() =>
                                        submit('/proposal-manual/draft')
                                    }
                                    className={draftButtonClass}
                                >
                                    Unduh Draft
                                </button>
                            </div>
                            <div className="mt-2.5 flex w-full items-start gap-3 rounded-xl bg-[#f7fafd] p-3 text-[13px] text-[#33495e]">
                                <span>
                                    <span className="font-bold text-[#123A63]">
                                        Narasi ekosistem dibuat otomatis oleh AI
                                    </span>
                                    <br />
                                    Narasi detail ekosistem mangrove/lamun/
                                    karang beserta sumbernya dibuat AI
                                    berdasarkan data yang sudah ada (tidak
                                    mengarang data). Data gelombang/arus/
                                    pasang surut/batimetri lainnya tidak diisi
                                    otomatis oleh AI — kolom yang kosong perlu
                                    dilengkapi manual.
                                </span>
                            </div>
                        </div>

                        <div className="mb-[18px] rounded-2xl border border-[#e7eef6] bg-white p-6 shadow-[0_8px_26px_rgba(18,58,99,0.10)]">
                            <h3 className="mb-3.5 text-[14.5px] font-extrabold text-[#123A63]">
                                <SectionTitle
                                    icon={FileCheck2}
                                    iconClassName="bg-[#eaf1fc] text-[#1E63C7]"
                                >
                                    Jenis Permohonan KKPRL
                                </SectionTitle>
                            </h3>
                            <p className={fieldHintClass}>
                                <b>Persetujuan KKPRL</b> umumnya untuk Pelaku
                                Usaha (kegiatan Berusaha).{' '}
                                <b>Konfirmasi KKPRL</b> umumnya untuk Pemerintah
                                Pusat/Daerah dengan kegiatan Non Berusaha yang
                                bersifat Strategis Nasional.
                            </p>
                            <div className="mt-3.5 flex flex-wrap gap-3.5">
                                {(['Persetujuan', 'Konfirmasi'] as const).map(
                                    (opt) => (
                                        <label
                                            key={opt}
                                            className={
                                                'relative flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-colors ' +
                                                (jenisPermohonan === opt
                                                    ? 'border-[#1E63C7] bg-[#eaf3fd] shadow-[0_4px_14px_rgba(47,127,224,0.18)]'
                                                    : 'border-[#d7e2ee] bg-[#fafcfe] hover:border-[#aac6e8]')
                                            }
                                        >
                                            <input
                                                type="radio"
                                                className="hidden"
                                                checked={
                                                    jenisPermohonan === opt
                                                }
                                                onChange={() => {
                                                    setJenisPermohonan(opt);

                                                    if (
                                                        opt === 'Konfirmasi' &&
                                                        !nonBerusaha
                                                    ) {
                                                        setNonBerusaha(true);
                                                        setKegiatanBerusaha(
                                                            false,
                                                        );
                                                    }
                                                }}
                                            />
                                            <SectionIcon
                                                icon={
                                                    opt === 'Persetujuan'
                                                        ? CheckCircle2
                                                        : FileCheck2
                                                }
                                                className={
                                                    jenisPermohonan === opt
                                                        ? 'bg-[#1E63C7] text-white'
                                                        : opt === 'Persetujuan'
                                                            ? 'bg-[#eaf1fc] text-[#1E63C7]'
                                                            : 'bg-[#fef3c7] text-[#d97706]'
                                                }
                                            />
                                            <div>
                                                <div className="text-[14.5px] font-extrabold text-[#123A63]">
                                                    {opt === 'Persetujuan'
                                                        ? 'Persetujuan KKPRL'
                                                        : 'Konfirmasi KKPRL'}
                                                </div>
                                                <div className="text-[11.5px] text-[#5b6b7c]">
                                                    {opt === 'Persetujuan'
                                                        ? 'Untuk Pelaku Usaha (kegiatan Berusaha)'
                                                        : 'Untuk Pemerintah Pusat/Daerah, Non Berusaha'}
                                                </div>
                                            </div>
                                            {jenisPermohonan === opt && (
                                                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#1e9e5a] text-white shadow-[0_2px_6px_rgba(30,158,90,0.4)]">
                                                    <Check className="h-3 w-3" />
                                                </span>
                                            )}
                                        </label>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-[0_6px_24px_rgba(18,58,99,0.08)]">
                            <h3 className="mb-3.5 text-[14.5px] font-extrabold text-[#123A63]">
                                <SectionTitle
                                    icon={ClipboardList}
                                    iconClassName="bg-[#eaf1fc] text-[#123A63]"
                                >
                                    Data Draft Proposal PKKPRL
                                </SectionTitle>
                            </h3>

                            <details className={accordionItemClass} open>
                                <summary className={accordionSummaryClass}>
                                    <SectionTitle
                                        icon={UserRound}
                                        iconClassName="bg-[#eaf1fc] text-[#1E63C7]"
                                    >
                                        Identitas Pemohon
                                    </SectionTitle>
                                </summary>
                                <div className={accordionBodyClass}>
                                    <TextField
                                        name="prop__Nama_Pemohon"
                                        label="Nama Pemohon"
                                        hint="Mohon isi nama perwakilan perusahaan/instansi (Kepala) sebagai PIC yang bertanggung jawab dalam permohonan KKPRL."
                                        example="Andi Wijaya, S.T., M.M."
                                        value={values.prop__Nama_Pemohon ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="prop__Jabatan_Pemohon"
                                        label="Jabatan Pemohon"
                                        hint="Jabatan dari perwakilan perusahaan/instansi (Kepala) yang bertanggung jawab dalam permohonan KKPRL."
                                        example="Direktur Utama"
                                        value={
                                            values.prop__Jabatan_Pemohon ?? ''
                                        }
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="prop__Nama_Perusahaan_Instansi"
                                        label="Nama Perusahaan/Instansi"
                                        hint="Ditulis dengan benar, tanpa disingkat."
                                        example="PT. Bahari Sejahtera Makassar"
                                        value={
                                            values.prop__Nama_Perusahaan_Instansi ??
                                            ''
                                        }
                                        onChange={setValue}
                                    />
                                    <DigitsField
                                        name="prop__NIB"
                                        label="NIB"
                                        hint="Jika tidak ada, isi dengan tanda -"
                                        example="-"
                                        value={values.prop__NIB ?? ''}
                                        onChange={setValue}
                                    />
                                    <NpwpField
                                        name="prop__NPWP"
                                        label="NPWP"
                                        hint="NPWP milik perusahaan/Instansi, atau milik pemohon jika perseorangan."
                                        example="01.234.567.8-901.000"
                                        value={values.prop__NPWP ?? ''}
                                        onChange={setValue}
                                    />
                                    <DigitsField
                                        name="prop__Nomor_Telepon_Selular"
                                        label="Nomor Telepon Selular"
                                        example="081234567890"
                                        value={
                                            values.prop__Nomor_Telepon_Selular ??
                                            ''
                                        }
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="prop__Surat_Elektronik"
                                        label="Surat Elektronik"
                                        example="info@baharisejahteramks.co.id"
                                        value={
                                            values.prop__Surat_Elektronik ?? ''
                                        }
                                        onChange={setValue}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    <SectionTitle
                                        icon={MapPin}
                                        iconClassName="bg-[#e0f2fe] text-[#0284c7]"
                                    >
                                        Kegiatan &amp; Lokasi
                                    </SectionTitle>
                                </summary>
                                <div className={accordionBodyClass}>
                                    <SelectWithOther
                                        name="prop__Jenis_Kegiatan"
                                        label="Jenis Kegiatan"
                                        options={JENIS_KEGIATAN_OPTIONS}
                                        value={
                                            values.prop__Jenis_Kegiatan ?? ''
                                        }
                                        otherValue={
                                            otherValues.prop__Jenis_Kegiatan ??
                                            ''
                                        }
                                        onChange={setValue}
                                        onOtherChange={setOtherValue}
                                    />
                                    <SelectWithOther
                                        name="prop__Nama_Perairan"
                                        label="Nama Perairan"
                                        options={NAMA_PERAIRAN_OPTIONS}
                                        value={values.prop__Nama_Perairan ?? ''}
                                        otherValue={
                                            otherValues.prop__Nama_Perairan ??
                                            ''
                                        }
                                        onChange={setValue}
                                        onOtherChange={setOtherValue}
                                    />
                                    <DecimalField
                                        name="prop__Luas_Kebutuhan_Ruang"
                                        label="Luas Kebutuhan Ruang"
                                        hint="Isi berupa angka (dalam hektar)."
                                        example="0.59"
                                        value={
                                            values.prop__Luas_Kebutuhan_Ruang ??
                                            ''
                                        }
                                        onChange={setValue}
                                    />
                                    {!isKonfirmasi && (
                                        <SelectWithOther
                                            name="prop__KBLI"
                                            label="KBLI"
                                            options={KBLI_OPTIONS}
                                            value={values.prop__KBLI ?? ''}
                                            otherValue={
                                                otherValues.prop__KBLI ?? ''
                                            }
                                            onChange={setValue}
                                            onOtherChange={setOtherValue}
                                        />
                                    )}
                                    <TextField
                                        name="prop__Tanggal_Penyusunan"
                                        label="Tanggal Penyusunan"
                                        type="date"
                                        hint="Kosongkan untuk memakai tanggal hari ini secara otomatis."
                                        value={
                                            values.prop__Tanggal_Penyusunan ??
                                            todayIso
                                        }
                                        onChange={setValue}
                                    />
                                    <WilayahCascade
                                        value={wilayah}
                                        onChange={setWilayah}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    <SectionTitle
                                        icon={Banknote}
                                        iconClassName="bg-[#d1fae5] text-[#059669]"
                                    >
                                        Investasi &amp; Tenaga Kerja
                                    </SectionTitle>
                                </summary>
                                <div className={accordionBodyClass}>
                                    <MoneyField
                                        name="prop__investasi"
                                        label="Nilai Investasi (Rp, angka saja)"
                                        example="200000000"
                                        value={values.prop__investasi ?? ''}
                                        onChange={setValue}
                                    />
                                    <DigitsField
                                        name="prop__tenaga_kerja"
                                        label="Jumlah Tenaga Kerja WNI"
                                        example="15"
                                        value={values.prop__tenaga_kerja ?? ''}
                                        onChange={setValue}
                                    />
                                    <DigitsField
                                        name="prop__tenaga_kerja_asing"
                                        label="Jumlah Tenaga Kerja Asing"
                                        hint="Jika tidak ada, isi dengan 0."
                                        example="0"
                                        value={
                                            values.prop__tenaga_kerja_asing ??
                                            ''
                                        }
                                        onChange={setValue}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    <SectionTitle
                                        icon={Users}
                                        iconClassName="bg-[#ccfbf1] text-[#0d9488]"
                                    >
                                        Sosial Ekonomi
                                    </SectionTitle>
                                </summary>
                                <div className={accordionBodyClass}>
                                    <DecimalField
                                        name="prop__desa_luas_ha"
                                        label="Luas Desa (Ha)"
                                        example="250"
                                        value={values.prop__desa_luas_ha ?? ''}
                                        onChange={setValue}
                                    />
                                    <DecimalField
                                        name="prop__desa_penduduk"
                                        label="Jumlah Penduduk Desa (jiwa)"
                                        example="3400"
                                        value={values.prop__desa_penduduk ?? ''}
                                        onChange={setValue}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    <SectionTitle
                                        icon={FileText}
                                        iconClassName="bg-[#e0e7ff] text-[#4f46e5]"
                                    >
                                        Deskripsi Kegiatan
                                    </SectionTitle>
                                </summary>
                                <div className={accordionBodyClass}>
                                    <TextAreaField
                                        name="deskripsi_kegiatan"
                                        label="Deskripsi Kegiatan"
                                        example="Kegiatan usaha yang diusulkan adalah pembesaran biota laut budidaya, melalui pengoperasian keramba jaring apung (KJA) sebagai sarana penampungan dan pemeliharaan sementara ikan hidup sebelum dipasarkan. Biota Laut memiliki nilai ekonomi tinggi dengan peluang pasar yang masih terbuka, sehingga kegiatan ini berpotensi memberikan nilai tambah hasil perikanan serta menjadi alternatif diversifikasi usaha bagi nelayan setempat. Pelaksanaan kegiatan diharapkan dapat meningkatkan pendapatan dan kesejahteraan masyarakat pesisir serta mengurangi ketergantungan terhadap jenis ikan lainnya."
                                        value={values.deskripsi_kegiatan ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextAreaField
                                        name="manfaat_kegiatan"
                                        label="Manfaat Kegiatan"
                                        example="Kegiatan pembangunan dan operasional fasilitas budidaya udang vannamei bertujuan untuk mendukung peningkatan produksi perikanan budidaya secara berkelanjutan melalui pemanfaatan ruang laut yang optimal dan sesuai dengan ketentuan yang berlaku. Selain memberikan nilai tambah bagi sektor perikanan, kegiatan ini juga diharapkan dapat mendorong pertumbuhan ekonomi daerah, membuka peluang kerja bagi masyarakat sekitar, serta mendukung penerapan budidaya yang produktif dan berwawasan lingkungan."
                                        value={values.manfaat_kegiatan ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextAreaField
                                        name="tujuan_kegiatan"
                                        label="Tujuan Kegiatan"
                                        example="Tujuan pemanfaatan ruang laut yang diajukan adalah untuk pembangunan fasilitas pemanfaatan air laut bagi kegiatan budidaya, yang berfungsi sebagai sarana penunjang usaha pembudidayaan ikan bersirip (selain ikan hias) serta biota air payau lainnya yang tidak dilindungi. Kegiatan utama perusahaan adalah budidaya udang vannamei. Dalam mendukung pelaksanaan kegiatan utama tersebut, direncanakan pembangunan fasilitas pendukung yang meliputi Instalasi Pengolahan Air Limbah (IPAL), instalasi penyediaan air bersih, dan instalasi kelistrikan."
                                        value={values.tujuan_kegiatan ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="instalasi_bangunan"
                                        label="Instalasi Bangunan Menetap Di Laut"
                                        hint="Contoh: Saluran Inlet atau Outlet"
                                        example="Saluran Inlet dan Outlet"
                                        value={values.instalasi_bangunan ?? ''}
                                        onChange={setValue}
                                    />

                                    <div className="mb-3">
                                        <label className={fieldLabelClass}>
                                            Instalasi Bangunan Laut Berada Pada
                                        </label>
                                        {[
                                            'Permukaan Laut',
                                            'Kolom Laut',
                                            'Dasar Laut',
                                        ].map((v) => (
                                            <div
                                                key={v}
                                                className={checkboxRowClass}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={instalasiPosisi.includes(
                                                        v,
                                                    )}
                                                    onChange={() =>
                                                        toggleInstalasiPosisi(v)
                                                    }
                                                    className="h-[18px] w-[18px] shrink-0 accent-[#1E63C7]"
                                                />
                                                <label>{v}</label>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mb-3">
                                        <label className={fieldLabelClass}>
                                            Deskripsi Jadwal Kegiatan
                                        </label>
                                        <div className={fieldHintClass}>
                                            Isi tiap kegiatan sebagai satu
                                            baris: nama, tahun &amp; bulan
                                            mulai, tahun &amp; bulan selesai.
                                            Bisa lebih dari 1 tahun.
                                        </div>
                                        <JadwalTable
                                            value={jadwalRows}
                                            onChange={setJadwalRows}
                                        />
                                    </div>

                                    <DukungDocuments
                                        value={dukung}
                                        onChange={setDukung}
                                        customRows={customDukungRows}
                                        onCustomRowsChange={setCustomDukungRows}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    <SectionTitle
                                        icon={ClipboardCheck}
                                        iconClassName="bg-[#fef3c7] text-[#d97706]"
                                    >
                                        Status Kegiatan
                                    </SectionTitle>
                                </summary>
                                <div className={accordionBodyClass}>
                                    <div className="mb-3">
                                        <label className={fieldLabelClass}>
                                            Kegiatan Eksisting/Rencana
                                        </label>
                                        <select
                                            value={values.kegiatan_status ?? ''}
                                            onChange={(e) =>
                                                setValue(
                                                    'kegiatan_status',
                                                    e.target.value,
                                                )
                                            }
                                            className={fieldInputClass}
                                        >
                                            <option value="">
                                                -- Pilih --
                                            </option>
                                            <option value="Eksisting">
                                                Eksisting
                                            </option>
                                            <option value="Rencana">
                                                Rencana
                                            </option>
                                            <option value="Eksisting dan Pengembangan">
                                                Eksisting dan Pengembangan
                                            </option>
                                        </select>
                                    </div>
                                    <div className={checkboxRowClass}>
                                        <input
                                            type="checkbox"
                                            checked={nonReklamasi}
                                            onChange={(e) => {
                                                setNonReklamasi(
                                                    e.target.checked,
                                                );

                                                if (e.target.checked) {
                                                    setReklamasi(false);
                                                }
                                            }}
                                            className="h-[18px] w-[18px] accent-[#1E63C7]"
                                        />
                                        <label>Kegiatan Tanpa Reklamasi</label>
                                    </div>
                                    <div className={checkboxRowClass}>
                                        <input
                                            type="checkbox"
                                            checked={reklamasi}
                                            onChange={(e) => {
                                                setReklamasi(e.target.checked);

                                                if (e.target.checked) {
                                                    setNonReklamasi(false);
                                                }
                                            }}
                                            className="h-[18px] w-[18px] accent-[#1E63C7]"
                                        />
                                        <label>Kegiatan Reklamasi</label>
                                    </div>
                                    {!isKonfirmasi && (
                                        <div className={checkboxRowClass}>
                                            <input
                                                type="checkbox"
                                                checked={kegiatanBerusaha}
                                                onChange={(e) => {
                                                    setKegiatanBerusaha(
                                                        e.target.checked,
                                                    );

                                                    if (e.target.checked) {
                                                        setNonBerusaha(false);
                                                    }
                                                }}
                                                className="h-[18px] w-[18px] accent-[#1E63C7]"
                                            />
                                            <label>
                                                Termasuk Kegiatan Berusaha
                                            </label>
                                        </div>
                                    )}
                                    <div className={checkboxRowClass}>
                                        <input
                                            type="checkbox"
                                            checked={nonBerusaha}
                                            onChange={(e) => {
                                                setNonBerusaha(
                                                    e.target.checked,
                                                );

                                                if (e.target.checked) {
                                                    setKegiatanBerusaha(false);
                                                }
                                            }}
                                            className="h-[18px] w-[18px] accent-[#1E63C7]"
                                        />
                                        <label>Kegiatan Non Berusaha</label>
                                    </div>
                                    <div className={checkboxRowClass}>
                                        <input
                                            type="checkbox"
                                            checked={strategis}
                                            onChange={(e) => {
                                                setStrategis(e.target.checked);

                                                if (e.target.checked) {
                                                    setNonStrategis(false);
                                                }
                                            }}
                                            className="h-[18px] w-[18px] accent-[#1E63C7]"
                                        />
                                        <label>
                                            Termasuk kegiatan strategis nasional
                                        </label>
                                    </div>
                                    <div className={checkboxRowClass}>
                                        <input
                                            type="checkbox"
                                            checked={nonStrategis}
                                            onChange={(e) => {
                                                setNonStrategis(
                                                    e.target.checked,
                                                );

                                                if (e.target.checked) {
                                                    setStrategis(false);
                                                }
                                            }}
                                            className="h-[18px] w-[18px] accent-[#1E63C7]"
                                        />
                                        <label>
                                            Termasuk kegiatan non-strategis
                                            nasional
                                        </label>
                                    </div>
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    <SectionTitle
                                        icon={Leaf}
                                        iconClassName="bg-[#dcfce7] text-[#16a34a]"
                                    >
                                        Data Ekosistem Tambahan
                                    </SectionTitle>
                                </summary>
                                <div className={accordionBodyClass}>
                                    <div className="mb-3">
                                        <label className={fieldLabelClass}>
                                            Keberadaan Ekosistem Mangrove
                                        </label>
                                        <select
                                            value={mangroveAda}
                                            onChange={(e) =>
                                                setValue(
                                                    'mangrove_ada',
                                                    e.target.value,
                                                )
                                            }
                                            className={fieldInputClass}
                                        >
                                            <option value="">
                                                -- Pilih --
                                            </option>
                                            <option value="Terdapat ekosistem mangrove">
                                                Terdapat ekosistem mangrove
                                            </option>
                                            <option value="Tidak terdapat ekosistem mangrove">
                                                Tidak terdapat ekosistem
                                                mangrove
                                            </option>
                                        </select>
                                    </div>
                                    <div
                                        className={
                                            mangroveLocked
                                                ? 'pointer-events-none border-l-2 border-[#e3e9f0] pl-4 opacity-50'
                                                : 'border-l-2 border-[#e3e9f0] pl-4'
                                        }
                                    >
                                        <div className="mb-3">
                                            <label className={fieldLabelClass}>
                                                Spesies Mangrove Dominan
                                            </label>
                                            <SpeciesPicker
                                                name="prop__mangrove_spesies"
                                                species={MANGROVE_SPECIES}
                                                disabled={mangroveLocked}
                                                selected={mangroveSpecies}
                                                onToggle={(sp) =>
                                                    setMangroveSpecies(
                                                        (prev) =>
                                                            prev.includes(sp)
                                                                ? prev.filter(
                                                                    (s) =>
                                                                        s !==
                                                                        sp,
                                                                )
                                                                : [...prev, sp],
                                                    )
                                                }
                                                lainnya={mangroveLainnya}
                                                onLainnyaChange={
                                                    setMangroveLainnya
                                                }
                                            />
                                        </div>
                                        <DecimalField
                                            name="prop__mangrove_persen"
                                            label="Persentase Tutupan Mangrove (%)"
                                            example="65"
                                            value={
                                                values.prop__mangrove_persen ??
                                                ''
                                            }
                                            onChange={(n, v) => {
                                                setValue(n, v);
                                                const p = parseFloat(v);

                                                if (!isNaN(p)) {
                                                    setValue(
                                                        'prop__mangrove_kondisi',
                                                        classifyCondition(
                                                            'mangrove',
                                                            p,
                                                        ),
                                                    );
                                                }
                                            }}
                                        />
                                        <div className="mb-3">
                                            <label className={fieldLabelClass}>
                                                Kondisi Tutupan Mangrove
                                            </label>
                                            <select
                                                value={
                                                    values.prop__mangrove_kondisi ??
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setValue(
                                                        'prop__mangrove_kondisi',
                                                        e.target.value,
                                                    )
                                                }
                                                className={fieldInputClass}
                                            >
                                                <option value="">
                                                    -- Pilih --
                                                </option>
                                                <option value="Sangat Padat">
                                                    Sangat Padat
                                                </option>
                                                <option value="Sedang">
                                                    Sedang
                                                </option>
                                                <option value="Jarang">
                                                    Jarang
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className={fieldLabelClass}>
                                            Keberadaan Ekosistem Lamun
                                        </label>
                                        <select
                                            value={lamunAda}
                                            onChange={(e) =>
                                                setValue(
                                                    'lamun_ada_manual',
                                                    e.target.value,
                                                )
                                            }
                                            className={fieldInputClass}
                                        >
                                            <option value="">
                                                -- Pilih --
                                            </option>
                                            <option value="Terdapat ekosistem lamun">
                                                Terdapat ekosistem lamun
                                            </option>
                                            <option value="Tidak terdapat ekosistem lamun">
                                                Tidak terdapat ekosistem lamun
                                            </option>
                                        </select>
                                    </div>
                                    <div
                                        className={
                                            lamunLocked
                                                ? 'pointer-events-none border-l-2 border-[#e3e9f0] pl-4 opacity-50'
                                                : 'border-l-2 border-[#e3e9f0] pl-4'
                                        }
                                    >
                                        <div className="mb-3">
                                            <label className={fieldLabelClass}>
                                                Spesies Lamun
                                            </label>
                                            <SpeciesPicker
                                                name="lamun_spesies"
                                                species={LAMUN_SPECIES}
                                                disabled={lamunLocked}
                                                selected={lamunSpecies}
                                                onToggle={(sp) =>
                                                    setLamunSpecies((prev) =>
                                                        prev.includes(sp)
                                                            ? prev.filter(
                                                                (s) =>
                                                                    s !== sp,
                                                            )
                                                            : [...prev, sp],
                                                    )
                                                }
                                                lainnya={lamunLainnya}
                                                onLainnyaChange={
                                                    setLamunLainnya
                                                }
                                            />
                                        </div>
                                        <DecimalField
                                            name="lamun_persen"
                                            label="Persentase Tutupan Lamun"
                                            example="70"
                                            value={values.lamun_persen ?? ''}
                                            onChange={(n, v) => {
                                                setValue(n, v);
                                                const p = parseFloat(v);

                                                if (!isNaN(p)) {
                                                    setValue(
                                                        'lamun_kondisi',
                                                        classifyCondition(
                                                            'lamun',
                                                            p,
                                                        ),
                                                    );
                                                }
                                            }}
                                        />
                                        <div className="mb-3">
                                            <label className={fieldLabelClass}>
                                                Kondisi Lamun
                                            </label>
                                            <select
                                                value={
                                                    values.lamun_kondisi ?? ''
                                                }
                                                onChange={(e) =>
                                                    setValue(
                                                        'lamun_kondisi',
                                                        e.target.value,
                                                    )
                                                }
                                                className={fieldInputClass}
                                            >
                                                <option value="">
                                                    -- Pilih --
                                                </option>
                                                <option value="Baik (Kaya/Sehat)">
                                                    Baik (Kaya/Sehat)
                                                </option>
                                                <option value="Rusak (Kurang Kaya/Kurang Sehat)">
                                                    Rusak (Kurang Kaya/Kurang
                                                    Sehat)
                                                </option>
                                                <option value="Rusak (Miskin)">
                                                    Rusak (Miskin)
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className={fieldLabelClass}>
                                            Keberadaan Ekosistem Terumbu Karang
                                        </label>
                                        <select
                                            value={karangAda}
                                            onChange={(e) =>
                                                setValue(
                                                    'karang_ada',
                                                    e.target.value,
                                                )
                                            }
                                            className={fieldInputClass}
                                        >
                                            <option value="">
                                                -- Pilih --
                                            </option>
                                            <option value="Terdapat ekosistem terumbu karang">
                                                Terdapat ekosistem terumbu
                                                karang
                                            </option>
                                            <option value="Tidak terdapat ekosistem terumbu karang">
                                                Tidak terdapat ekosistem terumbu
                                                karang
                                            </option>
                                        </select>
                                    </div>
                                    <div
                                        className={
                                            karangLocked
                                                ? 'pointer-events-none border-l-2 border-[#e3e9f0] pl-4 opacity-50'
                                                : 'border-l-2 border-[#e3e9f0] pl-4'
                                        }
                                    >
                                        <div className="mb-3">
                                            <label className={fieldLabelClass}>
                                                Spesies Terumbu Karang
                                            </label>
                                            <SpeciesPicker
                                                name="karang_spesies"
                                                species={KARANG_SPECIES}
                                                disabled={karangLocked}
                                                selected={karangSpecies}
                                                onToggle={(sp) =>
                                                    setKarangSpecies((prev) =>
                                                        prev.includes(sp)
                                                            ? prev.filter(
                                                                (s) =>
                                                                    s !== sp,
                                                            )
                                                            : [...prev, sp],
                                                    )
                                                }
                                                lainnya={karangLainnya}
                                                onLainnyaChange={
                                                    setKarangLainnya
                                                }
                                            />
                                        </div>
                                        <DecimalField
                                            name="karang_persen_manual"
                                            label="Persentase Tutupan Terumbu Karang"
                                            example="80"
                                            value={
                                                values.karang_persen_manual ??
                                                ''
                                            }
                                            onChange={(n, v) => {
                                                setValue(n, v);
                                                const p = parseFloat(v);

                                                if (!isNaN(p)) {
                                                    setValue(
                                                        'karang_kondisi',
                                                        classifyCondition(
                                                            'karang',
                                                            p,
                                                        ),
                                                    );
                                                }
                                            }}
                                        />
                                        <div className="mb-3">
                                            <label className={fieldLabelClass}>
                                                Kondisi Terumbu Karang
                                            </label>
                                            <select
                                                value={
                                                    values.karang_kondisi ?? ''
                                                }
                                                onChange={(e) =>
                                                    setValue(
                                                        'karang_kondisi',
                                                        e.target.value,
                                                    )
                                                }
                                                className={fieldInputClass}
                                            >
                                                <option value="">
                                                    -- Pilih --
                                                </option>
                                                <option value="Baik Sekali">
                                                    Baik Sekali
                                                </option>
                                                <option value="Baik">
                                                    Baik
                                                </option>
                                                <option value="Sedang">
                                                    Sedang
                                                </option>
                                                <option value="Buruk">
                                                    Buruk
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    <SectionTitle
                                        icon={Compass}
                                        iconClassName="bg-[#cffafe] text-[#0891b2]"
                                    >
                                        Pemanfaatan Ruang Laut Sekitar
                                        (Opsional)
                                    </SectionTitle>
                                </summary>
                                <div className={accordionBodyClass}>
                                    <TextField
                                        name="batas_utara"
                                        label="Sebelah Utara"
                                        example="area penangkapan ikan skala kecil dan kawasan pemukiman nelayan berjarak sekitar 1 km"
                                        value={values.batas_utara ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="batas_timur"
                                        label="Sebelah Timur"
                                        example="area penangkapan ikan skala kecil dan kawasan pelabuhan lokal berjarak sekitar 1.2 km"
                                        value={values.batas_timur ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="batas_selatan"
                                        label="Sebelah Selatan"
                                        example="area penangkapan ikan skala kecil serta koridor kabel/pipa bawah laut berjarak sekitar 1.4 km"
                                        value={values.batas_selatan ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="batas_barat"
                                        label="Sebelah Barat"
                                        example="area penangkapan ikan skala kecil serta kegiatan Keramba Jaring Apung (KJA) berjarak sekitar 1.1 km"
                                        value={values.batas_barat ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextAreaField
                                        name="deskripsi_pemanfaatan_sekitar"
                                        label="Deskripsi Tambahan (Opsional)"
                                        rows={3}
                                        hint="Kalau ada info tambahan di luar 4 arah mata angin di atas, isi di sini — akan ditambahkan setelah kalimat otomatis."
                                        example="Selain keempat arah tersebut, tidak terdapat pemanfaatan ruang laut lain yang berpotensi menimbulkan konflik dengan rencana kegiatan yang dimohonkan."
                                        value={
                                            values.deskripsi_pemanfaatan_sekitar ??
                                            ''
                                        }
                                        onChange={setValue}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    <SectionTitle
                                        icon={Route}
                                        iconClassName="bg-[#ede9fe] text-[#7c3aed]"
                                    >
                                        Sosial Ekonomi &amp; Aksesibilitas
                                        Lanjutan (Opsional)
                                    </SectionTitle>
                                </summary>
                                <div className={accordionBodyClass}>
                                    <TextAreaField
                                        name="mata_pencaharian"
                                        label="Mata Pencaharian Masyarakat Desa"
                                        example="Mata pencaharian masyarakat desa didominasi oleh aktivitas yang berkaitan dengan karakter pesisir. Nelayan menjadi salah satu pekerjaan utama, didukung oleh potensi perairan yang memiliki sumber daya ikan, biota laut, padang lamun, mangrove, dan terumbu karang."
                                        value={values.mata_pencaharian ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextField
                                        name="sumber_data_sosek"
                                        label="Sumber Data Sosek"
                                        example="Badan Pusat Statistik"
                                        value={values.sumber_data_sosek ?? ''}
                                        onChange={setValue}
                                    />
                                    <DigitsField
                                        name="tahun_data_sosek"
                                        label="Tahun Data Sosek"
                                        example="2025"
                                        value={values.tahun_data_sosek ?? ''}
                                        onChange={setValue}
                                    />
                                    <TextAreaField
                                        name="aksesibilitas_lokasi"
                                        label="Aksesibilitas Lokasi"
                                        hint="Deskripsi aksesibilitas dari titik poin lokasi yang mudah dikenali ke lokasi area yang dimohonkan, termasuk jarak dan waktu tempuh."
                                        example="Aksesibilitas menuju Desa Tapulaga, Kecamatan Soropia, Kabupaten Konawe, dari Bandara Haluoleo Kendari dapat ditempuh melalui jalur darat. Titik awal perjalanan adalah Bandara Haluoleo yang berada di Desa Ambaipua, Kecamatan Ranomeeto, Kabupaten Konawe Selatan, dengan akses utama melalui Jalan Wolter Monginsidi/poros bandara menuju Kota Kendari."
                                        value={
                                            values.aksesibilitas_lokasi ?? ''
                                        }
                                        onChange={setValue}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    <SectionTitle
                                        icon={MapPinned}
                                        iconClassName="bg-[#ffe4e6] text-[#e11d48]"
                                    >
                                        Titik Koordinat Batas Area (Opsional)
                                    </SectionTitle>
                                </summary>
                                <div className={accordionBodyClass}>
                                    <KoordinatTable
                                        value={koordinatRows}
                                        onChange={setKoordinatRows}
                                    />
                                </div>
                            </details>

                            <details className={accordionItemClass}>
                                <summary className={accordionSummaryClass}>
                                    <SectionTitle
                                        icon={ImageIcon}
                                        iconClassName="bg-[#fce7f3] text-[#db2777]"
                                    >
                                        Lampiran Gambar (Opsional)
                                    </SectionTitle>
                                </summary>
                                <div className={accordionBodyClass}>
                                    <ImageField
                                        name="img_siteplan"
                                        label="Gambaran Rencana Tapak Site"
                                        optionalNote="(bisa lebih dari 1)"
                                        hint="Unggah gambaran rencana tapak site dari kegiatan yang dimohonkan."
                                        images={images.img_siteplan ?? []}
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_peta_lokasi"
                                        label="Peta Lokasi"
                                        hint="Citra satelit dengan poligon batas area permohonan."
                                        images={images.img_peta_lokasi ?? []}
                                        onChange={setImageField}
                                    />
                                    <TextField
                                        name="sumber_peta"
                                        label="Sumber Peta"
                                        example="Layar Pinisi, Arcgis, Google Earth dll"
                                        value={values.sumber_peta ?? ''}
                                        onChange={setValue}
                                    />
                                    <ImageField
                                        name="img_foto_mangrove"
                                        label="Foto Kondisi Mangrove"
                                        images={images.img_foto_mangrove ?? []}
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_foto_karang_insitu"
                                        label="Foto Survei Terumbu Karang"
                                        images={
                                            images.img_foto_karang_insitu ?? []
                                        }
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_dok_kegiatan"
                                        label="Dokumentasi Kegiatan Eksisting/Rencana"
                                        images={images.img_dok_kegiatan ?? []}
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_dok_pemanfaatan_sekitar"
                                        label="Dokumentasi Pemanfaatan Ruang Laut Sekitar"
                                        optionalNote="(bisa lebih dari 1)"
                                        maxFiles={3}
                                        images={
                                            images.img_dok_pemanfaatan_sekitar ??
                                            []
                                        }
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_foto_lamun"
                                        label="Dokumentasi Ekosistem Lamun"
                                        images={images.img_foto_lamun ?? []}
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_aksesibilitas"
                                        label="Gambar Peta Aksesibilitas Menuju Lokasi"
                                        images={images.img_aksesibilitas ?? []}
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_sertifikat_lahan"
                                        label="Sertifikat Kepemilikan Lahan Darat"
                                        images={
                                            images.img_sertifikat_lahan ?? []
                                        }
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_dok_sosialisasi"
                                        label="Dokumen Hasil Sosialisasi"
                                        images={
                                            images.img_dok_sosialisasi ?? []
                                        }
                                        onChange={setImageField}
                                    />
                                    <ImageField
                                        name="img_dok_pendukung_lainnya"
                                        label="Dokumen Pendukung Lainnya"
                                        optionalNote="(bisa lebih dari 1)"
                                        images={
                                            images.img_dok_pendukung_lainnya ??
                                            []
                                        }
                                        onChange={setImageField}
                                    />
                                </div>
                            </details>
                        </div>
                    </form>

                    <a
                        href="/egerai"
                        className="mt-3.5 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#1E63C7]"
                    >
                        ← Kembali ke halaman utama (unggah 2 PDF)
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
