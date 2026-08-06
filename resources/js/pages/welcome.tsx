import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import logo from "/public/egerai-logo.png";
import logo_djprl from "/public/logo-djprl.png";
import logo_kkp from "/public/logo-kkp.png";
import heroIllustration from "/public/hero-illustration.png";
import iconKonsultasi from "/public/icon-konsultasi.png";
import iconGenerate from "/public/icon-generate.png";
import { cn } from "@/lib/utils";

export default function Welcome() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="min-h-screen w-full bg-sky-100 relative overflow-hidden flex flex-col">
            {/* ─── Sky-blue upper gradient layer ─── */}
            <div className="absolute inset-0 bg-linear-to-b from-sky-300 via-sky-200 to-blue-100 -z-10" />

            {/* ─── Ambient glows ─── */}
            <div className="pointer-events-none absolute -top-40 -left-28 w-[560px] h-[400px] rounded-full bg-white/50 blur-3xl" />
            <div className="pointer-events-none absolute bottom-32 left-1/3 w-[700px] h-[350px] rounded-full bg-blue-300/20 blur-3xl" />
            <div className="pointer-events-none absolute top-0 right-0 w-[60%] h-[80%] bg-sky-200/30 blur-2xl" />

            {/* ─── Hero illustration (right side, fades into background) ─── */}
            <div
                className="hidden lg:block absolute top-0 right-0 h-[70vh] w-[56%] z-0"
                style={{
                    maskImage:
                        "linear-gradient(to left, black 40%, transparent 90%), linear-gradient(to top, transparent 0%, black 40%)",
                    WebkitMaskImage:
                        "linear-gradient(to left, black 40%, transparent 90%), linear-gradient(to top, transparent 0%, black 40%)",
                    maskComposite: "intersect",
                    WebkitMaskComposite: "source-in",
                }}
            >
                <img
                    src={heroIllustration}
                    alt="Petugas BPRL Makassar melayani konsultasi layanan KKPRL"
                    className="w-full h-full object-cover object-center"
                />
            </div>

            {/* ─── Top bar: DJPRL + BPRL text on left, KKP on right ─── */}
            <header className={cn("relative z-20 w-full px-6 lg:px-12 py-5 flex items-center justify-between", isScrolled ? "backdrop-blur-2xl" : "")}>
                <div className="flex items-center gap-3">
                    <img src={logo_djprl} alt="Logo DJPRL" className="h-10 w-auto object-contain" />
                    <div className="border-l border-slate-400/40 pl-3 flex flex-col justify-center">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-700 leading-tight tracking-tight">
                            Balai Penataan Ruang Laut
                        </span>
                        <span className="text-[10px] font-semibold text-blue-700 tracking-wide uppercase">
                            (BPRL) Makassar
                        </span>
                    </div>
                </div>
                <img
                    src={logo_kkp}
                    alt="Logo Kementerian Kelautan dan Perikanan"
                    className="h-10 w-auto object-contain"
                />
            </header>

            {/* ─── Main hero content ─── */}
            <main className="relative z-10 flex-1 flex flex-col justify-center max-w-7/8 mx-auto w-full px-6 lg:px-12 pt-4 pb-8 lg:py-10">
                {/* e-GeRAI Logo (large) */}
                <div className="max-w-[360px] sm:max-w-[420px] lg:max-w-[460px]">
                    <img
                        src={logo}
                        alt="e-GeRAI – Generate, Asistensi, Informasi – Layanan KKPRL BPRL Makassar"
                        className="w-full h-auto object-contain object-left drop-shadow-sm"
                    />
                </div>

                {/* Heading & paragraph */}
                <div className="mt-5 max-w-lg">
                    <h1 className="text-3xl sm:text-4xl xl:text-[2.5rem] font-extrabold text-blue-900 leading-[1.2]">
                        Generate &amp; Asistensi
                        <br />
                        Dokumen KKPRL
                    </h1>
                    <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-slate-600">
                        Platform layanan digital terpadu untuk Konsultasi, Asistensi,
                        Pendampingan, Informasi &amp; Generate Dokumen secara cepat, tepat,
                        efisien dan efektif.
                    </p>
                </div>

                {/* ─── Service Cards ─── */}
                <div className="mt-10 lg:mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 ">

                    {/* Card 1: Konsultasi & Asistensi */}
                    <Link
                        href="/request-form"
                        className="group rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-xl shadow-blue-900/10 p-5 sm:p-6 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <div className="flex items-center gap-4 sm:gap-5">
                            <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                                <img
                                    src={iconKonsultasi}
                                    alt="Ikon Konsultasi"
                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base sm:text-lg font-bold text-blue-900">
                                    Konsultasi &amp; Asistensi
                                </h2>
                                <p className="mt-1 text-[12px] sm:text-[13px] leading-relaxed text-slate-600">
                                    Ajukan konsultasi, dapatkan asistensi dan pendampingan terkait
                                    pemanfaatan ruang laut hingga penerbitan dokumen KKPRL.
                                </p>
                                <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 shadow-md shadow-blue-600/30 transition-colors">
                                    Ajukan Sekarang
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Card 2: Generate Dokumen */}
                    <Link
                        href="/login"
                        className="group rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-xl shadow-blue-900/10 p-5 sm:p-6 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <div className="flex items-center gap-4 sm:gap-5">
                            <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                                <img
                                    src={iconGenerate}
                                    alt="Ikon Generate Dokumen"
                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base sm:text-lg font-bold text-blue-900">
                                    Generate Dokumen
                                </h2>
                                <p className="mt-1 text-[12px] sm:text-[13px] leading-relaxed text-slate-600">
                                    Generate dokumen secara otomatis berdasarkan data dan template
                                    yang tersedia dengan cepat, tepat, dan efisien.
                                </p>
                                <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs sm:text-sm font-semibold px-4 py-2 shadow-md shadow-blue-900/30 transition-colors">
                                    Mulai Proses (Khusus Petugas)
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            </main>

            {/* ─── Decorative wave at bottom ─── */}
            <svg
                className="relative z-10 w-full h-12 sm:h-16 text-white/60 mt-auto"
                viewBox="0 0 1440 120"
                fill="currentColor"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path d="M0,80 C360,120 1080,40 1440,80 L1440,120 L0,120 Z" />
            </svg>
        </div>
    );
}