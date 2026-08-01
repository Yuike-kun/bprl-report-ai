import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { ReactNode, useEffect, useState } from "react";
import { Activity } from "lucide-react";

function Navbar({ scrolled }: { scrolled: boolean }) {
    return (
        <nav 
            className={`fixed w-full z-50 transition-all duration-300 ${
                scrolled 
                    ? "bg-white/80 backdrop-blur-md border-b border-slate-200/50 py-3 shadow-sm" 
                    : "bg-transparent py-5"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                        <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700">
                        BPRL AI
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Masuk
                    </Link>
                    <Link href="/request-form">
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-full px-6">
                            Ajukan Permohonan
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default function HomeLayout({ children }: { children: ReactNode }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 relative selection:bg-blue-100 selection:text-blue-900">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-125 bg-linear-to-b from-blue-50/80 to-transparent -z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-150 h-150 bg-blue-100/40 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <Navbar scrolled={scrolled} />
            
            <main className="pt-24 pb-16 flex flex-col flex-1 max-w-7xl mx-auto px-6 lg:px-8 w-full min-h-[calc(100vh-80px)]">
                {children}
            </main>

            <footer className="border-t border-slate-200 mt-auto py-8">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} Balai Penerapan Mutu Produk Perikanan Makassar. All rights reserved.
                </div>
            </footer>
        </div>
    );
}