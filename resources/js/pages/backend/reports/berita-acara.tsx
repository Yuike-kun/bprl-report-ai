import { router } from '@inertiajs/react';
import ApexCharts from 'apexcharts';
import {
    Calendar,
    Download,
    Eye,
    FileCheck,
    FileSpreadsheet,
    Filter,
    RotateCcw,
    Search,
    TrendingUp,
    User,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Heading from '@/components/backend/heading';
import { PaginatedTable } from '@/components/backend/paginated-table';
import { Pagination } from '@/components/backend/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '../layout';

type BeritaAcaraRecord = {
    id: number;
    berita_acara_number?: string;
    consultation_date?: string;
    requester_name?: string;
    requester_position?: string;
    legal_entity_name?: string;
    contact_email?: string;
    activity_type?: string;
    location?: string;
    water_name?: string;
    status?: string;
    staff1?: { user?: { name: string } };
};

type PaginatedBeritaAcara = {
    data: BeritaAcaraRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type BeritaAcaraReportProps = {
    records: PaginatedBeritaAcara;
    filters: {
        year: number;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
    stats: {
        total: number;
        this_month: number;
        this_year: number;
    };
    charts: {
        monthly: {
            categories: string[];
            series: { name: string; data: number[] }[];
        };
    };
    availableYears: number[];
};

const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-200';

export default function BeritaAcaraReport({
    records,
    filters,
    stats,
    charts,
    availableYears,
}: BeritaAcaraReportProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [year, setYear] = useState(filters.year || new Date().getFullYear());
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const monthlyChartRef = useRef<HTMLDivElement>(null);

    // Initialize monthly chart
    useEffect(() => {
        if (!monthlyChartRef.current) {
return;
}

        const options: ApexCharts.ApexOptions = {
            chart: {
                type: 'bar',
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
            colors: ['#6366f1'],
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    columnWidth: '45%',
                },
            },
            grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
            tooltip: { theme: 'light' },
        };

        const chart = new ApexCharts(monthlyChartRef.current, options);
        chart.render();

        return () => chart.destroy();
    }, [charts.monthly]);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) {
e.preventDefault();
}

        router.get(
            '/reports/berita-acara',
            {
                year,
                date_from: dateFrom,
                date_to: dateTo,
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
        router.get('/reports/berita-acara');
    };

    const handleExportCsv = () => {
        const params = new URLSearchParams({
            year: String(year),
            date_from: dateFrom,
            date_to: dateTo,
            search: search,
        });
        window.location.href = `/reports/berita-acara/export-csv?${params.toString()}`;
    };

    const statCards = [
        { label: 'Total Berita Acara Diterbitkan', value: stats.total, icon: FileCheck, gradient: 'from-indigo-500 to-indigo-700' },
        { label: 'Diterbitkan Bulan Ini', value: stats.this_month, icon: Calendar, gradient: 'from-emerald-500 to-emerald-700' },
        { label: `Total Tahun Ini (${new Date().getFullYear()})`, value: stats.this_year, icon: TrendingUp, gradient: 'from-blue-500 to-blue-700' },
    ];

    const baseNumber = records.from ?? 0;

    return (
        <MainLayout pageTitle="Laporan Berita Acara Konsultasi">
            <Heading
                icon={FileSpreadsheet}
                title="Laporan Berita Acara Konsultasi"
                description="Rekapitulasi penerbitan Berita Acara hasil pendampingan & konsultasi KKPRL."
            >
                <Button onClick={handleExportCsv} variant="outline" className="gap-2 text-xs font-bold">
                    <Download className="h-3.5 w-3.5" />
                    Ekspor CSV
                </Button>
            </Heading>

            <div className="space-y-6">
                {/* KPI Metrics */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {statCards.map((item, idx) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={idx}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.gradient}`} />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-slate-500">{item.label}</p>
                                        <p className="text-3xl font-extrabold tracking-tight text-slate-900">{item.value}</p>
                                    </div>
                                    <div
                                        className={`rounded-xl bg-gradient-to-br ${item.gradient} p-3 shadow-md transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <Icon className="h-5 w-5 text-white" />
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
                        <CardDescription>Persempit data berdasarkan tahun, rentang tanggal, atau kata kunci</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleFilter} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Tahun</label>
                                <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputCls}>
                                    {availableYears.map((y) => (
                                        <option key={y} value={y}>Tahun {y}</option>
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
                                    placeholder="No BA / Pemohon / Perusahaan..."
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

                {/* Monthly Issuance Volume Chart */}
                <Card className="border-slate-200/70 shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <TrendingUp className="h-4 w-4 text-indigo-600" />
                            Jumlah Penerbitan Berita Acara per Bulan ({year})
                        </CardTitle>
                        <CardDescription>Volume dokumen Berita Acara yang diterbitkan setiap bulan</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div ref={monthlyChartRef} className="min-h-[280px]" />
                    </CardContent>
                </Card>

                {/* Data Table */}
                <PaginatedTable
                    hideSearchInput
                    searchValue=""
                    onSearchChange={() => {}}
                    summary={
                        <>
                            Menampilkan{' '}
                            <span className="font-semibold text-slate-600">
                                {records.from ?? 0}-{records.to ?? 0}
                            </span>{' '}
                            dari <span className="font-semibold text-slate-600">{records.total}</span> dokumen
                        </>
                    }
                    tableHead={
                        <tr className="border-b border-slate-100 bg-slate-50/60">
                            <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">#</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Nomor &amp; Tanggal BA</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Pemohon &amp; Perusahaan</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Jenis Kegiatan</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Lokasi / Perairan</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Petugas Pendamping</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase">Aksi</th>
                        </tr>
                    }
                    isEmpty={records.data.length === 0}
                    emptyState={
                        <tr>
                            <td colSpan={7} className="py-16 text-center text-slate-400">
                                <Search className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                                <p className="font-medium">Tidak ada Berita Acara yang sesuai dengan filter.</p>
                            </td>
                        </tr>
                    }
                    pagination={
                        records.last_page > 1 ? (
                            <Pagination
                                links={records.links}
                                currentPage={records.current_page}
                                lastPage={records.last_page}
                                onNavigate={(url) => router.get(url)}
                            />
                        ) : null
                    }
                >
                    {records.data.map((row, idx) => (
                        <tr key={row.id} className="group transition-colors hover:bg-slate-50/70">
                            <td className="px-5 py-4 font-mono text-xs text-slate-400">{baseNumber + idx}</td>
                            <td className="px-5 py-4">
                                <p className="font-semibold text-slate-800">{row.berita_acara_number || `BA-${row.id}`}</p>
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    {row.consultation_date ? new Date(row.consultation_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                </p>
                            </td>
                            <td className="px-5 py-4">
                                <p className="font-semibold text-slate-800">{row.requester_name || '-'}</p>
                                <p className="text-xs font-medium text-slate-500">{row.legal_entity_name || '-'}</p>
                                <p className="mt-0.5 text-[11px] text-slate-400">{row.contact_email || '-'}</p>
                            </td>
                            <td className="px-5 py-4">
                                <p className="font-medium text-slate-700">{row.activity_type || '-'}</p>
                            </td>
                            <td className="px-5 py-4">
                                <p className="font-medium text-slate-700">{row.water_name || row.location || '-'}</p>
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{row.staff1?.user?.name || '-'}</span>
                                </div>
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex items-center justify-center gap-1.5">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Lihat Berita Acara"
                                        className="h-8 w-8 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                                        onClick={() => router.visit('/berita-acara')}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </PaginatedTable>
            </div>
        </MainLayout>
    );
}
