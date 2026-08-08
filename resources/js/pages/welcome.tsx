import { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    Waves,
    ShieldCheck,
    Zap,
    UserRound,
    ClipboardCheck,
    FileCheck2,
    BadgeCheck,
    FileText,
    Compass,
} from "lucide-react";
import { Link } from "@inertiajs/react";
import logo from "/public/egerai-logo.png";
import heroIllustration from "/public/hero-illustration.png";
import HomeLayout from "./layout";

const stats = [
    { icon: Zap, value: "100% Daring", label: "Proses terintegrasi & cepat" },
    { icon: Compass, value: "Presisi RZWP", label: "Penelaahan tata ruang laut" },
    { icon: ShieldCheck, value: "Resmi KKP", label: "Sesuai standar Ditjen PRL" },
    { icon: FileText, value: "Digital E-Sign", label: "Dokumen legal terverifikasi" },
];

const steps = [
    {
        num: "01",
        title: "Pengajuan",
        desc: "Isi permohonan konsultasi atau proposal KKPRL secara daring.",
    },
    {
        num: "02",
        title: "Verifikasi",
        desc: "Tim BPRL memeriksa kelengkapan berkas & kesesuaian zonasi.",
    },
    {
        num: "03",
        title: "Drafting AI",
        desc: "Sistem e-GeRAI menyusun draf laporan pertimbangan teknis.",
    },
    {
        num: "04",
        title: "Penerbitan",
        desc: "Pengesahan dokumen resmi dengan tanda tangan digital.",
    },
];

const services = [
    {
        icon: ClipboardCheck,
        tag: "Publik",
        title: "Konsultasi & Asistensi",
        desc: "Ajukan permohonan konsultasi pemanfaatan ruang laut secara daring.",
        href: "/request-form",
        cta: "Ajukan Sekarang",
    },
    {
        icon: FileText,
        tag: "Mandiri",
        title: "Proposal KKPRL",
        desc: "Susun berkas usulan kesesuaian kegiatan pemanfaatan ruang laut.",
        href: "/kkprl-proposal",
        cta: "Isi Proposal",
    },
    {
        icon: UserRound,
        tag: "Internal",
        title: "Portal Petugas",
        desc: "Masuk untuk generate dokumen dan pengesahan e-sign petugas BPRL.",
        href: "/login",
        cta: "Masuk Portal",
    },
];

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`mx-24 transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
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
                {/* Wash biru halus di atas */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-120" />

                <div className="relative">
                    {/* ═══════════ HERO ═══════════ */}
                    <section className="lg:gap-16 items-center pt-12 lg:pt-20 pb-16 lg:pb-24 ">
                        <div className="space-y-7">
                            {/* <img
                                src={heroIllustration}
                                alt="Petugas BPRL Makassar melayani konsultasi KKPRL"
                                className="absolute w-full h-80 sm:h-105 lg:h-110 object-cover object-[65%_15%] rounded-3xl border border-white shadow-2xl shadow-blue-900/15"
                            /> */}
                            <div className="mx-24">
                                <div className="max-w-[240px]">
                                    <img
                                        src={logo}
                                        alt="e-GeRAI – Generate, Asistensi, Informasi"
                                        className="w-full h-auto object-contain object-left"
                                    />
                                </div>

                                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                                    Layanan Digital{" "}
                                    <span className="text-blue-600">Dokumen KKPRL</span>
                                </h1>

                                <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-lg">
                                    Konsultasi, asistensi teknis, dan penyusunan dokumen Kesesuaian
                                    Kegiatan Pemanfaatan Ruang Laut — presisi dan resmi.
                                </p>

                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                    <Link
                                        href="/request-form"
                                        className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                                    >
                                        Ajukan Konsultasi
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                    <Link
                                        href="/kkprl-proposal"
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:-translate-y-0.5 transition-all"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Isi Proposal KKPRL
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ═══════════ LAYANAN ═══════════ */}
                    <Reveal className="pb-16 lg:pb-24">
                        <div className="max-w-xl space-y-3 mb-10">
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                Layanan
                            </h2>
                            <p className="text-slate-500 text-sm sm:text-base">
                                Pilih layanan sesuai kebutuhan Anda.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-5">
                            {services.map((service) => {
                                const ServiceIcon = service.icon;
                                return (
                                    <Link
                                        key={service.title}
                                        href={service.href}
                                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 hover:border-blue-200 hover:-translate-y-0.5 transition-all"
                                    >
                                        <div className="flex items-start justify-between">
                                            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                                                <ServiceIcon className="w-4 h-4" />
                                            </span>
                                            <span className="rounded-full bg-slate-50 border border-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                {service.tag}
                                            </span>
                                        </div>
                                        <h3 className="mt-4 text-base font-bold text-slate-900">
                                            {service.title}
                                        </h3>
                                        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                                            {service.desc}
                                        </p>
                                        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:gap-2.5 transition-all">
                                            {service.cta}
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </Reveal>

                    {/* ═══════════ PENUTUP ═══════════ */}
                    <Reveal className="pb-16 lg:pb-24">
                        <div className="rounded-2xl border border-slate-200 bg-white px-7 py-10 sm:px-12 text-center shadow-sm">
                            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                                Siap mengajukan permohonan?
                            </h2>
                            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                                Mulai konsultasi pemanfaatan ruang laut Anda hari ini.
                            </p>
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    href="/request-form"
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all"
                                >
                                    Ajukan Permohonan
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                                >
                                    Masuk Petugas
                                </Link>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </HomeLayout>
    );
}