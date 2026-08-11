import { FieldError } from './FieldError';

export function RadioGroup({
    name,
    value,
    options,
    onChange,
    error,
    cols = 1,
}: {
    name: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (v: string) => void;
    error?: string;
    cols?: number;
}) {
    return (
        <div>
            <div
                className={`grid gap-2 ${cols === 2 ? 'sm:grid-cols-2' : cols === 3 ? 'sm:grid-cols-3' : ''}`}
            >
                {options.map((opt) => (
                    <label
                        key={opt.value}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                            value === opt.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/40'
                        }`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={() => onChange(opt.value)}
                            className="hidden"
                        />
                        <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${value === opt.value ? 'border-blue-500' : 'border-slate-300'}`}
                        >
                            {value === opt.value && (
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                        </span>
                        {opt.label}
                    </label>
                ))}
            </div>
            <FieldError message={error} />
        </div>
    );
}
