// components/Sidebar.tsx
import React, { useState } from 'react';
import {
    Anchor,
    Database,
    ChevronRight,
    CheckCircle,
    Circle,
    User,
    Building,
    Map,
    Waves,
    Recycle,
    Brain,
    FileCheck,
    LucideIcon,
    Menu,
    X
} from 'lucide-react';
import { SidebarProps, Section } from '../../types';

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
    'identitas': User,
    'bab_i': Building,
    'bab_ii': Map,
    'bab_iii': Waves,
    'bab_iv': Recycle,
    'analisis_ai_menu': Brain,
    'review': FileCheck,
};

const Sidebar: React.FC<SidebarProps> = ({
    sections,
    currentSection,
    onSectionChange,
    progress,
    className = ''
}) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    // Get icon untuk section
    const getSectionIcon = (sectionId: string): LucideIcon => {
        return ICON_MAP[sectionId] || Circle;
    };

    // Get status color berdasarkan progress
    const getStatusColor = (filled: number, total: number): string => {
        const ratio = total > 0 ? filled / total : 0;
        if (ratio === 1) return 'text-emerald-400';
        if (ratio >= 0.5) return 'text-amber-400';
        return 'text-slate-400';
    };

    // Check if section is complete
    const isSectionComplete = (filled: number, total: number): boolean => {
        return total > 0 && filled === total;
    };

    return (
        <div
            className={`
                fixed inset-y-0 left-0 z-40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 
                flex flex-col transition-all duration-300 shadow-2xl backdrop-blur-xl
                ${isCollapsed ? 'w-16' : 'w-80'}
                ${className}
            `}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="
                    absolute -right-3 top-6 w-6 h-6 rounded-full 
                    bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                    flex items-center justify-center 
                    shadow-lg hover:from-indigo-700 hover:to-purple-700 
                    transition-all transform hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                "
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Brand / Logo */}
            <div className={`
                px-5 py-5 border-b border-slate-700/50 flex-shrink-0 transition-all
                ${isCollapsed ? 'px-3' : ''}
            `}>
                <div className={`
                    flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}
                `}>
                    <div className="
                        w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 
                        flex items-center justify-center text-white 
                        shadow-lg shadow-indigo-600/30 flex-shrink-0
                        ring-1 ring-slate-700/50
                    ">
                        <Anchor className="w-5 h-5" />
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                                Generator Draft
                            </h1>
                            <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-0.5">
                                Proposal PKKPRL
                            </p>
                        </div>
                    )}
                </div>

                {!isCollapsed && (
                    <p className="
                        text-xs text-slate-400 mt-3 leading-relaxed 
                        border-t border-slate-700/50 pt-3 
                        flex items-center gap-2
                        bg-slate-800/30 p-2 rounded-lg
                    ">
                        <Database className="w-4 h-4 flex-shrink-0" />
                        <span>Data tersimpan otomatis</span>
                    </p>
                )}
            </div>

            {/* Navigation Steps */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {!isCollapsed && (
                    <div className="mb-4 px-3">
                        <h2 className="text-sm font-semibold text-slate-300 mb-2">Progress Overview</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${progress.total > 0 ? (progress.filled / progress.total) * 100 : 0}%`
                                    }}
                                />
                            </div>
                            <span className="text-xs text-slate-400 min-w-fit">
                                {progress.filled}/{progress.total}
                            </span>
                        </div>
                    </div>
                )}

                {sections.map((section, index) => {
                    const Icon = getSectionIcon(section.id);
                    const isActive = index === currentSection;
                    const isComplete = isSectionComplete(section.filled, section.total);
                    const statusColor = getStatusColor(section.filled, section.total);

                    return (
                        <button
                            key={section.id}
                            onClick={() => onSectionChange(index)}
                            className={`
                                w-full text-left rounded-xl px-4 py-3 
                                flex items-center gap-4 mb-2 
                                transition-all duration-200 group
                                focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                                ${isActive
                                    ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white shadow-lg shadow-indigo-600/10 border border-indigo-500/30'
                                    : 'hover:bg-slate-800/50 text-slate-200 hover:text-white'
                                }
                                ${isCollapsed ? 'justify-center px-2' : ''}
                                relative overflow-hidden
                            `}
                            title={isCollapsed ? section.title : ''}
                        >
                            {/* Animated background effect */}
                            <div className={`
                                absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                ${isActive ? 'opacity-100' : ''}
                            `} />

                            {/* Step Number / Icon */}
                            <div className={`
                                flex-shrink-0 w-8 h-8 rounded-xl 
                                flex items-center justify-center text-sm font-bold
                                transition-all duration-200
                                ${isActive
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                                    : isComplete
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-slate-700/50 text-slate-400'
                                }
                            `}>
                                {isComplete && !isActive ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : isCollapsed ? (
                                    <Icon className="w-4 h-4" />
                                ) : (
                                    <span className="flex items-center justify-center w-full h-full">
                                        {index + 1}
                                    </span>
                                )}
                            </div>

                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="text-base font-semibold flex items-center gap-2 mb-1">
                                        {section.title}
                                        {isComplete && (
                                            <div className="ml-auto">
                                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs flex items-center gap-3">
                                        <span className={statusColor}>
                                            <Circle className={`
                                                w-2.5 h-2.5 inline mr-1
                                                ${isComplete ? 'fill-current' : ''}
                                            `} />
                                            {section.filled}/{section.total} filled
                                        </span>
                                        {isActive && (
                                            <span className="ml-auto text-indigo-400">
                                                <ChevronRight className="w-4 h-4 inline" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isCollapsed && isActive && (
                                <div className="
                                    absolute left-full ml-3 
                                    bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                                    text-sm px-3 py-2 rounded-lg 
                                    whitespace-nowrap 
                                    opacity-0 group-hover:opacity-100 
                                    transition-all pointer-events-none
                                    shadow-lg
                                ">
                                    {section.title}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer Progress */}
            {!isCollapsed && (
                <div className="px-4 py-4 border-t border-slate-700/50 flex-shrink-0 bg-slate-800/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Total Progress</span>
                        <span className="text-sm font-semibold text-white">
                            {Math.round((progress.filled / progress.total) * 100)}%
                        </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                            style={{
                                width: `${progress.total > 0 ? (progress.filled / progress.total) * 100 : 0}%`
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;