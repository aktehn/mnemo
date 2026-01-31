/**
 * Blurred Overlay Component
 * 
 * Displays a locked overlay for guest users on analytics charts
 */

import { Lock } from 'lucide-react';

interface BlurredOverlayProps {
    title: string;
}

export const BlurredOverlay = ({ title }: BlurredOverlayProps) => (
    <div className="h-full flex flex-col p-5 relative overflow-hidden">
        <h3 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">{title}</h3>
        <div className="flex-1 relative">
            {/* Fake Content Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-sm pointer-events-none">
                <div className="w-32 h-32 rounded-full border-8 border-slate-300"></div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <Lock size={16} className="text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 font-bold max-w-[150px]">
                    Sign in to view your detailed analytics
                </p>
            </div>
        </div>
    </div>
);
