import HomeLayout from "./layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TriangleAlert } from "lucide-react";
import { Link } from "@inertiajs/react";
import { ReactNode } from "react";

function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            <span className="h-px w-8 bg-blue-600" aria-hidden />
            {children}
        </span>
    );
}

const hasilUji = [
    { parameter: "pH", nilai: "6,4", syarat: "≤ 7,0", status: "ok" },
    { parameter: "TVB-N", nilai: "12,3 mg/100g", syarat: "≤ 30 mg/100g", status: "ok" },
    { parameter: "TPC", nilai: "4,8 × 10⁵ koloni/g", syarat: "≤ 5 × 10⁵", status: "warn" },
    { parameter: "Organoleptik", nilai: "8,2", syarat: "≥ 7,0", status: "ok" },
];

const fitur = [
    {
        judul: "Antrian terukur",
        desc: "Setiap permohonan diberi nomor antrian dan estimasi pengerjaan sesuai jenis layanan. Tidak ada yang 'terlupakan'.",
    },
    {
        judul: "Status bisa dipantau",
        desc: "Dari verifikasi administrasi sampai penerbitan laporan, setiap tahap tercatat dan bisa dicek kapan saja.",
    },
    {
        judul: "Berpijak pada standar",
        desc: "Penilaian mengacu pada SNI, prinsip HACCP, dan regulasi terkait — bukan perkiraan.",
    },
];

const langkah = [
    {
        nomor: "01",
        kicker: "Pendaftaran",
        judul: "Ajukan permohonan daring",
        desc: "Isi form dan unggah dokumen pendukung. Permohonan masuk antrian dengan nomor tanda terima.",
    },
    {
        nomor: "02",
        kicker: "Verifikasi",
        judul: "Dokumen & kelengkapan dicek",
        desc: "Petugas memverifikasi administrasi dan hasil uji. Jika ada yang kurang, akan ada notifikasi revisi.",
    },
    {
        nomor: "03",
        kicker: "Penerbitan",
        judul: "Laporan final diterbitkan",
        desc: "Setelah disahkan, laporan bisa diunduh lengkap dengan nomor surat dan tanda tangan digital.",
    },
];

export default function Welcome() {
    return (
        <HomeLayout>
            <div className="w-full space-y-20 lg:space-y-28 animate-in fade-in duration-500">

                {/* ================= HERO ================= */}
                <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    <div className="space-y-6">
                        <Eyebrow>Gerai Pelayanan BPRL Makassar</Eyebrow>

                        <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-slate-900 md:text-5xl">
                            Laporan konsultasi BPRL,{" "}
                            <span className="text-blue-600">dengan antrian yang terukur.</span>
                        </h1>

                        <p className="max-w-lg text-lg leading-relaxed text-slate-600">
                            Ajukan permohonan konsultasi mutu hasil perikanan secara daring.
                            Setiap permohonan mendapat nomor antrian, estimasi pengerjaan,
                            dan status yang bisa dipantau kapan saja.
                        </p>

                        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
                            <Link href="/request-form">
                                <Button className="h-12 rounded-full bg-blue-600 px-8 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700">
                                    Ajukan Permohonan
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <a
                                href="#alur"
                                className="px-2 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600"
                            >
                                Lihat alur pelayanan ↓
                            </a>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200 pt-5 text-xs text-slate-500">
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Sesuai SNI & HACCP
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Nomor tanda terima resmi
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Status real-time
                            </span>
                        </div>
                    </div>

                    {/* Contoh tanda terima / laporan */}
                    {/* <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
                    </div> */}
                    <img src={'/hero.png'} />
                </section>

                {/* ================= FITUR ================= */}
                <section className="space-y-8">
                    <Eyebrow>Pelayanan</Eyebrow>
                    <div className="grid gap-x-10 gap-y-8 border-t border-slate-200 pt-8 md:grid-cols-3">
                        {fitur.map((f) => (
                            <div key={f.judul}>
                                <h3 className="text-lg font-bold text-slate-900">{f.judul}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ================= ALUR ================= */}
                <section id="alur" className="scroll-mt-28 space-y-8">
                    <Eyebrow>Alur pelayanan</Eyebrow>
                    <div className="grid gap-10 border-t border-slate-200 pt-8 md:grid-cols-3">
                        {langkah.map((s) => (
                            <div key={s.nomor} className="md:pr-10">
                                <div className="flex items-baseline gap-3">
                                    <span className="font-mono text-sm font-bold text-blue-600">{s.nomor}</span>
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        {s.kicker}
                                    </span>
                                </div>
                                <h3 className="mt-3 text-lg font-bold text-slate-900">{s.judul}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ================= CTA ================= */}
                <section className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white px-8 py-10 md:flex-row md:items-center md:justify-between lg:px-12">
                    <div className="max-w-xl space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                            Ajukan permohonan sekarang
                        </h2>
                        <p className="text-slate-600">
                            Isi form daring, dapatkan nomor antrian, dan pantau status permohonan Anda kapan saja.
                        </p>
                    </div>
                    <Link href="/request-form" className="shrink-0">
                        <Button className="h-12 rounded-full bg-blue-600 px-8 text-white hover:bg-blue-700">
                            Ajukan Permohonan
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </section>
            </div>
        </HomeLayout>
    );
}