import MainLayout from '../../layout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Paperclip, Pencil, Search, Trash2, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

import { PaginatedTable } from '@/components/backend/paginated-table';
import { Pagination } from '@/components/backend/pagination';
import { Button } from '@/components/ui/button';

type Submission = {
    id: number;
    nama_pemohon: string;
    instansi: string;
    email: string;
    pelaksanaan: 'Luring' | 'Daring' | 'Hybrid';
    status: 'draft' | 'dikirim' | 'selesai';
    created_at: string;
    dokumen?: { id: number }[];
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

const statusClass: Record<Submission['status'], string> = {
    draft: 'bg-amber-50 text-amber-700',
    dikirim: 'bg-blue-50 text-blue-700',
    selesai: 'bg-emerald-50 text-emerald-700',
};

export default function PermohonanKonsultasiIndex({
    submissions,
    filters,
    success,
}: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return submissions.data;
        }

        return submissions.data.filter(
            (item) =>
                item.nama_pemohon.toLowerCase().includes(query) ||
                item.instansi.toLowerCase().includes(query) ||
                item.email.toLowerCase().includes(query) ||
                item.status.toLowerCase().includes(query),
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
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
                    <UserRound className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl leading-none font-bold text-slate-900">
                        Master Permohonan Konsultasi
                    </h1>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Data permohonan yang sudah dikirim dari form publik.
                    </p>
                </div>
            </div>

            {success && (
                <div className="mb-4 flex animate-in items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 duration-300 slide-in-from-top-2">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    {success}
                </div>
            )}

            <PaginatedTable
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari nama pemohon, instansi, email, status..."
                summary={
                    <>
                        Menampilkan{' '}
                        <span className="font-semibold text-slate-600">
                            {submissions.from ?? 0}-{submissions.to ?? 0}
                        </span>{' '}
                        dari{' '}
                        <span className="font-semibold text-slate-600">
                            {submissions.total}
                        </span>{' '}
                        permohonan
                    </>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            #
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Pemohon
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Instansi
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Pelaksanaan
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Tanggal Permohonan
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Status
                        </th>
                        <th className="px-5 py-3 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            File
                        </th>
                        <th className="px-5 py-3 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Aksi
                        </th>
                    </tr>
                }
                isEmpty={filtered.length === 0}
                emptyState={
                    <tr>
                        <td
                            colSpan={7}
                            className="py-16 text-center text-slate-400"
                        >
                            <Search className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                            <p className="font-medium">
                                Belum ada data permohonan.
                            </p>
                            <p className="mt-1 text-xs">
                                Data akan muncul setelah user submit form
                                konsultasi.
                            </p>
                        </td>
                    </tr>
                }
                pagination={
                    submissions.last_page > 1 ? (
                        <Pagination
                            links={submissions.links}
                            currentPage={submissions.current_page}
                            lastPage={submissions.last_page}
                            onNavigate={(url) => router.get(url)}
                        />
                    ) : null
                }
            >
                {filtered.map((item, index) => (
                    <tr
                        key={item.id}
                        className="group transition-colors hover:bg-slate-50/70"
                    >
                        <td className="px-5 py-4 font-mono text-xs text-slate-400">
                            {baseNumber + index}
                        </td>
                        <td className="px-5 py-4">
                            <div>
                                <p className="font-semibold text-slate-800">
                                    {item.nama_pemohon}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {item.email}
                                </p>
                            </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                            {item.instansi}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                            <p className="text-xs font-bold text-slate-900">
                                {item.jadwal.pelaksanaan}
                            </p>
                            {item.child_schedules.waktu}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                            {new Date(item.created_at).toLocaleDateString(
                                'id-ID',
                                {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                },
                            )}
                        </td>
                        <td className="px-5 py-4">
                            <span
                                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${statusClass[item.status]}`}
                            >
                                {item.status}
                            </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                            {item.dokumen && item.dokumen.length > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                                    <Paperclip className="h-3 w-3" />
                                    {item.dokumen.length}
                                </span>
                            ) : (
                                <span className="text-xs text-slate-300">—</span>
                            )}
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                                <Link
                                    href={`/master/permohonan-konsultasi/${item.id}`}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:bg-cyan-50 hover:text-cyan-600"
                                        title="Detail"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                                    title="Hapus"
                                    onClick={() => handleDelete(item)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </PaginatedTable>
        </MainLayout>
    );
}
