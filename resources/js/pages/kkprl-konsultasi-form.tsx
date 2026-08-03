import React, { useEffect, useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import HomeLayout from './layout';
import {
    Info,
    Upload,
    ChevronDown,
    FileText,
    CheckCircle2,
    AlertCircle,
    X,
    Send,
    RotateCcw,
} from 'lucide-react';

const sections = [
    { id: 'pemohon', num: '01', title: 'Informasi Pemohon', desc: 'Data diri & perusahaan pemohon.' },
    { id: 'lokasi', num: '02', title: 'Detail Lokasi', desc: 'Alamat dan koordinat lokasi kegiatan.' },
    { id: 'kegiatan', num: '03', title: 'Rincian Kegiatan', desc: 'Jenis, deskripsi, dan tujuan kegiatan.' },
    { id: 'tenaga-kerja', num: '04', title: 'Tenaga Kerja & Investasi', desc: 'SDM dan nilai investasi kegiatan.' },
    { id: 'dokumen', num: '05', title: 'Dokumen Data Dukung', desc: 'Dokumen yang wajib diunggah.' },
    { id: 'sosek', num: '06', title: 'Sosial Ekonomi & Aksesibilitas', desc: 'Kondisi masyarakat desa sekitar.' },
    { id: 'kondisi-lokasi', num: '07', title: 'Kondisi Terkini Lokasi', desc: 'Hidro-oseanografi & ekosistem pesisir.' },
    { id: 'ruang-laut', num: '08', title: 'Pemanfaatan Ruang Laut', desc: 'Aktivitas sekitar lokasi & dokumentasi.' },
    { id: 'persyaratan', num: '09', title: 'Petugas & Dokumen Lainnya', desc: 'Email petugas & dokumen pelengkap.' },
];

// ===== Komponen Reusable =====
const FormField = ({
    label,
    required,
    htmlFor,
    hint,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    htmlFor?: string;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) => (
    <div className="space-y-2">
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-800">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
        {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
            </p>
        )}
    </div>
);

const PillChoice = ({
    options,
    value,
    onChange,
    type = 'radio',
}: {
    options: string[];
    value: string | string[];
    onChange: (v: any) => void;
    type?: 'radio' | 'checkbox';
}) => (
    <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
            const isSelected =
                type === 'radio' ? value === opt : Array.isArray(value) && value.includes(opt);

            return (
                <button
                    key={opt}
                    type="button"
                    role={type}
                    aria-checked={isSelected}
                    onClick={() => {
                        if (type === 'radio') {
                            onChange(opt);
                        } else {
                            const current = value as string[];
                            if (isSelected) {
                                onChange(current.filter((v) => v !== opt));
                            } else {
                                onChange([...current, opt]);
                            }
                        }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                >
                    {opt}
                </button>
            );
        })}
    </div>
);

const Section = ({
    id,
    num,
    title,
    desc,
    children,
}: {
    id: string;
    num: string;
    title: string;
    desc: string;
    children: React.ReactNode;
}) => (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="mb-6 flex items-start gap-4 border-b border-slate-100 pb-6">
            <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white font-mono text-sm font-bold shadow-md shadow-blue-600/20">
                {num}
            </div>
            <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 md:text-xl">{title}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
            </div>
        </div>
        <div className="space-y-5">{children}</div>
    </section>
);

// Upgrade kecil: tambah prop required & hint
const FileUploadCard = ({ label, id, fileName, onChange, onRemove, error, required, hint }: any) => (
    <div>
        <span className="block text-sm font-semibold text-slate-800 mb-2">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
        <label
            htmlFor={id}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer p-5 text-center"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Upload className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-700">Tambahkan file</p>
                <p className="text-xs text-slate-500 mt-0.5">{hint || 'PDF, JPG, atau PNG · Maks 10 MB'}</p>
            </div>
            <input id={id} type="file" onChange={onChange} className="sr-only" />
        </label>
        {fileName && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{fileName}</span>
                <button type="button" onClick={onRemove} className="ml-auto shrink-0 hover:text-emerald-900">
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        )}
        {error && (
            <p className="flex items-center gap-1 text-xs text-red-600 mt-2">
                <AlertCircle className="h-3 w-3" />
                {error}
            </p>
        )}
    </div>
);

