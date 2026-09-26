import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    ArrowUpRight,
    BadgeCheck,
    ChevronDown,
    ClipboardCheck,
    FileCheck2,
    FileSearch,
    Menu,
    MessageCircle,
    PenTool,
    SearchCheck,
    ShieldCheck,
    User,
    Waves,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import logo_djprl from '/public/logo-egerai-icon.png';
import logo_beneran_djprl from '/public/logo-djprl.png';
import logo_klp from '/public/logo_klp.png';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const services = [
    {
        href: '/request-form',
        icon: ClipboardCheck,
        title: 'Permohonan Konsultasi',
        desc: 'Ajukan permohonan & asistensi teknis pemanfaatan ruang laut secara daring.',
        badge: 'Publik',
    },
    {
        href: '/signature-upload',
        icon: PenTool,
        title: 'Unggah Tanda Tangan',
        desc: 'Unggah atau perbarui tanda tangan berkas permohonan tanpa akun login.',
        badge: 'Pemohon',
    },
    {
        href: '/cek-berita-acara',
        icon: FileSearch,
        title: 'Cek Berita Acara',
        desc: 'Tinjau isi Berita Acara final & unduh PDF resminya tanpa login.',
        badge: 'Pemohon',
    },
    {
        href: '/kkprl',
        icon: BadgeCheck,
        title: 'Proposal KKPRL',
        desc: 'Formulir penyusunan proposal KKPRL mandiri terstruktur.',
        badge: 'Mandiri',
    },
    {
        href: '/analisis-proposal',
        icon: SearchCheck,
        title: 'Analisis Proposal',
        desc: 'Periksa konsistensi Proposal PKKPRL terhadap laporan pembanding & kelola riwayat hasil analisis.',
        badge: 'Internal',
    },
    {
        href: '/login',
        icon: FileCheck2,
        title: 'Portal Petugas BPRL',
        desc: 'Modul verifikasi, penelaahan teknis & penerbitan dokumen resmi.',
        badge: 'Internal',
    },
];

