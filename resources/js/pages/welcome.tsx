import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@inertiajs/react";

export default function Welcome() {
    return (
        <div className="flex justify-center items-center w-screen h-screen">
            <Card className="w-1/2 shadow">
                <CardHeader>
                    <CardTitle>Welcome to BPRL Report AI</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>Generate reports with AI</CardDescription>
                </CardContent>
                <CardFooter>
                    <Link href="/login">
                        <Button>Login</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}