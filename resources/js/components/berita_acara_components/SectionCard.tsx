export function SectionCard({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Icon className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            </div>
            <div className="space-y-5 p-5">{children}</div>
        </div>
    );
}
