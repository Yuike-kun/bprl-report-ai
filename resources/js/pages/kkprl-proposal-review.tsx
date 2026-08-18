import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from './layout';
import { FIELD_GROUPS, formFieldName, getValue } from './field-groups';

interface ProposalData {
    id: number;
    applicant_name?: string;
    applicant_position?: string;
    company_name?: string;
    nib?: string;
    npwp?: string;
    phone_number?: string;
    email?: string;
    activity_type?: string;
    water_name?: string;
    area_size?: string | number;
    activity_category?: string;
    schedule_description?: string;
    province?: string;
    regency?: string;
    district?: string;
    village?: string;
    investment_value?: string | number;
    local_workers?: string | number;
    foreign_workers?: string | number;
    activity_description?: string;
    activity_benefit?: string;
    activity_purpose?: string;
    marine_installation?: string;
    is_reclamation?: boolean;
    map_source?: string;
    coordinates?: string;
    has_mangrove?: boolean;
    has_seagrass?: boolean;
    has_coral_reef?: boolean;
    marine_spatial_activity_description?: string;
    village_area?: string | number;
    population_count?: string | number;
    livelihood_description?: string;
    sosek_data_source?: string;
    sosek_data_year?: string;
    accessibility_description?: string;
    [key: string]: any;
}

