import { Link, router } from "@inertiajs/react";
import MainLayout from "@/pages/backend/layout";
import { Plus, Search, Eye, Pencil, Trash2, FileCheck2, ChevronLeft, ChevronRight, FileText, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ApexCharts from "apexcharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
    draft: { label: "Draft", color: "bg-slate-100 text-slate-600" },
    submitted: { label: "Dikirim", color: "bg-blue-100 text-blue-700" },
    under_review: { label: "Ditinjau", color: "bg-amber-100 text-amber-700" },
    approved: { label: "Disetujui", color: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Ditolak", color: "bg-red-100 text-red-700" },
};

const STAGE_BADGE: Record<string, { label: string; color: string }> = {
    konsultasi: { label: "Konsultasi", color: "bg-sky-100 text-sky-700" },
    asistensi: { label: "Asistensi", color: "bg-indigo-100 text-indigo-700" },
};

interface Row {
    id: number;
    status: string;
    consultation_stage: string;
    consultation_date: string;
    berita_acara_number: string;
    requester_name: string;
    staff_1_name: string;
}

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

interface Props {
    rows: { data: Row[]; current_page: number; last_page: number; per_page: number; total: number; links: any[] };
    filters: { search?: string; status?: string };
    chartData?: ChartData;
}

export default function BeritaAcaraIndex({ rows, filters, chartData }: Props) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [status, setStatus] = useState(filters.status ?? "");
    const [showChart, setShowChart] = useState(true);
    const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

    const chartRef = useRef<HTMLDivElement>(null);
    const selectedYear = chartData?.selectedYear ?? new Date().getFullYear();

    useEffect(() => {
        if (!showChart || !chartRef.current || !chartData) return;

        const currentChart = viewMode === 'monthly' ? chartData.monthly : chartData.yearly;

        const options = {
            chart: {
                type: 'line',
                height: 320,
                toolbar: { show: false },
                fontFamily: 'inherit',
            },
            stroke: {
                curve: 'smooth',
                width: 3,
            },
            markers: {
                size: 5,
                hover: {
                    size: 7,
                },
            },
            colors: ['#10b981'],
            xaxis: {
                categories: currentChart.categories,
                labels: { style: { colors: '#64748b', fontSize: '12px', fontWeight: 600 } },
            },
            yaxis: {
                title: { text: 'Jumlah Berita Acara' },
                labels: { style: { colors: '#64748b', fontSize: '12px' } },
                allowDecimals: false,
            },
            tooltip: {
                y: {
                    formatter: (val: number) => `${val} Berita Acara`,
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
        router.get('/berita-acara', {
            search,
            status,
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
                '/berita-acara',
                { search, status },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleDelete = (id: number) => {
        if (!confirm("Hapus data berita acara ini?")) return;
        router.delete(`/berita-acara/${id}`);
    };

    return (
        <MainLayout pageTitle="Berita Acara Konsultasi">
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900">Berita Acara Konsultasi KKPRL</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Manajemen data hasil asistensi &amp; konsultasi KKPRL BPRL Makassar</p>
                    </div>
                </div>

                {/* Collapsible Line Graph Section */}
                <Card className="border-slate-200/80 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3.5">
                        <div className="flex items-center gap-2">
                            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                Grafik Pembuatan Berita Acara
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
                                                    ? 'bg-white text-emerald-700 shadow-xs'
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
                                                    ? 'bg-white text-emerald-700 shadow-xs'
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
                                            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
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

                {/* Filters */}
                <div className="flex flex-wrap gap-3 p-4 bg-white border border-slate-200 rounded-2xl">
                    <div className="flex-1 min-w-48 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama pemohon atau nomor BA..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <select value={status} onChange={(e) => {
                        setStatus(e.target.value);
                        router.get('/berita-acara', { search, status: e.target.value }, { preserveState: true, preserveScroll: true, replace: true });
                    }}
                        className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option value="">Semua Status</option>
                        {Object.entries(STATUS_BADGE).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70">
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor BA</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Pemohon</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tahap</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Staf 1</th>
                                    <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16 text-slate-400">
                                            <FileCheck2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            <p className="font-semibold text-sm">Belum ada data berita acara</p>
                                        </td>
                                    </tr>
                                ) : rows.data.map((row, idx) => {
                                    const status_b = STATUS_BADGE[row.status] ?? { label: row.status, color: "bg-slate-100 text-slate-600" };
                                    const stage_b = STAGE_BADGE[row.consultation_stage] ?? { label: row.consultation_stage, color: "bg-slate-100 text-slate-600" };
                                    return (
                                        <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-5 py-3 text-xs text-slate-400 font-mono">
                                                {(rows.current_page - 1) * rows.per_page + idx + 1}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="text-xs font-mono text-slate-700">
                                                    {row.berita_acara_number || <span className="text-slate-300 italic">—</span>}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-slate-800">{row.requester_name}</td>
                                            <td className="px-5 py-3 text-xs text-slate-600">{row.consultation_date}</td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${stage_b.color}`}>
                                                    {stage_b.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${status_b.color}`}>
                                                    {status_b.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-slate-600">{row.staff_1_name ?? "—"}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <a href={`/berita-acara/${row.id}/pdf`} target="_blank" rel="noreferrer"
                                                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                                                        <FileText className="w-4 h-4" /> Unduh PDF
                                                    </a>
                                                    <Link href={`/berita-acara/${row.id}`}
                                                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <Link href={`/berita-acara/${row.id}/edit`}
                                                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button onClick={() => handleDelete(row.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {rows.last_page > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500">
                                Menampilkan {(rows.current_page - 1) * rows.per_page + 1}–{Math.min(rows.current_page * rows.per_page, rows.total)} dari {rows.total} data
                            </p>
                            <div className="flex gap-1">
                                {rows.links.map((link, i) => (
                                    <button key={i} disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all
                                            ${link.active ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-blue-50 disabled:opacity-40"}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
