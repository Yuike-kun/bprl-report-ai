import { Head, Link, router, usePage } from '@inertiajs/react';
import { FileText, Waves, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { FileUpload } from '@/components/berita_acara_components';
import AppLayout from '../../layout';

const ACCEPT =
    '.pdf,.docx,.xlsx,.xlsm,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12';

function StepCard({
    number,
    icon: Icon,
    title,
    description,
    children,
}: {
    number: number;
    icon: LucideIcon;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl bg-white p-6 shadow-[0_6px_24px_#123a6314]">
            <div className="flex items-center gap-3">
                <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-[#1e63c7] text-[13px] font-extrabold text-white">
                    {number}
                </span>
                <span className="grid h-[43px] w-[43px] shrink-0 place-items-center rounded-xl bg-[#eaf1fc] text-[#1e63c7]">
                    <Icon className="w-[22px]" />
                </span>
            </div>
            <h2 className="mt-3 mb-[3px] text-[15px] font-semibold text-[#123a63]">
                {title}
            </h2>
            <p className="mb-[15px] text-[12px] leading-relaxed text-[#5b6b7c]">
                {description}
            </p>
            {children}
        </section>
    );
}

export default function AnalisisProposalCreate() {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [proposalFiles, setProposalFiles] = useState<File[]>([]);
    const [laporanFiles, setLaporanFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!proposalFiles.length || submitting) {
            return;
        }

        const fd = new FormData();
        proposalFiles.forEach((file) => fd.append('proposal[]', file));
        laporanFiles.forEach((file) => fd.append('laporan[]', file));

        setSubmitting(true);
        router.post('/analisis-proposal', fd, {
            forceFormData: true,
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Analisis & Koreksi Proposal" />
            <div className="bg-[#eef3f8] px-8 py-10 text-[#1c2b3a]">
                <div className="mx-auto max-w-5xl space-y-6">
                    <section className="rounded-2xl bg-gradient-to-br from-[#eaf2fb] via-[#cfe1f6] to-[#a9cdec] px-8 py-7">
                        <h1 className="text-2xl font-extrabold text-[#123A63]">
                            Analisis & Koreksi Proposal
                        </h1>
                        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-[#33495e]">
                            Unggah Proposal Teknis PKKPRL yang sudah jadi untuk
                            diperiksa otomatis — sistem membandingkan data yang
                            disebutkan di dalamnya dengan Laporan Kondisi
                            Eksisting/Hidro-Oseanografi sebagai sumber data
                            pembanding, lalu memberi rekomendasi perbaikan.
                        </p>
                    </section>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <StepCard
                                number={1}
                                icon={FileText}
                                title="Proposal Teknis PKKPRL yang Sudah Jadi"
                                description="Dokumen yang ingin diperiksa/dikoreksi. Boleh lebih dari satu berkas kalau proposalnya terdiri dari beberapa file — semua akan digabung & dianalisis sekaligus."
                            >
                                <FileUpload
                                    label="Tambahkan Berkas Proposal"
                                    name="proposal"
                                    multiple
                                    max={10}
                                    accept={ACCEPT}
                                    files={proposalFiles}
                                    onChange={setProposalFiles}
                                    error={errors?.proposal}
                                />
                            </StepCard>

                            <StepCard
                                number={2}
                                icon={Waves}
                                title="Laporan Kondisi Eksisting / Hidro-Oseanografi (opsional)"
                                description="Sumber data pembanding. Tanpa ini sistem hanya bisa mengecek kelengkapan Proposal, tidak bisa mengecek konsistensi datanya."
                            >
                                <FileUpload
                                    label="Tambahkan Berkas Laporan"
                                    name="laporan"
                                    multiple
                                    max={10}
                                    accept={ACCEPT}
                                    files={laporanFiles}
                                    onChange={setLaporanFiles}
                                    error={errors?.laporan}
                                />
                            </StepCard>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={submitting || !proposalFiles.length}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2F7FE0] to-[#123A63] p-4 text-[14.5px] font-extrabold text-white shadow-lg transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Zap className="h-5 w-5" />
                                {submitting
                                    ? 'Menganalisis dokumen…'
                                    : 'Analisis Dokumen'}
                            </button>
                            <p className="mt-2.5 text-center text-[11.5px] text-[#5b6b7c]">
                                Proses bisa memakan waktu sampai 1 menit
                                tergantung panjang dokumen.
                            </p>
                        </div>
                    </form>

                    <p className="text-center">
                        <Link
                            href="/analisis-proposal/riwayat"
                            className="text-[12.5px] font-bold text-[#1E63C7] hover:underline"
                        >
                            Lihat Riwayat Analisis Tersimpan →
                        </Link>
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
