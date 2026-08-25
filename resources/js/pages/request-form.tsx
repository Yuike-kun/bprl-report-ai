import HomeLayout from './layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import {
    ArrowLeft,
    BookOpen,
    Check,
    ChevronLeft,
    ChevronRight,
    UserRound,
    Building2,
    FileText,
    CalendarDays,
    Video,
    Layers,
    Users,
    Send,
    Loader2,
    CircleAlert,
    CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
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
import DocumentUpload from '@/components/document-upload';
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
    flash?: { success?: string };
};

const METODE_OPTIONS: Array<{
    value: Schedule['pelaksanaan'];
    title: string;
    desc: string;
    icon: LucideIcon;
}> = [
        {
            value: 'Daring',
            title: 'Konsultasi Daring',
            desc: 'Melalui video conference (Zoom / Google Meet)',
            icon: Video,
        },
        {
            value: 'Luring',
            title: 'Konsultasi Tatap Muka',
            desc: 'Datang langsung ke kantor BPRL Makassar',
            icon: Users,
        },
        {
            value: 'Hybrid',
            title: 'Hybrid',
            desc: 'Kombinasi daring dan tatap muka',
            icon: Layers,
        },
    ];

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
        desc: 'Pilih metode, tanggal, dan waktu sesuai ketersediaan kuota.',
    },
];

const formatTanggal = (tanggal: string) =>
    new Date(tanggal).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
            <CircleAlert className="h-3.5 w-3.5 shrink-0" />
            {message}
        </p>
    );
}

