import MainLayout from "../../layout";
import { Head, Link, router } from "@inertiajs/react";
import { CalendarClock, MapPin, Pencil, Plus, Search, Trash2, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";

import { PaginatedTable } from "@/components/backend/paginated-table";
import { Pagination } from "@/components/backend/pagination";
import { Button } from "@/components/ui/button";

type Schedule = {
    id: number;
    tanggal: string;
    waktu_awal: string;
    waktu_akhir: string;
    pelaksanaan: "Luring" | "Daring" | "Hybrid";
    lokasi?: {
        id: number;
        nama_lokasi: string;
    } | null;
    kuota_konsultasi: number;
    created_at: string;
};

type PaginatedSchedules = {
    data: Schedule[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    schedules: PaginatedSchedules;
    filters?: {
        search?: string;
    };
    success?: string;
};

export default function JadwalKonsultasiIndex({ schedules, filters, success }: Props) {
    const [search, setSearch] = useState(filters?.search ?? "");

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return schedules.data;
        }

        return schedules.data.filter(item =>
            item.tanggal.toLowerCase().includes(query) ||
            item.pelaksanaan.toLowerCase().includes(query) ||
            item.waktu_awal.toLowerCase().includes(query) ||
            item.waktu_akhir.toLowerCase().includes(query) ||
            (item.lokasi?.nama_lokasi ?? "").toLowerCase().includes(query)
        );
    }, [schedules.data, search]);

    const handleDelete = (item: Schedule) => {
        if (!window.confirm(`Hapus jadwal ${item.tanggal} ${item.waktu_awal}-${item.waktu_akhir}?`)) {
            return;
        }

        router.delete(`/master/jadwal-konsultasi/${item.id}`);
    };

    const baseNumber = schedules.from ?? 0;

    return (
        <MainLayout pageTitle="Master Jadwal Konsultasi">
            <Head title="Master Jadwal Konsultasi" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                        <CalendarClock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">Master Jadwal Konsultasi</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Kelola jadwal pendaftaran konsultasi beserta kuota.</p>
                    </div>
                </div>
                <Link href="/master/jadwal-konsultasi/create">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/20 gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah Jadwal
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
                searchPlaceholder="Cari tanggal atau waktu jadwal..."
                summary={
                    <>
                        Menampilkan <span className="font-semibold text-slate-600">{schedules.from ?? 0}-{schedules.to ?? 0}</span> dari <span className="font-semibold text-slate-600">{schedules.total}</span> jadwal
                    </>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">#</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Waktu</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Pelaksanaan</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Lokasi</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Kuota</th>
                        <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Aksi</th>
                    </tr>
                }
                isEmpty={filtered.length === 0}
                emptyState={
                    <tr>
                        <td colSpan={7} className="text-center py-16 text-slate-400">
                            <Search className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            <p className="font-medium">Belum ada jadwal konsultasi.</p>
                            <p className="text-xs mt-1">Klik Tambah Jadwal untuk membuat slot pendaftaran.</p>
                        </td>
                    </tr>
                }
                pagination={
                    schedules.last_page > 1 ? (
                        <Pagination
                            links={schedules.links}
                            currentPage={schedules.current_page}
                            lastPage={schedules.last_page}
                            onNavigate={url => router.get(url)}
                        />
                    ) : null
                }
            >
                {filtered.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{baseNumber + index}</td>
                        <td className="px-5 py-4 text-slate-700 font-semibold">
                            {new Date(item.tanggal).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })}
                        </td>
                        <td className="px-5 py-4 text-slate-600 text-sm">
                            {item.waktu_awal.slice(0, 5)} - {item.waktu_akhir.slice(0, 5)}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                            {item.pelaksanaan}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                            {item.lokasi?.nama_lokasi ?? "-"}
                        </td>
                        <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                                <UsersRound className="w-3 h-3" />
                                {item.kuota_konsultasi}
                            </span>
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                                <Link href={`/master/jadwal-konsultasi/${item.id}/edit`}>
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
