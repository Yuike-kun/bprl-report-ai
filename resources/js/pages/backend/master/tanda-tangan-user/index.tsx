import MainLayout from "../../layout";
import { Head, router, useForm } from "@inertiajs/react";
import { CalendarClock, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PaginatedTable } from "@/components/backend/paginated-table";
import { Pagination } from "@/components/backend/pagination";
import { Button } from "@/components/ui/button";
import SignaturePad from "@/components/signature-pad";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Signature = {
    id: number;
    name: string;
    signature: string | null;
};

type PaginatedSignatures = {
    data: Signature[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    signatures: PaginatedSignatures;
    filters?: {
        search?: string;
    };
    success?: string;
};

const SEARCH_DEBOUNCE_MS = 600;

export default function TandaTanganUserIndex({ signatures, filters, success }: Props) {
    const [search, setSearch] = useState(filters?.search ?? "");
    const [selected, setSelected] = useState<Signature | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loadingServer, setLoadingServer] = useState(false);

    const skipFirstRun = useRef(true);
    const lastSearchedTerm = useRef(filters?.search ?? "");

    const { data, setData, put, processing, errors, reset } = useForm({
        signature: "",
    });

    // filter what we already have on screen first, no need to hit the server for this
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return signatures.data;
        return signatures.data.filter((item) => item.name.toLowerCase().includes(q));
    }, [signatures.data, search]);

    useEffect(() => {
        if (skipFirstRun.current) {
            skipFirstRun.current = false;
            return;
        }

        const term = search.trim();

        // cleared the box, go back to the normal unfiltered list
        if (!term) {
            if (lastSearchedTerm.current) {
                lastSearchedTerm.current = "";
                router.get(
                    "/master/tanda-tangan-user",
                    {},
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
            return;
        }

        // found it on this page already, don't bother the server
        if (filtered.length > 0) return;

        // nothing on this page matches, might be on another page — go ask
        const t = setTimeout(() => {
            setLoadingServer(true);
            lastSearchedTerm.current = term;
            router.get(
                "/master/tanda-tangan-user",
                { search: term },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setLoadingServer(false),
                }
            );
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(t);
    }, [search, filtered.length]);

    const openModal = (item: Signature) => {
        setSelected(item);
        setData("signature", item.signature ?? "");
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

        put(`/master/tanda-tangan-user/${selected.id}`, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const handleDelete = (item: Signature) => {
        if (!window.confirm(`Hapus tanda tangan ${item.name}?`)) return;
        router.delete(`/master/tanda-tangan-user/${item.id}`);
    };

    const baseNumber = signatures.from ?? 0;

    return (
        <MainLayout pageTitle="Master Tanda Tangan User">
            <Head title="Master Tanda Tangan User" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                        <CalendarClock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">Master Tanda Tangan User</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Kelola tanda tangan pengguna beserta detailnya.</p>
                    </div>
                </div>
            </div>

            {(success || success === "") && (
                <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm font-medium animate-in slide-in-from-top-2 duration-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    {success}
                </div>
            )}

            <PaginatedTable
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari nama user..."
                summary={
                    <>
                        Menampilkan <span className="font-semibold text-slate-600">{signatures.from ?? 0}-{signatures.to ?? 0}</span> dari <span className="font-semibold text-slate-600">{signatures.total}</span> tanda tangan
                    </>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">#</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">User</th>
                        <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Tanda Tangan</th>
                        <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">Aksi</th>
                    </tr>
                }
                isEmpty={filtered.length === 0 && !loadingServer}
                emptyState={
                    loadingServer ? (
                        <tr>
                            <td colSpan={7} className="text-center py-16 text-slate-400">
                                <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin text-slate-300" />
                                <p className="font-medium">Mencari di server...</p>
                            </td>
                        </tr>
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-center py-16 text-slate-400">
                                <Search className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                                <p className="font-medium">Belum ada tanda tangan.</p>
                                <p className="text-xs mt-1">Klik Tambah Tanda Tangan pada baris user untuk menambahkan tanda tangan baru.</p>
                            </td>
                        </tr>
                    )
                }
                pagination={
                    signatures.last_page > 1 ? (
                        <Pagination
                            links={signatures.links}
                            currentPage={signatures.current_page}
                            lastPage={signatures.last_page}
                            onNavigate={(url) => router.get(url)}
                        />
                    ) : null
                }
            >
                {filtered.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{baseNumber + index}</td>
                        <td className="px-5 py-4 text-slate-700 font-semibold">
                            {item.name ?? "-"}
                        </td>
                        <td className="px-5 py-4 text-slate-600 text-sm">
                            {item.signature ? (
                                <img src={item.signature} alt={`Tanda Tangan ${item.name}`} className="max-h-12" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 italic">Tidak ada tanda tangan</span>
                                    <button
                                        onClick={() => openModal(item)}
                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-md transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Tambah
                                    </button>
                                </div>
                            )}
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                    title={item.signature ? "Edit Tanda Tangan" : "Tambah Tanda Tangan"}
                                    onClick={() => openModal(item)}
                                >
                                    {item.signature ? (
                                        <Pencil className="w-4 h-4" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                </Button>
                                {item.signature && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        title="Hapus"
                                        onClick={() => handleDelete(item)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </PaginatedTable>

            <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selected?.signature ? "Ubah Tanda Tangan" : "Tambah Tanda Tangan"}</DialogTitle>
                        <DialogDescription>
                            {selected ? `Membubuhkan tanda tangan untuk user: ${selected.name}` : ""}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <SignaturePad
                            value={data.signature}
                            onChange={(val) => setData("signature", val)}
                            error={errors.signature}
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
                                disabled={processing || !data.signature}
                                className="gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                {processing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : null}
                                {processing ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}