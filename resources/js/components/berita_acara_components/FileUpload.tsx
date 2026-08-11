import { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { FieldError } from './FieldError';

export function FileUpload({
    label,
    name,
    multiple,
    max,
    files,
    onChange,
    error,
}: {
    label: string;
    name: string;
    multiple?: boolean;
    max?: number;
    files: File[];
    onChange: (files: File[]) => void;
    error?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files || []);
        if (multiple) {
            const merged = [...files, ...picked].slice(0, max ?? 5);
            onChange(merged);
        } else {
            onChange([picked[0]]);
        }
        e.target.value = '';
    };

    const remove = (idx: number) => onChange(files.filter((_, i) => i !== idx));

    return (
        <div>
            <div
                className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all hover:border-blue-400 hover:bg-blue-50/40 ${error ? 'border-red-400' : 'border-slate-200'}`}
                onClick={() => inputRef.current?.click()}
            >
                <Upload className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
                <p className="text-xs font-semibold text-slate-600">{label}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                    {multiple ? `Maks. ${max ?? 5} file` : '1 file'} • Maks. 10
                    MB
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    multiple={multiple}
                    className="hidden"
                    onChange={handleChange}
                />
            </div>

            {files.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                    {files.map((f, i) => (
                        <li
                            key={i}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                        >
                            <span className="truncate font-medium text-slate-700">
                                {f.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => remove(i)}
                                className="ml-2 shrink-0 text-slate-400 hover:text-red-500"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <FieldError message={error} />
        </div>
    );
}
