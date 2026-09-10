import { Head, Link, router } from '@inertiajs/react';
import ApexCharts from 'apexcharts';
import {
    ChevronDown,
    ChevronUp,
    ClipboardCheck,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserRound,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { PaginatedTable } from '@/components/backend/paginated-table';
import { Pagination } from '@/components/backend/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item';
import MainLayout from '../layout';

type StaffUser = { id: number; name: string; email: string };

type StaffItem = {
    id: number;
    position: string;
    department: string;
    phone: string | null;
    joined_at: string;
    is_active: boolean;
    user: StaffUser;
    permohonan_konsultasi: any[];
};

type PaginatedStaff = {
    data: StaffItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type ChartData = {
    labels: string[];
    series: number[];
    availableYears: number[];
    currentYear: number;
    currentRange: 'year' | 'last_5_months';
};

type Props = {
    staff: PaginatedStaff;
    filters?: { search?: string };
    chartData?: ChartData;
    flash?: { success?: string };
};

export default function StaffIndex({
    staff,
    filters,
    chartData,
    flash,
}: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [modalKonsultasiListOpen, setModalKonsultasiListOpen] =
        useState(false);
    const [showChart, setShowChart] = useState(true);

    const chartRef = useRef<HTMLDivElement>(null);

    const range = chartData?.currentRange ?? 'year';
    const year = chartData?.currentYear ?? new Date().getFullYear();

    // Bar chart rows: only staff that have assignments, most active first,
    // with long names truncated so the label axis stays tidy.
    const chartRows = useMemo(() => {
        if (!chartData) {
            return [] as { name: string; count: number }[];
        }

        return chartData.labels
            .map((name, i) => ({
                name: name.length > 22 ? `${name.slice(0, 21)}…` : name,
                count: chartData.series[i] ?? 0,
            }))
            .filter((row) => row.count > 0)
            .sort((a, b) => b.count - a.count);
    }, [chartData]);

    useEffect(() => {
        if (!showChart || !chartRef.current || chartRows.length === 0) {
            return;
        }

        const maxCount = Math.max(...chartRows.map((row) => row.count));

        const options = {
            chart: {
                type: 'bar' as const,
                // Grow the chart with the number of rows (min 280px, max 720px)
                height: Math.max(
                    280,
                    Math.min(720, chartRows.length * 42 + 24),
                ),
                toolbar: { show: false },
                fontFamily: 'inherit',
            },
            series: [
                {
                    name: 'Jumlah Penugasan',
                    data: chartRows.map((row) => row.count),
                },
            ],
            labels: chartRows.map((row) => row.name),
            colors: ['#10b981'],
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '50%',
                    barDataGap: '22%',
                    borderRadius: 4,
                },
            },
            dataLabels: {
                enabled: true,
                formatter: (val: string | number) => val,
                style: {
                    fontSize: '11px',
                    fontWeight: 600,
                    colors: ['#334155'],
                },
            },
            stroke: { width: 0 },
            xaxis: {
                // Extra headroom so the end-of-bar value labels never clip
                max: Math.ceil(maxCount * 1.25),
                labels: { show: false },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: {
                labels: {
                    show: true,
                    style: {
                        fontSize: '12px',
                        colors: ['#475569'],
                    },
                },
            },
            grid: { show: false },
            tooltip: {
                y: {
                    formatter: (val: number) => `${val} Penugasan Konsultasi`,
                },
            },
        };

        const chart = new ApexCharts(chartRef.current, options);
        chart.render();

        return () => {
            chart.destroy();
        };
    }, [showChart, chartRows]);

    const handleRangeChange = (newRange: 'year' | 'last_5_months') => {
        router.get(
            '/staff',
            {
                search,
                chart_range: newRange,
                chart_year: year,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleYearChange = (newYear: number) => {
        router.get(
            '/staff',
            {
                search,
                chart_range: range,
                chart_year: newYear,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;

            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/staff',
                {
                    search,
                    chart_range: range,
                    chart_year: year,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleDelete = (item: StaffItem) => {
        if (!window.confirm(`Hapus staff ${item.user?.name ?? 'ini'}?`)) {
            return;
        }

        router.delete(`/staff/${item.id}`);
    };

    const baseNumber = staff.from ?? 0;

    return (
        <MainLayout pageTitle="Master Staff">
            <Head title="Master Staff" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-cyan-600 shadow-md shadow-emerald-500/20">
                        <UserRound className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl leading-none font-bold text-slate-900">
                            Master Staff
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Kelola data staff beserta jabatan dan departemennya.
                        </p>
                    </div>
                </div>
                <Link href="/staff/create">
                    <Button className="gap-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700">
                        <Plus className="h-4 w-4" />
                        Tambah Staff
                    </Button>
                </Link>
            </div>

            {flash?.success && (
                <div className="mb-4 flex animate-in items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 duration-300 slide-in-from-top-2">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    {flash.success}
                </div>
            )}

            {/* Collapsible Graph Section */}
            <Card className="mb-6 border-slate-200/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2">
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                            <Users className="h-4 w-4 text-emerald-600" />
                            Grafik Penugasan Konsultasi per Staff
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {showChart && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center rounded-lg bg-slate-100 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRangeChange('year')
                                        }
                                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                                            range === 'year'
                                                ? 'bg-white text-emerald-700 shadow-xs'
                                                : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        Per Tahun
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRangeChange('last_5_months')
                                        }
                                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                                            range === 'last_5_months'
                                                ? 'bg-white text-emerald-700 shadow-xs'
                                                : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        5 Bulan Terakhir
                                    </button>
                                </div>

                                {range === 'year' &&
                                    chartData?.availableYears &&
                                    chartData.availableYears.length > 0 && (
                                        <select
                                            value={year}
                                            onChange={(e) =>
                                                handleYearChange(
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                                        >
                                            {chartData.availableYears.map(
                                                (y) => (
                                                    <option key={y} value={y}>
                                                        {y}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    )}
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowChart(!showChart)}
                            className="h-8 gap-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                            {showChart ? (
                                <>
                                    Sembunyikan Grafik
                                    <ChevronUp className="h-3.5 w-3.5" />
                                </>
                            ) : (
                                <>
                                    Tampilkan Grafik
                                    <ChevronDown className="h-3.5 w-3.5" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                {showChart && (
                    <CardContent className="pt-4">
                        {chartRows.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <Users className="mb-3 h-10 w-10 text-slate-200" />
                                <p className="font-medium">
                                    Belum ada penugasan konsultasi pada periode
                                    ini.
                                </p>
                                <p className="mt-1 text-xs">
                                    Ganti rentang periode untuk melihat data
                                    lainnya.
                                </p>
                            </div>
                        ) : (
                            <div ref={chartRef} className="w-full" />
                        )}
                    </CardContent>
                )}
            </Card>

            <PaginatedTable
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari nama, jabatan, departemen..."
                summary={
                    <>
                        Menampilkan{' '}
                        <span className="font-semibold text-slate-600">
                            {staff.from ?? 0}-{staff.to ?? 0}
                        </span>{' '}
                        dari{' '}
                        <span className="font-semibold text-slate-600">
                            {staff.total}
                        </span>{' '}
                        staff
                    </>
                }
                tableHead={
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            #
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Nama
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Jumlah Penugasan
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Jabatan
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Departemen
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Status
                        </th>
                        <th className="px-5 py-3 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">
                            Aksi
                        </th>
                    </tr>
                }
                isEmpty={staff.data.length === 0}
                emptyState={
                    <tr>
                        <td
                            colSpan={6}
                            className="py-16 text-center text-slate-400"
                        >
                            <Search className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                            <p className="font-medium">Belum ada staff.</p>
                            <p className="mt-1 text-xs">
                                Klik Tambah Staff untuk mendaftarkan staff baru.
                            </p>
                        </td>
                    </tr>
                }
                pagination={
                    staff.last_page > 1 ? (
                        <Pagination
                            links={staff.links}
                            currentPage={staff.current_page}
                            lastPage={staff.last_page}
                            onNavigate={(url) =>
                                router.get(
                                    url,
                                    {
                                        search,
                                        chart_range: range,
                                        chart_year: year,
                                    },
                                    { preserveState: true },
                                )
                            }
                        />
                    ) : null
                }
            >
                {staff.data.map((item, index) => (
                    <tr
                        key={item.id}
                        className="group transition-colors hover:bg-slate-50/70"
                    >
                        <td className="px-5 py-4 font-mono text-xs text-slate-400">
                            {baseNumber + index}
                        </td>
                        <td className="px-5 py-4">
                            <p className="font-semibold text-slate-700">
                                {item.user?.name ?? '-'}
                            </p>
                            <p className="text-xs text-slate-400">
                                {item.user?.email ?? ''}
                            </p>
                        </td>
                        <td className="px-5 py-4">
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700"
                                onClick={() => setModalKonsultasiListOpen(true)}
                            >
                                {item.permohonan_konsultasi?.length ?? 0}{' '}
                                Konsultasi
                            </Button>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                            {item.position}
                        </td>
                        <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                                {item.department}
                            </span>
                        </td>
                        <td className="px-5 py-4">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                    item.is_active
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                />
                                {item.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                                <Link href={`/staff/${item.id}/edit`}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
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

            <Dialog
                open={modalKonsultasiListOpen}
                onOpenChange={setModalKonsultasiListOpen}
            >
                <DialogContent className="sm:max-w-fit sm:min-w-lg">
                    <DialogHeader>
                        <DialogTitle>Daftar Konsultasi</DialogTitle>
                    </DialogHeader>
                    {staff.data.map((item) => (
                        <div key={item.id} className="mb-4">
                            <h3 className="font-semibold text-slate-700">
                                {item.user?.name ?? '-'}
                            </h3>
                            {item.permohonan_konsultasi.length > 0 ? (
                                item.permohonan_konsultasi.map((konsul) => (
                                    <Item className="mt-2 rounded-lg border border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100">
                                        <ItemMedia variant="icon">
                                            <ClipboardCheck />
                                        </ItemMedia>
                                        <ItemContent>
                                            <ItemTitle>
                                                {konsul.request_form
                                                    ?.nama_pemohon ?? '-'}
                                            </ItemTitle>
                                            <ItemDescription>
                                                {konsul.request_form
                                                    ?.rencana_kegiatan ??
                                                    '-'}{' '}
                                                <br />
                                                Diajukan pada{' '}
                                                {new Date(
                                                    konsul.request_form
                                                        ?.created_at ?? '',
                                                ).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </ItemDescription>
                                        </ItemContent>
                                        <ItemActions>
                                            <Link
                                                href={`/master/permohonan-konsultasi/${konsul.id}`}
                                                className="mr-2"
                                            >
                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                                >
                                                    <span className="hidden sm:inline">
                                                        Lihat
                                                    </span>
                                                    <span className="sm:hidden">
                                                        Detail
                                                    </span>
                                                </Button>
                                            </Link>
                                        </ItemActions>
                                    </Item>
                                ))
                            ) : (
                                <p className="mt-1 text-sm text-slate-500">
                                    Belum ada konsultasi.
                                </p>
                            )}
                        </div>
                    ))}
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
