import { useState, useEffect, useCallback, useRef, JSX } from 'react';
import { motion } from 'framer-motion';
import { Volume2, X, Sparkles, BrainCircuit } from 'lucide-react';
import type { VocabularyWord } from '../../../types';
import { calculateNextReview } from '../logic/srs';
import { useAppStore } from '../../../store';

/**
 * Vocabulary Popup - "The Living Companion" Edition
 * 
 * DESIGN RATIONALE:
 * 1. MOBILITY: Restored `-webkit-app-region: drag` on the main container. Text selection enabled on specific areas.
 * 2. NO TIMERS: Removed auto-refresh logic. The user is in control.
 * 3. LIVING COMPANION: Added a "Pulse" heartbeat to the mastery orb and a subtle "breathing" border.
 * 4. MASTERY ORB: Replaced static pips with a dynamic Orb that evolves from a simple ring to a glowing core as mastery (repetition) increases.
 * 5. CONTEXT: Added a dynamic greeting based on time of day.
 */
const VocabularyPopup = (): JSX.Element | null => {
    // --- STATE ---
    const [word, setWord] = useState<VocabularyWord | null>(null);
    const [lastAction, setLastAction] = useState<'easy' | 'hard' | null>(null);

    // Session State
    const [sessionCount, setSessionCount] = useState(0);
    const SESSION_GOAL = 20;

    // Store Hooks
    const words = useAppStore(state => state.words);
    const loadWords = useAppStore(state => state.actions.loadWords);
    const updateWord = useAppStore(state => state.actions.updateWord);
    const markAsLearned = useAppStore(state => state.actions.markAsLearned);

    // Keep a ref to always access the LATEST words list in callbacks
    // This prevents stale closures when onRefreshWord fires from Electron IPC
    const wordsRef = useRef<VocabularyWord[]>(words);
    useEffect(() => { wordsRef.current = words; }, [words]);

    // Initial Load
    useEffect(() => { loadWords(); }, [loadWords]);


    // --- LOGIC ---

    const loadRandomWordInternal = useCallback((wordsList: VocabularyWord[]) => {
        if (!wordsList || wordsList.length === 0) return;
        const randomIndex = Math.floor(Math.random() * wordsList.length);
        const selected = wordsList[randomIndex];

        // Example Highlight Logic
        const ex = selected.example || "";
        const term = selected.term;
        const parts = ex.split(new RegExp(`(${term})`, 'gi'));
        const wordWithParts = { ...selected, exampleParts: parts };

        setWord(wordWithParts as any);
        setLastAction(null);
    }, []);

    // Use wordsRef so this callback never captures a stale word list
    const getRandomWord = useCallback(() => {
        const latestWords = wordsRef.current;
        if (latestWords.length > 0) loadRandomWordInternal(latestWords);
    }, [loadRandomWordInternal]);

    // Initial word set
    useEffect(() => {
        if (words.length > 0 && !word) getRandomWord();
    }, [words, word, getRandomWord]);


    // Listen for Electron IPC refresh events
    useEffect(() => {
        if (window.electron?.onRefreshWord) {
            window.electron.onRefreshWord(() => getRandomWord());
        }
        return () => {
            if (window.electron?.onRefreshWord) {
                window.electron.onRefreshWord(() => { });
            }
        };
    }, [getRandomWord]);

    // Actions
    const handleClose = () => window.electron?.hidePopup?.();

    const handleAction = async (type: 'easy' | 'hard') => {
        if (!word) return;
        setLastAction(type);

        // Animation Delay
        setTimeout(async () => {
            if (type === 'easy') {
                await markAsLearned(word.id);
                setSessionCount(p => p + 1);
            }

            if (type === 'hard') {
                const currentStats = {
                    interval: word.interval || 0,
                    repetition: word.repetition || 0,
                    ef: word.ef || 2.5,
                    dueDate: word.reviewDate || new Date().toISOString()
                };
                const newStats = calculateNextReview(currentStats, 1);
                updateWord({ id: word.id, status: 'learning', ...newStats });
                setSessionCount(p => p + 1);
            }

            getRandomWord();
        }, 350);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'e') handleAction('easy');
            if (e.key.toLowerCase() === 'h') handleAction('hard');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [word]); // Dep ensures updated closure if needed, though handleAction is stable enough if we used useCallback. Optimized for safety.

    // Audio
    const playAudio = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (word?.term) {
            const utterance = new SpeechSynthesisUtterance(word.term);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    // Contextual Greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Morning Focus";
        if (hour < 18) return "Afternoon Grind";
        return "Evening Flow";
    };

    if (!word) return null;

    const exampleParts = (word as any).exampleParts || [];
    const masteryLevel = Math.min((word.repetition || 0), 5); // 0-5 scale

    // --- RENDER ---
    return (
        <div className="flex items-end justify-end h-screen w-full p-4 bg-transparent pointer-events-none">

            <motion.div
                key={word.id}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{
                    opacity: 1,
                    x: 0,
                    scale: lastAction ? 0.98 : 1,
                    borderColor: lastAction === 'easy' ? 'rgba(52, 211, 153, 0.4)' :
                        lastAction === 'hard' ? 'rgba(248, 113, 113, 0.4)' :
                            'rgba(255, 255, 255, 0.08)'
                }}
                exit={{ opacity: 0, x: 20 }}
                // Apply drag region here. "pointer-events-auto" enables clicking.
                // We use inline style for app-region to ensure Electron picks it up.
                style={{ WebkitAppRegion: 'drag' } as any}
                className="pointer-events-auto w-80 bg-[#0c0c0e]/95 backdrop-blur-3xl border rounded-2xl shadow-2xl overflow-visible group select-none relative"
            >
                {/* top border highlight for 3D feel */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                {/* Content Container */}
                <div className="p-5 flex flex-col gap-4 relative">

                    {/* Background "Soul" Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5 pointer-events-none"></div>

                    {/* HEADER: Mobility handle & Context */}
                    <div className="flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5">
                            <BrainCircuit size={12} className="text-indigo-400" />
                            <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-200/50">{getGreeting()}</span>
                        </div>
                        <div className="flex items-center gap-2 no-drag-region">
                            {/* Buttons must be no-drag to be clickable */}
                            <button onClick={handleClose} style={{ cursor: 'pointer' }} className="hover:text-white text-white/20 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* MAIN: Word & Mastery Orb */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white tracking-tight leading-none mb-1 shadow-black drop-shadow-lg">{word.term}</h1>
                            <p className="text-sm font-medium text-emerald-400/90 leading-tight">{word.meaning}</p>
                        </div>

                        {/* The "Mastery Orb" - Visualizes SRS Level */}
                        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                            {/* Outer Ring */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" fill="none" className="text-white/5" />
                                <motion.circle
                                    cx="20" cy="20" r="18"
                                    stroke="currentColor" strokeWidth="2" fill="none"
                                    className="text-emerald-500"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: masteryLevel / 5 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                            {/* Inner Core */}
                            <motion.div
                                className={`rounded-full ${masteryLevel >= 5 ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]' : 'bg-white/10'}`}
                                animate={{ scale: masteryLevel >= 5 ? [1, 1.1, 1] : 1 }}
                                transition={{ repeat: Infinity, duration: 3 }}
                            >
                                {masteryLevel >= 5 ? (
                                    <Sparkles size={14} className="text-emerald-950 p-0.5" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full"></div>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* CONTEXT: Sentence (Selectable for copying) */}
                    <div className="no-drag-region cursor-text select-text relative pl-3 border-l-2 border-indigo-500/20 bg-indigo-500/5 rounded-r-lg p-3 group/ex hover:bg-indigo-500/10 transition-colors">
                        <p className="text-xs text-indigo-200/70 font-mono italic leading-relaxed">
                            {exampleParts.length > 0 ? (
                                exampleParts.map((part: string, i: number) => (
                                    part.toLowerCase() === word.term.toLowerCase() ?
                                        <span key={i} className="text-indigo-300 not-italic font-bold border-b border-indigo-500/30">{part}</span> :
                                        <span key={i}>{part}</span>
                                ))
                            ) : word.example}
                        </p>
                        {/* Audio Trigger on Hover of Sentence area? Or keep button? Let's add a button in footer instead to keep clean. */}
                    </div>

                    {/* FOOTER: Interaction Zone */}
                    <div className="flex items-center gap-2 mt-1 no-drag-region">
                        {/* Audio button with custom tooltip (above card, avoids overflow-hidden clipping) */}
                        <div className="relative group/audio">
                            <button
                                onClick={playAudio}
                                style={{ cursor: 'pointer' }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all active:scale-95 cursor-pointer"
                            >
                                <Volume2 size={14} />
                            </button>
                            {/* Custom tooltip — renders ABOVE the button, outside overflow boundary */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
                                <div className="opacity-0 group-hover/audio:opacity-100 transition-opacity duration-150 bg-black/90 backdrop-blur text-[10px] text-white/80 px-2 py-1 rounded-md border border-white/10 whitespace-nowrap shadow-xl">
                                    🔊 Sesi Oynat
                                </div>
                            </div>
                        </div>

                        <div className="h-4 w-px bg-white/5 mx-1"></div>

                        <button
                            onClick={() => handleAction('hard')}
                            style={{ cursor: 'pointer' }}
                            className="flex-1 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 flex items-center justify-between px-3 transition-all active:scale-95 group/btn cursor-pointer"
                        >
                            <span className="text-[10px] font-bold text-red-300/70 uppercase">Hard</span>
                            <span className="text-[9px] font-mono text-red-300/30 group-hover/btn:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">H</span>
                        </button>

                        <button
                            onClick={() => handleAction('easy')}
                            style={{ cursor: 'pointer' }}
                            className="flex-1 h-9 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/10 hover:border-emerald-500/30 flex items-center justify-between px-3 transition-all active:scale-95 group/btn cursor-pointer"
                        >
                            <span className="text-[10px] font-bold text-emerald-300/70 uppercase">Easy</span>
                            <span className="text-[9px] font-mono text-emerald-300/30 group-hover/btn:text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity">E</span>
                        </button>
                    </div>

                    {/* SESSION PILL */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <div className="bg-black/80 backdrop-blur text-[9px] text-gray-500 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1.5 shadow-xl">
                            <span className={`w-1 h-1 rounded-full ${sessionCount >= SESSION_GOAL ? 'bg-amber-400' : 'bg-blue-500'}`}></span>
                            <span>Session: {sessionCount}/{SESSION_GOAL}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VocabularyPopup;
