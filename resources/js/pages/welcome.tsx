import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    CheckCircle2,
    CloudUpload,
    FileText,
    FileUp,
    ScanSearch,
    Settings2,
    Waves,
} from 'lucide-react';
import HomeLayout from './layout';
import heroBanner from '/public/hero-banner.png';

const flow = [
    { icon: CloudUpload, title: 'Siapkan Proposal', description: 'Gunakan draft proposal PKKPRL dalam format digital.', style: 'bg-blue-700' },
    { icon: Waves, title: 'Siapkan Laporan', description: 'Lengkapi dengan laporan kondisi eksisting atau hidro-oseanografi.', style: 'bg-sky-500' },
    { icon: Settings2, title: 'Review Data', description: 'Periksa data kegiatan, lokasi, koordinat, serta lampiran pendukung.', style: 'bg-violet-600' },
    { icon: FileUp, title: 'Generate Dokumen', description: 'Simpan draft dan unduh dokumen Word setelah data lengkap.', style: 'bg-amber-500' },
];

export default function Welcome() {
    return <HomeLayout>
        <Head title="e-GeRAI KKPRL" />
        <section className="-mx-6 w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
            <div className="mx-auto max-w-[1600px]">
                <img src={heroBanner} alt="e-GeRAI — Generate dan Asistensi Dokumen KKPRL" className="block h-auto w-full" />
            </div>
        </section>

        <section className="relative z-10 mx-auto -mt-6 grid w-full max-w-[1600px] gap-6 px-4 pb-10 sm:px-8 lg:grid-cols-[1fr_1fr_340px] lg:px-10">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-sm font-black text-white">1</span><FileText className="h-5 w-5 text-blue-700" /></div><h2 className="mt-5 text-base font-extrabold text-slate-900">Draft Proposal PKKPRL</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">Isi proposal secara bertahap: pemohon, kegiatan, lokasi, koordinat, dan dokumen pendukung.</p><Link href="/kkprl-proposal" className="mt-5 flex min-h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 text-center transition hover:border-blue-400 hover:bg-blue-50"><CloudUpload className="h-6 w-6 text-blue-600" /><span className="mt-2 text-sm font-bold text-blue-700">Isi formulir proposal</span><span className="mt-1 text-xs text-slate-500">Buka form proposal terstruktur</span></Link></article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">2</span><Waves className="h-5 w-5 text-sky-600" /></div><h2 className="mt-5 text-base font-extrabold text-slate-900">Proposal & Data Koordinat</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">Unggah PDF proposal untuk mengekstrak data utama, serta CSV/XLSX/DOCX untuk koordinat.</p><Link href="/proposal-extractions/create" className="mt-5 flex min-h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/50 text-center transition hover:border-sky-400 hover:bg-sky-50"><ScanSearch className="h-6 w-6 text-sky-600" /><span className="mt-2 text-sm font-bold text-sky-700">Ekstrak & review proposal</span><span className="mt-1 text-xs text-slate-500">PDF hingga 30 MB</span></Link></article>
            <aside className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-sm font-extrabold text-blue-700">Alur Proses</h2><div className="mt-5 space-y-5">{flow.map((item, index) => <div className="flex gap-3" key={item.title}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${item.style}`}><item.icon className="h-4 w-4" /></span><div><h3 className="text-sm font-bold text-slate-800">{index + 1}. {item.title}</h3><p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.description}</p></div></div>)}</div></aside>
        </section>

        <section className="mx-auto mt-8 w-full max-w-7xl"><Link href="/kkprl#faq" className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl bg-linear-to-r from-blue-950 via-blue-800 to-cyan-600 p-6 text-white shadow-xl shadow-blue-900/15 sm:flex-row sm:items-center sm:p-8"><div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-amber-300/25 blur-3xl" /><span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-800 shadow-lg"><Bot className="h-7 w-7" /></span><div className="relative flex-1"><p className="text-[11px] font-bold tracking-[0.16em] text-amber-300 uppercase">Asisten e-GeRAI · Tanya Jawab Otomatis</p><h2 className="mt-1 text-lg font-extrabold">Punya pertanyaan seputar KKPRL?</h2><p className="mt-1 text-sm leading-relaxed text-blue-100">Temukan jawaban tentang persyaratan, OSS/e-SEA, biaya PNBP, reklamasi, dan tracking permohonan melalui FAQ interaktif.</p></div><span className="relative inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white transition group-hover:bg-amber-400">Tanya sekarang <ArrowRight className="ml-2 h-4 w-4" /></span></Link></section>

        <section className="mx-auto mt-8 flex w-full max-w-7xl flex-wrap items-center justify-between gap-5 rounded-2xl border border-emerald-100 bg-white px-6 py-5 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></span><div><p className="text-sm font-bold text-slate-800">Data tetap dalam proses review</p><p className="text-xs text-slate-500">Hasil ekstraksi wajib diperiksa sebelum digunakan dalam pengajuan resmi.</p></div></div><Link href="/request-form" className="text-sm font-bold text-blue-700 hover:text-blue-900">Butuh konsultasi BPRL? <ArrowRight className="inline h-4 w-4" /></Link></section>
    </HomeLayout>;
}
