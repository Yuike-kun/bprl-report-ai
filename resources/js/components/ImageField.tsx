import { alertError } from '@/lib/alert';
import React, { useState, useRef, type ClipboardEvent, type DragEvent } from 'react';
import { Clipboard, X, Upload } from 'lucide-react';

interface ImageFieldProps {
    name: string;
    label: string;
    hint?: string;
    optionalNote?: string;
    maxFiles?: number;
    images: File[];
    onChange: (name: string, files: File[]) => void;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

export const ImageField = React.memo(function ImageField({
    name,
    label,
    hint,
    optionalNote,
    maxFiles,
    images,
    onChange,
}: ImageFieldProps) {
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addFiles = React.useCallback((fileList: FileList | File[]) => {
        const incoming = Array.from(fileList).filter((f) => {
            if (!ALLOWED_TYPES.includes(f.type)) {
                alertError('Format file tidak didukung. Hanya PNG dan JPG/JPEG yang diperbolehkan.');
                return false;
            }
            return true;
        });
        if (!incoming.length) return;
        const next = [...images, ...incoming];
        onChange(name, maxFiles ? next.slice(0, maxFiles) : next);
    }, [images, maxFiles, name, onChange]);

    const removeAt = React.useCallback(
        (idx: number) => {
            onChange(
                name,
                images.filter((_, i) => i !== idx),
            );
        },
        [images, name, onChange],
    );

    const handlePaste = React.useCallback((e: ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        const files: File[] = [];
        for (const item of items) {
            if (item.type.indexOf('image/') === 0) {
                const f = item.getAsFile();
                if (f) files.push(f);
            }
        }
        if (files.length) addFiles(files);
    }, [addFiles]);

    const handleDrop = React.useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    }, [addFiles]);

    return (
        <div className="mb-4">
            <label className="mb-[3px] block text-[12.5px] font-bold text-[#123A63]">
                {label}
                {optionalNote && (
                    <span className="font-normal text-[#5b6b7c]">
                        {' '}
                        {optionalNote}
                    </span>
                )}
            </label>
            {hint && (
                <div className="mb-1.5 text-[11px] text-[#5b6b7c]">{hint}</div>
            )}

            <div className="mx-auto flex max-w-[420px] items-stretch justify-center gap-2 sm:max-w-none">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-10 w-[110px] shrink-0 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-[#e3e9f0] bg-white px-2.5 text-[12.5px] font-bold whitespace-nowrap text-[#123A63] hover:border-[#cfe0f5] hover:bg-[#f3f8ff]"
                >
                    <Upload className="h-4 w-4 text-[#1E63C7]" />
                    Upload File
                </button>

                <div
                    tabIndex={0}
                    onPaste={handlePaste}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={
                        'flex h-10 w-[90px] shrink-0 cursor-text items-center justify-center gap-[5px] rounded-[10px] border-2 border-dashed px-2.5 transition-colors outline-none ' +
                        (dragOver
                            ? 'border-[#1E63C7] bg-[#eef5fd]'
                            : 'border-[#b9cbe0] bg-[#f7fafd] hover:border-[#1E63C7] hover:bg-[#eef5fd]')
                    }
                >
                    <Clipboard className="h-[15px] w-[15px] shrink-0 text-[#1E63C7]" />
                    <span className="text-[11px] leading-[1.25] whitespace-nowrap text-[#5b6b7c]">
                        <b className="text-[#123A63]">Ctrl+V</b>
                        <br />
                        paste
                    </span>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                multiple
                className="hidden"
                onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files);
                    e.target.value = '';
                }}
            />

            {images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {images.map((file, idx) => (
                        <div
                            key={idx}
                            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#e3e9f0]"
                        >
                            <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="h-full w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeAt(idx)}
                                className="absolute top-0.5 right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-black/55 text-white"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});
