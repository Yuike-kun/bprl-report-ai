import MainLayout from "../layout";
import { Head, Link, router } from "@inertiajs/react";
import { Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { PaginatedTable } from "@/components/backend/paginated-table";
import { Pagination } from "@/components/backend/pagination";
import { Button } from "@/components/ui/button";

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
};

type PaginatedUsers = {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    users: PaginatedUsers;
    filters?: {
        search?: string;
    };
    success?: string;
};

export default function UsersIndex({ users, filters, success }: Props) {
    const [search, setSearch] = useState(filters?.search ?? "");

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return users.data;
        }

        return users.data.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.email.toLowerCase().includes(query) ||
            item.role.toLowerCase().includes(query)
        );
    }, [users.data, search]);

    const handleDelete = (item: User) => {
        if (!window.confirm(`Hapus user ${item.name}?`)) {
            return;
        }

        router.delete(`/users/${item.id}`);
    };

    const baseNumber = users.from ?? 0;

    return (
        <MainLayout pageTitle="Master Users">
            <Head title="Master Users" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                        <UserRound className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">Master Users</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Kelola akun pengguna beserta perannya.</p>
                    </div>
                </div>
                <Link href="/users/create">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/20 gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah User
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
                searchPlaceholder="Cari nama, email, atau role..."
                summary={
                    <>
                        Menampilkan <span className="font-semibold text-slate-600">{users.from ?? 0}-{users.to ?? 0}</span> dari <span className="font-semibold text-slate-600">{users.total}</span> user
                    </>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">#</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Nama</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Email</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Role</th>
                        <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Aksi</th>
                    </tr>
                }
                isEmpty={filtered.length === 0}
                emptyState={
                    <tr>
                        <td colSpan={5} className="text-center py-16 text-slate-400">
                            <Search className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            <p className="font-medium">Belum ada user.</p>
                            <p className="text-xs mt-1">Klik Tambah User untuk membuat akun baru.</p>
                        </td>
                    </tr>
                }
                pagination={
                    users.last_page > 1 ? (
                        <Pagination
                            links={users.links}
                            currentPage={users.current_page}
                            lastPage={users.last_page}
                            onNavigate={url => router.get(url)}
                        />
                    ) : null
                }
            >
                {filtered.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{baseNumber + index}</td>
                        <td className="px-5 py-4 text-slate-700 font-semibold">{item.name}</td>
                        <td className="px-5 py-4 text-sm text-slate-600">{item.email}</td>
                        <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                                {item.role}
                            </span>
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                                <Link href={`/users/${item.id}/edit`}>
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