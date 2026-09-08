import MainLayout from '../../layout';
import { router, useForm } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, LockKeyhole, Pencil, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PaginatedTable } from '@/components/backend/paginated-table';
import { Pagination } from '@/components/backend/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Holiday = {
    id: number;
    tanggal: string;
    nama: string;
    tipe: 'Nasional' | 'Perusahaan' | 'Custom';
    is_recurring: boolean;
    locked: boolean;
};
type Props = {
    holidays: { data: Holiday[]; current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null; links: { url: string | null; label: string; active: boolean }[] };
    calendarHolidays: Holiday[];
    filters: { year: number; search?: string };
};

const typeStyles: Record<Holiday['tipe'], string> = {
    Nasional: 'bg-blue-50 text-blue-700 border-blue-100',
    Perusahaan: 'bg-amber-50 text-amber-700 border-amber-100',
    Custom: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};
const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

type FormData = {
    tanggal: string;
    nama: string;
    tipe: Holiday['tipe'];
    is_recurring: boolean;
};

type PopoverState =
    | { mode: 'create'; prefillDate: string; anchor: Element }
    | { mode: 'edit'; holiday: Holiday; anchor: Element }
    | null;

/** Inline popover form shown below a calendar date button */
function DatePopoverForm({
    state,
    onClose,
}: {
    state: PopoverState;
    onClose: () => void;
}) {
    const isEdit = state?.mode === 'edit';
    const holiday = state?.mode === 'edit' ? state.holiday : undefined;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<FormData>({
        tanggal: '',
        nama: '',
        tipe: 'Custom',
        is_recurring: false,
    });

    useEffect(() => {
        if (!state) return;
        clearErrors();
        if (state.mode === 'edit') {
            setData({
                tanggal: state.holiday.tanggal.slice(0, 10),
                nama: state.holiday.nama,
                tipe: state.holiday.tipe,
                is_recurring: state.holiday.is_recurring,
            });
        } else {
            setData({ tanggal: state.prefillDate, nama: '', tipe: 'Custom', is_recurring: false });
        }
    }, [state]);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isEdit && holiday) {
            put(`/master/hari-libur/${holiday.id}`, { onSuccess: () => { onClose(); reset(); } });
        } else {
            post('/master/hari-libur', { onSuccess: () => { onClose(); reset(); } });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <div>
                <Label htmlFor="pop-tanggal" className="text-xs">Tanggal</Label>
                <Input id="pop-tanggal" type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} className="mt-1 h-9 text-sm" />
                {errors.tanggal && <p className="mt-0.5 text-xs text-red-600">{errors.tanggal}</p>}
            </div>
            <div>
                <Label htmlFor="pop-nama" className="text-xs">Nama hari libur</Label>
                <Input id="pop-nama" value={data.nama} onChange={(e) => setData('nama', e.target.value)} placeholder="Contoh: Hari Raya Idulfitri" className="mt-1 h-9 text-sm" />
                {errors.nama && <p className="mt-0.5 text-xs text-red-600">{errors.nama}</p>}
            </div>
            <div>
                <Label htmlFor="pop-tipe" className="text-xs">Tipe</Label>
                <select
                    id="pop-tipe"
                    value={data.tipe}
                    onChange={(e) => setData('tipe', e.target.value as Holiday['tipe'])}
                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                    <option value="Nasional">Nasional</option>
                    <option value="Perusahaan">Perusahaan</option>
                    <option value="Custom">Custom</option>
                </select>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
                <input type="checkbox" checked={data.is_recurring} onChange={(e) => setData('is_recurring', e.target.checked)} className="h-3.5 w-3.5 accent-amber-500" />
                Ulangi setiap tahun
            </label>
            <div className="flex justify-end gap-2 pt-1">
                <Button type="button" size="sm" variant="outline" onClick={onClose} className="h-8 gap-1.5 text-xs">
                    <X className="h-3.5 w-3.5" /> Batal
                </Button>
                <Button type="submit" size="sm" disabled={processing} className="h-8 gap-1.5 bg-amber-600 text-xs text-white hover:bg-amber-700">
                    <Save className="h-3.5 w-3.5" /> {processing ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Simpan'}
                </Button>
            </div>
        </form>
    );
}

