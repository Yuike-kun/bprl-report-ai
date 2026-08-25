import MainLayout from '../../layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    Edit3,
    ExternalLink,
    File,
    FileImage,
    FileSpreadsheet,
    FileText,
    Mail,
    Paperclip,
    Trash2,
    UserRound,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComboboxMultiSearch } from '@/components/backend/combobox-multi-searchable';
import { useEffect, useState } from 'react';

type Submission = {
    id: number;
    nama_pemohon: string;
    jabatan_pemohon: string;
    instansi: string;
    tanggal_konsultasi: string;
    waktu_konsultasi: string;
    pelaksanaan: 'Luring' | 'Daring' | 'Hybrid';
    lokasi_konsultasi_id: number | null;
    rencana_kegiatan: string;
    kabupaten: string;
    provinsi: string;
    nomor_telepon: string;
    email: string;
    permintaan_khusus: string | null;
    setuju_syarat_ketentuan: boolean;
    tanda_tangan?: string | null;
    status: string;
    created_at: string;
    lokasi?: { id: number; nama_lokasi: string } | null;
    jadwal?: any;
    staff: any[];
    dokumen?: { id: number; file_name: string; file_url: string }[];
};

type Props = { submission: Submission };

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                {label}
            </p>
            <p className="text-sm text-slate-700">{value || '-'}</p>
        </div>
    );
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600' },
    konsultasi: { label: 'Konsultasi', color: 'bg-blue-100 text-blue-700' },
    confirmed: {
        label: 'Dikonfirmasi',
        color: 'bg-emerald-100 text-emerald-700',
    },
    not_confirmed: { label: 'Ditolak', color: 'bg-red-100 text-red-700' },
    berita_acara: {
        label: 'Berita Acara',
        color: 'bg-purple-100 text-purple-700',
    },
    selesai: { label: 'Selesai', color: 'bg-teal-100 text-teal-700' },
};

