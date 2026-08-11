import { AlertCircle } from 'lucide-react';

export function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {message}
        </p>
    );
}
