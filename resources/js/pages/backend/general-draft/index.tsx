import MainLayout from "../layout";
import { Head, Link, router } from "@inertiajs/react";
import {
    FileText,
    Plus,
    Trash2,
    Pencil,
    Building2,
    Calendar,
    Hash,
    Download,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PaginatedTable } from "@/components/backend/paginated-table";
import { Pagination } from "@/components/backend/pagination";

type Draft = {
    id: number;
    nama_perusahaan: string;
    nib: string;
    jenis_kegiatan: string;
    no_referensi: string;
    tanggal_penyusunan: string;
    email: string;
    created_at: string;
};

type PaginatedDrafts = {
    data: Draft[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    drafts: PaginatedDrafts;
    success?: string;
};

function DeleteModal({ draft, onClose, onConfirm }: { draft: Draft; onClose: () => void; onConfirm: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Hapus Draft?</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Tindakan ini akan menghapus draft <span className="font-semibold text-slate-800">{draft.nama_perusahaan}</span> beserta seluruh datanya secara permanen dan tidak dapat dibatalkan.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full pt-2">
                        <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
                            Batalkan
                        </Button>
                        <Button
                            className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            onClick={onConfirm}
                        >
                            Ya, Hapus
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function GeneralDraftIndex({ drafts, success }: Props) {
    const [search, setSearch] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<Draft | null>(null);

    const filtered = drafts.data.filter(d =>
        d.nama_perusahaan.toLowerCase().includes(search.toLowerCase()) ||
        d.no_referensi.toLowerCase().includes(search.toLowerCase()) ||
        d.jenis_kegiatan.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/general-draft/${deleteTarget.id}`, {
            onFinish: () => setDeleteTarget(null),
        });
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

    return (
        <MainLayout pageTitle="General Draft">
            <Head title="General Draft" />

            {deleteTarget && (
                <DeleteModal
                    draft={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                />
            )}

            {/* Page Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">General Draft</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Daftar seluruh permohonan draft yang tersimpan.</p>
                    </div>
                </div>
                <Link href="/general-draft/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 gap-2">
                        <Plus className="w-4 h-4" />
                        Buat Draft Baru
                    </Button>
                </Link>
            </div>

            {/* Success toast */}
            {success && (
                <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm font-medium animate-in slide-in-from-top-2 duration-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    {success}
                </div>
            )}

            {/* Table Card */}
            <PaginatedTable
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari nama perusahaan atau referensi..."
                summary={
                    <>
                        Menampilkan <span className="font-semibold text-slate-600">{drafts.from}–{drafts.to}</span> dari <span className="font-semibold text-slate-600">{drafts.total}</span> draft
                    </>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">#</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Perusahaan</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">No. Referensi</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Jenis Kegiatan</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                        <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Aksi</th>
                    </tr>
                }
                isEmpty={filtered.length === 0}
                emptyState={
                    <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400">
                            <FileText className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            <p className="font-medium">Belum ada data draft.</p>
                            <p className="text-xs mt-1">Klik "Buat Draft Baru" untuk memulai.</p>
                        </td>
                    </tr>
                }
                pagination={
                    drafts.last_page > 1 ? (
                        <Pagination
                            links={drafts.links}
                            currentPage={drafts.current_page}
                            lastPage={drafts.last_page}
                            onNavigate={url => router.get(url)}
                        />
                    ) : null
                }
            >
                {filtered.map((draft, idx) => (
                    <tr key={draft.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{drafts.from + idx}</td>
                        <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">{draft.nama_perusahaan}</p>
                                    <p className="text-xs text-slate-400">{draft.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg">
                                <Hash className="w-3 h-3" />
                                {draft.no_referensi}
                            </span>
                        </td>
                        <td className="px-5 py-4">
                            <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-lg max-w-45 truncate">
                                {draft.jenis_kegiatan}
                            </span>
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(draft.tanggal_penyusunan)}
                            </div>
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                                <Link href={`/general-draft/${draft.id}/edit`}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                        title="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <a
                                    href={`/pkkprl/download-proposal/${draft.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                        title="Unduh Laporan"
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </a>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    title="Hapus"
                                    onClick={() => setDeleteTarget(draft)}
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