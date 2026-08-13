import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    CheckCircle2,
    FilePenLine,
    FileSearch,
    LoaderCircle,
    MapPinned,
    MessageCircle,
    Send,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import HomeLayout from './layout';

const steps = [
    ['1', 'Siapkan dokumen', 'Proposal dan laporan teknis dalam format digital.'],
    ['2', 'Isi atau ekstrak data', 'Gunakan formulir terstruktur atau ekstraksi proposal.'],
    ['3', 'Review & lengkapi', 'Periksa hasil, koordinat, dan dokumen pendukung.'],
    ['4', 'Generate dokumen', 'Unduh proposal KKPRL setelah seluruh data valid.'],
];

const faqs = [
    ['Apa itu KKPRL?', 'KKPRL adalah persetujuan atau konfirmasi kesesuaian kegiatan pemanfaatan ruang laut sesuai ketentuan yang berlaku.'],
    ['Di mana permohonan diajukan?', 'Kegiatan berusaha diajukan melalui OSS. Kegiatan non-berusaha menggunakan sistem elektronik Kementerian/e-SEA sesuai jenis kegiatannya.'],
    ['Kapan dokumen reklamasi diperlukan?', 'Dokumen tambahan reklamasi diperlukan bila rencana kegiatan menggunakan reklamasi, termasuk sumber material, pemanfaatan lahan, metode, dan jadwal pelaksanaan.'],
    ['Apakah hasil ekstraksi sudah siap diajukan?', 'Belum. Hasil ekstraksi adalah draft bantu; pemohon wajib mereview, mengoreksi, dan melengkapi data sebelum digunakan.'],
];

