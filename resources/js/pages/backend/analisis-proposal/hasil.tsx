import { Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Download,
    Save,
    SearchCheck,
    Trash2,
} from 'lucide-react';
import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Heading from '@/components/backend/heading';
import AppLayout from '../../layout';

type Props = {
    hasil_markdown: string;
    nama_proposal: string;
    nama_laporan: string;
    entry_id: string | null;
    saved_notice: string | null;
};

export default function AnalisisProposalHasil({
    hasil_markdown,
    nama_proposal,
    nama_laporan,
    entry_id,
    saved_notice,
}: Props) {
    const downloadFormRef = useRef<HTMLFormElement>(null);
    const csrfToken =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? '';

    const handleSimpan = () => {
        router.post('/analisis-proposal/simpan', {
            hasil_markdown,
            nama_proposal,
            nama_laporan,
        });
    };

    const handleHapus = () => {
        if (!entry_id) {
            return;
        }

        if (
            !window.confirm('Hapus hasil analisis ini dari Riwayat Tersimpan?')
        ) {
            return;
        }

        router.delete(`/analisis-proposal/riwayat/${entry_id}`);
    };

    return (
        <AppLayout>
            <div className="bg-[#eef3f8] px-8 py-10 text-[#1c2b3a]">
                <div className="mx-auto max-w-4xl space-y-5">
                    <Heading
                        icon={SearchCheck}
                        title="Hasil Analisis & Koreksi Proposal"
                        description={
                            `Proposal: ${nama_proposal}` +
                            (nama_laporan
                                ? ` · Laporan pembanding: ${nama_laporan}`
                                : ' · Tanpa laporan pembanding (hanya cek kelengkapan)')
                        }
                    />

                    {saved_notice && (
                        <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            {saved_notice}
                        </div>
                    )}

                    <div className="mb-4 flex flex-wrap gap-2.5">
                        {entry_id ? (
                            <>
                                <a
                                    href={`/analisis-proposal/riwayat/${entry_id}/unduh`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700"
                                >
                                    <Download className="h-4 w-4" /> Unduh
                                    Dokumen (.docx)
                                </a>
                                <button
                                    type="button"
                                    onClick={handleHapus}
                                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" /> Hapus dari
                                    Riwayat
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSimpan}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700"
                                >
                                    <Save className="h-4 w-4" /> Simpan Hasil
                                    Analisis
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        downloadFormRef.current?.submit()
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                                >
                                    <Download className="h-4 w-4" /> Unduh
                                    Dokumen (.docx)
                                </button>
                            </>
                        )}
                    </div>

                    <div className="analisis-report rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {hasil_markdown}
                        </ReactMarkdown>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                        <Link
                            href="/analisis-proposal"
                            className="font-semibold text-slate-500 hover:underline"
                        >
                            ← Analisis dokumen lain
                        </Link>
                        <span>·</span>
                        <Link
                            href="/analisis-proposal/riwayat"
                            className="font-semibold text-slate-500 hover:underline"
                        >
                            Lihat Riwayat Tersimpan
                        </Link>
                    </div>

                    {/* Not-yet-saved results only exist in this page's props — download
                needs a real (non-Inertia) form POST so the response can be a
                raw .docx file instead of a JSON/HTML page visit. */}
                    <form
                        ref={downloadFormRef}
                        method="POST"
                        action="/analisis-proposal/unduh"
                        className="hidden"
                    >
                        <input type="hidden" name="_token" value={csrfToken} />
                        <input
                            type="hidden"
                            name="hasil_markdown"
                            value={hasil_markdown}
                        />
                        <input
                            type="hidden"
                            name="nama_proposal"
                            value={nama_proposal}
                        />
                        <input
                            type="hidden"
                            name="nama_laporan"
                            value={nama_laporan}
                        />
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
