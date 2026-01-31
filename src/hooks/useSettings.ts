/**
 * Custom React Hook for managing application settings
 * 
 * Provides interface for reading and updating app settings through Electron IPC.
 * 
 * @module hooks/useSettings
 */

import { useState, useEffect, useCallback } from 'react';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface UseSettingsReturn {
    /** Current settings */
    settings: AppSettings;

    /** Update a specific setting */
    updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;

    /** Update multiple settings at once */
    updateSettings: (newSettings: Partial<AppSettings>) => void;

    /** Reset to default settings */
    resetSettings: () => void;
}

/**
 * Hook for managing application settings
 * 
 * @returns {UseSettingsReturn} Settings management interface
 * 
 * @example
 * ```tsx
 * function SettingsPanel() {
 *   const { settings, updateSetting } = useSettings();
 *   
 *   return (
 *     <div>
 *       <label>
 *         <input
 *           type="checkbox"
 *           checked={settings.focusModeEnabled}
 *           onChange={(e) => updateSetting('focusModeEnabled', e.target.checked)}
 *         />
 *         Focus Mode
 *       </label>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSettings(): UseSettingsReturn {
    const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS });

    /**
     * Load settings from Electron on mount
     */
    useEffect(() => {
        if (window.electron?.getSettings) {
            window.electron.getSettings((loadedSettings) => {
                if (loadedSettings) {
                    setSettings(prev => ({ ...prev, ...loadedSettings }));
                }
            });
        }
    }, []);

    /**
     * Updates a single setting
     */
    const updateSetting = useCallback(<K extends keyof AppSettings>(
        key: K,
        value: AppSettings[K]
    ) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        if (window.electron?.updateSettings) {
            window.electron.updateSettings(newSettings);
        }
    }, [settings]);

    /**
     * Updates multiple settings at once
     */
    const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
        const merged = { ...settings, ...newSettings };
        setSettings(merged);

        if (window.electron?.updateSettings) {
            window.electron.updateSettings(merged);
        }
    }, [settings]);

    /**
     * Resets all settings to defaults
     */
    const resetSettings = useCallback(() => {
        const defaults = { ...DEFAULT_SETTINGS };
        setSettings(defaults);

        if (window.electron?.updateSettings) {
            window.electron.updateSettings(defaults);
        }
    }, []);

    return {
        settings,
        updateSetting,
        updateSettings,
        resetSettings,
    };
}
