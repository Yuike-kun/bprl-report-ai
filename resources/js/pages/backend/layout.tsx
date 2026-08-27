import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
    Settings,
    FileText,
    FileCheck,
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
    Menu,
    Home,
    History,
    FileSearch,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import MENU_PEGAWAI from './pegawai/menu.json';
import MENU from './menu.json';
import { usePage, Link, router } from '@inertiajs/react';

const SIDEBAR_ROLES = ['admin', 'pemohon'];

type MenuLinkItem = { label: string; url: string; icon: string };

type MenuSection =
    | {
          type: 'link';
          label: string;
          url: string;
          icon: string;
          adminOnly?: boolean;
      }
    | {
          type: 'dropdown';
          id: string;
          label: string;
          icon: string;
          adminOnly?: boolean;
          items: MenuLinkItem[];
      };

const ICONS: Record<string, LucideIcon> = {
    LayoutDashboard,
    FileText,
    FileCheck,
    FilePlus2,
    FolderCog,
    MapPin,
    ClipboardList,
    CalendarDays,
    Users,
    History,
    FileSearch,
};

const getIcon = (name?: string): LucideIcon =>
    (name && ICONS[name]) || LayoutDashboard;
const sectionKey = (s: MenuSection) => (s.type === 'link' ? s.url : s.id);

function useIsActive() {
    const { url } = usePage<any>();
    return (itemUrl: string) =>
        url === itemUrl || url.startsWith(itemUrl + '/') || url.startsWith(itemUrl + '?');
}

function visibleSectionsFor(user: any) {
    let NAV = MENU as unknown as MenuSection[];
    if (user?.role === 'pegawai') {
        NAV = MENU_PEGAWAI as unknown as MenuSection[];
    }
    return NAV.filter(
        (section) => !section.adminOnly || user?.role === 'admin',
    );
}

function BrandMark() {
    return (
        <Link
            href="/"
            Linkria-label="Kembali ke beranda"
            className="cursor-pointer"
        >
            <img src="/logo-djprl.png" alt="Logo" className="h-10" />
        </Link>
    );
}