export default function KKPRLProposalReview({ kkprlProposal }: { kkprlProposal: ProposalData }) {
    // Map database fields to prop_data and lap_data dictionaries
    const [propData, setPropData] = useState<Record<string, any>>({
        'Nama Pemohon': kkprlProposal.applicant_name || '',
        'Jabatan Pemohon': kkprlProposal.applicant_position || '',
        'Nama Perusahaan/Instansi': kkprlProposal.company_name || '',
        'NIB': kkprlProposal.nib || '',
        'NPWP': kkprlProposal.npwp || '',
        'Nomor Telepon Selular': kkprlProposal.phone_number || '',
        'Surat Elektronik': kkprlProposal.email || '',
        'Jenis Kegiatan': kkprlProposal.activity_type || '',
        'Nama Perairan': kkprlProposal.water_name || '',
        'Luas Kebutuhan Ruang': kkprlProposal.area_size || '',
        'KBLI': kkprlProposal.activity_category || '',
        'Tanggal Penyusunan': kkprlProposal.created_at ? String(kkprlProposal.created_at).split('T')[0] : '',
        'investasi': kkprlProposal.investment_value || '',
        'tenaga_kerja': kkprlProposal.local_workers || '',
        'tenaga_kerja_asing': kkprlProposal.foreign_workers || '',
        'desa_luas_ha': kkprlProposal.village_area || '',
        'desa_penduduk': kkprlProposal.population_count || '',
        '_lokasi_parts': [
            kkprlProposal.village || '',
            kkprlProposal.district || '',
            kkprlProposal.regency || '',
            kkprlProposal.province || '',
        ],
    });

    const [lapData, setLapData] = useState<Record<string, any>>({
        'eko_total_ha': '',
        'eko_karang_ha': '',
        'eko_karang_pct': kkprlProposal.coral_reef_cover_percentage || '',
        'eko_lainnya_ha': '',
        'eko_lainnya_pct': '',
        'eko_terbuka_ha': '',
        'eko_terbuka_pct': '',
        'eko_jarak_terdekat_km': '',
        'batimetri_titik_pusat': '',
        'batimetri_panjang_lintasan': '',
        'batimetri_terdalam': '',
        'hs_rata': '',
        'hs_maks': '',
        'hs_arah': '',
        'arus_rata': '',
        'arus_maks': '',
        'arus_arah': '',
        'hat': '',
        'msl': '',
        'lat': '',
        'tidal_range': '',
        'formzahl': '',
        'tipe_pasut': '',
    });

    const handleInputChange = (source: string, key: string, value: string) => {
        if (source === 'prop') {
            setPropData((prev) => ({ ...prev, [key]: value }));
        } else if (source === 'lap') {
            setLapData((prev) => ({ ...prev, [key]: value }));
        } else if (source === 'prop_loc') {
            const idx = parseInt(key, 10);
            const newLoc = [...(propData._lokasi_parts || ['', '', '', ''])];
            newLoc[idx] = value;
            setPropData((prev) => ({ ...prev, _lokasi_parts: newLoc }));
        }
    };

    const handleFinalize = (e: React.FormEvent) => {
        e.preventDefault();

        // Map back to Laravel backend expectations
        const payload = {
            applicant_name: propData['Nama Pemohon'],
            applicant_position: propData['Jabatan Pemohon'],
            company_name: propData['Nama Perusahaan/Instansi'],
            nib: propData['NIB'],
            npwp: propData['NPWP'],
            phone_number: propData['Nomor Telepon Selular'],
            email: propData['Surat Elektronik'],
            activity_type: propData['Jenis Kegiatan'],
            water_name: propData['Nama Perairan'],
            area_size: propData['Luas Kebutuhan Ruang'],
            activity_category: propData['KBLI'],
            village: propData._lokasi_parts[0],
            district: propData._lokasi_parts[1],
            regency: propData._lokasi_parts[2],
            province: propData._lokasi_parts[3],
            investment_value: propData['investasi'],
            local_workers: propData['tenaga_kerja'],
            foreign_workers: propData['tenaga_kerja_asing'],
            village_area: propData['desa_luas_ha'],
            population_count: propData['desa_penduduk'],
        };

        router.post(`/kkprl-proposal/${kkprlProposal.id}/finalize`, payload, {
            onSuccess: () => {
                window.location.href = `/pkkprl/download-kkprl-proposal/${kkprlProposal.id}`;
            },
        });
    };



    return (
        <AppLayout>
            <Head title="Tinjau & Koreksi Data — e-GerAI KKPRL" />

            <div className="bg-[#eef3f8] text-[#1c2b3a]">
                <section className="bg-gradient-to-r from-[#eaf2fb] via-[#cfe1f6] to-[#a9cdec] px-8 py-7">
                    <div className="mx-auto max-w-[1600px]">
                        <h1 className="text-2xl font-extrabold text-[#123A63]">📝 Tinjau &amp; Koreksi Data</h1>
                        <p className="mt-1.5 max-w-[640px] text-[13.5px] leading-relaxed text-[#33495e]">
                            Periksa hasil ekstraksi di bawah, lalu bandingkan dengan pratinjau dokumen di sebelah kanan.
                            Koreksi kolom yang salah, lalu klik "Generate Dokumen Final &amp; Unduh".
                        </p>
                    </div>
                </section>

                <div className="mx-auto max-w-[1600px] px-8 pb-10 pt-4">
                    <form onSubmit={handleFinalize}>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                            {/* Left Column: Field Groups rendered from FIELD_GROUPS */}
                            <div>
                                <div className="sticky top-0 z-[6] bg-[#eef3f8] py-3.5">
                                    <button
                                        type="submit"
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2F7FE0] to-[#123A63] p-4 text-[14.5px] font-extrabold text-white shadow-lg transition-all hover:brightness-105"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <path d="m22 4-10 10-3-3" />
                                        </svg>
                                        Generate Dokumen Final &amp; Unduh
                                    </button>
                                </div>

                                <div className="mb-[18px] rounded-2xl bg-white p-6 shadow-[0_6px_24px_rgba(18,58,99,0.08)]">
                                    <h3 className="mb-3.5 flex items-center gap-2 text-[14.5px] font-extrabold text-[#123A63]">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1E63C7]">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <path d="M14 2v6h6" />
                                        </svg>
                                        Data Hasil Ekstraksi (bisa dikoreksi)
                                    </h3>

                                    {FIELD_GROUPS.map(([groupName, fields], groupIdx) => (
                                        <details
                                            key={groupName}
                                            className="mb-2.5 overflow-hidden rounded-xl border border-[#e3e9f0]"
                                            open={groupIdx === 0}
                                        >
                                            <summary className="flex cursor-pointer items-center justify-between bg-[#f7fafd] px-4 py-3 text-sm font-bold text-[#123A63]">
                                                {groupName}
                                            </summary>
                                            <div className="p-4 pt-3 space-y-3">
                                                {fields.map(([source, key, label]) => {
                                                    const fieldName = formFieldName(source, key);
                                                    const val = getValue(source, key, propData, lapData);

                                                    return (
                                                        <div key={fieldName}>
                                                            <label className="mb-1 block text-xs font-bold text-[#5b6b7c]">
                                                                {label}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name={fieldName}
                                                                value={val}
                                                                onChange={(e) => handleInputChange(source, key, e.target.value)}
                                                                className="w-full rounded-lg border border-[#d3dde7] bg-white p-2.5 text-sm text-[#1c2b3a] focus:border-[#1E63C7] focus:outline-none"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Live Document Preview */}
                            <div className="sticky top-20">
                                <div className="rounded-2xl bg-white p-6 shadow-[0_6px_24px_rgba(18,58,99,0.08)]">
                                    <h3 className="mb-3.5 flex items-center gap-2 text-[14.5px] font-extrabold text-[#123A63]">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1E63C7]">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <path d="M14 2v6h6" />
                                        </svg>
                                        Pratinjau Dokumen Lengkap
                                    </h3>

                                    <div className="max-h-[75vh] overflow-y-auto rounded-xl border border-[#e3e9f0] bg-white p-6 text-[13.5px] leading-relaxed">
                                        <p className="text-center font-bold">DRAFT PROPOSAL TEKNIS</p>
                                        <p className="text-center font-bold">
                                            PERMOHONAN PERSETUJUAN KESESUAIAN KEGIATAN<br />
                                            PEMANFAATAN RUANG LAUT (PKKPRL)
                                        </p>
                                        <p className="mt-2 text-center text-xs italic">
                                            Disusun mengacu pada Peraturan Menteri Kelautan dan Perikanan Nomor 28 Tahun 2021 tentang Penyelenggaraan Penataan Ruang Laut
                                        </p>

                                        <table className="my-4 w-full border-collapse border border-[#c7d1db] text-xs">
                                            <tbody>
                                                <tr>
                                                    <td className="border border-[#c7d1db] p-2 font-bold">Nama Pemohon</td>
                                                    <td className="border border-[#c7d1db] p-2">{propData['Nama Pemohon'] || '[data belum diisi]'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#c7d1db] p-2 font-bold">Jabatan Pemohon</td>
                                                    <td className="border border-[#c7d1db] p-2">{propData['Jabatan Pemohon'] || '[data belum diisi]'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#c7d1db] p-2 font-bold">Nama Perusahaan/Instansi</td>
                                                    <td className="border border-[#c7d1db] p-2">{propData['Nama Perusahaan/Instansi'] || '[data belum diisi]'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#c7d1db] p-2 font-bold">NIB</td>
                                                    <td className="border border-[#c7d1db] p-2">{propData['NIB'] || '[data belum diisi]'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#c7d1db] p-2 font-bold">NPWP</td>
                                                    <td className="border border-[#c7d1db] p-2">{propData['NPWP'] || '[data belum diisi]'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#c7d1db] p-2 font-bold">Nomor Telepon Selular</td>
                                                    <td className="border border-[#c7d1db] p-2">{propData['Nomor Telepon Selular'] || '[data belum diisi]'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#c7d1db] p-2 font-bold">Surat Elektronik</td>
                                                    <td className="border border-[#c7d1db] p-2">{propData['Surat Elektronik'] || '[data belum diisi]'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#c7d1db] p-2 font-bold">Jenis Kegiatan</td>
                                                    <td className="border border-[#c7d1db] p-2">{propData['Jenis Kegiatan'] || '[data belum diisi]'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#c7d1db] p-2 font-bold">Lokasi Kegiatan</td>
                                                    <td className="border border-[#c7d1db] p-2">
                                                        Desa {propData._lokasi_parts[0] || '-'}, Kecamatan {propData._lokasi_parts[1] || '-'}, {propData._lokasi_parts[2] || '-'}, Provinsi {propData._lokasi_parts[3] || '-'}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#c7d1db] p-2 font-bold">Nama Perairan</td>
                                                    <td className="border border-[#c7d1db] p-2">{propData['Nama Perairan'] || '[data belum diisi]'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#c7d1db] p-2 font-bold">Luas Kebutuhan Ruang</td>
                                                    <td className="border border-[#c7d1db] p-2">{propData['Luas Kebutuhan Ruang'] ? `${propData['Luas Kebutuhan Ruang']} Ha` : '[data belum diisi]'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#c7d1db] p-2 font-bold">KBLI</td>
                                                    <td className="border border-[#c7d1db] p-2">{propData['KBLI'] || '[data belum diisi]'}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <div className="mt-4 space-y-3">
                                            <p className="font-bold">I. RENCANA BANGUNAN DAN INSTALASI LAUT</p>
                                            <p>
                                                {propData['Nama Perusahaan/Instansi'] || 'Pemohon'} yang diwakili oleh {propData['Nama Pemohon'] || 'PIC'} berencana menyelenggarakan kegiatan berupa {propData['Jenis Kegiatan'] || '-'}. Rencana kegiatan ini berlokasi di Desa {propData._lokasi_parts[0] || '-'}, Kecamatan {propData._lokasi_parts[1] || '-'}, {propData._lokasi_parts[2] || '-'}, Provinsi {propData._lokasi_parts[3] || '-'}, menggunakan perairan {propData['Nama Perairan'] || '-'} dengan total kebutuhan luas ruang laut yang dimohonkan sebesar {propData['Luas Kebutuhan Ruang'] || '-'} Ha.
                                            </p>
                                        </div>
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
