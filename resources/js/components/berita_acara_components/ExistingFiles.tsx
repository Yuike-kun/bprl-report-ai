import { RefreshCw, X } from 'lucide-react';
import type { ExistingDocument } from '@/components/types/berita-acara';

export function ExistingFiles({
    docs,
    onRemove,
    onReplace,
}: {
    docs: ExistingDocument[];
    onRemove: (d: ExistingDocument) => void;
    onReplace?: (d: ExistingDocument) => void;
}) {
    if (!docs.length) return null;
    return (
        <ul className="mb-2 space-y-1.5">
            {docs.map((d) => (
                <li
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs"
                >
                    <a
                        href={`/storage/${d.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate font-medium text-emerald-700 hover:underline"
                    >
                        {d.file_name}
                    </a>
                    <span className="ml-2 flex shrink-0 items-center gap-1.5">
                        {onReplace && (
                            <button
                                type="button"
                                onClick={() => onReplace(d)}
                                title="Ganti file ini"
                                className="text-emerald-600 hover:text-blue-600"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => onRemove(d)}
                            title="Hapus file ini"
                            className="text-emerald-500 hover:text-red-500"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </span>
                </li>
            ))}
        </ul>
    );
}
