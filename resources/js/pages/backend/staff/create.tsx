import MainLayout from "../layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, UserRound } from "lucide-react";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function StaffCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        position: "",
        department: "",
        phone: "",
        joined_at: new Date().toISOString().slice(0, 10),
        is_active: true,
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post("/staff");
    }

    return (
        <MainLayout pageTitle="Tambah Staff">
            <Head title="Tambah Staff" />

            <div className="mb-6 flex items-center gap-3">
                <Link href="/staff">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <UserRound className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 leading-none">Tambah Staff</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Daftarkan staff baru dan buat akun pegawai secara otomatis.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 max-w-xl">
                <div className="flex flex-col gap-5">
                    {/* Informational Badge */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-700 font-medium">
                        Akun user dengan role <span className="font-bold underline">pegawai</span> akan dibuat secara otomatis bersamaan dengan data staff ini.
                    </div>

                    {/* User Account Info */}
                    <div className="space-y-4 border-b border-slate-100 pb-5">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">Informasi Akun Pegawai</h2>
                        
                        {/* Name */}
                        <div>
                            <Label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                placeholder="Contoh: Ahmad Subagja"
                                className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                            />
                            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <Label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                placeholder="Contoh: ahmad@kkp.go.id"
                                className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                            />
                            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <Label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                placeholder="Minimal 8 karakter"
                                className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                            />
                            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                        </div>

                        {/* Password Confirmation */}
                        <div>
                            <Label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Konfirmasi Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                placeholder="Ulangi password"
                                className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                            />
                            {errors.password_confirmation && <p className="text-xs text-red-600 mt-1">{errors.password_confirmation}</p>}
                        </div>
                    </div>

                    {/* Staff Details */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">Detail Staff</h2>

                        {/* Position */}
                        <div>
                            <Label htmlFor="position" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Jabatan <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="position"
                                value={data.position}
                                onChange={(e) => setData("position", e.target.value)}
                                placeholder="Contoh: Kepala Seksi"
                                className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                            />
                            {errors.position && <p className="text-xs text-red-600 mt-1">{errors.position}</p>}
                        </div>

                        {/* Department */}
                        <div>
                            <Label htmlFor="department" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Departemen <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="department"
                                value={data.department}
                                onChange={(e) => setData("department", e.target.value)}
                                placeholder="Contoh: Tim Pelayanan Konsultasi"
                                className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                            />
                            {errors.department && <p className="text-xs text-red-600 mt-1">{errors.department}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <Label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                No. Telepon
                            </Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                                placeholder="Contoh: 081234567890"
                                className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                            />
                            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                        </div>

                        {/* Joined At */}
                        <div>
                            <Label htmlFor="joined_at" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Tanggal Bergabung <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="joined_at"
                                type="date"
                                value={data.joined_at}
                                onChange={(e) => setData("joined_at", e.target.value)}
                                className="rounded-xl border-slate-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                            />
                            {errors.joined_at && <p className="text-xs text-red-600 mt-1">{errors.joined_at}</p>}
                        </div>

                        {/* Is Active */}
                        <div className="flex items-center gap-2 pt-1">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData("is_active", checked === true)}
                                className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            />
                            <Label htmlFor="is_active" className="text-sm text-slate-600 cursor-pointer font-normal">
                                Staff aktif
                            </Label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/20"
                        >
                            Simpan Staff
                        </Button>
                        <Link href="/staff">
                            <Button type="button" variant="ghost" className="rounded-xl text-slate-500">
                                Batal
                            </Button>
                        </Link>
                    </div>
                </div>
            </form>
        </MainLayout>
    );
}