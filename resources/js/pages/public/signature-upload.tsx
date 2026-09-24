import { Head, router, useForm } from '@inertiajs/react';
import {
    PenTool,
    Search,
    CheckCircle2,
    Building2,
    CalendarClock,
    Mail,
    FileCheck2,
    AlertCircle,
    ArrowLeft,
    Download,
} from 'lucide-react';
import { useState } from 'react';
import SignaturePad from '@/components/signature-pad';
import { Button } from '@/components/ui/button';

type Submission = {
    id: number;
    nama_pemohon: string;
    instansi: string;
    email: string;
    nomor_telepon: string;
    rencana_kegiatan: string;
    tanda_tangan?: string | null;
    status: string;
    created_at: string;
    jadwal?: {
        tanggal?: string;
        waktu_awal?: string;
        waktu_akhir?: string;
        pelaksanaan?: string;
        lokasi?: { nama_lokasi: string } | null;
    } | null;
};

type Props = {
    submissions?: Submission[] | null;
    queryParams?: { email?: string; nomor_telepon?: string };
    lookupError?: string | null;
    flash?: { success?: string; error?: string };
};

function SubmissionCard({ submission }: { submission: Submission }) {
    const { data, setData, post, processing, errors } = useForm({
        id: submission.id,
        email: submission.email,
        nomor_telepon: submission.nomor_telepon,
        tanda_tangan: submission.tanda_tangan ?? '',
    });

    // Server-side validation errors are keyed `cards.{id}.{field}` so they only
    // surface on the card they belong to; that key union is outside the form's
    // typed keys, hence the cast.
    const scopedError = (field: string) =>
        (errors as Record<string, string | undefined>)[
            `cards.${submission.id}.${field}`
        ];

    const handleSubmitSignature = (e: React.FormEvent) => {
        e.preventDefault();
        post('/signature-upload', {
            preserveScroll: true,
        });
    };

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
                    <div className="flex items-center gap-2">
                        <a
                            href={`/master/permohonan-konsultasi/${submission.id}/download-confirmation-pdf`}
                            download
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 shadow-xs transition-colors hover:bg-red-50"
                        >
                            <Download className="h-3.5 w-3.5" /> Unduh Surat
                            Konfirmasi PDF
                        </a>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                            {submission.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 p-4 text-xs text-slate-600 sm:grid-cols-2 sm:p-5">
                <div className="flex items-start gap-2.5">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                        <p className="font-semibold text-slate-800">
                            Instansi / Perusahaan
                        </p>
                        <p>{submission.instansi || '-'}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2.5">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                        <p className="font-semibold text-slate-800">
                            Email Pemohon
                        </p>
                        <p>{submission.email}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2.5 sm:col-span-2">
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                        <p className="font-semibold text-slate-800">
                            Jadwal Konsultasi
                        </p>
                        <p>
                            {submission.jadwal?.tanggal
                                ? new Date(
                                      submission.jadwal.tanggal,
                                  ).toLocaleDateString('id-ID', {
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric',
                                  })
                                : '-'}{' '}
                            ({submission.jadwal?.waktu_awal ?? ''} -{' '}
                            {submission.jadwal?.waktu_akhir ?? ''})
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-100 p-5">
                <div className="mb-4">
                    <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <PenTool className="h-4 w-4 text-blue-600" />
                        Bubuhkan / Unggah Tanda Tangan
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Anda dapat menggambar tanda tangan secara langsung pada
                        kanvas di bawah, atau mengunggah gambar file tanda
                        tangan bertipe PNG/JPG.
                    </p>
                </div>

                <form onSubmit={handleSubmitSignature} className="space-y-4">
                    <SignaturePad
                        value={data.tanda_tangan}
                        onChange={(val) => setData('tanda_tangan', val)}
                        error={
                            scopedError('tanda_tangan') ??
                            scopedError('nomor_telepon')
                        }
                    />

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={processing || !data.tanda_tangan}
                            className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
                        >
                            {processing
                                ? 'Menyimpan...'
                                : 'Simpan Tanda Tangan'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function PublicSignatureUpload({
    submissions,
    queryParams,
    lookupError,
    flash,
}: Props) {
    const [searchEmail, setSearchEmail] = useState(queryParams?.email ?? '');
    const [searchNohp, setSearchNohp] = useState(
        queryParams?.nomor_telepon ?? '',
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/signature-upload',
            {
                email: searchEmail.trim() || undefined,
                nomor_telepon: searchNohp.trim() || undefined,
            },
            { preserveState: false },
        );
    };

    const hasQuery = Boolean(queryParams?.email || queryParams?.nomor_telepon);
    const found = (submissions?.length ?? 0) > 0;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
            <Head title="Unggah Tanda Tangan Pemohon - BPRL Makassar" />

            {/* Header / Navbar */}
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20">
                            <PenTool className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-base leading-tight font-bold text-slate-900">
                                BPRL Makassar
                            </h1>
                            <p className="text-xs text-slate-500">
                                Upload Tanda Tangan Permohonan Konsultasi
                            </p>
                        </div>
                    </div>
                    <a
                        href="/request-form"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Formulir
                        Permohonan
                    </a>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                {/* Search / Credential Box */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <Search className="h-4 w-4 text-blue-600" />
                            Cari Permohonan Konsultasi Anda
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Masukkan alamat email dan No. HP yang Anda gunakan
                            saat membuat permohonan. No. HP berfungsi sebagai
                            kata sandi.
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
                                Cari Permohonan
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 flex animate-in items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 fade-in-50">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        <div>
                            <p className="font-bold">{flash.success}</p>
                            <p className="mt-0.5 text-xs text-emerald-700">
                                Tanda tangan telah tersimpan secara resmi pada
                                berkas permohonan konsultasi Anda.
                            </p>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                        {flash.error}
                    </div>
                )}

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
                                {submissions?.length}
                            </span>{' '}
                            permohonan. Bubuhkan tanda tangan pada permohonan
                            yang bersangkutan.
                        </p>
                        {submissions?.map((submission) => (
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
                            <FileCheck2 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
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
