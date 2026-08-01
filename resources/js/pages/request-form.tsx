import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import HomeLayout from "./layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function RequestForm() {
    return (
        <HomeLayout>
            <div className="w-full max-w-3xl mx-auto py-12 px-4">
                
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Beranda
                    </Link>
                </div>

                <div className="relative">
                    {/* Glowing effect behind card */}
                    <div className="absolute -inset-1 rounded-2xl bg-linear-to-br from-blue-400 to-indigo-500 opacity-20 blur-xl"></div>
                    
                    <Card className="relative shadow-2xl border-slate-200/60 backdrop-blur-xl bg-white/80 overflow-hidden">
                        
                        {/* Top Accent Line */}
                        <div className="h-2 w-full bg-linear-to-r from-blue-500 to-indigo-500"></div>

                        <CardHeader className="space-y-3 pb-8 pt-10 px-8 sm:px-12 text-center">
                            <CardTitle className="text-3xl font-extrabold text-slate-900">
                                Formulir Konsultasi
                            </CardTitle>
                            <CardDescription className="text-slate-500 text-base max-w-lg mx-auto">
                                Mohon lengkapi data di bawah ini. Tim analis kami akan segera memproses permohonan Anda menggunakan sistem AI BPRL.
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-6 px-8 sm:px-12 pb-10">
                            
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-slate-700 font-semibold text-sm">Nama Lengkap</Label>
                                <Input id="name" placeholder="Masukkan nama lengkap Anda..." className="h-12 bg-white/50 focus-visible:bg-white text-md transition-colors" />
                            </div>
                            
                            <div className="space-y-3">
                                <Label htmlFor="agency" className="text-slate-700 font-semibold text-sm">Instansi / Perusahaan</Label>
                                <Input id="agency" placeholder="Nama instansi atau perusahaan..." className="h-12 bg-white/50 focus-visible:bg-white text-md transition-colors" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                                <div className="space-y-3">
                                    <Label htmlFor="phone" className="text-slate-700 font-semibold text-sm">No. WhatsApp</Label>
                                    <Input id="phone" placeholder="Contoh: 081234567890" className="h-12 bg-white/50 focus-visible:bg-white text-md transition-colors" />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">Email Address</Label>
                                    <Input id="email" type="email" placeholder="email@perusahaan.com" className="h-12 bg-white/50 focus-visible:bg-white text-md transition-colors" />
                                </div>
                            </div>
                            
                            <div className="space-y-3 pt-2">
                                <Label htmlFor="topic" className="text-slate-700 font-semibold text-sm">Topik / Kebutuhan Konsultasi</Label>
                                <Textarea 
                                    id="topic" 
                                    placeholder="Jelaskan secara detail mengenai produk perikanan yang ingin dikonsultasikan..." 
                                    className="resize-none h-32 bg-white/50 focus-visible:bg-white text-md p-4 transition-colors" 
                                />
                            </div>

                        </CardContent>
                        
                        <CardFooter className="px-8 sm:px-12 pb-12 pt-0">
                            <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all group text-lg rounded-xl">
                                Kirim Permohonan
                                <Send className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </HomeLayout>
    );
}