import { useState, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { useAppStore } from '../../store';
import toast from 'react-hot-toast';

const SRSActionCard = () => {
    const words = useAppStore(state => state.words);
    const isGuest = useAppStore(state => state.isGuest);
    const markAsLearned = useAppStore(state => state.actions.markAsLearned);

    // Filter available words (not learned)
    const availableWords = useMemo(() => words.filter(w => !w.is_learned), [words]);

    const [currentIndex, setCurrentIndex] = useState(0);

    const currentWord = availableWords[currentIndex];

    const handleNext = () => {
        // Just move to next word (skip)
        if (currentIndex < availableWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCurrentIndex(0); // Loop back
        }
    };

    const handleMarkAsLearned = async () => {
        if (!currentWord) return;

        if (isGuest) {
            toast.success('Kelime geçici olarak gizlendi. Kaydolursan ilerlemen saklanır! 🚀', {
                icon: '👀',
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });
        }

        const success = await markAsLearned(currentWord.id);
        if (success) {
            // If successful, the word is removed from availableWords automatically via memo
            // We might needs to adjust index if it goes out of bounds
            if (currentIndex >= availableWords.length - 1) {
                setCurrentIndex(Math.max(0, availableWords.length - 2));
            }
        }
    };

    if (availableWords.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <Check size={32} />
                </div>
                <h2 className="text-2xl font-black mb-2">All Caught Up!</h2>
                <p className="text-white/80 font-medium">You've learned all available words.</p>
            </div>
        );
    }

    if (!currentWord) return null; // Should not happen given check above

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative">
            {/* Card Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wide ${currentWord.level === 'A1' ? 'bg-blue-100 text-blue-600' :
                        currentWord.level === 'C2' ? 'bg-purple-100 text-purple-600' :
                            'bg-slate-100 text-slate-500'
                        }`}>
                        {currentWord.level}
                    </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                    {currentWord.term}
                </h2>

                <div className="space-y-2 max-w-md mx-auto">
                    <p className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400">
                        {currentWord.meaning}
                    </p>

                    {currentWord.example && (
                        <p className="text-sm text-slate-400 italic mt-4 border-t border-slate-100 pt-4">
                            "{currentWord.example}"
                        </p>
                    )}
                </div>
            </div>

            {/* Actions Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex gap-4">
                <button
                    onClick={handleNext}
                    className="flex-1 py-4 rounded-xl bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-colors flex items-center justify-center gap-2 shadow-sm border border-red-200"
                >
                    <X size={20} />
                    Hard (Don't Know)
                </button>

                <button
                    onClick={handleMarkAsLearned}
                    className="flex-1 py-4 rounded-xl bg-green-100 text-green-600 font-bold hover:bg-green-200 transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-sm border border-green-200"
                >
                    <Check size={20} />
                    Easy (Learned)
                </button>
            </div>
        </div>
    );
};

export default SRSActionCard;
