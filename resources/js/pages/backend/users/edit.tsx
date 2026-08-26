import MainLayout from "../layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, UserRound } from "lucide-react";
import { FormEvent } from "react";
import { ROLES } from "./const";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import SignaturePad from "@/components/signature-pad";

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    signature?: string | null;
};

type Props = {
    user: User;
};

export default function UsersEdit({ user }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: "",
        password_confirmation: "",
        role: user.role,
        signature: user.signature || "",
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        put(`/users/${user.id}`);
    }

    return (
        <MainLayout pageTitle="Edit User">
            <Head title="Edit User" />

            <div className="mb-6 flex items-center gap-3">
                <Link href="/users">
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
                    <h1 className="text-xl font-bold text-slate-900 leading-none">Edit User</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Perbarui data {user.name}.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 max-w-xl">
                <div className="flex flex-col gap-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Nama
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={e => setData("name", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={e => setData("email", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Role
                        </label>
                        <Select items={ROLES} onValueChange={(e: any) => setData("role", e)}>
                            <SelectTrigger className="w-full max-w-48" value={data.role}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Role</SelectLabel>
                                    {ROLES.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Password <span className="text-slate-400 font-normal">(kosongkan jika tidak diubah)</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={e => setData("password", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Konfirmasi Password
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={e => setData("password_confirmation", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <SignaturePad
                            value={data.signature}
                            onChange={(val) => setData("signature", val)}
                            error={errors.signature}
                            label="Tanda Tangan"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/20"
                        >
                            Simpan Perubahan
                        </Button>
                        <Link href="/master/users">
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