import { useMemo, useState } from 'react';
import MainLayout from '../layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    PenTool,
    Search,
    CalendarClock,
    Building2,
    BadgeCheck,
    Loader2,
    CheckCircle2,
} from 'lucide-react';

import { PaginatedTable } from '@/components/backend/paginated-table';
import { Pagination } from '@/components/backend/pagination';
import { Button } from '@/components/ui/button';
import SignaturePad from '@/components/signature-pad';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

type Konsultasi = {
    id: number;
    nama_pemohon: string;
    instansi: string;
    email: string;
    jadwal?: {
        tanggal?: string;
        waktu_awal?: string;
        waktu_akhir?: string;
        pelaksanaan?: 'Luring' | 'Daring' | 'Hybrid';
    } | null;
    status: string;
    staff_tanda_tangan?: string | null;
};

type PaginatedKonsultasi = {
    data: Konsultasi[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    konsultasi: PaginatedKonsultasi;
    filters?: { search?: string };
};

const statusClass: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    konsultasi: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    not_confirmed: 'bg-red-100 text-red-700',
    berita_acara: 'bg-purple-100 text-purple-700',
    selesai: 'bg-teal-100 text-teal-700',
};

export default function SignaturePadKonsul({ konsultasi, filters }: Props) {
    const { flash } = usePage<any>().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [selected, setSelected] = useState<Konsultasi | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        staff_tanda_tangan: '',
    });

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return konsultasi.data;

        return konsultasi.data.filter(
            (item) =>
                item.nama_pemohon.toLowerCase().includes(query) ||
                item.instansi.toLowerCase().includes(query) ||
                item.status.toLowerCase().includes(query),
        );
    }, [konsultasi.data, search]);

    const openModal = (item: Konsultasi) => {
        setSelected(item);
        setData('staff_tanda_tangan', item.staff_tanda_tangan ?? '');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelected(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;

        post(`/pegawai/signature-konsultasi/${selected.id}`, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const baseNumber = konsultasi.from ?? 0;

    return (
        <MainLayout pageTitle="Tanda Tangan Konsultasi">
            <Head title="Tanda Tangan Konsultasi" />

            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
                    <PenTool className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl leading-none font-bold text-slate-900">
                        Tanda Tangan Konsultasi
                    </h1>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Pilih permohonan untuk membubuhkan tanda tangan
                        petugas.
                    </p>
                </div>
            </div>

            {flash?.success && (
                <div className="mb-4 flex animate-in items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 duration-300 slide-in-from-top-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {flash.success}
                </div>
            )}

            <PaginatedTable
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari nama pemohon, instansi, status..."
                summary={
                    <>
                        Menampilkan{' '}
                        <span className="font-semibold text-slate-600">
                            {konsultasi.from ?? 0}-{konsultasi.to ?? 0}
                        </span>{' '}
                        dari{' '}
                        <span className="font-semibold text-slate-600">
                            {konsultasi.total}
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
                            Jadwal
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Status
                        </th>
                        <th className="px-5 py-3 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Tanda Tangan
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
                        </td>
                    </tr>
                }
                pagination={
                    konsultasi.last_page > 1 ? (
                        <Pagination
                            links={konsultasi.links}
                            currentPage={konsultasi.current_page}
                            lastPage={konsultasi.last_page}
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
                            <p className="font-semibold text-slate-800">
                                {item.nama_pemohon}
                            </p>
                            <p className="text-xs text-slate-400">
                                {item.email}
                            </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-slate-300" />
                                {item.instansi}
                            </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                            {item.jadwal?.tanggal ? (
                                <span className="flex items-center gap-1.5">
                                    <CalendarClock className="h-3.5 w-3.5 text-slate-300" />
                                    {new Date(
                                        item.jadwal.tanggal,
                                    ).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            ) : (
                                '-'
                            )}
                        </td>
                        <td className="px-5 py-4">
                            <span
                                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${statusClass[item.status] ?? 'bg-slate-100 text-slate-600'}`}
                            >
                                {item.status}
                            </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                            {item.staff_tanda_tangan ? (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                                    <BadgeCheck className="h-3 w-3" />
                                    Sudah
                                </span>
                            ) : (
                                <span className="text-xs text-slate-300">
                                    Belum
                                </span>
                            )}
                        </td>
                        <td className="px-5 py-4 text-center">
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 rounded-lg border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                onClick={() => openModal(item)}
                            >
                                <PenTool className="h-3.5 w-3.5" />
                                {item.staff_tanda_tangan ? 'Ubah' : 'Tanda Tangan'}
                            </Button>
                        </td>
                    </tr>
                ))}
            </PaginatedTable>

            {/* Signature Modal */}
            <Dialog
                open={modalOpen}
                onOpenChange={(open) => !open && closeModal()}
            >
                <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tanda Tangan Petugas</DialogTitle>
                        <DialogDescription>
                            {selected
                                ? `${selected.nama_pemohon} · ${selected.instansi}`
                                : ''}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <SignaturePad
                            value={data.staff_tanda_tangan}
                            onChange={(val) =>
                                setData('staff_tanda_tangan', val)
                            }
                            error={errors.staff_tanda_tangan}
                            label="Tanda Tangan"
                            required
                        />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={closeModal}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    processing || !data.staff_tanda_tangan
                                }
                                className="gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                {processing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <BadgeCheck className="h-4 w-4" />
                                )}
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}