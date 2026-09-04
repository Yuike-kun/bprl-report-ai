import MainLayout from '../../layout';
import { Link, router } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, LockKeyhole, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PaginatedTable } from '@/components/backend/paginated-table';
import { Pagination } from '@/components/backend/pagination';
import { Button } from '@/components/ui/button';

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

function Calendar({ year, holidays }: { year: number; holidays: Holiday[] }) {
    const byDate = new Map(holidays.map((holiday) => [holiday.tanggal.slice(0, 10), holiday]));
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {monthNames.map((month, monthIndex) => {
                const firstDay = new Date(year, monthIndex, 1).getDay();
                const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
                return (
                    <div key={month} className="rounded-xl border border-slate-200 bg-white p-3">
                        <h3 className="mb-2 text-sm font-bold text-slate-800">{month}</h3>
                        <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400">
                            {dayNames.map((day) => <span key={day}>{day}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                            {Array.from({ length: firstDay }).map((_, index) => <span key={`blank-${index}`} />)}
                            {Array.from({ length: daysInMonth }, (_, index) => {
                                const day = index + 1;
                                const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const holiday = byDate.get(date);
                                return <span key={date} title={holiday?.nama} className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full ${holiday ? holiday.tipe === 'Nasional' ? 'bg-blue-600 font-bold text-white' : holiday.tipe === 'Perusahaan' ? 'bg-amber-400 font-bold text-white' : 'bg-emerald-500 font-bold text-white' : 'text-slate-600'}`}>{day}</span>;
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function HolidayIndex({ holidays, calendarHolidays, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [year, setYear] = useState(filters.year);
    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return query ? holidays.data.filter((holiday) => `${holiday.nama} ${holiday.tipe}`.toLowerCase().includes(query)) : holidays.data;
    }, [holidays.data, search]);
    const navigateYear = (nextYear: number) => {
        setYear(nextYear);
        router.get('/master/hari-libur', { year: nextYear, search }, { preserveState: true, replace: true });
    };
    const importNational = () => router.post('/master/hari-libur/import', { year });
    const remove = (holiday: Holiday) => {
        if (!window.confirm(`Hapus hari libur ${holiday.nama}?`)) return;
        router.delete(`/master/hari-libur/${holiday.id}`);
    };

    return (
        <MainLayout pageTitle="Master Hari Libur">
            <div className="space-y-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20"><CalendarDays className="h-5 w-5" /></div>
                        <div><h1 className="text-xl font-bold text-slate-900">Master Hari Libur</h1><p className="mt-0.5 text-sm text-slate-500">Kelola kalender hari libur operasional BPRL.</p></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={importNational} className="gap-2 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50"><Upload className="h-4 w-4" /> Import nasional</Button>
                        <Link href="/master/hari-libur/create"><Button className="gap-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700"><Plus className="h-4 w-4" /> Tambah hari libur</Button></Link>
                    </div>
                </div>
                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-bold text-slate-900">Kalender {year}</h2><div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold"><span className="rounded-full bg-blue-600 px-2 py-1 text-white">Nasional</span><span className="rounded-full bg-amber-400 px-2 py-1 text-white">Perusahaan</span><span className="rounded-full bg-emerald-500 px-2 py-1 text-white">Custom</span></div></div><div className="flex items-center gap-1"><Button size="icon" variant="outline" onClick={() => navigateYear(year - 1)} aria-label="Tahun sebelumnya"><ChevronLeft className="h-4 w-4" /></Button><span className="min-w-16 text-center text-sm font-bold text-slate-700">{year}</span><Button size="icon" variant="outline" onClick={() => navigateYear(year + 1)} aria-label="Tahun berikutnya"><ChevronRight className="h-4 w-4" /></Button></div></div>
                    <Calendar year={year} holidays={calendarHolidays} />
                </section>
                <PaginatedTable searchValue={search} onSearchChange={setSearch} searchPlaceholder="Cari hari libur..." summary={<>Menampilkan <span className="font-semibold text-slate-600">{holidays.from ?? 0}-{holidays.to ?? 0}</span> dari <span className="font-semibold text-slate-600">{holidays.total}</span> hari libur</>} tableHead={<tr className="border-b border-slate-100 bg-slate-50/60"><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">#</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tanggal</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tipe</th><th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Berulang</th><th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th></tr>} isEmpty={filtered.length === 0} emptyState={<tr><td colSpan={6} className="py-16 text-center text-slate-400"><CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-200" /><p className="font-medium">Belum ada hari libur untuk tahun ini.</p></td></tr>} pagination={holidays.last_page > 1 ? <Pagination links={holidays.links} currentPage={holidays.current_page} lastPage={holidays.last_page} onNavigate={(url) => router.get(url)} /> : null}>
                    {filtered.map((holiday, index) => <tr key={holiday.id} className="transition-colors hover:bg-slate-50/70"><td className="px-5 py-4 font-mono text-xs text-slate-400">{(holidays.from ?? 1) + index}</td><td className="px-5 py-4 text-sm font-semibold text-slate-700">{new Date(holiday.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td><td className="px-5 py-4 text-sm font-semibold text-slate-800">{holiday.nama}</td><td className="px-5 py-4"><span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${typeStyles[holiday.tipe]}`}>{holiday.tipe}</span></td><td className="px-5 py-4 text-center text-xs text-slate-600">{holiday.is_recurring ? 'Ya' : 'Tidak'}</td><td className="px-5 py-4"><div className="flex items-center justify-center gap-1.5">{holiday.locked ? <LockKeyhole className="h-4 w-4 text-slate-400" aria-label="Terkunci" /> : <><Link href={`/master/hari-libur/${holiday.id}/edit`}><Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600" aria-label="Edit"><Pencil className="h-4 w-4" /></Button></Link><Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => remove(holiday)} aria-label="Hapus"><Trash2 className="h-4 w-4" /></Button></>}</div></td></tr>)}
                </PaginatedTable>
            </div>
        </MainLayout>
    );
}
