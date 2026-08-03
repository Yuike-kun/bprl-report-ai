import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Settings,
    FileText,
    Home,
    Menu,
    LogOut,
    User,
    Bell,
    Search,
    PlusCircle,
    LayoutDashboard,
    ChevronDown,
    ChevronRight,
    FilePlus2,
    FolderCog,
    MapPin,
    ClipboardList,
    CalendarDays,
    Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ReactNode, useState, useEffect, useRef } from "react";
import MENU from "./menu.json";
import { usePage, Link, router } from "@inertiajs/react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/* ------------------------------------------------------------------ */
/*  Tipe & mapping icon dari menu.json                                  */
/* ------------------------------------------------------------------ */
type MenuLinkItem = { label: string; url: string; icon: string };

type MenuSection =
    | ({ type: "link"; label: string; url: string; icon: string; adminOnly?: boolean })
    | ({
        type: "dropdown";
        id: string;
        label: string;
        icon: string;
        adminOnly?: boolean;
        items: MenuLinkItem[];
    });

const NAV = MENU as unknown as MenuSection[];

const ICONS: Record<string, LucideIcon> = {
    LayoutDashboard,
    FileText,
    FilePlus2,
    FolderCog,
    MapPin,
    ClipboardList,
    CalendarDays,
    Users,
};

const getIcon = (name?: string): LucideIcon => (name && ICONS[name]) || LayoutDashboard;

