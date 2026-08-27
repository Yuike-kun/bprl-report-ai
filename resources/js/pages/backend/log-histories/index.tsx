import MainLayout from "../layout";
import { Head, router } from "@inertiajs/react";
import { History, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { PaginatedTable } from "@/components/backend/paginated-table";
import { Pagination } from "@/components/backend/pagination";
import { Button } from "@/components/ui/button";

type LogItem = {
    id: number;
    user_id: number | null;
    username: string | null;
    ip_address: string | null;
    browser: string | null;
    activity: string;
    created_at: string;
};

type PaginatedLogs = {
    data: LogItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    logs: PaginatedLogs;
    filters?: {
        search?: string;
    };
    success?: string;
};

export default function LogHistoryIndex({ logs, filters, success }: Props) {
    const [search, setSearch] = useState(filters?.search ?? "");

    const filtered = useMemo(() => {
        return logs.data;
    }, [logs.data]);

    const handleClearLogs = () => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus semua riwayat aktivitas? Tindakan ini tidak dapat dibatalkan.")) {
            return;
        }

        router.delete("/log-histories/clear");
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get("/log-histories", { search }, { preserveState: true });
    };

    const baseNumber = logs.from ?? 0;

    return (
        <MainLayout pageTitle="Log Aktivitas User">
            <Head title="Log Aktivitas User" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
                        <History className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">Log Aktivitas</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Memantau riwayat aktivitas semua pengguna termasuk Admin.</p>
                    </div>
                </div>
            </div>

            {success && (
                <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm font-medium animate-in slide-in-from-top-2 duration-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    {success}
                </div>
            )}

            <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari berdasarkan username, IP, browser, atau aktivitas..."
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <Button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl">
                    Cari
                </Button>
            </form>

            <PaginatedTable
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari berdasarkan username, IP, browser, atau aktivitas..."
                hideSearchInput={true} // using custom search form above to handle server-side filtering
                summary={
                    <>
                        Menampilkan <span className="font-semibold text-slate-600">{logs.from ?? 0}-{logs.to ?? 0}</span> dari <span className="font-semibold text-slate-600">{logs.total}</span> log
                    </>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">#</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Pengguna</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">IP Address</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Browser / Device</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Aktivitas</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Waktu</th>
                    </tr>
                }
                isEmpty={filtered.length === 0}
                emptyState={
                    <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400">
                            <Search className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            <p className="font-medium">Belum ada riwayat aktivitas.</p>
                        </td>
                    </tr>
                }
                pagination={
                    logs.last_page > 1 ? (
                        <Pagination
                            links={logs.links}
                            currentPage={logs.current_page}
                            lastPage={logs.last_page}
                            onNavigate={(url) => router.get(url, { search }, { preserveState: true })}
                        />
                    ) : null
                }
            >
                {filtered.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{baseNumber + index}</td>
                        <td className="px-5 py-4 font-medium text-slate-800">{item.username ?? "Guest"}</td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-600">{item.ip_address ?? "-"}</td>
                        <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate" title={item.browser ?? ""}>
                            {item.browser ?? "-"}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-700 font-medium">
                            {item.activity}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                            {new Date(item.created_at).toLocaleString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit"
                            })}
                        </td>
                    </tr>
                ))}
            </PaginatedTable>
        </MainLayout>
    );
}
