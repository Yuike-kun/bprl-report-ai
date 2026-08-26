import MainLayout from "../layout";
import { useForm, usePage, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SignaturePad from "@/components/signature-pad";
import { FormEventHandler, useRef, useState, ChangeEvent } from "react";
import { CheckCircle2, Camera, Upload, X } from "lucide-react";

/* ─── Avatar Upload ─── */
function AvatarUploadForm({ user }: { user: any }) {
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const initial = user?.name?.charAt(0)?.toUpperCase() || "U";
    const currentAvatarUrl = user?.avatar ? `/storage/${user.avatar}` : null;

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0];
        if (!picked) return;
        if (picked.size > 2 * 1024 * 1024) {
            setError("Ukuran file maksimal 2 MB.");
            return;
        }
        setError(null);
        setFile(picked);
        setPreview(URL.createObjectURL(picked));
    };

    const handleRemovePreview = () => {
        setPreview(null);
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true);
        setSuccess(false);
        setError(null);
        router.post(
            "/profile/avatar",
            { avatar: file },
            {
                forceFormData: true,
                onSuccess: () => {
                    setSuccess(true);
                    setPreview(null);
                    setFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                },
                onError: (errs) => {
                    setError(errs.avatar ?? "Upload gagal. Coba lagi.");
                },
                onFinish: () => setUploading(false),
            }
        );
    };

    return (
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-sky-400 to-blue-500" />
            <CardHeader className="bg-white">
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-600">
                    Foto Profil
                </CardTitle>
                <CardDescription>
                    Upload foto profil Anda. Format: JPG, PNG, GIF, WebP. Maks 2 MB.
                </CardDescription>
            </CardHeader>
            <CardContent className="bg-white">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row items-start gap-6"
                >
                    {/* Avatar with hover-to-change */}
                    <div className="relative shrink-0 group">
                        <Avatar className="h-24 w-24 ring-4 ring-blue-100 shadow-md">
                            {(preview || currentAvatarUrl) && (
                                <AvatarImage
                                    src={preview ?? currentAvatarUrl!}
                                    className="object-cover"
                                />
                            )}
                            <AvatarFallback className="text-2xl font-bold bg-linear-to-br from-blue-600 to-indigo-500 text-white">
                                {initial}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Ganti foto"
                        >
                            <Camera className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-4">
                        <input
                            ref={inputRef}
                            id="avatar-input"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            className="sr-only"
                            onChange={handleFileChange}
                        />

                        {!preview ? (
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-pointer"
                            >
                                <Upload className="w-4 h-4" />
                                Pilih Foto
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-600 truncate max-w-50">
                                    {file?.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleRemovePreview}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                    title="Hapus pilihan"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        {success && (
                            <div className="flex items-center gap-2 text-sm text-green-600 animate-in fade-in slide-in-from-left-4 duration-300">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Foto profil berhasil diperbarui.</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={!file || uploading}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition-all duration-300 disabled:opacity-50"
                        >
                            {uploading ? "Mengunggah..." : "Simpan Foto"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

/* ─── Profile Info ─── */
function UpdateProfileInformationForm({
    user,
    status,
}: {
    user: any;
    status?: string;
}) {
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name ?? "",
            email: user.email ?? "",
            signature: user.signature ?? "",
        });

    const submit = (e: any) => {
        e.preventDefault();
        patch("/profile");
    };

    return (
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="bg-white">
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-600">
                    Informasi Profil
                </CardTitle>
                <CardDescription>
                    Perbarui informasi profil akun Anda, alamat email.
                </CardDescription>
            </CardHeader>
            <CardContent className="bg-white">
                <form onSubmit={submit} className="space-y-6 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            required
                            autoComplete="username"
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Signature Pad Component */}
                    {/* <div className="pt-2">
                        <SignaturePad
                            label="Tanda Tangan Digital"
                            value={data.signature}
                            onChange={(val) => setData("signature", val)}
                            error={errors.signature}
                        />
                    </div> */}

                    <div className="flex items-center gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all duration-300"
                        >
                            Save Changes
                        </Button>

                        {recentlySuccessful && (
                            <div className="flex items-center gap-2 text-sm text-green-600 animate-in fade-in slide-in-from-left-4 duration-300">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Saved.</span>
                            </div>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

/* ─── Password ─── */
function UpdatePasswordForm() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put("/profile/password", {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset("current_password");
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-purple-500 to-pink-500" />
            <CardHeader className="bg-white">
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-600">
                    Ubah Kata Sandi
                </CardTitle>
                <CardDescription>
                    Disarankan menggunakan symbol, angka, huruf besar dan kecil untuk keamanan kata sandi.
                </CardDescription>
            </CardHeader>
            <CardContent className="bg-white">
                <form onSubmit={updatePassword} className="space-y-6 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="current_password">Kata Sandi Saat Ini</Label>
                        <Input
                            id="current_password"
                            ref={currentPasswordInput}
                            type="password"
                            value={data.current_password}
                            onChange={(e) =>
                                setData("current_password", e.target.value)
                            }
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            autoComplete="current-password"
                        />
                        {errors.current_password && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.current_password}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Kata Sandi Baru</Label>
                        <Input
                            id="password"
                            ref={passwordInput}
                            type="password"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            autoComplete="new-password"
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-slate-800 hover:bg-slate-900 text-white shadow-md transition-all duration-300"
                        >
                            Change Password
                        </Button>

                        {recentlySuccessful && (
                            <div className="flex items-center gap-2 text-sm text-green-600 animate-in fade-in slide-in-from-left-4 duration-300">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Password updated.</span>
                            </div>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

/* ─── Page ─── */
export default function EditProfile() {
    const { props } = usePage<any>();
    const user = props.auth?.user;

    return (
        <MainLayout pageTitle="Profile Details">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-slate-900 to-slate-600">
                        Profile Configuration
                    </h1>
                    <p className="text-slate-500">
                        Manage your profile details, security settings, and digital signature.
                    </p>
                </div>

                <div className="max-w-6xl space-y-6">
                    {/* Avatar upload — full width */}
                    <AvatarUploadForm user={user} />

                    {/* Info & password — side by side */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <UpdateProfileInformationForm
                            user={user}
                            status={props.status}
                        />
                        <UpdatePasswordForm />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
