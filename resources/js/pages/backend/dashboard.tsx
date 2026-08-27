import Heading from '@/components/backend/heading';
import MainLayout from './layout';
import { usePage, Link } from '@inertiajs/react';
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
    User,
    LayoutGrid,
    List,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';

interface UserAuth {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'pegawai' | 'petugas' | 'pemohon' | string;
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
    loginHistory?: {
        id: number;
        name: string;
        email: string;
        role: string;
        avatar: string | null;
        last_login_at: string | null;
        is_online: boolean;
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
    const { props } = usePage<{
        auth?: { user: UserAuth };
        dashboardData?: DashboardData;
    }>();
    const user = props.auth?.user;
    const role = user?.role || 'pemohon';
    const data = props.dashboardData;

    return (
        <MainLayout pageTitle="Dashboard">
            <div className="space-y-8">
                <Heading
                    title="Dashboard"
                    description="Dashboard"
                    icon={User}
                />
                {role === 'admin' && <AdminDashboardView data={data} />}
                {(role === 'petugas' || role === 'pegawai') && (
                    <PetugasDashboardView data={data} />
                )}
                {role === 'pemohon' && <PemohonDashboardView data={data} />}
            </div>
        </MainLayout>
    );
}

/* ========================================================================== */
/*  1. ADMIN DASHBOARD VIEW                                                    */
/* ========================================================================== */
function AdminDashboardView({ data }: { data?: DashboardData }) {
    const chartRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const categories = data?.chartMonthlyData?.map((item) => item.month) || [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
    ];
    const pemohonSeries = data?.chartMonthlyData?.map(
        (item) => item.Pemohon,
    ) || [0, 0, 0, 0, 0, 0];
    const baSeries = data?.chartMonthlyData?.map(
        (item) => item.BeritaAcara,
    ) || [0, 0, 0, 0, 0, 0];
    const proposalSeries = data?.chartMonthlyData?.map(
        (item) => item.Proposal,
    ) || [0, 0, 0, 0, 0, 0];

    useEffect(() => {
        if (!chartRef.current) return;

        const options = {
            chart: {
                type: 'area',
                height: 340,
                toolbar: { show: false },
                background: 'transparent',
                fontFamily: 'inherit',
            },
            series: [
                { name: 'Jumlah Pemohon', data: pemohonSeries },
                { name: 'Jumlah Berita Acara', data: baSeries },
                { name: 'Jumlah Proposal', data: proposalSeries },
            ],
            colors: ['#6366f1', '#10b981', '#f97316'],
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 3 },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.02,
                    stops: [0, 90, 100],
                },
            },
            grid: {
                borderColor: '#f1f5f9',
                strokeDashArray: 4,
                xaxis: { lines: { show: false } },
            },
            xaxis: {
                categories: categories,
                labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 600 } },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: {
                labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 600 } },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                labels: { colors: '#334155' },
                markers: { size: 6 },
            },
            tooltip: { theme: 'light', x: { show: true } },
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
            title: 'Jumlah Pemohon',
            value: stats?.totalPemohon?.toString() || '0',
            icon: Users,
            gradient: 'from-indigo-500 to-indigo-700',
            glow: 'shadow-indigo-500/25',
        },
        {
            title: 'Jumlah Berita Acara',
            value: stats?.totalBeritaAcara?.toString() || '0',
            icon: FileText,
            gradient: 'from-emerald-500 to-emerald-700',
            glow: 'shadow-emerald-500/25',
        },
        {
            title: 'Jumlah Proposal',
            value: stats?.totalProposal?.toString() || '0',
            icon: FolderCheck,
            gradient: 'from-orange-400 to-orange-600',
            glow: 'shadow-orange-500/25',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Hero stat cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {adminStats.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={index}
                            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} p-6 text-white shadow-lg ${item.glow} transition-transform duration-300 hover:-translate-y-0.5`}
                        >
                            <div
                                className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10"
                                aria-hidden
                            />
                            <div
                                className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/5"
                                aria-hidden
                            />
                            <div className="relative flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                                        {item.title}
                                    </p>
                                    <p className="mt-2 font-mono text-4xl font-extrabold tracking-tight">
                                        {item.value}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur-sm">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Chart card */}
            <Card className="border-slate-200/70 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                        Tren Aktivitas 6 Bulan Terakhir
                    </CardTitle>
                    <CardDescription>
                        Perbandingan jumlah pemohon, berita acara, dan proposal per bulan
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <div ref={chartRef} className="min-h-85 w-full" />
                </CardContent>
            </Card>

            {/* Login History grid (3x4) or List */}
            <Card className="border-slate-200/70 shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <Users className="h-4 w-4 text-indigo-600" />
                            Riwayat Login Pengguna
                        </CardTitle>
                        <CardDescription>
                            Status online dan aktivitas login terakhir dari 12 pengguna terbaru
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-0.5 bg-slate-50 self-start sm:self-auto shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-md p-0 ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                            onClick={() => setViewMode('grid')}
                            title="Tampilan Grid"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-md p-0 ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                            onClick={() => setViewMode('list')}
                            title="Tampilan List"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="">
                    {data?.loginHistory && data.loginHistory.length > 0 ? (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {data.loginHistory.map((u) => {
                                    const initial = u.name?.charAt(0)?.toUpperCase() || 'U';
                                    return (
                                        <div key={u.id} className="relative flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/30 p-3 hover:bg-slate-50 transition-colors shadow-md">
                                            <div className="relative">
                                                <Avatar className="h-10 w-10 ring-2 ring-slate-100">
                                                    {u.avatar && (
                                                        <AvatarImage src={`/storage/${u.avatar}`} className="object-cover" />
                                                    )}
                                                    <AvatarFallback className="bg-slate-800 text-xs font-semibold text-white">
                                                        {initial}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${u.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-bold text-slate-800" title={u.name}>{u.name}</p>
                                                <p className="truncate text-[10px] text-slate-400">{u.email}</p>
                                                <div className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-medium text-slate-600 uppercase tracking-wider">
                                                    {u.role}
                                                </div>
                                                <p className="text-[9px] text-slate-400">
                                                    {u.last_login_at ? new Date(u.last_login_at).toLocaleString("id-ID", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    }) : "-"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {data.loginHistory.map((u) => {
                                    const initial = u.name?.charAt(0)?.toUpperCase() || 'U';
                                    return (
                                        <div key={u.id} className="relative flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/30 p-3 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10 ring-2 ring-slate-100">
                                                        {u.avatar && (
                                                            <AvatarImage src={`/storage/${u.avatar}`} className="object-cover" />
                                                        )}
                                                        <AvatarFallback className="bg-slate-800 text-xs font-semibold text-white">
                                                            {initial}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${u.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-xs font-bold text-slate-800" title={u.name}>{u.name}</p>
                                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-medium text-slate-600 uppercase tracking-wider">{u.role}</span>
                                                    </div>
                                                    <p className="truncate text-[10px] text-slate-400">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] font-medium text-slate-600">
                                                    {u.last_login_at ? new Date(u.last_login_at).toLocaleString("id-ID", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    }) : "-"}
                                                </p>
                                                <p className="text-[9px] text-slate-400">Login Terakhir</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        <p className="py-8 text-center text-xs text-slate-500">
                            Belum ada riwayat login tercatat.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/* ========================================================================== */
/*  2. PETUGAS / PEGAWAI DASHBOARD VIEW                                        */
/* ========================================================================== */
function PetugasDashboardView({ data }: { data?: DashboardData }) {
    const petugasData = data?.petugas;

    const stats = [
        {
            label: 'Konsultasi Menunggu Review',
            value: petugasData?.pendingReviews?.toString() || '0',
            icon: Clock,
            gradient: 'from-amber-400 to-amber-600',
        },
        {
            label: 'Proposal KKPRL Perlu Diproses',
            value: petugasData?.proposalsToProcess?.toString() || '0',
            icon: FileText,
            gradient: 'from-blue-500 to-blue-700',
        },
        {
            label: 'Jadwal Konsultasi Hari Ini',
            value: petugasData?.todayConsultation?.toString() || '0',
            icon: Calendar,
            gradient: 'from-indigo-500 to-indigo-700',
        },
        {
            label: 'Selesai Dievaluasi',
            value: petugasData?.evaluated?.toString() || '0',
            icon: CheckCircle2,
            gradient: 'from-emerald-500 to-emerald-700',
        },
    ];

    const recentTasks = petugasData?.recentTasks || [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Panel Kerja Evaluator / Petugas
                    </h2>
                    <p className="text-xs text-slate-500">
                        Kelola dan evaluasi permohonan serta jadwal konsultasi ruang laut
                    </p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <UserCheck className="h-3.5 w-3.5" /> Tim Evaluator
                </span>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={idx}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                        >
                            <div
                                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.gradient}`}
                            />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500">
                                        {item.label}
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                                        {item.value}
                                    </p>
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

            {/* Task list */}
            <Card className="border-slate-200/70 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <ClipboardList className="h-4 w-4 text-blue-600" />
                            Daftar Tugas Evaluasi Menunggu Kontrol
                        </CardTitle>
                        <CardDescription>
                            Permohonan terbaru yang perlu diverifikasi atau dijadwalkan
                        </CardDescription>
                    </div>
                    <Link href="/master/permohonan-konsultasi">
                        <Button variant="outline" size="sm" className="text-xs">
                            Lihat Semua
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="space-y-3 pt-5">
                    {recentTasks.length > 0 ? (
                        recentTasks.map((task, i) => (
                            <div
                                key={i}
                                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/70 bg-slate-50/40 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/40 sm:flex-row sm:items-center"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-900">
                                            {task.pemohon}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${task.color}`}
                                        >
                                            {task.status}
                                        </span>
                                    </div>
                                    <p className="flex items-center gap-3 text-xs text-slate-500">
                                        <span>Tipe: {task.tipe}</span>
                                        <span>•</span>
                                        <span>Masuk: {task.tgl}</span>
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Link href="/master/permohonan-konsultasi">
                                        <Button
                                            size="sm"
                                            className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-xs text-white shadow-sm hover:from-blue-700 hover:to-blue-800"
                                        >
                                            Proses Berkas
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="py-8 text-center text-xs text-slate-500">
                            Belum ada permohonan yang membutuhkan tindakan.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

/* ========================================================================== */
/*  3. PEMOHON DASHBOARD VIEW                                                  */
/* ========================================================================== */
function PemohonDashboardView({ data }: { data?: DashboardData }) {
    const pemohonData = data?.pemohon;

    const stats = [
        {
            label: 'Permohonan Saya',
            value: pemohonData?.total?.toString() || '0',
            icon: FileText,
            gradient: 'from-blue-500 to-blue-700',
        },
        {
            label: 'Dalam Process Review',
            value: pemohonData?.inReview?.toString() || '0',
            icon: Clock,
            gradient: 'from-amber-400 to-amber-600',
        },
        {
            label: 'Konsultasi Disetujui',
            value: pemohonData?.approved?.toString() || '0',
            icon: CheckCircle2,
            gradient: 'from-emerald-500 to-emerald-700',
        },
        {
            label: 'Draft Ditolak / Perlu Revisi',
            value: pemohonData?.rejected?.toString() || '0',
            icon: AlertCircle,
            gradient: 'from-rose-500 to-rose-700',
        },
    ];

    const recentSubmissions = pemohonData?.recentSubmissions || [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Status Permohonan & Services
                    </h2>
                    <p className="text-xs text-slate-500">
                        Pantau perkembangan berkas KKPRL dan jadwal konsultasi Anda
                    </p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <FolderCheck className="h-3.5 w-3.5" /> Akun Pemohon Active
                </span>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={idx}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                        >
                            <div
                                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.gradient}`}
                            />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500">
                                        {item.label}
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                                        {item.value}
                                    </p>
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

            {/* Submissions + quick actions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="border-slate-200/70 shadow-sm lg:col-span-2">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <Clock className="h-4 w-4 text-blue-600" />
                            Permohonan Terbaru Anda
                        </CardTitle>
                        <CardDescription>
                            Status terkini berkas pengajuan konsultasi Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-5">
                        {recentSubmissions.length > 0 ? (
                            recentSubmissions.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/70 bg-slate-50/40 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/40 sm:flex-row sm:items-center"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-600">
                                                {item.code}
                                            </span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.statusBg}`}
                                            >
                                                {item.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Tanggal Pengajuan: {item.date}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="py-8 text-center text-xs text-slate-500">
                                Belum ada pengajuan proposal KKPRL.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Quick actions */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg">
                    <div
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10"
                        aria-hidden
                    />
                    <CardHeader className="relative border-b border-white/10 pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
                            <Sparkles className="h-4 w-4 text-blue-400" />
                            Layanan Pemohon
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Akses cepat pembuatan pengajuan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-3 pt-4">
                        <Link href="/kkprl-proposal" className="block">
                            <Button className="w-full cursor-pointer justify-start bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Pengajuan Proposal KKPRL
                            </Button>
                        </Link>
                        <Link href="/request-form" className="block">
                            <Button
                                variant="outline"
                                className="w-full cursor-pointer justify-start border-white/15 bg-white/5 text-slate-100 hover:bg-white/10"
                            >
                                <ClipboardList className="mr-2 h-4 w-4 text-indigo-400" />
                                Form Permohonan Konsultasi
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}