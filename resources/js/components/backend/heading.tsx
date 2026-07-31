import { Head } from "@inertiajs/react"

export default function Heading({ title, description }: { title: string, description?: string }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <Head title={title} />
            <div>
                <h1 className="text-xl font-semibold">{title}</h1>
                {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
        </div>
    );
}