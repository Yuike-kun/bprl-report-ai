import MainLayout from '../../layout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, FileSpreadsheet, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { PaginatedTable } from '@/components/backend/paginated-table';
import { Pagination } from '@/components/backend/pagination';
import { Button } from '@/components/ui/button';
import Heading from '@/components/backend/heading';

type KkprlProposalItem = {
    id: number;
    applicant_name: string;
    company_name: string;
    email: string;
    phone_number: string;
    regency: string;
    province: string;
    water_name: string;
    area_size: string;
    status: 'dikirim' | 'diproses' | 'disetujui' | 'ditolak';
    is_reclamation: boolean;
    created_at: string;
};

type PaginatedProposals = {
    data: KkprlProposalItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    proposals: PaginatedProposals;
    filters?: {
        search?: string;
        status?: string;
    };
    success?: string;
};

const statusClass: Record<KkprlProposalItem['status'], string> = {
    dikirim: 'bg-blue-50 text-blue-700 border border-blue-200',
    diproses: 'bg-amber-50 text-amber-700 border border-amber-200',
    disetujui: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    ditolak: 'bg-red-50 text-red-700 border border-red-200',
};

export default function KkprlProposalMasterIndex({
    proposals,
    filters,
    success,
}: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return proposals.data.filter((item) => {
            const matchesQuery =
                !query ||
                item.applicant_name.toLowerCase().includes(query) ||
                item.company_name.toLowerCase().includes(query) ||
                item.email.toLowerCase().includes(query) ||
                item.regency.toLowerCase().includes(query) ||
                item.province.toLowerCase().includes(query);

            const matchesStatus = !statusFilter || item.status === statusFilter;

            return matchesQuery && matchesStatus;
        });
    }, [proposals.data, search, statusFilter]);

    const handleDelete = (item: KkprlProposalItem) => {
        if (
            !window.confirm(
                `Hapus proposal KKPRL dari ${item.applicant_name} (${item.company_name})?`,
            )
        ) {
            return;
        }

        router.delete(`/master/kkprl-proposal/${item.id}`);
    };

    const baseNumber = proposals.from ?? 0;

    return (
        <MainLayout pageTitle="Master Proposal KKPRL">
            <Heading
                icon={FileSpreadsheet}
                title="Master Proposal KKPRL"
                description="Daftar permohonan Persetujuan Kesesuaian Kegiatan Pemanfaatan Ruang Laut."
            >
                <Button
                    size={'icon'}
                    render={
                        <Link href="/master/kkprl-proposal/create">
                            <Plus />
                        </Link>
                    }
                />
            </Heading>

            {success && (
                <div className="mb-4 flex animate-in items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 duration-300 slide-in-from-top-2">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    {success}
                </div>
            )}

            <PaginatedTable
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari pemohon, perusahaan, lokasi, email..."
                summary={
                    <>
                        Menampilkan{' '}
                        <span className="font-semibold text-slate-600">
                            {proposals.from ?? 0}-{proposals.to ?? 0}
                        </span>{' '}
                        dari{' '}
                        <span className="font-semibold text-slate-600">
                            {proposals.total}
                        </span>{' '}
                        proposal
                    </>
                }
                extraFilters={
                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                router.get(
                                    '/master/kkprl-proposal',
                                    { search, status: e.target.value },
                                    { preserveState: true, replace: true },
                                );
                            }}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400"
                        >
                            <option value="">Semua Status</option>
                            <option value="dikirim">Dikirim</option>
                            <option value="diproses">Diproses</option>
                            <option value="disetujui">Disetujui</option>
                            <option value="ditolak">Ditolak</option>
                        </select>
                    </div>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            #
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Pemohon / Perusahaan
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Lokasi Perairan
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Luas (Ha)
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Status
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
                            colSpan={6}
                            className="py-16 text-center text-slate-400"
                        >
                            <Search className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                            <p className="font-medium">
                                Belum ada data proposal KKPRL.
                            </p>
                            <p className="mt-1 text-xs">
                                Data proposal akan muncul setelah pengguna
                                submit form KKPRL.
                            </p>
                        </td>
                    </tr>
                }
                pagination={
                    proposals.last_page > 1 ? (
                        <Pagination
                            links={proposals.links}
                            currentPage={proposals.current_page}
                            lastPage={proposals.last_page}
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
                                    {item.applicant_name}
                                </p>
                                <p className="text-xs font-medium text-slate-500">
                                    {item.company_name}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    {item.email} · {item.phone_number}
                                </p>
                            </div>
                        </td>
                        <td className="px-5 py-4">
                            <p className="text-sm font-medium text-slate-700">
                                {item.water_name}
                            </p>
                            <p className="text-xs text-slate-400">
                                {item.regency}, {item.province}
                            </p>
                        </td>
                        <td className="px-5 py-4 font-mono text-sm text-slate-700">
                            {item.area_size}
                        </td>
                        <td className="px-5 py-4">
                            <span
                                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${statusClass[item.status] || 'bg-slate-100 text-slate-700'}`}
                            >
                                {item.status}
                            </span>
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                                <Link
                                    href={`/master/kkprl-proposal/${item.id}`}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
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
