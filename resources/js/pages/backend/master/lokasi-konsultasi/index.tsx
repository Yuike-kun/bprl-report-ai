import MainLayout from "../../layout";
import { Head, Link, router } from "@inertiajs/react";
import { Building2, MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { PaginatedTable } from "@/components/backend/paginated-table";
import { Pagination } from "@/components/backend/pagination";
import { Button } from "@/components/ui/button";

type Location = {
    id: number;
    nama_lokasi: string;
    created_at: string;
};

type PaginatedLocations = {
    data: Location[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    locations: PaginatedLocations;
    filters?: {
        search?: string;
    };
    success?: string;
};

export default function LokasiKonsultasiIndex({ locations, filters, success }: Props) {
    const [search, setSearch] = useState(filters?.search ?? "");

    const filtered = useMemo(() => {
        if (!search.trim()) {
            return locations.data;
        }

        const normalized = search.toLowerCase();
        return locations.data.filter(location =>
            location.nama_lokasi.toLowerCase().includes(normalized)
        );
    }, [locations.data, search]);

    const handleDelete = (location: Location) => {
        if (!window.confirm(`Hapus lokasi \"${location.nama_lokasi}\"?`)) {
            return;
        }

        router.delete(`/master/lokasi-konsultasi/${location.id}`);
    };

    const baseNumber = locations.from ?? 0;

    return (
        <MainLayout pageTitle="Master Lokasi Konsultasi">
            <Head title="Master Lokasi Konsultasi" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">Master Lokasi Konsultasi</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Kelola daftar lokasi konsultasi untuk form permohonan.</p>
                    </div>
                </div>
                <Link href="/master/lokasi-konsultasi/create">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah Lokasi
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
                searchPlaceholder="Cari nama lokasi..."
                summary={
                    <>
                        Menampilkan <span className="font-semibold text-slate-600">{locations.from ?? 0}-{locations.to ?? 0}</span> dari <span className="font-semibold text-slate-600">{locations.total}</span> lokasi
                    </>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">#</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Nama Lokasi</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Dibuat</th>
                        <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Aksi</th>
                    </tr>
                }
                isEmpty={filtered.length === 0}
                emptyState={
                    <tr>
                        <td colSpan={4} className="text-center py-16 text-slate-400">
                            <Search className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            <p className="font-medium">Belum ada data lokasi.</p>
                            <p className="text-xs mt-1">Klik "Tambah Lokasi" untuk menambahkan data baru.</p>
                        </td>
                    </tr>
                }
                pagination={
                    locations.last_page > 1 ? (
                        <Pagination
                            links={locations.links}
                            currentPage={locations.current_page}
                            lastPage={locations.last_page}
                            onNavigate={url => router.get(url)}
                        />
                    ) : null
                }
            >
                {filtered.map((location, index) => (
                    <tr key={location.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{baseNumber + index}</td>
                        <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4 text-blue-500" />
                                </div>
                                <p className="font-semibold text-slate-800">{location.nama_lokasi}</p>
                            </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                            {new Date(location.created_at).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                                <Link href={`/master/lokasi-konsultasi/${location.id}/edit`}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
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
                                    onClick={() => handleDelete(location)}
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
