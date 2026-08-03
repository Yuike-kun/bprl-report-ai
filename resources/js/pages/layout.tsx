import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { ReactNode, useEffect, useState } from "react";
import { Activity } from "lucide-react";

function Navbar({ scrolled }: { scrolled: boolean }) {
    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-500 ease-out ${scrolled
                    ? "bg-white/70 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/60 py-2.5 shadow-[0_8px_32px_-8px_rgba(37,99,235,0.15)]"
                    : "bg-transparent py-5 border-b border-transparent"
                }`}
        >
            {/* Ambient blue glow — only visible once glassed */}
            <div
                className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"
                    }`}
            >
                <div className="absolute -top-16 left-1/4 h-32 w-32 rounded-full bg-blue-400/15 blur-3xl" />
                <div className="absolute -top-16 right-1/4 h-32 w-32 rounded-full bg-cyan-300/15 blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <div
                        className={`bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-lg group-hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-600/25 ${scrolled ? "p-1.5" : "p-2"
                            }`}
                    >
                        <Activity className={`transition-all duration-300 ${scrolled ? "w-4 h-4" : "w-5 h-5"}`} />
                    </div>
                    <span
                        className={`font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-blue-800 transition-all duration-300 ${scrolled ? "text-lg" : "text-xl"
                            }`}
                    >
                        BPRL AI
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="hidden sm:block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                    >
                        Masuk
                    </Link>
                    <Link href="/request-form">
                        <Button className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-600/30 text-white shadow-md shadow-blue-600/20 rounded-full px-6 transition-all duration-300 hover:-translate-y-0.5">
                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                            <span className="relative">Ajukan Permohonan</span>
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
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-125 bg-linear-to-b from-blue-50/80 to-transparent -z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-150 h-150 bg-blue-100/40 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-40 left-0 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl -z-10 -translate-x-1/2 pointer-events-none" />

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