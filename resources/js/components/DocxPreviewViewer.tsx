import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DocxPreviewViewerProps {
    htmlContent: string | null;
    title?: string;
    subtitle?: string;
    onDownload?: () => void;
    isDownloading?: boolean;
}

export default function DocxPreviewViewer({
    htmlContent,
    title = "Pratinjau Dokumen (.docx)",
    subtitle,
    onDownload,
    isDownloading = false,
}: DocxPreviewViewerProps) {
    const [zoom, setZoom] = useState<number>(100);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    // Prevent body scrolling & handle ESC key in fullscreen mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFullscreen]);

    if (!htmlContent) {
        return (
            <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd5e1] bg-slate-50 p-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#1E63C7]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                    </svg>
                </div>
                <h4 className="text-sm font-bold text-[#123A63]">Pratinjau Belum Tersedia</h4>
                <p className="mt-1 text-xs text-slate-500">
                    Klik "Simpan Perubahan" atau lengkapi formulir untuk membangkitkan pratinjau dokumen 1:1 Word.
                </p>
            </div>
        );
    }

    const renderToolbar = (full: boolean) => (
        <div className={`flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] px-4 py-3 ${full ? 'bg-slate-900 text-white border-slate-700' : 'bg-[#f8fafc]'}`}>
            <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1F4E79] text-white shadow-xs">
                    <span className="text-[10px] font-black tracking-tighter">DOCX</span>
                </div>
                <div>
                    <h3 className={`text-[13px] font-bold leading-tight ${full ? 'text-white' : 'text-[#123A63]'}`}>{title}</h3>
                    {subtitle && <p className={`text-[10.5px] ${full ? 'text-slate-300' : 'text-slate-500'}`}>{subtitle}</p>}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Zoom Selector */}
                <div className={`flex items-center rounded-lg border px-2 py-1 text-xs font-semibold shadow-xs ${full ? 'border-slate-700 bg-slate-800 text-white' : 'border-[#cbd5e1] bg-white text-slate-700'}`}>
                    <span className={`mr-1.5 text-[11px] ${full ? 'text-slate-400' : 'text-slate-400'}`}>Skala:</span>
                    <select
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className={`bg-transparent text-xs font-bold focus:outline-none cursor-pointer ${full ? 'text-white' : 'text-[#123A63]'}`}
                    >
                        <option value={75} className="text-slate-900">75%</option>
                        <option value={90} className="text-slate-900">90%</option>
                        <option value={100} className="text-slate-900">100% (A4 Standard)</option>
                        <option value={115} className="text-slate-900">115%</option>
                        <option value={125} className="text-slate-900">125%</option>
                    </select>
                </div>

                {/* Fullscreen Toggle Button */}
                <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title={full ? "Keluar Layar Penuh (Esc)" : "Layar Penuh"}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer ${
                        full
                            ? 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700'
                            : 'border-[#cbd5e1] bg-white text-slate-700 hover:bg-slate-50 hover:text-[#123A63]'
                    }`}
                >
                    {full ? (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                            </svg>
                            <span className="hidden sm:inline">Kecilkan</span>
                        </>
                    ) : (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                            </svg>
                            <span className="hidden sm:inline">Layar Penuh</span>
                        </>
                    )}
                </button>

                {/* Download Action Button */}
                {onDownload && (
                    <button
                        type="button"
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-1.5 rounded-lg bg-[#1E63C7] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#1852a7] transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        <span>{isDownloading ? "Mengunduh..." : "Unduh DOCX"}</span>
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Inline Viewer */}
            <div className="flex flex-col rounded-2xl bg-white shadow-[0_6px_24px_rgba(18,58,99,0.08)] border border-[#e2e8f0] overflow-hidden">
                {renderToolbar(false)}
                <div className="relative min-h-[68vh] w-full bg-[#cbd5e1]/40 overflow-hidden flex justify-center">
                    <iframe
                        key={`${htmlContent.length}-${zoom}-inline`}
                        title="Pratinjau Dokumen 1:1 Word"
                        srcDoc={htmlContent}
                        className="h-[72vh] w-full border-0 transition-transform origin-top"
                        style={{
                            transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none',
                            width: zoom !== 100 ? `${(100 / zoom) * 100}%` : '100%',
                        }}
                    />
                </div>
            </div>

            {/* Fullscreen Overlay Viewer via React Portal to document.body */}
            {isFullscreen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] flex flex-col bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
                    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-700">
                        {renderToolbar(true)}
                        <div className="relative flex-1 w-full bg-[#cbd5e1]/50 overflow-hidden flex justify-center">
                            <iframe
                                key={`${htmlContent.length}-${zoom}-fullscreen`}
                                title="Pratinjau Dokumen Fullscreen 1:1 Word"
                                srcDoc={htmlContent}
                                className="h-full w-full border-0 transition-transform origin-top"
                                style={{
                                    transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none',
                                    width: zoom !== 100 ? `${(100 / zoom) * 100}%` : '100%',
                                }}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
