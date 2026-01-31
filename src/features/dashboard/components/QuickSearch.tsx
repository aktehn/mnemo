import { useState, useEffect, useRef } from 'react';
import { Search, Command, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../store';

const QuickSearch = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const words = useAppStore(state => state.words);
    const inputRef = useRef<HTMLInputElement>(null);

    // Toggle on Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const filteredWords = query
        ? words.filter(w =>
            w.term.toLowerCase().includes(query.toLowerCase()) ||
            w.meaning.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5)
        : [];

    return (
        <>
            {/* Search Trigger Button (Visible on Dashboard) */}
            <button
                onClick={() => setIsOpen(true)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 text-slate-400 text-sm hover:border-blue-400 hover:shadow-sm transition-all group"
            >
                <Search size={18} className="group-hover:text-blue-500 transition-colors" />
                <span className="flex-1 text-left font-medium">Quick Search...</span>
                <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                    <span className="text-xs">Ctrl</span>K
                </kbd>
            </button>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-10"
                        >
                            <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
                                <Search className="text-slate-400" size={20} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search vocabulary..."
                                    className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-white font-medium text-lg placeholder:text-slate-300"
                                />
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto p-2">
                                {query && filteredWords.length === 0 && (
                                    <div className="p-8 text-center text-slate-400">
                                        <p className="text-sm font-medium">No results found for "{query}"</p>
                                    </div>
                                )}

                                {!query && (
                                    <div className="p-4 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300 mb-3">
                                            <Command size={24} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type to search</p>
                                    </div>
                                )}

                                {filteredWords.map(word => (
                                    <div
                                        key={word.id}
                                        onClick={() => {
                                            // Handle navigate to details
                                            console.log('Open', word);
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer group transition-colors"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 dark:text-white">{word.term}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${word.level === 'A1' ? 'bg-blue-100 text-blue-600' :
                                                    word.level === 'C2' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {word.level}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{word.meaning}</p>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                ))}
                            </div>

                            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <span className="text-[10px] font-bold text-slate-400">
                                    <span className="bg-white dark:bg-slate-700 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 mx-1">Esc</span>
                                    to close
                                </span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default QuickSearch;
