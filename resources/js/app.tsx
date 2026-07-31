import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'BPRL';

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