/* ------------------------------------------------------------------ */
/*  Profile menu — shared shadcn DropdownMenu, used by both shells      */
/* ------------------------------------------------------------------ */
function ProfileMenu({ user }: { user?: any }) {
    const firstName = user?.name?.split(' ')[0] || 'Admin';
    const initial = user?.name?.charAt(0)?.toUpperCase() || 'A';

    const handleLogoutClick = (e: React.MouseEvent) => {
        if (user?.show_logout_animation !== false) {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('trigger-logout-animation'));
            setTimeout(() => {
                router.post('/logout');
            }, 1800);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-1 pl-1 outline-none hover:bg-stone-100 sm:pr-2.5">
                    <Avatar className="h-8 w-8 ring-2 ring-blue-50">
                        {user?.avatar && (
                            <AvatarImage
                                src={`/storage/${user.avatar}`}
                                className="object-cover"
                            />
                        )}
                        <AvatarFallback className="bg-neutral-900 text-xs font-semibold text-blue-400">
                            {initial}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-[13px] font-medium text-stone-700 sm:block">
                        {firstName}
                    </span>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-stone-400 sm:block" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-64 rounded-2xl border-stone-200/80 p-1.5 shadow-xl shadow-stone-900/[0.06]"
            >
                <div className="flex items-center gap-3 px-2.5 py-2.5">
                    <Avatar className="h-9 w-9 ring-2 ring-blue-50">
                        {user?.avatar && (
                            <AvatarImage
                                src={`/storage/${user.avatar}`}
                                className="object-cover"
                            />
                        )}
                        <AvatarFallback className="bg-neutral-900 text-sm font-semibold text-blue-400">
                            {initial}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                            {user?.name || 'Admin User'}
                        </p>
                        <p className="truncate text-xs text-stone-500">
                            {user?.email || 'admin@bprl.go.id'}
                        </p>
                    </div>
                </div>
                <DropdownMenuSeparator className="bg-stone-100" />
                <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2">
                    <Link href="/profile" className="flex items-center gap-2.5">
                        <User className="h-4 w-4 text-stone-400" />
                        Profil Saya
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2">
                    <Link
                        href="/settings"
                        className="flex items-center gap-2.5"
                    >
                        <Settings className="h-4 w-4 text-stone-400" />
                        Pengaturan Akun
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-stone-100" />
                <DropdownMenuItem
                    asChild
                    variant="destructive"
                    className="rounded-lg px-2.5 py-2"
                >
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        onClick={handleLogoutClick}
                        className="flex w-full items-center gap-2.5"
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function Sidebar({
    collapsed,
    onExpand,
    user,
}: {
    collapsed: boolean;
    onExpand: () => void;
    user: any;
}) {
    let NAV = MENU as unknown as MenuSection[];
    if (user?.role === 'pegawai') {
        NAV = MENU_PEGAWAI as unknown as MenuSection[];
    }
    const { url } = usePage<any>();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const isItemActive = useIsActive();

    useEffect(() => {
        NAV.forEach((section) => {
            if (
                section.type === 'dropdown' &&
                section.items.some((item) => isItemActive(item.url))
            ) {
                setOpenGroups((prev) => ({ ...prev, [section.id]: true }));
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

    const renderLink = (item: MenuLinkItem, nested = false) => {
        const Icon = getIcon(item.icon);
        const isActive = isItemActive(item.url);

        return (
            <Link
                href={item.url}
                className={cn(
                    'flex items-center gap-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    nested ? 'px-2.5 py-1.5 text-[13px]' : 'px-2.5 py-2',
                    isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                        : 'text-stone-600 hover:bg-stone-100',
                    collapsed && !nested && 'justify-center px-0',
                )}
            >
                <Icon
                    className={cn(
                        'shrink-0',
                        nested ? 'h-3.5 w-3.5' : 'h-[17px] w-[17px]',
                        isActive ? 'text-white' : 'text-stone-400',
                    )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
        );
    };

    const renderDropdown = (
        section: Extract<MenuSection, { type: 'dropdown' }>,
    ) => {
        const GroupIcon = getIcon(section.icon);
        const groupActive = section.items.some((item) =>
            isItemActive(item.url),
        );
        const isOpen = !!openGroups[section.id];

        const groupButton = (
            <button
                type="button"
                onClick={() => toggleGroup(section.id)}
                aria-expanded={isOpen}
                className={cn(
                    'relative flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors duration-150',
                    groupActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-stone-600 hover:bg-stone-100',
                    collapsed && 'justify-center px-0',
                )}
            >
                <GroupIcon
                    className={cn(
                        'h-[17px] w-[17px] shrink-0',
                        groupActive ? 'text-blue-600' : 'text-stone-400',
                    )}
                />
                {!collapsed && (
                    <>
                        <span className="flex-1 truncate text-left">
                            {section.label}
                        </span>
                        <ChevronDown
                            className={cn(
                                'h-3.5 w-3.5 shrink-0 text-stone-400 transition-transform duration-200',
                                isOpen && 'rotate-180',
                            )}
                        />
                    </>
                )}
                {collapsed && groupActive && (
                    <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                )}
            </button>
        );

        if (collapsed) {
            return (
                <Tooltip key={section.id}>
                    <TooltipTrigger
                        className="relative block rounded-xl"
                        render={<span />}
                    >
                        {groupButton}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {section.label}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return (
            <div key={section.id}>
                {groupButton}
                <div
                    className={cn(
                        'grid transition-all duration-200 ease-in-out',
                        isOpen
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0',
                    )}
                >
                    <div className="overflow-hidden">
                        <div className="ml-[19px] flex flex-col gap-0.5 border-l border-stone-200 py-1 pl-3">
                            {section.items.map((child) => (
                                <div key={child.url}>
                                    {renderLink(child, true)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const sections = visibleSectionsFor(user);

    return (
        <aside
            className={cn(
                'relative flex shrink-0 flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-sm transition-all duration-300 ease-in-out',
                collapsed ? 'w-[68px]' : 'w-60',
            )}
        >
            <div
                className={cn(
                    'flex h-16 shrink-0 items-center px-4',
                    collapsed && 'justify-center px-0',
                )}
            >
                <div
                    className={cn(
                        'flex items-center gap-2.5',
                        collapsed && 'justify-center',
                    )}
                >
                    <BrandMark />
                    {!collapsed && (
                        <div className="leading-tight">
                            <p className="text-sm font-bold tracking-tight text-neutral-900">
                                BPRL Panel
                            </p>
                            <p className="text-[10px] font-medium text-stone-400">
                                Admin v2.0
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
                {!collapsed && (
                    <p className="px-2.5 pt-1 pb-1 text-[10px] font-semibold tracking-widest text-stone-400 uppercase">
                        Menu
                    </p>
                )}

                {sections.map((section) =>
                    section.type === 'dropdown'
                        ? renderDropdown(section)
                        : (() => {
                              const link = renderLink({
                                  label: section.label,
                                  url: section.url,
                                  icon: section.icon,
                              });
                              if (collapsed) {
                                  return (
                                      <Tooltip key={section.url}>
                                          <TooltipTrigger
                                              className="relative block rounded-xl"
                                              render={<span />}
                                          >
                                              {link}
                                          </TooltipTrigger>
                                          <TooltipContent side="right">
                                              {section.label}
                                          </TooltipContent>
                                      </Tooltip>
                                  );
                              }
                              return <div key={section.url}>{link}</div>;
                          })(),
                )}
            </nav>

            <div className={cn('shrink-0 p-3', collapsed && 'px-2')}>
                {!collapsed ? (
                    <p className="text-center text-[10px] leading-relaxed font-medium text-stone-400">
                        Trika Media Solusindo
                        <br />© {new Date().getFullYear()}
                    </p>
                ) : (
                    <div className="h-px bg-stone-100" />
                )}
            </div>
        </aside>
    );
}

function SidebarTopBar({
    onToggleSidebar,
    pageTitle,
    user,
}: {
    onToggleSidebar: () => void;
    pageTitle?: string;
    user?: any;
}) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-stone-100 px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="shrink-0 rounded-full text-stone-500 hover:bg-stone-100"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="h-[18px] w-[18px]" />
                </Button>

                <div className="flex min-w-0 items-center gap-1.5">
                    <Link
                        href="/dashboard"
                        className="hidden shrink-0 items-center gap-1.5 text-sm text-stone-400 transition-colors hover:text-blue-600 sm:flex"
                    >
                        <Home className="h-3.5 w-3.5" />
                    </Link>
                    <span className="hidden text-stone-300 sm:block">/</span>
                    <h1 className="truncate text-sm font-semibold text-neutral-900">
                        {document.title.split('-')[0].trim() || 'Dashboard'}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                <button className="hidden w-56 cursor-pointer items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-[13px] text-stone-400 transition-colors hover:border-stone-300 hover:bg-white lg:flex">
                    <Search className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 text-left">Cari...</span>
                    <kbd className="rounded-md border border-stone-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-400">
                        ⌘K
                    </kbd>
                </button>

                <Button className="hidden gap-1.5 rounded-full bg-blue-600 px-4 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 sm:flex">
                    <Plus className="h-4 w-4" />
                    Buat
                </Button>
                <Button
                    size="icon"
                    className="rounded-full bg-blue-600 text-white hover:bg-blue-700 sm:hidden"
                    aria-label="Buat"
                >
                    <Plus className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full text-stone-500 hover:bg-stone-100"
                    aria-label="Notifikasi"
                >
                    <Bell className="h-[18px] w-[18px]" />
                    <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-white" />
                </Button>

                <div className="mx-0.5 hidden h-5 w-px bg-stone-200 sm:block" />

                <ProfileMenu user={user} />
            </div>
        </header>
    );
}

function SidebarShell({
    children,
    pageTitle,
    user,
}: {
    children: ReactNode;
    pageTitle?: string;
    user: any;
}) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <TooltipProvider delay={100}>
            <div className="relative flex h-screen w-full overflow-hidden bg-stone-50 p-3">
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-radial-[at_50%_0%] from-blue-100/40 via-transparent to-transparent" />

                <div className="relative flex h-full w-full gap-3">
                    <Sidebar
                        collapsed={collapsed}
                        onExpand={() => setCollapsed(false)}
                        user={user}
                    />

                    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white/90 shadow-sm backdrop-blur-sm">
                        <SidebarTopBar
                            onToggleSidebar={() => setCollapsed((v) => !v)}
                            pageTitle={pageTitle}
                            user={user}
                        />
                        <main className="flex-1 overflow-y-auto">
                            <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}

/* ==================================================================== */
/*  NAVBAR SHELL — pegawai (no sidebar)                                  */
/* ==================================================================== */

function DesktopNav({ sections }: { sections: MenuSection[] }) {
    const { url } = usePage<any>();
    const isItemActive = useIsActive();
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [indicator, setIndicator] = useState<{
        left: number;
        width: number;
    } | null>(null);

    const activeSection = sections.find((s) =>
        s.type === 'link'
            ? isItemActive(s.url)
            : s.items.some((i) => isItemActive(i.url)),
    );

    const measure = () => {
        const container = containerRef.current;
        const key = activeSection ? sectionKey(activeSection) : null;
        const el = key ? itemRefs.current[key] : null;
        if (container && el) {
            const c = container.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            setIndicator({ left: r.left - c.left, width: r.width });
        } else {
            setIndicator(null);
        }
    };

    useLayoutEffect(measure, [url]);
    useEffect(() => {
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    return (
        <nav
            ref={containerRef}
            className="relative hidden items-center gap-0.5 lg:flex"
        >
            <div
                className={cn(
                    'absolute inset-y-1 rounded-full bg-blue-50 transition-all duration-300 ease-out',
                    indicator ? 'opacity-100' : 'opacity-0',
                )}
                style={
                    indicator
                        ? { left: indicator.left, width: indicator.width }
                        : undefined
                }
            />
            {sections.map((section) => {
                const key = sectionKey(section);
                return (
                    <div
                        key={key}
                        ref={(el) => (itemRefs.current[key] = el)}
                        className="relative z-10"
                    >
                        {section.type === 'dropdown' ? (
                            <NavDropdown section={section} />
                        ) : (
                            <NavLink section={section} />
                        )}
                    </div>
                );
            })}
        </nav>
    );
}

function NavLink({
    section,
}: {
    section: Extract<MenuSection, { type: 'link' }>;
}) {
    const isActive = useIsActive()(section.url);
    const Icon = getIcon(section.icon);
    return (
        <Link
            href={section.url}
            className={cn(
                'flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors',
                isActive
                    ? 'text-blue-700'
                    : 'text-stone-500 hover:text-stone-900',
            )}
        >
            <Icon
                className={cn(
                    'h-[15px] w-[15px] shrink-0',
                    isActive ? 'text-blue-600' : 'text-stone-400',
                )}
            />
            {section.label}
        </Link>
    );
}

function NavDropdown({
    section,
}: {
    section: Extract<MenuSection, { type: 'dropdown' }>;
}) {
    const isItemActive = useIsActive();
    const groupActive = section.items.some((item) => isItemActive(item.url));
    const GroupIcon = getIcon(section.icon);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'group flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors outline-none',
                        groupActive
                            ? 'text-blue-700'
                            : 'text-stone-500 hover:text-stone-900',
                    )}
                >
                    <GroupIcon
                        className={cn(
                            'h-[15px] w-[15px] shrink-0',
                            groupActive ? 'text-blue-600' : 'text-stone-400',
                        )}
                    />
                    {section.label}
                    <ChevronDown className="h-3 w-3 shrink-0 text-stone-400 transition-transform duration-150 group-data-[state=open]:rotate-180" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                sideOffset={12}
                className="w-56 rounded-2xl border-stone-200/80 p-1.5 shadow-xl shadow-stone-900/[0.06]"
            >
                <DropdownMenuLabel className="px-2.5 pt-1.5 pb-1 text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
                    {section.label}
                </DropdownMenuLabel>
                {section.items.map((child) => {
                    const ChildIcon = getIcon(child.icon);
                    const active = isItemActive(child.url);
                    return (
                        <DropdownMenuItem
                            key={child.url}
                            asChild
                            className={cn(
                                'rounded-lg px-2.5 py-2',
                                active &&
                                    'bg-blue-50 text-blue-700 focus:bg-blue-50 focus:text-blue-700',
                            )}
                        >
                            <Link
                                href={child.url}
                                className="flex items-center gap-2.5"
                            >
                                <ChildIcon
                                    className={cn(
                                        'h-3.5 w-3.5 shrink-0',
                                        active
                                            ? 'text-blue-600'
                                            : 'text-stone-400',
                                    )}
                                />
                                <span className="truncate">{child.label}</span>
                            </Link>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function MobileNav({ sections }: { sections: MenuSection[] }) {
    const isItemActive = useIsActive();
    const [openGroup, setOpenGroup] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-stone-500 hover:bg-stone-100 lg:hidden"
                    aria-label="Buka menu"
                >
                    <Menu className="h-[18px] w-[18px]" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-r-0 bg-white p-0">
                <div className="flex h-16 items-center gap-2.5 border-b border-stone-100 px-5">
                    <BrandMark />
                    <div className="leading-tight">
                        <p className="text-sm font-bold tracking-tight text-neutral-900">
                            BPRL Panel
                        </p>
                        <p className="text-[10px] font-medium text-stone-400">
                            Admin v2.0
                        </p>
                    </div>
                </div>

                <nav className="flex flex-col gap-1 p-3">
                    {sections.map((section) => {
                        if (section.type === 'link') {
                            const Icon = getIcon(section.icon);
                            const active = isItemActive(section.url);
                            return (
                                <Link
                                    key={section.url}
                                    href={section.url}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                                        active
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-stone-600 hover:bg-stone-100',
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'h-4 w-4 shrink-0',
                                            active
                                                ? 'text-blue-600'
                                                : 'text-stone-400',
                                        )}
                                    />
                                    {section.label}
                                </Link>
                            );
                        }

                        const GroupIcon = getIcon(section.icon);
                        const groupActive = section.items.some((i) =>
                            isItemActive(i.url),
                        );
                        const isOpen = openGroup === section.id || groupActive;

                        return (
                            <div key={section.id}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenGroup(isOpen ? null : section.id)
                                    }
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                                        groupActive
                                            ? 'text-blue-700'
                                            : 'text-stone-600 hover:bg-stone-100',
                                    )}
                                >
                                    <GroupIcon
                                        className={cn(
                                            'h-4 w-4 shrink-0',
                                            groupActive
                                                ? 'text-blue-600'
                                                : 'text-stone-400',
                                        )}
                                    />
                                    <span className="flex-1 text-left">
                                        {section.label}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            'h-3.5 w-3.5 text-stone-400 transition-transform',
                                            isOpen && 'rotate-180',
                                        )}
                                    />
                                </button>
                                {isOpen && (
                                    <div className="mt-0.5 ml-[22px] flex flex-col gap-0.5 border-l border-stone-200 py-1 pl-3">
                                        {section.items.map((child) => {
                                            const ChildIcon = getIcon(
                                                child.icon,
                                            );
                                            const active = isItemActive(
                                                child.url,
                                            );
                                            return (
                                                <Link
                                                    key={child.url}
                                                    href={child.url}
                                                    onClick={() =>
                                                        setOpen(false)
                                                    }
                                                    className={cn(
                                                        'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                                                        active
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'text-stone-600 hover:bg-stone-100',
                                                    )}
                                                >
                                                    <ChildIcon
                                                        className={cn(
                                                            'h-3.5 w-3.5 shrink-0',
                                                            active
                                                                ? 'text-blue-600'
                                                                : 'text-stone-400',
                                                        )}
                                                    />
                                                    <span className="truncate">
                                                        {child.label}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    );
}

function FloatingNavbar({ user }: { user?: any }) {
    const sections = visibleSectionsFor(user);

    return (
        <div className="sticky top-0 z-40 px-3 pt-3 pb-2 sm:px-4">
            <div className="mx-auto max-w-7xl">
                <div className="flex h-14 items-center justify-between gap-3 rounded-2xl border border-stone-200/70 bg-white/85 px-3 shadow-sm shadow-stone-900/[0.04] backdrop-blur-md sm:px-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <MobileNav sections={sections} />

                        <button
                            onClick={() => router.visit('/')}
                            aria-label="Kembali ke beranda"
                            className="flex shrink-0 cursor-pointer items-center gap-2.5"
                        >
                            <img
                                src="/logo-djprl.png"
                                alt="Logo"
                                className="h-10"
                            />
                        </button>

                        <div className="hidden h-6 w-px bg-stone-200 lg:block" />

                        <DesktopNav sections={sections} />
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        <button className="hidden w-52 cursor-pointer items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-[13px] text-stone-400 transition-colors hover:border-stone-300 hover:bg-white xl:flex">
                            <Search className="h-3.5 w-3.5 shrink-0" />
                            <span className="flex-1 text-left">Cari...</span>
                            <kbd className="rounded-md border border-stone-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-400">
                                ⌘K
                            </kbd>
                        </button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-stone-500 hover:bg-stone-100 xl:hidden"
                            aria-label="Cari"
                        >
                            <Search className="h-[18px] w-[18px]" />
                        </Button>

                        <Button className="hidden gap-1.5 rounded-full bg-blue-600 px-4 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 sm:flex">
                            <Plus className="h-4 w-4" />
                            Buat
                        </Button>
                        <Button
                            size="icon"
                            className="rounded-full bg-blue-600 text-white hover:bg-blue-700 sm:hidden"
                            aria-label="Buat"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative rounded-full text-stone-500 hover:bg-stone-100"
                            aria-label="Notifikasi"
                        >
                            <Bell className="h-[18px] w-[18px]" />
                            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-white" />
                        </Button>

                        <div className="mx-0.5 hidden h-5 w-px bg-stone-200 sm:block" />

                        <ProfileMenu user={user} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function NavbarShell({ children, user }: { children: ReactNode; user: any }) {
    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-stone-50">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-radial-[at_50%_0%] from-blue-100/40 via-transparent to-transparent" />

            <FloatingNavbar user={user} />

            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>

            <footer className="shrink-0 border-t border-stone-200/70 bg-white/60 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 lg:px-8">
                    <p className="text-center text-[11px] font-medium text-stone-400">
                        Trika Media Solusindo{' '}
                        <span className="mx-1.5 text-blue-400">&bull;</span>{' '}
                        &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </footer>
        </div>
    );
}

/* ==================================================================== */
/*  ROOT LAYOUT — picks a shell by role                                  */
/*  admin, pemohon → SidebarShell   |   pegawai (default) → NavbarShell  */
/* ==================================================================== */
export default function MainLayout({
    children,
    pageTitle,
}: {
    children: ReactNode;
    pageTitle?: string;
}) {
    const { props } = usePage<any>();
    const user = props.auth?.user;
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const handleLogoutAnimation = () => {
            setIsLoggingOut(true);
        };
        window.addEventListener('trigger-logout-animation', handleLogoutAnimation);
        return () => window.removeEventListener('trigger-logout-animation', handleLogoutAnimation);
    }, []);

    const renderOverlay = () => {
        if (!isLoggingOut) return null;
        return (
            <div 
                className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white animate-in fade-in duration-300"
                style={{ zIndex: 99999 }}
            >
                <div className="relative flex items-center justify-center mb-4">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <LogOut className="absolute w-6 h-6 text-blue-400 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold tracking-tight animate-bounce">Sedang keluar...</h2>
                <p className="text-sm text-slate-400 mt-1">Mengamankan sesi Anda</p>
            </div>
        );
    };

    if (SIDEBAR_ROLES.includes(user?.role)) {
        return (
            <>
                {renderOverlay()}
                <SidebarShell pageTitle={pageTitle} user={user}>
                    {children}
                </SidebarShell>
            </>
        );
    }

    return (
        <>
            {renderOverlay()}
            <NavbarShell user={user}>{children}</NavbarShell>
        </>
    );
}
