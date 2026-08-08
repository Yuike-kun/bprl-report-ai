import MainLayout from "../layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, UserRound } from "lucide-react";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type UserOption = { id: number; name: string; email: string };

type Props = {
    users: UserOption[];
};

export default function StaffCreate({ users }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: "",
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
                    <p className="text-sm text-slate-500 mt-0.5">Daftarkan staff baru ke dalam sistem.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 max-w-xl">
                <div className="flex flex-col gap-5">
                    {/* User */}
                    <div>
                        <Label htmlFor="user_id" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            User <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={data.user_id}
                            onValueChange={(val: string) => setData("user_id", val)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih user..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>User</SelectLabel>
                                    {users.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            {u.name} — {u.email}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.user_id && <p className="text-xs text-red-600 mt-1">{errors.user_id}</p>}
                    </div>

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
                            placeholder="Contoh: Departemen Sumber Daya Manusia"
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

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/20"
                        >
                            Simpan
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