function SectionHeader({
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
                <Icon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
                <h2 className="text-sm leading-none font-bold text-slate-900">
                    {title}
                </h2>
                <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function RequestForm() {
    const [kabupaten, setKabupaten] = useState<any[]>([]);
    const { locations, schedules, provinsi, flash } =
        usePage<PageProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_pemohon: '',
        jabatan_pemohon: '',
        instansi: '',
        tanggal_konsultasi: '',
        child_schedule_id: '',
        pelaksanaan: 'Daring' as Schedule['pelaksanaan'],
        lokasi_konsultasi_id: '',
        rencana_kegiatan: '',
        kabupaten: '',
        provinsi: '',
        nomor_telepon: '',
        email: '',
        permintaan_khusus: '',
        tanda_tangan: '',
        setuju_syarat_ketentuan: false,
        bahan_konsultasi: null,
    });

    const [attempted, setAttempted] = useState(false);
    const dateScrollerRef = useRef<HTMLDivElement>(null);

    /* ---------- logika jadwal ---------- */
    const activeSchedules = schedules.filter((item) =>
        item.child_schedules.some((slot) => slot.sisa_kuota > 0),
    );
    const needsLocation =
        data.pelaksanaan === 'Luring' || data.pelaksanaan === 'Hybrid';

    const matchingSchedules = activeSchedules.filter((item) => {
        if (item.pelaksanaan !== data.pelaksanaan) return false;
        if (data.pelaksanaan === 'Daring')
            return item.lokasi_konsultasi_id === null;
        return (
            String(item.lokasi_konsultasi_id ?? '') ===
            data.lokasi_konsultasi_id
        );
    });

    const dateCards = Array.from(
        new Set(matchingSchedules.map((item) => item.tanggal)),
    ).map((tanggal) => {
        const sisa = matchingSchedules
            .filter((item) => item.tanggal === tanggal)
            .reduce(
                (sum, item) =>
                    sum +
                    item.child_schedules.reduce(
                        (a, slot) => a + slot.sisa_kuota,
                        0,
                    ),
                0,
            );
        return { tanggal, sisa };
    });

    const matchedSchedule = matchingSchedules.find(
        (item) => item.tanggal.slice(0, 10) === data.tanggal_konsultasi,
    );
    const timeSlots = matchedSchedule?.child_schedules ?? [];

    /* ---------- validasi ---------- */
    const required = (value: string | boolean) =>
        typeof value === 'boolean'
            ? value
                ? undefined
                : 'Wajib disetujui.'
            : value.trim()
                ? undefined
                : 'Wajib diisi.';

    const requiredFields: Array<keyof typeof data> = [
        'nama_pemohon',
        'instansi',
        'kabupaten',
        'provinsi',
        'nomor_telepon',
        'email',
        'tanda_tangan',
        'rencana_kegiatan',
        ...(needsLocation
            ? (['lokasi_konsultasi_id'] as Array<keyof typeof data>)
            : []),
        'tanggal_konsultasi',
        'child_schedule_id',
        'setuju_syarat_ketentuan',
    ];

    const fieldError = (field: keyof typeof data) =>
        errors[field] || (attempted ? required(data[field]) : undefined);

    const selectPelaksanaan = (mode: Schedule['pelaksanaan']) => {
        setData('pelaksanaan', mode);
        setData('tanggal_konsultasi', '');
        setData('child_schedule_id', '');
        if (mode === 'Daring') setData('lokasi_konsultasi_id', '');
    };

    const scrollDates = (dir: number) =>
        dateScrollerRef.current?.scrollBy({
            left: dir * 260,
            behavior: 'smooth',
        });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const hasMissing = requiredFields.some((f) => required(data[f]));
        if (hasMissing) {
            setAttempted(true);
            return;
        }
        post('/request-form', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setAttempted(false);
            },
        });
    };

    const quotaBadge = (sisa: number) => {
        if (sisa === 0) return 'bg-red-50 text-red-600 border-red-200';
        if (sisa <= 2) return 'bg-amber-50 text-amber-600 border-amber-200';
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    };

    const inputClass =
        'h-11 rounded-lg border-slate-200 bg-white text-sm focus-visible:ring-blue-500/20';
    const selectClass =
        'h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400';

    useEffect(() => {
        fetch('api/geolocation/districts')
            .then((res) => res.json())
            .then((data) => {
                setKabupaten(data);
            });
    }, []);

    return (
        <HomeLayout>
            <div className="mx-auto w-full px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <Link
                            href="/"
                            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:text-blue-700"
                            aria-label="Kembali ke beranda"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Mulai Konsultasi
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-500">
                                Konsultasikan rencana kegiatan pemanfaatan ruang
                                laut Anda
                            </p>
                        </div>
                    </div>

                    <Dialog>
                        <DialogTrigger
                            render={
                                <Button
                                    variant="outline"
                                    className="shrink-0 rounded-lg border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Panduan Konsultasi
                                    </span>
                                </Button>
                            }
                        />
                        <DialogContent className="rounded-2xl sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Panduan Konsultasi</DialogTitle>
                                <DialogDescription>
                                    Ikuti langkah berikut untuk mengajukan
                                    permohonan konsultasi.
                                </DialogDescription>
                            </DialogHeader>
                            <ol className="list-none space-y-3 text-sm text-slate-600">
                                {GUIDE_ITEMS.map((item, index) => (
                                    <li key={item.title} className="flex gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-xs font-bold text-blue-700">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </DialogContent>
                    </Dialog>
                </div>

                {flash?.success && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Kartu form */}
                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="space-y-9 p-6 sm:p-8">
                        {/* ============ 1. Data Pemohon ============ */}
                        <section className="space-y-5">
                            <SectionHeader
                                icon={UserRound}
                                title="Data Pemohon"
                                subtitle="Identitas dan kontak yang dapat dihubungi"
                            />
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">
                                        Nama Pemohon{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="nama_pemohon"
                                        value={data.nama_pemohon}
                                        onChange={(e) =>
                                            setData(
                                                'nama_pemohon',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Masukkan nama lengkap"
                                        className={inputClass}
                                    />
                                    <FieldError
                                        message={fieldError('nama_pemohon')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">
                                        Jabatan Pemohon
                                    </Label>
                                    <Input
                                        id="jabatan_pemohon"
                                        value={data.jabatan_pemohon}
                                        onChange={(e) =>
                                            setData(
                                                'jabatan_pemohon',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Manajer Operasional"
                                        className={inputClass}
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label className="text-sm font-medium text-slate-700">
                                        Instansi / Perusahaan{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="instansi"
                                        value={data.instansi}
                                        onChange={(e) =>
                                            setData('instansi', e.target.value)
                                        }
                                        placeholder="Nama instansi atau perusahaan"
                                        className={inputClass}
                                    />
                                    <FieldError
                                        message={fieldError('instansi')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">
                                        Provinsi{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <ComboboxSearch
                                        value={data.provinsi}
                                        onChange={(val) =>
                                            setData('provinsi', val)
                                        }
                                        fetchUrl="/api/geolocation/provinces"
                                        labelKey="name"
                                        valueKey="id"
                                        placeholder="Pilih provinsi"
                                    />
                                    <FieldError
                                        message={fieldError('provinsi')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">
                                        Kabupaten / Kota{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <ComboboxSearch
                                        value={data.kabupaten}
                                        onChange={(val) =>
                                            setData('kabupaten', val)
                                        }
                                        fetchUrl={`/api/geolocation/regencies?province_id=${data.provinsi}`}
                                        labelKey="name"
                                        valueKey="id"
                                        placeholder="Pilih kabupaten/kota"
                                    />
                                    <FieldError
                                        message={fieldError('kabupaten')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">
                                        No. WhatsApp{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="nomor_telepon"
                                        value={data.nomor_telepon}
                                        onChange={(e) =>
                                            setData(
                                                'nomor_telepon',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: 081234567890"
                                        className={inputClass}
                                    />
                                    <FieldError
                                        message={fieldError('nomor_telepon')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">
                                        Alamat Email{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="email@perusahaan.com"
                                        className={inputClass}
                                    />
                                    <FieldError message={fieldError('email')} />
                                </div>
                                <div className="pt-2 sm:col-span-2">
                                    <SignaturePad
                                        value={data.tanda_tangan}
                                        onChange={(val) =>
                                            setData('tanda_tangan', val)
                                        }
                                        error={fieldError('tanda_tangan')}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ============ 2. Detail Kegiatan ============ */}
                        <section className="space-y-5 border-t border-slate-100 pt-8">
                            <SectionHeader
                                icon={FileText}
                                title="Detail Kegiatan"
                                subtitle="Rencana kegiatan yang akan dikonsultasikan"
                            />
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                    Rencana Kegiatan{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="rencana_kegiatan"
                                    value={data.rencana_kegiatan}
                                    onChange={(e) =>
                                        setData(
                                            'rencana_kegiatan',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Jelaskan rencana kegiatan yang akan dikonsultasikan"
                                    className="min-h-36 resize-none rounded-lg border-slate-200 bg-white p-3.5 text-sm focus-visible:ring-blue-500/20"
                                />
                                <FieldError
                                    message={fieldError('rencana_kegiatan')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                    Permintaan Khusus{' '}
                                    <span className="font-normal text-slate-400">
                                        (opsional)
                                    </span>
                                </Label>
                                <Textarea
                                    id="permintaan_khusus"
                                    value={data.permintaan_khusus}
                                    onChange={(e) =>
                                        setData(
                                            'permintaan_khusus',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Tambahkan kebutuhan atau catatan khusus"
                                    className="min-h-24 resize-none rounded-lg border-slate-200 bg-white p-3.5 text-sm focus-visible:ring-blue-500/20"
                                />
                            </div>
                        </section>

                        {/* ============ 3. Jadwal Konsultasi ============ */}
                        <section className="space-y-6 border-t border-slate-100 pt-8">
                            <SectionHeader
                                icon={CalendarDays}
                                title="Jadwal Konsultasi"
                                subtitle="Pilih metode, tanggal, dan waktu sesuai ketersediaan kuota"
                            />

                            {/* Metode */}
                            <div className="space-y-2.5">
                                <Label className="text-sm font-medium text-slate-700">
                                    Pilih Metode Konsultasi
                                </Label>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {METODE_OPTIONS.map((mode) => {
                                        const ModeIcon = mode.icon;
                                        const active =
                                            data.pelaksanaan === mode.value;
                                        return (
                                            <button
                                                key={mode.value}
                                                type="button"
                                                onClick={() =>
                                                    selectPelaksanaan(
                                                        mode.value,
                                                    )
                                                }
                                                className={`relative cursor-pointer rounded-xl border p-4 text-left transition-all ${active
                                                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/30'
                                                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                                                    }`}
                                            >
                                                {active && (
                                                    <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </span>
                                                )}
                                                <ModeIcon
                                                    className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-slate-400'}`}
                                                />
                                                <p className="mt-2.5 text-sm font-semibold text-slate-800">
                                                    {mode.title}
                                                </p>
                                                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                                    {mode.desc}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Lokasi */}
                            {needsLocation && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">
                                        Lokasi Konsultasi{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        value={data.lokasi_konsultasi_id}
                                        onChange={(e) => {
                                            setData(
                                                'lokasi_konsultasi_id',
                                                e.target.value,
                                            );
                                            setData('tanggal_konsultasi', '');
                                            setData('child_schedule_id', '');
                                        }}
                                        className={selectClass}
                                    >
                                        <option value="">
                                            Pilih lokasi konsultasi
                                        </option>
                                        {locations.map((location) => (
                                            <option
                                                key={location.id}
                                                value={location.id}
                                            >
                                                {location.nama_lokasi}
                                            </option>
                                        ))}
                                    </select>
                                    <FieldError
                                        message={fieldError(
                                            'lokasi_konsultasi_id',
                                        )}
                                    />
                                </div>
                            )}

                            {/* Tanggal */}
                            <div className="space-y-2.5">
                                <Label className="text-sm font-medium text-slate-700">
                                    Pilih Tanggal{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => scrollDates(-1)}
                                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
                                        aria-label="Geser kiri"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <div
                                        ref={dateScrollerRef}
                                        className="flex flex-1 gap-3 overflow-x-auto py-1"
                                    >
                                        {dateCards.length > 0 ? (
                                            dateCards.map((card) => {
                                                const active =
                                                    data.tanggal_konsultasi ===
                                                    card.tanggal;
                                                const dateObj = new Date(
                                                    card.tanggal,
                                                );
                                                return (
                                                    <button
                                                        key={card.tanggal}
                                                        type="button"
                                                        onClick={() => {
                                                            setData(
                                                                'tanggal_konsultasi',
                                                                card.tanggal,
                                                            );
                                                            setData(
                                                                'child_schedule_id',
                                                                '',
                                                            );
                                                        }}
                                                        className={`min-w-28 cursor-pointer rounded-xl border px-3 py-3 text-center transition-all ${active
                                                            ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/30'
                                                            : 'border-slate-200 bg-white hover:border-blue-300'
                                                            }`}
                                                    >
                                                        <p className="text-[11px] text-slate-400 capitalize">
                                                            {dateObj.toLocaleDateString(
                                                                'id-ID',
                                                                {
                                                                    weekday:
                                                                        'long',
                                                                },
                                                            )}
                                                        </p>
                                                        <p className="mt-0.5 text-sm font-bold text-slate-900">
                                                            {dateObj.toLocaleDateString(
                                                                'id-ID',
                                                                {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                },
                                                            )}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400">
                                                            {dateObj.toLocaleDateString(
                                                                'id-ID',
                                                                {
                                                                    year: 'numeric',
                                                                },
                                                            )}
                                                        </p>
                                                        <span
                                                            className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${quotaBadge(card.sisa)}`}
                                                        >
                                                            {card.sisa === 0
                                                                ? 'Penuh'
                                                                : `Sisa ${card.sisa}`}
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <p className="py-2 text-sm text-slate-500">
                                                Tidak ada jadwal tersedia untuk
                                                pilihan ini.
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => scrollDates(1)}
                                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
                                        aria-label="Geser kanan"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                                <FieldError
                                    message={fieldError('tanggal_konsultasi')}
                                />
                            </div>

                            {/* Waktu */}
                            <div className="space-y-2.5">
                                <Label className="text-sm font-medium text-slate-700">
                                    Pilih Waktu Konsultasi{' '}
                                    <span className="text-red-500">*</span>
                                    {data.tanggal_konsultasi && (
                                        <span className="font-normal text-slate-400">
                                            {' '}
                                            —{' '}
                                            {formatTanggal(
                                                data.tanggal_konsultasi,
                                            )}
                                        </span>
                                    )}
                                </Label>
                                {data.tanggal_konsultasi ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                            {timeSlots.map((slot) => {
                                                const active =
                                                    data.child_schedule_id ===
                                                    String(slot.id);
                                                const full =
                                                    slot.sisa_kuota === 0;
                                                return (
                                                    <button
                                                        key={slot.id}
                                                        type="button"
                                                        disabled={full}
                                                        onClick={() =>
                                                            setData(
                                                                'child_schedule_id',
                                                                String(slot.id),
                                                            )
                                                        }
                                                        className={`relative rounded-xl border px-3 py-3 text-center transition-all ${full
                                                            ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-70'
                                                            : active
                                                                ? 'cursor-pointer border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/30'
                                                                : 'cursor-pointer border-slate-200 bg-white hover:border-blue-300'
                                                            }`}
                                                    >
                                                        {active && (
                                                            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                                                                <Check className="h-3 w-3 text-white" />
                                                            </span>
                                                        )}
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {slot.waktu}
                                                        </p>
                                                        <p
                                                            className={`mt-1 text-xs font-medium ${full ? 'text-red-500' : slot.sisa_kuota <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}
                                                        >
                                                            {full
                                                                ? 'Penuh'
                                                                : `Sisa Kuota: ${slot.sisa_kuota}`}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5">
                                            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500" />{' '}
                                                Banyak tersedia (≥3)
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                <span className="h-2 w-2 rounded-full bg-amber-500" />{' '}
                                                Sisa sedikit (1–2)
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                <span className="h-2 w-2 rounded-full bg-red-500" />{' '}
                                                Penuh (0)
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        Pilih tanggal terlebih dahulu.
                                    </p>
                                )}
                                <FieldError
                                    message={fieldError('child_schedule_id')}
                                />
                            </div>
                        </section>

                        <section className="space-y-5 border-t border-slate-100 pt-8">
                            <Label className="text-sm font-medium text-slate-700">
                                Unggah Bahan Konsultasi{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <FileUpload label="Bahan Konsultasi"
                                name="bahan_konsultasi"
                                multiple
                                max={5}
                                files={(data.bahan_konsultasi as File[]) ?? []}
                                onChange={(files: File[]) => setData('bahan_konsultasi', files as any)} />
                        </section>

                        {/* ============ Persetujuan ============ */}
                        <section className="space-y-5 border-t border-slate-100 pt-8">
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="setuju_syarat_ketentuan"
                                        checked={data.setuju_syarat_ketentuan}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'setuju_syarat_ketentuan',
                                                checked === true,
                                            )
                                        }
                                        className="mt-0.5 border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                                    />
                                    <Label
                                        htmlFor="setuju_syarat_ketentuan"
                                        className="cursor-pointer text-sm leading-relaxed font-normal text-slate-600"
                                    >
                                        Saya menyetujui syarat dan ketentuan
                                        pengajuan konsultasi yang berlaku di
                                        BPRL Makassar.
                                    </Label>
                                </div>
                                <FieldError
                                    message={fieldError(
                                        'setuju_syarat_ketentuan',
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="group h-12 w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/35 disabled:opacity-70"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Mengirim...
                                    </span>
                                ) : (
                                    <>
                                        Kirim Permohonan
                                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </>
                                )}
                            </Button>
                        </section>
                    </div>
                </form>
            </div>
        </HomeLayout>
    );
}
