import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { ReactNode, useEffect, useRef, useState } from "react";
import logo_djprl from "/public/logo-djprl.png";
import logo_kkp from "/public/logo-kkp.png";
import logo_kpl from "/public/logo_klp.png"
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
    Compass
} from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
    {
        href: "/request-form",
        icon: ClipboardCheck,
        title: "Permohonan Konsultasi",
        desc: "Ajukan permohonan & asistensi teknis pemanfaatan ruang laut secara daring.",
        badge: "Publik",
    },
    {
        href: "/kkprl-proposal",
        icon: BadgeCheck,
        title: "Proposal KKPRL",
        desc: "Formulir penyusunan proposal KKPRL mandiri terstruktur.",
        badge: "Pemohon",
    },
    {
        href: "/login",
        icon: FileCheck2,
        title: "Portal Petugas BPRL",
        desc: "Modul verifikasi, penelaahan teknis & penerbitan dokumen resmi.",
        badge: "Internal",
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
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("touchstart", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("touchstart", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    return (
        <nav
            ref={navRef}
            className={`fixed w-full z-50 transition-all duration-500 ease-out ${scrolled
                    ? "bg-white/80 backdrop-blur-2xl backdrop-saturate-150 border-b border-slate-200/80 py-3 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.12)]"
                    : "bg-transparent py-5 border-b border-transparent"
                }`}
        >
            {/* Ambient Background Glow */}
            <div
                className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"
                    }`}
            >
                <div className="absolute -top-16 left-1/3 h-32 w-48 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute -top-16 right-1/3 h-32 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
                {/* Brand Logo & Tag */}
                <Link href="/" onClick={close} className={cn("flex items-center gap-3 group transition-all", scrolled ? "h-10" : "h-12")}>
                    <img src={logo_djprl} alt="Logo DJPRL" className="h-full object-contain group-hover:scale-105 transition-transform" />
                    <div className="flex flex-col justify-center border-l border-slate-300/80 pl-3 w-full h-full">
                        <img src={logo_kpl} alt="Logo KPL" className="h-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                </Link>

                {/* Desktop Middle Menu Navigation */}
                <div className="hidden md:flex items-center gap-1.5 bg-slate-100/70 border border-slate-200/60 rounded-full px-2 py-1 backdrop-blur-md">
                    <Link
                        href="/"
                        onClick={close}
                        className="text-xs font-bold text-slate-700 hover:text-blue-600 px-4 py-1.5 rounded-full hover:bg-white/80 transition-all"
                    >
                        Beranda
                    </Link>

                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls="nav-mega-menu"
                        className={`flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full transition-all ${open
                                ? "text-blue-600 bg-white shadow-xs"
                                : "text-slate-700 hover:text-blue-600 hover:bg-white/80"
                            }`}
                    >
                        Layanan Digital
                        <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "rotate-180 text-blue-600" : ""}`}
                        />
                    </button>

                    <Link
                        href="/request-form"
                        onClick={close}
                        className="text-xs font-bold text-slate-700 hover:text-blue-600 px-4 py-1.5 rounded-full hover:bg-white/80 transition-all"
                    >
                        Konsultasi
                    </Link>
                </div>

                {/* Right Action Cluster */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        onClick={close}
                        className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-50/80 transition-all"
                    >
                        <User className="w-3.5 h-3.5" />
                        Masuk
                    </Link>

                    <Link href="/request-form" onClick={close}>
                        <Button className="relative overflow-hidden group bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-600/30 text-white shadow-md shadow-blue-600/20 rounded-full px-5 py-2 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5">
                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            <span className="relative flex items-center gap-1.5">
                                Ajukan Permohonan <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                        </Button>
                    </Link>

                    {/* Logo KKP Right */}
                    <div className={cn("hidden sm:flex items-center shrink-0 border-l border-slate-200/80 pl-3 ml-1", scrolled ? "h-8" : "h-10")}>
                        <img
                            src={logo_kkp}
                            alt="Logo KKP"
                            className="h-full object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* Mega Dropdown Menu */}
            <div
                id="nav-mega-menu"
                className={`absolute top-full inset-x-0 z-40 px-6 lg:px-8 pt-3 transition-all duration-300 ease-out ${open
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                        : "opacity-0 -translate-y-3 scale-[0.99] pointer-events-none"
                    }`}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.2)] overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                Katalog Layanan e-GeRAI
                            </span>
                            <span className="text-xs text-slate-400 font-medium">BPRL Makassar • KKP RI</span>
                        </div>

                        <div className="grid lg:grid-cols-12 gap-0">
                            <div className="lg:col-span-8 p-6 grid sm:grid-cols-3 gap-4">
                                {services.map((s) => (
                                    <Link
                                        key={s.title}
                                        href={s.href}
                                        onClick={close}
                                        className="group/item flex flex-col justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/60 hover:border-blue-200/80 transition-all duration-300"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">
                                                    <s.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                                                    {s.badge}
                                                </span>
                                            </div>
                                            <p className="text-sm font-extrabold text-slate-900 group-hover/item:text-blue-700 transition-colors">
                                                {s.title}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                {s.desc}
                                            </p>
                                        </div>
                                        <span className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1 group-hover/item:translate-x-1 transition-transform">
                                            Akses Layanan <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </Link>
                                ))}
                            </div>

                            <div className="lg:col-span-4 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 p-6 text-white flex flex-col justify-between relative overflow-hidden">
                                <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-cyan-400/20 blur-2xl" />

                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-cyan-300 backdrop-blur-md mb-3">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        BPRL Makassar
                                    </div>
                                    <h4 className="text-base font-extrabold text-white">Konsultasi Ruang Laut Online</h4>
                                    <p className="text-xs text-blue-200/80 mt-1.5 leading-relaxed">
                                        Layanan asistensi resmi kesesuaian ruang laut secara aman, cepat, dan transparan.
                                    </p>
                                </div>

                                <Link href="/request-form" onClick={close} className="mt-6">
                                    <Button className="w-full bg-white text-blue-900 hover:bg-cyan-50 font-bold rounded-xl text-xs shadow-lg shadow-black/20 group/cta">
                                        Mulai Permohonan Now
                                        <ArrowUpRight className="ml-1 w-3.5 h-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default function HomeLayout({ children }: { children: ReactNode }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-slate-50/70 relative overflow-x-hidden selection:bg-blue-500 selection:text-white font-sans  bg-linear-to-b from-blue-50 via-sky-50/50 to-transparent">
            {/* Global Top Glow Ambient */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-100/70 via-sky-50/40 to-transparent -z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-cyan-200/30 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

            <Navbar scrolled={scrolled} />

            <main className="pt-20 pb-16 flex flex-col flex-1 w-full min-h-[calc(100vh-80px)] mx-auto    px-6 lg:px-8">
                {children}
            </main>

            {/* Premium Footer */}
            <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-md mt-auto pt-10 pb-8 text-slate-600">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-100">
                        {/* Col 1: Brand Info */}
                        <div className="md:col-span-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <img src={logo_djprl} alt="Logo DJPRL" className="h-10 object-contain" />
                                <div className="border-l border-slate-300 pl-3">
                                    <p className="text-sm font-black text-slate-900">e-GeRAI BPRL Makassar</p>
                                    <p className="text-xs text-blue-600 font-semibold">Generate • Asistensi • Informasi</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                                Portal Layanan Digital Kesesuaian Kegiatan Pemanfaatan Ruang Laut (KKPRL) di wilayah kerja Balai Penataan Ruang Laut Makassar, Ditjen Pengelolaan Ruang Laut, KKP RI.
                            </p>
                        </div>

                        {/* Col 2: Quick Links */}
                        <div className="md:col-span-3 space-y-3">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-900">Tautan Layanan</p>
                            <ul className="space-y-2 text-xs font-semibold text-slate-600">
                                <li>
                                    <Link href="/request-form" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                        <ArrowRight className="w-3 h-3 text-blue-500" />
                                        Permohonan Konsultasi
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/kkprl-proposal" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                        <ArrowRight className="w-3 h-3 text-blue-500" />
                                        Proposal KKPRL
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/login" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                        <ArrowRight className="w-3 h-3 text-blue-500" />
                                        Masuk Petugas BPRL
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Institutional Info */}
                        <div className="md:col-span-3 space-y-3">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-900">Instansi Pembina</p>
                            <div className="space-y-1.5 text-xs text-slate-500">
                                <p className="font-bold text-slate-800">Ditjen Pengelolaan Ruang Laut</p>
                                <p>Kementerian Kelautan dan Perikanan RI</p>
                                <p className="text-[11px] text-blue-600 font-semibold pt-1 flex items-center gap-1">
                                    <Waves className="w-3 h-3" />
                                    Wilayah Penataan Ruang Laut
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
                        <span>© {new Date().getFullYear()} e-GeRAI • BPRL Makassar. Seluruh Hak Cipta Dilindungi.</span>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={scrollToTop}
                                className="font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
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