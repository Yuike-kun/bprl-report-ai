import { Head, router, usePage } from '@inertiajs/react';
import { FileDown, Save } from 'lucide-react';
import AppLayout from './layout';
import CoordinateTable from '../components/coordinate-table';
import DocumentUpload from '../components/document-upload';
import { useState } from 'react';
import { FIELD_GROUPS, formFieldName, getValue } from './field-groups';

const cardClass =
    'mb-[18px] rounded-2xl bg-white px-6 py-[22px] shadow-[0_6px_24px_rgba(18,58,99,0.08)]';

const cardTitleClass =
    'm-0 mb-[14px] flex items-center gap-2 text-[14.5px] font-extrabold text-[#123A63]';

const cardIconClass = 'h-[18px] w-[18px] shrink-0 text-[#1E63C7]';

const primaryButtonClass =
    'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-[#2F7FE0] to-[#123A63] p-[15px] text-[14.5px] font-extrabold text-white shadow-[0_6px_18px_rgba(30,99,199,0.28)] hover:brightness-105 sm:flex-1';

const draftButtonClass =
    'flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-[1.5px] border-[#cfe0f5] bg-white px-5 py-[15px] text-[14.5px] font-extrabold text-[#123A63] hover:bg-[#f3f8ff] sm:flex-none sm:w-auto';

const fieldInputClass =
    'w-full rounded-lg border border-[#d3dde7] bg-white px-[13px] py-[11px] text-[18px] text-[#1c2b3a] focus:border-[#1E63C7] focus:shadow-[0_0_0_3px_rgba(47,127,224,0.15)] focus:outline-none';

const accordionItemClass =
    'group mb-[10px] overflow-hidden rounded-xl border border-[#e3e9f0] last:mb-0';

const accordionSummaryClass =
    "flex cursor-pointer list-none items-center justify-between bg-[#f7fafd] px-4 py-[13px] text-[13.5px] font-bold text-[#123A63] [&::-webkit-details-marker]:hidden after:inline-block after:content-['▼'] after:text-[12px] after:text-[#1E63C7] after:transition-transform after:duration-150 group-open:after:rotate-180";

const accordionBodyClass = 'px-4 pb-1 pt-[14px]';

const previewBoxClass =
    'max-h-[70vh] overflow-y-auto rounded-xl border border-[#e3e9f0] bg-white px-7 py-6 text-[13.5px] leading-[1.55] ' +
    '[&_table]:my-[10px] [&_table]:w-full [&_table]:border-collapse ' +
    '[&_td]:border [&_td]:border-[#c7d1db] [&_td]:px-2 [&_td]:py-[5px] [&_td]:align-top ' +
    '[&_img]:my-2 [&_img]:h-auto [&_img]:max-w-full ' +
    '[&_p]:my-1.5';

