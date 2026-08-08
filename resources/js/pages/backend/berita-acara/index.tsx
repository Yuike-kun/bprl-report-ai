import { Link } from "@inertiajs/react";
import MainLayout from "@/pages/backend/layout";
import { Plus, Search, Eye, Pencil, Trash2, FileCheck2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useState } from "react";
import { router } from "@inertiajs/react";

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
    draft: { label: "Draft", color: "bg-slate-100 text-slate-600" },
    submitted: { label: "Dikirim", color: "bg-blue-100 text-blue-700" },
    under_review: { label: "Ditinjau", color: "bg-amber-100 text-amber-700" },
    approved: { label: "Disetujui", color: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Ditolak", color: "bg-red-100 text-red-700" },
};

const STAGE_BADGE: Record<string, { label: string; color: string }> = {
    konsultasi: { label: "Konsultasi", color: "bg-sky-100 text-sky-700" },
    asistensi: { label: "Asistensi", color: "bg-indigo-100 text-indigo-700" },
};

interface Row {
    id: number;
    status: string;
    consultation_stage: string;
    consultation_date: string;
    berita_acara_number: string;
    requester_name: string;
    staff_1_name: string;
}

interface Props {
    rows: { data: Row[]; current_page: number; last_page: number; per_page: number; total: number; links: any[] };
    filters: { search?: string; status?: string };
}

export default function BeritaAcaraIndex({ rows, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [status, setStatus] = useState(filters.status ?? "");

    const applyFilter = () => {
        router.get("/berita-acara", { search, status }, { preserveState: true, replace: true });
    };

    const handleDelete = (id: number) => {
        if (!confirm("Hapus data berita acara ini?")) return;
        router.delete(`/berita-acara/${id}`);
    };

    return (
        <MainLayout pageTitle="Berita Acara Konsultasi">
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900">Berita Acara Konsultasi KKPRL</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Manajemen data hasil asistensi &amp; konsultasi KKPRL BPRL Makassar</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 p-4 bg-white border border-slate-200 rounded-2xl">
                    <div className="flex-1 min-w-48 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applyFilter()}
                            placeholder="Cari nama pemohon atau nomor BA..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option value="">Semua Status</option>
                        {Object.entries(STATUS_BADGE).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                    <button onClick={applyFilter}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all">
                        Filter
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70">
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor BA</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Pemohon</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tahap</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Staf 1</th>
                                    <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16 text-slate-400">
                                            <FileCheck2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            <p className="font-semibold text-sm">Belum ada data berita acara</p>
                                        </td>
                                    </tr>
                                ) : rows.data.map((row, idx) => {
                                    const status_b = STATUS_BADGE[row.status] ?? { label: row.status, color: "bg-slate-100 text-slate-600" };
                                    const stage_b = STAGE_BADGE[row.consultation_stage] ?? { label: row.consultation_stage, color: "bg-slate-100 text-slate-600" };
                                    return (
                                        <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-5 py-3 text-xs text-slate-400 font-mono">
                                                {(rows.current_page - 1) * rows.per_page + idx + 1}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="text-xs font-mono text-slate-700">
                                                    {row.berita_acara_number || <span className="text-slate-300 italic">—</span>}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-slate-800">{row.requester_name}</td>
                                            <td className="px-5 py-3 text-xs text-slate-600">{row.consultation_date}</td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${stage_b.color}`}>
                                                    {stage_b.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${status_b.color}`}>
                                                    {status_b.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-slate-600">{row.staff_1_name ?? "—"}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <a href={`/berita-acara/${row.id}/pdf`} target="_blank" rel="noreferrer"
                                                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                                                        <FileText className="w-4 h-4" /> Unduh PDF
                                                    </a>
                                                    <Link href={`/berita-acara/${row.id}`}
                                                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <Link href={`/berita-acara/${row.id}/edit`}
                                                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button onClick={() => handleDelete(row.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {rows.last_page > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500">
                                Menampilkan {(rows.current_page - 1) * rows.per_page + 1}–{Math.min(rows.current_page * rows.per_page, rows.total)} dari {rows.total} data
                            </p>
                            <div className="flex gap-1">
                                {rows.links.map((link, i) => (
                                    <button key={i} disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all
                                            ${link.active ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-blue-50 disabled:opacity-40"}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
