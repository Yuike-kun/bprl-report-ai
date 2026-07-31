export type * from './auth';

// types/index.ts
export interface Section {
    id: string;
    title: string;
    filled: number;
    total: number;
    icon?: string;
}

export interface Progress {
    filled: number;
    total: number;
}

export interface SidebarProps {
    sections: Section[];
    currentSection: number;
    onSectionChange: (index: number) => void;
    progress: Progress;
    className?: string;
}

export interface NavbarProps {
    title: string;
    subtitle: string;
    onExport: () => void;
    onImport: (data: any) => void;
    onReset: () => void;
    onGenerate: () => void;
    onAIConfig: () => void;
    isGenerateReady: boolean;
    progress: Progress;
    lastSaved: Date | null;
    isMobile?: boolean;
    onToggleMobile?: () => void;
    className?: string;
}
