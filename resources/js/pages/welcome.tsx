import { Link } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRight,
    Zap,
    UserRound,
    ClipboardCheck,
    FileCheck2,
    BadgeCheck,
    FileText,
    FileUp,
    MapPin,
    PenTool,
    SearchCheck,
} from 'lucide-react';
import { useRef } from 'react';
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
        icon: PenTool,
        tag: 'PEMOHON',
        title: 'Unggah Tanda Tangan',
        desc: 'Unggah atau perbarui tanda tangan untuk berkas permohonan Anda tanpa perlu login.',
        href: '/signature-upload',
        cta: 'Upload Tanda Tangan',
    },
    {
        icon: FileText,
        tag: 'PEMOHON',
        title: 'Cek Berita Acara',
        desc: 'Tinjau isi Berita Acara konsultasi yang sudah final dan unduh PDF resminya tanpa login.',
        href: '/cek-berita-acara',
        cta: 'Cek Sekarang',
    },
    {
        icon: FileUp,
        tag: 'MANDIRI',
        title: 'Proposal KKPRL',
        desc: 'Unggah Draft Proposal & Laporan Hidro-Oseanografi (atau isi manual), sistem ekstrak data & susun dokumen final otomatis.',
        href: '/egerai',
        cta: 'Isi Proposal',
    },
    {
        icon: SearchCheck,
        tag: 'INTERNAL',
        title: 'Analisis Proposal',
        desc: 'Unggah Proposal PKKPRL yang sudah jadi beserta laporan pembanding, lalu dapatkan pemeriksaan konsistensi datanya.',
        href: '/analisis-proposal',
        cta: 'Mulai Analisis',
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

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                  */
/* ------------------------------------------------------------------ */
const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1,
        },
    },
};

const heroChildVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
};

const sectionScrollVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
};

const cardStaggerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const cardItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
};

