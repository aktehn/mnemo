/**
 * Tab Button Component
 * 
 * Reusable tab button with active state and optional count badge
 */

import type { ReactNode } from 'react';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    icon?: ReactNode;
    count?: number;
}

export const TabButton = ({ active, onClick, label, icon, count }: TabButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 select-none ${active
                    ? 'text-slate-900 bg-slate-100 shadow-inner'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
        >
            {icon && <span className={`${active ? 'text-blue-600' : 'text-slate-400'}`}>{icon}</span>}
            <span>{label}</span>
            {count !== undefined && (
                <span
                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-md ${active
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                >
                    {count}
                </span>
            )}

            {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-500 rounded-full mb-1"></div>
            )}
        </button>
    );
};
