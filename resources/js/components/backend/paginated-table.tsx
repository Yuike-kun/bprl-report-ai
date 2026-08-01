import { Search } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PaginatedTableProps = {
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder: string;
    summary: ReactNode;
    tableHead: ReactNode;
    children: ReactNode;
    emptyState: ReactNode;
    isEmpty: boolean;
    pagination?: ReactNode;
    className?: string;
    toolbarClassName?: string;
};

export function PaginatedTable({
    searchValue,
    onSearchChange,
    searchPlaceholder,
    summary,
    tableHead,
    children,
    emptyState,
    isEmpty,
    pagination,
    className,
    toolbarClassName,
}: PaginatedTableProps) {
    return (
        <div className={cn("bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden", className)}>
            <div
                className={cn(
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-100",
                    toolbarClassName
                )}
            >
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-72 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-300 transition-all">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={event => onSearchChange(event.target.value)}
                        className="bg-transparent text-sm text-slate-700 w-full outline-none placeholder:text-slate-400"
                    />
                </div>
                <p className="text-xs text-slate-400 shrink-0">{summary}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>{tableHead}</thead>
                    <tbody className="divide-y divide-slate-100">
                        {isEmpty ? emptyState : children}
                    </tbody>
                </table>
            </div>

            {pagination}
        </div>
    );
}