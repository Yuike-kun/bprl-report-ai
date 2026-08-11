import { useEffect, useRef, useState } from 'react';
import {
    ArrowRight,
    Search,
    ShieldCheck,
    Zap,
    UserRound,
    ClipboardCheck,
    FileCheck2,
    BadgeCheck,
    FileText,
    Compass,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import logo from '/public/egerai-logo.png';
import heroIllustration from '/public/hero-illustration.png';
import HomeLayout from './layout';

const quickAccess = [
    {
        icon: ClipboardCheck,
        label: 'Jenis Layanan',
        value: 'Pilih layanan',
    },
    {
        icon: Compass,
        label: 'Wilayah Kegiatan',
        value: 'Pilih wilayah',
    },
    {
        icon: FileCheck2,
        label: 'Tanggal Pengajuan',
        value: 'Pilih tanggal',
    },
    {
        icon: FileText,
        label: 'Jenis Dokumen',
        value: 'Pilih dokumen',
    },
    {
        icon: ShieldCheck,
        label: 'Status Berkas',
        value: 'Cek status',
    },
];

const steps = [
    {
        icon: ClipboardCheck,
        title: 'Pengajuan',
        desc: 'Isi permohonan konsultasi atau proposal KKPRL secara daring.',
    },
    {
        icon: FileCheck2,
        title: 'Verifikasi',
        desc: 'Tim BPRL memeriksa kelengkapan berkas & kesesuaian zonasi.',
    },
    {
        icon: Zap,
        title: 'Drafting AI',
        desc: 'Sistem e-GeRAI menyusun draf laporan pertimbangan teknis.',
    },
    {
        icon: BadgeCheck,
        title: 'Penerbitan',
        desc: 'Pengesahan dokumen resmi dengan tanda tangan digital.',
    },
];

const services = [
    {
        icon: ClipboardCheck,
        tag: 'Publik',
        title: 'Konsultasi & Asistensi',
        desc: 'Ajukan permohonan konsultasi pemanfaatan ruang laut secara daring.',
        href: '/request-form',
        cta: 'Ajukan Sekarang',
    },
    {
        icon: FileText,
        tag: 'Mandiri',
        title: 'Proposal KKPRL',
        desc: 'Susun berkas usulan kesesuaian kegiatan pemanfaatan ruang laut.',
        href: '/kkprl-proposal',
        cta: 'Isi Proposal',
    },
    {
        icon: UserRound,
        tag: 'Internal',
        title: 'Portal Petugas',
        desc: 'Masuk untuk generate dokumen dan pengesahan e-sign petugas BPRL.',
        href: '/login',
        cta: 'Masuk Portal',
    },
];

function Reveal({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.1 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`mx-6 transition-all duration-700 ease-out sm:mx-10 lg:mx-24 ${
                visible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-6 opacity-0'
            } ${className}`}
        >
            {children}
        </div>
    );
}

export default function Welcome() {
    return (
        <HomeLayout>
            <div className="relative w-full overflow-x-hidden text-slate-800">
                {/* ═══════════ HERO ═══════════ */}
                <div className="mb-6 px-6 pt-10 lg:px-14">
                    <section className="relative isolate min-h-80 overflow-hidden rounded-2xl">
                        {/* Full screen image */}
                        <div className="absolute inset-0 -z-10">
                            <img
                                src={heroIllustration}
                                alt="Petugas BPRL Makassar melayani konsultasi KKPRL"
                                className="h-full w-full object-cover object-bottom"
                            />

                            {/* Optional overlay so text is easier to read */}
                            <div className="absolute inset-0 bg-linear-to-b from-green-400/30 to-blue-500/50" />

                            {/* Optional inset shadow */}
                            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(15,23,42,0.15)]" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex w-full items-center px-6 py-16">
                            <div className="space-y-6">
                                <div className="max-w-40">
                                    <img
                                        src={logo}
                                        alt="e-GeRAI – Generate, Asistensi, Informasi"
                                        className="h-auto w-full object-contain object-left"
                                    />
                                </div>

                                <h1 className="text-5xl leading-[1.02] font-black tracking-tight text-slate-900 sm:text-6xl lg:text-[3.75rem]">
                                    Layanan Digital
                                    <br />
                                    Dokumen KKPRL
                                </h1>

                                <p className="max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
                                    Konsultasi, asistensi teknis, dan penyusunan
                                    dokumen Kesesuaian Kegiatan Pemanfaatan
                                    Ruang Laut — presisi dan resmi.
                                </p>

                                <div className="grid grid-cols-1 items-center gap-3 pt-1 lg:grid-cols-2">
                                    <Link
                                        href="/request-form"
                                        className="group inline-flex w-full items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:scale-[0.98]"
                                    >
                                        Ajukan Konsultasi
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>

                                    <Link
                                        href="/kkprl-proposal"
                                        className="inline-flex w-full items-center gap-2 rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Isi Proposal KKPRL
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ═══════════ ALUR LAYANAN ═══════════ */}
                <Reveal className="pb-16 lg:pb-24">
                    <div className="mb-10 max-w-xl space-y-3">
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Alur Layanan
                        </h2>
                        <p className="text-sm text-slate-500 sm:text-base">
                            Empat langkah dari pengajuan hingga penerbitan
                            dokumen.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step, i) => {
                            const StepIcon = step.icon;
                            return (
                                <div key={step.title} className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                            <StepIcon className="h-4 w-4" />
                                        </span>
                                        <span className="text-xs font-semibold text-slate-300">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {step.title}
                                    </h3>
                                    <p className="text-xs leading-relaxed text-slate-500">
                                        {step.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </Reveal>

                {/* ═══════════ LAYANAN ═══════════ */}
                <Reveal className="pb-16 lg:pb-24">
                    <div className="mb-10 max-w-xl space-y-3">
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Layanan
                        </h2>
                        <p className="text-sm text-slate-500 sm:text-base">
                            Pilih layanan sesuai kebutuhan Anda.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        {services.map((service) => {
                            const ServiceIcon = service.icon;
                            return (
                                <Link
                                    key={service.title}
                                    href={service.href}
                                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/10"
                                >
                                    <div className="flex items-start justify-between">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                                            <ServiceIcon className="h-4 w-4" />
                                        </span>
                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                            {service.tag}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-base font-bold text-slate-900">
                                        {service.title}
                                    </h3>
                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                                        {service.desc}
                                    </p>
                                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition-all group-hover:gap-2.5">
                                        {service.cta}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </Reveal>

                {/* ═══════════ PENUTUP ═══════════ */}
                <Reveal className="pb-16 lg:pb-24">
                    <div className="rounded-2xl border border-slate-200 bg-white px-7 py-10 text-center shadow-sm sm:px-12">
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                            Siap mengajukan permohonan?
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                            Mulai konsultasi pemanfaatan ruang laut Anda hari
                            ini.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href="/request-form"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700"
                            >
                                Ajukan Permohonan
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                            >
                                Masuk Petugas
                            </Link>
                        </div>
                    </div>
                </Reveal>
            </div>
        </HomeLayout>
    );
}
