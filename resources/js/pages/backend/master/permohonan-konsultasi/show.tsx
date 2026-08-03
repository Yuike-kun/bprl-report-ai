import MainLayout from "../../layout";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, CalendarDays, Clock3, Edit3, Mail, MapPin, Phone, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

type Submission = {
    id: number;
    nama_pemohon: string;
    jabatan_pemohon: string;
    instansi: string;
    tanggal_konsultasi: string;
    waktu_konsultasi: string;
    pelaksanaan: "Luring" | "Daring" | "Hybrid";
    lokasi_konsultasi_id: number | null;
    rencana_kegiatan: string;
    kabupaten: string;
    provinsi: string;
    nomor_telepon: string;
    email: string;
    permintaan_khusus: string | null;
    setuju_syarat_ketentuan: boolean;
    status: "draft" | "dikirim" | "selesai";
    created_at: string;
    lokasi?: {
        id: number;
        nama_lokasi: string;
    } | null;
    jadwal?: any[]
};

type Props = {
    submission: Submission;
};

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="text-sm text-slate-700">{value || "-"}</p>
        </div>
    );
}

export default function PermohonanKonsultasiShow({ submission }: Props) {
    const handleDelete = () => {
        if (!window.confirm(`Hapus permohonan dari ${submission.nama_pemohon}?`)) {
            return;
        }

        router.delete(`/master/permohonan-konsultasi/${submission.id}`);
    };

    return (
        <MainLayout pageTitle="Detail Permohonan Konsultasi">
            <Head title="Detail Permohonan Konsultasi" />

            <div className="max-w-4xl mx-auto space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Link href="/master/permohonan-konsultasi" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke daftar
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link href={`/master/permohonan-konsultasi/${submission.id}/edit`}>
                            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                                <Edit3 className="w-4 h-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="h-2 w-full bg-linear-to-r from-cyan-500 to-blue-600" />

                    <div className="px-6 md:px-8 py-6 border-b border-slate-100">
                        <h1 className="text-xl font-bold text-slate-900">{submission.nama_pemohon}</h1>
                        <p className="text-sm text-slate-500 mt-1">{submission.jabatan_pemohon} · {submission.instansi}</p>
                    </div>

                    <div className="px-6 md:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <DetailItem label="Email" value={submission.email} />
                        <DetailItem label="Nomor Telepon" value={submission.nomor_telepon} />
                        <DetailItem label="Tanggal Konsultasi" value={new Date(submission.jadwal.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} />
                        <DetailItem label="Waktu Konsultasi" value={`${submission.jadwal.waktu_awal} - ${submission.jadwal.waktu_akhir}`} />
                        <DetailItem label="Pelaksanaan" value={submission.jadwal.pelaksanaan} />
                        <DetailItem label="Lokasi" value={submission.jadwal?.lokasi?.nama_lokasi ?? "-"} />
                        <DetailItem label="Kabupaten/Kota" value={submission.kabupaten} />
                        <DetailItem label="Provinsi" value={submission.provinsi} />
                        <DetailItem label="Status" value={submission.status} />
                        <DetailItem label="Persetujuan S&K" value={submission.setuju_syarat_ketentuan ? "Setuju" : "Tidak"} />
                    </div>

                    <div className="px-6 md:px-8 pb-6 space-y-4">
                        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Rencana Kegiatan</p>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{submission.rencana_kegiatan}</p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Permintaan Khusus</p>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{submission.permintaan_khusus || "-"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
