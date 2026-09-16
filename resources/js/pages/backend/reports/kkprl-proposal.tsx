import { Link, router } from '@inertiajs/react';
import ApexCharts from 'apexcharts';
import {
    Banknote,
    Building2,
    Download,
    Eye,
    FileBarChart,
    FileSpreadsheet,
    Filter,
    Leaf,
    MapPin,
    RotateCcw,
    Search,
    TrendingUp,
    Users,
    Waves,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Heading from '@/components/backend/heading';
import { PaginatedTable } from '@/components/backend/paginated-table';
import { Pagination } from '@/components/backend/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '../layout';

type ProposalItem = {
    id: number;
    applicant_name?: string;
    company_name?: string;
    email?: string;
    activity_type?: string;
    province?: string;
    regency?: string;
    is_reclamation?: boolean;
    is_business_activity?: boolean;
    investment_value?: number | string;
    created_at: string;
};

type PaginatedProposals = {
    data: ProposalItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type ReportProps = {
    submissions: PaginatedProposals;
    filters: {
        year: number;
        date_from?: string;
        date_to?: string;
        search?: string;
        province?: string;
    };
    stats: {
        total: number;
        investment_total: number;
        local_workers_total: number;
        foreign_workers_total: number;
        reclamation_count: number;
        business_count: number;
    };
    charts: {
        monthly: {
            categories: string[];
            series: { name: string; data: number[] }[];
        };
        activityStatus: Record<string, number>;
        ecosystem: Record<string, number>;
        topProvinces: Record<string, number>;
    };
    availableYears: number[];
    provinces: string[];
};

const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-200';

const formatRupiah = (value: number | string | undefined) => {
    const n = Number(value ?? 0);

    return 'Rp' + n.toLocaleString('id-ID', { maximumFractionDigits: 0 });
};

// Compact form for tight KPI cards, e.g. "Rp2,4 M" / "Rp850 Jt" instead of the
// full "Rp2.400.000.000" which overflows/truncates in a narrow 6-column card.
const formatCompactRupiah = (value: number | string | undefined) => {
    const n = Number(value ?? 0);

    if (n >= 1_000_000_000) {
return 'Rp' + (n / 1_000_000_000).toFixed(1).replace('.', ',') + ' M';
}

    if (n >= 1_000_000) {
return 'Rp' + (n / 1_000_000).toFixed(1).replace('.', ',') + ' Jt';
}

    return formatRupiah(n);
};

export default function KkprlProposalReport({
    submissions,
    filters,
    stats,
    charts,
    availableYears,
    provinces,
}: ReportProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [year, setYear] = useState(filters.year || new Date().getFullYear());
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [province, setProvince] = useState(filters.province || 'all');

    const monthlyChartRef = useRef<HTMLDivElement>(null);
    const activityStatusChartRef = useRef<HTMLDivElement>(null);
    const ecosystemChartRef = useRef<HTMLDivElement>(null);
    const provincesChartRef = useRef<HTMLDivElement>(null);

    // Monthly submission trend
    useEffect(() => {
        if (!monthlyChartRef.current) {
return;
}

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
                labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 600 } },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: {
                labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 600 } },
            },
            stroke: { curve: 'smooth', width: 3 },
            fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.02, stops: [0, 90, 100] },
            },
            colors: ['#6366f1'],
            grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
            tooltip: { theme: 'light' },
        };

        const chart = new ApexCharts(monthlyChartRef.current, options);
        chart.render();

        return () => chart.destroy();
    }, [charts.monthly]);

    // Activity status breakdown (Eksisting / Rencana / Eksisting dan Pengembangan)
    useEffect(() => {
        if (!activityStatusChartRef.current) {
return;
}

        const labels = Object.keys(charts.activityStatus);
        const series = Object.values(charts.activityStatus);

        const options: ApexCharts.ApexOptions = {
            chart: {
                type: 'donut',
                height: 280,
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            labels,
            series,
            colors: ['#6366f1', '#eab308', '#22c55e', '#94a3b8'],
            legend: { position: 'bottom', fontSize: '12px', labels: { colors: '#334155' } },
            dataLabels: { enabled: true },
            stroke: { width: 2, colors: ['#fff'] },
        };

        const chart = new ApexCharts(activityStatusChartRef.current, options);
        chart.render();

        return () => chart.destroy();
    }, [charts.activityStatus]);

    // Ecosystem presence counts
    useEffect(() => {
        if (!ecosystemChartRef.current) {
return;
}

        const labels = Object.keys(charts.ecosystem);
        const series = Object.values(charts.ecosystem);

        const options: ApexCharts.ApexOptions = {
            chart: {
                type: 'bar',
                height: 240,
                toolbar: { show: false },
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            plotOptions: {
                bar: { horizontal: true, borderRadius: 6, barHeight: '55%' },
            },
            series: [{ name: 'Jumlah Proposal', data: series }],
            xaxis: {
                categories: labels,
                labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 600 } },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            colors: ['#16a34a'],
            grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
            dataLabels: { enabled: true, style: { colors: ['#fff'] } },
        };

        const chart = new ApexCharts(ecosystemChartRef.current, options);
        chart.render();

        return () => chart.destroy();
    }, [charts.ecosystem]);

    // Top 5 provinces by proposal count
    useEffect(() => {
        if (!provincesChartRef.current) {
return;
}

        const labels = Object.keys(charts.topProvinces);
        const series = Object.values(charts.topProvinces);

        const options: ApexCharts.ApexOptions = {
            chart: {
                type: 'bar',
                height: 240,
                toolbar: { show: false },
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            plotOptions: {
                bar: { horizontal: true, borderRadius: 6, barHeight: '55%' },
            },
            series: [{ name: 'Jumlah Proposal', data: series }],
            xaxis: {
                categories: labels,
                labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 600 } },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            colors: ['#6366f1'],
            grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
            dataLabels: { enabled: true, style: { colors: ['#fff'] } },
        };

        const chart = new ApexCharts(provincesChartRef.current, options);
        chart.render();

        return () => chart.destroy();
    }, [charts.topProvinces]);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) {
e.preventDefault();
}

        router.get(
            '/reports/kkprl-proposal',
            {
                year,
                date_from: dateFrom,
                date_to: dateTo,
                search,
                province,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setYear(new Date().getFullYear());
        setDateFrom('');
        setDateTo('');
        setProvince('all');
        router.get('/reports/kkprl-proposal');
    };

    const handleExportCsv = () => {
        const params = new URLSearchParams({
            year: String(year),
            date_from: dateFrom,
            date_to: dateTo,
            search: search,
            province: province,
        });
        window.location.href = `/reports/kkprl-proposal/export-csv?${params.toString()}`;
    };

    const yesNoBadge = (value?: boolean) =>
        value ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Ya
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Tidak
            </span>
        );

    const statCards = [
        { label: 'Total Proposal', value: stats.total, icon: FileBarChart, gradient: 'from-indigo-500 to-indigo-700' },
        { label: 'Total Investasi', value: formatCompactRupiah(stats.investment_total), icon: Banknote, gradient: 'from-emerald-500 to-emerald-700' },
        {
            label: 'TK Lokal / Asing',
            value: `${stats.local_workers_total} / ${stats.foreign_workers_total}`,
            icon: Users,
            gradient: 'from-blue-500 to-blue-700',
        },
        { label: 'Reklamasi', value: stats.reclamation_count, icon: Waves, gradient: 'from-cyan-500 to-cyan-700' },
        { label: 'Kegiatan Berusaha', value: stats.business_count, icon: Building2, gradient: 'from-amber-400 to-amber-600' },
        { label: 'Provinsi Terlibat', value: provinces.length, icon: MapPin, gradient: 'from-rose-500 to-rose-700' },
    ];

    const baseNumber = submissions.from ?? 0;

    return (
        <MainLayout pageTitle="Laporan Proposal KKPRL">
            <Heading
                icon={FileBarChart}
                title="Laporan Proposal KKPRL"
                description="Ringkasan analitik dan rekapitulasi data proposal Kesesuaian Kegiatan Pemanfaatan Ruang Laut."
            >
                <Button onClick={handleExportCsv} variant="outline" className="gap-2 text-xs font-bold">
                    <Download className="h-3.5 w-3.5" />
                    Ekspor CSV
                </Button>
            </Heading>

            <div className="space-y-6">
                {/* KPI Metrics */}
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
                    {statCards.map((item, idx) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={idx}
                                title={typeof item.value === 'string' ? item.value : undefined}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.gradient}`} />
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 space-y-2">
                                        <p className="text-xs font-medium text-slate-500">{item.label}</p>
                                        <p className="truncate text-xl font-extrabold tracking-tight text-slate-900">{item.value}</p>
                                    </div>
                                    <div
                                        className={`flex-none rounded-xl bg-gradient-to-br ${item.gradient} p-2.5 shadow-md transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <Icon className="h-4.5 w-4.5 text-white" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filter Toolbar */}
                <Card className="border-slate-200/70 shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <Filter className="h-4 w-4 text-indigo-600" />
                            Filter & Pencarian Laporan
                        </CardTitle>
                        <CardDescription>Persempit data berdasarkan tahun, provinsi, rentang tanggal, atau kata kunci</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleFilter} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Tahun</label>
                                <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputCls}>
                                    {availableYears.map((y) => (
                                        <option key={y} value={y}>Tahun {y}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Provinsi</label>
                                <select value={province} onChange={(e) => setProvince(e.target.value)} className={inputCls}>
                                    <option value="all">Semua Provinsi</option>
                                    {provinces.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Dari Tanggal</label>
                                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Sampai Tanggal</label>
                                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Pencarian Kata Kunci</label>
                                <input
                                    type="text"
                                    placeholder="Pemohon / Perusahaan / Email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className={inputCls}
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <Button type="submit" className="flex-1 gap-1 bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700">
                                    <Search className="h-3.5 w-3.5" /> Filter
                                </Button>
                                <Button type="button" onClick={handleReset} variant="outline" size="icon" title="Reset filter">
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="border-slate-200/70 shadow-sm lg:col-span-2">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                                <TrendingUp className="h-4 w-4 text-indigo-600" />
                                Tren Proposal KKPRL per Bulan ({year})
                            </CardTitle>
                            <CardDescription>Jumlah pengajuan proposal setiap bulan pada tahun terpilih</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div ref={monthlyChartRef} className="min-h-[280px]" />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/70 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                                <FileBarChart className="h-4 w-4 text-indigo-600" />
                                Status Kegiatan
                            </CardTitle>
                            <CardDescription>Eksisting, rencana, atau pengembangan</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center pt-4">
                            <div ref={activityStatusChartRef} className="min-h-[280px] w-full" />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="border-slate-200/70 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                                <Leaf className="h-4 w-4 text-emerald-600" />
                                Keberadaan Ekosistem Pesisir
                            </CardTitle>
                            <CardDescription>Mangrove, lamun, dan terumbu karang</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div ref={ecosystemChartRef} className="min-h-[240px]" />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/70 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                                <MapPin className="h-4 w-4 text-indigo-600" />
                                Top 5 Provinsi
                            </CardTitle>
                            <CardDescription>Wilayah dengan proposal terbanyak</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div ref={provincesChartRef} className="min-h-[240px]" />
                        </CardContent>
                    </Card>
                </div>

                {/* Submissions Data Table */}
                <PaginatedTable
                    hideSearchInput
                    searchValue=""
                    onSearchChange={() => {}}
                    summary={
                        <>
                            Menampilkan{' '}
                            <span className="font-semibold text-slate-600">
                                {submissions.from ?? 0}-{submissions.to ?? 0}
                            </span>{' '}
                            dari <span className="font-semibold text-slate-600">{submissions.total}</span> proposal
                        </>
                    }
                    tableHead={
                        <tr className="border-b border-slate-100 bg-slate-50/60">
                            <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">#</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Tanggal</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Pemohon / Perusahaan</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Jenis Kegiatan</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Lokasi</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Reklamasi</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Berusaha</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Investasi</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Aksi</th>
                        </tr>
                    }
                    isEmpty={submissions.data.length === 0}
                    emptyState={
                        <tr>
                            <td colSpan={9} className="py-16 text-center text-slate-400">
                                <Search className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                                <p className="font-medium">Tidak ada data proposal yang sesuai dengan filter.</p>
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
                    {submissions.data.map((row, idx) => (
                        <tr key={row.id} className="group transition-colors hover:bg-slate-50/70">
                            <td className="px-5 py-4 font-mono text-xs text-slate-400">{baseNumber + idx}</td>
                            <td className="px-5 py-4 text-[11px] whitespace-nowrap text-slate-400">
                                {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                            </td>
                            <td className="px-5 py-4">
                                <p className="font-semibold text-slate-800">{row.applicant_name || '-'}</p>
                                <p className="text-xs font-medium text-slate-500">{row.company_name || '-'}</p>
                                <p className="mt-0.5 text-[11px] text-slate-400">{row.email || '-'}</p>
                            </td>
                            <td className="max-w-xs px-5 py-4">
                                <p className="line-clamp-2 text-slate-600">{row.activity_type || '-'}</p>
                            </td>
                            <td className="px-5 py-4">
                                <p className="font-medium text-slate-700">{row.regency || '-'}</p>
                                <p className="text-[11px] text-slate-400">{row.province || '-'}</p>
                            </td>
                            <td className="px-5 py-4 text-center">{yesNoBadge(row.is_reclamation)}</td>
                            <td className="px-5 py-4 text-center">{yesNoBadge(row.is_business_activity)}</td>
                            <td className="px-5 py-4 font-medium text-slate-700">{formatRupiah(row.investment_value)}</td>
                            <td className="px-5 py-4">
                                <div className="flex items-center justify-center gap-1.5">
                                    <Link href={`/master/kkprl-proposal/${row.id}`} title="Lihat Detail">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <a href={`/pkkprl/download-kkprl-proposal/${row.id}`} title="Unduh Dokumen DOCX" target="_blank" rel="noreferrer">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600">
                                            <FileSpreadsheet className="h-4 w-4" />
                                        </Button>
                                    </a>
                                </div>
                            </td>
                        </tr>
                    ))}
                </PaginatedTable>
            </div>
        </MainLayout>
    );
}
