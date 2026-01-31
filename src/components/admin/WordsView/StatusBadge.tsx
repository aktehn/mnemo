/**
 * Status Badge Component
 * 
 * Displays word learning status with color-coded badge
 */

import type { WordStatus } from '../../../types';

interface StatusBadgeProps {
    status?: WordStatus | string;
}

interface StatusConfig {
    bg: string;
    text: string;
    border: string;
    label: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const statusConfig: Record<string, StatusConfig> = {
        hard: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', label: 'Hard' },
        learning: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'Learning' },
        easy: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Easy' },
        mastered: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Mastered' },
        new: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', label: 'New' },
        impartial: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100', label: 'Pending' }
    };

    const config = statusConfig[status || 'new'] || statusConfig.new;

    return (
        <div className="inline-flex items-center justify-center w-full">
            <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${config.bg} ${config.text} ${config.border}`}
            >
                {config.label}
            </span>
        </div>
    );
};
