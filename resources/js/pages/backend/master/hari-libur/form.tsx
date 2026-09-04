import MainLayout from '../../layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Holiday = {
    id: number;
    tanggal: string;
    nama: string;
    tipe: 'Nasional' | 'Perusahaan' | 'Custom';
    is_recurring: boolean;
    locked: boolean;
};

type Props = {
    mode: 'create' | 'edit';
    holiday?: Holiday;
};

type FormData = {
    tanggal: string;
    nama: string;
    tipe: Holiday['tipe'];
    is_recurring: boolean;
};

export default function HolidayForm({ mode, holiday }: Props) {
    const isEdit = mode === 'edit';
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        tanggal: holiday?.tanggal?.slice(0, 10) ?? '',
        nama: holiday?.nama ?? '',
        tipe: holiday?.tipe ?? 'Custom',
        is_recurring: holiday?.is_recurring ?? false,
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isEdit && holiday) {
            put(`/master/hari-libur/${holiday.id}`);
        } else {
            post('/master/hari-libur');
        }
    };

    return (
        <MainLayout pageTitle="Master Hari Libur">
            <div className="mx-auto max-w-2xl">
                <Link href="/master/hari-libur" className="mb-5 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke daftar hari libur
                </Link>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-2 bg-linear-to-r from-amber-400 to-orange-500" />
                    <div className="border-b border-slate-100 px-6 py-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Ubah Hari Libur' : 'Tambah Hari Libur'}</h1>
                                <p className="mt-1 text-sm text-slate-500">Atur tanggal non-operasional untuk kalender BPRL.</p>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={submit} className="space-y-5 px-6 py-6">
                        <div>
                            <Label htmlFor="tanggal">Tanggal</Label>
                            <Input id="tanggal" type="date" value={data.tanggal} onChange={(event) => setData('tanggal', event.target.value)} className="mt-2 h-11" />
                            {errors.tanggal && <p className="mt-1 text-sm text-red-600">{errors.tanggal}</p>}
                        </div>
                        <div>
                            <Label htmlFor="nama">Nama hari libur</Label>
                            <Input id="nama" value={data.nama} onChange={(event) => setData('nama', event.target.value)} placeholder="Contoh: Hari Raya Idulfitri" className="mt-2 h-11" />
                            {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
                        </div>
                        <div>
                            <Label htmlFor="tipe">Tipe</Label>
                            <select id="tipe" value={data.tipe} onChange={(event) => setData('tipe', event.target.value as Holiday['tipe'])} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
                                <option value="Nasional">Nasional</option>
                                <option value="Perusahaan">Perusahaan</option>
                                <option value="Custom">Custom</option>
                            </select>
                            {errors.tipe && <p className="mt-1 text-sm text-red-600">{errors.tipe}</p>}
                        </div>
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700">
                            <input type="checkbox" checked={data.is_recurring} onChange={(event) => setData('is_recurring', event.target.checked)} className="h-4 w-4 accent-amber-500" />
                            Ulangi setiap tahun
                        </label>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={processing} className="gap-2 bg-amber-600 text-white hover:bg-amber-700">
                                <Save className="h-4 w-4" /> {processing ? 'Menyimpan...' : isEdit ? 'Perbarui Hari Libur' : 'Simpan Hari Libur'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
