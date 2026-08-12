import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import logo_djprl from '/public/logo-djprl.png';
import logo_kkp from '/public/logo-kkp.png';
import logo_klp_white from '/public/logo_klp_putih.png';
import logo_kpl from '/public/logo_klp.png';
import {
    ArrowRight,
    BadgeCheck,
    ChevronDown,
    ClipboardCheck,
    FileCheck2,
    Sparkles,
    Waves,
    ShieldCheck,
    User,
    ArrowUpRight,
    HelpCircle,
    Compass,
} from 'lucide-react';
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
        href: '/login',
        icon: BadgeCheck,
        title: 'Proposal KKPRL',
        desc: 'Formulir penyusunan proposal KKPRL mandiri terstruktur.',
        badge: 'Pemohon',
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
    const [open, setOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    const close = () => setOpen(false);

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
        <header
            className={`fixed z-50 w-full transition-[padding] duration-300 ease-out before:absolute before:inset-0 before:-z-10 before:bg-linear-to-b before:from-blue-400 before:to-transparent before:transition-opacity before:duration-300 before:ease-out before:content-[''] ${scrolled ? 'py-3 before:opacity-100' : 'py-5 before:opacity-0'} `}
        >
            <nav ref={navRef} className={'relative'}>
                {/* Ambient Background Glow */}
                <div
                    className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 ${
                        scrolled ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <div className="absolute -top-16 left-1/3 h-32 w-48 rounded-full bg-blue-500/10 blur-3xl" />
                    <div className="absolute -top-16 right-1/3 h-32 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
                </div>

                <div
                    className={cn(
                        'relative mx-auto flex w-full items-center justify-between px-6 transition-all duration-500 lg:px-8',
                        scrolled ? 'max-w-7xl' : 'max-w-full',
                    )}
                >
                    {/* Brand Logo & Tag */}
                    <Link
                        href="/"
                        onClick={close}
                        className={cn(
                            'group flex items-center gap-3 transition-all',
                            scrolled ? 'h-10' : 'h-12',
                        )}
                    >
                        <img
                            src={logo_djprl}
                            alt="Logo DJPRL"
                            className="h-full object-contain transition-transform group-hover:scale-105"
                        />
                    </Link>

                    {/* Desktop Middle Menu Navigation */}
                    <div className="hidden items-center gap-1.5 rounded-full border border-slate-200/60 bg-slate-100/70 px-2 py-1 backdrop-blur-md md:flex">
                        <Link
                            href="/"
                            onClick={close}
                            className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-white/80 hover:text-blue-600"
                        >
                            Beranda
                        </Link>

                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            aria-controls="nav-mega-menu"
                            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                                open
                                    ? 'bg-white text-blue-600 shadow-xs'
                                    : 'text-slate-700 hover:bg-white/80 hover:text-blue-600'
                            }`}
                        >
                            Layanan Digital
                            <ChevronDown
                                className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? 'rotate-180 text-blue-600' : ''}`}
                            />
                        </button>

                        <Link
                            href="/request-form"
                            onClick={close}
                            className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-white/80 hover:text-blue-600"
                        >
                            Konsultasi
                        </Link>
                    </div>

                    {/* Right Action Cluster */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            onClick={close}
                            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-blue-50/80 hover:text-blue-600 sm:inline-flex"
                        >
                            <User className="h-3.5 w-3.5" />
                            Masuk
                        </Link>

                        <Link href="/request-form" onClick={close}>
                            <Button className="group bbg-blue-600 relative overflow-hidden rounded-full px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30">
                                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                <span className="relative flex items-center gap-1.5">
                                    Ajukan Permohonan{' '}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </Button>
                        </Link>

                        {/* Logo KKP Right */}
                        <div
                            className={cn(
                                'ml-1 hidden shrink-0 items-center border-l border-slate-200/80 pl-3 sm:flex',
                                scrolled ? 'h-8' : 'h-10',
                            )}
                        >
                            <img
                                src={logo_klp_white}
                                alt="Logo KKP"
                                className="h-full object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Mega Dropdown Menu */}
                <div
                    id="nav-mega-menu"
                    className={`absolute inset-x-0 top-full z-40 px-6 pt-3 transition-all duration-300 ease-out lg:px-8 ${
                        open
                            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                            : 'pointer-events-none -translate-y-3 scale-[0.99] opacity-0'
                    }`}
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/90 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.2)] backdrop-blur-2xl">
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3">
                                <span className="flex items-center gap-2 text-[11px] font-black tracking-wider text-slate-400 uppercase">
                                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                                    Katalog Layanan e-GeRAI
                                </span>
                                <span className="text-xs font-medium text-slate-400">
                                    BPRL Makassar • KKP RI
                                </span>
                            </div>

                            <div className="grid gap-0 lg:grid-cols-12">
                                <div className="grid gap-4 p-6 sm:grid-cols-3 lg:col-span-8">
                                    {services.map((s) => (
                                        <Link
                                            key={s.title}
                                            href={s.href}
                                            onClick={close}
                                            className="group/item flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-300 hover:border-blue-200/80 hover:bg-blue-50/60"
                                        >
                                            <div>
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100/80 text-blue-700 transition-all group-hover/item:bg-blue-600 group-hover/item:text-white">
                                                        <s.icon className="h-4 w-4" />
                                                    </div>
                                                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-slate-600 uppercase">
                                                        {s.badge}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-extrabold text-slate-900 transition-colors group-hover/item:text-blue-700">
                                                    {s.title}
                                                </p>
                                                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                                    {s.desc}
                                                </p>
                                            </div>
                                            <span className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 transition-transform group-hover/item:translate-x-1">
                                                Akses Layanan{' '}
                                                <ArrowRight className="h-3 w-3" />
                                            </span>
                                        </Link>
                                    ))}
                                </div>

                                <div className="relative flex flex-col justify-between overflow-hidden bg-linear-to-br from-blue-900 via-blue-950 to-slate-900 p-6 text-white lg:col-span-4">
                                    <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-cyan-400/20 blur-2xl" />

                                    <div>
                                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-cyan-300 backdrop-blur-md">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            BPRL Makassar
                                        </div>
                                        <h4 className="text-base font-extrabold text-white">
                                            Konsultasi Ruang Laut Online
                                        </h4>
                                        <p className="mt-1.5 text-xs leading-relaxed text-blue-200/80">
                                            Layanan asistensi resmi kesesuaian
                                            ruang laut secara aman, cepat, dan
                                            transparan.
                                        </p>
                                    </div>

                                    <Link
                                        href="/request-form"
                                        onClick={close}
                                        className="mt-6"
                                    >
                                        <Button className="group/cta w-full rounded-xl bg-white text-xs font-bold text-blue-900 shadow-lg shadow-black/20 hover:bg-cyan-50">
                                            Mulai Permohonan Now
                                            <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default function HomeLayout({ children }: { children: ReactNode }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-slate-50/70 bg-linear-to-b from-blue-50 via-sky-50/50 to-transparent font-sans selection:bg-blue-500 selection:text-white">
            {/* Global Top Glow Ambient */}
            <div className="pointer-events-none absolute top-0 left-0 -z-10 h-[600px] w-full bg-gradient-to-b from-blue-100/70 via-sky-50/40 to-transparent" />
            <div className="pointer-events-none absolute top-0 right-0 -z-10 h-[550px] w-[550px] translate-x-1/3 -translate-y-1/3 rounded-full bg-cyan-200/30 blur-3xl" />

            <Navbar scrolled={scrolled} />

            <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full flex-1 flex-col px-6 pt-20 pb-16 lg:px-8">
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
                                        e-GeRAI BPRL Makassar
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
                                        href="/login"
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
                                    Ditjen Pengelolaan Ruang Laut
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
                            © {new Date().getFullYear()} e-GeRAI • BPRL
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
