import { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
// @ts-ignore
import { useDictionary } from '../../hooks/useDictionary';
import { Wand2, Loader2, AlertCircle } from 'lucide-react';
import type { VocabularyWord, WordLevel, WordType } from '../../types';

interface WordFormProps {
    onCancel: () => void;
    onSaveComplete?: () => void;
}

const WordForm = ({ onCancel, onSaveComplete }: WordFormProps) => {
    const addWord = useAppStore(state => state.actions.addWord);

    // Dictionary Hook Integration
    const { definition, loading: dictLoading, error: dictError, searchDefinition } = useDictionary();

    const [newWord, setNewWord] = useState<Partial<VocabularyWord>>({
        term: '', meaning: '', example: '', type: 'noun', level: 'A1'
    });
    const [loading, setLoading] = useState(false);

    // Auto-fill effect: When dictionary data arrives, populate the form
    useEffect(() => {
        if (definition && definition.word.toLowerCase() === (newWord.term || '').toLowerCase().trim()) {
            const firstMeaning = definition.meanings[0];
            const firstDef = firstMeaning?.definitions[0];

            // Map API types to our types
            let type: WordType = 'other';
            const apiType = firstMeaning?.partOfSpeech;
            if (['noun', 'verb', 'adjective', 'adverb', 'phrase'].includes(apiType)) {
                type = apiType as WordType;
            }

            setNewWord(prev => ({
                ...prev,
                meaning: firstDef?.definition || prev.meaning, // Don't overwrite if we somehow got partial data
                example: firstDef?.example || prev.example,
                type: type
            }));
        }
    }, [definition]); // Only run when definition updates

    const handleAutoFill = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!newWord.term) return;
        await searchDefinition(newWord.term);
    };

    const handleSave = async () => {
        if (!newWord.term || !newWord.meaning) return;

        setLoading(true);
        // Include audio URL if available from dictionary
        const wordToSave: Partial<VocabularyWord> = {
            ...newWord,
            // If the term matches, we can optionally save the audio/phonetic too
            // audio: definition?.audio
            // phonetic: definition?.phonetic
        };

        const success = await addWord(wordToSave);
        setLoading(false);

        if (success) {
            setNewWord({ term: '', meaning: '', example: '', type: 'noun', level: 'A1' });
            if (onSaveComplete) onSaveComplete();
        } else {
            alert('Failed to save word. Please try again.');
        }
    };

    return (
        <div className="max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-100 p-8 animate-slide-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Add New Word</h2>
                <button
                    onClick={onCancel}
                    className="text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors"
                >
                    Cancel
                </button>
            </div>

            {/* Dictionary Error Message */}
            {dictError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} />
                    {dictError}
                </div>
            )}

            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Word</label>
                        <div className="relative">
                            <input
                                value={newWord.term}
                                onChange={e => setNewWord({ ...newWord, term: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-medium pr-10"
                                placeholder="e.g. Ephemeral"
                            />
                            <button
                                onClick={handleAutoFill}
                                disabled={dictLoading || !newWord.term}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Auto-fill meaning from dictionary"
                            >
                                {dictLoading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Level</label>
                        <select
                            value={newWord.level}
                            onChange={e => setNewWord({ ...newWord, level: e.target.value as WordLevel })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-medium appearance-none"
                        >
                            <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-5">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meaning / Definition</label>
                        <input
                            value={newWord.meaning}
                            onChange={e => setNewWord({ ...newWord, meaning: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-medium"
                            placeholder="e.g. Lasting for a very short time"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                        <select
                            value={newWord.type}
                            onChange={e => setNewWord({ ...newWord, type: e.target.value as WordType })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-medium appearance-none"
                        >
                            <option value="noun">Noun</option>
                            <option value="verb">Verb</option>
                            <option value="adjective">Adjective</option>
                            <option value="adverb">Adverb</option>
                            <option value="phrase">Phrase</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Example Sentence</label>
                    <textarea
                        value={newWord.example}
                        onChange={e => setNewWord({ ...newWord, example: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-medium h-28 resize-none"
                        placeholder="Use the word in a context..."
                    ></textarea>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Saving...' : 'Save Word'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WordForm;
