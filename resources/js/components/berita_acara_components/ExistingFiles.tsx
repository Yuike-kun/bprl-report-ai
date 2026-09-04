import { X } from 'lucide-react';
import type { ExistingDocument } from '@/components/types/berita-acara';

export function ExistingFiles({
    docs,
    onRemove,
}: {
    docs: ExistingDocument[];
    onRemove: (d: ExistingDocument) => void;
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
                    <button
                        type="button"
                        onClick={() => onRemove(d)}
                        className="ml-2 shrink-0 text-emerald-500 hover:text-red-500"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </li>
            ))}
        </ul>
    );
}
