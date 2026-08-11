import { FieldError } from './FieldError';

export function TextareaInput({
    value,
    onChange,
    placeholder = '',
    error,
    rows = 4,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string;
    rows?: number;
}) {
    return (
        <div>
            <textarea
                rows={rows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all focus:ring-2 focus:outline-none ${error ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`}
            />
            <FieldError message={error} />
        </div>
    );
}
