// components/Navbar.tsx
import React, { useState, useRef, ChangeEvent } from 'react';
import {
    Menu,
    Download,
    Upload,
    FileJson,
    RefreshCw,
    Brain,
    Clock,
    AlertCircle,
    Check
} from 'lucide-react';
import { NavbarProps } from '../../types';

const Navbar: React.FC<NavbarProps> = ({
    title,
    subtitle,
    onExport,
    onImport,
    onReset,
    onGenerate,
    onAIConfig,
    isGenerateReady,
    progress,
    lastSaved,
    isMobile = false,
    onToggleMobile,
    className = ''
}) => {
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Format waktu
    const formatTime = (date: Date | null): string => {
        if (!date) return '—';
        return new Date(date).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Handle import file
    const handleImportClick = (): void => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if (file) {
            setIsImporting(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    onImport(data);
                    setIsImporting(false);
                } catch (error) {
                    console.error('Error importing data:', error);
                    setIsImporting(false);
                }
            };
            reader.readAsText(file);
        }
        event.target.value = '';
    };

    // Handle reset dengan konfirmasi
    const handleReset = (): void => {
        if (window.confirm('Yakin ingin menghapus semua data?')) {
            onReset();
        }
    };

    return (
        <header className={`
      sticky top-0 z-30 bg-white border-b border-gray-200
      ${className}
    `}>
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
                {/* Left Section - Title & Progress */}
                <div className="flex items-center gap-4 min-w-0">
                    {/* Mobile Toggle */}
                    {isMobile && (
                        <button
                            onClick={onToggleMobile}
                            className="
                lg:hidden p-1.5 rounded-lg 
                hover:bg-gray-100 transition-colors 
                text-gray-600
                focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/50
              "
                            aria-label="Toggle menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    )}

                    <div className="min-w-0">
                        <h2 className="text-sm sm:text-base font-semibold text-[#163945] truncate">
                            {title}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="truncate">{subtitle}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                            <span className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                {formatTime(lastSaved)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {/* AI Config Button */}
                    <button
                        onClick={onAIConfig}
                        className="
              p-2 rounded-lg border border-[#7D3C98]/30 
              text-[#7D3C98] hover:bg-[#7D3C98]/10 
              transition-all duration-200 group relative
              focus:outline-none focus:ring-2 focus:ring-[#7D3C98]/50
            "
                        title="Konfigurasi AI"
                    >
                        <Brain className="w-4 h-4" />
                        <span className="
              absolute -top-1 -right-1 
              w-2.5 h-2.5 rounded-full 
              bg-[#7D3C98] border-2 border-white
              animate-pulse
            " />
                    </button>

                    {/* Import Button */}
                    <button
                        onClick={handleImportClick}
                        className="
              p-2 rounded-lg border border-gray-200 
              hover:border-[#2E86AB] hover:text-[#2E86AB] 
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/50
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                        title="Impor Data (.json)"
                        disabled={isImporting}
                    >
                        {isImporting ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="hidden"
                        aria-label="Import file"
                    />

                    {/* Export Button */}
                    <button
                        onClick={onExport}
                        className="
              p-2 rounded-lg border border-gray-200 
              hover:border-[#2E86AB] hover:text-[#2E86AB] 
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#2E86AB]/50
            "
                        title="Ekspor Data (.json)"
                    >
                        <FileJson className="w-4 h-4" />
                    </button>

                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
                        className="
              p-2 rounded-lg border border-red-200 
              text-red-500 hover:bg-red-50 
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-red-500/50
            "
                        title="Reset Semua Data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    {/* Separator */}
                    <div className="w-px h-6 bg-gray-200 mx-0.5 hidden sm:block" />

                    {/* Generate Button */}
                    <button
                        onClick={onGenerate}
                        disabled={!isGenerateReady}
                        className={`
              px-3 sm:px-4 py-2 rounded-lg font-semibold 
              text-xs sm:text-sm
              flex items-center gap-1.5 sm:gap-2 
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[#163945]/50
              ${isGenerateReady
                                ? 'bg-[#163945] text-white hover:bg-[#2E86AB] shadow-lg shadow-[#163945]/20 hover:shadow-[#2E86AB]/30'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }
            `}
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Unduh Draft</span>
                        <span className="sm:hidden">Unduh</span>
                        {!isGenerateReady && (
                            <AlertCircle className="w-3.5 h-3.5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Progress Bar (Mobile Friendly) */}
            <div className="px-4 pb-2 flex items-center gap-3 sm:hidden">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#2E86AB] rounded-full transition-all duration-500"
                        style={{
                            width: `${progress.total > 0 ? (progress.filled / progress.total) * 100 : 0}%`
                        }}
                    />
                </div>
                <span className="text-[10px] font-medium text-gray-500 flex-shrink-0">
                    {progress.filled}/{progress.total}
                </span>
            </div>
        </header>
    );
};

export default Navbar;