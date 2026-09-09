import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    PenTool,
    Search,
    CheckCircle2,
    Building2,
    CalendarClock,
    User,
    Mail,
    FileCheck2,
    AlertCircle,
    ArrowLeft,
    Download,
} from 'lucide-react';
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
    submission?: Submission | null;
    queryParams?: { id?: string; email?: string };
    flash?: { success?: string; error?: string };
};

export default function PublicSignatureUpload({ submission, queryParams, flash }: Props) {
    const [searchId, setSearchId] = useState(queryParams?.id ?? '');
    const [searchEmail, setSearchEmail] = useState(queryParams?.email ?? '');

    const { data, setData, post, processing, errors } = useForm({
        id: submission?.id ?? '',
        email: submission?.email ?? '',
        tanda_tangan: submission?.tanda_tangan ?? '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/signature-upload',
            { id: searchId || undefined, email: searchEmail || undefined },
            { preserveState: false },
        );
    };

    const handleSubmitSignature = (e: React.FormEvent) => {
        e.preventDefault();
        if (!submission) return;

        post('/signature-upload', {
            preserveScroll: true,
        });
    };

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
                            <h1 className="text-base font-bold leading-tight text-slate-900">
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
                        <ArrowLeft className="h-3.5 w-3.5" /> Formulir Permohonan
                    </a>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                {/* Search / Lookup Box if submission is not active or user wants to re-search */}
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <Search className="h-4 w-4 text-blue-600" />
                            Cari Permohonan Konsultasi Anda
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Masukkan ID Permohonan dan/atau alamat email yang digunakan saat mendaftar.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]">
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                ID Permohonan (Opsional)
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: 12"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Email Pemohon
                            </label>
                            <input
                                type="email"
                                placeholder="email@pemohon.com"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                type="submit"
                                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 shadow-sm"
                            >
                                Cari Data
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 animate-in fade-in-50">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        <div>
                            <p className="font-bold">{flash.success}</p>
                            <p className="text-xs text-emerald-700 mt-0.5">
                                Tanda tangan telah tersimpan secara resmi pada berkas permohonan konsultasi Anda.
                            </p>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                        {flash.error}
                    </div>
                )}

                {/* Submission Details & Signature Pad */}
                {submission ? (
                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                                            ID PERMOHONAN #{submission.id}
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                                            {submission.nama_pemohon}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`/master/permohonan-konsultasi/${submission.id}/download-confirmation-pdf`}
                                            download
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors shadow-xs"
                                        >
                                            <Download className="h-3.5 w-3.5" /> Unduh Surat Konfirmasi PDF
                                        </a>
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                            {submission.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 text-xs text-slate-600">
                                <div className="flex items-start gap-2.5">
                                    <Building2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-slate-800">Instansi / Perusahaan</p>
                                        <p>{submission.instansi || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-slate-800">Email Pemohon</p>
                                        <p>{submission.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5 sm:col-span-2">
                                    <CalendarClock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-slate-800">Jadwal Konsultasi</p>
                                        <p>
                                            {submission.jadwal?.tanggal
                                                ? new Date(submission.jadwal.tanggal).toLocaleDateString('id-ID', {
                                                      day: '2-digit',
                                                      month: 'long',
                                                      year: 'numeric',
                                                  })
                                                : '-'}{' '}
                                            ({submission.jadwal?.waktu_awal ?? ''} - {submission.jadwal?.waktu_akhir ?? ''})
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Signature Pad Section */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4">
                                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                                    <PenTool className="h-4 w-4 text-blue-600" />
                                    Bubuhkan / Unggah Tanda Tangan
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Anda dapat menggambar tanda tangan secara langsung pada kanvas di bawah, atau mengunggah gambar file tanda tangan bertipe PNG/JPG.
                                </p>
                            </div>

                            <form onSubmit={handleSubmitSignature} className="space-y-4">
                                <SignaturePad
                                    value={data.tanda_tangan}
                                    onChange={(val) => setData('tanda_tangan', val)}
                                    error={errors.tanda_tangan}
                                />

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.tanda_tangan}
                                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-6 shadow-md shadow-blue-500/20"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Tanda Tangan'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    (queryParams?.id || queryParams?.email) && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <FileCheck2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <h3 className="text-base font-bold text-slate-800">
                                Data Permohonan Tidak Ditemukan
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                                Mohon periksa kembali ID Permohonan dan Alamat Email yang Anda masukkan di atas.
                            </p>
                        </div>
                    )
                )}
            </main>
        </div>
    );
}
