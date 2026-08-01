import MainLayout from "../../layout";
import { Head, Link, router } from "@inertiajs/react";
import { Eye, Pencil, Search, Trash2, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { PaginatedTable } from "@/components/backend/paginated-table";
import { Pagination } from "@/components/backend/pagination";
import { Button } from "@/components/ui/button";

type Submission = {
    id: number;
    nama_pemohon: string;
    instansi: string;
    email: string;
    pelaksanaan: "Luring" | "Daring" | "Hybrid";
    status: "draft" | "dikirim" | "selesai";
    created_at: string;
};

type PaginatedSubmissions = {
    data: Submission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    submissions: PaginatedSubmissions;
    filters?: {
        search?: string;
    };
    success?: string;
};

const statusClass: Record<Submission["status"], string> = {
    draft: "bg-amber-50 text-amber-700",
    dikirim: "bg-blue-50 text-blue-700",
    selesai: "bg-emerald-50 text-emerald-700",
};

export default function PermohonanKonsultasiIndex({ submissions, filters, success }: Props) {
    const [search, setSearch] = useState(filters?.search ?? "");

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return submissions.data;
        }

        return submissions.data.filter(item =>
            item.nama_pemohon.toLowerCase().includes(query) ||
            item.instansi.toLowerCase().includes(query) ||
            item.email.toLowerCase().includes(query) ||
            item.status.toLowerCase().includes(query)
        );
    }, [submissions.data, search]);

    const handleDelete = (item: Submission) => {
        if (!window.confirm(`Hapus permohonan dari ${item.nama_pemohon}?`)) {
            return;
        }

        router.delete(`/master/permohonan-konsultasi/${item.id}`);
    };

    const baseNumber = submissions.from ?? 0;

    return (
        <MainLayout pageTitle="Master Permohonan Konsultasi">
            <Head title="Master Permohonan Konsultasi" />

            <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
                    <UserRound className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 leading-none">Master Permohonan Konsultasi</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Data permohonan yang sudah dikirim dari form publik.</p>
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
                searchPlaceholder="Cari nama pemohon, instansi, email, status..."
                summary={
                    <>
                        Menampilkan <span className="font-semibold text-slate-600">{submissions.from ?? 0}-{submissions.to ?? 0}</span> dari <span className="font-semibold text-slate-600">{submissions.total}</span> permohonan
                    </>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">#</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Pemohon</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Instansi</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Pelaksanaan</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Aksi</th>
                    </tr>
                }
                isEmpty={filtered.length === 0}
                emptyState={
                    <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400">
                            <Search className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            <p className="font-medium">Belum ada data permohonan.</p>
                            <p className="text-xs mt-1">Data akan muncul setelah user submit form konsultasi.</p>
                        </td>
                    </tr>
                }
                pagination={
                    submissions.last_page > 1 ? (
                        <Pagination
                            links={submissions.links}
                            currentPage={submissions.current_page}
                            lastPage={submissions.last_page}
                            onNavigate={url => router.get(url)}
                        />
                    ) : null
                }
            >
                {filtered.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{baseNumber + index}</td>
                        <td className="px-5 py-4">
                            <div>
                                <p className="font-semibold text-slate-800">{item.nama_pemohon}</p>
                                <p className="text-xs text-slate-400">{item.email}</p>
                            </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{item.instansi}</td>
                        <td className="px-5 py-4 text-sm text-slate-600">{item.pelaksanaan}</td>
                        <td className="px-5 py-4">
                            <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${statusClass[item.status]}`}>
                                {item.status}
                            </span>
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                                <Link href={`/master/permohonan-konsultasi/${item.id}`}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50"
                                        title="Detail"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <Link href={`/master/permohonan-konsultasi/${item.id}/edit`}>
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
