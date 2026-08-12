import MainLayout from "../../layout";
import { Head, Link, router } from "@inertiajs/react";
import { History, Pencil, Plus, Search, Trash2, Tag, Sparkles, Bug, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

import { PaginatedTable } from "@/components/backend/paginated-table";
import { Pagination } from "@/components/backend/pagination";
import { Button } from "@/components/ui/button";

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
};

export default function ChangelogIndex({ changelogs, filters, success }: Props) {
    const [search, setSearch] = useState(filters?.search ?? "");
    const [selectedType, setSelectedType] = useState(filters?.type ?? "");

    const filtered = useMemo(() => {
        return changelogs.data.filter((item) => {
            const matchesSearch = !search.trim() || 
                item.version.toLowerCase().includes(search.toLowerCase()) ||
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase());
            
            const matchesType = !selectedType || item.type === selectedType;

            return matchesSearch && matchesType;
        });
    }, [changelogs.data, search, selectedType]);

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
                <Link href="/master/changelog/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah Changelog
                    </Button>
                </Link>
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
                isEmpty={filtered.length === 0}
                emptyState={
                    <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400">
                            <Search className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            <p className="font-medium">Belum ada data changelog.</p>
                            <p className="text-xs mt-1">Klik "Tambah Changelog" untuk menambahkan versi baru.</p>
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
                {filtered.map((item, index) => (
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
        </MainLayout>
    );
}
