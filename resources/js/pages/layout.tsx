import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { ReactNode, useEffect, useRef, useState } from "react";
import logo from "/public/egerai-logo.png";
import logo_djprl from "/public/logo-djprl.png";
import logo_kkp from "/public/logo-kkp.png";
import {
    Activity,
    ArrowRight,
    BadgeCheck,
    ChevronDown,
    ClipboardCheck,
    FileCheck2,
    FlaskConical,
    Gauge,
    GraduationCap,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
    {
        href: "/kkprl-proposal",
        icon: BadgeCheck,
        title: "Proposal KKPRL",
        desc: "Isi Proposal KKPRL.",
    }
];

function Navbar({ scrolled }: { scrolled: boolean }) {
    const [open, setOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    const close = () => setOpen(false);

    // Tutup saat klik di luar navbar / tekan Escape
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
                ? "bg-white/70 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/60 py-2.5 shadow-[0_8px_32px_-8px_rgba(37,99,235,0.15)]"
                : "bg-transparent py-5 border-b border-transparent"
                }`}
        >
            {/* Ambient blue glow — only visible once glassed */}
            <div
                className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"
                    }`}
            >
                <div className="absolute -top-16 left-1/4 h-32 w-32 rounded-full bg-blue-400/15 blur-3xl" />
                <div className="absolute -top-16 right-1/4 h-32 w-32 rounded-full bg-cyan-300/15 blur-3xl" />
            </div>

            {/* ===== Bar utama ===== */}
            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
                <Link href="/" onClick={close} className={cn("flex items-center gap-3 group", scrolled ? "h-10" : "h-14")}>
                    <img src={logo_djprl} alt="Logo DJPRL" className="h-full object-contain" />
                    <div className="flex flex-col justify-center border-l border-slate-300 pl-3">
                        <span className="text-xs md:text-sm font-bold text-slate-800 leading-tight tracking-tight">
                            Balai Penataan Ruang Laut
                        </span>
                        <span className="text-[10px] md:text-xs font-semibold text-blue-600 tracking-wide uppercase">
                            (BPRL) Makassar
                        </span>
                    </div>
                </Link>

                {/* Menu tengah (desktop) */}
                <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                    <Link
                        href="/"
                        onClick={close}
                        className="text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2 transition-colors"
                    >
                        Beranda
                    </Link>

                    {/* Trigger dropdown */}
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls="nav-mega-menu"
                        className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-full transition-colors ${open
                            ? "text-blue-600 bg-blue-50/80"
                            : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
                            }`}
                    >
                        Layanan
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        onClick={close}
                        className="hidden sm:block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                    >
                        Masuk
                    </Link>
                    <Link href="/request-form" onClick={close}>
                        <Button className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-600/30 text-white shadow-md shadow-blue-600/20 rounded-full px-6 transition-all duration-300 hover:-translate-y-0.5">
                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                            <span className="relative">Ajukan Permohonan</span>
                        </Button>
                    </Link>

                    {/* Logo KKP paling kanan */}
                    <div className={cn("flex items-center shrink-0 border-l border-slate-200 pl-3 ml-1", scrolled ? "h-9" : "h-12")}>
                        <img
                            src={logo_kkp}
                            alt="Logo Kementerian Kelautan dan Perikanan"
                            className="h-full object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* ===== Dropdown full-width (mengikuti lebar container) ===== */}
            <div
                id="nav-mega-menu"
                className={`absolute top-full inset-x-0 z-40 px-6 lg:px-8 pt-2 transition-all duration-300 ease-out ${open
                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                    : "opacity-0 -translate-y-3 scale-[0.99] pointer-events-none"
                    }`}
            >
                {/* max-w-7xl di sini = lebar isinya sama persis dengan container navbar */}
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/85 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl border border-white/60 shadow-[0_24px_48px_-12px_rgba(37,99,235,0.25)] overflow-hidden">
                        {/* Header panel */}
                        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200/70">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Layanan & Informasi
                            </p>
                            <Link
                                href="/layanan"
                                onClick={close}
                                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Lihat Semua
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid lg:grid-cols-[1fr_300px]">
                            {/* Grid layanan */}
                            <div className="p-6 grid sm:grid-cols-2 gap-1">
                                {services.map((s) => (
                                    <Link
                                        key={s.title}
                                        href={s.href}
                                        onClick={close}
                                        className="group/item flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50/70 transition-colors"
                                    >
                                        <div className="shrink-0 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-2 text-blue-600 transition-all duration-300 group-hover/item:from-blue-600 group-hover/item:to-cyan-500 group-hover/item:text-white group-hover/item:border-transparent group-hover/item:shadow-md group-hover/item:shadow-blue-600/25">
                                            <s.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 group-hover/item:text-blue-700 transition-colors">
                                                {s.title}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                                {s.desc}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Panel CTA */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-6 flex flex-col justify-between gap-6">
                                <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                                <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />

                                <div className="relative">
                                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 text-white backdrop-blur-sm mb-3">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <p className="text-white font-semibold">Layanan Digital Terpadu</p>
                                    <p className="text-blue-50/90 text-sm mt-1 leading-relaxed">
                                        Ajukan permohonan sertifikasi, pengujian, dan layanan mutu lainnya secara online.
                                    </p>
                                </div>

                                <Link href="/request-form" onClick={close} className="relative">
                                    <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 rounded-full shadow-lg shadow-blue-900/20 group/cta">
                                        Ajukan Sekarang
                                        <ArrowRight className="ml-1 w-4 h-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
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

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-125 bg-linear-to-b from-blue-50/80 to-transparent -z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-150 h-150 bg-blue-100/40 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-40 left-0 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl -z-10 -translate-x-1/2 pointer-events-none" />

            <Navbar scrolled={scrolled} />

            <main className="pt-24 pb-16 flex flex-col flex-1 max-w-7xl mx-auto px-6 lg:px-8 w-full min-h-[calc(100vh-80px)]">
                {children}
            </main>

            <footer className="border-t border-slate-200 mt-auto py-8">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} Trika Media Solusindo. All rights reserved.
                </div>
            </footer>
        </div>
    );
}