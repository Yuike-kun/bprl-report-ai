import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    CalendarDays,
    Download,
    FileCheck2,
    FileSearch,
    MapPin,
    Search,
    SearchX,
    UserRound,
    Waves,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type BeritaAcaraFinal = {
    id: number;
    status: string;
    is_final: true;
    berita_acara_number: string | null;
    consultation_date: string | null;
    implementation_mode: string;
    location: string;
    location_other: string | null;
    water_name: string | null;
    requester_name: string;
    requester_position: string;
    legal_entity_name: string;
    permit_type: string;
    activity_type: string;
    consultation_result: string | null;
    pdf_url: string;
};

type BeritaAcaraBrief = {
    id: number;
    status: string;
    is_final: false;
};

type Submission = {
    id: number;
    nama_pemohon: string;
    instansi: string;
    berita_acara: BeritaAcaraFinal | BeritaAcaraBrief | null;
};

type Props = {
    results?: Submission[] | null;
    queryParams?: { email?: string; nomor_telepon?: string };
    lookupError?: string | null;
};

const statusLabels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Dikirim',
    under_review: 'Ditinjau',
    approved: 'Final',
    rejected: 'Ditolak',
};

const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
};

const modeLabels: Record<string, string> = {
    daring: 'Daring',
    luring: 'Luring',
    hybrid: 'Hybrid',
};

const permitLabels: Record<string, string> = {
    persetujuan: 'Persetujuan',
    konfirmasi: 'Konfirmasi',
};

const activityLabels: Record<string, string> = {
    berusaha: 'Berusaha',
    non_berusaha: 'Non Berusaha',
};

const consultationResultLabels: Record<string, string> = {
    dokumen_sesuai: 'Dokumen sesuai',
    perlu_perbaikan: 'Perlu perbaikan',
};

