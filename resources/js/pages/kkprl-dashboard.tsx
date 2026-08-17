import { Head, Link, router } from '@inertiajs/react';
import {
    Bot,
    Download,
    FileText,
    LoaderCircle,
    Settings,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from './layout';
import DocumentUpload from '@/components/document-upload';

export default function Home() {
    const [proposal, setProposal] = useState<File>();
    const [report, setReport] = useState<File>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const submit = () => {
        if (!proposal || !report) {
            setError('Mohon unggah kedua file (proposal & laporan).');
            return;
        }
        setError('');
        setLoading(true);
        router.post(
            '/review',
            { proposal, report },
            {
                forceFormData: true,
                onError: () => {
                    setLoading(false);
                    setError(
                        'File tidak dapat diproses. Pastikan PDF/DOCX valid dan maksimal 30 MB.',
                    );
                },
                onFinish: () => setLoading(false),
            },
        );
    };
    return (
        <AppLayout>
            <Head title="e-GeRAI KKPRL" />
            <section className="relative min-h-[260px] overflow-hidden bg-gradient-to-br from-[#eaf2fb] via-[#cfe1f6] to-[#a9cdec]">
                <img
                    src="/hero-banner.png"
                    className="block max-h-[360px] min-h-[145px] w-full object-cover md:min-h-0"
                />
                <div className="hidden">
                    <h1>Generate & Asistensi Dokumen KKPRL</h1>
                    <p>
                        Platform layanan digital terintegrasi untuk konsultasi,
                        asistensi, pendampingan, informasi, dan generate dokumen
                        KKPRL.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                            <Sparkles /> Cepat & terstruktur
                        </span>
                        <span className="flex items-center gap-1">
                            <ShieldCheck /> Data terjaga
                        </span>
                    </div>
                </div>
            </section>
            <main className="mx-auto max-w-[1600px] px-4 py-5 md:px-10 md:pt-7 md:pb-[42px]">
                {error && (
                    <div className="mb-4 rounded-[10px] border border-[#ffe08a] bg-[#fff3cd] px-4 py-3 text-[#7a5b00]">
                        ⚠ {error}
                    </div>
                )}
                <div className="relative -mt-[23px] grid grid-cols-1 gap-[25px] md:-mt-[51px] md:grid-cols-2 xl:grid-cols-[1fr_1fr_340px]">
                    <DocumentUpload
                        number={1}
                        title="Draft Proposal PKKPRL (PDF/Word)"
                        description={<>Unggah file proposal yang akan digabungkan. Belum punya file-nya? <Link href="/kkprl-proposal" className="underline text-blue-600">Isi formulir manual</Link>.</>}
                        onFile={setProposal}
                    />
                    <DocumentUpload
                        number={2}
                        title="Laporan Kondisi Eksisting / Hidro-Oseanografi"
                        description="Unggah file PDF atau Word laporan hidro-oseanografi."
                        onFile={setReport}
                    />
                    <aside className="rounded-2xl bg-white p-[23px] shadow-[0_6px_24px_#123a6314] md:col-span-2 md:grid md:grid-cols-4 md:gap-[10px] xl:col-span-1 xl:row-span-2 xl:block">
                        <h3 className="mb-[17px] text-[14px] text-[#1e63c7] md:col-span-4 xl:mb-[17px]">
                            Alur Proses
                        </h3>
                        {[
                            [FileText, 'Upload Proposal'],
                            [Settings, 'Upload Laporan'],
                            [Sparkles, 'Generate Dokumen'],
                            [Download, 'Download Dokumen'],
                        ].map(([Icon, label], i) => {
                            const I = Icon as typeof FileText;
                            return (
                                <div
                                    className="flex items-start gap-[10px] pb-[14px] md:pb-0 xl:pb-[17px]"
                                    key={label as string}
                                >
                                    <i className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-[#1e63c7] text-[13px] font-extrabold text-white not-italic">
                                        {i + 1}
                                    </i>
                                    <I className="mt-1 w-5 text-[#1e63c7]" />
                                    <span className="flex flex-col gap-[2px]">
                                        <b className="text-[13px] text-[#123a63]">
                                            {label as string}
                                        </b>
                                        <small className="text-[11px] text-[#5b6b7c]">
                                            {i === 3
                                                ? 'Dokumen Word siap diunduh'
                                                : 'Proses otomatis & terarah'}
                                        </small>
                                    </span>
                                </div>
                            );
                        })}
                    </aside>
                    <div className="col-span-1 text-center md:col-span-2">
                        <button
                            onClick={submit}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-[#2f7fe0] to-[#123a63] p-[15px] text-[15px] font-extrabold text-white shadow-[0_6px_18px_#1e63c74d] disabled:opacity-70"
                        >
                            {loading ? (
                                <LoaderCircle className="w-5 animate-spin" />
                            ) : (
                                <Sparkles className="w-5" />
                            )}
                            {loading
                                ? ' Memproses dokumen...'
                                : ' Generate & Preview Dokumen Word'}
                        </button>
                        <small className="mt-[10px] block text-[11px] text-[#5b6b7c]">
                            Sistem akan memproses dan membuat dokumen Word final
                            secara otomatis
                        </small>
                    </div>
                </div>
                <Link
                    href="/asisten"
                    className="mt-[22px] flex flex-wrap items-center gap-5 rounded-[18px] bg-gradient-to-br from-[#0a2557] via-[#12468c] to-[#1aa6e0] p-5 text-white shadow-[0_14px_34px_#0a25573d] md:mt-[34px] md:flex-nowrap md:px-[27px] md:py-[23px]"
                >
                    <img
                        src="/images/logo-egerai-icon.png"
                        className="w-[59px] rounded-[13px] bg-white p-[7px]"
                    />
                    <span className="flex flex-1 flex-col gap-1">
                        <small className="text-[10px] font-extrabold text-[#f2a83b]">
                            ASISTEN E-GERAI · TANYA JAWAB OTOMATIS
                        </small>
                        <b className="text-[17px]">
                            Punya pertanyaan seputar KKPRL? Tanya langsung ke
                            asisten kami
                        </b>
                        <em className="text-[12px] text-white/80 not-italic">
                            Persyaratan, alur OSS/e-SEA, biaya PNBP, reklamasi,
                            hingga tracking permohonan.
                        </em>
                    </span>
                    <strong className="flex w-full items-center justify-center gap-[7px] rounded-[11px] bg-gradient-to-br from-[#f2a83b] to-[#d6821a] px-[17px] py-3 text-[13px] md:w-auto md:justify-start">
                        <Bot className="w-[17px]" /> Tanya Sekarang
                    </strong>
                </Link>
            </main>
        </AppLayout>
    );
}
