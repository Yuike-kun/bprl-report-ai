import HomeLayout from './layout';
import MainLayout from './backend/layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ArrowLeft,
    BookOpen,
    Check,
    ChevronLeft,
    ChevronRight,
    UserRound,
    FileText,
    CalendarDays,
    Clock,
    MapPin,
    Send,
    Loader2,
    CircleAlert,
    CheckCircle2,
    Sparkles,
    PenTool,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import swal from 'sweetalert';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import SignaturePad from '@/components/signature-pad';
import { ComboboxSearch } from '@/components/backend/combobox-searchable';
import { FileUpload } from '@/components/berita_acara_components/FileUpload';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type Location = { id: number; nama_lokasi: string };

type ChildScheduleSlot = {
    id: number;
    waktu: string;
    kuota_konsultasi: number;
    sisa_kuota: number;
};

type Schedule = {
    id: number;
    tanggal: string;
    waktu_awal: string;
    waktu_akhir: string;
    pelaksanaan: 'Luring' | 'Daring' | 'Hybrid';
    lokasi_konsultasi_id: number | null;
    lokasi_nama?: string | null;
    kuota_konsultasi: number;
    child_schedules: ChildScheduleSlot[];
};

type PageProps = {
    locations: Location[];
    schedules: Schedule[];
    provinsi: any[];
    flash?: { success?: string; document_url?: string };
    adminMode?: boolean;
};

const GUIDE_ITEMS = [
    {
        title: 'Data Pemohon',
        desc: 'Lengkapi identitas, kontak, dan tanda tangan digital pemohon.',
    },
    {
        title: 'Detail Kegiatan',
        desc: 'Jelaskan rencana kegiatan yang akan dikonsultasikan.',
    },
    {
        title: 'Jadwal Konsultasi',
        desc: 'Pilih lokasi, tanggal, dan slot waktu sesuai ketersediaan.',
    },
];

const formatTanggal = (tanggal: string) =>
    new Date(tanggal).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

/* ------------------------------------------------------------------ */
/*  Framer Motion Variants                                              */
/* ------------------------------------------------------------------ */
const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (custom: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            delay: custom * 0.1,
            ease: [0.25, 0.1, 0.25, 1] as const,
        },
    }),
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.94, y: 6 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 350, damping: 25 },
    },
};

/* ------------------------------------------------------------------ */
/*  Small helper components                                             */
/* ------------------------------------------------------------------ */
function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-500"
        >
            <CircleAlert className="h-3.5 w-3.5 shrink-0" />
            {message}
        </motion.p>
    );
}

