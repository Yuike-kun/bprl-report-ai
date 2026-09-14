import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    FileBarChart,
    FileSpreadsheet,
    Filter,
    HelpCircle,
    RotateCcw,
    Search,
    TrendingUp,
    UserCheck,
    XCircle,
} from 'lucide-react';
import ApexCharts from 'apexcharts';
import { Pagination } from '@/components/backend/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SubmissionItem = {
    id: number;
    nama_pemohon: string;
    jabatan_pemohon?: string;
    instansi?: string;
    email: string;
    nomor_telepon?: string;
    rencana_kegiatan?: string;
    status: string;
    created_at: string;
    provinsi?: { name: string };
    kabupaten?: { name: string };
    jadwal?: { lokasi?: { nama_lokasi: string } };
};

type PaginatedSubmissions = {
    data: SubmissionItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type ReportProps = {
    submissions: PaginatedSubmissions;
    filters: {
        year: number;
        date_from?: string;
        date_to?: string;
        status?: string;
        search?: string;
    };
    stats: {
        total: number;
        approved: number;
        pending: number;
        rejected: number;
        berita_acara: number;
    };
    charts: {
        monthly: {
            categories: string[];
            series: { name: string; data: number[] }[];
        };
        status: Record<string, number>;
    };
    availableYears: number[];
};

export default function PermohonanKonsultasiReport({
    submissions,
    filters,
    stats,
    charts,
    availableYears,
}: ReportProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [year, setYear] = useState(filters.year || new Date().getFullYear());
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const monthlyChartRef = useRef<HTMLDivElement>(null);
    const statusChartRef = useRef<HTMLDivElement>(null);

    // Initialize monthly trend chart
    useEffect(() => {
        if (!monthlyChartRef.current) return;

        const options: ApexCharts.ApexOptions = {
            chart: {
                type: 'area',
                height: 280,
                toolbar: { show: false },
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            series: charts.monthly.series,
            xaxis: {
                categories: charts.monthly.categories,
                labels: { style: { colors: '#64748b', fontSize: '11px' } },
            },
            yaxis: {
                labels: { style: { colors: '#64748b', fontSize: '11px' } },
            },
            stroke: { curve: 'smooth', width: 3 },
            fill: {
                type: 'gradient',
                gradient: { opacityFrom: 0.45, opacityTo: 0.05 },
            },
            colors: ['#1E63C7'],
            grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
        };

        const chart = new ApexCharts(monthlyChartRef.current, options);
        chart.render();

        return () => chart.destroy();
    }, [charts.monthly]);

    // Initialize status breakdown chart
    useEffect(() => {
        if (!statusChartRef.current) return;

        const labels = Object.keys(charts.status);
        const series = Object.values(charts.status);

        const options: ApexCharts.ApexOptions = {
            chart: {
                type: 'donut',
                height: 280,
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            labels: labels,
            series: series,
            colors: ['#eab308', '#22c55e', '#3b82f6', '#ef4444'],
            legend: { position: 'bottom', fontSize: '12px' },
            dataLabels: { enabled: true },
        };

        const chart = new ApexCharts(statusChartRef.current, options);
        chart.render();

        return () => chart.destroy();
    }, [charts.status]);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/reports/permohonan-konsultasi',
            {
                year,
                date_from: dateFrom,
                date_to: dateTo,
                status,
                search,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setYear(new Date().getFullYear());
        setDateFrom('');
        setDateTo('');
        setStatus('all');
        router.get('/reports/permohonan-konsultasi');
    };

    const handleExportCsv = () => {
        const params = new URLSearchParams({
            year: String(year),
            date_from: dateFrom,
            date_to: dateTo,
            status: status,
            search: search,
        });
        window.location.href = `/reports/permohonan-konsultasi/export-csv?${params.toString()}`;
    };

    const getStatusBadge = (st: string) => {
        const lower = st.toLowerCase();
        if (['disetujui', 'approved', 'selesai'].includes(lower)) {
            return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> Disetujui</span>;
        }
        if (['menunggu', 'pending'].includes(lower)) {
            return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200"><Clock className="h-3 w-3" /> Menunggu</span>;
        }
        if (['ditolak', 'rejected'].includes(lower)) {
            return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200"><XCircle className="h-3 w-3" /> Ditolak</span>;
        }
        if (lower === 'berita_acara') {
            return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200"><FileSpreadsheet className="h-3 w-3" /> Berita Acara</span>;
        }
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{st}</span>;
    };

    return (
        <MainLayout pageTitle="Laporan Permohonan Konsultasi">
            <Head title="Laporan Permohonan Konsultasi" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#123A63] to-[#1E63C7] p-6 text-white shadow-lg">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider">
                            <FileBarChart className="h-4 w-4" />
                            <span>Executive Report</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Laporan Permohonan Konsultasi</h1>
                        <p className="mt-1 text-xs text-blue-100">
                            Ringkasan analitik dan rekapitulasi data permohonan konsultasi penataan ruang laut.
                        </p>
                    </div>

                    <Button
                        onClick={handleExportCsv}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2 shadow-sm font-bold"
                    >
                        <Download className="h-4 w-4" />
                        Ekspor CSV / Excel
                    </Button>
                </div>

                {/* KPI Metrics Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card className="border-slate-200 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total Permohonan</p>
                                <h3 className="text-xl font-bold text-slate-900 mt-1">{stats.total}</h3>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FileBarChart className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">Menunggu</p>
                                <h3 className="text-xl font-bold text-amber-600 mt-1">{stats.pending}</h3>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <Clock className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">Disetujui</p>
                                <h3 className="text-xl font-bold text-emerald-600 mt-1">{stats.approved}</h3>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">Berita Acara</p>
                                <h3 className="text-xl font-bold text-blue-600 mt-1">{stats.berita_acara}</h3>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">Ditolak</p>
                                <h3 className="text-xl font-bold text-red-600 mt-1">{stats.rejected}</h3>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <XCircle className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Toolbar */}
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="pb-3 border-b border-slate-100">
                        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Filter className="h-4 w-4 text-blue-600" />
                            Filter & Pencarian Laporan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun</label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                                >
                                    {availableYears.map((y) => (
                                        <option key={y} value={y}>Tahun {y}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="menunggu">Menunggu</option>
                                    <option value="disetujui">Disetujui</option>
                                    <option value="berita_acara">Berita Acara</option>
                                    <option value="ditolak">Ditolak</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Dari Tanggal</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Sampai Tanggal</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Pencarian Kata Kunci</label>
                                <input
                                    type="text"
                                    placeholder="Pemohon / Instansi / Email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1 py-2">
                                    <Search className="h-3.5 w-3.5" /> Filter
                                </Button>
                                <Button type="button" onClick={handleReset} variant="outline" className="text-xs font-medium py-2">
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-slate-200 shadow-xs">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                    Tren Permohonan Konsultasi per Bulan ({year})
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div ref={monthlyChartRef} className="min-h-[280px]" />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-xs">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-blue-600" />
                                Proporsi Status Permohonan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <div ref={statusChartRef} className="min-h-[280px] w-full" />
                        </CardContent>
                    </Card>
                </div>

                {/* Submissions Data Table */}
                <Card className="border-slate-200 shadow-xs overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-slate-800">
                            Data Permohonan Konsultasi ({submissions.total} Rekor)
                        </CardTitle>
                        <Button
                            onClick={handleExportCsv}
                            variant="outline"
                            size="sm"
                            className="text-xs font-bold gap-1 text-slate-700"
                        >
                            <Download className="h-3.5 w-3.5" /> Unduh Data CSV
                        </Button>
                    </CardHeader>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 uppercase font-semibold">
                                    <th className="p-3 w-12 text-center">No</th>
                                    <th className="p-3">ID & Tanggal</th>
                                    <th className="p-3">Pemohon / Instansi</th>
                                    <th className="p-3">Rencana Kegiatan</th>
                                    <th className="p-3">Lokasi</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {submissions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                                            Tidak ada data permohonan yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.data.map((row, idx) => (
                                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-3 text-center font-medium text-slate-400">
                                                {(submissions.current_page - 1) * submissions.per_page + idx + 1}
                                            </td>
                                            <td className="p-3">
                                                <div className="font-bold text-slate-900">REQ-{String(row.id).padStart(5, '0')}</div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-bold text-slate-800">{row.nama_pemohon}</div>
                                                <div className="text-[11px] text-slate-500">{row.instansi || '-'}</div>
                                                <div className="text-[10.5px] text-slate-400">{row.email}</div>
                                            </td>
                                            <td className="p-3 max-w-xs">
                                                <p className="line-clamp-2 text-slate-600">{row.rencana_kegiatan || '-'}</p>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-slate-700 font-medium">{row.kabupaten?.name || '-'}</div>
                                                <div className="text-[11px] text-slate-400">{row.provinsi?.name || '-'}</div>
                                            </td>
                                            <td className="p-3">
                                                {getStatusBadge(row.status)}
                                            </td>
                                            <td className="p-3 text-right">
                                                <Link
                                                    href={`/master/permohonan-konsultasi/${row.id}`}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-100">
                        <Pagination links={submissions.links} />
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
