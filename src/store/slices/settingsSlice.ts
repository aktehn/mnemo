/**
 * Settings Slice
 * 
 * Manages application settings, sync status, and sync operations.
 * 
 * @module store/slices/settingsSlice
 */

import type { StateCreator } from 'zustand';
import type { AppState, SettingsSlice } from '../types';
import type { AppSettings } from '../../types/models';
import * as hybridDataService from '../../services/hybridDataService';

/**
 * Default app settings
 */
const DEFAULT_SETTINGS: AppSettings = {
    workHoursStart: '09:00',
    workHoursEnd: '18:00',
    focusModeEnabled: true,
    frequency: 15,
    dataSource: 'dummy',
    popupPosition: 'Bottom Right',
};

/**
 * Creates the settings slice
 */
export const createSettingsSlice: StateCreator<
    AppState,
    [],
    [],
    { settings: SettingsSlice }
> = (set) => ({
    settings: {
        // Initial state
        settings: DEFAULT_SETTINGS,
        syncStatus: {
            last_sync: null,
            is_syncing: false,
            pending_changes: 0,
            errors: [],
        },

        // Actions
        actions: {
            /**
             * Updates app settings
             * 
             * @param newSettings - Partial settings object with fields to update
             */
            updateSettings: (newSettings: Partial<AppSettings>): void => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        settings: { ...state.settings.settings, ...newSettings },
                    },
                }));

                // Also update Electron settings
                if (window.electron?.updateSettings) {
                    window.electron.updateSettings(newSettings);
                }
            },

            /**
             * Starts automatic sync with Supabase
             */
            startSync: (): void => {
                hybridDataService.startAutoSync();
            },

            /**
             * Stops automatic sync
             */
            stopSync: (): void => {
                hybridDataService.stopAutoSync();
            },

            /**
             * Forces an immediate sync
             */
            forceSync: async (): Promise<void> => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        syncStatus: { ...state.settings.syncStatus, is_syncing: true },
                    },
                }));

                try {
                    await hybridDataService.forceSync();

                    const status = hybridDataService.getSyncStatus();
                    set((state) => ({
                        settings: {
                            ...state.settings,
                            syncStatus: {
                                last_sync: status.lastSync?.toISOString() || null,
                                is_syncing: false,
                                pending_changes: 0,
                                errors: [],
                            },
                        },
                    }));
                } catch (error) {
                    console.error('[Settings] Force sync failed:', error);
                    set((state) => ({
                        settings: {
                            ...state.settings,
                            syncStatus: { ...state.settings.syncStatus, is_syncing: false },
                        },
                    }));
                }
            },

            /**
             * Clears all local data and reloads the application
             */
            clearLocalData: async (): Promise<void> => {
                localStorage.clear();
                window.location.reload();
            },
        },
    },
});