// Tabel kriteria baku (referensi kondisi ekosistem)
const CriteriaTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500">
                <tr>
                    {headers.map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                    <tr key={i}>
                        {r.map((c, j) => (
                            <td key={j} className="px-3 py-2 text-slate-600 whitespace-nowrap">{c}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// Upload banyak file (dokumentasi ruang laut)
const MAX_MARINE_DOCS = 3;
const MultiFileUploadCard = ({ id, label, files, onAdd, onRemove, error, required }: any) => (
    <div className="space-y-2">
        <span className="block text-sm font-semibold text-slate-800">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
        {files.length > 0 && (
            <div className="space-y-2">
                {files.map((f: File, i: number) => (
                    <div key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{f.name}</span>
                        <button type="button" onClick={() => onRemove(i)} className="ml-auto shrink-0 hover:text-emerald-900">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        )}
        <label
            htmlFor={id}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer p-5 text-center"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Upload className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-700">Tambahkan file</p>
                <p className="text-xs text-slate-500 mt-0.5">
                    Maks {MAX_MARINE_DOCS} dokumentasi · Maks 10 MB per file
                </p>
            </div>
            <input id={id} type="file" multiple onChange={onAdd} className="sr-only" />
        </label>
        {error && (
            <p className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                {error}
            </p>
        )}
    </div>
);

// Config 3 ekosistem — struktur sama, jadi dirender via map
const ecosystemConfig = [
    {
        name: 'Mangrove',
        hasKey: 'has_mangrove', speciesKey: 'mangrove_species', coverKey: 'mangrove_cover_percentage',
        conditionKey: 'mangrove_condition', docKey: 'mangrove_doc_path',
        conditions: ['Sangat Padat', 'Sedang', 'Jarang'],
        criteria: {
            headers: ['Status Kondisi', 'Kerapatan', 'Persentase Tutupan', 'Kerapatan Pohon (pohon/ha)'],
            rows: [
                ['Baik', 'Sangat Padat', '≥ 75%', '> 1.500'],
                ['Baik', 'Sedang', '> 50% s.d. < 75%', '> 1.000 s.d. < 1.500'],
                ['Rusak', 'Jarang', '< 50%', '< 1.000'],
            ],
        },
    },
    {
        name: 'Lamun',
        hasKey: 'has_seagrass', speciesKey: 'seagrass_species', coverKey: 'seagrass_cover_percentage',
        conditionKey: 'seagrass_condition', docKey: 'seagrass_doc_path',
        conditions: ['Sangat Sehat', 'Kurang Sehat', 'Miskin'],
        criteria: {
            headers: ['Status', 'Kondisi', 'Persentase Tutupan (%)'],
            rows: [
                ['Kaya / Sehat', 'Sangat Kaya', '≥ 60%'],
                ['Kurang Kaya / Kurang Sehat', 'Sedang', '30% s.d. 59,9%'],
                ['Miskin / Rusak', 'Jarang', '< 30%'],
            ],
        },
    },
    {
        name: 'Terumbu Karang',
        hasKey: 'has_coral_reef', speciesKey: 'coral_reef_species', coverKey: 'coral_reef_cover_percentage',
        conditionKey: 'coral_reef_condition', docKey: 'coral_reef_doc_path',
        conditions: ['Sangat Baik', 'Baik', 'Sedang'],
        criteria: {
            headers: ['Kategori Status', 'Kondisi', 'Tutupan Karang Hidup (%)'],
            rows: [
                ['Baik', 'Sangat Baik', '75% s.d. 100%'],
                ['Baik', 'Baik', '50% s.d. 74,9%'],
                ['Rusak', 'Sedang', '25% s.d. 49,9%'],
            ],
        },
    },
];

// ===== Komponen Utama =====
export default function Create() {
    const { data, setData, post, processing, errors, progress, reset, transform } = useForm({
        is_reclamation: 'false',
        applicant_name: '',
        applicant_position: '',
        company_name: '',
        nib: '',
        npwp: '',
        phone_number: '',
        email: '',
        activity_details: [] as string[],
        village: '',
        district: '',
        regency: '',
        province: '',
        water_name: '',
        area_size: '',
        activity_status: '',
        activity_category: '',
        activity_type: '',
        marine_installation: '',
        installation_location: [] as string[],
        activity_description: '',
        activity_benefit: '',
        activity_purpose: '',
        local_workers: '',
        foreign_workers: '',
        investment_value: '',
        schedule_description: '',
        supporting_documents: [] as string[],
        coordinates: '',
        existing_doc_path: null as File | null,
        site_plan_path: null as File | null,
        location_map_path: null as File | null,
        map_source: '',
        // Sosial ekonomi & aksesibilitas
        population_count: '',
        village_area: '',
        livelihood_description: '',
        sosek_data_source: '',
        sosek_data_year: '',
        accessibility_description: '',
        accessibility_map_path: null as File | null,
        // Kondisi terkini lokasi
        hydro_oceanography_doc_path: null as File | null,
        has_mangrove: '',
        mangrove_species: '',
        mangrove_cover_percentage: '',
        mangrove_condition: '',
        mangrove_doc_path: null as File | null,
        has_seagrass: '',
        seagrass_species: '',
        seagrass_cover_percentage: '',
        seagrass_condition: '',
        seagrass_doc_path: null as File | null,
        has_coral_reef: '',
        coral_reef_species: '',
        coral_reef_cover_percentage: '',
        coral_reef_condition: '',
        coral_reef_doc_path: null as File | null,
        // Pemanfaatan ruang laut
        marine_spatial_activity_description: '',
        marine_spatial_docs: [] as File[],
        // Petugas & dokumen lainnya
        officer_email: '',
        land_certificate_path: null as File | null,
        socialization_doc_path: null as File | null,
        other_supporting_doc_path: null as File | null,
    });

    const [activeSection, setActiveSection] = useState('pemohon');
    const [fileNames, setFileNames] = useState<Record<string, string>>({});

    // Scroll spy untuk sidebar
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
        );

        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 96;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    const handleMarineDocsAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const added = Array.from(e.target.files || []);
        setData('marine_spatial_docs', [...data.marine_spatial_docs, ...added].slice(0, MAX_MARINE_DOCS));
        e.target.value = '';
    };

    const handleMarineDocsRemove = (index: number) => {
        setData('marine_spatial_docs', data.marine_spatial_docs.filter((_, i) => i !== index));
    };

    const handleFileChange = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFileNames((prev) => ({ ...prev, [id]: file?.name || '' }));
        setData(id as any, file);
    };

    const handleFileRemove = (id: string) => {
        setFileNames((prev) => ({ ...prev, [id]: '' }));
        setData(id as any, null);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((data) => ({
            ...data,
            is_reclamation: data.is_reclamation === 'true' ? 1 : 0,
            has_mangrove: data.has_mangrove === 'true' ? 1 : 0,
            has_seagrass: data.has_seagrass === 'true' ? 1 : 0,
            has_coral_reef: data.has_coral_reef === 'true' ? 1 : 0,
        }));
        post('/kkprl-proposal', {
            forceFormData: true,
            onSuccess: () => {
                alert('Proposal berhasil dikirim!');
                reset();
                setFileNames({});
            },
        });
    };

    const activeIndex = sections.findIndex((s) => s.id === activeSection);

    return (
        <HomeLayout>
            <Head title="Pengajuan KKPRL" />
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
                <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                    {/* ===== Sidebar Desktop ===== */}
                    <aside className="hidden lg:block">
                        <div className="fixed bg-white p-6 rounded-lg">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                                Formulir · {sections.length} bagian
                            </p>
                            <div className="space-y-1">
                                {sections.map((s) => {
                                    const isActive = activeSection === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => scrollToSection(s.id)}
                                            className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${isActive
                                                ? 'bg-blue-50 border-l-2 border-blue-600 -ml-px'
                                                : 'border-l-2 border-transparent hover:bg-slate-50'
                                                }`}
                                        >
                                            <span
                                                className={`font-mono text-xs font-bold pt-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'
                                                    }`}
                                            >
                                                {s.num}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`text-sm font-semibold ${isActive ? 'text-blue-900' : 'text-slate-700'
                                                        }`}
                                                >
                                                    {s.title}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                    {s.desc}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* ===== Main ===== */}
                    <main className='bg-white p-6 rounded-lg shadow-xl'>
                        {/* Header */}
                        <header className="mb-8">
                            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3">
                                <FileText className="h-3.5 w-3.5" />
                                Formulir Pengajuan
                            </div>
                            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
                                Persetujuan Kesesuaian Kegiatan Pemanfaatan Ruang Laut
                            </h1>
                            <p className="mt-2 text-slate-600 max-w-2xl text-sm md:text-base">
                                Ajukan permohonan KKPRL untuk kegiatan di ruang laut. Data yang Anda isi
                                akan diproses oleh petugas BPRL Makassar sesuai prosedur pelayanan.
                            </p>

                            <details className="mt-5 group">
                                <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                                    <Info className="h-4 w-4" />
                                    Petunjuk pengisian
                                    <ChevronDown className="h-4 w-4 ml-auto transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-sm text-slate-700 space-y-2">
                                    <p>
                                        Sebelum mengisi formulir, pemohon wajib mengakses portal Gerai
                                        Pelayanan Balai Penataan Ruang Laut untuk memperoleh{' '}
                                        <strong>data Hidro-Oseanografi</strong>.
                                    </p>
                                    <a
                                        href="#"
                                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                        Buka portal data hidro-oseanografi →
                                    </a>
                                    <p className="text-xs text-slate-500 pt-2 border-t border-blue-100">
                                        Data tersebut wajib diunggah pada bagian{' '}
                                        <strong>Dokumen Data Dukung</strong>.
                                    </p>
                                </div>
                            </details>
                        </header>

                        {/* Mobile Progress */}
                        <div className="lg:hidden mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">
                                    Bagian {activeIndex + 1} dari {sections.length} ·{' '}
                                    <span className="font-semibold text-slate-800">
                                        {sections[activeIndex]?.title}
                                    </span>
                                </span>
                                <button
                                    onClick={() => {
                                        if (activeIndex < sections.length - 1) {
                                            scrollToSection(sections[activeIndex + 1].id);
                                        }
                                    }}
                                    disabled={activeIndex >= sections.length - 1}
                                    className="text-blue-600 font-semibold disabled:text-slate-300"
                                >
                                    Selanjutnya →
                                </button>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300"
                                    style={{
                                        width: `${((activeIndex + 1) / sections.length) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-6">
                            {/* ===== Section 1: Pemohon ===== */}
                            <Section
                                id="pemohon"
                                num="01"
                                title="Informasi Pemohon"
                                desc="Data diri dan perusahaan pemohon."
                            >
                                <FormField
                                    label="Kegiatan ini termasuk reklamasi?"
                                    required
                                    error={errors.is_reclamation}
                                >
                                    <PillChoice
                                        options={['Bukan Kegiatan Reklamasi', 'Kegiatan Reklamasi']}
                                        value={
                                            data.is_reclamation === 'true'
                                                ? 'Kegiatan Reklamasi'
                                                : 'Bukan Kegiatan Reklamasi'
                                        }
                                        onChange={(v: string) =>
                                            setData(
                                                'is_reclamation',
                                                v === 'Kegiatan Reklamasi' ? 'true' : 'false'
                                            )
                                        }
                                    />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField
                                        label="Nama Pemohon"
                                        required
                                        htmlFor="applicant_name"
                                        error={errors.applicant_name}
                                    >
                                        <Input
                                            id="applicant_name"
                                            value={data.applicant_name}
                                            onChange={(e) => setData('applicant_name', e.target.value)}
                                            placeholder="Nama lengkap"
                                        />
                                    </FormField>
                                    <FormField
                                        label="Jabatan"
                                        required
                                        htmlFor="applicant_position"
                                        error={errors.applicant_position}
                                    >
                                        <Input
                                            id="applicant_position"
                                            value={data.applicant_position}
                                            onChange={(e) => setData('applicant_position', e.target.value)}
                                            placeholder="Jabatan di perusahaan"
                                        />
                                    </FormField>
                                </div>

                                <FormField
                                    label="Nama Perusahaan / Instansi"
                                    required
                                    htmlFor="company_name"
                                    error={errors.company_name}
                                >
                                    <Input
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="Nama resmi perusahaan"
                                    />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField
                                        label="NIB"
                                        htmlFor="nib"
                                        hint="Kosongkan dengan tanda '-' jika tidak ada"
                                        error={errors.nib}
                                    >
                                        <Input
                                            id="nib"
                                            value={data.nib}
                                            onChange={(e) => setData('nib', e.target.value)}
                                            placeholder="Nomor Induk Berusaha"
                                        />
                                    </FormField>
                                    <FormField
                                        label="NPWP"
                                        htmlFor="npwp"
                                        hint="Kosongkan dengan tanda '-' jika tidak ada"
                                        error={errors.npwp}
                                    >
                                        <Input
                                            id="npwp"
                                            value={data.npwp}
                                            onChange={(e) => setData('npwp', e.target.value)}
                                            placeholder="Nomor Pokok Wajib Pajak"
                                        />
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField
                                        label="Nomor Telepon"
                                        required
                                        htmlFor="phone_number"
                                        error={errors.phone_number}
                                    >
                                        <Input
                                            id="phone_number"
                                            value={data.phone_number}
                                            onChange={(e) => setData('phone_number', e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </FormField>
                                    <FormField
                                        label="Email"
                                        required
                                        htmlFor="email"
                                        error={errors.email}
                                    >
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="email@perusahaan.com"
                                        />
                                    </FormField>
                                </div>
                            </Section>

                            {/* ===== Section 2: Lokasi ===== */}
                            <Section
                                id="lokasi"
                                num="02"
                                title="Detail Lokasi"
                                desc="Alamat dan koordinat lokasi kegiatan."
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField
                                        label="Desa / Kelurahan"
                                        required
                                        htmlFor="village"
                                        error={errors.village}
                                    >
                                        <Input
                                            id="village"
                                            value={data.village}
                                            onChange={(e) => setData('village', e.target.value)}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Kecamatan"
                                        required
                                        htmlFor="district"
                                        error={errors.district}
                                    >
                                        <Input
                                            id="district"
                                            value={data.district}
                                            onChange={(e) => setData('district', e.target.value)}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Kabupaten / Kota"
                                        required
                                        htmlFor="regency"
                                        error={errors.regency}
                                    >
                                        <Input
                                            id="regency"
                                            value={data.regency}
                                            onChange={(e) => setData('regency', e.target.value)}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Provinsi"
                                        required
                                        htmlFor="province"
                                        error={errors.province}
                                    >
                                        <Input
                                            id="province"
                                            value={data.province}
                                            onChange={(e) => setData('province', e.target.value)}
                                        />
                                    </FormField>
                                </div>

                                <FormField label="Nama Perairan" required error={errors.water_name}>
                                    <PillChoice
                                        options={[
                                            'Laut Banda',
                                            'Laut Sulawesi',
                                            'Laut Flores',
                                            'Selat Makassar',
                                            'Teluk Bone',
                                            'Teluk Tomini',
                                            'Lainnya',
                                        ]}
                                        value={data.water_name}
                                        onChange={(v: string) => setData('water_name', v)}
                                    />
                                </FormField>

                                <FormField
                                    label="Luas Area (hektar)"
                                    required
                                    htmlFor="area_size"
                                    hint="Contoh: 0.54"
                                    error={errors.area_size}
                                >
                                    <Input
                                        id="area_size"
                                        type="number"
                                        step="0.0001"
                                        value={data.area_size}
                                        onChange={(e) => setData('area_size', e.target.value)}
                                        placeholder="0.54"
                                    />
                                </FormField>

                                <FormField
                                    label="Titik Koordinat Lokasi"
                                    required
                                    htmlFor="coordinates"
                                    hint="Format: 122.650194 -3.934945"
                                    error={errors.coordinates}
                                >
                                    <Textarea
                                        id="coordinates"
                                        value={data.coordinates}
                                        onChange={(e) => setData('coordinates', e.target.value)}
                                        className="font-mono text-xs"
                                        rows={3}
                                    />
                                </FormField>
                            </Section>

                            {/* ===== Section 3: Kegiatan ===== */}
                            <Section
                                id="kegiatan"
                                num="03"
                                title="Rincian Kegiatan"
                                desc="Jenis, deskripsi, dan tujuan kegiatan."
                            >
                                <FormField
                                    label="Detail Kegiatan"
                                    required
                                    error={errors.activity_details}
                                >
                                    <PillChoice
                                        options={[
                                            'Pemanfaatan Air Laut untuk Budi Daya',
                                            'Keramba Jaring Apung',
                                            'Dermaga',
                                        ]}
                                        value={data.activity_details}
                                        onChange={(v: string[]) => setData('activity_details', v)}
                                        type="checkbox"
                                    />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField
                                        label="Status Kegiatan"
                                        required
                                        error={errors.activity_status}
                                    >
                                        <PillChoice
                                            options={['Eksisting', 'Rencana']}
                                            value={data.activity_status}
                                            onChange={(v: string) => setData('activity_status', v)}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Kategori Kegiatan"
                                        required
                                        error={errors.activity_category}
                                    >
                                        <PillChoice
                                            options={['Berusaha', 'Non Berusaha']}
                                            value={data.activity_category}
                                            onChange={(v: string) => setData('activity_category', v)}
                                        />
                                    </FormField>
                                </div>

                                <FormField label="Jenis Kegiatan" required error={errors.activity_type}>
                                    <PillChoice
                                        options={[
                                            'Kegiatan Strategis Nasional',
                                            'Kegiatan Non-Strategis Nasional',
                                        ]}
                                        value={data.activity_type}
                                        onChange={(v: string) => setData('activity_type', v)}
                                    />
                                </FormField>

                                <FormField
                                    label="Instalasi Bangunan Menetap di Laut"
                                    htmlFor="marine_installation"
                                    hint="Contoh: Saluran Inlet atau Outlet"
                                    error={errors.marine_installation}
                                >
                                    <Input
                                        id="marine_installation"
                                        value={data.marine_installation}
                                        onChange={(e) => setData('marine_installation', e.target.value)}
                                    />
                                </FormField>

                                <FormField
                                    label="Lokasi instalasi bangunan laut"
                                    error={errors.installation_location}
                                >
                                    <PillChoice
                                        options={['Permukaan Laut', 'Kolom Laut', 'Dasar Laut']}
                                        value={data.installation_location}
                                        onChange={(v: string[]) => setData('installation_location', v)}
                                        type="checkbox"
                                    />
                                </FormField>

                                <FormField
                                    label="Deskripsi Kegiatan"
                                    required
                                    htmlFor="activity_description"
                                    error={errors.activity_description}
                                >
                                    <Textarea
                                        id="activity_description"
                                        value={data.activity_description}
                                        onChange={(e) => setData('activity_description', e.target.value)}
                                        rows={4}
                                        placeholder="Jelaskan kegiatan yang akan dilakukan..."
                                    />
                                </FormField>

                                <FormField
                                    label="Manfaat Kegiatan"
                                    required
                                    htmlFor="activity_benefit"
                                    error={errors.activity_benefit}
                                >
                                    <Textarea
                                        id="activity_benefit"
                                        value={data.activity_benefit}
                                        onChange={(e) => setData('activity_benefit', e.target.value)}
                                        rows={4}
                                        placeholder="Uraikan manfaat kegiatan..."
                                    />
                                </FormField>

                                <FormField
                                    label="Tujuan Kegiatan"
                                    required
                                    htmlFor="activity_purpose"
                                    error={errors.activity_purpose}
                                >
                                    <Textarea
                                        id="activity_purpose"
                                        value={data.activity_purpose}
                                        onChange={(e) => setData('activity_purpose', e.target.value)}
                                        rows={4}
                                        placeholder="Uraikan tujuan kegiatan..."
                                    />
                                </FormField>
                            </Section>

                            {/* ===== Section 4: TK & Investasi ===== */}
                            <Section
                                id="tenaga-kerja"
                                num="04"
                                title="Tenaga Kerja & Investasi"
                                desc="SDM dan nilai investasi kegiatan."
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField
                                        label="Tenaga Kerja Lokal"
                                        required
                                        htmlFor="local_workers"
                                        hint="Contoh: 15 Orang"
                                        error={errors.local_workers}
                                    >
                                        <Input
                                            id="local_workers"
                                            value={data.local_workers}
                                            onChange={(e) => setData('local_workers', e.target.value)}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Tenaga Kerja Asing"
                                        htmlFor="foreign_workers"
                                        hint="Kosongkan dengan '-' jika tidak ada"
                                        error={errors.foreign_workers}
                                    >
                                        <Input
                                            id="foreign_workers"
                                            value={data.foreign_workers}
                                            onChange={(e) => setData('foreign_workers', e.target.value)}
                                        />
                                    </FormField>
                                </div>

                                <FormField
                                    label="Nilai Investasi (Rp)"
                                    required
                                    htmlFor="investment_value"
                                    hint="Contoh: 200000000"
                                    error={errors.investment_value}
                                >
                                    <Input
                                        id="investment_value"
                                        value={data.investment_value}
                                        onChange={(e) => setData('investment_value', e.target.value)}
                                    />
                                </FormField>

                                <FormField
                                    label="Deskripsi Jadwal Kegiatan"
                                    required
                                    htmlFor="schedule_description"
                                    hint="Format: [Nama Kegiatan] : [Bulan/Tahun Pelaksanaan]"
                                    error={errors.schedule_description}
                                >
                                    <Textarea
                                        id="schedule_description"
                                        value={data.schedule_description}
                                        onChange={(e) => setData('schedule_description', e.target.value)}
                                        rows={4}
                                    />
                                </FormField>

                                {progress && (
                                    <div className="space-y-2">
                                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 transition-all"
                                                style={{ width: `${progress.percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Mengunggah... {progress.percentage}%
                                        </p>
                                    </div>
                                )}
                            </Section>

                            {/* ===== Section 5: Dokumen ===== */}
                            <Section
                                id="dokumen"
                                num="05"
                                title="Dokumen Data Dukung"
                                desc="Dokumen yang wajib diunggah."
                            >
                                <FormField
                                    label="Dokumen yang dimiliki pelaku usaha"
                                    required
                                    error={errors.supporting_documents}
                                >
                                    <PillChoice
                                        options={[
                                            'NIB',
                                            'Sertifikat Kepemilikan Lahan Darat',
                                            'Surat Izin Lingkungan',
                                            'Berita Acara',
                                        ]}
                                        value={data.supporting_documents}
                                        onChange={(v: string[]) => setData('supporting_documents', v)}
                                        type="checkbox"
                                    />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
                                    <FileUploadCard
                                        id="existing_doc_path"
                                        label="Dokumentasi Kegiatan"
                                        fileName={fileNames.existing_doc_path}
                                        onChange={handleFileChange('existing_doc_path')}
                                        onRemove={() => handleFileRemove('existing_doc_path')}
                                        error={errors.existing_doc_path}
                                    />
                                    <FileUploadCard
                                        id="site_plan_path"
                                        label="Gambaran Rencana Tapak"
                                        fileName={fileNames.site_plan_path}
                                        onChange={handleFileChange('site_plan_path')}
                                        onRemove={() => handleFileRemove('site_plan_path')}
                                        error={errors.site_plan_path}
                                    />
                                    <FileUploadCard
                                        id="location_map_path"
                                        label="Peta Lokasi"
                                        fileName={fileNames.location_map_path}
                                        onChange={handleFileChange('location_map_path')}
                                        onRemove={() => handleFileRemove('location_map_path')}
                                        error={errors.location_map_path}
                                    />
                                </div>

                                <FormField
                                    label="Sumber Peta"
                                    required
                                    htmlFor="map_source"
                                    hint="Contoh: BIG, ArcGis, Google Earth"
                                    error={errors.map_source}
                                >
                                    <Input
                                        id="map_source"
                                        value={data.map_source}
                                        onChange={(e) => setData('map_source', e.target.value)}
                                    />
                                </FormField>
                            </Section>

                            {/* ===== Section 6: Sosial Ekonomi & Aksesibilitas ===== */}
                            <Section
                                id="sosek"
                                num="06"
                                title="Kondisi Sosial Ekonomi & Aksesibilitas"
                                desc="Kondisi masyarakat desa di sekitar lokasi kegiatan."
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField label="Jumlah Penduduk Desa" required htmlFor="population_count" hint="Desa terdekat dari lokasi yang dimohonkan" error={errors.population_count}>
                                        <Input id="population_count" value={data.population_count} onChange={(e) => setData('population_count', e.target.value)} placeholder="Contoh: 1.250 jiwa" />
                                    </FormField>
                                    <FormField label="Luas Desa" required htmlFor="village_area" hint="Desa terdekat dari lokasi yang dimohonkan" error={errors.village_area}>
                                        <Input id="village_area" value={data.village_area} onChange={(e) => setData('village_area', e.target.value)} placeholder="Contoh: 12,5 km²" />
                                    </FormField>
                                </div>

                                <FormField label="Mata Pencaharian Masyarakat Desa" required htmlFor="livelihood_description" error={errors.livelihood_description}>
                                    <Textarea id="livelihood_description" rows={4} value={data.livelihood_description} onChange={(e) => setData('livelihood_description', e.target.value)} placeholder="Deskripsikan mata pencaharian utama masyarakat sekitar, contoh: nelayan, budi daya, perdagangan hasil laut..." />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormField label="Sumber Data Sosek" required htmlFor="sosek_data_source" hint="Contoh: Badan Pusat Statistik" error={errors.sosek_data_source}>
                                        <Input id="sosek_data_source" value={data.sosek_data_source} onChange={(e) => setData('sosek_data_source', e.target.value)} />
                                    </FormField>
                                    <FormField label="Tahun Data Sosek" required htmlFor="sosek_data_year" error={errors.sosek_data_year}>
                                        <Input id="sosek_data_year" value={data.sosek_data_year} onChange={(e) => setData('sosek_data_year', e.target.value)} placeholder="Contoh: 2025" />
                                    </FormField>
                                </div>

                                <FormField label="Aksesibilitas Lokasi" required htmlFor="accessibility_description" hint="Rute, jarak, dan waktu tempuh dari titik yang mudah dikenali menuju lokasi" error={errors.accessibility_description}>
                                    <Textarea id="accessibility_description" rows={4} value={data.accessibility_description} onChange={(e) => setData('accessibility_description', e.target.value)} placeholder="Contoh: Dari Bandara Haluoleo Kendari ditempuh melalui jalur darat ± 45 menit menuju Kecamatan Soropia..." />
                                </FormField>

                                <FileUploadCard
                                    id="accessibility_map_path"
                                    label="Gambar Peta Aksesibilitas Menuju Lokasi"
                                    required
                                    fileName={fileNames.accessibility_map_path}
                                    onChange={handleFileChange('accessibility_map_path')}
                                    onRemove={() => handleFileRemove('accessibility_map_path')}
                                    error={errors.accessibility_map_path}
                                />
                            </Section>

                            {/* ===== Section 7: Kondisi Terkini Lokasi ===== */}
                            <Section
                                id="kondisi-lokasi"
                                num="07"
                                title="Data Kondisi Terkini Lokasi dan Sekitarnya"
                                desc="Dokumen hidro-oseanografi dan kondisi ekosistem pesisir."
                            >
                                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-sm text-slate-700 space-y-1">
                                    <p>
                                        Unggah dokumen <strong>Hidro-oseanografi</strong> yang diperoleh
                                        melalui laman berikut:
                                    </p>
                                    <a
                                        href="https://huggingface.co/spaces/Fadly2002/Gerai-Pelayanan-BPRL"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 hover:underline break-all"
                                    >
                                        huggingface.co/spaces/Fadly2002/Gerai-Pelayanan-BPRL ↗
                                    </a>
                                </div>

                                <FileUploadCard
                                    id="hydro_oceanography_doc_path"
                                    label="Dokumen Hidro-oseanografi"
                                    required
                                    fileName={fileNames.hydro_oceanography_doc_path}
                                    onChange={handleFileChange('hydro_oceanography_doc_path')}
                                    onRemove={() => handleFileRemove('hydro_oceanography_doc_path')}
                                    error={errors.hydro_oceanography_doc_path}
                                />

                                {/* 3 blok ekosistem dirender dari config */}
                                {ecosystemConfig.map((eco) => {
                                    const d = data as Record<string, any>;
                                    const err = errors as Record<string, any>;
                                    const exists = d[eco.hasKey] === 'true';

                                    return (
                                        <div key={eco.name} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                                            <p className="text-sm font-bold text-slate-800">
                                                Ekosistem {eco.name}
                                            </p>

                                            <FormField label={`Keberadaan ekosistem ${eco.name.toLowerCase()}`} required error={err[eco.hasKey]}>
                                                <PillChoice
                                                    options={['Terdapat', 'Tidak terdapat']}
                                                    value={exists ? 'Terdapat' : d[eco.hasKey] === 'false' ? 'Tidak terdapat' : ''}
                                                    onChange={(v: string) => setData(eco.hasKey as any, v === 'Terdapat' ? 'true' : 'false')}
                                                />
                                            </FormField>

                                            {/* Field lanjutan hanya muncul jika ekosistem ada */}
                                            {exists && (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <FormField label={`Spesies ${eco.name}`} htmlFor={eco.speciesKey}>
                                                            <Input id={eco.speciesKey} value={d[eco.speciesKey]} onChange={(e) => setData(eco.speciesKey as any, e.target.value)} placeholder="Nama spesies dominan" />
                                                        </FormField>
                                                        <FormField label={`Persentase Tutupan ${eco.name} (%)`} htmlFor={eco.coverKey} error={err[eco.coverKey]}>
                                                            <Input id={eco.coverKey} type="number" step="0.1" min="0" max="100" value={d[eco.coverKey]} onChange={(e) => setData(eco.coverKey as any, e.target.value)} placeholder="Contoh: 65" />
                                                        </FormField>
                                                    </div>

                                                    <FormField label={`Kondisi ${eco.name}`} hint="Mengacu pada kriteria baku berikut" error={err[eco.conditionKey]}>
                                                        <CriteriaTable headers={eco.criteria.headers} rows={eco.criteria.rows} />
                                                        <div className="pt-2">
                                                            <PillChoice
                                                                options={eco.conditions}
                                                                value={d[eco.conditionKey]}
                                                                onChange={(v: string) => setData(eco.conditionKey as any, v)}
                                                            />
                                                        </div>
                                                    </FormField>

                                                    <FileUploadCard
                                                        id={eco.docKey}
                                                        label={`Dokumentasi Ekosistem ${eco.name}`}
                                                        fileName={fileNames[eco.docKey]}
                                                        onChange={handleFileChange(eco.docKey)}
                                                        onRemove={() => handleFileRemove(eco.docKey)}
                                                        error={err[eco.docKey]}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </Section>

                            {/* ===== Section 8: Pemanfaatan Ruang Laut ===== */}
                            <Section
                                id="ruang-laut"
                                num="08"
                                title="Informasi Pemanfaatan Ruang Laut"
                                desc="Aktivitas pemanfaatan ruang laut di sekitar lokasi."
                            >
                                <FormField
                                    label="Deskripsi Kegiatan Pemanfaatan Ruang Laut Sekitar"
                                    required
                                    htmlFor="marine_spatial_activity_description"
                                    hint="Gambaran singkat aktivitas di sekitar lokasi: arah mata angin, jarak, dan jenis kegiatan masyarakat"
                                    error={errors.marine_spatial_activity_description}
                                >
                                    <Textarea id="marine_spatial_activity_description" rows={5} value={data.marine_spatial_activity_description} onChange={(e) => setData('marine_spatial_activity_description', e.target.value)} placeholder="Contoh: Di sebelah utara berbatasan dengan area penangkapan ikan skala kecil ± 1 km, di sisi timur terdapat pelabuhan lokal ± 1,2 km..." />
                                </FormField>

                                <MultiFileUploadCard
                                    id="marine_spatial_docs"
                                    label="Dokumentasi Kegiatan Pemanfaatan Ruang Laut Sekitar"
                                    required
                                    files={data.marine_spatial_docs}
                                    onAdd={handleMarineDocsAdd}
                                    onRemove={handleMarineDocsRemove}
                                    error={errors.marine_spatial_docs}
                                />
                            </Section>

                            {/* ===== Section 9: Petugas & Dokumen Lainnya ===== */}
                            <Section
                                id="persyaratan"
                                num="09"
                                title="Data Petugas & Dokumen Persyaratan Lainnya"
                                desc="Email petugas pendamping dan dokumen pelengkap."
                            >
                                <FormField
                                    label="Email Petugas BPRL"
                                    required
                                    htmlFor="officer_email"
                                    hint="Petugas yang membantu penyusunan dokumen proposal KKPRL"
                                    error={errors.officer_email}
                                >
                                    <Input id="officer_email" type="email" value={data.officer_email} onChange={(e) => setData('officer_email', e.target.value)} placeholder="petugas@bprl.go.id" />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <FileUploadCard
                                        id="land_certificate_path"
                                        label="Sertifikat Kepemilikan Lahan Darat"
                                        fileName={fileNames.land_certificate_path}
                                        onChange={handleFileChange('land_certificate_path')}
                                        onRemove={() => handleFileRemove('land_certificate_path')}
                                        error={errors.land_certificate_path}
                                    />
                                    <FileUploadCard
                                        id="socialization_doc_path"
                                        label="Dokumen Hasil Sosialisasi"
                                        hint="Berita acara / surat pernyataan tidak keberatan dari masyarakat"
                                        fileName={fileNames.socialization_doc_path}
                                        onChange={handleFileChange('socialization_doc_path')}
                                        onRemove={() => handleFileRemove('socialization_doc_path')}
                                        error={errors.socialization_doc_path}
                                    />
                                    <FileUploadCard
                                        id="other_supporting_doc_path"
                                        label="Dokumen Pendukung Lainnya"
                                        fileName={fileNames.other_supporting_doc_path}
                                        onChange={handleFileChange('other_supporting_doc_path')}
                                        onRemove={() => handleFileRemove('other_supporting_doc_path')}
                                        error={errors.other_supporting_doc_path}
                                    />
                                </div>
                            </Section>

                            {/* ===== Submit ===== */}
                            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-white p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Siap mengirimkan permohonan?
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            Pastikan semua data telah lengkap. Setelah dikirim,
                                            permohonan akan masuk ke antrian verifikasi petugas.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                if (confirm('Kosongkan semua isian formulir?')) {
                                                    reset();
                                                    setFileNames({});
                                                }
                                            }}
                                            className="gap-2"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Kosongkan
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 gap-2 shadow-md shadow-blue-600/20"
                                        >
                                            <Send className="h-4 w-4" />
                                            {processing ? 'Mengirim...' : 'Kirim Permohonan'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </HomeLayout>
    );
}