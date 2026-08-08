import MainLayout from "../layout";
import { Head, Link, router } from "@inertiajs/react";
import { Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { PaginatedTable } from "@/components/backend/paginated-table";
import { Pagination } from "@/components/backend/pagination";
import { Button } from "@/components/ui/button";

type StaffUser = { id: number; name: string; email: string };

type StaffItem = {
    id: number;
    position: string;
    department: string;
    phone: string | null;
    joined_at: string;
    is_active: boolean;
    user: StaffUser;
};

type PaginatedStaff = {
    data: StaffItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    staff: PaginatedStaff;
    filters?: { search?: string };
    flash?: { success?: string };
};

export default function StaffIndex({ staff, filters, flash }: Props) {
    const [search, setSearch] = useState(filters?.search ?? "");

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return staff.data;

        return staff.data.filter(
            (item) =>
                item.user?.name.toLowerCase().includes(query) ||
                item.user?.email.toLowerCase().includes(query) ||
                item.position.toLowerCase().includes(query) ||
                item.department.toLowerCase().includes(query) ||
                item.phone?.toLowerCase().includes(query)
        );
    }, [staff.data, search]);

    const handleDelete = (item: StaffItem) => {
        if (!window.confirm(`Hapus staff ${item.user?.name ?? "ini"}?`)) return;
        router.delete(`/staff/${item.id}`);
    };

    const baseNumber = staff.from ?? 0;

    return (
        <MainLayout pageTitle="Master Staff">
            <Head title="Master Staff" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                        <UserRound className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">Master Staff</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Kelola data staff beserta jabatan dan departemennya.</p>
                    </div>
                </div>
                <Link href="/staff/create">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/20 gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah Staff
                    </Button>
                </Link>
            </div>

            {flash?.success && (
                <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm font-medium animate-in slide-in-from-top-2 duration-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    {flash.success}
                </div>
            )}

            <PaginatedTable
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari nama, jabatan, departemen..."
                summary={
                    <>
                        Menampilkan <span className="font-semibold text-slate-600">{staff.from ?? 0}-{staff.to ?? 0}</span> dari <span className="font-semibold text-slate-600">{staff.total}</span> staff
                    </>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">#</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Nama</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Jabatan</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Departemen</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Aksi</th>
                    </tr>
                }
                isEmpty={filtered.length === 0}
                emptyState={
                    <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400">
                            <Search className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            <p className="font-medium">Belum ada staff.</p>
                            <p className="text-xs mt-1">Klik Tambah Staff untuk mendaftarkan staff baru.</p>
                        </td>
                    </tr>
                }
                pagination={
                    staff.last_page > 1 ? (
                        <Pagination
                            links={staff.links}
                            currentPage={staff.current_page}
                            lastPage={staff.last_page}
                            onNavigate={(url) => router.get(url)}
                        />
                    ) : null
                }
            >
                {filtered.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{baseNumber + index}</td>
                        <td className="px-5 py-4">
                            <p className="text-slate-700 font-semibold">{item.user?.name ?? "-"}</p>
                            <p className="text-xs text-slate-400">{item.user?.email ?? ""}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{item.position}</td>
                        <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                                {item.department}
                            </span>
                        </td>
                        <td className="px-5 py-4">
                            <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                                    item.is_active
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-100 text-slate-500"
                                }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                                {item.is_active ? "Aktif" : "Nonaktif"}
                            </span>
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                                <Link href={`/staff/${item.id}/edit`}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
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