export default function PermohonanKonsultasiShow({ submission }: Props) {
    const { flash } = usePage<any>().props;
    const [selectedStaff, setSelectedStaff] = useState<any[]>([]);
    const [confirmModal, setConfirmModal] = useState<
        'confirm' | 'reject' | null
    >(null);

    const { data, setData, post, errors, processing } = useForm({
        staff: [] as number[],
    });

    const handleStaffChange = (items: any[]) => {
        setSelectedStaff(items);
        setData(
            'staff',
            items.map((item) => item.id),
        );
    };

    useEffect(() => {
        if (submission.staff && selectedStaff.length === 0) {
            setSelectedStaff(submission.staff);
            setData(
                'staff',
                submission.staff.map((s: any) => s.id),
            );
        }
    }, [submission]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/master/permohonan-konsultasi/${submission.id}/kirim`);
    };

    const handleDelete = () => {
        if (
            !window.confirm(`Hapus permohonan dari ${submission.nama_pemohon}?`)
        )
            return;
        router.delete(`/master/permohonan-konsultasi/${submission.id}`);
    };

    const handleConfirm = (confirmed: boolean) => {
        router.patch(
            `/master/permohonan-konsultasi/${submission.id}/confirm`,
            { confirmed },
            { onSuccess: () => setConfirmModal(null) },
        );
    };

    const status = STATUS_LABELS[submission.status] ?? {
        label: submission.status,
        color: 'bg-slate-100 text-slate-600',
    };

    return (
        <MainLayout pageTitle="Detail Permohonan Konsultasi">
            <Head title="Detail Permohonan Konsultasi" />

            {/* Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
                        {confirmModal === 'confirm' ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                                        <BadgeCheck className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">
                                            Konfirmasi Permohonan
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Tindakan ini akan mengirimkan email
                                            ke pemohon
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Apakah Anda yakin ingin{' '}
                                    <span className="font-semibold text-emerald-700">
                                        mengkonfirmasi
                                    </span>{' '}
                                    permohonan dari{' '}
                                    <span className="font-semibold">
                                        {submission.nama_pemohon}
                                    </span>
                                    ? Email konfirmasi beserta detail jadwal
                                    akan dikirimkan ke{' '}
                                    <span className="font-semibold text-blue-600">
                                        {submission.email}
                                    </span>
                                    .
                                </p>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={() => setConfirmModal(null)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                        onClick={() => handleConfirm(true)}
                                    >
                                        <BadgeCheck className="mr-1.5 h-4 w-4" />{' '}
                                        Ya, Konfirmasi & Kirim Email
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">
                                            Tolak Permohonan
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Tindakan ini akan mengirimkan email
                                            ke pemohon
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Apakah Anda yakin ingin{' '}
                                    <span className="font-semibold text-red-600">
                                        menolak
                                    </span>{' '}
                                    permohonan dari{' '}
                                    <span className="font-semibold">
                                        {submission.nama_pemohon}
                                    </span>
                                    ? Email penolakan akan dikirimkan ke{' '}
                                    <span className="font-semibold text-blue-600">
                                        {submission.email}
                                    </span>
                                    .
                                </p>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={() => setConfirmModal(null)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                                        onClick={() => handleConfirm(false)}
                                    >
                                        <XCircle className="mr-1.5 h-4 w-4" />{' '}
                                        Ya, Tolak & Kirim Email
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-4xl space-y-5">
                {/* Flash messages */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        <BadgeCheck className="h-4 w-4 shrink-0" />{' '}
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        <XCircle className="h-4 w-4 shrink-0" /> {flash.error}
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href="/master/permohonan-konsultasi"
                        className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke daftar
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Confirmation buttons */}
                        {!['confirmed', 'not_confirmed'].includes(
                            submission.status,
                        ) && (
                                <>
                                    <Button
                                        type="button"
                                        className="gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                        onClick={() => setConfirmModal('confirm')}
                                        disabled={
                                            submission.status === 'berita_acara'
                                        }
                                    >
                                        <BadgeCheck className="h-4 w-4" />{' '}
                                        Konfirmasi
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => setConfirmModal('reject')}
                                        disabled={
                                            submission.status === 'berita_acara'
                                        }
                                    >
                                        <XCircle className="h-4 w-4" /> Tolak
                                    </Button>
                                </>
                            )}
                        {submission.status === 'berita_acara' && (
                            <Link
                                href={`/berita-acara/create?konsultasi=${submission.id}`}
                            >
                                <Button
                                    className="gap-2 rounded-xl border border-cyan-600 bg-transparent text-cyan-600 hover:bg-cyan-600 hover:text-white"
                                    disabled={
                                        submission.status === 'berita_acara'
                                    }
                                >
                                    <Edit3 className="h-4 w-4" />
                                    Berita Acara
                                </Button>
                            </Link>
                        )}
                        <Link
                            href={`/master/permohonan-konsultasi/${submission.id}/edit`}
                        >
                            <Button className="gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                                <Edit3 className="h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                            onClick={handleDelete}
                            disabled={submission.status === "berita_acara"}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </Button>
                    </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.color}`}
                    >
                        {status.label}
                    </span>
                    <span className="text-xs text-slate-400">
                        · {submission.email}
                    </span>
                </div>

                {/* Staff Assignment */}
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-2 w-full bg-linear-to-r from-pink-500 to-red-600" />
                    <div className="border-b border-slate-100 px-6 py-6 md:px-8">
                        <h1 className="text-xl font-bold text-slate-900">
                            Penugasan
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Staff yang mengerjakan permohonan konsultasi ini
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 px-6 py-6 sm:grid-cols-2 md:px-8">
                        <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Staff Yang Mengerjakan
                            </p>
                            <ComboboxMultiSearch
                                value={selectedStaff}
                                onChange={handleStaffChange}
                                fetchUrl="/staff/json"
                                searchParam="search"
                                labelKey="name"
                                maxSelected={3}
                            />
                        </div>
                        <div className="col-span-2 flex justify-end">
                            <Button
                                className={
                                    'w-20 bg-red-600 text-white hover:bg-red-700'
                                }
                                onClick={handleSubmit}
                            >
                                Kirim
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Submission Details */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-2 w-full bg-linear-to-r from-cyan-500 to-blue-600" />

                    <div className="border-b border-slate-100 px-6 py-6 md:px-8">
                        <h1 className="text-xl font-bold text-slate-900">
                            {submission.nama_pemohon}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {submission.jabatan_pemohon} · {submission.instansi}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 px-6 py-6 sm:grid-cols-2 md:px-8">
                        <DetailItem label="Email" value={submission.email} />
                        <DetailItem
                            label="Nomor Telepon"
                            value={submission.nomor_telepon}
                        />
                        <DetailItem
                            label="Tanggal Konsultasi"
                            value={new Date(
                                submission.jadwal?.tanggal ??
                                submission.tanggal_konsultasi,
                            ).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            })}
                        />
                        <DetailItem
                            label="Waktu Konsultasi"
                            value={`${submission.jadwal?.waktu_awal ?? submission.waktu_konsultasi} - ${submission.jadwal?.waktu_akhir ?? ''}`}
                        />
                        <DetailItem
                            label="Pelaksanaan"
                            value={
                                submission.jadwal?.pelaksanaan ??
                                submission.pelaksanaan
                            }
                        />
                        <DetailItem
                            label="Lokasi"
                            value={
                                submission.jadwal?.lokasi?.nama_lokasi ?? '-'
                            }
                        />
                        <DetailItem
                            label="Kabupaten/Kota"
                            value={submission.kabupaten}
                        />
                        <DetailItem
                            label="Provinsi"
                            value={submission.provinsi}
                        />
                        <DetailItem label="Status" value={status.label} />
                        <DetailItem
                            label="Persetujuan S&K"
                            value={
                                submission.setuju_syarat_ketentuan
                                    ? 'Setuju'
                                    : 'Tidak'
                            }
                        />
                    </div>

                    <div className="space-y-4 px-6 pb-6 md:px-8">
                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Rencana Kegiatan
                            </p>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                                {submission.rencana_kegiatan}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                Permintaan Khusus
                            </p>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                                {submission.permintaan_khusus || '-'}
                            </p>
                        </div>

                        {submission.tanda_tangan && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                    Tanda Tangan Pemohon
                                </p>
                                <div className="inline-block rounded-lg border border-slate-200 bg-white p-2">
                                    <img
                                        src={submission.tanda_tangan}
                                        alt="Tanda Tangan Pemohon"
                                        className="max-h-32 object-contain"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Bahan Konsultasi */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <Paperclip className="h-4 w-4 text-slate-400" />
                                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                                    Bahan Konsultasi
                                </p>
                                {submission.dokumen && submission.dokumen.length > 0 && (
                                    <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                        {submission.dokumen.length} file
                                    </span>
                                )}
                            </div>

                            {submission.dokumen && submission.dokumen.length > 0 ? (
                                <ul className="space-y-2">
                                    {submission.dokumen.map((doc) => {
                                        const ext = doc.file_name.split('.').pop()?.toLowerCase() ?? '';
                                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                                        const isPdf = ext === 'pdf';
                                        const isSheet = ['xls', 'xlsx', 'csv'].includes(ext);
                                        const FileIcon = isImage
                                            ? FileImage
                                            : isSheet
                                                ? FileSpreadsheet
                                                : isPdf
                                                    ? FileText
                                                    : File;
                                        const iconColor = isImage
                                            ? 'text-violet-500'
                                            : isSheet
                                                ? 'text-emerald-500'
                                                : isPdf
                                                    ? 'text-red-500'
                                                    : 'text-slate-400';

                                        return (
                                            <li key={doc.id}>
                                                {isImage ? (
                                                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                                                        <img
                                                            src={doc.file_url}
                                                            alt={doc.file_name}
                                                            className="max-h-48 w-full object-contain p-2"
                                                        />
                                                        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
                                                            <span className="flex items-center gap-1.5 truncate text-xs font-medium text-slate-600">
                                                                <FileIcon className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />
                                                                {doc.file_name}
                                                            </span>
                                                            <a
                                                                href={doc.file_url}
                                                                download={doc.file_name}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="ml-2 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                                title="Unduh"
                                                            >
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                                                        <span className="flex items-center gap-2 truncate text-xs font-medium text-slate-700">
                                                            <FileIcon className={`h-4 w-4 shrink-0 ${iconColor}`} />
                                                            {doc.file_name}
                                                        </span>
                                                        <a
                                                            href={doc.file_url}
                                                            download={doc.file_name}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="ml-3 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                            title="Unduh / Buka"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-400">Tidak ada file yang diunggah.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
