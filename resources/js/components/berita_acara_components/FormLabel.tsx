export function FormLabel({
    children,
    required,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="mb-1.5 block text-xs font-bold text-slate-700">
            {children}
            {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
    );
}
