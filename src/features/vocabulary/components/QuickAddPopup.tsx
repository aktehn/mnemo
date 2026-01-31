
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../../store';
import { X, Plus, Save, Loader2 } from 'lucide-react';

const QuickAddPopup = () => {
    const [term, setTerm] = useState('');
    const [meaning, setMeaning] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const addWord = useAppStore(state => state.actions.addWord);
    const termInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus input
        termInputRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!term || !meaning) return;

        setIsSaving(true);
        try {
            await addWord({
                term,
                meaning,
                type: 'other',
                level: 'A1', // Default
            });

            // Show success via toast or just close
            // For now, let's reset and maybe show a mini success indicator
            setTerm('');
            setMeaning('');
            termInputRef.current?.focus();

            // Hide popup after small delay? Or keep open for rapid entry?
            // "Rapid entry" is better for power users.

            // Optionally tell main process to hide?
            // window.electron?.hidePopup(); 

        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (window.electron?.hidePopup) {
            window.electron.hidePopup();
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl overflow-hidden rounded-2xl">
            {/* Header */}
            <div className="h-10 bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-between px-4 shrink-0 drag-region">
                <div className="flex items-center gap-2 text-white/90">
                    <Plus size={14} className="stroke-[3]" />
                    <span className="text-xs font-black uppercase tracking-wider">Quick Add Word</span>
                </div>
                <button
                    onClick={handleClose}
                    className="text-white/70 hover:text-white hover:bg-white/20 rounded p-0.5 transition-colors no-drag-region"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 p-5 flex flex-col gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">English Term</label>
                    <input
                        ref={termInputRef}
                        type="text"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                        placeholder="e.g. Ephemeral"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Meaning</label>
                    <input
                        type="text"
                        value={meaning}
                        onChange={(e) => setMeaning(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                        placeholder="Translation or definition"
                    />
                </div>

                <div className="flex-1"></div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                        Cancel (Esc)
                    </button>
                    <button
                        type="submit"
                        disabled={!term || !meaning || isSaving}
                        className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save Word
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuickAddPopup;