function Navbar({ scrolled }: { scrolled: boolean }) {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    const close = () => {
        setOpen(false);
        setMobileOpen(false);
    };

    useEffect(() => {
        const onPointerDown = (e: MouseEvent | TouchEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('touchstart', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('touchstart', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    return (
        <header className="fixed inset-x-0 top-0 z-50">
            {/* Coordinate strip — collapses away once scrolled to keep the bar compact */}
            <div
                className={cn(
                    'hidden overflow-hidden border-b border-slate-900/5 bg-[#0B1F3A] text-white/55 transition-[max-height,opacity] duration-300 lg:block',
                    scrolled ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100',
                )}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 font-mono text-[10px] tracking-wide lg:px-8">
                    <span>05°08&prime;S 119°25&prime;E — MAKASSAR</span>
                    <span>DITJEN PENATAAN RUANG LAUT · KKP RI</span>
                </div>
            </div>

            <nav
                ref={navRef}
                className={cn(
                    'relative border-b transition-all duration-300',
                    scrolled
                        ? 'border-slate-200/80 bg-white/90 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] backdrop-blur-xl'
                        : 'border-white/60 bg-white/70 backdrop-blur-md',
                )}
            >
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-8">
                    {/* logo_klp is already a finished circular seal — ring +
                        Garuda emblem + the ministry name wrapped around its
                        own edge. Boxing it in another plate doubles the
                        framing and, shrunk to icon size, crushes that ring
                        detail into mush — that was the actual problem, not
                        the lack of a container. Letting it read at size,
                        with a shadow that hugs its own silhouette
                        (drop-shadow, not a boxed one), is what makes it
                        look like a seal again. Real link to the ministry's
                        site, so the hover lift means something, same as
                        the DJPRL mark's hover right after it. */}
                    {/* Brand */}
                    <Link
                        href="/"
                        onClick={close}
                        className="group flex items-center gap-3"
                    >
                        <img
                            src={logo_klp}
                            alt="Logo Kementerian Kelautan dan Perikanan"
                            className="h-12 w-12 object-contain drop-shadow-[0_3px_6px_rgba(18,58,99,0.3)] transition-transform duration-200 group-hover:scale-110"
                        />
                        <img
                            src={logo_beneran_djprl}
                            alt="Logo DJPRL"
                            className="h-7 object-contain transition-transform group-hover:scale-105"
                        />
                        <div className="hidden border-l border-slate-200 pl-3 sm:block">
                            <p className="text-sm font-semibold text-slate-900">
                                e-GerAI
                            </p>
                            <p className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                                BPRL Makassar
                            </p>
                        </div>
                    </Link>

                    {/* Desktop nav — soft pill links matching the rest of the site */}
                    <div className="hidden items-center gap-1 md:flex">
                        <Link
                            href="/"
                            onClick={close}
                            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                        >
                            Beranda
                        </Link>

                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            aria-controls="nav-mega-menu"
                            className={cn(
                                'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                                open
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700',
                            )}
                        >
                            Layanan Digital
                            <ChevronDown
                                className={cn(
                                    'h-3.5 w-3.5 transition-transform duration-300',
                                    open && 'rotate-180',
                                )}
                            />
                        </button>

                        <Link
                            href="/request-form"
                            onClick={close}
                            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                        >
                            Konsultasi
                        </Link>

                        <Link
                            href="/asisten"
                            onClick={close}
                            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                        >
                            Asisten AI
                        </Link>
                    </div>

                    {/* Right cluster */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/login"
                            onClick={close}
                            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
                        >
                            <User className="h-3.5 w-3.5" />
                            {auth.user ? auth.user.name : 'Masuk'}
                        </Link>

                        <Link
                            href="/request-form"
                            onClick={close}
                            className="hidden sm:block"
                        >
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30">
                                Ajukan Permohonan
                                <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="inline-flex items-center justify-center rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
                            aria-label="Buka menu navigasi"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Desktop mega menu */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            id="nav-mega-menu"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{
                                duration: 0.18,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="absolute inset-x-0 top-full z-40 hidden px-6 pt-3 md:block lg:px-8"
                        >
                            <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-2xl shadow-slate-900/10">
                                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3">
                                    <span className="font-mono text-[10.5px] font-semibold tracking-wider text-blue-600 uppercase">
                                        Katalog Layanan e-GeRAI
                                    </span>
                                    <span className="text-xs font-medium text-slate-500">
                                        BPRL Makassar &bull; KKP RI
                                    </span>
                                </div>

                                <div className="grid gap-0 lg:grid-cols-12">
                                    <div className="grid divide-x divide-y divide-slate-100 sm:grid-cols-2 lg:col-span-8 lg:divide-y-0">
                                        {services.map((s) => (
                                            <Link
                                                key={s.title}
                                                href={s.href}
                                                onClick={close}
                                                className="group/item flex flex-col justify-between p-5 transition-colors hover:bg-blue-50/60"
                                            >
                                                <div>
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-colors group-hover/item:border-blue-200 group-hover/item:bg-blue-100">
                                                            <s.icon className="h-4 w-4" />
                                                        </div>
                                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[9.5px] font-semibold tracking-wider text-slate-500 uppercase">
                                                            {s.badge}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {s.title}
                                                    </p>
                                                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                                        {s.desc}
                                                    </p>
                                                </div>
                                                <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 transition-transform group-hover/item:translate-x-1">
                                                    Akses Layanan
                                                    <ArrowRight className="h-3 w-3" />
                                                </span>
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="relative flex flex-col justify-between bg-gradient-to-br from-blue-600 via-blue-700 to-[#0B1F3A] p-6 text-white lg:col-span-4">
                                        <div>
                                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 font-mono text-[10.5px] font-semibold tracking-wide uppercase backdrop-blur-sm">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                BPRL Makassar
                                            </div>
                                            <h4 className="text-base font-semibold text-white">
                                                Konsultasi Ruang Laut Online
                                            </h4>
                                            <p className="mt-1.5 text-xs leading-relaxed text-white/70">
                                                Layanan asistensi resmi
                                                kesesuaian ruang laut secara
                                                aman, cepat, dan transparan.
                                            </p>
                                        </div>

                                        <Link
                                            href="/request-form"
                                            onClick={close}
                                            className="mt-6"
                                        >
                                            <span className="group/cta flex w-full items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50">
                                                Mulai Permohonan
                                                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Mobile navigation drawer */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-sm"
                >
                    <SheetHeader className="border-b border-slate-100 pb-4">
                        <SheetTitle className="font-serif text-base">
                            e-GeRAI
                        </SheetTitle>
                        <SheetDescription>
                            Layanan Digital KKPRL — BPRL Makassar
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-1 flex-col overflow-y-auto p-4">
                        <Link
                            href="/"
                            onClick={close}
                            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50"
                        >
                            Beranda
                        </Link>
                        <Link
                            href="/request-form"
                            onClick={close}
                            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50"
                        >
                            Konsultasi
                        </Link>
                        <Link
                            href="/asisten"
                            onClick={close}
                            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50"
                        >
                            Asisten AI
                        </Link>
                        <Link
                            href="/login"
                            onClick={close}
                            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50"
                        >
                            {auth.user ? auth.user.name : 'Masuk Petugas BPRL'}
                        </Link>

                        <p className="mt-4 px-3 text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">
                            Layanan Digital
                        </p>
                        <div className="mt-1 space-y-1">
                            {services.map((s) => (
                                <Link
                                    key={s.title}
                                    href={s.href}
                                    onClick={close}
                                    className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-blue-50"
                                >
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                                        <s.icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-slate-900">
                                            {s.title}
                                        </div>
                                        <div className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                            {s.desc}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 p-4">
                        <Link href="/request-form" onClick={close}>
                            <span className="flex w-full items-center justify-center gap-1.5 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700">
                                Ajukan Permohonan
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </Link>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}

export default function HomeLayout({ children }: { children: ReactNode }) {
    const [scrolled, setScrolled] = useState(false);
    const [showAIButton, setShowAIButton] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const isAssistantPage = window.location.pathname.includes('/asisten');
        setShowAIButton(!isAssistantPage);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-slate-50/70 bg-linear-to-b from-blue-300/40 via-sky-50/50 to-transparent font-sans selection:bg-blue-500 selection:text-white">
            {/* Global Top Glow Ambient */}
            <div className="pointer-events-none absolute top-0 left-0 -z-10 h-[600px] w-full bg-gradient-to-b from-blue-100/70 via-sky-50/40 to-transparent" />
            <div className="pointer-events-none absolute top-0 right-0 -z-10 h-[550px] w-[550px] translate-x-1/3 -translate-y-1/3 rounded-full bg-cyan-200/30 blur-3xl" />

            <Navbar scrolled={scrolled} />

            {/* Floating "Tanya AI" Button */}
            {showAIButton && (
                <Link
                    href="/asisten"
                    className="group fixed right-6 bottom-6 z-50 flex items-center justify-center gap-2 overflow-hidden rounded-full bg-linear-to-br from-emerald-500 via-amber-400 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:shadow-xl hover:shadow-blue-600/40 md:right-8 md:bottom-8 md:h-auto md:w-auto md:justify-start"
                >
                    <MessageCircle />
                    <span className="hidden sm:inline">Tanya Navi</span>
                    <div className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full bg-[#F2A83B] opacity-75" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#F2A83B]" />
                </Link>
            )}

            <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full flex-1 flex-col px-6 pt-20 pb-16 lg:px-8 lg:pt-24">
                {children}
            </main>

            {/* Premium Footer */}
            <footer className="mt-auto border-t border-slate-200/80 bg-white/90 pt-10 pb-8 text-slate-600 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 border-b border-slate-100 pb-10 md:grid-cols-12">
                        {/* Col 1: Brand Info */}
                        <div className="space-y-4 md:col-span-6">
                            <div className="flex items-center gap-3">
                                <img
                                    src={logo_djprl}
                                    alt="Logo DJPRL"
                                    className="h-10 object-contain"
                                />
                                <div className="border-l border-slate-300 pl-3">
                                    <p className="text-sm font-black text-slate-900">
                                        e-GerAI BPRL Makassar
                                    </p>
                                    <p className="text-xs font-semibold text-blue-600">
                                        Generate • Asistensi • Informasi
                                    </p>
                                </div>
                            </div>
                            <p className="max-w-md text-xs leading-relaxed text-slate-500">
                                Portal Layanan Digital Kesesuaian Kegiatan
                                Pemanfaatan Ruang Laut (KKPRL) di wilayah kerja
                                Balai Penataan Ruang Laut Makassar, Ditjen
                                Pengelolaan Ruang Laut, KKP RI.
                            </p>
                        </div>

                        {/* Col 2: Quick Links */}
                        <div className="space-y-3 md:col-span-3">
                            <p className="text-xs font-black tracking-wider text-slate-900 uppercase">
                                Tautan Layanan
                            </p>
                            <ul className="space-y-2 text-xs font-semibold text-slate-600">
                                <li>
                                    <Link
                                        href="/request-form"
                                        className="flex items-center gap-1.5 transition-colors hover:text-blue-600"
                                    >
                                        <ArrowRight className="h-3 w-3 text-blue-500" />
                                        Permohonan Konsultasi
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/kkprl"
                                        className="flex items-center gap-1.5 transition-colors hover:text-blue-600"
                                    >
                                        <ArrowRight className="h-3 w-3 text-blue-500" />
                                        Proposal KKPRL
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-1.5 transition-colors hover:text-blue-600"
                                    >
                                        <ArrowRight className="h-3 w-3 text-blue-500" />
                                        Masuk Petugas BPRL
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Institutional Info */}
                        <div className="space-y-3 md:col-span-3">
                            <p className="text-xs font-black tracking-wider text-slate-900 uppercase">
                                Instansi Pembina
                            </p>
                            <div className="space-y-1.5 text-xs text-slate-500">
                                <p className="font-bold text-slate-800">
                                    Ditjen Penataan Ruang Laut
                                </p>
                                <p>Kementerian Kelautan dan Perikanan RI</p>
                                <p className="flex items-center gap-1 pt-1 text-[11px] font-semibold text-blue-600">
                                    <Waves className="h-3 w-3" />
                                    Wilayah Penataan Ruang Laut
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex flex-col items-center justify-between gap-4 pt-6 text-[11px] text-slate-500 sm:flex-row">
                        <span>
                            © {new Date().getFullYear()} e-GerAI • BPRL
                            Makassar. Seluruh Hak Cipta Dilindungi.
                        </span>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={scrollToTop}
                                className="flex items-center gap-1 font-bold text-blue-600 transition-colors hover:text-blue-800"
                            >
                                Ke Atas ↑
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
