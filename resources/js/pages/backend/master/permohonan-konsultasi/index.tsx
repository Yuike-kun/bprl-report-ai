import MainLayout from '../../layout';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, ExternalLink, Eye, File, FileImage, FileSpreadsheet, FileText, Paperclip, Pencil, Plus, Search, TrendingUp, Trash2, UserRound } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';

import { PaginatedTable } from '@/components/backend/paginated-table';
import { Pagination } from '@/components/backend/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

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

type ChartData = {
    monthly: {
        categories: string[];
        series: { name: string; data: number[] }[];
    };
    yearly: {
        categories: string[];
        series: { name: string; data: number[] }[];
    };
    availableYears: number[];
    selectedYear: number;
};

type Props = {
    submissions: PaginatedSubmissions;
    filters?: {
        search?: string;
    };
    chartData?: ChartData;
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
    chartData,
    success,
}: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [showChart, setShowChart] = useState(true);
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

    const chartRef = useRef<HTMLDivElement>(null);
    const selectedYear = chartData?.selectedYear ?? new Date().getFullYear();

    useEffect(() => {
        if (!showChart || !chartRef.current || !chartData) return;

        const currentChart = viewMode === 'monthly' ? chartData.monthly : chartData.yearly;

        const options = {
            chart: {
                type: 'area',
                height: 320,
                toolbar: { show: false },
                fontFamily: 'inherit',
            },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 3 },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [0, 90, 100],
                },
            },
            colors: ['#0284c7'],
            xaxis: {
                categories: currentChart.categories,
                labels: { style: { colors: '#64748b', fontSize: '12px', fontWeight: 600 } },
            },
            yaxis: {
                title: { text: 'Jumlah Permohonan' },
                labels: { style: { colors: '#64748b', fontSize: '12px' } },
                allowDecimals: false,
            },
            tooltip: {
                y: {
                    formatter: (val: number) => `${val} Permohonan`,
                },
            },
            series: currentChart.series,
            grid: {
                borderColor: '#f1f5f9',
                strokeDashArray: 4,
            },
        };

        const chart = new ApexCharts(chartRef.current, options);
        chart.render();

        return () => {
            chart.destroy();
        };
    }, [showChart, viewMode, chartData]);

    const handleYearChange = (newYear: number) => {
        router.get('/master/permohonan-konsultasi', {
            search,
            chart_year: newYear,
        }, { preserveState: true, preserveScroll: true });
    };

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/master/permohonan-konsultasi',
                {
                    search,
                    chart_year: selectedYear,
                },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleDelete = (item: Submission) => {
        if (!window.confirm(`Hapus permohonan dari ${item.nama_pemohon}?`)) {
            return;
        }

        router.delete(`/master/permohonan-konsultasi/${item.id}`);
    };

    const baseNumber = submissions.from ?? 0;

    return (
        <MainLayout pageTitle="Master Permohonan Konsultasi">
            <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
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
                <Link href="/master/permohonan-konsultasi/create">
                    <Button className="gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        Tambah Permohonan
                    </Button>
                </Link>
            </div>

            {success && (
                <div className="mb-4 flex animate-in items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 duration-300 slide-in-from-top-2">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    {success}
                </div>
            )}

            {/* Collapsible Graph Section */}
            <Card className="mb-6 border-slate-200/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2">
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                            <TrendingUp className="w-4 h-4 text-sky-600" />
                            Grafik Volume Permohonan Konsultasi
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {showChart && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('monthly')}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                            viewMode === 'monthly'
                                                ? 'bg-white text-sky-700 shadow-xs'
                                                : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        Bulanan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('yearly')}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                            viewMode === 'yearly'
                                                ? 'bg-white text-sky-700 shadow-xs'
                                                : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        Tahunan
                                    </button>
                                </div>

                                {viewMode === 'monthly' && chartData?.availableYears && chartData.availableYears.length > 0 && (
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => handleYearChange(Number(e.target.value))}
                                        className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                                    >
                                        {chartData.availableYears.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowChart(!showChart)}
                            className="h-8 gap-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium"
                        >
                            {showChart ? (
                                <>
                                    Sembunyikan Grafik
                                    <ChevronUp className="w-3.5 h-3.5" />
                                </>
                            ) : (
                                <>
                                    Tampilkan Grafik
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                {showChart && (
                    <CardContent className="pt-4">
                        <div ref={chartRef} className="min-h-80 w-full" />
                    </CardContent>
                )}
            </Card>

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
                isEmpty={submissions.data.length === 0}
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
                            onNavigate={(url) => router.get(url, { search, chart_year: selectedYear }, { preserveState: true })}
                        />
                    ) : null
                }
            >
                {submissions.data.map((item, index) => (
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
                            {/* {item.dokumen && item.dokumen.length > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                                    <Paperclip className="h-3 w-3" />
                                    {item.dokumen.length}
                                </span>
                            ) : (
                                <span className="text-xs text-slate-300">—</span>
                            )} */}
                            <Dialog>
                                <form>
                                    <DialogTrigger render={<Button className={'inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 hover:text-white'}>
                                        <Paperclip className="h-3 w-3" />
                                        {item?.dokumen?.length}
                                    </Button>} />
                                    <DialogContent className="sm:max-w-fit">
                                        <DialogHeader>
                                            <DialogTitle>Berkas yg Diunggah</DialogTitle>
                                            <DialogDescription>
                                                Berkas2 yang dikirim/unggah oleh pemohon
                                            </DialogDescription>
                                            <div>
                                                {item.dokumen && item.dokumen.length > 0 ? (
                                                    <ul className="space-y-2">
                                                        {item.dokumen.map((doc: any) => {
                                                            const ext = doc.file_name.split('.').pop()?.toLowerCase() ?? '';
                                                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                                                            const isPdf = ext === 'pdf';
                                                            const isSheet = ['xls', 'xlsx', 'csv'].includes(ext);
                                                            const FileIcon = isImage
                                                                ? FileImage
                                                                : isSheet
                                                                    ? FileSpreadsheet
                                                                    : isPdf
                                                                        ? FileText
                                                                        : File;
                                                            const iconColor = isImage
                                                                ? 'text-violet-500'
                                                                : isSheet
                                                                    ? 'text-emerald-500'
                                                                    : isPdf
                                                                        ? 'text-red-500'
                                                                        : 'text-slate-400';

                                                            return (
                                                                <li key={doc.id}>
                                                                    {isImage ? (
                                                                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                                                                            <img
                                                                                src={doc.file_url}
                                                                                alt={doc.file_name}
                                                                                className="max-h-48 w-full object-contain p-2"
                                                                            />
                                                                            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
                                                                                <span className="flex items-center gap-1.5 truncate text-xs font-medium text-slate-600">
                                                                                    <FileIcon className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />
                                                                                    {doc.file_name}
                                                                                </span>
                                                                                <a
                                                                                    href={doc.file_url}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className="ml-2 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                                                    title="Unduh"
                                                                                >
                                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                                </a>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                                                                            <span className="flex items-center gap-2 truncate text-xs font-medium text-slate-700">
                                                                                <FileIcon className={`h-4 w-4 shrink-0 ${iconColor}`} />
                                                                                {doc.file_name}
                                                                            </span>
                                                                            <a
                                                                                href={doc.file_url}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="ml-3 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                                                title="Unduh / Buka"
                                                                            >
                                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-slate-400">Tidak ada file yang diunggah.</p>
                                                )}
                                            </div>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <DialogClose render={<Button variant="outline">Tutup</Button>} />
                                        </DialogFooter>
                                    </DialogContent>
                                </form>
                            </Dialog>
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
