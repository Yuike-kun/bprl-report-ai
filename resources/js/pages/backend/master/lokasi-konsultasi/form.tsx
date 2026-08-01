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

type Props = {
    mode: "create" | "edit";
    location?: Location;
};

export default function LokasiKonsultasiForm({ mode, location }: Props) {
    const isEdit = mode === "edit";

    const { data, setData, post, put, processing, errors } = useForm({
        nama_lokasi: location?.nama_lokasi ?? "",
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (isEdit && location) {
            put(`/master/lokasi-konsultasi/${location.id}`);
            return;
        }

        post("/master/lokasi-konsultasi");
    };

    return (
        <MainLayout pageTitle="Master Lokasi Konsultasi">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link
                        href="/master/lokasi-konsultasi"
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke daftar lokasi
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="h-2 w-full bg-linear-to-r from-indigo-500 to-sky-500" />

                    <div className="px-6 md:px-8 py-7 border-b border-slate-100">
                        <h1 className="text-xl font-bold text-slate-900">
                            {isEdit ? "Ubah Lokasi Konsultasi" : "Tambah Lokasi Konsultasi"}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {isEdit
                                ? "Perbarui nama lokasi untuk digunakan pada form permohonan konsultasi."
                                : "Tambah lokasi baru yang akan tersedia di form permohonan konsultasi."}
                        </p>
                    </div>

                    <form onSubmit={submit} className="px-6 md:px-8 py-7 space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="nama_lokasi" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                Nama Lokasi
                            </Label>
                            <Input
                                id="nama_lokasi"
                                value={data.nama_lokasi}
                                onChange={e => setData("nama_lokasi", e.target.value)}
                                placeholder="Contoh: Ruang Rapat Utama BPRL"
                                className="h-11"
                            />
                            {errors.nama_lokasi && (
                                <p className="text-sm text-red-500">{errors.nama_lokasi}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Link href="/master/lokasi-konsultasi">
                                <Button type="button" variant="outline" className="rounded-xl">
                                    Batal
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Lokasi"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
