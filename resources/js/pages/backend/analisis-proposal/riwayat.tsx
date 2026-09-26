import { Link, router } from '@inertiajs/react';
import { Download, Eye, History, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import Heading from '@/components/backend/heading';
import { PaginatedTable } from '@/components/backend/paginated-table';
import { Button } from '@/components/ui/button';
import AppLayout from '../../layout';

type RiwayatItem = {
    id: string;
    waktu: string;
    nama_proposal: string;
    nama_laporan: string;
    disimpan_oleh: string;
};

type Props = {
    items: RiwayatItem[];
    showsAllStaff: boolean;
};

export default function AnalisisProposalRiwayat({
    items,
    showsAllStaff,
}: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return items;
        }

        return items.filter(
            (item) =>
                item.nama_proposal.toLowerCase().includes(query) ||
                item.nama_laporan.toLowerCase().includes(query) ||
                item.disimpan_oleh.toLowerCase().includes(query),
        );
    }, [items, search]);

    const handleHapus = (item: RiwayatItem) => {
        if (
            !window.confirm(
                `Hapus hasil analisis "${item.nama_proposal}" dari Riwayat Tersimpan?`,
            )
        ) {
            return;
        }

        router.delete(`/analisis-proposal/riwayat/${item.id}`);
    };

    return (
        <AppLayout>
            <div className="bg-[#eef3f8] px-8 py-10 text-[#1c2b3a]">
                <div className="mx-auto max-w-5xl space-y-5">
                    <Heading
                        icon={History}
                        title="Riwayat Analisis Tersimpan"
                        description={
                            showsAllStaff
                                ? 'Daftar hasil Analisis & Koreksi Proposal yang disimpan oleh seluruh staf.'
                                : 'Daftar hasil Analisis & Koreksi Proposal yang pernah Anda simpan.'
                        }
                    >
                        <Link
                            href="/analisis-proposal"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700"
                        >
                            Analisis Proposal Baru
                        </Link>
                    </Heading>

                    <PaginatedTable
                        searchValue={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Cari nama proposal, laporan, atau penyimpan..."
                        summary={
                            <>
                                <span className="font-semibold text-slate-600">
                                    {filtered.length}
                                </span>{' '}
                                dari{' '}
                                <span className="font-semibold text-slate-600">
                                    {items.length}
                                </span>{' '}
                                hasil
                            </>
                        }
                        tableHead={
                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                                    Waktu Disimpan
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                                    Proposal
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                                    Laporan Pembanding
                                </th>
                                {showsAllStaff && (
                                    <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                                        Disimpan Oleh
                                    </th>
                                )}
                                <th className="px-5 py-3 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                                    Aksi
                                </th>
                            </tr>
                        }
                        isEmpty={filtered.length === 0}
                        emptyState={
                            <tr>
                                <td
                                    colSpan={showsAllStaff ? 5 : 4}
                                    className="py-16 text-center text-slate-400"
                                >
                                    <Search className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                                    <p className="font-medium">
                                        Belum ada hasil analisis yang disimpan.
                                    </p>
                                    <p className="mt-1 text-xs">
                                        Simpan hasil analisis dari halaman
                                        Analisis Proposal agar muncul di sini.
                                    </p>
                                </td>
                            </tr>
                        }
                    >
                        {filtered.map((item) => (
                            <tr
                                key={item.id}
                                className="group transition-colors hover:bg-slate-50/70"
                            >
                                <td className="px-5 py-4 text-sm whitespace-nowrap text-slate-700">
                                    {item.waktu}
                                </td>
                                <td className="px-5 py-4">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {item.nama_proposal || '-'}
                                    </p>
                                </td>
                                <td className="px-5 py-4">
                                    <p className="text-sm text-slate-600">
                                        {item.nama_laporan || (
                                            <span className="text-slate-400 italic">
                                                (tanpa laporan pembanding)
                                            </span>
                                        )}
                                    </p>
                                </td>
                                {showsAllStaff && (
                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        {item.disimpan_oleh || '-'}
                                    </td>
                                )}
                                <td className="px-5 py-4">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Link
                                            href={`/analisis-proposal/riwayat/${item.id}`}
                                            title="Lihat Hasil"
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <a
                                            href={`/analisis-proposal/riwayat/${item.id}/unduh`}
                                            title="Unduh Dokumen DOCX"
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </a>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                                            title="Hapus"
                                            onClick={() => handleHapus(item)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </PaginatedTable>
                </div>
            </div>
        </AppLayout>
    );
}
