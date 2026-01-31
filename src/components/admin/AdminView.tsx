import { useState } from 'react';
import { seedWordsToLibrary, isLibraryEmpty } from '../../services/seedWords';
import { Database, RefreshCw } from 'lucide-react';

/**
 * AdminView Component
 * 
 * Special admin-only view for managing the words library
 * Includes seeding functionality and database management
 */
const AdminView = () => {
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedResult, setSeedResult] = useState<{ success: boolean; count: number; error?: string } | null>(null);
    const [isEmpty, setIsEmpty] = useState<boolean | null>(null);

    const checkLibrary = async () => {
        const empty = await isLibraryEmpty();
        setIsEmpty(empty);
    };

    const handleSeed = async () => {
        setIsSeeding(true);
        setSeedResult(null);

        const result = await seedWordsToLibrary();
        setSeedResult(result);
        setIsSeeding(false);

        // Re-check if library is empty
        await checkLibrary();
    };

    // Check on mount
    useState(() => {
        checkLibrary();
    });

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[600px] animate-fade-in">
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <Database className="text-blue-600" size={24} />
                    <h3 className="font-bold text-lg text-slate-900">Admin Dashboard</h3>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                    Manage the words library and database operations
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Library Status */}
                <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-bold text-sm text-slate-700 mb-2">Library Status</h4>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                            {isEmpty === null ? 'Checking...' : isEmpty ? 'Library is empty' : 'Library has data'}
                        </span>
                        <button
                            onClick={checkLibrary}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-all flex items-center gap-1"
                        >
                            <RefreshCw size={14} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Seed Database */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <h4 className="font-bold text-sm text-blue-900 mb-2">Seed Database</h4>
                    <p className="text-xs text-blue-700 mb-4">
                        Import all words from a2_vocab.json to the Supabase words_library table.
                        This is a one-time operation to initialize your database.
                    </p>

                    <button
                        onClick={handleSeed}
                        disabled={isSeeding}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${isSeeding
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                            }`}
                    >
                        {isSeeding ? (
                            <>
                                <RefreshCw size={16} className="animate-spin" />
                                Seeding in progress...
                            </>
                        ) : (
                            <>
                                <Database size={16} />
                                Seed Words Library
                            </>
                        )}
                    </button>
                </div>

                {/* Seed Result */}
                {seedResult && (
                    <div className={`rounded-xl p-4 border ${seedResult.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                        <h4 className={`font-bold text-sm mb-2 ${seedResult.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                            {seedResult.success ? '✅ Seed Successful!' : '❌ Seed Failed'}
                        </h4>
                        <p className={`text-xs ${seedResult.success ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {seedResult.success
                                ? `Successfully imported ${seedResult.count} words to the library.`
                                : `Error: ${seedResult.error}`
                            }
                        </p>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                        <p className="text-xs text-purple-600 font-medium mb-1">Total Words</p>
                        <p className="text-2xl font-bold text-purple-900">
                            {seedResult?.count || '—'}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
                        <p className="text-xs text-orange-600 font-medium mb-1">Library Status</p>
                        <p className="text-2xl font-bold text-orange-900">
                            {isEmpty === false ? 'Ready' : 'Empty'}
                        </p>
                    </div>
                </div>

                {/* Information */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs text-amber-800">
                        <strong>⚠️ Important:</strong> Only run the seed operation once to initialize your database.
                        Running it multiple times will update existing records based on their ID.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminView;
