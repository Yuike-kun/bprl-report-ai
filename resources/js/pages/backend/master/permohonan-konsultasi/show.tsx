import MainLayout from "../../layout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { ArrowLeft, CalendarDays, Clock3, Edit3, Mail, MapPin, Phone, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ComboboxSearch } from "@/components/backend/combobox-searchable";
import { ComboboxMultiSearch } from "@/components/backend/combobox-multi-searchable";
import { useEffect, useState } from "react";

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
    tanda_tangan?: string | null;
    status: "draft" | "dikirim" | "selesai";
    created_at: string;
    lokasi?: {
        id: number;
        nama_lokasi: string;
    } | null;
    jadwal?: any;
    staff: any[];
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
    const [selectedStaff, setSelectedStaff] = useState<any[]>([]);

    const { data, setData, post, errors, processing } = useForm({
        staff: [] as number[],
    });

    const handleStaffChange = (items: any[]) => {
        setSelectedStaff(items);
        setData("staff", items.map((item) => item.id));
    };

    useEffect(() => {
        if (submission.staff && selectedStaff.length === 0) {
            setSelectedStaff(submission.staff);
            setData("staff", submission.staff.map((s: any) => s.id));
        }
    }, [submission]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/master/permohonan-konsultasi/${submission.id}/kirim`);
    };

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
                        <Link href={`/berita-acara/create?konsultasi=${submission.id}`}>
                            <Button className="rounded-xl border border-cyan-600 text-cyan-600 hover:text-white gap-2 bg-transparent hover:bg-cyan-600">
                                <Edit3 className="w-4 h-4" />
                                Berita Acara
                            </Button>
                        </Link>
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

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-3">
                    <div className="h-2 w-full bg-linear-to-r from-pink-500 to-red-600" />
                    <div className="px-6 md:px-8 py-6 border-b border-slate-100">
                        <h1 className="text-xl font-bold text-slate-900">Penugasan</h1>
                        <p className="text-sm text-slate-500 mt-1">Staff yang mengerjakan permohonan konsultasi ini</p>
                    </div>

                    <div className="px-6 md:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70 col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Staff Yang Mengerjakan</p>
                            <ComboboxMultiSearch
                                value={selectedStaff}
                                onChange={handleStaffChange}
                                fetchUrl="/staff/json"
                                searchParam="search"
                                labelKey="name"
                                maxSelected={3}
                            />
                        </div>
                        <div className="flex justify-end col-span-2">
                            <Button className={"w-20 bg-red-600 hover:bg-red-700 text-white"} onClick={handleSubmit}>
                                Kirim
                            </Button>
                        </div>
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
                        <DetailItem label="Tanggal Konsultasi" value={new Date(submission.jadwal?.tanggal ?? submission.tanggal_konsultasi).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} />
                        <DetailItem label="Waktu Konsultasi" value={`${submission.jadwal?.waktu_awal ?? submission.waktu_konsultasi} - ${submission.jadwal?.waktu_akhir ?? ""}`} />
                        <DetailItem label="Pelaksanaan" value={submission.jadwal?.pelaksanaan ?? submission.pelaksanaan} />
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

                        {submission.tanda_tangan && (
                            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Tanda Tangan Pemohon</p>
                                <div className="inline-block bg-white rounded-lg border border-slate-200 p-2">
                                    <img src={submission.tanda_tangan} alt="Tanda Tangan Pemohon" className="max-h-32 object-contain" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
