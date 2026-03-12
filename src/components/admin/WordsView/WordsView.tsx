/**
 * Words View Component
 * 
 * Main component for displaying and managing vocabulary words
 */

import { useState, useEffect } from 'react';
import { Search, Trash2, Cloud, RefreshCw, Check, BookOpen, GraduationCap, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../../store';
import WordForm from '../WordForm';
import toast from 'react-hot-toast';
import { TabButton } from './TabButton';
import { StatusBadge } from './StatusBadge';

const WordsView = () => {
    const words = useAppStore(state => state.words);
    const loadWords = useAppStore(state => state.actions.loadWords);
    const deleteWord = useAppStore(state => state.actions.deleteWord);
    const markAsLearned = useAppStore(state => state.actions.markAsLearned);
    const unlearnWord = useAppStore(state => state.actions.unlearnWord);

    const [search, setSearch] = useState("");
    const [view, setView] = useState('list'); // 'list' or 'add'

    // Filters: 'to_learn' (is_learned=false), 'learned' (is_learned=true), 'all'
    const [activeTab, setActiveTab] = useState<'to_learn' | 'learned' | 'all'>('to_learn');

    useEffect(() => {
        loadWords();
    }, [loadWords]);

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this word?")) {
            await deleteWord(id);
        }
    };

    const handleMarkAsLearned = async (word: any) => {
        const result = await markAsLearned(word.id);
        if (result) {
            toast.success(`"${word.term}" öğrenilenlere eklendi!`, { icon: '🎉', position: 'bottom-right' });
        } else {
            toast.error('İşlem sırasında bir hata oluştu');
        }
    };

    const handleUnlearn = async (word: any) => {
        await unlearnWord(word.id);
    };

    const filteredWords = words.filter(w => {
        // Tab filtering
        if (activeTab === 'to_learn' && w.is_learned) return false;
        if (activeTab === 'learned' && !w.is_learned) return false;

        return true;
    }).filter(w => {
        // Search filtering
        return w?.term?.toLowerCase().includes(search.toLowerCase()) ||
            w?.meaning?.toLowerCase().includes(search.toLowerCase());
    });

    if (view === 'add') {
        return <WordForm onCancel={() => setView('list')} onSaveComplete={() => setView('list')} />;
    }

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-[650px] animate-fade-in relative z-10">
            {/* Header Area */}
            <div className="p-6 pb-0 flex flex-col gap-6 bg-white z-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-2xl text-slate-900 tracking-tight flex items-center gap-3">
                            My Vocabulary
                            <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-100">
                                {filteredWords.length} words
                            </span>
                        </h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">Manage and track your learning progress.</p>
                    </div>

                    <button
                        onClick={() => setView('add')}
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-200 flex items-center gap-2 group"
                    >
                        <span className="group-hover:rotate-90 transition-transform duration-300 transform origin-center text-lg">+</span>
                        <span>Add Word</span>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-0">
                    {/* Modern Tabs */}
                    <div className="flex space-x-1 pb-4 md:pb-0 overflow-x-auto w-full md:w-auto no-scrollbar">
                        <TabButton
                            active={activeTab === 'to_learn'}
                            onClick={() => setActiveTab('to_learn')}
                            label="To Learn"
                            icon={<BookOpen size={16} />}
                            count={words.filter(w => !w.is_learned).length}
                        />
                        <TabButton
                            active={activeTab === 'learned'}
                            onClick={() => setActiveTab('learned')}
                            label="Learned"
                            icon={<GraduationCap size={16} />}
                            count={words.filter(w => w.is_learned).length}
                        />
                        <TabButton
                            active={activeTab === 'all'}
                            onClick={() => setActiveTab('all')}
                            label="All Words"
                            count={words.length}
                        />
                    </div>

                    {/* Search Field */}
                    <div className="relative w-full md:w-72 mb-4 md:mb-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="text-slate-400" size={16} />
                        </div>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder="Search by term or meaning..."
                            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all hover:bg-slate-100 focus:bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="overflow-y-auto flex-1 p-0 custom-scrollbar relative">
                {/* Decorative gradients */}
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />

                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-100">
                        <tr>
                            <th className="py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider w-1/3">Word / Context</th>
                            <th className="py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider w-1/3">Meaning</th>
                            <th className="py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center w-[120px]">Status</th>
                            <th className="py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center w-[80px]">Sync</th>
                            <th className="py-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right pr-8">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredWords.map((word, i) => (
                            <tr key={word.id || i} className="group hover:bg-slate-50 transition-colors duration-200">
                                <td className="py-4 px-6 align-top">
                                    <div className="flex flex-col">
                                        <div className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">{word.term}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide border border-slate-200">
                                                {word.level}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-medium italic">
                                                {word.type}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 align-top">
                                    <div className="text-slate-600 font-medium text-sm leading-relaxed">
                                        {word.meaning}
                                    </div>
                                    {word.example && (
                                        <div className="mt-1.5 text-xs text-slate-400 line-clamp-1 italic group-hover:text-slate-500 transition-colors">
                                            "{word.example}"
                                        </div>
                                    )}
                                </td>
                                <td className="py-4 px-6 align-top text-center">
                                    {word.is_learned ? (
                                        <div className="inline-flex items-center justify-center w-full">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200">
                                                Learned
                                            </span>
                                        </div>
                                    ) : (
                                        <StatusBadge status={word.status} />
                                    )}
                                </td>
                                <td className="py-4 px-6 align-top text-center">
                                    <div className="flex justify-center pt-1">
                                        {word.is_synced ?
                                            <div className="p-1.5 bg-blue-50 rounded-full text-blue-500 group-hover:bg-blue-100 transition-colors" title="Synced to Cloud">
                                                <Cloud size={14} />
                                            </div>
                                            :
                                            <div className="p-1.5 bg-orange-50 rounded-full text-orange-400 animate-pulse" title="Pending Sync">
                                                <RefreshCw size={14} />
                                            </div>
                                        }
                                    </div>
                                </td>
                                <td className="py-4 px-6 align-top text-right pr-8">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                                        <button
                                            onClick={() => handleDelete(word.id as number)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete Word"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        {word.is_learned ? (
                                            <button
                                                onClick={() => handleUnlearn(word)}
                                                className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200 text-xs font-bold bg-white shadow-sm hover:shadow"
                                                title="Re-add to learning queue"
                                            >
                                                <RotateCcw size={14} />
                                                <span>Re-learn</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleMarkAsLearned(word)}
                                                className="flex items-center gap-2 px-3 py-1.5 text-white bg-slate-900 hover:bg-emerald-600 rounded-lg transition-all text-xs font-bold shadow-md hover:shadow-lg hover:shadow-emerald-200 transform hover:-translate-y-0.5 active:translate-y-0"
                                                title="Mark as Mastered"
                                            >
                                                <Check size={14} />
                                                <span>Master IT</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredWords.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                            <Search size={32} className="text-slate-300" />
                                        </div>
                                        <div>
                                            <h4 className="text-slate-900 font-bold text-lg mb-1">No words found</h4>
                                            <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                                We couldn't find any words matching your criteria. Try adjusting your filters or search term.
                                            </p>
                                        </div>
                                        {activeTab !== 'all' && (
                                            <button
                                                onClick={() => setActiveTab('all')}
                                                className="mt-2 text-blue-600 text-sm font-bold hover:underline"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WordsView;
