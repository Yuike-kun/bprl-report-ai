import Heading from "@/components/backend/heading";
import MainLayout from "@/pages/backend/layout";
import { usePage, Link } from "@inertiajs/react";
import {
    FileText,
    ClipboardList,
    Clock,
    CheckCircle2,
    Calendar,
    UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface RecentTask {
    id: number;
    pemohon: string;
    tipe: string;
    tgl: string;
    status: string;
    color: string;
}

interface PetugasData {
    pendingReviews: number;
    proposalsToProcess: number;
    todayConsultation: number;
    evaluated: number;
    recentTasks: RecentTask[];
}

interface DashboardData {
    petugas: PetugasData;
}

interface UserAuth {
    id: number;
    name: string;
    email: string;
    role: string;
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                      */
/* ------------------------------------------------------------------ */

export default function PegawaiDashboard() {
    const { props } = usePage<{ auth?: { user: UserAuth }; dashboardData?: DashboardData }>();
    const data = props.dashboardData?.petugas;

    const stats = [
        {
            label: "Konsultasi Menunggu Review",
            value: data?.pendingReviews?.toString() || "0",
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50 border-amber-200",
        },
        {
            label: "Proposal KKPRL Perlu Diproses",
            value: data?.proposalsToProcess?.toString() || "0",
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-50 border-blue-200",
        },
        {
            label: "Jadwal Konsultasi Hari Ini",
            value: data?.todayConsultation?.toString() || "0",
            icon: Calendar,
            color: "text-indigo-600",
            bg: "bg-indigo-50 border-indigo-200",
        },
        {
            label: "Selesai Dievaluasi",
            value: data?.evaluated?.toString() || "0",
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-200",
        },
    ];

    const recentTasks = data?.recentTasks || [];

    return (
        <MainLayout pageTitle="Dashboard Pegawai">
            <div className="space-y-8">
                <Heading title="Dashboard Pegawai" description="Panel kerja evaluator dan petugas konsultasi KKPRL" />

                <div className="space-y-8">
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

                    {/* Task List */}
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
                                recentTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all gap-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 text-sm">{task.pemohon}</span>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${task.color}`}>
                                                    {task.status.replace("_", " ")}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 flex items-center gap-3">
                                                <span>Tipe: {task.tipe}</span>
                                                <span>•</span>
                                                <span>Masuk: {task.tgl}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link href={`/berita-acara/pegawai?konsultasi=${task.id}`}>
                                                <Button size="sm" className={`text-xs ${task.status == 'konsultasi' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}>
                                                    {task.status == 'konsultasi' ? 'Proses Berkas' : "Perbarui Berita Acara"}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-500 text-center py-4">
                                    Belum ada permohonan yang membutuhkan tindakan.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}