/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */
function Sidebar({
    collapsed,
    onExpand,
}: {
    collapsed: boolean;
    onExpand: () => void;
}) {
    const { url, props } = usePage<any>();
    const user = props.auth?.user;
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    const isItemActive = (itemUrl: string) =>
        url === itemUrl || url.startsWith(itemUrl + "/");

    /* Auto-buka grup yang berisi rute aktif */
    useEffect(() => {
        NAV.forEach((section) => {
            if (section.type === "dropdown") {
                const hasActive = section.items.some((item) => isItemActive(item.url));
                if (hasActive) {
                    setOpenGroups((prev) => ({ ...prev, [section.id]: true }));
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    const toggleGroup = (sectionId: string) => {
        if (collapsed) {
            onExpand();
            setOpenGroups((prev) => ({ ...prev, [sectionId]: true }));
            return;
        }
        setOpenGroups((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const renderLink = (item: MenuLinkItem, asChild = false) => {
        const Icon = getIcon(item.icon);
        const isActive = isItemActive(item.url);

        return (
            <Link
                href={item.url}
                className={cn(
                    "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 group relative border border-transparent",
                    asChild ? "px-2.5 py-2 text-[13px]" : "px-3 py-2.5",
                    isActive
                        ? "bg-blue-500/15 text-blue-300 border-blue-400/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                    collapsed && "justify-center"
                )}
            >
                <Icon
                    className={cn(
                        "shrink-0",
                        asChild ? "w-4 h-4" : "w-[18px] h-[18px]",
                        isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                    )}
                />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                {!collapsed && !asChild && isActive && (
                    <ChevronRight className="w-3 h-3 text-blue-400 shrink-0" />
                )}
                {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                )}
            </Link>
        );
    };

    const renderDropdown = (section: Extract<MenuSection, { type: "dropdown" }>) => {
        const GroupIcon = getIcon(section.icon);
        const groupActive = section.items.some((item) => isItemActive(item.url));
        const isOpen = !!openGroups[section.id];

        const groupButton = (
            <button
                type="button"
                onClick={() => toggleGroup(section.id)}
                aria-expanded={isOpen}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative border border-transparent cursor-pointer",
                    groupActive
                        ? "text-blue-300"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                    collapsed && "justify-center px-0"
                )}
            >
                <GroupIcon
                    className={cn(
                        "w-[18px] h-[18px] shrink-0",
                        groupActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                    )}
                />
                {!collapsed && (
                    <>
                        <span className="truncate flex-1 text-left">{section.label}</span>
                        <ChevronDown
                            className={cn(
                                "w-3.5 h-3.5 shrink-0 transition-transform duration-200",
                                groupActive ? "text-blue-400" : "text-slate-500",
                                isOpen && "rotate-180"
                            )}
                        />
                    </>
                )}
                {collapsed && groupActive && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                )}
                {groupActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                )}
            </button>
        );

        if (collapsed) {
            return (
                <Tooltip key={section.id}>
                    <TooltipTrigger className="block rounded-xl" render={<span />}>
                        {groupButton}
                    </TooltipTrigger>
                    <TooltipContent side="right">{section.label}</TooltipContent>
                </Tooltip>
            );
        }

        return (
            <div key={section.id}>
                {groupButton}
                <div
                    className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                >
                    <div className="overflow-hidden">
                        <div className="ml-[23px] pl-2 py-1 flex flex-col gap-0.5 border-l border-white/10">
                            {section.items.map((child) => (
                                <div key={child.url}>{renderLink(child, true)}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const visibleSections = NAV.filter((section) => {
        if (section.adminOnly && user?.role !== "admin") return false;
        return true;
    });

    return (
        <aside
            className={cn(
                "relative bg-slate-950/80 backdrop-blur-2xl text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-white/10 z-20 shrink-0 overflow-hidden",
                collapsed ? "w-18" : "w-64"
            )}
        >
            {/* Ambient blue glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-10 h-52 w-52 rounded-full bg-blue-600/20 blur-3xl" />
                <div className="absolute top-1/2 -right-16 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />
            </div>

            {/* Brand */}
            <div className="relative h-16 flex items-center border-b border-white/10 px-4 shrink-0">
                <div className={cn("flex items-center gap-3 w-full", collapsed && "justify-center")}>
                    <button
                        onClick={() => router.visit("/")}
                        aria-label="Kembali ke beranda"
                        className="group/brand relative w-8 h-8 shrink-0 rounded-lg overflow-hidden cursor-pointer shadow-lg shadow-blue-500/30 hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    >
                        <span className="absolute inset-0 bg-linear-to-br from-blue-500 to-cyan-400 transition-opacity duration-300 group-hover/brand:opacity-0" />
                        <span className="absolute inset-0 bg-linear-to-br from-emerald-500 to-green-400 opacity-0 transition-opacity duration-300 group-hover/brand:opacity-100" />
                        <span className="relative w-full h-full flex items-center justify-center">
                            <FileText className="absolute w-4 h-4 text-white transition-all duration-300 opacity-100 scale-100 rotate-0 group-hover/brand:opacity-0 group-hover/brand:scale-75 group-hover/brand:-rotate-45" />
                            <Home className="absolute w-4 h-4 text-white transition-all duration-300 opacity-0 scale-75 rotate-45 group-hover/brand:opacity-100 group-hover/brand:scale-100 group-hover/brand:rotate-0" />
                        </span>
                    </button>
                    {!collapsed && (
                        <div className="flex flex-col leading-tight overflow-hidden">
                            <span className="font-bold text-white tracking-tight text-[15px] truncate">
                                BPRL Panel
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Admin v2.0</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="relative flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto px-2">
                {!collapsed && (
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 py-2 mt-1">
                        Navigasi
                    </p>
                )}

                {visibleSections.map((section) =>
                    section.type === "dropdown" ? (
                        renderDropdown(section)
                    ) : (
                        (() => {
                            const link = renderLink({
                                label: section.label,
                                url: section.url,
                                icon: section.icon,
                            });
                            if (collapsed) {
                                return (
                                    <Tooltip key={section.url}>
                                        <TooltipTrigger className="block rounded-xl" render={<span />}>
                                            {link}
                                        </TooltipTrigger>
                                        <TooltipContent side="right">{section.label}</TooltipContent>
                                    </Tooltip>
                                );
                            }
                            return <div key={section.url}>{link}</div>;
                        })()
                    )
                )}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="relative p-3 border-t border-white/10 shrink-0">
                    <div className="bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-center">
                        <p className="text-[11px] font-semibold text-slate-400 truncate">
                            Trika Media Solusindo © {new Date().getFullYear()}
                        </p>
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

    const firstName = user?.name?.split(" ")[0] || "Admin";
    const initial = user?.name?.charAt(0)?.toUpperCase() || "A";

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl py-1.5 px-2 pr-3 hover:bg-blue-50/80 transition-colors focus:outline-none"
            >
                <Avatar className="h-8 w-8 border-2 border-blue-200/70 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold text-xs">
                        {initial}
                    </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left leading-tight">
                    <p className="text-sm font-semibold text-slate-800 leading-none">{firstName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{user?.role || "User"}</p>
                </div>
                <ChevronDown
                    className={cn(
                        "w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200",
                        open && "rotate-180"
                    )}
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-60 bg-white/80 backdrop-blur-xl backdrop-saturate-150 rounded-2xl border border-white/60 shadow-2xl shadow-blue-900/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/60 bg-blue-50/50">
                        <Avatar className="h-10 w-10 border-2 border-blue-200/70">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold text-sm">
                                {initial}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                                {user?.name || "Admin User"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {user?.email || "admin@bprl.go.id"}
                            </p>
                        </div>
                    </div>

                    <div className="p-1.5">
                        <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50/80 rounded-xl transition-colors w-full font-medium"
                            onClick={() => setOpen(false)}
                        >
                            <User className="w-4 h-4 text-blue-400" />
                            Profil Saya
                        </Link>
                        <Link
                            href="/settings"
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50/80 rounded-xl transition-colors w-full font-medium"
                            onClick={() => setOpen(false)}
                        >
                            <Settings className="w-4 h-4 text-blue-400" />
                            Pengaturan Akun
                        </Link>
                    </div>

                    <div className="p-1.5 border-t border-white/60">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50/80 rounded-xl transition-colors"
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
        <header className="relative h-16 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/60 shadow-[0_8px_32px_-8px_rgba(37,99,235,0.15)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-16 left-1/3 h-32 w-32 rounded-full bg-blue-400/15 blur-3xl" />
                <div className="absolute -top-16 right-1/4 h-32 w-32 rounded-full bg-cyan-300/15 blur-3xl" />
            </div>

            <div className="relative flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="text-slate-500 hover:bg-blue-50/80 hover:text-blue-600 rounded-xl shrink-0"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-5 h-5" />
                </Button>
                <div className="hidden sm:block">
                    <h1 className="text-base font-bold text-slate-800 leading-none truncate">
                        {pageTitle || "Dashboard"}
                    </h1>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">BPRL Report AI Admin</p>
                </div>
            </div>

            <div className="relative flex items-center gap-1 sm:gap-2">
                <div className="hidden lg:flex items-center gap-2 bg-white/50 border border-white/70 rounded-xl px-3 py-2 w-56 xl:w-72 focus-within:ring-2 focus-within:ring-blue-300/50 focus-within:border-blue-400/60 transition-all">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari laporan..."
                        className="bg-transparent text-sm text-slate-700 w-full outline-none placeholder:text-slate-400"
                    />
                    <kbd className="hidden xl:inline-flex items-center gap-1 rounded-md bg-white/70 border border-white/70 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono shrink-0">
                        ⌘K
                    </kbd>
                </div>

                <div className="flex items-center gap-1 ml-1">
                    <Tooltip>
                        <TooltipTrigger
                            className="inline-flex items-center justify-center rounded-xl w-9 h-9 text-slate-500 hover:bg-blue-50/80 hover:text-blue-600 transition-colors"
                            render={<button />}
                        >
                            <PlusCircle className="w-5 h-5" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Buat Laporan Baru</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger
                            className="inline-flex items-center justify-center rounded-xl w-9 h-9 text-slate-500 hover:bg-blue-50/80 hover:text-blue-600 transition-colors relative"
                            render={<button />}
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Notifikasi</TooltipContent>
                    </Tooltip>
                </div>

                <div className="w-px h-6 bg-gradient-to-b from-transparent via-blue-300/50 to-transparent mx-1 shrink-0" />

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
            <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50 overflow-hidden antialiased">
                <Sidebar collapsed={collapsed} onExpand={() => setCollapsed(false)} />

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Navbar
                        onToggleSidebar={() => setCollapsed((v) => !v)}
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