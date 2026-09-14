import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import DocumentUpload from '@/components/document-upload';
import AppLayout from '../layout';

export default function EgeraiCreate() {
    const { data, setData, post, processing, errors } = useForm<{
        proposal: File | null;
        laporan: File | null;
    }>({ proposal: null, laporan: null });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/egerai');
    };

    return (
        <AppLayout>
            <Head title="Unggah Proposal PKKPRL" />
            <div className="bg-[#eef3f8] px-8 py-10 text-[#1c2b3a]">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#123A63]">
                            Penggabung Proposal PKKPRL
                        </h1>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#33495e]">
                            Unggah Draft Proposal PKKPRL dan (opsional) Laporan
                            Kondisi/Hidro-Oseanografi. Sistem akan mengekstrak
                            data secara otomatis, lalu Anda dapat meninjau dan
                            mengoreksi hasilnya sebelum dokumen final
                            dihasilkan.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <DocumentUpload
                            number={1}
                            title="Draft Proposal PKKPRL"
                            description="Dokumen PDF/Word berisi identitas pemohon, jenis kegiatan, lokasi, dan uraian kegiatan."
                            onFile={(file) => setData('proposal', file ?? null)}
                        />
                        {errors.proposal && (
                            <p className="text-sm text-red-600">
                                {errors.proposal}
                            </p>
                        )}

                        <DocumentUpload
                            number={2}
                            title="Laporan Kondisi/Hidro-Oseanografi (opsional)"
                            description="Dokumen PDF/Word berisi data gelombang, arus, pasang surut, batimetri, dan ekosistem pesisir."
                            onFile={(file) => setData('laporan', file ?? null)}
                        />
                        {errors.laporan && (
                            <p className="text-sm text-red-600">
                                {errors.laporan}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={processing || !data.proposal}
                            className="w-full rounded-xl bg-gradient-to-r from-[#2F7FE0] to-[#123A63] p-4 text-[14.5px] font-extrabold text-white shadow-lg transition-all hover:brightness-105 disabled:opacity-50"
                        >
                            {processing
                                ? 'Mengekstrak dokumen…'
                                : 'Ekstrak & Tinjau'}
                        </button>
                    </form>

                    <a
                        href="/proposal-manual"
                        className="mt-4 block text-center text-[12.5px] font-bold text-[#1E63C7]"
                    >
                        Belum punya file Draft Proposal? Isi formulir manual →
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
