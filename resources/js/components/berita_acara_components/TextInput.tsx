import { FieldError } from './FieldError';

export function TextInput({
    value,
    onChange,
    placeholder = '',
    error,
    type = 'text',
    readOnly,
    ...props
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string;
    type?: string;
    readOnly?: boolean;
    props?: any;
}) {
    return (
        <div>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all focus:ring-2 focus:outline-none ${error ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}`}
                {...props}
            />
            <FieldError message={error} />
        </div>
    );
}