export default function Welcome() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start end', 'end start'],
    });

    const horizontalX = useTransform(
        scrollYProgress,
        [0.1, 0.8],
        ['0%', '-65%'],
    );

    return (
        <HomeLayout>
            <div className="relative w-full text-slate-800">
                <div className="px-6 pt-10 pb-24 lg:px-14">
                    <motion.section
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="relative isolate min-h-[34rem] overflow-hidden rounded-2xl"
                    >
                        {/* Full screen image with subtle zoom reveal */}
                        <motion.div
                            initial={{ scale: 1.08 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            className="absolute inset-0 -z-10"
                        >
                            <img
                                src={heroIllustration}
                                alt="Petugas BPRL Makassar melayani konsultasi KKPRL"
                                className="h-full w-full object-cover object-bottom"
                            />

                            {/* Chart-style overlay so text is readable and ties to the coordinate theme */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/70 via-blue-500/50 to-blue-200/40" />
                            <div
                                className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                                    backgroundSize: '48px 48px',
                                }}
                            />
                            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(11,37,69,0.35)]" />
                        </motion.div>

                        {/* Hero Content Stagger */}
                        <motion.div
                            variants={heroContainerVariants}
                            initial="hidden"
                            animate="visible"
                            className="relative z-10 flex w-full items-center px-6 py-16 sm:px-10"
                        >
                            <div className="max-w-xl space-y-6">
                                <motion.div
                                    variants={heroChildVariants}
                                    className="w-32"
                                >
                                    <img
                                        src={logo}
                                        alt="e-GeRAI – Generate, Asistensi, Informasi"
                                        className="h-auto w-full object-contain object-left"
                                    />
                                </motion.div>

                                <motion.p
                                    variants={heroChildVariants}
                                    className="font-mono text-[11px] tracking-[0.25em] text-[#7FD8D4] uppercase"
                                >
                                    05°08&apos;S · 119°25&apos;E — BPRL Makassar
                                </motion.p>

                                <motion.h1
                                    variants={heroChildVariants}
                                    className="text-5xl leading-[1.02] font-black tracking-tight text-white sm:text-6xl lg:text-[3.75rem]"
                                >
                                    e-GerAI
                                    <br />
                                    Layanan KKPRL
                                </motion.h1>

                                <motion.p
                                    variants={heroChildVariants}
                                    className="max-w-md text-base leading-relaxed text-slate-100/90 sm:text-lg"
                                >
                                    Konsultasi, asistensi teknis, dan penyusunan
                                    dokumen Kesesuaian Kegiatan Pemanfaatan
                                    Ruang Laut — presisi dan resmi.
                                </motion.p>

                                <motion.div
                                    variants={heroChildVariants}
                                    className="grid grid-cols-1 items-center gap-3 pt-1 lg:grid-cols-2"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Link
                                            href="/request-form"
                                            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0B2545]/30 transition-all hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                        >
                                            Ajukan Konsultasi
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <a
                                            href="https://egeraibprlmakassar-production.up.railway.app"
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Generate Dokumen
                                        </a>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.section>
                </div>

                {/* ═══════════ ALUR LAYANAN ═══════════ */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={sectionScrollVariants}
                    className="mx-4 pb-12 sm:mx-10 sm:pb-16 lg:mx-24 lg:pb-24"
                >
                    <div className="mb-8 max-w-xl space-y-2 sm:mb-12 sm:space-y-3">
                        <p className="font-mono text-[10px] tracking-[0.25em] text-blue-600 uppercase sm:text-[11px]">
                            Rute Layanan
                        </p>
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Alur Layanan
                        </h2>
                        <p className="text-xs text-slate-500 sm:text-base">
                            Empat titik singgah, dari pengajuan hingga
                            penerbitan dokumen.
                        </p>
                    </div>

                    <motion.div
                        variants={cardStaggerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
                    >
                        {steps.map((step, idx) => {
                            const StepIcon = step.icon;

                            return (
                                <motion.div
                                    key={step.title}
                                    variants={cardItemVariants}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    className="group relative flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 sm:p-6"
                                >
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                                <StepIcon className="h-4.5 w-4.5" />
                                            </span>
                                            <span className="rounded-md border border-slate-200/60 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-400">
                                                {step.code}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900">
                                                {step.title}
                                            </h3>
                                            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:mt-1.5">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-1 font-mono text-[10px] text-slate-400">
                                        Langkah {idx + 1} dari 4
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </motion.div>

                {/* ═══════════ LAYANAN ═══════════ */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={sectionScrollVariants}
                    className="mx-4 pb-12 sm:mx-10 sm:pb-16 lg:mx-24 lg:pb-24"
                >
                    <div className="mb-8 max-w-xl space-y-2 sm:mb-10 sm:space-y-3">
                        <p className="font-mono text-[10px] tracking-[0.25em] text-blue-600 uppercase sm:text-[11px]">
                            Pilih Jalur
                        </p>
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Layanan
                        </h2>
                        <p className="text-xs text-slate-500 sm:text-base">
                            Pilih layanan sesuai kebutuhan Anda.
                        </p>
                    </div>

                    <motion.div
                        variants={cardStaggerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
                    >
                        {services.map((service) => {
                            const ServiceIcon = service.icon;

                            return (
                                <motion.div
                                    key={service.title}
                                    variants={cardItemVariants}
                                >
                                    <Link
                                        href={service.href}
                                        className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 sm:p-6"
                                    >
                                        <div className="flex items-start justify-between">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110">
                                                <ServiceIcon className="h-4 w-4" />
                                            </span>
                                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-slate-500">
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
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </motion.div>

                {/* ═══════════ CTA UPLOAD TANDA TANGAN ═══════════ */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={sectionScrollVariants}
                    className="mx-4 pb-12 sm:mx-10 sm:pb-16 lg:mx-24"
                >
                    <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-6 text-white shadow-xl shadow-blue-500/10 sm:p-10">
                        <div className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
                        <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                            <div className="max-w-xl space-y-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-200 backdrop-blur-md">
                                    <PenTool className="h-3.5 w-3.5" /> Khusus
                                    Pemohon
                                </span>
                                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                                    Sudah mengajukan permohonan?
                                </h2>
                                <p className="text-xs leading-relaxed text-blue-100 sm:text-sm">
                                    Lengkapi atau perbarui tanda tangan untuk
                                    berkas permohonan konsultasi Anda secara
                                    daring tanpa perlu membuat akun atau login.
                                </p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full shrink-0 lg:w-auto"
                            >
                                <Link
                                    href="/signature-upload"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-blue-900 shadow-lg transition-all hover:bg-cyan-50 hover:shadow-cyan-500/20 sm:w-auto"
                                >
                                    <PenTool className="h-4 w-4 text-blue-600" />
                                    Unggah Tanda Tangan Sekarang
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════ PENUTUP ═══════════ */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={sectionScrollVariants}
                    className="mx-4 pb-12 sm:mx-10 sm:pb-16 lg:mx-24 lg:pb-24"
                >
                    <motion.div
                        whileHover={{ scale: 1.005 }}
                        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center shadow-xs sm:px-12 sm:py-10"
                    >
                        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                            Siap mengajukan permohonan?
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500 sm:text-sm">
                            Mulai konsultasi pemanfaatan ruang laut Anda hari
                            ini.
                        </p>
                        <div className="mt-6 flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    href="/request-form"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700"
                                >
                                    Ajukan Permohonan
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    href="/login"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Masuk Petugas
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </HomeLayout>
    );
}