function Calendar({
    year,
    holidays,
    onDateClick,
}: {
    year: number;
    holidays: Holiday[];
    onDateClick: (date: string, anchor: Element, holiday?: Holiday) => void;
}) {
    const byDate = new Map(holidays.map((h) => [h.tanggal.slice(0, 10), h]));

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {monthNames.map((month, monthIndex) => {
                const firstDay = new Date(year, monthIndex, 1).getDay();
                const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
                return (
                    <div key={month} className="rounded-xl border border-slate-200 bg-white p-3">
                        <h3 className="mb-2 text-sm font-bold text-slate-800">{month}</h3>
                        <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400">
                            {dayNames.map((d) => <span key={d}>{d}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                            {Array.from({ length: firstDay }).map((_, i) => <span key={`blank-${i}`} />)}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const day = i + 1;
                                const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const holiday = byDate.get(date);
                                const isLocked = holiday?.locked;
                                return (
                                    <button
                                        key={date}
                                        type="button"
                                        title={holiday ? holiday.nama : `Tambah: ${date}`}
                                        disabled={isLocked}
                                        onClick={(e) => onDateClick(date, e.currentTarget, holiday)}
                                        className={cn(
                                            'mx-auto flex h-6 w-6 items-center justify-center rounded-full transition-all',
                                            isLocked
                                                ? 'cursor-default opacity-60'
                                                : 'cursor-pointer',
                                            holiday
                                                ? holiday.tipe === 'Nasional'
                                                    ? 'bg-blue-600 font-bold text-white hover:bg-blue-700'
                                                    : holiday.tipe === 'Perusahaan'
                                                        ? 'bg-amber-400 font-bold text-white hover:bg-amber-500'
                                                        : 'bg-emerald-500 font-bold text-white hover:bg-emerald-600'
                                                : 'text-slate-600 hover:bg-amber-100 hover:text-amber-700',
                                        )}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/** Modal dialog used for the table edit button and the header "Tambah" button */
type DialogState =
    | { mode: 'create' }
    | { mode: 'edit'; holiday: Holiday }
    | null;

function HolidayModalForm({ state, onClose }: { state: DialogState; onClose: () => void }) {
    const isEdit = state?.mode === 'edit';
    const holiday = state?.mode === 'edit' ? state.holiday : undefined;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<FormData>({
        tanggal: '',
        nama: '',
        tipe: 'Custom',
        is_recurring: false,
    });

    useEffect(() => {
        if (!state) return;
        clearErrors();
        if (state.mode === 'edit') {
            setData({ tanggal: state.holiday.tanggal.slice(0, 10), nama: state.holiday.nama, tipe: state.holiday.tipe, is_recurring: state.holiday.is_recurring });
        } else {
            setData({ tanggal: '', nama: '', tipe: 'Custom', is_recurring: false });
        }
    }, [state]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && holiday) {
            put(`/master/hari-libur/${holiday.id}`, { onSuccess: () => { onClose(); reset(); } });
        } else {
            post('/master/hari-libur', { onSuccess: () => { onClose(); reset(); } });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <div>
                <Label htmlFor="m-tanggal">Tanggal</Label>
                <Input id="m-tanggal" type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} className="mt-2 h-11" />
                {errors.tanggal && <p className="mt-1 text-sm text-red-600">{errors.tanggal}</p>}
            </div>
            <div>
                <Label htmlFor="m-nama">Nama hari libur</Label>
                <Input id="m-nama" value={data.nama} onChange={(e) => setData('nama', e.target.value)} placeholder="Contoh: Hari Raya Idulfitri" className="mt-2 h-11" />
                {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
            </div>
            <div>
                <Label htmlFor="m-tipe">Tipe</Label>
                <select id="m-tipe" value={data.tipe} onChange={(e) => setData('tipe', e.target.value as Holiday['tipe'])} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
                    <option value="Nasional">Nasional</option>
                    <option value="Perusahaan">Perusahaan</option>
                    <option value="Custom">Custom</option>
                </select>
                {errors.tipe && <p className="mt-1 text-sm text-red-600">{errors.tipe}</p>}
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={data.is_recurring} onChange={(e) => setData('is_recurring', e.target.checked)} className="h-4 w-4 accent-amber-500" />
                Ulangi setiap tahun
            </label>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="gap-2"><X className="h-4 w-4" /> Batal</Button>
                <Button type="submit" disabled={processing} className="gap-2 bg-amber-600 text-white hover:bg-amber-700">
                    <Save className="h-4 w-4" /> {processing ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Simpan'}
                </Button>
            </div>
        </form>
    );
}

export default function HolidayIndex({ holidays, calendarHolidays, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [year, setYear] = useState(filters.year);

    // Popover state — tracks which date was clicked and the anchor element
    const [popover, setPopover] = useState<PopoverState>(null);
    const popoverOpen = popover !== null;

    // Modal state — for the "Tambah" header button and table edit button
    const [dialog, setDialog] = useState<DialogState>(null);
    const dialogOpen = dialog !== null;

    const anchorRef = useRef<Element | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? holidays.data.filter((h) => `${h.nama} ${h.tipe}`.toLowerCase().includes(q)) : holidays.data;
    }, [holidays.data, search]);

    const navigateYear = (next: number) => {
        setYear(next);
        router.get('/master/hari-libur', { year: next, search }, { preserveState: true, replace: true });
    };
    const importNational = () => router.post('/master/hari-libur/import', { year });
    const remove = (holiday: Holiday) => {
        if (!window.confirm(`Hapus hari libur ${holiday.nama}?`)) return;
        router.delete(`/master/hari-libur/${holiday.id}`);
    };

    const handleDateClick = (date: string, anchor: Element, holiday?: Holiday) => {
        if (holiday?.locked) return;
        anchorRef.current = anchor;
        if (holiday) {
            setPopover({ mode: 'edit', holiday, anchor });
        } else {
            setPopover({ mode: 'create', prefillDate: date, anchor });
        }
    };

    const closePopover = () => setPopover(null);

    return (
        <MainLayout pageTitle="Master Hari Libur">
            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20">
                            <CalendarDays className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Master Hari Libur</h1>
                            <p className="mt-0.5 text-sm text-slate-500">Kelola kalender hari libur operasional BPRL.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={importNational} className="gap-2 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
                            <Upload className="h-4 w-4" /> Import nasional
                        </Button>
                        <Button className="gap-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700" onClick={() => setDialog({ mode: 'create' })}>
                            <Plus className="h-4 w-4" /> Tambah hari libur
                        </Button>
                    </div>
                </div>

                {/* Calendar section */}
                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Kalender {year}</h2>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                                <span className="rounded-full bg-blue-600 px-2 py-1 text-white">Nasional</span>
                                <span className="rounded-full bg-amber-400 px-2 py-1 text-white">Perusahaan</span>
                                <span className="rounded-full bg-emerald-500 px-2 py-1 text-white">Custom</span>
                            </div>
                            <p className="mt-2 text-[11px] text-slate-400">Klik tanggal untuk menambah atau mengedit hari libur</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button size="icon" variant="outline" onClick={() => navigateYear(year - 1)} aria-label="Tahun sebelumnya"><ChevronLeft className="h-4 w-4" /></Button>
                            <span className="min-w-16 text-center text-sm font-bold text-slate-700">{year}</span>
                            <Button size="icon" variant="outline" onClick={() => navigateYear(year + 1)} aria-label="Tahun berikutnya"><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    {/* Calendar with controlled popover */}
                    <PopoverPrimitive.Root
                        open={popoverOpen}
                        onOpenChange={(open) => { if (!open) closePopover(); }}
                        modal={false}
                    >
                        {/* No trigger — we use an imperative anchor ref */}
                        <Calendar year={year} holidays={calendarHolidays} onDateClick={handleDateClick} />

                        <PopoverPrimitive.Portal>
                            <PopoverPrimitive.Positioner
                                anchor={anchorRef}
                                side="bottom"
                                align="center"
                                sideOffset={6}
                                className="isolate z-50"
                            >
                                <PopoverPrimitive.Popup className="w-72 origin-(--transform-origin) rounded-2xl bg-white p-4 text-sm shadow-xl ring-1 ring-slate-200 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                                    {/* Header */}
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                            </span>
                                            <span className="font-semibold text-slate-800">
                                                {popover?.mode === 'edit' ? 'Ubah Hari Libur' : 'Tambah Hari Libur'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={closePopover}
                                            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                            aria-label="Tutup"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <DatePopoverForm state={popover} onClose={closePopover} />
                                </PopoverPrimitive.Popup>
                            </PopoverPrimitive.Positioner>
                        </PopoverPrimitive.Portal>
                    </PopoverPrimitive.Root>
                </section>

                {/* Table */}
                <PaginatedTable
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Cari hari libur..."
                    summary={<>Menampilkan <span className="font-semibold text-slate-600">{holidays.from ?? 0}-{holidays.to ?? 0}</span> dari <span className="font-semibold text-slate-600">{holidays.total}</span> hari libur</>}
                    tableHead={
                        <tr className="border-b border-slate-100 bg-slate-50/60">
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">#</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tanggal</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tipe</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Berulang</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                        </tr>
                    }
                    isEmpty={filtered.length === 0}
                    emptyState={
                        <tr><td colSpan={6} className="py-16 text-center text-slate-400">
                            <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                            <p className="font-medium">Belum ada hari libur untuk tahun ini.</p>
                        </td></tr>
                    }
                    pagination={holidays.last_page > 1 ? <Pagination links={holidays.links} currentPage={holidays.current_page} lastPage={holidays.last_page} onNavigate={(url) => router.get(url)} /> : null}
                >
                    {filtered.map((holiday, index) => (
                        <tr key={holiday.id} className="transition-colors hover:bg-slate-50/70">
                            <td className="px-5 py-4 font-mono text-xs text-slate-400">{(holidays.from ?? 1) + index}</td>
                            <td className="px-5 py-4 text-sm font-semibold text-slate-700">{new Date(holiday.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                            <td className="px-5 py-4 text-sm font-semibold text-slate-800">{holiday.nama}</td>
                            <td className="px-5 py-4"><span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${typeStyles[holiday.tipe]}`}>{holiday.tipe}</span></td>
                            <td className="px-5 py-4 text-center text-xs text-slate-600">{holiday.is_recurring ? 'Ya' : 'Tidak'}</td>
                            <td className="px-5 py-4">
                                <div className="flex items-center justify-center gap-1.5">
                                    {holiday.locked ? (
                                        <LockKeyhole className="h-4 w-4 text-slate-400" aria-label="Terkunci" />
                                    ) : (
                                        <>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600" aria-label="Edit" onClick={() => setDialog({ mode: 'edit', holiday })}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => remove(holiday)} aria-label="Hapus">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </PaginatedTable>
            </div>

            {/* Modal dialog for header "Tambah" button and table edit button */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setDialog(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                <CalendarDays className="h-4 w-4" />
                            </span>
                            {dialog?.mode === 'edit' ? 'Ubah Hari Libur' : 'Tambah Hari Libur'}
                        </DialogTitle>
                    </DialogHeader>
                    <HolidayModalForm state={dialog} onClose={() => setDialog(null)} />
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
