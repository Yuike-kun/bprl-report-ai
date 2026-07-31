import MainLayout from "../layout";
import { useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FormEventHandler, useRef, useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

function UpdateProfileInformationForm({ user, status }: { user: any, status?: string }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/profile');
    };

    return (
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-blue-500 to-indigo-500"></div>
            <CardHeader className="bg-white">
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-600">
                    Profile Information
                </CardTitle>
                <CardDescription>
                    Update your account's profile information and email address.
                </CardDescription>
            </CardHeader>
            <CardContent className="bg-white">
                <form onSubmit={submit} className="space-y-6 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <Button disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all duration-300">
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

function UpdatePasswordForm() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put('/profile/password', {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-purple-500 to-pink-500"></div>
            <CardHeader className="bg-white">
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-600">
                    Update Password
                </CardTitle>
                <CardDescription>
                    Ensure your account is using a long, random password to stay secure.
                </CardDescription>
            </CardHeader>
            <CardContent className="bg-white">
                <form onSubmit={updatePassword} className="space-y-6 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="current_password">Current Password</Label>
                        <Input
                            id="current_password"
                            ref={currentPasswordInput}
                            type="password"
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            autoComplete="current-password"
                        />
                        {errors.current_password && <p className="text-sm text-red-500 mt-1">{errors.current_password}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            ref={passwordInput}
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            autoComplete="new-password"
                        />
                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && <p className="text-sm text-red-500 mt-1">{errors.password_confirmation}</p>}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <Button disabled={processing} className="bg-slate-800 hover:bg-slate-900 text-white shadow-md transition-all duration-300">
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
                    <p className="text-slate-500">Manage your profile details and security settings.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 max-w-6xl">
                    <div className="flex flex-col gap-8">
                        <UpdateProfileInformationForm user={user} status={props.status} />
                    </div>
                    <div className="flex flex-col gap-8">
                        <UpdatePasswordForm />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
