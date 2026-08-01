import HomeLayout from "./layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, CheckCircle2, FileText, MousePointerClick, ShieldCheck, Zap } from "lucide-react";
import { Link } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";

export default function Welcome() {
    return (
        <HomeLayout>
            <div className="flex flex-col items-center justify-center space-y-20 py-10 lg:py-20 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
                
                {/* Hero Section */}
                <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
                    <div className="inline-flex items-center rounded-full border border-blue-200 bg-white/50 backdrop-blur-md px-4 py-2 text-sm font-semibold text-blue-700 shadow-xs mb-4">
                        <span className="relative flex h-2.5 w-2.5 mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                        BPRL Report AI v2.0 is Live
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                        Otomatisasi Analisis <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-500">
                            Konsultasi BPRL
                        </span>
                    </h1>
                    
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Platform cerdas berbasis kecerdasan buatan untuk registrasi, analisis, dan penerbitan laporan konsultasi mutu produk perikanan secara real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/request-form" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/30 text-lg transition-transform hover:scale-105 active:scale-95 group">
                                Mulai Registrasi
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full text-lg border-slate-300 text-slate-700 hover:bg-slate-100 transition-transform hover:scale-105">
                            Pelajari Lebih Lanjut
                        </Button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4 lg:px-0 pt-10">
                    
                    <Card className="bg-white/60 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-8 space-y-4">
                            <div className="bg-amber-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                                <Zap className="h-7 w-7 text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">Proses Cepat</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Form registrasi yang intuitif dan sistem otomasi memangkas waktu tunggu dari berhari-hari menjadi beberapa menit saja.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-8 space-y-4">
                            <div className="bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                                <Bot className="h-7 w-7 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">Analisis AI</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Laporan draf dan rekomendasi konsultasi dihasilkan secara cerdas oleh mesin AI berdasarkan riwayat data.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-md border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-8 space-y-4">
                            <div className="bg-emerald-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck className="h-7 w-7 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">Aman & Terpercaya</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Seluruh data instansi dan informasi konsultasi Anda dienkripsi serta disimpan dengan standar keamanan tinggi.
                            </p>
                        </CardContent>
                    </Card>

                </div>
                
                {/* Stats or Step Section */}
                <div className="w-full max-w-5xl px-4 lg:px-0 py-10 mt-10 border-t border-slate-200/60">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
                        <div className="p-6">
                            <div className="flex justify-center mb-4"><MousePointerClick className="h-8 w-8 text-blue-500" /></div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">1. Registrasi</h4>
                            <p className="text-slate-500">Ajukan permohonan melalui form online dengan mudah.</p>
                        </div>
                        <div className="p-6 pt-10 md:pt-6">
                            <div className="flex justify-center mb-4"><Bot className="h-8 w-8 text-indigo-500" /></div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">2. Analisis AI</h4>
                            <p className="text-slate-500">Sistem memproses dan memberikan draf laporan otomatis.</p>
                        </div>
                        <div className="p-6 pt-10 md:pt-6">
                            <div className="flex justify-center mb-4"><FileText className="h-8 w-8 text-emerald-500" /></div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">3. Unduh Laporan</h4>
                            <p className="text-slate-500">Dapatkan hasil konsultasi Anda yang komprehensif.</p>
                        </div>
                    </div>
                </div>

            </div>
        </HomeLayout>
    );
}