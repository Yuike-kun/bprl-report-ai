import { Head } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export default function Heading({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: LucideIcon;
    title: string;
    description?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="mb-6 flex items-center justify-between gap-4">
            <Head title={title} />
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/20">
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-xl leading-none font-bold text-slate-900">
                        {title}
                    </h1>
                    <p className="mt-0.5 text-sm text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </div>
    );
}
