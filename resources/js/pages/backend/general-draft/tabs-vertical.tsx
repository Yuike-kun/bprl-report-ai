import { useState } from "react";
import { Check, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
        title: "I. Rencana Bangunan & Instalasi Laut",
        description: "Uraian rencana kegiatan utama/penunjang, koordinat, dan luasan.",
    },
    {
        id: "bab_ii",
        title: "II. Informasi Pemanfaatan Ruang Laut",
        description: "Deskripsi aktivitas pemanfaatan ruang laut lain di sekitar lokasi dan jaraknya.",
    },
    {
        id: "bab_iii",
        title: "III. Data Kondisi Terkini Lokasi",
        description: "Unggah dokumen laporan hidro-oseanografi (PDF/Word) sebagai lampiran kondisi terkini.",
    },
    {
        id: "bab_iv",
        title: "IV. Persyaratan Reklamasi (Jika Ada)",
        description: "Isi bagian ini apabila kegiatan menggunakan reklamasi.",
    },
    {
        id: "analisis_ai",
        title: "Analisis & Susun Narasi (AI)",
        description: "AI membaca dokumen Bab III dan menyusun narasi teknis per bagian.",
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

/**
 * Stepper vertikal untuk wizard PKKPRL.
 *
 * - value / onValueChange: id step aktif, dikontrol dari luar
 * - completedIds: id step yang sudah lengkap terisi. Kalau tidak diberikan,
 *   step sebelum step aktif dianggap selesai (asumsi default untuk alur linear)
 */
export default function TabsVertical({ value, onValueChange, completedIds }: TabsVerticalProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [internalValue, setInternalValue] = useState("identitas");
    const activeId = value ?? internalValue;
    const activeIndex = TAB_MENU.findIndex((t) => t.id === activeId);

    const isCompleted = (id: string, idx: number) =>
        completedIds ? completedIds.includes(id) : idx < activeIndex;

    return (
        <TooltipProvider>
            <div
                className={[
                    "flex flex-col shrink-0 border me-3 transition-all duration-200",
                    collapsed ? "w-14" : "w-72",
                ].join(" ")}
            >
                <div
                    className={[
                        "flex items-center h-11 px-2 border-b",
                        collapsed ? "justify-center" : "justify-end",
                    ].join(" ")}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => setCollapsed((v) => !v)}
                    >
                        {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                    </Button>
                </div>

                <Tabs
                    value={activeId}
                    onValueChange={onValueChange ?? setInternalValue}
                    orientation="vertical"
                >
                    <TabsList className="flex flex-col w-full h-auto items-stretch bg-transparent pl-2">
                        {TAB_MENU.map((tab, idx) => {
                            const done = isCompleted(tab.id, idx);
                            const active = tab.id === activeId;
                            const isLast = idx === TAB_MENU.length - 1;

                            const marker = (
                                <span
                                    className={[
                                        "flex items-center justify-center rounded-full shrink-0 transition-colors",
                                        collapsed ? "h-8 w-8" : "h-6 w-6",
                                        done
                                            ? "bg-teal-600 text-white"
                                            : active
                                                ? "border-2 border-teal-600 text-teal-700 bg-white"
                                                : "border border-border text-muted-foreground bg-background",
                                    ].join(" ")}
                                >
                                    {done ? (
                                        <Check size={13} strokeWidth={2.5} />
                                    ) : (
                                        <span className="text-[11px] font-medium leading-none">{idx + 1}</span>
                                    )}
                                </span>
                            );

                            const trigger = (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className={[
                                        "flex w-full min-w-0 items-start text-start",
                                        collapsed ? "justify-center px-2" : "gap-3 px-4",
                                        "whitespace-normal h-auto rounded-none bg-transparent p-0 shadow-none",
                                        "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                                        "focus-visible:ring-0 focus-visible:outline-none",
                                    ].join(" ")}
                                >
                                    <span className="flex flex-col items-center shrink-0">
                                        {marker}
                                        {!isLast && (
                                            <span
                                                className={[
                                                    "w-px flex-1 my-1 min-h-2.5",
                                                    done ? "bg-teal-600" : "bg-border",
                                                ].join(" ")}
                                            />
                                        )}
                                    </span>

                                    {!collapsed && (
                                        <span className="min-w-0 flex-1 pb-5">
                                            <span
                                                className={[
                                                    "block text-[13px] font-medium leading-snug",
                                                    active ? "text-teal-700" : "text-foreground",
                                                ].join(" ")}
                                            >
                                                {tab.title}
                                            </span>
                                            <span className="block text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                                                {tab.description}
                                            </span>
                                        </span>
                                    )}
                                </TabsTrigger>
                            );

                            return collapsed ? (
                                <Tooltip key={tab.id}>
                                    <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p className="font-medium">{tab.title}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                trigger
                            );
                        })}
                    </TabsList>
                </Tabs>
            </div>
        </TooltipProvider>
    );
}