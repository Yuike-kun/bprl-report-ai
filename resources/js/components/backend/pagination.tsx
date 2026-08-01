import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginationProps = {
    links: PaginationLink[];
    currentPage: number;
    lastPage: number;
    onNavigate: (url: string) => void;
    className?: string;
};

export function Pagination({ links, currentPage, lastPage, onNavigate, className }: PaginationProps) {
    return (
        <div className={cn("flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40", className)}>
            <p className="text-xs text-slate-500">
                Halaman <span className="font-bold text-slate-700">{currentPage}</span> dari {lastPage}
            </p>
            <div className="flex items-center gap-1">
                {links.map((link, index) => {
                    if (link.label.includes("Previous")) {
                        return (
                            <Button
                                key={index}
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                disabled={!link.url}
                                onClick={() => link.url && onNavigate(link.url)}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                        );
                    }

                    if (link.label.includes("Next")) {
                        return (
                            <Button
                                key={index}
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                disabled={!link.url}
                                onClick={() => link.url && onNavigate(link.url)}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        );
                    }

                    return (
                        <Button
                            key={index}
                            variant={link.active ? "default" : "outline"}
                            size="icon"
                            className={cn(
                                "h-8 w-8 rounded-lg text-xs",
                                link.active && "bg-indigo-600 hover:bg-indigo-700 border-indigo-600"
                            )}
                            onClick={() => link.url && onNavigate(link.url)}
                        >
                            {link.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}