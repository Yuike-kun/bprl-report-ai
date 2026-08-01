import MainLayout from "../../layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Location = {
    id: number;
    nama_lokasi: string;
};

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
};

type Props = {
    submission: Submission;
    locations: Location[];
};

export default function PermohonanKonsultasiEdit({ submission, locations }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nama_pemohon: submission.nama_pemohon,
        jabatan_pemohon: submission.jabatan_pemohon,
        instansi: submission.instansi,
        tanggal_konsultasi: submission.tanggal_konsultasi,
        waktu_konsultasi: submission.waktu_konsultasi,
        pelaksanaan: submission.pelaksanaan,
        lokasi_konsultasi_id: submission.lokasi_konsultasi_id ? String(submission.lokasi_konsultasi_id) : "",
        rencana_kegiatan: submission.rencana_kegiatan,
        kabupaten: submission.kabupaten,
        provinsi: submission.provinsi,
        nomor_telepon: submission.nomor_telepon,
        email: submission.email,
        permintaan_khusus: submission.permintaan_khusus ?? "",
        setuju_syarat_ketentuan: submission.setuju_syarat_ketentuan,
        status: submission.status,
    });

    const needsLocation = data.pelaksanaan === "Luring" || data.pelaksanaan === "Hybrid";

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        put(`/master/permohonan-konsultasi/${submission.id}`);
    };

    return (
        <MainLayout pageTitle="Edit Permohonan Konsultasi">
            <Head title="Edit Permohonan Konsultasi" />

            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <Link href={`/master/permohonan-konsultasi/${submission.id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke detail
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="h-2 w-full bg-linear-to-r from-indigo-500 to-cyan-500" />

                    <div className="px-6 md:px-8 py-7 border-b border-slate-100">
                        <h1 className="text-xl font-bold text-slate-900">Edit Permohonan Konsultasi</h1>
                        <p className="text-sm text-slate-500 mt-1">Perbarui data permohonan sesuai hasil verifikasi admin.</p>
                    </div>

                    <form onSubmit={submit} className="px-6 md:px-8 py-7 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="nama_pemohon">Nama Pemohon</Label>
                                <Input id="nama_pemohon" value={data.nama_pemohon} onChange={e => setData("nama_pemohon", e.target.value)} />
                                {errors.nama_pemohon && <p className="text-sm text-red-500">{errors.nama_pemohon}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jabatan_pemohon">Jabatan Pemohon</Label>
                                <Input id="jabatan_pemohon" value={data.jabatan_pemohon} onChange={e => setData("jabatan_pemohon", e.target.value)} />
                                {errors.jabatan_pemohon && <p className="text-sm text-red-500">{errors.jabatan_pemohon}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="instansi">Instansi / Perusahaan</Label>
                            <Input id="instansi" value={data.instansi} onChange={e => setData("instansi", e.target.value)} />
                            {errors.instansi && <p className="text-sm text-red-500">{errors.instansi}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="tanggal_konsultasi">Tanggal Konsultasi</Label>
                                <Input id="tanggal_konsultasi" type="date" value={data.tanggal_konsultasi} onChange={e => setData("tanggal_konsultasi", e.target.value)} />
                                {errors.tanggal_konsultasi && <p className="text-sm text-red-500">{errors.tanggal_konsultasi}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="waktu_konsultasi">Waktu Konsultasi</Label>
                                <Input id="waktu_konsultasi" type="time" value={data.waktu_konsultasi} onChange={e => setData("waktu_konsultasi", e.target.value)} />
                                {errors.waktu_konsultasi && <p className="text-sm text-red-500">{errors.waktu_konsultasi}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select id="status" value={data.status} onChange={e => setData("status", e.target.value as Submission["status"])} className="h-8 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30">
                                    <option value="draft">draft</option>
                                    <option value="dikirim">dikirim</option>
                                    <option value="selesai">selesai</option>
                                </select>
                                {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="pelaksanaan">Pelaksanaan</Label>
                                <select id="pelaksanaan" value={data.pelaksanaan} onChange={e => setData("pelaksanaan", e.target.value as Submission["pelaksanaan"])} className="h-8 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30">
                                    <option value="Daring">Daring</option>
                                    <option value="Luring">Luring</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                                {errors.pelaksanaan && <p className="text-sm text-red-500">{errors.pelaksanaan}</p>}
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="lokasi_konsultasi_id">Lokasi Konsultasi</Label>
                                <select
                                    id="lokasi_konsultasi_id"
                                    value={data.lokasi_konsultasi_id}
                                    onChange={e => setData("lokasi_konsultasi_id", e.target.value)}
                                    disabled={!needsLocation}
                                    className="h-8 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">{needsLocation ? "Pilih lokasi" : "Tidak diperlukan untuk daring"}</option>
                                    {locations.map(location => (
                                        <option key={location.id} value={location.id}>
                                            {location.nama_lokasi}
                                        </option>
                                    ))}
                                </select>
                                {errors.lokasi_konsultasi_id && <p className="text-sm text-red-500">{errors.lokasi_konsultasi_id}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="kabupaten">Kabupaten / Kota</Label>
                                <Input id="kabupaten" value={data.kabupaten} onChange={e => setData("kabupaten", e.target.value)} />
                                {errors.kabupaten && <p className="text-sm text-red-500">{errors.kabupaten}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="provinsi">Provinsi</Label>
                                <Input id="provinsi" value={data.provinsi} onChange={e => setData("provinsi", e.target.value)} />
                                {errors.provinsi && <p className="text-sm text-red-500">{errors.provinsi}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                                <Input id="nomor_telepon" value={data.nomor_telepon} onChange={e => setData("nomor_telepon", e.target.value)} />
                                {errors.nomor_telepon && <p className="text-sm text-red-500">{errors.nomor_telepon}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={data.email} onChange={e => setData("email", e.target.value)} />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rencana_kegiatan">Rencana Kegiatan</Label>
                            <Textarea id="rencana_kegiatan" value={data.rencana_kegiatan} onChange={e => setData("rencana_kegiatan", e.target.value)} className="min-h-28" />
                            {errors.rencana_kegiatan && <p className="text-sm text-red-500">{errors.rencana_kegiatan}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="permintaan_khusus">Permintaan Khusus</Label>
                            <Textarea id="permintaan_khusus" value={data.permintaan_khusus} onChange={e => setData("permintaan_khusus", e.target.value)} className="min-h-24" />
                            {errors.permintaan_khusus && <p className="text-sm text-red-500">{errors.permintaan_khusus}</p>}
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={data.setuju_syarat_ketentuan}
                                    onChange={e => setData("setuju_syarat_ketentuan", e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                />
                                Setuju syarat dan ketentuan
                            </label>
                            {errors.setuju_syarat_ketentuan && <p className="text-sm text-red-500 mt-2">{errors.setuju_syarat_ketentuan}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Link href={`/master/permohonan-konsultasi/${submission.id}`}>
                                <Button type="button" variant="outline" className="rounded-xl">Batal</Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                                <Save className="w-4 h-4" />
                                {processing ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
