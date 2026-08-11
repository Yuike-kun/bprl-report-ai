import { ChevronDown } from 'lucide-react';
import { FieldError } from './FieldError';

export function SelectInput({
    value,
    onChange,
    options,
    placeholder = 'Pilih...',
    error,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
    placeholder?: string;
    error?: string;
}) {
    return (
        <div>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-800 transition-all focus:ring-2 focus:outline-none ${error ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`}
                >
                    <option value="">{placeholder}</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            <FieldError message={error} />
        </div>
    );
}
