import { Head, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import DocxPreviewViewer from '@/components/DocxPreviewViewer';
import { FIELD_GROUPS, formFieldName, getValue } from '../field-groups';
import AppLayout from '../layout';

type ImagePreview = { tag: string; url: string };

interface EgeraiJobData {
    job_id: string;
    status: string;
    prop_source_filename: string | null;
    lap_source_filename: string | null;
    prop_fields: Record<string, any>;
    lap_fields: Record<string, any>;
    prop_images: ImagePreview[];
    lap_images: ImagePreview[];
    preview_html: string | null;
    ai_fill_enabled: boolean;
}

export default function EgeraiReview({
    job,
    success,
}: {
    job: EgeraiJobData;
    success?: string;
}) {
    const [propData, setPropData] = useState<Record<string, any>>(
        job.prop_fields || {},
    );
    const [lapData, setLapData] = useState<Record<string, any>>(
        job.lap_fields || {},
    );
    const [aiFillEnabled, setAiFillEnabled] = useState(
        job.ai_fill_enabled ?? true,
    );
    const [processing, setProcessing] = useState(false);

    const handleChange = (source: string, key: string, value: string) => {
        if (source === 'prop') {
            setPropData((prev) => ({ ...prev, [key]: value }));
        } else if (source === 'lap') {
            setLapData((prev) => ({ ...prev, [key]: value }));
        } else if (source === 'prop_loc') {
            const idx = parseInt(key, 10);
            const next = [...(propData._lokasi_parts || ['', '', '', ''])];
            next[idx] = value;
            setPropData((prev) => ({ ...prev, _lokasi_parts: next }));
        }
    };

    const save = (onSuccess?: () => void) => {
        setProcessing(true);
        router.put(
            `/egerai/${job.job_id}/review`,
            {
                prop_fields: propData,
                lap_fields: lapData,
                ai_fill_enabled: aiFillEnabled,
            },
            {
                preserveScroll: true,
                onSuccess: () => onSuccess?.(),
                onFinish: () => setProcessing(false),
            },
        );
    };

    const submitSave = (event: FormEvent) => {
        event.preventDefault();
        save();
    };

    const generateAndDownload = () => {
        save(() => {
            window.location.href = `/egerai/${job.job_id}/download`;
        });
    };

    return (
        <AppLayout>
            <Head title="Tinjau & Koreksi Data — e-GeRAI KKPRL" />
            <div className="bg-[#eef3f8] text-[#1c2b3a]">
                <section className="bg-gradient-to-r from-[#eaf2fb] via-[#cfe1f6] to-[#a9cdec] px-8 py-7">
                    <div className="mx-auto max-w-[1400px]">
                        <h1 className="text-2xl font-extrabold text-[#123A63]">
                            Tinjau &amp; Koreksi Data
                        </h1>
                        <p className="mt-1.5 max-w-[640px] text-[13.5px] leading-relaxed text-[#33495e]">
                            Hasil ekstraksi dari{' '}
                            {job.prop_source_filename ?? 'proposal'}
                            {job.lap_source_filename
                                ? ` dan ${job.lap_source_filename}`
                                : ''}
                            . Koreksi kolom yang salah, lalu klik "Generate
                            Dokumen Final &amp; Unduh".
                        </p>
                        {success && (
                            <p className="mt-2 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                {success}
                            </p>
                        )}
                    </div>
                </section>

                <div className="mx-auto max-w-[1400px] px-8 pt-4 pb-10">
                    <form
                        onSubmit={submitSave}
                        className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]"
                    >
                        <div>
                            <div className="sticky top-0 z-[6] flex gap-3 bg-[#eef3f8] py-3.5">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 rounded-xl border border-[#1E63C7] bg-white p-3.5 text-[13.5px] font-bold text-[#1E63C7] shadow transition-all hover:bg-[#eef5fd] disabled:opacity-50"
                                >
                                    Simpan Perubahan
                                </button>
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={generateAndDownload}
                                    className="flex-[2] rounded-xl bg-gradient-to-r from-[#2F7FE0] to-[#123A63] p-3.5 text-[13.5px] font-extrabold text-white shadow-lg transition-all hover:brightness-105 disabled:opacity-50"
                                >
                                    Generate Dokumen Final &amp; Unduh
                                </button>
                            </div>

                            <label className="mb-[18px] flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4 text-[13px] text-[#33495e] shadow-[0_6px_24px_rgba(18,58,99,0.08)]">
                                <input
                                    type="checkbox"
                                    checked={aiFillEnabled}
                                    onChange={(e) =>
                                        setAiFillEnabled(e.target.checked)
                                    }
                                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#1E63C7]"
                                />
                                <span>
                                    <span className="font-bold text-[#123A63]">
                                        Isi data hidro-oseanografi kosong dengan estimasi AI
                                    </span>
                                    <br />
                                    Untuk data gelombang/arus/pasang surut/
                                    batimetri/luas ekosistem yang belum terisi
                                    (laporan survei tidak diunggah/tidak
                                    lengkap), AI akan mencari referensi
                                    regional dan mengisi estimasi sementara
                                    beserta sumbernya. Matikan untuk
                                    membiarkan kolom tersebut kosong dan diisi
                                    manual. (Narasi detail ekosistem mangrove/
                                    lamun/karang beserta sumbernya tetap selalu
                                    dibuat AI dari data yang sudah ada,
                                    terlepas dari status kotak centang ini.)
                                </span>
                            </label>

                            <div className="mb-[18px] rounded-2xl bg-white p-6 shadow-[0_6px_24px_rgba(18,58,99,0.08)]">
                                <h3 className="mb-3.5 text-[14.5px] font-extrabold text-[#123A63]">
                                    Data Hasil Ekstraksi (bisa dikoreksi)
                                </h3>

                                {FIELD_GROUPS.map(
                                    ([groupName, fields], groupIdx) => (
                                        <details
                                            key={groupName}
                                            className="mb-2.5 overflow-hidden rounded-xl border border-[#e3e9f0]"
                                            open={groupIdx < 3}
                                        >
                                            <summary className="flex cursor-pointer items-center justify-between bg-[#f7fafd] px-4 py-3 text-sm font-bold text-[#123A63]">
                                                {groupName}
                                            </summary>
                                            <div className="space-y-3 p-4 pt-3">
                                                {fields.map(
                                                    ([source, key, label]) => {
                                                        const fieldName =
                                                            formFieldName(
                                                                source,
                                                                key,
                                                            );
                                                        const value = getValue(
                                                            source,
                                                            key,
                                                            propData,
                                                            lapData,
                                                        );

                                                        return (
                                                            <div
                                                                key={fieldName}
                                                            >
                                                                <label className="mb-1 block text-xs font-bold text-[#5b6b7c]">
                                                                    {label}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name={
                                                                        fieldName
                                                                    }
                                                                    value={
                                                                        value
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleChange(
                                                                            source,
                                                                            key,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full rounded-lg border border-[#d3dde7] bg-white p-2.5 text-sm text-[#1c2b3a] focus:border-[#1E63C7] focus:outline-none"
                                                                />
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </details>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="sticky top-20 flex max-h-[calc(100vh-6rem)] flex-col gap-4 self-start">
                            <DocxPreviewViewer
                                htmlContent={job.preview_html}
                                title="Pratinjau Dokumen (.docx)"
                                subtitle={job.preview_html ? "Tampilan 1:1 format A4 MS Word" : "Diperbarui otomatis saat disimpan"}
                            />

                            {[...job.prop_images, ...job.lap_images].length >
                                0 && (
                                <details className="rounded-2xl bg-white p-4 shadow-[0_6px_24px_rgba(18,58,99,0.08)]">
                                    <summary className="cursor-pointer text-[13px] font-bold text-[#123A63]">
                                        Gambar Terdeteksi (
                                        {
                                            [
                                                ...job.prop_images,
                                                ...job.lap_images,
                                            ].length
                                        }
                                        )
                                    </summary>
                                    <div className="mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
                                        {[
                                            ...job.prop_images,
                                            ...job.lap_images,
                                        ].map((img, idx) => (
                                            <figure
                                                key={`${img.tag}-${idx}`}
                                                className="overflow-hidden rounded-lg border border-[#e3e9f0]"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={img.tag}
                                                    className="h-20 w-full object-cover"
                                                />
                                                <figcaption className="p-1 text-center text-[10px] text-[#5b6b7c]">
                                                    {img.tag}
                                                </figcaption>
                                            </figure>
                                        ))}
                                    </div>
                                </details>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