export default function KkprlDashboard() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const askAssistant = async () => {
        if (!question.trim() || loading) {
return;
}

        setLoading(true);
        setAnswer('');
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            const response = await fetch('/kkprl/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': token },
                body: JSON.stringify({ question }),
            });
            const data = await response.json();
            setAnswer(data.answer || 'Maaf, jawaban belum dapat dibuat.');
        } catch {
            setAnswer('Maaf, asisten sedang tidak dapat dihubungi. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return <HomeLayout>
        <Head title="Dashboard KKPRL" />
        <section className="mx-auto w-full max-w-7xl pt-6">
            <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-sky-950 via-blue-900 to-cyan-800 px-6 py-10 text-white shadow-2xl shadow-blue-950/20 sm:px-10 lg:px-14 lg:py-14">
                <div className="pointer-events-none absolute -top-16 right-0 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
                <div className="relative max-w-3xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wider text-cyan-100 uppercase"><Sparkles className="h-3.5 w-3.5" /> e-GeRAI · KKPRL</span>
                    <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">Workspace Proposal KKPRL</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-blue-100 sm:text-base">Susun, ekstrak, review, dan siapkan dokumen proposal Kesesuaian Kegiatan Pemanfaatan Ruang Laut dalam satu alur kerja.</p>
                    <div className="mt-7 flex flex-wrap gap-3"><Link href="/kkprl-proposal"><Button className="rounded-xl bg-white px-5 font-bold text-blue-950 hover:bg-cyan-50">Mulai isi proposal <ArrowRight className="ml-2 h-4 w-4" /></Button></Link><Link href="/login"><Button variant="outline" className="rounded-xl border-white/30 bg-white/10 px-5 font-bold text-white hover:bg-white/20 hover:text-white">Masuk sebagai petugas</Button></Link></div>
                </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
                <Link href="/kkprl-proposal" className="group rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><FilePenLine className="h-5 w-5" /></span><h2 className="mt-4 font-bold text-slate-900">Formulir Proposal Manual</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">Isi data pemohon, kegiatan, lokasi, serta persyaratan pendukung secara bertahap.</p><span className="mt-5 flex items-center text-sm font-bold text-blue-600">Buka formulir <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" /></span></Link>
                <Link href="/proposal-extractions/create" className="group rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700"><FileSearch className="h-5 w-5" /></span><h2 className="mt-4 font-bold text-slate-900">Ekstrak Proposal</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">Unggah PDF untuk membaca field proposal dan koordinat tabular secara otomatis.</p><span className="mt-5 flex items-center text-sm font-bold text-blue-600">Ekstrak dokumen <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" /></span></Link>
                <Link href="/request-form" className="group rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><MessageCircle className="h-5 w-5" /></span><h2 className="mt-4 font-bold text-slate-900">Konsultasi BPRL</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">Ajukan konsultasi apabila membutuhkan pendampingan teknis dari petugas BPRL.</p><span className="mt-5 flex items-center text-sm font-bold text-blue-600">Ajukan konsultasi <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" /></span></Link>
            </div>

            <div className="mt-10 grid gap-7 lg:grid-cols-[1.35fr_0.65fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><MapPinned className="h-5 w-5" /></span><div><h2 className="font-bold text-slate-900">Alur penyusunan proposal</h2><p className="text-sm text-slate-500">Ikuti proses ini sebelum menghasilkan dokumen final.</p></div></div><div className="mt-7 grid gap-5 sm:grid-cols-2">{steps.map(([number, title, description]) => <div key={number} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">{number}</span><div><h3 className="text-sm font-bold text-slate-800">{title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p></div></div>)}</div></section>
                <section className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white"><Bot className="h-5 w-5" /></span><div><h2 className="font-bold text-slate-900">FAQ Interaktif</h2><p className="text-xs text-slate-500">Jawaban cepat untuk pertanyaan umum.</p></div></div><p className="mt-5 text-sm leading-relaxed text-slate-600">Pilih pertanyaan di bawah atau tanyakan langsung bila jawaban yang dibutuhkan belum tersedia.</p><a href="#faq" className="mt-4 inline-flex items-center text-sm font-bold text-cyan-700">Lihat FAQ <ArrowRight className="ml-1 h-4 w-4" /></a></section>
            </div>
            <section id="faq" className="mt-10 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><MessageCircle className="h-5 w-5" /></span><div><h2 className="font-bold text-slate-900">FAQ KKPRL</h2><p className="text-sm text-slate-500">Pertanyaan yang paling sering ditanyakan terkait layanan KKPRL.</p></div></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><div className="space-y-2">{faqs.map(([question, response]) => <details key={question} className="group rounded-xl border border-slate-200 px-4"><summary className="cursor-pointer list-none py-4 text-sm font-bold text-slate-800">{question}<span className="float-right text-blue-600 transition group-open:rotate-45">+</span></summary><p className="border-t border-slate-100 pb-4 pt-3 text-sm leading-relaxed text-slate-600">{response}</p></details>)}</div><div className="rounded-2xl bg-linear-to-br from-cyan-50 to-blue-50 p-5"><div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Bot className="h-4 w-4 text-cyan-700" /> Belum menemukan jawaban?</div><p className="mt-2 text-sm text-slate-600">Tanyakan langsung kepada Asisten KKPRL.</p><div className="mt-4 rounded-xl border border-cyan-100 bg-white p-3 text-sm leading-relaxed text-slate-600">{loading ? <span className="flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" /> Menyiapkan jawaban…</span> : answer || 'Contoh: “Dokumen apa yang diperlukan untuk kegiatan reklamasi?”'}</div><div className="mt-3 flex gap-2"><Input value={question} onChange={event => setQuestion(event.target.value)} onKeyDown={event => {
 if (event.key === 'Enter') {
void askAssistant();
} 
}} placeholder="Tulis pertanyaan…" /><Button onClick={() => void askAssistant()} size="icon" className="shrink-0 bg-cyan-700 hover:bg-cyan-800"><Send className="h-4 w-4" /></Button></div></div></div></section>
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"><ShieldCheck className="h-5 w-5 shrink-0" /><span>Data proposal tetap perlu diperiksa oleh pemohon dan petugas sebelum digunakan untuk pengajuan resmi melalui OSS atau e-SEA.</span><CheckCircle2 className="ml-auto h-5 w-5 shrink-0" /></div>
        </section>
    </HomeLayout>;
}
