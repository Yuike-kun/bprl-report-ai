import { Editor } from '@tinymce/tinymce-react';
import { useEffect, useRef, useState } from 'react';
import { FieldError } from './FieldError';
import { isRichTextEmpty } from './rich-text';

// Tiny Cloud key dari akun TinyMCE sendiri — isi di .env:
//   VITE_TINYMCE_API_KEY=xxxx
// Selama kosong, editor memakai bundel TinyMCE self-hosted lokal
// (tidak butuh internet ke cdn.tiny.cloud, tanpa API key).
const CLOUD_API_KEY =
    (import.meta.env.VITE_TINYMCE_API_KEY as string | undefined) || '';

const CONTENT_STYLE = [
    'body { font-family: inherit; font-size: 14px; line-height: 1.6; color: #1e293b; }',
    'p { margin: 0 0 0.6em; }',
    'h3 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0.8em 0 0.4em; }',
    'ul { list-style-type: disc; padding-left: 1.5em; margin: 0 0 0.6em; }',
    'ol { list-style-type: decimal; padding-left: 1.5em; margin: 0 0 0.6em; }',
    'li { margin: 0.2em 0; }',
].join('\n');

/**
 * Word-like rich-text editor for the Berita Acara paragraph fields
 * (catatan hasil, deskripsi kegiatan, ...). Stores plain HTML strings —
 * the same shape the old textarea stored plain text in — so submit,
 * validation and the PDF renderer keep working unchanged, and legacy
 * plain-text rows still load (they render as a single paragraph).
 */
export function RichTextEditor({
    label,
    value,
    onChange,
    placeholder,
    error,
    minHeight = 120,
}: {
    label?: string;
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    error?: string;
    minHeight?: number;
}) {
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    });

    // Self-hosted fallback: load the local TinyMCE bundle (core + silver
    // theme + lists plugin + Indonesian lang + skin) once, only when no
    // Cloud key is configured. The Editor below then picks up the global
    // `tinymce` instead of downloading it from the CDN.
    const [localReady, setLocalReady] = useState(false);

    useEffect(() => {
        if (CLOUD_API_KEY || localReady) {
            return;
        }

        let cancelled = false;

        void (async () => {
            await import('tinymce/tinymce');
            await Promise.all([
                import('tinymce/models/dom'),
                import('tinymce/themes/silver'),
                import('tinymce/icons/default'),
                import('tinymce/plugins/lists'),
                import('tinymce-i18n/langs/id.js'),
                import('tinymce/skins/ui/oxide/skin.css'),
            ]);

            if (!cancelled) {
                setLocalReady(true);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [localReady]);

    if (!CLOUD_API_KEY && !localReady) {
        return null;
    }

    return (
        <div>
            {label && (
                <p className="mb-1.5 text-sm font-semibold text-slate-700">
                    {label}
                </p>
            )}
            <div
                className={`overflow-hidden rounded-xl border bg-white transition-all ${
                    error ? 'border-red-400' : 'border-slate-200'
                }`}
            >
                <Editor
                    apiKey={CLOUD_API_KEY || undefined}
                    licenseKey={CLOUD_API_KEY ? undefined : 'gpl'}
                    value={value}
                    onEditorChange={(content) => {
                        onChangeRef.current(
                            isRichTextEmpty(content) ? '' : content,
                        );
                    }}
                    init={{
                        height: minHeight + 46,
                        menubar: false,
                        statusbar: false,
                        language: 'id',
                        plugins: 'lists',
                        toolbar:
                            'undo redo | bold italic underline strikethrough | blocks | bullist numlist | alignleft aligncenter alignjustify | removeformat',
                        block_formats: 'Paragraf=p; Judul 3=h3',
                        placeholder,
                        content_style: CONTENT_STYLE,
                    }}
                />
            </div>
            <FieldError message={error} />
        </div>
    );
}
