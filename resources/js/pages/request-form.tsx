import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import HomeLayout from "./layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, CheckCircle2, CalendarDays, Clock3, Building2, UserRound, Mail, Phone, MessageSquareText, FileText, MapPin } from "lucide-react";
import { Link, useForm, usePage } from "@inertiajs/react";

type Location = {
    id: number;
    nama_lokasi: string;
};

type Schedule = {
    id: number;
    tanggal: string;
    waktu_awal: string;
    waktu_akhir: string;
    pelaksanaan: "Luring" | "Daring" | "Hybrid";
    lokasi_konsultasi_id: number | null;
    lokasi_nama?: string | null;
    kuota_konsultasi: number;
    sisa_kuota: number;
};

type PageProps = {
    locations: Location[];
    schedules: Schedule[];
    flash?: {
        success?: string;
    };
};

export default function RequestForm() {
    const { locations, schedules, flash } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_pemohon: "",
        jabatan_pemohon: "",
        instansi: "",
        tanggal_konsultasi: "",
        waktu_konsultasi: "",
        pelaksanaan: "Daring",
        lokasi_konsultasi_id: "",
        rencana_kegiatan: "",
        kabupaten: "",
        provinsi: "",
        nomor_telepon: "",
        email: "",
        permintaan_khusus: "",
        setuju_syarat_ketentuan: false,
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        post('/request-form', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const activeSchedules = schedules.filter((item) => item.sisa_kuota > 0);
    const needsLocation = data.pelaksanaan === 'Luring' || data.pelaksanaan === 'Hybrid';

    const matchingSchedules = activeSchedules.filter((item) => {
        if (item.pelaksanaan !== data.pelaksanaan) {
            return false;
        }

        if (data.pelaksanaan === 'Daring') {
            return item.lokasi_konsultasi_id === null;
        }

        return String(item.lokasi_konsultasi_id ?? '') === data.lokasi_konsultasi_id;
    });

    const dateOptions = Array.from(new Set(matchingSchedules.map((item) => item.tanggal)));

    const timeOptions = matchingSchedules.filter((item) => item.tanggal === data.tanggal_konsultasi);

    return (
        <HomeLayout>
            <div className="w-full max-w-5xl mx-auto py-12 px-4">
                
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Beranda
                    </Link>
                </div>

                <div className="relative">
                    {/* Glowing effect behind card */}
                    <div className="absolute -inset-1 rounded-2xl bg-linear-to-br from-blue-400 to-indigo-500 opacity-20 blur-xl"></div>
                    
                    <Card className="relative shadow-2xl border-slate-200/60 backdrop-blur-xl bg-slate-100/80 overflow-hidden">
                        
                        {/* Top Accent Line */}
                        <div className="h-2 w-full bg-linear-to-r from-blue-500 to-indigo-500"></div>

                        <CardHeader className="space-y-3 pb-8 pt-10 px-8 sm:px-12 text-center">
                            <CardTitle className="text-3xl font-extrabold text-slate-900">
                                Formulir Konsultasi
                            </CardTitle>
                            <CardDescription className="text-slate-500 text-base max-w-lg mx-auto">
                                Mohon lengkapi data di bawah ini. Tim analis kami akan memproses permohonan Anda setelah form dikirim.
                            </CardDescription>
                        </CardHeader>

                        {flash?.success && (
                            <div className="mx-8 sm:mx-12 mt-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                                <span>{flash.success}</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <CardContent className="space-y-6 px-8 sm:px-12 pb-10 pt-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                                    <div className="space-y-3">
                                        <Label htmlFor="nama_pemohon" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                            <UserRound className="h-4 w-4 text-slate-400" />
                                            Nama Pemohon
                                        </Label>
                                        <Input id="nama_pemohon" value={data.nama_pemohon} onChange={(e) => setData('nama_pemohon', e.target.value)} placeholder="Masukkan nama lengkap" className="h-12 bg-white/50 focus-visible:bg-white text-md transition-colors" />
                                        {errors.nama_pemohon && <p className="text-sm text-red-500">{errors.nama_pemohon}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="jabatan_pemohon" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-slate-400" />
                                            Jabatan Pemohon
                                        </Label>
                                        <Input id="jabatan_pemohon" value={data.jabatan_pemohon} onChange={(e) => setData('jabatan_pemohon', e.target.value)} placeholder="Contoh: Manajer Operasional" className="h-12 bg-white/50 focus-visible:bg-white text-md transition-colors" />
                                        {errors.jabatan_pemohon && <p className="text-sm text-red-500">{errors.jabatan_pemohon}</p>}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="instansi" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-slate-400" />
                                        Instansi / Perusahaan
                                    </Label>
                                    <Input id="instansi" value={data.instansi} onChange={(e) => setData('instansi', e.target.value)} placeholder="Nama instansi atau perusahaan" className="h-12 bg-white/50 focus-visible:bg-white text-md transition-colors" />
                                    {errors.instansi && <p className="text-sm text-red-500">{errors.instansi}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                                    <div className="space-y-3">
                                        <Label htmlFor="tanggal_konsultasi" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-slate-400" />
                                            Tanggal Konsultasi
                                        </Label>
                                        <select
                                            id="tanggal_konsultasi"
                                            value={data.tanggal_konsultasi}
                                            onChange={(e) => {
                                                setData('tanggal_konsultasi', e.target.value);
                                                setData('waktu_konsultasi', '');
                                            }}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white/50 px-4 text-sm text-slate-700 outline-none transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-indigo-200"
                                        >
                                            <option value="">Pilih tanggal jadwal</option>
                                            {dateOptions.map((tanggal) => (
                                                <option key={tanggal} value={tanggal}>
                                                    {new Date(tanggal).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.tanggal_konsultasi && <p className="text-sm text-red-500">{errors.tanggal_konsultasi}</p>}
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="waktu_konsultasi" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                            <Clock3 className="h-4 w-4 text-slate-400" />
                                            Waktu Konsultasi
                                        </Label>
                                        <select
                                            id="waktu_konsultasi"
                                            value={data.waktu_konsultasi}
                                            onChange={(e) => setData('waktu_konsultasi', e.target.value)}
                                            disabled={!data.tanggal_konsultasi}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white/50 px-4 text-sm text-slate-700 outline-none transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                                        >
                                            <option value="">{data.tanggal_konsultasi ? 'Pilih waktu jadwal' : 'Pilih tanggal terlebih dahulu'}</option>
                                            {timeOptions.map((slot) => (
                                                <option key={slot.id} value={slot.waktu_awal}>
                                                    {slot.waktu_awal.slice(0, 5)} - {slot.waktu_akhir.slice(0, 5)} · Sisa kuota {slot.sisa_kuota}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.waktu_konsultasi && <p className="text-sm text-red-500">{errors.waktu_konsultasi}</p>}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label htmlFor="rencana_kegiatan" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-400" />
                                        Rencana Kegiatan
                                    </Label>
                                    <Textarea
                                        id="rencana_kegiatan"
                                        value={data.rencana_kegiatan}
                                        onChange={(e) => setData('rencana_kegiatan', e.target.value)}
                                        placeholder="Jelaskan rencana kegiatan yang akan dikonsultasikan"
                                        className="resize-none h-32 bg-white/50 focus-visible:bg-white text-md p-4 transition-colors"
                                    />
                                    {errors.rencana_kegiatan && <p className="text-sm text-red-500">{errors.rencana_kegiatan}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                                    <div className="space-y-3">
                                        <Label htmlFor="kabupaten" className="text-slate-700 font-semibold text-sm">Kabupaten / Kota</Label>
                                        <Input id="kabupaten" value={data.kabupaten} onChange={(e) => setData('kabupaten', e.target.value)} placeholder="Kabupaten atau kota" className="h-12 bg-white/50 focus-visible:bg-white text-md transition-colors" />
                                        {errors.kabupaten && <p className="text-sm text-red-500">{errors.kabupaten}</p>}
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="provinsi" className="text-slate-700 font-semibold text-sm">Provinsi</Label>
                                        <Input id="provinsi" value={data.provinsi} onChange={(e) => setData('provinsi', e.target.value)} placeholder="Provinsi" className="h-12 bg-white/50 focus-visible:bg-white text-md transition-colors" />
                                        {errors.provinsi && <p className="text-sm text-red-500">{errors.provinsi}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                                    <div className="space-y-3">
                                        <Label htmlFor="pelaksanaan" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            Pelaksanaan
                                        </Label>
                                        <select
                                            id="pelaksanaan"
                                            value={data.pelaksanaan}
                                            onChange={(e) => {
                                                setData('pelaksanaan', e.target.value);
                                                setData('tanggal_konsultasi', '');
                                                setData('waktu_konsultasi', '');
                                                if (e.target.value === 'Daring') {
                                                    setData('lokasi_konsultasi_id', '');
                                                }
                                            }}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white/50 px-4 text-sm text-slate-700 outline-none transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-indigo-200"
                                        >
                                            <option value="Daring">Daring</option>
                                            <option value="Luring">Luring</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                        {errors.pelaksanaan && <p className="text-sm text-red-500">{errors.pelaksanaan}</p>}
                                    </div>

                                    <div className="space-y-3 sm:col-span-2">
                                        <Label htmlFor="lokasi_konsultasi_id" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            Lokasi Konsultasi {needsLocation ? <span className="text-red-500">*</span> : null}
                                        </Label>
                                        <select
                                            id="lokasi_konsultasi_id"
                                            value={data.lokasi_konsultasi_id}
                                            onChange={(e) => {
                                                setData('lokasi_konsultasi_id', e.target.value);
                                                setData('tanggal_konsultasi', '');
                                                setData('waktu_konsultasi', '');
                                            }}
                                            disabled={!needsLocation}
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white/50 px-4 text-sm text-slate-700 outline-none transition-colors focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                                        >
                                            <option value="">{needsLocation ? 'Pilih lokasi konsultasi' : 'Tidak diperlukan untuk pelaksanaan daring'}</option>
                                            {locations.map((location) => (
                                                <option key={location.id} value={location.id}>
                                                    {location.nama_lokasi}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.lokasi_konsultasi_id && <p className="text-sm text-red-500">{errors.lokasi_konsultasi_id}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                                    <div className="space-y-3">
                                        <Label htmlFor="nomor_telepon" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                            No. WhatsApp
                                        </Label>
                                        <Input id="nomor_telepon" value={data.nomor_telepon} onChange={(e) => setData('nomor_telepon', e.target.value)} placeholder="Contoh: 081234567890" className="h-12 bg-white/50 focus-visible:bg-white text-md transition-colors" />
                                        {errors.nomor_telepon && <p className="text-sm text-red-500">{errors.nomor_telepon}</p>}
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="email" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                            Email Address
                                        </Label>
                                        <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="email@perusahaan.com" className="h-12 bg-white/50 focus-visible:bg-white text-md transition-colors" />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label htmlFor="permintaan_khusus" className="text-slate-700 font-semibold text-sm inline-flex items-center gap-2">
                                        <MessageSquareText className="h-4 w-4 text-slate-400" />
                                        Permintaan Khusus
                                    </Label>
                                    <Textarea
                                        id="permintaan_khusus"
                                        value={data.permintaan_khusus}
                                        onChange={(e) => setData('permintaan_khusus', e.target.value)}
                                        placeholder="Opsional: tambahkan kebutuhan atau catatan khusus"
                                        className="resize-none h-28 bg-white/50 focus-visible:bg-white text-md p-4 transition-colors"
                                    />
                                    {errors.permintaan_khusus && <p className="text-sm text-red-500">{errors.permintaan_khusus}</p>}
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.setuju_syarat_ketentuan}
                                            onChange={(e) => setData('setuju_syarat_ketentuan', e.target.checked)}
                                            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-slate-600">
                                            Saya menyetujui syarat dan ketentuan pengajuan konsultasi.
                                        </span>
                                    </label>
                                    {errors.setuju_syarat_ketentuan && <p className="text-sm text-red-500">{errors.setuju_syarat_ketentuan}</p>}
                                </div>

                            </CardContent>

                            <CardFooter className="px-8 sm:px-12 pb-12 pt-0">
                                <Button type="submit" disabled={processing} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all group text-lg rounded-xl disabled:opacity-70">
                                    {processing ? 'Mengirim...' : 'Kirim Permohonan'}
                                    <Send className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </HomeLayout>
    );
}