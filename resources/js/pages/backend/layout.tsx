import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    PanelRightClose,
    PanelRightOpen,
    Settings,
    Upload,
    Download,
    Trash2,
    FileText,
    Menu
} from "lucide-react";
import { ReactNode, useState } from "react";
import MENU from './menu.json';
import { usePage, Link } from "@inertiajs/react";

function Sidebar({ collapsed }: { collapsed: boolean }) {
    const { url, component, props } = usePage<any>()
    const user = props.auth?.user;
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    return (
        <aside
            className={cn(
                "bg-slate-950 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800",
                collapsed ? "w-0 opacity-0 overflow-hidden" : "w-72 opacity-100"
            )}
        >
            {/* Brand Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-white tracking-tight text-lg">
                        DraftGen
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                    Menu Utama
                </div>
                {MENU.map((menu, index) => (
                    <a
                        key={index}
                        href={menu.url}
                        className={"group flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium transition-all duration-200 hover:bg-slate-800 hover:text-white" + (url == menu.url ? ' bg-slate-800/50 border-l-2 border-slate-500' : '')}
                    >
                        <span className={"w-1.5 h-1.5 rounded-full group-hover:bg-indigo-400 transition-colors" + (url == menu.url ? ' bg-indigo-400' : 'bg-slate-600')} />
                        {menu.label}
                    </a>
                ))}
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 relative">
                {profileDropdownOpen && (
                    <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                        <Link 
                            href="/profile" 
                            className="w-full flex items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left border-b border-slate-700"
                            onClick={() => setProfileDropdownOpen(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Profile Details
                        </Link>
                        <Link 
                            href="/logout" 
                            method="post" 
                            as="button" 
                            className="w-full flex items-center px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left"
                            onClick={() => setProfileDropdownOpen(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Logout
                        </Link>
                    </div>
                )}
                <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-left focus:outline-none"
                >
                    <Avatar className="h-9 w-9 border border-slate-700 shrink-0">
                        <AvatarFallback className="bg-slate-800 text-slate-400">
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.name || "Admin User"}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || "admin@example.com"}</p>
                    </div>
                </button>
            </div>
        </aside>
    );
}

// Added pageTitle prop
function Navbar({ onToggleSidebar, pageTitle }: { onToggleSidebar: () => void, pageTitle?: string }) {
    const BUTTONS = [
        {
            icon: Settings,
            label: "Konfigurasi AI",
            variant: "outline" as const,
            className: "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        },
        {
            icon: Upload,
            label: "Import JSON",
            variant: "outline" as const,
            className: "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        },
        {
            icon: Download,
            label: "Export JSON",
            variant: "outline" as const,
            className: "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        },
        {
            icon: Trash2,
            label: "Bersihkan",
            variant: "ghost" as const,
            className: "text-red-500 hover:bg-red-50 hover:text-red-600"
        },
        {
            icon: FileText,
            label: "Unduh Draft (.doc)",
            variant: "default" as const,
            className: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
        }
    ];

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>
                {/* Use the prop instead of document.title */}
                <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
                    {pageTitle || "Dashboard"}
                </h2>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {BUTTONS.map((button, index) => (
                    <Button
                        key={index}
                        variant={button.variant}
                        size="sm"
                        onClick={button.label.includes("Unduh") ? () => {
                            const form = document.createElement("form");
                            form.method = "POST";
                            form.action = "/pkkprl/generate-docx-from-report";
                            form.target = "_blank";
                            const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
                            if (csrfMeta?.content) {
                                const csrfInput = document.createElement("input");
                                csrfInput.type = "hidden";
                                csrfInput.name = "_token";
                                csrfInput.value = csrfMeta.content;
                                form.appendChild(csrfInput);
                            }
                            document.body.appendChild(form);
                            form.submit();
                            document.body.removeChild(form);
                        } : undefined}
                        className={cn(
                            "whitespace-nowrap flex items-center gap-2 transition-all duration-200",
                            button.className
                        )}
                    >
                        <button.icon className="w-4 h-4" />
                        <span className="hidden md:inline">{button.label}</span>
                    </Button>
                ))}
            </div>
        </header>
    );
}

// Added pageTitle prop to MainLayout
export default function MainLayout({ children, pageTitle }: { children: ReactNode, pageTitle?: string }) {
    const [sidebarCollapse, setSidebarCollapse] = useState(false);

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
            <Sidebar collapsed={sidebarCollapse} />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Pass the title down to Navbar */}
                <Navbar
                    onToggleSidebar={() => setSidebarCollapse(!sidebarCollapse)}
                    pageTitle={pageTitle}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}