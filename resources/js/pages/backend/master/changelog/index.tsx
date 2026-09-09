import MainLayout from "../../layout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { History, Pencil, Plus, Search, Trash2, Sparkles, Bug, Wrench, Download, Upload, FileText, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { PaginatedTable } from "@/components/backend/paginated-table";
import { Pagination } from "@/components/backend/pagination";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type ChangelogItem = {
    id: number;
    version: string;
    title: string;
    description: string;
    type: "feature" | "bugfix" | "improvement";
    release_date: string;
    created_at: string;
};

type PaginatedChangelogs = {
    data: ChangelogItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    changelogs: PaginatedChangelogs;
    filters?: {
        search?: string;
        type?: string;
    };
    success?: string;
    errors?: Record<string, string>;
};

export default function ChangelogIndex({ changelogs, filters, success, errors }: Props) {
    const [search, setSearch] = useState(filters?.search ?? "");
    const [selectedType, setSelectedType] = useState(filters?.type ?? "");
    const [isImportOpen, setIsImportOpen] = useState(false);

    const { data, setData, post, processing, errors: formErrors, reset } = useForm<{
        file: File | null;
    }>({
        file: null,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters?.search ?? "") || selectedType !== (filters?.type ?? "")) {
                router.get(
                    "/master/changelog",
                    {
                        search: search || undefined,
                        type: selectedType || undefined,
                    },
                    {
                        preserveState: true,
                        replace: true,
                    }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, selectedType]);

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) return;

        post("/master/changelog/import", {
            onSuccess: () => {
                setIsImportOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (item: ChangelogItem) => {
        if (!window.confirm(`Hapus changelog v${item.version} - "${item.title}"?`)) {
            return;
        }

        router.delete(`/master/changelog/${item.id}`);
    };

    const getTypeBadge = (type: ChangelogItem["type"]) => {
        switch (type) {
            case "feature":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Sparkles className="w-3 h-3 text-emerald-600" /> Fitur Baru
                    </span>
                );
            case "bugfix":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                        <Bug className="w-3 h-3 text-rose-600" /> Perbaikan Bug
                    </span>
                );
            case "improvement":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        <Wrench className="w-3 h-3 text-amber-600" /> Peningkatan
                    </span>
                );
        }
    };

    const baseNumber = changelogs.from ?? 0;

    return (
        <MainLayout pageTitle="Master Changelog">
            <Head title="Master Changelog" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                        <History className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">Master Changelog</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Kelola riwayat perubahan & pembaruan versi sistem.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsImportOpen(true)}
                        className="rounded-xl border-slate-200 gap-2 hover:bg-slate-50"
                    >
                        <Upload className="w-4 h-4 text-slate-600" />
                        Import MD
                    </Button>
                    <Link href="/master/changelog/create">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 gap-2">
                            <Plus className="w-4 h-4" />
                            Tambah Changelog
                        </Button>
                    </Link>
                </div>
            </div>

            {success && (
                <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm font-medium animate-in slide-in-from-top-2 duration-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    {success}
                </div>
            )}

            <PaginatedTable
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari versi, judul, atau deskripsi..."
                summary={
                    <>
                        Menampilkan <span className="font-semibold text-slate-600">{changelogs.from ?? 0}-{changelogs.to ?? 0}</span> dari <span className="font-semibold text-slate-600">{changelogs.total}</span> changelog
                    </>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">#</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Versi</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Judul & Deskripsi</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Tipe</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Tgl Rilis</th>
                        <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Aksi</th>
                    </tr>
                }
                isEmpty={changelogs.data.length === 0}
                emptyState={
                    <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400">
                            <Search className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            <p className="font-medium">Belum ada data changelog.</p>
                            <p className="text-xs mt-1">Klik "Tambah Changelog" atau "Import MD" untuk menambahkan versi baru.</p>
                        </td>
                    </tr>
                }
                pagination={
                    changelogs.last_page > 1 ? (
                        <Pagination
                            links={changelogs.links}
                            currentPage={changelogs.current_page}
                            lastPage={changelogs.last_page}
                            onNavigate={(url) => router.get(url)}
                        />
                    ) : null
                }
            >
                {changelogs.data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{baseNumber + index}</td>
                        <td className="px-5 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                v{item.version}
                            </span>
                        </td>
                        <td className="px-5 py-4 max-w-md">
                            <p className="font-semibold text-slate-800">{item.title}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                        </td>
                        <td className="px-5 py-4">{getTypeBadge(item.type)}</td>
                        <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {new Date(item.release_date).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })}
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                                <Link href={`/master/changelog/${item.id}/edit`}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                        title="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    title="Hapus"
                                    onClick={() => handleDelete(item)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </PaginatedTable>

            {/* Import Dialog Modal */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-900">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Import Changelog (.md)
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Unggah file Markdown (.md) untuk mengimpor catatan riwayat perubahan secara otomatis.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleImportSubmit} className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                            <div>
                                <p className="font-semibold text-slate-800">Format Template Markdown</p>
                                <p className="text-slate-500">Unduh contoh format file .md yang didukung</p>
                            </div>
                            <a
                                href="/master/changelog/download-template"
                                download
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors shadow-xs"
                            >
                                <Download className="w-3.5 h-3.5 text-indigo-600" />
                                Unduh Template
                            </a>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Pilih File .md
                            </label>
                            <input
                                type="file"
                                accept=".md,.markdown,.txt"
                                onChange={(e) => setData("file", e.target.files?.[0] ?? null)}
                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-xl cursor-pointer"
                            />
                            {(formErrors.file || errors?.file) && (
                                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {formErrors.file || errors?.file}
                                </p>
                            )}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsImportOpen(false);
                                    reset();
                                }}
                                className="rounded-xl border-slate-200"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || !data.file}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                {processing ? "Mengunggah..." : "Import Data"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}

