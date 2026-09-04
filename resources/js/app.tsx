import { createInertiaApp } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import 'toastr/build/toastr.min.css';
import { alertError, alertSuccess, getErrorMessage } from '@/lib/alert';

const appName = import.meta.env.VITE_APP_NAME || 'BPRL';

router.on('success', ({ detail: { page } }) => {
    const props = page.props as {
        flash?: { success?: string; error?: string };
        errors?: Record<string, string | string[]>;
    };

    if (props.flash?.success) alertSuccess(props.flash.success);
    if (props.flash?.error) alertError(props.flash.error);

    const firstError = Object.values(props.errors ?? {})[0];
    if (firstError) {
        alertError(Array.isArray(firstError) ? firstError[0] : firstError);
    }
});

router.on('error', ({ detail: { errors } }) => {
    const firstError = Object.values(errors ?? {})[0];
    alertError(firstError ?? 'Terjadi kesalahan');
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#2E86AB',
    },
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        if (!pages[`./pages/${name}.tsx`]) throw new Error(`Page not found: ${name}`);
        return pages[`./pages/${name}.tsx`]() as any;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
