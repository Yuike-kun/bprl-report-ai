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
    Plus,
    LayoutDashboard,
    ChevronDown,
    FilePlus2,
    FolderCog,
    MapPin,
    ClipboardList,
    CalendarDays,
    Users,
    Home,
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
/*  Sidebar (floating / inset style)                                    */
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
                    "flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    asChild ? "px-2.5 py-1.5 text-[13px]" : "px-2.5 py-2",
                    isActive
                        ? "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/30"
                        : "text-slate-600 hover:bg-blue-50/70 hover:text-blue-700",
                    collapsed && !asChild && "justify-center px-0"
                )}
            >
                <Icon
                    className={cn(
                        "shrink-0",
                        asChild ? "w-3.5 h-3.5" : "w-[17px] h-[17px]",
                        isActive
                            ? "text-white"
                            : "text-slate-400 transition-colors"
                    )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
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
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer",
                    groupActive
                        ? "text-blue-700 bg-blue-50/80"
                        : "text-slate-600 hover:bg-blue-50/70 hover:text-blue-700",
                    collapsed && "justify-center px-0"
                )}
            >
                <GroupIcon
                    className={cn(
                        "w-[17px] h-[17px] shrink-0",
                        groupActive ? "text-blue-600" : "text-slate-400"
                    )}
                />
                {!collapsed && (
                    <>
                        <span className="truncate flex-1 text-left">{section.label}</span>
                        <ChevronDown
                            className={cn(
                                "w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200",
                                isOpen && "rotate-180",
                                groupActive && "text-blue-500"
                            )}
                        />
                    </>
                )}
                {collapsed && groupActive && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.7)]" />
                )}
            </button>
        );

        if (collapsed) {
            return (
                <Tooltip key={section.id}>
                    <TooltipTrigger className="block rounded-lg relative" render={<span />}>
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
                        "grid transition-all duration-200 ease-in-out",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                >
                    <div className="overflow-hidden">
                        <div className="ml-[19px] pl-3 py-1 flex flex-col gap-0.5 border-l border-blue-100">
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
                "relative rounded-2xl border border-slate-200/80 bg-linear-to-b from-white via-white to-blue-50/40 flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden shadow-sm",
                collapsed ? "w-[68px]" : "w-60"
            )}
        >
            {/* Brand */}
            <div className={cn("h-16 flex items-center px-4 shrink-0", collapsed && "justify-center px-0")}>
                <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
                    <button
                        onClick={() => router.visit("/")}
                        aria-label="Kembali ke beranda"
                        className="w-8 h-8 shrink-0 rounded-lg bg-linear-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                        <FileText className="w-4 h-4 text-white" />
                    </button>
                    {!collapsed && (
                        <div className="leading-tight">
                            <p className="font-bold text-slate-900 text-sm tracking-tight">BPRL Panel</p>
                            <p className="text-[10px] text-slate-400 font-medium">Admin v2.0</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-2 flex flex-col gap-1 overflow-y-auto px-3">
                {!collapsed && (
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2.5 pb-1 pt-1">
                        Menu
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
                                        <TooltipTrigger className="block rounded-lg relative" render={<span />}>
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
            <div className={cn("p-3 shrink-0", collapsed && "px-2")}>
                {!collapsed ? (
                    <p className="text-[10px] font-medium text-slate-400 text-center leading-relaxed">
                        Trika Media Solusindo
                        <br />© {new Date().getFullYear()}
                    </p>
                ) : (
                    <div className="h-px bg-slate-100" />
                )}
            </div>
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
                className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1 sm:pr-2 hover:bg-blue-50/70 transition-colors cursor-pointer"
            >
                <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                    <AvatarFallback className="bg-linear-to-br from-blue-600 to-indigo-500 text-white font-semibold text-xs">
                        {initial}
                    </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium text-slate-700">{firstName}</span>
                <ChevronDown
                    className={cn(
                        "w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200",
                        open && "rotate-180"
                    )}
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl shadow-blue-900/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-linear-to-r from-blue-50/60 to-transparent">
                        <Avatar className="h-9 w-9 ring-2 ring-blue-100">
                            <AvatarFallback className="bg-linear-to-br from-blue-600 to-indigo-500 text-white font-semibold text-sm">
                                {initial}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
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
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50/70 rounded-lg transition-colors font-medium"
                            onClick={() => setOpen(false)}
                        >
                            <User className="w-4 h-4 text-blue-500" />
                            Profil Saya
                        </Link>
                        <Link
                            href="/settings"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50/70 rounded-lg transition-colors font-medium"
                            onClick={() => setOpen(false)}
                        >
                            <Settings className="w-4 h-4 text-blue-500" />
                            Pengaturan Akun
                        </Link>
                    </div>

                    <div className="p-1.5 border-t border-slate-100">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            <LogOut className="w-4 h-4" />
                            Keluar
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
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-slate-100 bg-linear-to-r from-white via-white to-blue-50/30 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="text-slate-500 hover:bg-blue-50/70 hover:text-blue-700 rounded-lg shrink-0"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-[18px] h-[18px]" />
                </Button>

                <div className="flex items-center gap-1.5 min-w-0">
                    <Link
                        href="/dashboard"
                        className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                    >
                        <Home className="w-3.5 h-3.5" />
                    </Link>
                    <span className="hidden sm:block text-slate-300">/</span>
                    <h1 className="text-sm font-semibold text-slate-900 truncate">
                        {pageTitle || "Dashboard"}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Search trigger */}
                <button className="hidden lg:flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-60 hover:border-blue-300 hover:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all cursor-pointer">
                    <Search className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 text-left">Cari...</span>
                    <kbd className="text-[10px] font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400">
                        ⌘K
                    </kbd>
                </button>

                {/* Buat baru */}
                <button className="flex items-center gap-1.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg px-3 py-2 shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 hover:brightness-110 transition-all cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Buat</span>
                </button>

                {/* Notifikasi */}
                <button className="relative inline-flex items-center justify-center rounded-lg w-9 h-9 text-slate-500 hover:bg-blue-50/70 hover:text-blue-700 transition-colors cursor-pointer">
                    <Bell className="w-[18px] h-[18px]" />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
                </button>

                <div className="w-px h-5 bg-slate-200 mx-0.5 hidden sm:block" />

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
            <div className="relative flex h-screen w-full bg-slate-100 overflow-hidden p-3">
                {/* Ambient glow — subtle */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 left-1/4 w-[480px] h-[480px] rounded-full bg-blue-400/15 blur-[110px]" />
                    <div className="absolute -bottom-40 right-1/4 w-[520px] h-[520px] rounded-full bg-indigo-400/10 blur-[110px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sky-300/10 blur-[130px]" />
                </div>

                <div className="relative flex h-full w-full gap-3">
                    <Sidebar collapsed={collapsed} onExpand={() => setCollapsed(false)} />

                    <div className="flex-1 flex flex-col min-w-0 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <Navbar
                            onToggleSidebar={() => setCollapsed((v) => !v)}
                            pageTitle={pageTitle}
                            user={user}
                        />
                        <main className="flex-1 overflow-y-auto">
                            <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-200">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
