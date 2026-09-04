import { usePage } from '@inertiajs/react';
import MainLayout from '@/pages/backend/layout';
import {
    ClipboardCheck,
    FileCheck2,
    ArrowRight,
    ArrowLeft,
    Upload,
    Check,
    User,
    FileText,
    Loader2,
    Calendar,
    Layers,
    BadgeCheck,
} from 'lucide-react';
import { ComboboxSearch } from '@/components/backend/combobox-searchable';
import {
    FormLabel,
    FieldError,
    RadioGroup,
    TextInput,
    TextareaInput,
    SelectInput,
    FileUpload,
    SectionCard,
    ExistingFiles,
} from '@/components/berita_acara_components';
import {
    LOCATIONS,
    ACTIVITY_DETAILS,
    WATER_NAMES,
    OWNED_DOCUMENTS,
    ACTIVITY_CATEGORIES,
} from '@/components/consts/berita-acara-options';
import type {
    BeritaAcaraFormProps,
    FormData,
} from '@/components/types/berita-acara';
import { useBeritaAcaraForm } from '@/props/hooks/useBeritaAcaraForm';

export default function BeritaAcara({
    staffList,
    konsultasi,
    berita_acara,
    adminMode = false,
}: BeritaAcaraFormProps) {
    const { errors } = usePage<any>().props;

    const {
        isAsistensi,
        step,
        setStep,
        form,
        set,
        files,
        setFile,
        submitting,
        toggleOwnedDoc,
        docsFor,
        removeExistingDoc,
        goToStep2,
        handleSubmit,
    } = useBeritaAcaraForm(konsultasi, berita_acara, adminMode);

    // staffOptions is currently unused in the markup below (kept from the
    // original component) — wire it into a staff-assignment field if/when
    // that UI is added.
    const staffOptions = staffList.map((s) => ({
        value: String(s.id),
        label: `${s.name} — ${s.position}`,
    }));

    const handleGoToStep2 = () => {
        if (goToStep2()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const backToStep1 = () => {
        setStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <MainLayout pageTitle={berita_acara ? 'Edit Berita Acara Konsultasi' : 'Buat Berita Acara Konsultasi'}>
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900">
                            Berita Acara Hasil Asistensi/Konsultasi KKPRL
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-500">
                            BPRL Makassar • Ditjen PRL KKP RI
                        </p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    {[
                        {
                            n: 1,
                            label: 'Konsultasi / Koordinasi',
                            icon: ClipboardCheck,
                        },
                        { n: 2, label: 'Asistensi Dokumen', icon: FileCheck2 },
                    ].map(({ n, label, icon: Icon }, idx) => (
                        <div
                            key={n}
                            onClick={() => {
                                if (n === 1 && step === 2) backToStep1();
                            }}
                            className={`flex flex-1 items-center gap-2 ${n === 1 && step === 2 ? 'cursor-pointer' : ''}`}
                        >
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${step > n ? 'bg-emerald-500 text-white' : step === n ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                            >
                                {step > n ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Icon className="h-4 w-4" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p
                                    className={`truncate text-xs font-bold ${step === n ? 'text-blue-700' : 'text-slate-500'}`}
                                >
                                    {label}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                    {n === 2
                                        ? isAsistensi
                                            ? 'Langkah 2 — Asistensi Dokumen'
                                            : 'Langkah 2 — Catatan Konsultasi'
                                        : `Langkah ${n}`}
                                </p>
                            </div>
                            {idx < 1 && (
                                <div className="mx-2 h-px flex-1 bg-slate-200" />
                            )}
                        </div>
                    ))}
                </div>

                {/* ── STEP 1 ── */}
                {step === 1 && (
                    <div className="space-y-5">
                        {/* Session Info */}
                        <SectionCard
                            title="Informasi Sesi Konsultasi"
                            icon={Calendar}
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <FormLabel required>
                                        Tahap Konsultasi
                                    </FormLabel>
                                    <RadioGroup
                                        name="consultation_stage"
                                        value={form.consultation_stage}
                                        options={[
                                            {
                                                value: 'konsultasi',
                                                label: 'Konsultasi / Koordinasi',
                                            },
                                            {
                                                value: 'asistensi',
                                                label: 'Asistensi Dokumen',
                                            },
                                        ]}
                                        onChange={(v) =>
                                            set('consultation_stage', v)
                                        }
                                        error={errors?.consultation_stage}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <FormLabel required>
                                            Tanggal Konsultasi
                                        </FormLabel>
                                        <TextInput
                                            type="date"
                                            value={form.consultation_date}
                                            onChange={(v) =>
                                                set('consultation_date', v)
                                            }
                                            error={errors?.consultation_date}
                                        />
                                    </div>
                                    <div>
                                        <FormLabel>
                                            Nomor Berita Acara
                                        </FormLabel>
                                        <TextInput
                                            value={form.berita_acara_number}
                                            onChange={(v) =>
                                                set('berita_acara_number', v)
                                            }
                                            placeholder="B.257/BPRLL.3/PRL.140/IV/2026"
                                            error={errors?.berita_acara_number}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <FormLabel required>Mode Pelaksanaan</FormLabel>
                                <RadioGroup
                                    name="implementation_mode"
                                    value={form.implementation_mode}
                                    options={[
                                        {
                                            value: 'daring',
                                            label: 'Daring (Online)',
                                        },
                                        {
                                            value: 'luring',
                                            label: 'Luring (Tatap Muka)',
                                        },
                                        { value: 'hybrid', label: 'Hybrid' },
                                    ]}
                                    onChange={(v) =>
                                        set('implementation_mode', v)
                                    }
                                    error={errors?.implementation_mode}
                                    cols={3}
                                />
                            </div>

                            <div>
                                <FormLabel required>
                                    Lokasi Pelaksanaan
                                </FormLabel>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {LOCATIONS.map((loc) => (
                                        <label
                                            key={loc}
                                            className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${form.location === loc ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="location"
                                                value={loc}
                                                checked={form.location === loc}
                                                onChange={() =>
                                                    set('location', loc)
                                                }
                                                className="hidden"
                                            />
                                            <span
                                                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${form.location === loc ? 'border-blue-500' : 'border-slate-300'}`}
                                            >
                                                {form.location === loc && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                )}
                                            </span>
                                            {loc}
                                        </label>
                                    ))}
                                </div>
                                {form.location === 'Lainnya' && (
                                    <div className="mt-2">
                                        <TextInput
                                            value={form.location_other}
                                            onChange={(v) =>
                                                set('location_other', v)
                                            }
                                            placeholder="Sebutkan lokasi lainnya..."
                                            error={errors?.location_other}
                                        />
                                    </div>
                                )}
                                <FieldError message={errors?.location} />
                            </div>
                        </SectionCard>

                        {/* Requester & Site */}
                        <SectionCard
                            title="Data Pemohon & Subjek Hukum"
                            icon={User}
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <FormLabel required>Nama Pemohon</FormLabel>
                                    <TextInput
                                        value={form.requester_name}
                                        onChange={(v) =>
                                            set('requester_name', v)
                                        }
                                        placeholder="Nama lengkap pemohon"
                                        error={errors?.requester_name}
                                    />
                                </div>
                                <div>
                                    <FormLabel required>
                                        Jabatan Pemohon
                                    </FormLabel>
                                    <TextInput
                                        value={form.requester_position}
                                        onChange={(v) =>
                                            set('requester_position', v)
                                        }
                                        placeholder="Direktur / Kuasa Hukum / dll."
                                        error={errors?.requester_position}
                                    />
                                </div>
                                <div>
                                    <FormLabel required>
                                        Nama Subjek Hukum (Instansi /
                                        Perusahaan)
                                    </FormLabel>
                                    <TextInput
                                        value={form.legal_entity_name}
                                        onChange={(v) =>
                                            set('legal_entity_name', v)
                                        }
                                        placeholder="PT. / CV. / Instansi / Perorangan"
                                        error={errors?.legal_entity_name}
                                    />
                                </div>
                                <div>
                                    <FormLabel required>Email Kontak</FormLabel>
                                    <TextInput
                                        type="email"
                                        value={form.contact_email}
                                        onChange={(v) =>
                                            set('contact_email', v)
                                        }
                                        placeholder="email@contoh.com"
                                        error={errors?.contact_email}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <FormLabel required>
                                        Jenis Persetujuan
                                    </FormLabel>
                                    <RadioGroup
                                        name="permit_type"
                                        value={form.permit_type}
                                        options={[
                                            {
                                                value: 'persetujuan',
                                                label: 'Persetujuan KKPRL',
                                            },
                                            {
                                                value: 'konfirmasi',
                                                label: 'Konfirmasi KKPRL',
                                            },
                                        ]}
                                        onChange={(v) => set('permit_type', v)}
                                        error={errors?.permit_type}
                                    />
                                </div>
                                <div>
                                    <FormLabel required>
                                        Jenis Kegiatan
                                    </FormLabel>
                                    <RadioGroup
                                        name="activity_type"
                                        value={form.activity_type}
                                        options={[
                                            {
                                                value: 'berusaha',
                                                label: 'Kegiatan Berusaha',
                                            },
                                            {
                                                value: 'non_berusaha',
                                                label: 'Kegiatan Non-Berusaha',
                                            },
                                        ]}
                                        onChange={(v) =>
                                            set('activity_type', v)
                                        }
                                        error={errors?.activity_type}
                                    />
                                </div>
                            </div>

                            <div>
                                <FormLabel required>Rincian Kegiatan</FormLabel>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {ACTIVITY_DETAILS.map((a) => (
                                        <label
                                            key={a}
                                            className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${form.activity_detail === a ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="activity_detail"
                                                value={a}
                                                checked={
                                                    form.activity_detail === a
                                                }
                                                onChange={() =>
                                                    set('activity_detail', a)
                                                }
                                                className="hidden"
                                            />
                                            <span
                                                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${form.activity_detail === a ? 'border-blue-500' : 'border-slate-300'}`}
                                            >
                                                {form.activity_detail === a && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                )}
                                            </span>
                                            {a}
                                        </label>
                                    ))}
                                </div>
                                {form.activity_detail === 'Yang lain' && (
                                    <div className="mt-2">
                                        <TextInput
                                            value={form.activity_detail_other}
                                            onChange={(v) =>
                                                set('activity_detail_other', v)
                                            }
                                            placeholder="Sebutkan rincian kegiatan lainnya..."
                                            error={
                                                errors?.activity_detail_other
                                            }
                                        />
                                    </div>
                                )}
                                <FieldError message={errors?.activity_detail} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <FormLabel>Kode KBLI</FormLabel>
                                    <TextInput
                                        value={form.kbli}
                                        onChange={(v) => set('kbli', v)}
                                        placeholder="cth: 52221"
                                        error={errors?.kbli}
                                    />
                                </div>
                                <div>
                                    <FormLabel required>Provinsi</FormLabel>
                                    <ComboboxSearch
                                        value={form.province}
                                        onChange={(val) => set('province', val)}
                                        fetchUrl="/api/geolocation/provinces"
                                        labelKey="name"
                                        valueKey="id"
                                        placeholder="Pilih provinsi"
                                    />
                                </div>
                                <div>
                                    <FormLabel required>
                                        Kabupaten / Kota
                                    </FormLabel>
                                    <ComboboxSearch
                                        value={form.regency}
                                        onChange={(val) => set('regency', val)}
                                        fetchUrl={`/api/geolocation/regencies?province_id=${form.province}`}
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
                                        fetchUrl={
                                            form.regency
                                                ? `/api/geolocation/districts?regency_id=${form.regency}`
                                                : ''
                                        }
                                        labelKey="name"
                                        valueKey="id"
                                        placeholder="Pilih kecamatan"
                                    />
                                </div>
                            </div>

                            <div>
                                <FormLabel required>Nama Perairan</FormLabel>
                                <div className="mb-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                    {WATER_NAMES.map((w) => (
                                        <label
                                            key={w}
                                            className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${form.water_name === w ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="water_name"
                                                value={w}
                                                checked={form.water_name === w}
                                                onChange={() =>
                                                    set('water_name', w)
                                                }
                                                className="hidden"
                                            />
                                            <span
                                                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 ${form.water_name === w ? 'border-blue-500' : 'border-slate-300'}`}
                                            >
                                                {form.water_name === w && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                )}
                                            </span>
                                            {w}
                                        </label>
                                    ))}
                                </div>
                                {form.water_name === 'Lainnya' && (
                                    <TextInput
                                        value={form.water_name_other}
                                        onChange={(v) =>
                                            set('water_name_other', v)
                                        }
                                        placeholder="Nama perairan lainnya..."
                                        error={errors?.water_name_other}
                                    />
                                )}
                                <FieldError message={errors?.water_name} />
                            </div>

                            <div>
                                <FormLabel>Instrumen Konsultasi</FormLabel>
                                <TextInput
                                    value={form.consultation_instruments}
                                    onChange={(v) =>
                                        set('consultation_instruments', v)
                                    }
                                    placeholder="cth: Peta, Koordinat, Proposal Teknis"
                                    error={errors?.consultation_instruments}
                                />
                            </div>
                        </SectionCard>

                        {/* Step 1 Uploads */}
                        <SectionCard
                            title="Lampiran Dokumen Pendukung"
                            icon={FileText}
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <FormLabel required>
                                        Dokumentasi Konsultasi
                                    </FormLabel>
                                    <p className="mb-1.5 text-[11px] text-slate-500">
                                        Foto dokumentasi saat melakukan
                                        konsultasi terkait KKPRL
                                    </p>
                                    <ExistingFiles
                                        docs={docsFor('dokumentasi_konsultasi')}
                                        onRemove={removeExistingDoc}
                                    />
                                    <FileUpload
                                        label="Tambahkan File Foto"
                                        name="dokumentasi_konsultasi"
                                        multiple
                                        max={5}
                                        files={files.dokumentasi_konsultasi}
                                        onChange={(f) =>
                                            setFile('dokumentasi_konsultasi', f)
                                        }
                                        error={errors?.dokumentasi_konsultasi}
                                    />
                                </div>
                                <div>
                                    <FormLabel>
                                        Absensi Pendampingan KKPRL
                                    </FormLabel>
                                    <p className="mb-1.5 text-[11px] text-slate-500">
                                        Screenshot/foto lembar absensi kegiatan
                                        pendampingan KKPRL
                                    </p>
                                    <ExistingFiles
                                        docs={docsFor('absensi_pendampingan')}
                                        onRemove={removeExistingDoc}
                                    />
                                    <FileUpload
                                        label="Tambahkan File Absensi"
                                        name="absensi_pendampingan"
                                        files={files.absensi_pendampingan}
                                        onChange={(f) =>
                                            setFile('absensi_pendampingan', f)
                                        }
                                        error={errors?.absensi_pendampingan}
                                    />
                                </div>
                                <div>
                                    <FormLabel>
                                        Tanda Tangan Perwakilan Subjek Hukum
                                    </FormLabel>
                                    <p className="mb-1.5 text-[11px] text-slate-500">
                                        Upload TTD digital atau foto TTD basah
                                        langsung pada dokumen fisik
                                    </p>
                                    <ExistingFiles
                                        docs={docsFor(
                                            'tanda_tangan_perwakilan',
                                        )}
                                        onRemove={removeExistingDoc}
                                    />
                                    <FileUpload
                                        label="Tambahkan File TTD"
                                        name="tanda_tangan_perwakilan"
                                        files={files.tanda_tangan_perwakilan}
                                        onChange={(f) =>
                                            setFile(
                                                'tanda_tangan_perwakilan',
                                                f,
                                            )
                                        }
                                        error={errors?.tanda_tangan_perwakilan}
                                    />
                                </div>
                                <div>
                                    <FormLabel>Peta Hasil Plotting</FormLabel>
                                    <ExistingFiles
                                        docs={docsFor('peta_hasil_plotting')}
                                        onRemove={removeExistingDoc}
                                    />
                                    <FileUpload
                                        label="Tambahkan Peta"
                                        name="peta_hasil_plotting"
                                        files={files.peta_hasil_plotting}
                                        onChange={(f) =>
                                            setFile('peta_hasil_plotting', f)
                                        }
                                        error={errors?.peta_hasil_plotting}
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        {/* Next button */}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleGoToStep2}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700"
                            >
                                Lanjut ke Langkah 2{' '}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                    <div className="space-y-5">
                        {!isAsistensi && (
                            <SectionCard
                                title="Hasil Konsultasi/Koordinasi"
                                icon={BadgeCheck}
                            >
                                <div>
                                    <FormLabel required>
                                        Catatan Hasil Konsultasi/Koordinasi
                                    </FormLabel>
                                    <p className="mb-2 text-[11px] text-slate-500">
                                        Harap mengisi resume atau poin-poin
                                        penting hasil konsultasi/koordinasi
                                        KKPRL. Uraikan kesepakatan, catatan
                                        perbaikan, atau rekomendasi teknis yang
                                        dihasilkan secara jelas agar
                                        terdokumentasi dengan baik dalam dokumen
                                        Berita Acara.
                                    </p>
                                    <TextareaInput
                                        value={form.consultation_notes}
                                        onChange={(v) =>
                                            set('consultation_notes', v)
                                        }
                                        placeholder="Contoh: Pemohon perlu melampirkan gambar rencana tapak (site plan) yang menunjukkan posisi pipa pengambilan air laut terhadap garis pantai dan batas area budidaya secara jelas..."
                                        rows={10}
                                        error={errors?.consultation_notes}
                                    />
                                </div>
                            </SectionCard>
                        )}

                        {isAsistensi && (
                            <>
                                <SectionCard
                                    title="Asistensi Dokumen Permohonan KKPRL"
                                    icon={Layers}
                                >
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <FormLabel required>
                                                Kategori Kegiatan
                                            </FormLabel>
                                            <SelectInput
                                                value={form.activity_category}
                                                onChange={(v) =>
                                                    set('activity_category', v)
                                                }
                                                options={ACTIVITY_CATEGORIES.map(
                                                    (c) => ({
                                                        value: c,
                                                        label: c,
                                                    }),
                                                )}
                                                placeholder="Pilih Kategori"
                                                error={
                                                    errors?.activity_category
                                                }
                                            />
                                        </div>
                                        <div>
                                            <FormLabel required>
                                                Luas Rencana Kegiatan
                                            </FormLabel>
                                            <div className="flex gap-2">
                                                <TextInput
                                                    value={form.planned_area}
                                                    onChange={(v) =>
                                                        set('planned_area', v)
                                                    }
                                                    placeholder="0.00"
                                                    error={errors?.planned_area}
                                                />
                                                <SelectInput
                                                    value={
                                                        form.planned_area_unit
                                                    }
                                                    onChange={(v) =>
                                                        set(
                                                            'planned_area_unit',
                                                            v,
                                                        )
                                                    }
                                                    options={[
                                                        {
                                                            value: 'Ha',
                                                            label: 'Ha',
                                                        },
                                                        {
                                                            value: 'Km',
                                                            label: 'Km',
                                                        },
                                                    ]}
                                                    error={
                                                        errors?.planned_area_unit
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <FormLabel required>
                                                Kondisi Eksisting
                                            </FormLabel>
                                            <RadioGroup
                                                name="existing_condition"
                                                value={form.existing_condition}
                                                options={[
                                                    {
                                                        value: 'rencana',
                                                        label: 'Masih Rencana',
                                                    },
                                                    {
                                                        value: 'eksisting',
                                                        label: 'Sudah Eksisting',
                                                    },
                                                    {
                                                        value: 'konstruksi',
                                                        label: 'Dalam Konstruksi',
                                                    },
                                                ]}
                                                onChange={(v) =>
                                                    set('existing_condition', v)
                                                }
                                                error={
                                                    errors?.existing_condition
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <FormLabel required>
                                            Titik Koordinat (Decimal Degree)
                                        </FormLabel>
                                        <TextareaInput
                                            value={form.coordinate_points}
                                            onChange={(v) =>
                                                set('coordinate_points', v)
                                            }
                                            placeholder={
                                                'Contoh format:\n118.2345, -5.1234\n118.2356, -5.1289'
                                            }
                                            rows={4}
                                            error={errors?.coordinate_points}
                                        />
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            Format: Bujur (lon), Lintang (lat) —
                                            satu titik per baris
                                        </p>
                                    </div>

                                    <div>
                                        <FormLabel>
                                            Dokumen yang Dimiliki
                                        </FormLabel>
                                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                            {OWNED_DOCUMENTS.map((doc) => {
                                                const checked =
                                                    form.owned_documents.includes(
                                                        doc,
                                                    );
                                                return (
                                                    <label
                                                        key={doc}
                                                        className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${checked ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
                                                        onClick={() =>
                                                            toggleOwnedDoc(doc)
                                                        }
                                                    >
                                                        <span
                                                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${checked ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}
                                                        >
                                                            {checked && (
                                                                <Check className="h-2.5 w-2.5 text-white" />
                                                            )}
                                                        </span>
                                                        {doc}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        {form.owned_documents.includes(
                                            'Yang lain',
                                        ) && (
                                            <div className="mt-2">
                                                <TextInput
                                                    value={
                                                        form.owned_documents_other
                                                    }
                                                    onChange={(v) =>
                                                        set(
                                                            'owned_documents_other',
                                                            v,
                                                        )
                                                    }
                                                    placeholder="Sebutkan dokumen lainnya..."
                                                />
                                            </div>
                                        )}
                                    </div>
                                </SectionCard>

                                <SectionCard
                                    title="Uraian Teknis Kegiatan"
                                    icon={FileText}
                                >
                                    {[
                                        {
                                            key: 'activity_description',
                                            label: 'Deskripsi Kegiatan',
                                            placeholder:
                                                'Jelaskan secara rinci rencana kegiatan pemanfaatan ruang laut...',
                                        },
                                        {
                                            key: 'surrounding_utilization',
                                            label: 'Pemanfaatan Ruang Sekitar',
                                            placeholder:
                                                'Uraikan kondisi pemanfaatan ruang laut di sekitar lokasi...',
                                        },
                                        {
                                            key: 'environmental_condition',
                                            label: 'Kondisi Lingkungan Sekitar',
                                            placeholder:
                                                'Deskripsikan kondisi lingkungan biofisik di sekitar lokasi...',
                                        },
                                        {
                                            key: 'other_information',
                                            label: 'Informasi Lain yang Relevan',
                                            placeholder:
                                                'Tambahkan informasi pendukung lainnya yang relevan...',
                                        },
                                    ].map(({ key, label, placeholder }) => (
                                        <div key={key}>
                                            <FormLabel required>
                                                {label}
                                            </FormLabel>
                                            <TextareaInput
                                                value={(form as any)[key]}
                                                onChange={(v) =>
                                                    set(
                                                        key as keyof FormData,
                                                        v,
                                                    )
                                                }
                                                placeholder={placeholder}
                                                rows={5}
                                                error={(errors as any)?.[key]}
                                            />
                                        </div>
                                    ))}
                                </SectionCard>

                                <SectionCard
                                    title="Hasil Konsultasi"
                                    icon={BadgeCheck}
                                >
                                    <div>
                                        <FormLabel required>
                                            Hasil Asistensi Dokumen
                                        </FormLabel>
                                        <RadioGroup
                                            name="consultation_result"
                                            value={form.consultation_result}
                                            options={[
                                                {
                                                    value: 'dokumen_sesuai',
                                                    label: '✅ Dokumen Sudah Sesuai',
                                                },
                                                {
                                                    value: 'perlu_perbaikan',
                                                    label: '⚠️ Dokumen Perlu Perbaikan',
                                                },
                                            ]}
                                            onChange={(v) =>
                                                set('consultation_result', v)
                                            }
                                            error={errors?.consultation_result}
                                            cols={2}
                                        />
                                    </div>
                                </SectionCard>

                                <SectionCard
                                    title="Lampiran Asistensi"
                                    icon={Upload}
                                >
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <FormLabel>
                                                Rencana Bangunan / Instalasi
                                            </FormLabel>
                                            <ExistingFiles
                                                docs={docsFor(
                                                    'rencana_bangunan_instalasi',
                                                )}
                                                onRemove={removeExistingDoc}
                                            />
                                            <FileUpload
                                                label="Upload File"
                                                name="rencana_bangunan_instalasi"
                                                files={
                                                    files.rencana_bangunan_instalasi
                                                }
                                                onChange={(f) =>
                                                    setFile(
                                                        'rencana_bangunan_instalasi',
                                                        f,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <FormLabel>
                                                Informasi Pemanfaatan Ruang Laut
                                            </FormLabel>
                                            <ExistingFiles
                                                docs={docsFor(
                                                    'informasi_pemanfaatan_ruang_laut',
                                                )}
                                                onRemove={removeExistingDoc}
                                            />
                                            <FileUpload
                                                label="Upload File"
                                                name="informasi_pemanfaatan_ruang_laut"
                                                files={
                                                    files.informasi_pemanfaatan_ruang_laut
                                                }
                                                onChange={(f) =>
                                                    setFile(
                                                        'informasi_pemanfaatan_ruang_laut',
                                                        f,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <FormLabel>
                                                Data Kondisi Terkini
                                            </FormLabel>
                                            <ExistingFiles
                                                docs={docsFor(
                                                    'data_kondisi_terkini',
                                                )}
                                                onRemove={removeExistingDoc}
                                            />
                                            <FileUpload
                                                label="Upload File"
                                                name="data_kondisi_terkini"
                                                files={
                                                    files.data_kondisi_terkini
                                                }
                                                onChange={(f) =>
                                                    setFile(
                                                        'data_kondisi_terkini',
                                                        f,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <FormLabel>
                                                Persyaratan Lainnya
                                            </FormLabel>
                                            <ExistingFiles
                                                docs={docsFor(
                                                    'persyaratan_lainnya',
                                                )}
                                                onRemove={removeExistingDoc}
                                            />
                                            <FileUpload
                                                label="Upload File"
                                                name="persyaratan_lainnya"
                                                multiple
                                                max={5}
                                                files={
                                                    files.persyaratan_lainnya
                                                }
                                                onChange={(f) =>
                                                    setFile(
                                                        'persyaratan_lainnya',
                                                        f,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <FormLabel>
                                                Titik Koordinat (File SHP / KML)
                                            </FormLabel>
                                            <ExistingFiles
                                                docs={docsFor(
                                                    'titik_koordinat',
                                                )}
                                                onRemove={removeExistingDoc}
                                            />
                                            <FileUpload
                                                label="Upload File Koordinat"
                                                name="titik_koordinat"
                                                files={files.titik_koordinat}
                                                onChange={(f) =>
                                                    setFile(
                                                        'titik_koordinat',
                                                        f,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </SectionCard>
                            </>
                        )}

                        {/* Nav Buttons */}
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={backToStep1}
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                            >
                                <ArrowLeft className="h-4 w-4" /> Kembali ke
                                Langkah 1
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:bg-emerald-700 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <BadgeCheck className="h-4 w-4" />
                                )}
                                {berita_acara ? 'Perbarui Berita Acara' : 'Simpan Berita Acara'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