function MinimalSectionHeader({
    icon: Icon,
    title,
    subtitle,
}: {
    icon: LucideIcon;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight">{title}</h2>
                <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */
export default function RequestForm() {
    const { locations, schedules, flash, adminMode = false } = usePage<PageProps>().props;
    const Layout: React.ComponentType<any> = adminMode ? MainLayout : HomeLayout;

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_pemohon: '',
        jabatan_pemohon: '',
        instansi: '',
        tanggal_konsultasi: '',
        child_schedule_id: '',
        pelaksanaan: 'Luring' as const,
        lokasi_konsultasi_id: '',
        rencana_kegiatan: '',
        kabupaten: '',
        provinsi: 73,
        nomor_telepon: '',
        email: '',
        permintaan_khusus: '',
        tanda_tangan: '',
        setuju_syarat_ketentuan: false,
        bahan_konsultasi: null,
    });

    const [attempted, setAttempted] = useState(false);
    const dateScrollerRef = useRef<HTMLDivElement>(null);

    /* ---------- Schedule logic (Luring only) ---------- */
    const activeSchedules = schedules.filter((s) =>
        s.pelaksanaan === 'Luring' && s.child_schedules.some((slot) => slot.sisa_kuota > 0),
    );

    const matchingSchedules = activeSchedules.filter(
        (s) => String(s.lokasi_konsultasi_id ?? '') === data.lokasi_konsultasi_id,
    );

    const dateCards = Array.from(new Set(matchingSchedules.map((s) => s.tanggal))).map((tanggal) => {
        const sisa = matchingSchedules
            .filter((s) => s.tanggal === tanggal)
            .reduce((sum, s) => sum + s.child_schedules.reduce((a, slot) => a + slot.sisa_kuota, 0), 0);
        return { tanggal, sisa };
    });

    const matchedSchedule = matchingSchedules.find(
        (s) => s.tanggal.slice(0, 10) === data.tanggal_konsultasi,
    );
    const timeSlots = matchedSchedule?.child_schedules ?? [];

    /* ---------- Validation ---------- */
    const required = (value: string | number | boolean | null | undefined) =>
        typeof value === 'boolean'
            ? value ? undefined : 'Wajib disetujui.'
            : typeof value === 'number'
                ? undefined
                : value?.trim() ? undefined : 'Wajib diisi.';

    const requiredFields: Array<keyof typeof data> = [
        'nama_pemohon',
        'instansi',
        'kabupaten',
        'nomor_telepon',
        'email',
        'tanda_tangan',
        'rencana_kegiatan',
        'lokasi_konsultasi_id',
        'tanggal_konsultasi',
        'child_schedule_id',
        'setuju_syarat_ketentuan',
    ];

    const fieldError = (field: keyof typeof data) =>
        errors[field] || (attempted ? required(data[field]) : undefined);

    const scrollDates = (dir: number) =>
        dateScrollerRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const hasMissing = requiredFields.some((f) => required(data[f]));
        if (hasMissing) { setAttempted(true); return; }
        post('/request-form', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: (page) => {
                reset();
                setAttempted(false);
                if (adminMode) return;
                const documentUrl = (page.props.flash as PageProps['flash'])?.document_url;
                if (documentUrl) {
                    swal({
                        title: 'Berhasil',
                        text: 'Permohonan konsultasi berhasil dikirim dan Surat Konfirmasi KKPRL berhasil dibuat dalam format PDF.',
                        icon: 'success',
                        buttons: { cancel: 'Tutup', download: { text: 'Download PDF', value: 'download' } } as any,
                    }).then((value) => { if (value === 'download') window.location.href = documentUrl; });
                } else {
                    swal('Berhasil', 'Permohonan berhasil dikirim, tetapi link PDF belum tersedia.', 'success');
                }
            },
        });
    };

    const inputClass = 'h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400 transition-all';
    const textareaClass = 'min-h-28 resize-none rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400 transition-all';

    return (
        <Layout pageTitle={adminMode ? 'Tambah Permohonan Konsultasi' : undefined}>
            <div className="mx-auto w-full max-w-4xl px-4 py-8">

                {/* ===== Page header ===== */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-8 flex items-center justify-between gap-4 border-b border-slate-100 pb-6"
                >
                    <div className="flex items-center gap-3">
                        <Link
                            href={adminMode ? '/master/permohonan-konsultasi' : '/'}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                            aria-label="Kembali"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                {adminMode ? 'Tambah Permohonan' : 'Ajukan Konsultasi'}
                                <Sparkles className="h-4 w-4 text-blue-500" />
                            </h1>
                            <p className="text-xs text-slate-500">
                                {adminMode
                                    ? 'Input permohonan langsung dari panel administrasi'
                                    : 'Konsultasikan rencana kegiatan pemanfaatan ruang laut Anda'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/signature-upload">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-blue-200 text-xs text-blue-600 bg-blue-50/50 shadow-xs hover:bg-blue-100 hover:border-blue-300 font-semibold gap-1.5"
                            >
                                <PenTool className="h-3.5 w-3.5 text-blue-600" />
                                Upload TTD Pemohon
                            </Button>
                        </Link>

                        <Dialog>
                            <DialogTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-slate-200 text-xs text-slate-600 shadow-xs hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-600"
                                    >
                                        <BookOpen className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                                        Panduan
                                    </Button>
                                }
                            />
                            <DialogContent className="rounded-2xl sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Panduan Konsultasi</DialogTitle>
                                    <DialogDescription>
                                        Ikuti langkah berikut untuk mengajukan permohonan konsultasi.
                                    </DialogDescription>
                                </DialogHeader>
                                <ol className="list-none space-y-3 text-sm text-slate-600">
                                    {GUIDE_ITEMS.map((item, index) => (
                                        <li key={item.title} className="flex gap-3">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-bold text-white shadow-xs">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium text-slate-900">{item.title}</p>
                                                <p className="text-xs text-slate-500">{item.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </DialogContent>
                        </Dialog>
                    </div>
                </motion.div>

                {/* Notification bar to quickly upload signature for existing requests */}
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-blue-200/80 bg-blue-50/60 p-4 text-xs text-blue-900 shadow-xs"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
                            <PenTool className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <p className="font-bold">Sudah Pernah Mengajukan Permohonan?</p>
                            <p className="text-slate-500">Unggah atau perbarui tanda tangan untuk berkas Anda yang sudah ada.</p>
                        </div>
                    </div>
                    <Link
                        href="/signature-upload"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
                    >
                        Upload TTD Pemohon &rarr;
                    </Link>
                </motion.div>

                {/* Flash success */}
                {flash?.success && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800"
                    >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </motion.div>
                )}

                {/* ===== Form ===== */}
                <form onSubmit={submit} className="space-y-8">

                    {/* ============ 1. Data Pemohon ============ */}
                    <motion.div
                        custom={0}
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        <div className="border-b border-slate-100 pb-3">
                            <MinimalSectionHeader icon={UserRound} title="1. Data Pemohon" subtitle="Identitas dan kontak pemohon" />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">
                                    Nama Pemohon <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={data.nama_pemohon}
                                    onChange={(e) => setData('nama_pemohon', e.target.value)}
                                    placeholder="Nama lengkap"
                                    className={inputClass}
                                />
                                <FieldError message={fieldError('nama_pemohon')} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">Jabatan Pemohon</Label>
                                <Input
                                    value={data.jabatan_pemohon}
                                    onChange={(e) => setData('jabatan_pemohon', e.target.value)}
                                    placeholder="Contoh: Manajer Operasional"
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-xs font-medium text-slate-700">
                                    Instansi / Perusahaan <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={data.instansi}
                                    onChange={(e) => setData('instansi', e.target.value)}
                                    placeholder="Nama instansi atau perusahaan"
                                    className={inputClass}
                                />
                                <FieldError message={fieldError('instansi')} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">
                                    Kabupaten / Kota <span className="text-red-500">*</span>
                                </Label>
                                <ComboboxSearch
                                    value={data.kabupaten}
                                    onChange={(val) => setData('kabupaten', val)}
                                    fetchUrl="/api/geolocation/regencies?province_id=73"
                                    labelKey="name"
                                    valueKey="id"
                                    placeholder="Pilih kabupaten/kota"
                                    className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
                                />
                                <FieldError message={fieldError('kabupaten')} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">
                                    No. WhatsApp <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={data.nomor_telepon}
                                    onChange={(e) => setData('nomor_telepon', e.target.value)}
                                    placeholder="081234567890"
                                    className={inputClass}
                                />
                                <FieldError message={fieldError('nomor_telepon')} />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-xs font-medium text-slate-700">
                                    Alamat Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@perusahaan.com"
                                    className={inputClass}
                                />
                                <FieldError message={fieldError('email')} />
                            </div>
                            <div className="sm:col-span-2">
                                <div className="w-100 h-100 space-y-1.5">
                                    <SignaturePad
                                        value={data.tanda_tangan}
                                        onChange={(val) => setData('tanda_tangan', val)}
                                        error={fieldError('tanda_tangan')}
                                    />
                                </div>

                            </div>
                        </div>
                    </motion.div>

                    {/* ============ 2. Detail Kegiatan ============ */}
                    <motion.div
                        custom={1}
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        <div className="border-b border-slate-100 pb-3">
                            <MinimalSectionHeader icon={FileText} title="2. Detail Kegiatan" subtitle="Rencana kegiatan yang dikonsultasikan" />
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">
                                    Rencana Kegiatan <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    value={data.rencana_kegiatan}
                                    onChange={(e) => setData('rencana_kegiatan', e.target.value)}
                                    placeholder="Jelaskan rencana kegiatan yang akan dikonsultasikan"
                                    className={textareaClass}
                                />
                                <FieldError message={fieldError('rencana_kegiatan')} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">
                                    Permintaan Khusus <span className="font-normal text-slate-400">(opsional)</span>
                                </Label>
                                <Textarea
                                    value={data.permintaan_khusus}
                                    onChange={(e) => setData('permintaan_khusus', e.target.value)}
                                    placeholder="Tambahkan kebutuhan atau catatan khusus"
                                    className="min-h-20 resize-none rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">
                                    Unggah Bahan Konsultasi
                                </Label>
                                <FileUpload
                                    label="Bahan Konsultasi"
                                    name="bahan_konsultasi"
                                    multiple
                                    max={5}
                                    files={(data.bahan_konsultasi as unknown as File[]) ?? []}
                                    onChange={(files: File[]) => setData('bahan_konsultasi', files as any)}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* ============ 3. Jadwal Konsultasi ============ */}
                    <motion.div
                        custom={2}
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        <div className="border-b border-slate-100 pb-3">
                            <MinimalSectionHeader icon={CalendarDays} title="3. Jadwal Konsultasi" subtitle="Lokasi, tanggal, dan waktu" />
                        </div>
                        <div className="space-y-4">

                            {/* --- Lokasi --- */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                    Lokasi Konsultasi <span className="text-red-500">*</span>
                                </Label>
                                <ComboboxSearch
                                    value={data.lokasi_konsultasi_id}
                                    onChange={(val) => {
                                        setData('lokasi_konsultasi_id', val);
                                        setData('tanggal_konsultasi', '');
                                        setData('child_schedule_id', '');
                                    }}
                                    staticOptions={locations}
                                    labelKey="nama_lokasi"
                                    valueKey="id"
                                    placeholder="Pilih lokasi konsultasi..."
                                    className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
                                />
                                <FieldError message={fieldError('lokasi_konsultasi_id')} />
                            </div>

                            {/* --- Tanggal --- */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                                    <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                                    Pilih Tanggal <span className="text-red-500">*</span>
                                </Label>

                                {!data.lokasi_konsultasi_id ? (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xs text-slate-400 py-2"
                                    >
                                        Pilih lokasi terlebih dahulu.
                                    </motion.p>
                                ) : dateCards.length === 0 ? (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xs text-slate-400 py-2"
                                    >
                                        Tidak ada jadwal tersedia untuk lokasi ini.
                                    </motion.p>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.9 }}
                                            type="button"
                                            onClick={() => scrollDates(-1)}
                                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                                            aria-label="Geser kiri"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </motion.button>

                                        <motion.div
                                            ref={dateScrollerRef}
                                            className="flex flex-1 overflow-hidden py-1.5 scrollbar-hide cursor-grab active:cursor-grabbing"
                                        >
                                            <motion.div
                                                drag="x"
                                                dragConstraints={dateScrollerRef}
                                                dragElastic={0.1}
                                                dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="flex gap-2.5"
                                            >
                                                {dateCards.map((card) => {
                                                    const active = data.tanggal_konsultasi === card.tanggal;
                                                    const dateObj = new Date(card.tanggal);
                                                    return (
                                                        <motion.button
                                                            key={card.tanggal}
                                                            variants={itemVariants}
                                                            type="button"
                                                            whileHover={{ y: -2, scale: 1.02 }}
                                                            whileTap={{ scale: 0.96 }}
                                                            onClick={() => {
                                                                setData('tanggal_konsultasi', card.tanggal);
                                                                setData('child_schedule_id', '');
                                                            }}
                                                            className={`relative min-w-[5.25rem] cursor-pointer rounded-xl border px-2.5 py-2.5 text-center transition-colors duration-200 ${active
                                                                    ? 'border-transparent text-white'
                                                                    : 'border-slate-200/80 bg-slate-50/50 hover:border-blue-300/80 hover:bg-blue-50/20'
                                                                }`}
                                                        >
                                                            {/* Smooth active background pill animation */}
                                                            {active && (
                                                                <motion.div
                                                                    layoutId="activeDatePill"
                                                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25"
                                                                />
                                                            )}

                                                            <div className="relative z-10">
                                                                <p className={`text-[10px] font-medium capitalize transition-colors ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                                                                    {dateObj.toLocaleDateString('id-ID', { weekday: 'short' })}
                                                                </p>
                                                                <p className={`text-base font-bold leading-none my-1 transition-colors ${active ? 'text-white' : 'text-slate-900'}`}>
                                                                    {dateObj.toLocaleDateString('id-ID', { day: '2-digit' })}
                                                                </p>
                                                                <p className={`text-[10px] font-medium transition-colors ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                                                                    {dateObj.toLocaleDateString('id-ID', { month: 'short' })}
                                                                </p>
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </motion.div>
                                        </motion.div>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.9 }}
                                            type="button"
                                            onClick={() => scrollDates(1)}
                                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                                            aria-label="Geser kanan"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </motion.button>
                                    </div>
                                )}
                                <FieldError message={fieldError('tanggal_konsultasi')} />
                            </div>

                            {/* --- Waktu --- */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                                        Pilih Waktu <span className="text-red-500">*</span>
                                    </Label>
                                    {data.tanggal_konsultasi && (
                                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md">
                                            {formatTanggal(data.tanggal_konsultasi)}
                                        </span>
                                    )}
                                </div>

                                <AnimatePresence mode="wait">
                                    {!data.tanggal_konsultasi ? (
                                        <motion.div
                                            key="no-date"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3.5 text-center"
                                        >
                                            <p className="text-xs text-slate-400">Pilih tanggal terlebih dahulu untuk melihat jam konsultasi.</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={data.tanggal_konsultasi}
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4"
                                        >
                                            {timeSlots.map((slot) => {
                                                const active = data.child_schedule_id === String(slot.id);
                                                const full = slot.sisa_kuota === 0;
                                                return (
                                                    <motion.button
                                                        key={slot.id}
                                                        variants={itemVariants}
                                                        type="button"
                                                        disabled={full}
                                                        whileHover={full ? {} : { scale: 1.02 }}
                                                        whileTap={full ? {} : { scale: 0.98 }}
                                                        onClick={() => setData('child_schedule_id', String(slot.id))}
                                                        className={`group relative rounded-xl border px-3.5 py-3 text-center transition-colors duration-200 ${full
                                                                ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-40'
                                                                : active
                                                                    ? 'border-blue-600/20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                                                                    : 'cursor-pointer border-slate-200/80 bg-white hover:border-blue-400/60 hover:bg-blue-50/30 hover:shadow-xs'
                                                            }`}
                                                    >
                                                        <p className={`text-sm font-bold tracking-tight ${active ? 'text-white' : full ? 'text-slate-400' : 'text-slate-800'}`}>
                                                            {slot.waktu}
                                                        </p>
                                                        <div className="mt-1 flex items-center justify-center gap-1.5">
                                                            <span className={`h-1.5 w-1.5 rounded-full ${full ? 'bg-red-400' : active ? 'bg-emerald-300' : 'bg-emerald-500'
                                                                }`} />
                                                            <span className={`text-[11px] font-medium ${active
                                                                    ? 'text-blue-100'
                                                                    : full ? 'text-red-500' : 'text-slate-500'
                                                                }`}>
                                                                {full ? 'Penuh' : `Sisa ${slot.sisa_kuota}`}
                                                            </span>
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <FieldError message={fieldError('child_schedule_id')} />
                            </div>
                        </div>
                    </motion.div>

                    {/* ============ Persetujuan + Submit ============ */}
                    <motion.div
                        custom={3}
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4 border-t border-slate-100 pt-6"
                    >
                        <div className="flex items-start gap-2.5">
                            <Checkbox
                                id="setuju_syarat_ketentuan"
                                checked={data.setuju_syarat_ketentuan}
                                onCheckedChange={(checked) => setData('setuju_syarat_ketentuan', checked === true)}
                                className="mt-0.5 border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                            />
                            <Label
                                htmlFor="setuju_syarat_ketentuan"
                                className="cursor-pointer text-xs font-normal leading-relaxed text-slate-600"
                            >
                                Saya menyetujui syarat dan ketentuan pengajuan konsultasi yang berlaku di BPRL Makassar.
                            </Label>
                        </div>
                        <FieldError message={fieldError('setuju_syarat_ketentuan')} />

                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/35 hover:brightness-105 disabled:opacity-50"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Mengirim...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Kirim Permohonan
                                        <Send className="h-3.5 w-3.5" />
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    </motion.div>

                </form>
            </div>
        </Layout>
    );
}
