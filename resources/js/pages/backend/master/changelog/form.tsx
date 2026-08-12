import MainLayout from "../../layout";
import { Link, useForm } from "@inertiajs/react";
import { ArrowLeft, History, Save, Tag, Calendar, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ChangelogItem = {
    id: number;
    version: string;
    title: string;
    description: string;
    type: "feature" | "bugfix" | "improvement";
    release_date: string;
};

type Props = {
    mode: "create" | "edit";
    changelog?: ChangelogItem;
};

export default function ChangelogForm({ mode, changelog }: Props) {
    const isEdit = mode === "edit";

    const { data, setData, post, put, processing, errors } = useForm({
        version: changelog?.version ?? "",
        title: changelog?.title ?? "",
        description: changelog?.description ?? "",
        type: changelog?.type ?? "feature",
        release_date: changelog?.release_date ? changelog.release_date.split("T")[0] : new Date().toISOString().split("T")[0],
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (isEdit && changelog) {
            put(`/master/changelog/${changelog.id}`);
            return;
        }

        post("/master/changelog");
    };

    return (
        <MainLayout pageTitle="Master Changelog">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link
                        href="/master/changelog"
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke daftar changelog
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="h-2 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-sky-500" />

                    <div className="px-6 md:px-8 py-7 border-b border-slate-100">
                        <h1 className="text-xl font-bold text-slate-900">
                            {isEdit ? "Ubah Changelog" : "Tambah Changelog"}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {isEdit
                                ? "Perbarui informasi riwayat versi dan fitur aplikasi."
                                : "Tambah catatan rilis baru untuk fitur, perbaikan, atau peningkatan sistem."}
                        </p>
                    </div>

                    <form onSubmit={submit} className="px-6 md:px-8 py-7 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="version" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-slate-400" />
                                    Versi Aplikasi
                                </Label>
                                <Input
                                    id="version"
                                    value={data.version}
                                    onChange={(e) => setData("version", e.target.value)}
                                    placeholder="Contoh: 1.2.0"
                                    className="h-11 font-mono"
                                />
                                {errors.version && <p className="text-sm text-red-500">{errors.version}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="release_date" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    Tanggal Rilis
                                </Label>
                                <Input
                                    id="release_date"
                                    type="date"
                                    value={data.release_date}
                                    onChange={(e) => setData("release_date", e.target.value)}
                                    className="h-11"
                                />
                                {errors.release_date && <p className="text-sm text-red-500">{errors.release_date}</p>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="type" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                <History className="w-4 h-4 text-slate-400" />
                                Tipe Perubahan
                            </Label>
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) => setData("type", e.target.value as any)}
                                className="w-full h-11 px-3 rounded-md border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="feature">Fitur Baru (Feature)</option>
                                <option value="bugfix">Perbaikan Bug (Bugfix)</option>
                                <option value="improvement">Peningkatan (Improvement)</option>
                            </select>
                            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="title" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                Judul Rilis
                            </Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData("title", e.target.value)}
                                placeholder="Contoh: Modul AI Generator Dokumen Terbaru"
                                className="h-11"
                            />
                            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="description" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                Rincian Deskripsi / Catatan Rilis
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData("description", e.target.value)}
                                placeholder="Jelaskan detail penambahan fitur atau perbaikan..."
                                rows={5}
                                className="resize-y"
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                            <Link href="/master/changelog">
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
                                {processing ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Changelog"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