export default function KkprlKonsultasiForm() {
    const { proposal = {} } = usePage().props as any;

    const initialProp = {
        ...(proposal.prop_data || {}),
        _lokasi_parts: proposal.prop_data?._lokasi_parts || [],
    };

    const initialLap = { ...(proposal.lap_data || {}) };

    const [propData, setPropData] = useState<any>(initialProp);
    const [lapData, setLapData] = useState<any>(initialLap);

    const download = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/proposal-manual/draft';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = '_token';
        input.value =
            document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                ?.content || '';

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        form.remove();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [source, rawKey] = name.split('__');

        let key = rawKey.replace(/_/g, ' ');

        if (rawKey.includes('_')) {
            for (const [, fields] of FIELD_GROUPS) {
                for (const [src, k] of fields) {
                    if (src === source && formFieldName(src, k) === name) {
                        key = k;
                        break;
                    }
                }
            }
        }

        if (source === 'prop') {
            setPropData((prev) => ({ ...prev, [key]: value }));
        } else if (source === 'lap') {
            setLapData((prev) => ({ ...prev, [key]: value }));
        } else if (source === 'prop_loc') {
            const idx = parseInt(key, 10);
            const parts = [...(propData._lokasi_parts || [])];

            while (parts.length <= idx) parts.push('');

            parts[idx] = value;
            setPropData((prev) => ({ ...prev, _lokasi_parts: parts }));
        }
    };

    const renderField = (source: string, key: string, label: string) => (
        <div className="mb-3" key={formFieldName(source, key)}>
            <label className="mb-[5px] block text-xs font-bold text-[#5b6b7c]">
                {label}
            </label>
            <input
                type="text"
                name={formFieldName(source, key)}
                value={getValue(source, key, propData, lapData)}
                onChange={handleChange}
                className={fieldInputClass}
            />
        </div>
    );

    return (
        <AppLayout>
            <Head title="Tinjau & Koreksi Data — e-GeRAI KKPRL" />

            <div className="bg-[#eef3f8]">
                {/* Hero */}
                <section className="bg-gradient-to-br from-[#eaf2fb] via-[#cfe1f6] to-[#a9cdec] px-8 pt-[26px] pb-[34px]">
                    <h1 className="m-0 mb-1.5 text-2xl font-extrabold text-[#123A63]">
                        📝 Tinjau &amp; Koreksi Data
                    </h1>
                    <p className="m-0 max-w-[640px] text-[13.5px] leading-[1.5] text-[#33495e]">
                        Periksa hasil ekstraksi di bawah, lalu bandingkan dengan
                        pratinjau dokumen di sebelah kanan. Koreksi kolom yang
                        salah, lalu klik "Generate Dokumen Final &amp; Unduh".
                    </p>
                </section>

                {/* Content */}
                <div className="relative z-[2] mx-auto mt-[-16px] mb-10 max-w-[1600px] px-4 sm:px-10">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            router.post('/proposal-manual/finalize', {
                                prop_data: propData,
                                lap_data: lapData,
                            });
                        }}
                    >
                        <div className="grid grid-cols-1 items-start gap-[22px] min-[980px]:grid-cols-[1.15fr_0.85fr]">
                            {/* Left column */}
                            <div>
                                {/* Document upload */}
                                <div className={cardClass}>
                                    <h3 className={cardTitleClass}>
                                        <svg
                                            className={cardIconClass}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
                                            <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                                        </svg>
                                        Unggah Dokumen Pendukung
                                    </h3>

                                    <DocumentUpload
                                        number={1}
                                        title="Laporan Pendukung"
                                        description="Unggah laporan kondisi eksisting atau hidro-oseanografi (opsional)."
                                    />
                                </div>

                                {/* Sticky action buttons */}
                                <div className="sticky top-0 z-[6] bg-[#eef3f8] pt-[14px] pb-[10px]">
                                    <div className="flex flex-col gap-2.5 sm:flex-row">
                                        <button
                                            type="submit"
                                            className={primaryButtonClass}
                                        >
                                            <svg
                                                className="h-[19px] w-[19px] shrink-0"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <path d="m22 4-10 10-3-3" />
                                            </svg>
                                            Generate Dokumen Final &amp; Unduh
                                        </button>

                                        <button
                                            type="button"
                                            className={draftButtonClass}
                                            onClick={() =>
                                                router.post(
                                                    '/proposal-manual/simpan',
                                                    {
                                                        prop_data: propData,
                                                        lap_data: lapData,
                                                    },
                                                )
                                            }
                                        >
                                            <Save className="h-[19px] w-[19px] shrink-0" />
                                            Simpan Draft
                                        </button>

                                        <button
                                            type="button"
                                            className={draftButtonClass}
                                            onClick={download}
                                        >
                                            <FileDown className="h-[19px] w-[19px] shrink-0" />
                                            Unduh Draft
                                        </button>
                                    </div>
                                </div>

                                {/* Extracted fields */}
                                <div className={cardClass}>
                                    <h3 className={cardTitleClass}>
                                        <svg
                                            className={cardIconClass}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <path d="M14 2v6h6" />
                                        </svg>
                                        Data Hasil Ekstraksi (bisa dikoreksi)
                                    </h3>

                                    {FIELD_GROUPS.map(
                                        ([groupName, fields], index) => (
                                            <details
                                                key={groupName}
                                                className={accordionItemClass}
                                                open={index === 0}
                                            >
                                                <summary
                                                    className={
                                                        accordionSummaryClass
                                                    }
                                                >
                                                    {groupName}
                                                </summary>

                                                <div
                                                    className={
                                                        accordionBodyClass
                                                    }
                                                >
                                                    {fields.map(
                                                        ([src, k, lbl]) =>
                                                            renderField(
                                                                src,
                                                                k,
                                                                lbl,
                                                            ),
                                                    )}
                                                </div>
                                            </details>
                                        ),
                                    )}
                                </div>

                                {/* Coordinate table */}
                                <div className={cardClass}>
                                    <h3 className={cardTitleClass}>
                                        <svg
                                            className={cardIconClass}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <circle cx="12" cy="12" r="4" />
                                            <path d="m4.9 4.9 4.24 4.24m5.72 5.72 4.24 4.24m0-14.2-4.24 4.24m-5.72 5.72L4.9 19.1" />
                                        </svg>
                                        Koordinat Lokasi
                                    </h3>

                                    <CoordinateTable
                                        initial={proposal.coordinates}
                                    />
                                </div>
                            </div>

                            {/* Right column */}
                            <div className="min-[980px]:sticky min-[980px]:top-20">
                                <div className={cardClass}>
                                    <h3 className={cardTitleClass}>
                                        <svg
                                            className={cardIconClass}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <path d="M14 2v6h6" />
                                        </svg>
                                        Pratinjau Dokumen Lengkap
                                    </h3>

                                    <div className={previewBoxClass}>
                                        {proposal.preview_html ? (
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: proposal.preview_html,
                                                }}
                                            />
                                        ) : (
                                            <p className="m-0 mt-5 text-center text-[#5b6b7c]">
                                                Pratinjau dokumen akan muncul di
                                                sini setelah ekstraksi.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
