import { useState } from "react";
import { Check, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export type TabMenuItem = {
    id: string;
    title: string;
    description: string;
    isReview?: boolean;
};

export const TAB_MENU: TabMenuItem[] = [
    {
        id: "identitas",
        title: "Identitas Pemohon",
        description: "Data legal dan kontak pemohon.",
    },
    {
        id: "bab_i",
        title: "I. Rencana Bangunan & Instalasi",
        description: "Uraian rencana kegiatan, koordinat, dan luasan.",
    },
    {
        id: "bab_ii",
        title: "II. Pemanfaatan Ruang Laut",
        description: "Aktivitas pemanfaatan ruang laut di sekitar lokasi.",
    },
    {
        id: "bab_iii",
        title: "III. Kondisi Terkini Lokasi",
        description: "Unggah laporan hidro-oseanografi sebagai lampiran.",
    },
    {
        id: "bab_iv",
        title: "IV. Persyaratan Reklamasi",
        description: "Isi bila kegiatan menggunakan reklamasi.",
    },
    {
        id: "analisis_ai",
        title: "Analisis AI",
        description: "AI menyusun narasi teknis per bagian.",
    },
    {
        id: "review",
        title: "Review & Selesai",
        description: "Periksa kembali seluruh isian sebelum diunduh.",
        isReview: true,
    },
];

type TabsVerticalProps = {
    value: string;
    onValueChange: (id: string) => void;
    completedIds?: string[];
};

export default function TabsVertical({ value, onValueChange, completedIds }: TabsVerticalProps) {
    const [collapsed, setCollapsed] = useState(false);
    const activeId = value;
    const activeIndex = TAB_MENU.findIndex((t) => t.id === activeId);

    const isCompleted = (id: string, idx: number) =>
        completedIds ? completedIds.includes(id) : idx < activeIndex;

    return (
        <TooltipProvider delay={0}>
            <aside
                className={cn(
                    "flex flex-col shrink-0 border-r border-slate-200 bg-white transition-all duration-300 ease-in-out rounded-l-2xl overflow-hidden",
                    collapsed ? "w-16" : "w-72"
                )}
            >
                {/* Header */}
                <div className={cn(
                    "flex items-center h-14 px-3 border-b border-slate-100 bg-slate-50/80",
                    collapsed ? "justify-center" : "justify-between"
                )}>
                    {!collapsed && (
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Langkah</p>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg shrink-0"
                        onClick={() => setCollapsed(v => !v)}
                    >
                        {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                    </Button>
                </div>

                {/* Steps */}
                <nav className="flex flex-col py-3 px-2 gap-0.5 flex-1 overflow-y-auto">
                    {TAB_MENU.map((tab, idx) => {
                        const done = isCompleted(tab.id, idx);
                        const active = tab.id === activeId;
                        const isLast = idx === TAB_MENU.length - 1;

                        const stepButton = (
                            <button
                                type="button"
                                onClick={() => onValueChange(tab.id)}
                                className={cn(
                                    "w-full flex items-start gap-3 text-left rounded-xl px-2 py-2 transition-all duration-150 group focus:outline-none",
                                    active
                                        ? "bg-indigo-50"
                                        : "hover:bg-slate-50",
                                    collapsed && "justify-center px-0"
                                )}
                            >
                                {/* Step indicator + connector */}
                                <div className="flex flex-col items-center shrink-0 pt-0.5">
                                    <div
                                        className={cn(
                                            "flex items-center justify-center rounded-full font-bold text-xs transition-all duration-200 shadow-sm",
                                            collapsed ? "h-8 w-8" : "h-6 w-6",
                                            done
                                                ? "bg-emerald-500 text-white shadow-emerald-200"
                                                : active
                                                    ? "bg-indigo-600 text-white shadow-indigo-200 ring-4 ring-indigo-100"
                                                    : "bg-white border-2 border-slate-200 text-slate-400 group-hover:border-indigo-300"
                                        )}
                                    >
                                        {done ? <Check size={12} strokeWidth={3} /> : <span>{idx + 1}</span>}
                                    </div>
                                    {!isLast && (
                                        <div className={cn(
                                            "w-px mt-1 flex-1 min-h-[20px]",
                                            done ? "bg-emerald-300" : "bg-slate-200"
                                        )} />
                                    )}
                                </div>

                                {/* Label */}
                                {!collapsed && (
                                    <div className="flex-1 min-w-0 pb-4">
                                        <p className={cn(
                                            "text-[13px] font-semibold leading-snug truncate",
                                            active ? "text-indigo-700" : done ? "text-slate-700" : "text-slate-500 group-hover:text-slate-700"
                                        )}>
                                            {tab.title}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                                            {tab.description}
                                        </p>
                                        {done && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 mt-1">
                                                <Check size={9} strokeWidth={3} /> Selesai
                                            </span>
                                        )}
                                        {active && !done && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5 mt-1">
                                                Sedang diisi
                                            </span>
                                        )}
                                    </div>
                                )}
                            </button>
                        );

                        if (collapsed) {
                            return (
                                <Tooltip key={tab.id}>
                                    <TooltipTrigger render={<span className="block" />}>
                                        {stepButton}
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p className="font-semibold">{tab.title}</p>
                                        <p className="text-xs text-slate-400">{tab.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return <div key={tab.id}>{stepButton}</div>;
                    })}
                </nav>
            </aside>
        </TooltipProvider>
    );
}