import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileCheck,
    FileSpreadsheet,
    FileText,
    Filter,
    RotateCcw,
    Search,
    TrendingUp,
    User,
} from 'lucide-react';
import ApexCharts from 'apexcharts';
import { Pagination } from '@/components/backend/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        if (!monthlyChartRef.current) return;

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
                labels: { style: { colors: '#64748b', fontSize: '11px' } },
            },
            yaxis: {
                labels: { style: { colors: '#64748b', fontSize: '11px' } },
            },
            colors: ['#1F4E79'],
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    columnWidth: '45%',
                },
            },
            grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
        };

        const chart = new ApexCharts(monthlyChartRef.current, options);
        chart.render();

        return () => chart.destroy();
    }, [charts.monthly]);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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

    return (
        <MainLayout pageTitle="Laporan Berita Acara Konsultasi">
            <Head title="Laporan Berita Acara Konsultasi" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#123A63] to-[#1E63C7] p-6 text-white shadow-lg">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider">
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Executive Report</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Laporan Berita Acara Konsultasi</h1>
                        <p className="mt-1 text-xs text-blue-100">
                            Rekapitulasi penerbitan Berita Acara hasil pendampingan & konsultasi KKPRL.
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

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-slate-200 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total Berita Acara Diterbitkan</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <FileCheck className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">Diterbitkan Bulan Ini</p>
                                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.this_month}</h3>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Calendar className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total Tahun Ini ({new Date().getFullYear()})</p>
                                <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.this_year}</h3>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <TrendingUp className="h-6 w-6" />
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
                        <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                                    placeholder="No BA / Pemohon / Perusahaan..."
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

                {/* Monthly Issuance Volume Chart */}
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                            Jumlah Penerbitan Berita Acara per Bulan ({year})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div ref={monthlyChartRef} className="min-h-[280px]" />
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card className="border-slate-200 shadow-xs overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-slate-800">
                            Rekap Berita Acara Konsultasi ({records.total} Dokumen)
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
                                    <th className="p-3">Nomor & Tanggal BA</th>
                                    <th className="p-3">Pemohon & Perusahaan</th>
                                    <th className="p-3">Jenis Kegiatan</th>
                                    <th className="p-3">Lokasi / Perairan</th>
                                    <th className="p-3">Petugas Pendamping</th>
                                    <th className="p-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {records.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                                            Tidak ada Berita Acara yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                ) : (
                                    records.data.map((row, idx) => (
                                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-3 text-center font-medium text-slate-400">
                                                {(records.current_page - 1) * records.per_page + idx + 1}
                                            </td>
                                            <td className="p-3">
                                                <div className="font-bold text-slate-900">{row.berita_acara_number || `BA-${row.id}`}</div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    {row.consultation_date ? new Date(row.consultation_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-bold text-slate-800">{row.requester_name || '-'}</div>
                                                <div className="text-[11px] text-slate-500">{row.legal_entity_name || '-'}</div>
                                                <div className="text-[10.5px] text-slate-400">{row.contact_email || '-'}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-slate-800 font-medium">{row.activity_type || '-'}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-slate-700 font-medium">{row.water_name || row.location || '-'}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                                    <span>{row.staff1?.user?.name || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">
                                                <Link
                                                    href={`/berita-acara`}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                                >
                                                    <Eye className="h-3 w-3" /> Lihat
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-100">
                        <Pagination links={records.links} />
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
