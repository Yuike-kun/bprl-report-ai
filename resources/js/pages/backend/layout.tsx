import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Settings,
    FileText,
    Menu,
    LogOut,
    User,
    Bell,
    Search,
    PlusCircle,
    LayoutDashboard,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { ReactNode, useState, useEffect, useRef } from "react";
import MENU from './menu.json';
import { usePage, Link } from "@inertiajs/react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */
function Sidebar({ collapsed }: { collapsed: boolean }) {
    const { url } = usePage<any>();

    return (
        <aside
            className={cn(
                "bg-slate-950 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800/80 z-20 shrink-0 overflow-hidden",
                collapsed ? "w-18" : "w-64"
            )}
        >
            {/* Brand */}
            <div className="h-16 flex items-center border-b border-slate-800/80 bg-slate-950 px-4 shrink-0">
                <div className={cn("flex items-center gap-3 w-full", collapsed && "justify-center")}>
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col leading-tight overflow-hidden">
                            <span className="font-bold text-white tracking-tight text-[15px] truncate">BPRL Panel</span>
                            <span className="text-[10px] text-slate-500 font-medium">Admin v2.0</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto px-2">
                {!collapsed && (
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 py-2 mt-1">
                        Navigasi
                    </p>
                )}

                {MENU.map((menu, index) => {
                    const isActive = url === menu.url || url.startsWith(menu.url + '/');

                    const inner = (
                        <Link
                            href={menu.url}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                                isActive
                                    ? "bg-indigo-500/15 text-indigo-300"
                                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                                collapsed && "justify-center"
                            )}
                        >
                            <LayoutDashboard
                                className={cn(
                                    "w-[18px] h-[18px] shrink-0",
                                    isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                                )}
                            />
                            {!collapsed && (
                                <>
                                    <span className="truncate flex-1">{menu.label}</span>
                                    {isActive && <ChevronRight className="w-3 h-3 text-indigo-500 shrink-0" />}
                                </>
                            )}
                            {/* Active bar */}
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
                            )}
                        </Link>
                    );

                    if (collapsed) {
                        return (
                            <Tooltip key={index}>
                                <TooltipTrigger
                                    className="block rounded-xl"
                                    render={<span />}
                                >
                                    {inner}
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    {menu.label}
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return <div key={index}>{inner}</div>;
                })}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="p-3 border-t border-slate-800/80 shrink-0">
                    <div className="bg-white/5 rounded-xl px-3 py-2.5 text-center">
                        <p className="text-[11px] font-semibold text-slate-400 truncate">BPRL Report AI © 2025</p>
                    </div>
                </div>
            )}
        </aside>
    );
}

/* ------------------------------------------------------------------ */
/*  Profile Dropdown                                                    */
/* ------------------------------------------------------------------ */
function ProfileDropdown({ user }: { user: any }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    const firstName = user?.name?.split(' ')[0] || "Admin";
    const initial = user?.name?.charAt(0)?.toUpperCase() || 'A';

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-2 rounded-xl py-1.5 px-2 pr-3 hover:bg-slate-100 transition-colors focus:outline-none"
            >
                <Avatar className="h-8 w-8 border-2 border-indigo-100 shadow-sm">
                    <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
                        {initial}
                    </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left leading-tight">
                    <p className="text-sm font-semibold text-slate-800 leading-none">{firstName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Admin</p>
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-300/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50">
                        <Avatar className="h-10 w-10 border-2 border-indigo-100">
                            <AvatarFallback className="bg-indigo-600 text-white font-bold text-sm">
                                {initial}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name || "Admin User"}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email || "admin@bprl.go.id"}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-1.5">
                        <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors w-full font-medium"
                            onClick={() => setOpen(false)}
                        >
                            <User className="w-4 h-4 text-slate-400" />
                            Profil Saya
                        </Link>
                        <Link
                            href="/settings"
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors w-full font-medium"
                            onClick={() => setOpen(false)}
                        >
                            <Settings className="w-4 h-4 text-slate-400" />
                            Pengaturan Akun
                        </Link>
                    </div>

                    <div className="p-1.5 border-t border-slate-100">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            <LogOut className="w-4 h-4" />
                            Keluar dari Akun
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                              */
/* ------------------------------------------------------------------ */
function Navbar({
    onToggleSidebar,
    pageTitle,
    user,
}: {
    onToggleSidebar: () => void;
    pageTitle?: string;
    user?: any;
}) {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0">
            {/* Left */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="text-slate-500 hover:bg-slate-100 rounded-xl shrink-0"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-5 h-5" />
                </Button>
                <div className="hidden sm:block">
                    <h1 className="text-base font-bold text-slate-800 leading-none truncate">{pageTitle || "Dashboard"}</h1>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">BPRL Report AI Admin</p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1 sm:gap-2">
                {/* Search */}
                <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-56 xl:w-72 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-400 transition-all">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari laporan..."
                        className="bg-transparent text-sm text-slate-700 w-full outline-none placeholder:text-slate-400"
                    />
                    <kbd className="hidden xl:inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono shrink-0">
                        ⌘K
                    </kbd>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1 ml-1">
                    <Tooltip>
                        <TooltipTrigger
                            className="inline-flex items-center justify-center rounded-xl w-9 h-9 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            render={<button />}
                        >
                            <PlusCircle className="w-5 h-5" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Buat Laporan Baru</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger
                            className="inline-flex items-center justify-center rounded-xl w-9 h-9 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors relative"
                            render={<button />}
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Notifikasi</TooltipContent>
                    </Tooltip>
                </div>

                <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

                <ProfileDropdown user={user} />
            </div>
        </header>
    );
}

/* ------------------------------------------------------------------ */
/*  Root Layout                                                         */
/* ------------------------------------------------------------------ */
export default function MainLayout({
    children,
    pageTitle,
}: {
    children: ReactNode;
    pageTitle?: string;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const { props } = usePage<any>();
    const user = props.auth?.user;

    return (
        <TooltipProvider delay={100}>
            <div className="flex h-screen w-full bg-slate-50 overflow-hidden antialiased">
                <Sidebar collapsed={collapsed} />

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Navbar
                        onToggleSidebar={() => setCollapsed(v => !v)}
                        pageTitle={pageTitle}
                        user={user}
                    />
                    <main className="flex-1 overflow-y-auto">
                        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in zoom-in-[0.98] duration-300">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}