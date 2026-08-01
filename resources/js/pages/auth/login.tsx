import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Activity, ArrowLeft, LogIn } from 'lucide-react';

export default function LoginPage() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 selection:bg-blue-100 selection:text-blue-900 overflow-hidden bg-slate-50">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 flex justify-center items-center">
                <div className="absolute top-[-10%] sm:top-[-20%] right-[-10%] w-[50vw] sm:w-125 h-[50vw] sm:h-125 bg-blue-400/20 rounded-full blur-[80px] sm:blur-[120px]"></div>
                <div className="absolute bottom-[-10%] sm:bottom-[-20%] left-[-10%] w-[60vw] sm:w-150 h-[60vw] sm:h-150 bg-indigo-500/10 rounded-full blur-[80px] sm:blur-[120px]"></div>
            </div>

            <div className="max-w-md w-full relative">

                <div className="mb-6 flex justify-between items-center px-2">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group px-4 py-2 rounded-md hover:bg-slate-100"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Kembali
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1 rounded-sm shadow-xs">
                            <Activity className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm">BPRL AI</span>
                    </div>
                </div>

                <div className="absolute -inset-1 rounded-[24px] bg-linear-to-b from-blue-300 to-indigo-400 opacity-20 blur-xl pointer-events-none"></div>

                <Card className="relative shadow-2xl border-white/40 ring-1 ring-slate-200/50 backdrop-blur-2xl bg-white/80 rounded-2xl overflow-hidden">

                    <div className="h-1.5 w-full bg-linear-to-r from-blue-500 to-indigo-600"></div>

                    <CardHeader className="space-y-2 pb-6 pt-10 px-8 text-center">
                        <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Selamat Datang
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-md">
                            Silakan masuk untuk mengakses panel administrasi.
                        </CardDescription>
                    </CardHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            post('/login');
                        }}
                        noValidate
                    >
                        <CardContent className="space-y-6 px-8 pb-8">
                            <div className="space-y-3">
                                <Label htmlFor="email" className="font-semibold text-slate-700">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    autoFocus
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@bprl.ac.id"
                                    className={`h-12 bg-white/60 focus-visible:bg-white text-md transition-colors ${errors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                                />
                                {errors.email && (
                                    <p className="text-sm font-medium text-red-500 mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="password" className="font-semibold text-slate-700">Kata Sandi</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className={`h-12 bg-white/60 focus-visible:bg-white transition-colors ${errors.password ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                                />
                                {errors.password && (
                                    <p className="text-sm font-medium text-red-500 mt-1">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2.5">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', checked === true)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-5 w-5"
                                    />
                                    <Label htmlFor="remember" className="cursor-pointer font-medium text-slate-600 select-none text-sm leading-none">
                                        Ingat saya
                                    </Label>
                                </div>
                                <span className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-all">
                                    Lupa sandi?
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter className="px-8 pb-10 pt-0">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-all group font-semibold text-md flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </span>
                                ) : (
                                    <>
                                        Masuk
                                        <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
                <p className="text-center text-slate-500 text-sm mt-8">
                    &copy; {new Date().getFullYear()} Balai Penerapan Mutu Produk Perikanan.
                </p>
            </div>
        </div>
    );
}