import Heading from "@/components/backend/heading";
import MainLayout from "./layout";
import { usePage, Link } from "@inertiajs/react";
import {
    Users,
    FileText,
    ClipboardList,
    Clock,
    CheckCircle2,
    AlertCircle,
    PlusCircle,
    Shield,
    UserCheck,
    FilePlus2,
    Calendar,
    ArrowRight,
    Sparkles,
    TrendingUp,
    FolderCheck,
    Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

interface UserAuth {
    id: number;
    name: string;
    email: string;
    role: "admin" | "pegawai" | "petugas" | "pemohon" | string;
}

interface DashboardData {
    stats: {
        totalPemohon: number;
        totalBeritaAcara: number;
        totalProposal: number;
        quotaAi: number;
    };
    chartMonthlyData: {
        month: string;
        Pemohon: number;
        BeritaAcara: number;
        Proposal: number;
    }[];
    petugas: {
        pendingReviews: number;
        proposalsToProcess: number;
        todayConsultation: number;
        evaluated: number;
        recentTasks: {
            id: number;
            pemohon: string;
            tipe: string;
            tgl: string;
            status: string;
            color: string;
        }[];
    };
    pemohon: {
        total: number;
        inReview: number;
        approved: number;
        rejected: number;
        recentSubmissions: {
            code: string;
            title: string;
            date: string;
            status: string;
            statusBg: string;
        }[];
    };
}

export default function Dashboard() {
    const { props } = usePage<{ auth?: { user: UserAuth }; dashboardData?: DashboardData }>();
    const user = props.auth?.user;
    const role = user?.role || "pemohon";
    const data = props.dashboardData;

    return (
        <MainLayout pageTitle="Dashboard">
            <div className="space-y-8">
                <Heading title="Dashboard" description="Dashboard" />
                {role === "admin" && <AdminDashboardView data={data} />}
                {(role === "petugas" || role === "pegawai") && <PetugasDashboardView data={data} />}
                {role === "pemohon" && <PemohonDashboardView data={data} />}
            </div>
        </MainLayout>
    );
}

/* ========================================================================== */
/*  1. ADMIN DASHBOARD VIEW WITH REAL BACKEND DATA                             */
/* ========================================================================== */
function AdminDashboardView({ data }: { data?: DashboardData }) {
    const chartRef = useRef<HTMLDivElement>(null);

    const categories = data?.chartMonthlyData?.map((item) => item.month) || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const pemohonSeries = data?.chartMonthlyData?.map((item) => item.Pemohon) || [0, 0, 0, 0, 0, 0];
    const baSeries = data?.chartMonthlyData?.map((item) => item.BeritaAcara) || [0, 0, 0, 0, 0, 0];
    const proposalSeries = data?.chartMonthlyData?.map((item) => item.Proposal) || [0, 0, 0, 0, 0, 0];

    useEffect(() => {
        if (!chartRef.current) return;

        const options = {
            chart: {
                type: "area",
                height: 350,
                toolbar: {
                    show: false,
                },
                background: "transparent",
                fontFamily: "inherit",
            },
            series: [
                {
                    name: "Jumlah Pemohon",
                    data: pemohonSeries,
                },
                {
                    name: "Jumlah Berita Acara",
                    data: baSeries,
                },
                {
                    name: "Jumlah Proposal",
                    data: proposalSeries,
                },
            ],
            // Colors: Blue (#0284c7), Green (#16a34a), Orange (#f97316)
            colors: ["#0284c7", "#16a34a", "#f97316"],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: "smooth",
                width: 3,
            },
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [0, 90, 100],
                },
            },
            grid: {
                borderColor: "#e2e8f0",
                strokeDashArray: 4,
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
            },
            xaxis: {
                categories: categories,
                labels: {
                    style: {
                        colors: "#64748b",
                        fontSize: "12px",
                        fontWeight: 600,
                    },
                },
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "#64748b",
                        fontSize: "12px",
                        fontWeight: 600,
                    },
                },
            },
            legend: {
                position: "top",
                horizontalAlign: "right",
                labels: {
                    colors: "#334155",
                },
                markers: {
                    size: 6,
                },
            },
            tooltip: {
                theme: "light",
                x: {
                    show: true,
                },
            },
        };

        const chart = new ApexCharts(chartRef.current, options);
        chart.render();

        return () => {
            chart.destroy();
        };
    }, [data]);

    const stats = data?.stats;

    const adminStats = [
        {
            title: "Jumlah Pemohon",
            value: stats?.totalPemohon?.toString() || "0",
            bgColor: "bg-sky-500",
            textColor: "text-white",
            borderColor: "border-sky-400",
            ringColor: "ring-sky-200",
        },
        {
            title: "Jumlah Berita Acara",
            value: stats?.totalBeritaAcara?.toString() || "0",
            bgColor: "bg-emerald-600",
            textColor: "text-white",
            borderColor: "border-emerald-500",
            ringColor: "ring-emerald-200",
        },
        {
            title: "Jumlah Proposal",
            value: stats?.totalProposal?.toString() || "0",
            bgColor: "bg-emerald-600",
            textColor: "text-white",
            borderColor: "border-emerald-500",
            ringColor: "ring-emerald-200",
        }
    ];

    return (
        <div className="space-y-10">
            <div className="w-full bg-white shadow-lg rounded-lg p-2">
                <div ref={chartRef} className="w-full min-h-87.5" />
            </div>

            <div className="pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-center">
                    {adminStats.map((item, index) => (
                        <div key={index} className="flex flex-col items-center space-y-4 group">
                            <span className="text-base font-bold text-slate-800 tracking-tight">
                                {item.title}
                            </span>
                            <div className="relative">
                                <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full ${item.bgColor} ${item.textColor} ${item.borderColor} border-4 shadow-lg ring-4 ${item.ringColor} flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
                                    <span className="text-3xl md:text-4xl font-extrabold tracking-tight font-mono">
                                        {item.value}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ========================================================================== */
/*  2. PETUGAS / PEGAWAI DASHBOARD VIEW WITH REAL BACKEND DATA                */
/* ========================================================================== */
function PetugasDashboardView({ data }: { data?: DashboardData }) {
    const petugasData = data?.petugas;

    const stats = [
        { label: "Konsultasi Menunggu Review", value: petugasData?.pendingReviews?.toString() || "0", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
        { label: "Proposal KKPRL Perlu Diproses", value: petugasData?.proposalsToProcess?.toString() || "0", icon: FileText, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
        { label: "Jadwal Konsultasi Hari Ini", value: petugasData?.todayConsultation?.toString() || "0", icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
        { label: "Selesai Dievaluasi", value: petugasData?.evaluated?.toString() || "0", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    ];

    const recentTasks = petugasData?.recentTasks || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Panel Kerja Evaluator / Petugas</h2>
                    <p className="text-xs text-slate-500">Kelola dan evaluasi permohonan serta jadwal konsultasi ruang laut</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    <UserCheck className="w-3.5 h-3.5" /> Tim Evaluator
                </span>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500">{item.label}</p>
                                    <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl border ${item.bg}`}>
                                    <Icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Task List Section */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-blue-600" />
                            Daftar Tugas Evaluasi Menunggu Kontrol
                        </CardTitle>
                        <CardDescription>Permohonan terbaru yang perlu diverifikasi atau dijadwalkan</CardDescription>
                    </div>
                    <Link href="/master/permohonan-konsultasi">
                        <Button variant="outline" size="sm" className="text-xs">
                            Lihat Semua
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    {recentTasks.length > 0 ? (
                        recentTasks.map((task, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 text-sm">{task.pemohon}</span>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${task.color}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 flex items-center gap-3">
                                        <span>Tipe: {task.tipe}</span>
                                        <span>•</span>
                                        <span>Masuk: {task.tgl}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link href="/master/permohonan-konsultasi">
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer">
                                            Proses Berkas
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-slate-500 text-center py-4">Belum ada permohonan yang membutuhkan tindakan.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/* ========================================================================== */
/*  3. PEMOHON DASHBOARD VIEW WITH REAL BACKEND DATA                           */
/* ========================================================================== */
function PemohonDashboardView({ data }: { data?: DashboardData }) {
    const pemohonData = data?.pemohon;

    const stats = [
        { label: "Permohonan Saya", value: pemohonData?.total?.toString() || "0", icon: FileText, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
        { label: "Dalam Process Review", value: pemohonData?.inReview?.toString() || "0", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
        { label: "Konsultasi Disetujui", value: pemohonData?.approved?.toString() || "0", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
        { label: "Draft Ditolak / Perlu Revisi", value: pemohonData?.rejected?.toString() || "0", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
    ];

    const recentSubmissions = pemohonData?.recentSubmissions || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Status Permohonan & Services</h2>
                    <p className="text-xs text-slate-500">Pantau perkembangan berkas KKPRL dan jadwal konsultasi Anda</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <FolderCheck className="w-3.5 h-3.5" /> Akun Pemohon Active
                </span>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500">{item.label}</p>
                                    <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl border ${item.bg}`}>
                                    <Icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Action Grid & Current Submissions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                Permohonan Terbaru Anda
                            </CardTitle>
                            <CardDescription>Status terkini berkas pengajuan konsultasi Anda</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        {recentSubmissions.length > 0 ? (
                            recentSubmissions.map((item, index) => (
                                <div key={index} className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.code}</span>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.statusBg}`}>{item.status}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                        <p className="text-xs text-slate-500">Tanggal Pengajuan: {item.date}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-4">Belum ada pengajuan proposal KKPRL.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Help Card */}
                <Card className="border-slate-200 shadow-sm bg-linear-to-b from-slate-50 to-white">
                    <CardHeader className="pb-3 border-b border-slate-100">
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            Layanan Pemohon
                        </CardTitle>
                        <CardDescription>Akses cepat pembuatan pengajuan</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <Link href="/kkprl-proposal" className="block">
                            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Pengajuan Proposal KKPRL
                            </Button>
                        </Link>
                        <Link href="/request-form" className="block">
                            <Button variant="outline" className="w-full justify-start border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer">
                                <ClipboardList className="w-4 h-4 mr-2 text-indigo-600" />
                                Form Permohonan Konsultasi
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}