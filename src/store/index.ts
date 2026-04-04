import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { VocabularyWord, AppSettings } from '../types/models';

const DEFAULT_SETTINGS: AppSettings = {
    workHoursStart: '09:00',
    workHoursEnd: '18:00',
    focusModeEnabled: false, // OFF by default
    frequency: 10, // 10 seconds default
    dataSource: 'dummy',
    popupPosition: 'Bottom Right',
};

export interface AppState {
    isLoading: boolean;
    words: VocabularyWord[];
    currentWord: VocabularyWord | null;
    settings: AppSettings;
    actions: {
        loadWords: () => Promise<void>;
        addWord: (word: Partial<VocabularyWord>) => Promise<boolean>;
        updateWord: (word: Partial<VocabularyWord> & { id: number | string }) => Promise<boolean>;
        deleteWord: (id: number) => Promise<boolean>;
        markAsLearned: (id: number | string) => Promise<boolean>;
        unlearnWord: (id: number) => Promise<boolean>;
        setCurrentWord: (word: VocabularyWord | null) => void;
        updateSettings: (settings: Partial<AppSettings>) => void;
        clearLocalData: () => Promise<void>;
    };
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            isLoading: false,
            words: [],
            currentWord: null,
            settings: DEFAULT_SETTINGS,

            actions: {
                loadWords: async (): Promise<void> => {
                    set({ isLoading: true });
                    try {
                        const words = await (window.electron?.getAllWords() || Promise.resolve([]));
                        set({ words, isLoading: false });
                    } catch (error) {
                        console.error('[Word] Failed to load words:', error);
                        set({ isLoading: false });
                    }
                },

                addWord: async (word: Partial<VocabularyWord>): Promise<boolean> => {
                    try {
                        const result = await (window.electron?.saveWord(word) || Promise.resolve({ success: false, word: null }));
                        if (result.success && result.word) {
                            set((state) => ({ words: [...state.words, result.word!] }));
                            return true;
                        }
                        return false;
                    } catch (error) {
                        console.error('[Word] Failed to add word:', error);
                        return false;
                    }
                },

                updateWord: async (word: Partial<VocabularyWord> & { id: number | string }): Promise<boolean> => {
                    set({ isLoading: true });
                    try {
                        const result = await (window.electron?.updateWord(word as any) || Promise.resolve({ success: false }));
                        if (result.success) {
                            const words = await (window.electron?.getAllWords() || Promise.resolve([]));
                            set({ words, isLoading: false });
                            return true;
                        }
                        set({ isLoading: false });
                        return false;
                    } catch (error) {
                        console.error('[Word] Failed to update word:', error);
                        set({ isLoading: false });
                        return false;
                    }
                },

                deleteWord: async (id: number): Promise<boolean> => {
                    try {
                        const result = await (window.electron?.deleteWord(id) || Promise.resolve({ success: false }));
                        if (result.success) {
                            set((state) => ({ words: state.words.filter((w) => w.id !== id) }));
                            return true;
                        }
                        return false;
                    } catch (error) {
                        console.error('[Word] Failed to delete word:', error);
                        return false;
                    }
                },

                markAsLearned: async (id: number | string): Promise<boolean> => {
                    try {
                        const targetWord = get().words.find(w => w.id === id);
                        if (!targetWord) return false;
                        const result = await (window.electron?.updateWord({ ...targetWord, is_learned: true, id: targetWord.id as number }) || Promise.resolve({ success: false }));
                        
                        if (result.success) {
                            set((state) => ({
                                words: state.words.map((w) => (w.id === id ? { ...w, is_learned: true } : w)),
                            }));
                            return true;
                        }
                        return false;
                    } catch (error) {
                        console.error('[Word] Failed to mark as learned:', error);
                        return false;
                    }
                },

                unlearnWord: async (id: number | string): Promise<boolean> => {
                    try {
                        const targetWord = get().words.find(w => w.id === id);
                        if (!targetWord) return false;
                        const result = await (window.electron?.updateWord({ ...targetWord, is_learned: false, id: targetWord.id as number }) || Promise.resolve({ success: false }));

                        if (result.success) {
                            set((state) => ({
                                words: state.words.map((w) => (w.id === id ? { ...w, is_learned: false } : w)),
                            }));
                            return true;
                        }
                        return false;
                    } catch (error) {
                        console.error('[Word] Failed to unlearn word:', error);
                        return false;
                    }
                },

                setCurrentWord: (word: VocabularyWord | null): void => {
                    set({ currentWord: word });
                },

                updateSettings: (newSettings: Partial<AppSettings>): void => {
                    set((state) => ({ settings: { ...state.settings, ...newSettings } }));
                    if (window.electron?.updateSettings) {
                        window.electron.updateSettings(newSettings);
                    }
                },

                clearLocalData: async (): Promise<void> => {
                    localStorage.clear();
                    window.location.reload();
                },
            },
        }),
        {
            name: 'vocab-app-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                settings: state.settings,
            }),
        }
    )
);
