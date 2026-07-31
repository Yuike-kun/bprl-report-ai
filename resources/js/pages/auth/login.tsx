import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginPage() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    return (
        <div className="flex justify-center items-center w-screen h-screen">
            <Card className="w-full max-w-sm shadow">
                <CardHeader>
                    <CardTitle>BPRL Admin</CardTitle>
                    <CardDescription>Masuk ke panel administrasi</CardDescription>
                </CardHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        post('/login');
                    }}
                    noValidate
                >
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Alamat Email</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                autoFocus
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="admin@bprl.ac.id"
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Kata Sandi</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked === true)}
                            />
                            <Label htmlFor="remember" className="cursor-pointer font-normal">
                                Ingat saya
                            </Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={processing} className="w-full">
                            {processing ? 'Memproses...' : 'Masuk'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}