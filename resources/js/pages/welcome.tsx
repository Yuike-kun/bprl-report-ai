import { useEffect, useRef, useState } from 'react';
import {
    ArrowRight,
    ShieldCheck,
    Zap,
    UserRound,
    ClipboardCheck,
    FileCheck2,
    BadgeCheck,
    FileText,
    MapPin,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import logo from '/public/egerai-logo.png';
import heroIllustration from '/public/hero-illustration.png';
import HomeLayout from './layout';

const steps = [
    {
        icon: ClipboardCheck,
        code: 'WP-01',
        title: 'Pengajuan',
        desc: 'Isi permohonan konsultasi atau proposal KKPRL secara daring.',
    },
    {
        icon: FileCheck2,
        code: 'WP-02',
        title: 'Verifikasi',
        desc: 'Tim BPRL memeriksa kelengkapan berkas & kesesuaian zonasi.',
    },
    {
        icon: Zap,
        code: 'WP-03',
        title: 'Drafting AI',
        desc: 'Sistem e-GeRAI menyusun draf laporan pertimbangan teknis.',
    },
    {
        icon: BadgeCheck,
        code: 'WP-04',
        title: 'Penerbitan',
        desc: 'Pengesahan dokumen resmi dengan tanda tangan digital.',
    },
];

const services = [
    {
        icon: ClipboardCheck,
        tag: 'PUBLIK',
        title: 'Konsultasi & Asistensi',
        desc: 'Ajukan permohonan konsultasi pemanfaatan ruang laut secara daring.',
        href: '/request-form',
        cta: 'Ajukan Sekarang',
    },
    {
        icon: FileText,
        tag: 'MANDIRI',
        title: 'Proposal KKPRL',
        desc: 'Susun berkas usulan kesesuaian kegiatan pemanfaatan ruang laut.',
        href: '/kkprl-proposal',
        cta: 'Isi Proposal',
    },
    {
        icon: UserRound,
        tag: 'INTERNAL',
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
            className={`mx-6 transition-all duration-700 ease-out motion-reduce:transition-none sm:mx-10 lg:mx-24 ${
                visible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100'
            } ${className}`}
        >
            {children}
        </div>
    );
}

export default function Welcome() {
    return (
        <HomeLayout>
            <div className="relative w-full text-slate-800">
                <div className="px-6 pt-10 pb-24 lg:px-14">
                    <section className="relative isolate min-h-[34rem] overflow-hidden rounded-2xl">
                        {/* Full screen image */}
                        <div className="absolute inset-0 -z-10">
                            <img
                                src={heroIllustration}
                                alt="Petugas BPRL Makassar melayani konsultasi KKPRL"
                                className="h-full w-full object-cover object-bottom"
                            />

                            {/* Chart-style overlay so text is readable and ties to the coordinate theme */}
                            <div className="absolute inset-0 bg-linear-to-r from-blue-500/60 to-blue-200/50" />
                            <div
                                className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                                    backgroundSize: '48px 48px',
                                }}
                            />
                            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(11,37,69,0.35)]" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex w-full items-center px-6 py-16 sm:px-10">
                            <div className="max-w-xl space-y-6">
                                <div className="w-32">
                                    <img
                                        src={logo}
                                        alt="e-GeRAI – Generate, Asistensi, Informasi"
                                        className="h-auto w-full object-contain object-left"
                                    />
                                </div>

                                <p className="font-mono text-[11px] tracking-[0.25em] text-[#7FD8D4] uppercase">
                                    05°08&apos;S · 119°25&apos;E — BPRL Makassar
                                </p>

                                <h1 className="text-5xl leading-[1.02] font-black tracking-tight text-white sm:text-6xl lg:text-[3.75rem]">
                                    Layanan Digital
                                    <br />
                                    Dokumen KKPRL
                                </h1>

                                <p className="max-w-md text-base leading-relaxed text-slate-100/90 sm:text-lg">
                                    Konsultasi, asistensi teknis, dan penyusunan
                                    dokumen Kesesuaian Kegiatan Pemanfaatan
                                    Ruang Laut — presisi dan resmi.
                                </p>

                                <div className="grid grid-cols-1 items-center gap-3 pt-1 lg:grid-cols-2">
                                    <Link
                                        href="/request-form"
                                        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0B2545]/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98]"
                                    >
                                        Ajukan Konsultasi
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>

                                    <Link
                                        href="/kkprl"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Generate Dokumen
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ═══════════ ALUR LAYANAN — rendered as a waypoint route ═══════════ */}
                <Reveal className="pb-16 lg:pb-24">
                    <div className="mb-12 max-w-xl space-y-3">
                        <p className="font-mono text-[11px] tracking-[0.25em] text-[#0E7C86] uppercase">
                            Rute Layanan
                        </p>
                        <h2 className="text-2xl font-extrabold tracking-tight text-[#0B2545] sm:text-3xl">
                            Alur Layanan
                        </h2>
                        <p className="text-sm text-slate-500 sm:text-base">
                            Empat titik singgah, dari pengajuan hingga
                            penerbitan dokumen.
                        </p>
                    </div>

                    <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        {/* dotted route line, desktop only */}
                        <div
                            className="pointer-events-none absolute top-5 right-[12.5%] left-[12.5%] hidden h-px lg:block"
                            style={{
                                backgroundImage:
                                    'linear-gradient(90deg, #0E7C8666 0 6px, transparent 6px 14px)',
                                backgroundSize: '14px 1px',
                            }}
                        />
                        {steps.map((step) => {
                            const StepIcon = step.icon;
                            return (
                                <div
                                    key={step.title}
                                    className="relative space-y-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#0E7C86]/30 bg-white text-[#0E7C86] shadow-sm">
                                            <StepIcon className="h-4 w-4" />
                                        </span>
                                        <span className="font-mono text-xs font-semibold text-slate-400">
                                            {step.code}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-[#0B2545]">
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
                        <p className="font-mono text-[11px] tracking-[0.25em] text-[#0E7C86] uppercase">
                            Pilih Jalur
                        </p>
                        <h2 className="text-2xl font-extrabold tracking-tight text-[#0B2545] sm:text-3xl">
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
                                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0E7C86]/40 hover:shadow-lg hover:shadow-[#0E7C86]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C86]"
                                >
                                    <div className="flex items-start justify-between">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#0E7C86]/20 bg-[#0E7C86]/10 text-[#0E7C86]">
                                            <ServiceIcon className="h-4 w-4" />
                                        </span>
                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-slate-500">
                                            {service.tag}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-base font-bold text-[#0B2545]">
                                        {service.title}
                                    </h3>
                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                                        {service.desc}
                                    </p>
                                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#0E7C86] transition-all group-hover:gap-2.5">
                                        {service.cta}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </Reveal>

                {/* ═══════════ PENUTUP — styled like an official seal panel ═══════════ */}
                <Reveal className="pb-16 lg:pb-24">
                    <div className="relative overflow-hidden rounded-2xl border border-[#0B2545]/15 bg-white px-7 py-10 text-center shadow-sm sm:px-12">
                        <h2 className="text-xl font-extrabold tracking-tight text-[#0B2545] sm:text-2xl">
                            Siap mengajukan permohonan?
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                            Mulai konsultasi pemanfaatan ruang laut Anda hari
                            ini.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href="/request-form"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                            >
                                Ajukan Permohonan
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C86]"
                            >
                                <MapPin className="h-4 w-4" />
                                Masuk Petugas
                            </Link>
                        </div>
                    </div>
                </Reveal>
            </div>
        </HomeLayout>
    );
}