function StatusPill({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold ${statusColors[status] ?? 'bg-slate-100 text-slate-600'}`}
        >
            {statusLabels[status] ?? status}
        </span>
    );
}

function formatDate(value: string | null) {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function Field({
    icon: Icon,
    label,
    value,
    mono,
}: {
    icon: typeof MapPin;
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start gap-2.5">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-500">
                    {label}
                </p>
                <p
                    className={
                        mono
                            ? 'font-mono text-xs font-bold break-all text-slate-900'
                            : 'text-xs text-slate-800'
                    }
                >
                    {value || '-'}
                </p>
            </div>
        </div>
    );
}

function FinalBeritaAcara({ beritaAcara }: { beritaAcara: BeritaAcaraFinal }) {
    const lokasi = [beritaAcara.location, beritaAcara.location_other]
        .filter(Boolean)
        .join(' — ');

    const pemohon = [beritaAcara.requester_name, beritaAcara.requester_position]
        .filter(Boolean)
        .join(' — ');

    const hasilKonsultasi = beritaAcara.consultation_result
        ? (consultationResultLabels[beritaAcara.consultation_result] ??
          beritaAcara.consultation_result)
        : '-';

    return (
        <>
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                <Field
                    icon={FileSearch}
                    label="Nomor Berita Acara"
                    value={beritaAcara.berita_acara_number ?? ''}
                    mono
                />
                <Field
                    icon={CalendarDays}
                    label="Tanggal Konsultasi"
                    value={formatDate(beritaAcara.consultation_date)}
                />
                <Field
                    icon={FileCheck2}
                    label="Mode Konsultasi"
                    value={
                        modeLabels[beritaAcara.implementation_mode] ??
                        beritaAcara.implementation_mode
                    }
                />
                <Field
                    icon={Waves}
                    label="Perairan"
                    value={beritaAcara.water_name ?? ''}
                />
                <Field icon={UserRound} label="Pemohon" value={pemohon} />
                <Field
                    icon={Building2}
                    label="Instansi / Badan Usaha"
                    value={beritaAcara.legal_entity_name}
                />
                <Field icon={MapPin} label="Lokasi" value={lokasi} />
                <Field
                    icon={FileCheck2}
                    label="Jenis Perizinan / Kegiatan"
                    value={`${permitLabels[beritaAcara.permit_type] ?? beritaAcara.permit_type} — ${activityLabels[beritaAcara.activity_type] ?? beritaAcara.activity_type}`}
                />
                <div className="sm:col-span-2">
                    <p className="mb-1 text-[11px] font-semibold text-slate-500">
                        Hasil Konsultasi
                    </p>
                    <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                        {hasilKonsultasi}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-5">
                <p className="text-xs text-slate-500">
                    Dokumen resmi yang diterbitkan BPRL Makassar.
                </p>
                <a
                    href={beritaAcara.pdf_url}
                    download
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 shadow-xs transition-colors hover:bg-red-50"
                >
                    <Download className="h-3.5 w-3.5" /> Unduh PDF Berita Acara
                </a>
            </div>
        </>
    );
}

function SubmissionCard({ submission }: { submission: Submission }) {
    const beritaAcara = submission.berita_acara;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <span className="font-mono text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                            ID PERMOHONAN #{submission.id}
                        </span>
                        <h3 className="mt-0.5 text-lg font-bold text-slate-900">
                            {submission.nama_pemohon}
                        </h3>
                    </div>
                    {beritaAcara && <StatusPill status={beritaAcara.status} />}
                </div>
            </div>

            {beritaAcara === null ? (
                <div className="p-5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs leading-relaxed font-medium text-slate-600">
                            Belum ada Berita Acara untuk permohonan ini. Berita
                            Acara diterbitkan setelah pelaksanaan konsultasi.
                        </p>
                    </div>
                </div>
            ) : beritaAcara.is_final ? (
                <FinalBeritaAcara beritaAcara={beritaAcara} />
            ) : (
                <div className="p-5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs leading-relaxed font-medium text-slate-600">
                            {beritaAcara.status === 'rejected'
                                ? 'Berita Acara berstatus ditolak dan tidak diterbitkan sebagai dokumen final.'
                                : 'Berita Acara masih diproses dan belum berstatus final. Peninjauan isi dan unduhan PDF tersedia setelah dokumen difinalkan oleh BPRL.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PublicCekBeritaAcara({
    results,
    queryParams,
    lookupError,
}: Props) {
    const [searchEmail, setSearchEmail] = useState(queryParams?.email ?? '');
    const [searchNohp, setSearchNohp] = useState(
        queryParams?.nomor_telepon ?? '',
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/cek-berita-acara',
            {
                email: searchEmail.trim() || undefined,
                nomor_telepon: searchNohp.trim() || undefined,
            },
            { preserveState: false },
        );
    };

    const hasQuery = Boolean(queryParams?.email || queryParams?.nomor_telepon);
    const found = (results?.length ?? 0) > 0;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
            <Head title="Cek Berita Acara Final - BPRL Makassar" />

            {/* Header / Navbar */}
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20">
                            <FileCheck2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-base leading-tight font-bold text-slate-900">
                                BPRL Makassar
                            </h1>
                            <p className="text-xs text-slate-500">
                                Cek & Tinjau Berita Acara Final
                            </p>
                        </div>
                    </div>
                    <a
                        href="/"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Beranda
                    </a>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                {/* Search / Credential Box */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <Search className="h-4 w-4 text-blue-600" />
                            Cek Berita Acara Anda
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Masukkan alamat email dan No. HP yang Anda gunakan
                            saat membuat permohonan. No. HP berfungsi sebagai
                            kata sandi; hanya Berita Acara berstatus final yang
                            dapat ditinjau dan diunduh.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="grid gap-3 sm:grid-cols-[1.2fr_1fr_auto]"
                    >
                        <div>
                            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                                Email Pemohon
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="email@pemohon.com"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                                No. HP (Kata Sandi)
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="081234567890"
                                value={searchNohp}
                                onChange={(e) => setSearchNohp(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                type="submit"
                                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                            >
                                Cek Berita Acara
                            </Button>
                        </div>
                    </form>
                </div>

                {lookupError && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                        {lookupError}
                    </div>
                )}

                {/* Results: every permohonan owned by the matched credentials */}
                {found ? (
                    <div className="space-y-6">
                        <p className="text-xs text-slate-500">
                            Ditemukan{' '}
                            <span className="font-bold text-slate-700">
                                {results?.length}
                            </span>{' '}
                            permohonan. Tinjau Berita Acara yang sudah final
                            pada permohonan bersangkutan.
                        </p>
                        {results?.map((submission) => (
                            <SubmissionCard
                                key={submission.id}
                                submission={submission}
                            />
                        ))}
                    </div>
                ) : (
                    hasQuery &&
                    !lookupError && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <SearchX className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                            <h3 className="text-base font-bold text-slate-800">
                                Data Permohonan Tidak Ditemukan
                            </h3>
                            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                                Mohon periksa kembali alamat email dan No. HP
                                yang Anda masukkan. Keduanya harus sesuai dengan
                                data saat membuat permohonan.
                            </p>
                        </div>
                    )
                )}
            </main>
        </div>
    );
}
