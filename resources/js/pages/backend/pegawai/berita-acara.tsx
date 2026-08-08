import { useState, useCallback, useRef, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import MainLayout from "@/pages/backend/layout";
import {
    ClipboardCheck, FileCheck2, ArrowRight, ArrowLeft, Upload, X, Check,
    User, Building2, MapPin, FileText, ChevronDown, AlertCircle, Loader2,
    Waves, Calendar, Hash, Radio, Layers, BadgeCheck
} from "lucide-react";
import { ComboboxSearch } from "@/components/backend/combobox-searchable";

const LOCATIONS = [
    "Kantor BPRL Makassar",
    "Satpel Manado", "Satpel Kendari", "Satpel Palu", "Satpel Kupang", "Satpel Bali",
    "Gerai Gorontalo", "Gerai Lombok", "Gerai Mamuju",
    "Zoom Meeting",
    "Lainnya",
];

const ACTIVITY_DETAILS = [
    "Terminal Khusus",
    "Aktivitas Pelayanan Kapal",
    "Perikanan Laut",
    "Instalasi Perikanan",
    "Aktivitas Pelabuhan Perikanan",
    "Breakwater",
    "Konstruksi Pelindung Pantai",
    "Galangan Kapal",
    "Pemukiman",
    "Pipa Bawah Laut",
    "Kabel Bawah Laut",
    "Reklamasi",
    "Pariwisata",
    "Ruas Jalan",
    "Yang lain",
];

const WATER_NAMES = [
    "Selat Makassar", "Teluk Bone", "Laut Flores", "Laut Banda",
    "Laut Sulawesi", "Laut Maluku", "Laut Timor",
    "Lainnya",
];

const OWNED_DOCUMENTS = [
    "NIB",
    "Bukti Kepemilikan Lahan Darat",
    "Berita Acara Sosialisasi",
    "Izin Lingkungan",
    "Tidak ada",
    "Yang lain",
];

const ACTIVITY_CATEGORIES = [
    "Bangunan & Instalasi Laut",
    "Reklamasi",
    "Terminal Khusus & Pelabuhan",
    "Perikanan & Budidaya",
    "Pariwisata Bahari",
    "Infrastruktur Bawah Laut",
    "Lainnya",
];

interface StaffOption {
    id: number;
    name: string;
    position: string;
}

interface FormData {
    // Step 1 – Session
    consultation_stage: string;
    consultation_date: string;
    berita_acara_number: string;
    implementation_mode: string;
    location: string;
    location_other: string;
    staff_1_id: string;
    staff_2_id: string;
    staff_3_id: string;
    staff_4_id: string;

    // Step 1 – Requester & Site
    requester_name: string;
    requester_position: string;
    legal_entity_name: string;
    contact_email: string;
    permit_type: string;
    activity_type: string;
    activity_detail: string;
    activity_detail_other: string;
    kbli: string;
    province: string;
    regency: string;
    district: string;
    water_name: string;
    water_name_other: string;
    consultation_instruments: string;

    // Step 2
    activity_category: string;
    planned_area: string;
    planned_area_unit: string;
    existing_condition: string;
    coordinate_points: string;
    owned_documents: string[];
    owned_documents_other: string;
    activity_description: string;
    surrounding_utilization: string;
    environmental_condition: string;
    other_information: string;
    consultation_result: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {children}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {message}
        </p>
    );
}

function RadioGroup({
    name, value, options, onChange, error, cols = 1
}: {
    name: string; value: string; options: { label: string; value: string }[];
    onChange: (v: string) => void; error?: string; cols?: number;
}) {
    return (
        <div>
            <div className={`grid gap-2 ${cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-3" : ""}`}>
                {options.map((opt) => (
                    <label key={opt.value}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all text-xs font-semibold
                            ${value === opt.value
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-slate-200 hover:border-blue-300 text-slate-700 hover:bg-blue-50/40"
                            }`}
                    >
                        <input type="radio" name={name} value={opt.value} checked={value === opt.value}
                            onChange={() => onChange(opt.value)} className="hidden" />
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                            ${value === opt.value ? "border-blue-500" : "border-slate-300"}`}
                        >
                            {value === opt.value && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                        </span>
                        {opt.label}
                    </label>
                ))}
            </div>
            <FieldError message={error} />
        </div>
    );
}

