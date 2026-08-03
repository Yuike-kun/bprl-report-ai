import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Activity,
    ArrowLeft,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    CircleAlert,
    CircleCheck,
    Keyboard,
    Loader2,
    LogIn,
} from 'lucide-react';

export default function LoginPage({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);

    const trackCapsLock = (event) => {
        if (event.getModifierState) {
            setCapsLockOn(event.getModifierState('CapsLock'));
        }
    };

    const submitForm = (event) => {
        event.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-linear-to-br from-white via-blue-50/60 to-blue-100/70 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            <Link
                href="/"
                className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-white/60 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali
            </Link>

            <div className="relative z-10 w-full max-w-[400px]">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-1 w-full rounded-t-2xl bg-blue-700" />

                    <div className="px-8 pt-9 pb-8">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-700 p-2">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                            <div className="leading-tight">
                                <p className="font-bold text-sm text-slate-900">BPRL AI</p>
                                <p className="text-[11px] text-slate-500">
                                    Balai Penataan Ruang Laut Makassar
                                </p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">
                                Masuk ke akun Anda
                            </h1>
                            <p className="mt-1.5 text-sm text-slate-500">
                                Silakan masuk untuk mengakses panel BPRL AI.
                            </p>
                        </div>

                        {status && (
                            <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
                                <CircleCheck className="w-4 h-4 shrink-0" />
                                {status}
                            </div>
                        )}

                        <form onSubmit={submitForm} noValidate className="mt-6 space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                    Email
                                </Label>
                                <div className="relative group">
                                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        autoFocus
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@kkp.go.id"
                                        aria-invalid={!!errors.email}
                                        className={`h-11 rounded-lg border bg-white pl-10 placeholder:text-slate-400 transition-colors focus-visible:ring-blue-600/20 ${errors.email
                                                ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/20'
                                                : 'border-slate-300 hover:border-slate-400'
                                            }`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="flex items-center gap-1.5 text-sm text-red-600">
                                        <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Kata Sandi */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                                    Kata Sandi
                                </Label>
                                <div className="relative group">
                                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        onKeyDown={trackCapsLock}
                                        onKeyUp={trackCapsLock}
                                        placeholder="••••••••"
                                        aria-invalid={!!errors.password}
                                        className={`h-11 rounded-lg border bg-white pl-10 pr-11 placeholder:text-slate-400 transition-colors focus-visible:ring-blue-600/20 ${errors.password
                                                ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/20'
                                                : 'border-slate-300 hover:border-slate-400'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {capsLockOn && (
                                    <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                                        <Keyboard className="h-3.5 w-3.5 shrink-0" />
                                        Caps Lock aktif
                                    </p>
                                )}
                                {errors.password && (
                                    <p className="flex items-center gap-1.5 text-sm text-red-600">
                                        <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Ingat saya / Lupa sandi */}
                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', checked === true)}
                                        className="border-slate-300 data-[state=checked]:bg-blue-700 data-[state=checked]:border-blue-700"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer text-sm text-slate-600 leading-none select-none"
                                    >
                                        Ingat saya
                                    </Label>
                                </div>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline underline-offset-4 transition-colors"
                                >
                                    Lupa sandi?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-11 w-full rounded-lg bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-medium transition-colors"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Memproses...
                                    </span>
                                ) : (
                                    <>
                                        Masuk
                                        <LogIn className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed">
                    &copy; {new Date().getFullYear()} BPRL Makassar &mdash; Kementerian Kelautan dan Perikanan RI
                    <br />
                    Butuh bantuan?{' '}
                    <a
                        href="mailto:bpsplmakassar@kkp.go.id"
                        className="font-medium text-slate-700 hover:text-blue-700 hover:underline underline-offset-4"
                    >
                        bpsplmakassar@kkp.go.id
                    </a>
                </p>
            </div>
        </div>
    );
}
