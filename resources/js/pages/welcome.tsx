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
    FileQuestion,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import logo from '/public/egerai-logo.png';
import heroIllustration from '/public/hero-illustration.png';
import HomeLayout from './layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

const tagStyles: Record<string, string> = {
    Publik: 'border-blue-200 bg-blue-50 text-blue-700',
    Mandiri: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Internal: 'border-slate-300 bg-slate-100 text-slate-600',
};

function Reveal({
    children,
    className = '',
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
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
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
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

function SectionHeading({
    index,
    eyebrow,
    title,
    sub,
}: {
    index: string;
    eyebrow: string;
    title: string;
    sub?: string;
}) {
    return (
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
                <p className="font-mono text-[11px] font-semibold tracking-[0.25em] text-blue-600 uppercase">
                    {index} · {eyebrow}
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {title}
                </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500">
                {sub ? sub : ''}
            </p>
        </div>
    );
}

export default function Welcome() {
    return (
        <HomeLayout>
            <div className="relative w-full text-slate-800">
                <div className="mb-24 px-6 pt-10 lg:px-14">
                    <section className="relative isolate min-h-80 overflow-hidden rounded-2xl">
                        {/* Full screen image */}
                        <div className="absolute inset-0 -z-10">
                            <img
                                src={heroIllustration}
                                alt="Petugas BPRL Makassar melayani konsultasi KKPRL"
                                className="h-full w-full object-cover object-bottom"
                            />

                            {/* Optional overlay so text is easier to read */}
                            <div className="absolute inset-0 bg-linear-to-r from-white/70 to-blue-500/50" />

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

                                <div className="flex max-w-lg flex-col items-center gap-4 lg:flex-row">
                                    <Link href="/request-form">
                                        <Button className="group inline-flex w-full items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:scale-[0.98]">
                                            Ajukan Konsultasi
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        </Button>
                                    </Link>
                                    <Dialog>
                                        <DialogTrigger
                                            render={
                                                <Button className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50">
                                                    <FileText className="h-4 w-4" />
                                                    Isi Proposal KKPRL
                                                </Button>
                                            }
                                        />
                                        <DialogContent className="w-[95vw] max-w-5xl overflow-hidden border-0 p-0">
                                            <iframe
                                                src="https://egeraibprlmakassar-production.up.railway.app"
                                                className="h-[85vh] w-full border-0"
                                                title="Asisten Proposal KKPRL"
                                                allow="clipboard-write" // Optional: allows the iframe to copy/paste
                                            />
                                        </DialogContent>
                                    </Dialog>
                                    <Dialog>
                                        <DialogTrigger
                                            render={
                                                <Button className="">
                                                    <FileQuestion className="h-4 w-4" />
                                                    FAQ
                                                </Button>
                                            }
                                        />
                                        <DialogContent className="w-[95vw] max-w-5xl overflow-hidden border-0 p-0">
                                            <iframe
                                                src="https://egeraibprlmakassar-production.up.railway.app/asisten"
                                                className="h-[85vh] w-full border-0"
                                                title="Asisten Proposal KKPRL"
                                                allow="clipboard-write" // Optional: allows the iframe to copy/paste
                                            />
                                        </DialogContent>
                                    </Dialog>
                                    {/* <Link
                                        href="/kkprl-proposal"
                                        className="inline-flex w-full items-center gap-2 rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Isi Proposal KKPRL
                                    </Link> */}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ═══════════ ALUR LAYANAN ═══════════ */}
                <Reveal className="pb-20 lg:pb-28">
                    <SectionHeading
                        index="01"
                        eyebrow="Alur Layanan"
                        title="Dari pengajuan hingga penerbitan"
                        sub="Empat langkah, satu alur yang jelas — tanpa berkas fisik."
                    />

                    <ol className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-4">
                        {steps.map((step, i) => {
                            const StepIcon = step.icon;
                            return (
                                <li
                                    key={step.title}
                                    className="group relative border-t border-slate-200 pt-6 transition-colors duration-300 hover:border-blue-400"
                                >
                                    {/* timeline node */}
                                    <span className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full border-2 border-blue-600 bg-white transition-colors duration-300 group-hover:bg-blue-600" />

                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-medium tracking-widest text-slate-400">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 transition-colors duration-300 group-hover:border-blue-200 group-hover:bg-blue-50">
                                            <StepIcon className="h-4 w-4" />
                                        </span>
                                    </div>

                                    <h3 className="mt-4 text-base font-bold text-slate-900">
                                        {step.title}
                                    </h3>
                                    <p className="mt-1.5 max-w-[17rem] text-xs leading-relaxed text-slate-500">
                                        {step.desc}
                                    </p>
                                </li>
                            );
                        })}
                    </ol>
                </Reveal>

                {/* ═══════════ LAYANAN ═══════════ */}
                <Reveal className="pb-20 lg:pb-28">
                    <SectionHeading
                        index="02"
                        eyebrow="Layanan"
                        title="Pilih jalur pengajuan Anda"
                    />

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="divide-y divide-slate-200">
                            {services.map((service, i) => {
                                const ServiceIcon = service.icon;
                                return (
                                    <Link
                                        key={service.title}
                                        href={service.href}
                                        className="group relative flex flex-col gap-5 px-6 py-8 transition-colors duration-300 hover:bg-blue-50/40 sm:flex-row sm:items-center sm:gap-8 sm:px-8"
                                    >
                                        {/* accent bar */}
                                        <span className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-blue-600 transition-transform duration-300 group-hover:scale-y-100 motion-reduce:transition-none" />

                                        {/* index + icon */}
                                        <div className="flex items-center gap-4 sm:w-24 sm:shrink-0">
                                            <span className="font-mono text-xs text-slate-300 transition-colors group-hover:text-blue-500">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                                                <ServiceIcon className="h-5 w-5" />
                                            </span>
                                        </div>

                                        {/* content */}
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {service.title}
                                                </h3>
                                                <span
                                                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${tagStyles[service.tag]}`}
                                                >
                                                    {service.tag}
                                                </span>
                                            </div>
                                            <p className="max-w-xl text-sm leading-relaxed text-slate-500">
                                                {service.desc}
                                            </p>
                                        </div>

                                        {/* route + cta */}
                                        <div className="flex items-center justify-end gap-4 sm:flex-col sm:items-end sm:gap-2">
                                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600">
                                                {service.cta}
                                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </Reveal>

                {/* ═══════════ PENUTUP ═══════════ */}
                <Reveal className="pb-20 lg:pb-28">
                    <section className="relative overflow-hidden rounded-2xl bg-slate-900 px-7 py-12 sm:px-12 lg:px-16 lg:py-16">
                        {/* sonar rings — subtle nautical motif */}
                        <div className="pointer-events-none absolute -top-28 -right-28 h-80 w-80 rounded-full border border-white/10" />
                        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full border border-white/10" />
                        <div className="pointer-events-none absolute top-8 right-8 h-20 w-20 rounded-full border border-white/10" />

                        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-lg space-y-3">
                                <p className="font-mono text-[11px] font-semibold tracking-[0.25em] text-blue-300 uppercase">
                                    03 · Mulai
                                </p>
                                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                    Siap mengajukan permohonan?
                                </h2>
                                <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                                    Mulai konsultasi pemanfaatan ruang laut Anda
                                    hari ini — seluruh proses berjalan daring.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                                <Link
                                    href="/request-form"
                                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition-colors hover:bg-blue-400"
                                >
                                    Ajukan Permohonan
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
                                >
                                    Masuk Petugas
                                </Link>
                            </div>
                        </div>
                    </section>
                </Reveal>
            </div>
        </HomeLayout>
    );
}