function TextInput({ value, onChange, placeholder = "", error, type = "text", readOnly, ...props }: {
    value: string; onChange: (v: string) => void; placeholder?: string; error?: string; type?: string; readOnly?: boolean; props?: any
}) {
    return (
        <div>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all
                    ${error ? "border-red-400 focus:ring-red-500/20" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"}`}
                {...props}
            />
            <FieldError message={error} />
        </div>
    );
}

function TextareaInput({ value, onChange, placeholder = "", error, rows = 4 }: {
    value: string; onChange: (v: string) => void; placeholder?: string; error?: string; rows?: number;
}) {
    return (
        <div>
            <textarea
                rows={rows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all resize-none
                    ${error ? "border-red-400 focus:ring-red-500/20" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"}`}
            />
            <FieldError message={error} />
        </div>
    );
}

function SelectInput({ value, onChange, options, placeholder = "Pilih...", error }: {
    value: string; onChange: (v: string) => void;
    options: { label: string; value: string }[]; placeholder?: string; error?: string;
}) {
    return (
        <div>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all bg-white pr-9
                        ${error ? "border-red-400 focus:ring-red-500/20" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"}`}
                >
                    <option value="">{placeholder}</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <FieldError message={error} />
        </div>
    );
}

function FileUpload({ label, name, multiple, max, files, onChange, error }: {
    label: string; name: string; multiple?: boolean; max?: number;
    files: File[]; onChange: (files: File[]) => void; error?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files || []);
        if (multiple) {
            const merged = [...files, ...picked].slice(0, max ?? 5);
            onChange(merged);
        } else {
            onChange([picked[0]]);
        }
        e.target.value = "";
    };

    const remove = (idx: number) => onChange(files.filter((_, i) => i !== idx));

    return (
        <div>
            <div
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all 
                    ${error ? "border-red-400" : "border-slate-200"}`}
                onClick={() => inputRef.current?.click()}
            >
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">{label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                    {multiple ? `Maks. ${max ?? 5} file` : "1 file"} • Maks. 10 MB
                </p>
                <input ref={inputRef} type="file" multiple={multiple} className="hidden" onChange={handleChange} />
            </div>

            {files.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                    {files.map((f, i) => (
                        <li key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                            <span className="truncate text-slate-700 font-medium">{f.name}</span>
                            <button type="button" onClick={() => remove(i)} className="shrink-0 ml-2 text-slate-400 hover:text-red-500">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <FieldError message={error} />
        </div>
    );
}

function SectionCard({ title, icon: Icon, children }: {
    title: string; icon: React.ElementType; children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-50/80 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            </div>
            <div className="p-5 space-y-5">{children}</div>
        </div>
    );
}

function ExistingFiles({ docs, onRemove }: { docs: ExistingDocument[]; onRemove: (d: ExistingDocument) => void }) {
    if (!docs.length) return null;
    return (
        <ul className="mb-2 space-y-1.5">
            {docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs">
                    <a href={`/storage/${d.file_path}`} target="_blank" rel="noreferrer"
                        className="truncate text-emerald-700 font-medium hover:underline">
                        {d.file_name}
                    </a>
                    <button type="button" onClick={() => onRemove(d)} className="shrink-0 ml-2 text-emerald-500 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </li>
            ))}
        </ul>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ExistingDocument {
    id: number;
    document_type: string;
    file_name: string;
    file_path: string;
}

interface Props {
    staffList: StaffOption[];
    konsultasi?: any;
    berita_acara?: any;
}

const EMPTY: FormData = {
    consultation_stage: "", consultation_date: "", berita_acara_number: "",
    implementation_mode: "", location: "", location_other: "",
    staff_1_id: "", staff_2_id: "", staff_3_id: "", staff_4_id: "",
    requester_name: "", requester_position: "", legal_entity_name: "",
    contact_email: "", permit_type: "", activity_type: "", activity_detail: "",
    activity_detail_other: "", kbli: "", province: "", regency: "", district: "",
    water_name: "", water_name_other: "", consultation_instruments: "",
    activity_category: "", planned_area: "", planned_area_unit: "Ha",
    existing_condition: "", coordinate_points: "",
    owned_documents: [], owned_documents_other: "",
    activity_description: "", surrounding_utilization: "", environmental_condition: "",
    other_information: "", consultation_result: "",
};

export default function BeritaAcara({ staffList, konsultasi, berita_acara }: Props) {
    const { errors } = usePage<any>().props;
    const [step, setStep] = useState<number>(1);
    const isEdit = !!berita_acara;

    const storageKey = `berita_acara_form_${konsultasi?.id || berita_acara?.id || "new"}`;

    const getInitialForm = (): FormData => {
        if (isEdit) {
            return {
                ...EMPTY,
                ...berita_acara,
                owned_documents: berita_acara.owned_documents ?? [],
            };
        }
        if (typeof window === "undefined") return { ...EMPTY };
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try { return { ...EMPTY, ...JSON.parse(saved) }; } catch { return { ...EMPTY }; }
        }
        return { ...EMPTY };
    };

    const [form, setForm] = useState<FormData>(getInitialForm);
    const [submitting, setSubmitting] = useState(false);
    const [existingDocs, setExistingDocs] = useState<ExistingDocument[]>(berita_acara?.documents ?? []);

    // File state (Cannot be persisted via localStorage due to browser security)
    const [files, setFiles] = useState<Record<string, File[]>>({
        dokumentasi_konsultasi: [], absensi_pendampingan: [], tanda_tangan_perwakilan: [],
        peta_hasil_plotting: [], rencana_bangunan_instalasi: [], informasi_pemanfaatan_ruang_laut: [],
        data_kondisi_terkini: [], persyaratan_lainnya: [], titik_koordinat: [],
    });

    useEffect(() => {
        if (isEdit) return;
        localStorage.setItem(storageKey, JSON.stringify(form));
    }, [form, storageKey, isEdit]);

    useEffect(() => {
        if (isEdit) return; // edit mode already has correct values from berita_acara
        if (konsultasi) {
            setForm((prev) => ({
                ...prev,
                requester_name: prev.requester_name || konsultasi?.nama_pemohon || "",
                requester_position: prev.requester_position || konsultasi?.jabatan_pemohon || "",
                legal_entity_name: prev.legal_entity_name || konsultasi?.instansi || "",
                contact_email: prev.contact_email || konsultasi?.email || "",
                province: prev.province || konsultasi?.provinsi || "",
                regency: prev.regency || konsultasi?.kabupaten || "",
            }));
        }
    }, [konsultasi, isEdit]);

    const set = useCallback((key: keyof FormData, val: any) => {
        setForm((prev) => ({ ...prev, [key]: val }));
    }, []);

    const setFile = (key: string, val: File[]) => setFiles((prev) => ({ ...prev, [key]: val }));

    const toggleOwnedDoc = (val: string) => {
        const current = form.owned_documents;
        set("owned_documents", current.includes(val) ? current.filter((d) => d !== val) : [...current, val]);
    };

    const docsFor = (slot: string) => existingDocs.filter((d) => d.document_type === slot);

    const removeExistingDoc = (doc: ExistingDocument) => {
        if (!confirm(`Hapus file "${doc.file_name}"?`)) return;
        router.delete(`/pegawai/berita-acara/documents/${doc.id}`, {
            preserveScroll: true,
            onSuccess: () => setExistingDocs((prev) => prev.filter((d) => d.id !== doc.id)),
        });
    };

    const staffOptions = staffList.map((s) => ({ value: String(s.id), label: `${s.name} — ${s.position}` }));

    const goToStep2 = () => {
        if (!form.consultation_stage || !form.consultation_date || !form.implementation_mode ||
            !form.location || !form.requester_name || !form.requester_position ||
            !form.legal_entity_name || !form.contact_email || !form.permit_type ||
            !form.activity_type || !form.activity_detail || !form.province || !form.regency || !form.water_name
        ) {
            alert("Harap lengkapi semua field wajib di Langkah 1 terlebih dahulu.");
            return;
        }
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = () => {
        setSubmitting(true);
        const fd = new FormData();

        Object.entries(form).forEach(([k, v]) => {
            if (Array.isArray(v)) {
                v.forEach((item) => fd.append(`${k}[]`, item));
            } else {
                fd.append(k, v ?? "");
            }
        });

        Object.entries(files).forEach(([key, arr]) => {
            if (key === "dokumentasi_konsultasi" || key === "persyaratan_lainnya") {
                arr.forEach((f) => fd.append(`${key}[]`, f));
            } else if (arr[0]) {
                fd.append(key, arr[0]);
            }
        });

        if (isEdit) {
            fd.append("_method", "put"); // Laravel method spoofing for multipart PUT
            router.post(`/berita-acara/${berita_acara.id}/pegawai`, fd, {
                forceFormData: true,
                onFinish: () => setSubmitting(false),
            });
            return;
        }

        fd.append("request_form_id", konsultasi?.id);
        router.post("/berita-acara", fd, {
            forceFormData: true,
            onSuccess: () => {
                localStorage.removeItem(storageKey);
                setForm(EMPTY);
                setFiles({
                    dokumentasi_konsultasi: [], absensi_pendampingan: [], tanda_tangan_perwakilan: [],
                    peta_hasil_plotting: [], rencana_bangunan_instalasi: [], informasi_pemanfaatan_ruang_laut: [],
                    data_kondisi_terkini: [], persyaratan_lainnya: [], titik_koordinat: [],
                });
                setStep(1);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    // Merge Konsultasi data only if the fields aren't already filled by a saved draft
    useEffect(() => {
        if (konsultasi) {
            setForm((prev) => ({
                ...prev,
                requester_name: prev.requester_name || konsultasi?.nama_pemohon || "",
                requester_position: prev.requester_position || konsultasi?.jabatan_pemohon || "",
                legal_entity_name: prev.legal_entity_name || konsultasi?.instansi || "",
                contact_email: prev.contact_email || konsultasi?.email || "",
                province: prev.province || konsultasi?.provinsi || "",
                regency: prev.regency || konsultasi?.kabupaten || "",
            }));
        }
    }, [konsultasi]);

    return (
        <MainLayout pageTitle="Buat Berita Acara Konsultasi">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900">
                            Berita Acara Hasil Asistensi/Konsultasi KKPRL
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">BPRL Makassar • Ditjen PRL KKP RI</p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl">
                    {[
                        { n: 1, label: "Konsultasi / Koordinasi", icon: ClipboardCheck },
                        { n: 2, label: "Asistensi Dokumen", icon: FileCheck2 },
                    ].map(({ n, label, icon: Icon }, idx) => (
                        <div key={n}
                            onClick={() => {
                                if (n === 1 && step === 2) {
                                    setStep(1);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }
                            }}
                            className={`flex items-center gap-2 flex-1 ${n === 1 && step === 2 ? "cursor-pointer" : ""}`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all
                                ${step > n ? "bg-emerald-500 text-white" : step === n ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}
                            >
                                {step > n ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                                <p className={`text-xs font-bold truncate ${step === n ? "text-blue-700" : "text-slate-500"}`}>{label}</p>
                                <p className="text-[10px] text-slate-400">
                                    {n === 2 && form.consultation_stage !== "asistensi" ? "Langkah 2 (Khusus Asistensi)" : `Langkah ${n}`}
                                </p>
                            </div>
                            {idx < 1 && <div className="flex-1 h-px bg-slate-200 mx-2" />}
                        </div>
                    ))}
                </div>

                {/* ── STEP 1 ── */}
                {step === 1 && (
                    <div className="space-y-5">
                        {/* Session Info */}
                        <SectionCard title="Informasi Sesi Konsultasi" icon={Calendar}>
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <FormLabel required>Tahap Konsultasi</FormLabel>
                                    <RadioGroup
                                        name="consultation_stage"
                                        value={form.consultation_stage}
                                        options={[
                                            { value: "konsultasi", label: "Konsultasi / Koordinasi" },
                                            { value: "asistensi", label: "Asistensi Dokumen" },
                                        ]}
                                        onChange={(v) => set("consultation_stage", v)}
                                        error={errors?.consultation_stage}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <FormLabel required>Tanggal Konsultasi</FormLabel>
                                        <TextInput type="date" value={form.consultation_date}
                                            onChange={(v) => set("consultation_date", v)}
                                            error={errors?.consultation_date} />
                                    </div>
                                    <div>
                                        <FormLabel>Nomor Berita Acara</FormLabel>
                                        <TextInput value={form.berita_acara_number}
                                            onChange={(v) => set("berita_acara_number", v)}
                                            placeholder="B.257/BPRLL.3/PRL.140/IV/2026"
                                            error={errors?.berita_acara_number} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <FormLabel required>Mode Pelaksanaan</FormLabel>
                                <RadioGroup
                                    name="implementation_mode" value={form.implementation_mode}
                                    options={[
                                        { value: "daring", label: "Daring (Online)" },
                                        { value: "luring", label: "Luring (Tatap Muka)" },
                                        { value: "hybrid", label: "Hybrid" },
                                    ]}
                                    onChange={(v) => set("implementation_mode", v)}
                                    error={errors?.implementation_mode} cols={3}
                                />
                            </div>

                            <div>
                                <FormLabel required>Lokasi Pelaksanaan</FormLabel>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {LOCATIONS.map((loc) => (
                                        <label key={loc}
                                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-xs font-medium
                                                ${form.location === loc ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-blue-300 text-slate-600"}`}
                                        >
                                            <input type="radio" name="location" value={loc} checked={form.location === loc}
                                                onChange={() => set("location", loc)} className="hidden" />
                                            <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center
                                                ${form.location === loc ? "border-blue-500" : "border-slate-300"}`}>
                                                {form.location === loc && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                            </span>
                                            {loc}
                                        </label>
                                    ))}
                                </div>
                                {form.location === "Lainnya" && (
                                    <div className="mt-2">
                                        <TextInput value={form.location_other}
                                            onChange={(v) => set("location_other", v)}
                                            placeholder="Sebutkan lokasi lainnya..."
                                            error={errors?.location_other} />
                                    </div>
                                )}
                                <FieldError message={errors?.location} />
                            </div>
                        </SectionCard>

                        {/* Requester & Site */}
                        <SectionCard title="Data Pemohon & Subjek Hukum" icon={User}>
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <FormLabel required>Nama Pemohon</FormLabel>
                                    <TextInput value={form.requester_name}
                                        onChange={(v) => set("requester_name", v)}
                                        placeholder="Nama lengkap pemohon"
                                        error={errors?.requester_name}
                                        readOnly />
                                </div>
                                <div>
                                    <FormLabel required>Jabatan Pemohon</FormLabel>
                                    <TextInput value={form.requester_position}
                                        onChange={(v) => set("requester_position", v)}
                                        placeholder="Direktur / Kuasa Hukum / dll."
                                        error={errors?.requester_position}
                                        readOnly />
                                </div>
                                <div>
                                    <FormLabel required>Nama Subjek Hukum (Instansi / Perusahaan)</FormLabel>
                                    <TextInput value={form.legal_entity_name}
                                        onChange={(v) => set("legal_entity_name", v)}
                                        placeholder="PT. / CV. / Instansi / Perorangan"
                                        error={errors?.legal_entity_name}
                                        readOnly />
                                </div>
                                <div>
                                    <FormLabel required>Email Kontak</FormLabel>
                                    <TextInput type="email" value={form.contact_email}
                                        onChange={(v) => set("contact_email", v)}
                                        placeholder="email@contoh.com"
                                        error={errors?.contact_email}
                                        readOnly />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <FormLabel required>Jenis Persetujuan</FormLabel>
                                    <RadioGroup name="permit_type" value={form.permit_type}
                                        options={[
                                            { value: "persetujuan", label: "Persetujuan KKPRL" },
                                            { value: "konfirmasi", label: "Konfirmasi KKPRL" },
                                        ]}
                                        onChange={(v) => set("permit_type", v)}
                                        error={errors?.permit_type} />
                                </div>
                                <div>
                                    <FormLabel required>Jenis Kegiatan</FormLabel>
                                    <RadioGroup name="activity_type" value={form.activity_type}
                                        options={[
                                            { value: "berusaha", label: "Kegiatan Berusaha" },
                                            { value: "non_berusaha", label: "Kegiatan Non-Berusaha" },
                                        ]}
                                        onChange={(v) => set("activity_type", v)}
                                        error={errors?.activity_type} />
                                </div>
                            </div>

                            <div>
                                <FormLabel required>Rincian Kegiatan</FormLabel>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {ACTIVITY_DETAILS.map((a) => (
                                        <label key={a}
                                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-xs font-medium
                                                ${form.activity_detail === a ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-blue-300 text-slate-600"}`}
                                        >
                                            <input type="radio" name="activity_detail" value={a} checked={form.activity_detail === a}
                                                onChange={() => set("activity_detail", a)} className="hidden" />
                                            <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center
                                                ${form.activity_detail === a ? "border-blue-500" : "border-slate-300"}`}>
                                                {form.activity_detail === a && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                            </span>
                                            {a}
                                        </label>
                                    ))}
                                </div>
                                {form.activity_detail === "Yang lain" && (
                                    <div className="mt-2">
                                        <TextInput value={form.activity_detail_other}
                                            onChange={(v) => set("activity_detail_other", v)}
                                            placeholder="Sebutkan rincian kegiatan lainnya..."
                                            error={errors?.activity_detail_other} />
                                    </div>
                                )}
                                <FieldError message={errors?.activity_detail} />
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <FormLabel>Kode KBLI</FormLabel>
                                    <TextInput value={form.kbli} onChange={(v) => set("kbli", v)}
                                        placeholder="cth: 52221" error={errors?.kbli} />
                                </div>
                                <div>
                                    <FormLabel required>Provinsi</FormLabel>
                                    <ComboboxSearch
                                        value={form.province}
                                        onChange={(val) => set("province", val)}
                                        fetchUrl="/api/geolocation/provinces"
                                        labelKey="name"
                                        valueKey="id"
                                        placeholder="Pilih provinsi"
                                    />
                                </div>
                                <div>
                                    <FormLabel required>Kabupaten / Kota</FormLabel>
                                    <ComboboxSearch
                                        value={form.regency}
                                        onChange={(val) => set('regency', val)}
                                        fetchUrl="/api/geolocation/regencies"
                                        labelKey="name"
                                        valueKey="id"
                                        placeholder="Pilih kabupaten"
                                    />
                                </div>
                                <div>
                                    <FormLabel>Kecamatan</FormLabel>
                                    <ComboboxSearch
                                        value={form.district}
                                        onChange={(val) => set('district', val)}
                                        fetchUrl="/api/geolocation/districts"
                                        labelKey="name"
                                        valueKey="id"
                                        placeholder="Pilih kecamatan"
                                    />
                                </div>
                            </div>

                            <div>
                                <FormLabel required>Nama Perairan</FormLabel>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                                    {WATER_NAMES.map((w) => (
                                        <label key={w}
                                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-xs font-medium
                                                ${form.water_name === w ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-blue-300 text-slate-600"}`}
                                        >
                                            <input type="radio" name="water_name" value={w} checked={form.water_name === w}
                                                onChange={() => set("water_name", w)} className="hidden" />
                                            <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center
                                                ${form.water_name === w ? "border-blue-500" : "border-slate-300"}`}>
                                                {form.water_name === w && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                            </span>
                                            {w}
                                        </label>
                                    ))}
                                </div>
                                {form.water_name === "Lainnya" && (
                                    <TextInput value={form.water_name_other}
                                        onChange={(v) => set("water_name_other", v)}
                                        placeholder="Nama perairan lainnya..."
                                        error={errors?.water_name_other} />
                                )}
                                <FieldError message={errors?.water_name} />
                            </div>

                            <div>
                                <FormLabel>Instrumen Konsultasi</FormLabel>
                                <TextInput value={form.consultation_instruments}
                                    onChange={(v) => set("consultation_instruments", v)}
                                    placeholder="cth: Peta, Koordinat, Proposal Teknis" error={errors?.consultation_instruments} />
                            </div>
                        </SectionCard>

                        {/* Step 1 Uploads */}
                        <SectionCard title="Lampiran Dokumen Pendukung" icon={FileText}>
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <FormLabel required>Dokumentasi Konsultasi</FormLabel>
                                    <p className="text-[11px] text-slate-500 mb-1.5">Foto dokumentasi saat melakukan konsultasi terkait KKPRL</p>
                                    <ExistingFiles docs={docsFor("dokumentasi_konsultasi")} onRemove={removeExistingDoc} />
                                    <FileUpload label="Tambahkan File Foto" name="dokumentasi_konsultasi" multiple max={5}
                                        files={files.dokumentasi_konsultasi} onChange={(f) => setFile("dokumentasi_konsultasi", f)}
                                        error={errors?.dokumentasi_konsultasi} />
                                </div>
                                <div>
                                    <FormLabel>Absensi Pendampingan KKPRL</FormLabel>
                                    <p className="text-[11px] text-slate-500 mb-1.5">Screenshot/foto lembar absensi kegiatan pendampingan KKPRL</p>
                                    <ExistingFiles docs={docsFor("absensi_pendampingan")} onRemove={removeExistingDoc} />
                                    <FileUpload label="Tambahkan File Absensi" name="absensi_pendampingan"
                                        files={files.absensi_pendampingan} onChange={(f) => setFile("absensi_pendampingan", f)}
                                        error={errors?.absensi_pendampingan} />
                                </div>
                                <div>
                                    <FormLabel>Tanda Tangan Perwakilan Subjek Hukum</FormLabel>
                                    <p className="text-[11px] text-slate-500 mb-1.5">Upload TTD digital atau foto TTD basah langsung pada dokumen fisik</p>
                                    <ExistingFiles docs={docsFor("tanda_tangan_perwakilan")} onRemove={removeExistingDoc} />
                                    <FileUpload label="Tambahkan File TTD" name="tanda_tangan_perwakilan"
                                        files={files.tanda_tangan_perwakilan} onChange={(f) => setFile("tanda_tangan_perwakilan", f)}
                                        error={errors?.tanda_tangan_perwakilan} />
                                </div>
                                <div>
                                    <FormLabel>Peta Hasil Plotting</FormLabel>
                                    <ExistingFiles docs={docsFor("peta_hasil_plotting")} onRemove={removeExistingDoc} />
                                    <FileUpload label="Tambahkan Peta" name="peta_hasil_plotting"
                                        files={files.peta_hasil_plotting} onChange={(f) => setFile("peta_hasil_plotting", f)}
                                        error={errors?.peta_hasil_plotting} />
                                </div>
                            </div>
                        </SectionCard>

                        {/* Next button */}
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={goToStep2}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-600/25">
                                Lanjut ke Langkah 2 <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                    <div className="space-y-5">
                        <SectionCard title="Asistensi Dokumen Permohonan KKPRL" icon={Layers}>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div>
                                    <FormLabel required>Kategori Kegiatan</FormLabel>
                                    <SelectInput
                                        value={form.activity_category}
                                        onChange={(v) => set("activity_category", v)}
                                        options={ACTIVITY_CATEGORIES.map((c) => ({ value: c, label: c }))}
                                        placeholder="Pilih Kategori"
                                        error={errors?.activity_category} />
                                </div>
                                <div>
                                    <FormLabel required>Luas Rencana Kegiatan</FormLabel>
                                    <div className="flex gap-2">
                                        <TextInput value={form.planned_area} onChange={(v) => set("planned_area", v)}
                                            placeholder="0.00" error={errors?.planned_area} />
                                        <SelectInput value={form.planned_area_unit} onChange={(v) => set("planned_area_unit", v)}
                                            options={[{ value: "Ha", label: "Ha" }, { value: "Km", label: "Km" }]}
                                            error={errors?.planned_area_unit} />
                                    </div>
                                </div>
                                <div>
                                    <FormLabel required>Kondisi Eksisting</FormLabel>
                                    <RadioGroup name="existing_condition" value={form.existing_condition}
                                        options={[
                                            { value: "rencana", label: "Masih Rencana" },
                                            { value: "eksisting", label: "Sudah Eksisting" },
                                            { value: "konstruksi", label: "Dalam Konstruksi" },
                                        ]}
                                        onChange={(v) => set("existing_condition", v)}
                                        error={errors?.existing_condition} />
                                </div>
                            </div>

                            <div>
                                <FormLabel required>Titik Koordinat (Decimal Degree)</FormLabel>
                                <TextareaInput value={form.coordinate_points}
                                    onChange={(v) => set("coordinate_points", v)}
                                    placeholder={"Contoh format:\n118.2345, -5.1234\n118.2356, -5.1289"}
                                    rows={4} error={errors?.coordinate_points} />
                                <p className="text-[11px] text-slate-400 mt-1">Format: Bujur (lon), Lintang (lat) — satu titik per baris</p>
                            </div>

                            <div>
                                <FormLabel>Dokumen yang Dimiliki</FormLabel>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {OWNED_DOCUMENTS.map((doc) => {
                                        const checked = form.owned_documents.includes(doc);
                                        return (
                                            <label key={doc}
                                                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-xs font-medium
                                                    ${checked ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-blue-300 text-slate-600"}`}
                                                onClick={() => toggleOwnedDoc(doc)}
                                            >
                                                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
                                                    ${checked ? "border-blue-500 bg-blue-500" : "border-slate-300"}`}>
                                                    {checked && <Check className="w-2.5 h-2.5 text-white" />}
                                                </span>
                                                {doc}
                                            </label>
                                        );
                                    })}
                                </div>
                                {form.owned_documents.includes("Yang lain") && (
                                    <div className="mt-2">
                                        <TextInput value={form.owned_documents_other}
                                            onChange={(v) => set("owned_documents_other", v)}
                                            placeholder="Sebutkan dokumen lainnya..." />
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* 4 Narrative Fields */}
                        <SectionCard title="Uraian Teknis Kegiatan" icon={FileText}>
                            {[
                                { key: "activity_description", label: "Deskripsi Kegiatan", placeholder: "Jelaskan secara rinci rencana kegiatan pemanfaatan ruang laut..." },
                                { key: "surrounding_utilization", label: "Pemanfaatan Ruang Sekitar", placeholder: "Uraikan kondisi pemanfaatan ruang laut di sekitar lokasi..." },
                                { key: "environmental_condition", label: "Kondisi Lingkungan Sekitar", placeholder: "Deskripsikan kondisi lingkungan biofisik di sekitar lokasi..." },
                                { key: "other_information", label: "Informasi Lain yang Relevan", placeholder: "Tambahkan informasi pendukung lainnya yang relevan..." },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <FormLabel required>{label}</FormLabel>
                                    <TextareaInput
                                        value={(form as any)[key]}
                                        onChange={(v) => set(key as keyof FormData, v)}
                                        placeholder={placeholder} rows={5}
                                        error={(errors as any)?.[key]} />
                                </div>
                            ))}
                        </SectionCard>

                        {/* Step 2 Consultation Result */}
                        <SectionCard title="Hasil Konsultasi" icon={BadgeCheck}>
                            <div>
                                <FormLabel required>Hasil Asistensi Dokumen</FormLabel>
                                <RadioGroup name="consultation_result" value={form.consultation_result}
                                    options={[
                                        { value: "dokumen_sesuai", label: "✅ Dokumen Sudah Sesuai" },
                                        { value: "perlu_perbaikan", label: "⚠️ Dokumen Perlu Perbaikan" },
                                    ]}
                                    onChange={(v) => set("consultation_result", v)}
                                    error={errors?.consultation_result} cols={2} />
                            </div>
                        </SectionCard>

                        {/* Step 2 Uploads */}
                        <SectionCard title="Lampiran Asistensi" icon={Upload}>
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <FormLabel>Rencana Bangunan / Instalasi</FormLabel>
                                    <ExistingFiles docs={docsFor("rencana_bangunan_instalasi")} onRemove={removeExistingDoc} />
                                    <FileUpload label="Upload File" name="rencana_bangunan_instalasi"
                                        files={files.rencana_bangunan_instalasi}
                                        onChange={(f) => setFile("rencana_bangunan_instalasi", f)} />
                                </div>
                                <div>
                                    <FormLabel>Informasi Pemanfaatan Ruang Laut</FormLabel>
                                    <ExistingFiles docs={docsFor("informasi_pemanfaatan_ruang_laut")} onRemove={removeExistingDoc} />
                                    <FileUpload label="Upload File" name="informasi_pemanfaatan_ruang_laut"
                                        files={files.informasi_pemanfaatan_ruang_laut}
                                        onChange={(f) => setFile("informasi_pemanfaatan_ruang_laut", f)} />
                                </div>
                                <div>
                                    <FormLabel>Data Kondisi Terkini</FormLabel>
                                    <ExistingFiles docs={docsFor("data_kondisi_terkini")} onRemove={removeExistingDoc} />
                                    <FileUpload label="Upload File" name="data_kondisi_terkini"
                                        files={files.data_kondisi_terkini}
                                        onChange={(f) => setFile("data_kondisi_terkini", f)} />
                                </div>
                                <div>
                                    <FormLabel>Persyaratan Lainnya</FormLabel>
                                    <ExistingFiles docs={docsFor("persyaratan_lainnya")} onRemove={removeExistingDoc} />
                                    <FileUpload label="Upload File" name="persyaratan_lainnya" multiple max={5}
                                        files={files.persyaratan_lainnya}
                                        onChange={(f) => setFile("persyaratan_lainnya", f)} />
                                </div>
                                <div>
                                    <FormLabel>Titik Koordinat (File SHP / KML)</FormLabel>
                                    <ExistingFiles docs={docsFor("titik_koordinat")} onRemove={removeExistingDoc} />
                                    <FileUpload label="Upload File Koordinat" name="titik_koordinat"
                                        files={files.titik_koordinat}
                                        onChange={(f) => setFile("titik_koordinat", f)} />
                                </div>
                            </div>
                        </SectionCard>

                        {/* Nav Buttons */}
                        <div className="flex items-center justify-between gap-3">
                            <button type="button" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                                <ArrowLeft className="w-4 h-4" /> Kembali ke Langkah 1
                            </button>
                            <button type="button" onClick={handleSubmit} disabled={submitting}
                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/25 disabled:opacity-60">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
                                Simpan Berita Acara
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}