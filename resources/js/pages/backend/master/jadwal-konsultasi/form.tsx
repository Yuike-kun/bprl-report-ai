import MainLayout from "../../layout";
import { Link, useForm } from "@inertiajs/react";
import { ArrowLeft, MapPin, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Location = {
    id: number;
    nama_lokasi: string;
};

type Schedule = {
    id: number;
    tanggal: string;
    waktu_awal: string;
    waktu_akhir: string;
    pelaksanaan: "Luring" | "Daring" | "Hybrid";
    lokasi_konsultasi_id: number | null;
    kuota_konsultasi: number;
};

type Props = {
    mode: "create" | "edit";
    schedule?: Schedule;
    locations: Location[];
};

export default function JadwalKonsultasiForm({ mode, schedule, locations }: Props) {
    const isEdit = mode === "edit";

    const { data, setData, post, put, processing, errors } = useForm({
        tanggal: schedule?.tanggal ?? "",
        waktu_awal: schedule?.waktu_awal?.slice(0, 5) ?? "",
        waktu_akhir: schedule?.waktu_akhir?.slice(0, 5) ?? "",
        pelaksanaan: schedule?.pelaksanaan ?? "Daring",
        lokasi_konsultasi_id: schedule?.lokasi_konsultasi_id ? String(schedule.lokasi_konsultasi_id) : "",
        kuota_konsultasi: schedule?.kuota_konsultasi ?? 1,
    });

    const needsLocation = data.pelaksanaan === "Luring" || data.pelaksanaan === "Hybrid";

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (isEdit && schedule) {
            put(`/master/jadwal-konsultasi/${schedule.id}`);
            return;
        }

        post("/master/jadwal-konsultasi");
    };

    return (
        <MainLayout pageTitle="Master Jadwal Konsultasi">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link
                        href="/master/jadwal-konsultasi"
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke daftar jadwal
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="h-2 w-full bg-linear-to-r from-emerald-500 to-cyan-500" />

                    <div className="px-6 md:px-8 py-7 border-b border-slate-100">
                        <h1 className="text-xl font-bold text-slate-900">
                            {isEdit ? "Ubah Jadwal Konsultasi" : "Tambah Jadwal Konsultasi"}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Atur slot jadwal pendaftaran dengan tanggal, rentang waktu, pelaksanaan, lokasi, dan kuota konsultasi.
                        </p>
                    </div>

                    <form onSubmit={submit} className="px-6 md:px-8 py-7 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="tanggal" className="text-slate-700 font-semibold text-sm">Tanggal</Label>
                                <Input
                                    id="tanggal"
                                    type="date"
                                    value={data.tanggal}
                                    onChange={e => setData("tanggal", e.target.value)}
                                    className="h-11"
                                />
                                {errors.tanggal && <p className="text-sm text-red-500">{errors.tanggal}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="waktu_awal" className="text-slate-700 font-semibold text-sm">Waktu Awal</Label>
                                <Input
                                    id="waktu_awal"
                                    type="time"
                                    value={data.waktu_awal}
                                    onChange={e => setData("waktu_awal", e.target.value)}
                                    className="h-11"
                                />
                                {errors.waktu_awal && <p className="text-sm text-red-500">{errors.waktu_awal}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="waktu_akhir" className="text-slate-700 font-semibold text-sm">Waktu Akhir</Label>
                                <Input
                                    id="waktu_akhir"
                                    type="time"
                                    value={data.waktu_akhir}
                                    onChange={e => setData("waktu_akhir", e.target.value)}
                                    className="h-11"
                                />
                                {errors.waktu_akhir && <p className="text-sm text-red-500">{errors.waktu_akhir}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="pelaksanaan" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    Pelaksanaan
                                </Label>
                                <select
                                    id="pelaksanaan"
                                    value={data.pelaksanaan}
                                    onChange={e => {
                                        setData("pelaksanaan", e.target.value as Schedule["pelaksanaan"]);
                                        if (e.target.value === "Daring") {
                                            setData("lokasi_konsultasi_id", "");
                                        }
                                    }}
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-emerald-200"
                                >
                                    <option value="Daring">Daring</option>
                                    <option value="Luring">Luring</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                                {errors.pelaksanaan && <p className="text-sm text-red-500">{errors.pelaksanaan}</p>}
                            </div>

                            <div className="space-y-3 sm:col-span-2">
                                <Label htmlFor="lokasi_konsultasi_id" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    Lokasi
                                </Label>
                                <select
                                    id="lokasi_konsultasi_id"
                                    value={data.lokasi_konsultasi_id}
                                    onChange={e => setData("lokasi_konsultasi_id", e.target.value)}
                                    disabled={!needsLocation}
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                                >
                                    <option value="">{needsLocation ? "Pilih lokasi" : "Tidak diperlukan untuk daring"}</option>
                                    {locations.map((location) => (
                                        <option key={location.id} value={location.id}>
                                            {location.nama_lokasi}
                                        </option>
                                    ))}
                                </select>
                                {errors.lokasi_konsultasi_id && <p className="text-sm text-red-500">{errors.lokasi_konsultasi_id}</p>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="kuota_konsultasi" className="text-slate-700 font-semibold text-sm">Kuota Konsultasi</Label>
                            <Input
                                id="kuota_konsultasi"
                                type="number"
                                min={1}
                                value={data.kuota_konsultasi}
                                onChange={e => setData("kuota_konsultasi", Number(e.target.value))}
                                className="h-11"
                            />
                            {errors.kuota_konsultasi && <p className="text-sm text-red-500">{errors.kuota_konsultasi}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Link href="/master/jadwal-konsultasi">
                                <Button type="button" variant="outline" className="rounded-xl">
                                    Batal
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Jadwal"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
