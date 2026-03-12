import { useState } from 'react';
import { Settings, Database, Monitor, Shield, ChevronDown, CheckCircle, LayoutTemplate } from 'lucide-react';
import { useAppStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsView = () => {
    const [activeTab, setActiveTab] = useState('general');

    // Tabs configuration
    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'data', label: 'Dictionary & Data', icon: Database },
        { id: 'appearance', label: 'Appearance', icon: Monitor },
        { id: 'dev', label: 'Advanced', icon: Shield },
    ];

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-fade-in">
            {/* Sidebar / Tabs */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-4">
                <nav className="space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-100'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-2xl"
                    >
                        {activeTab === 'general' && <GeneralSettings />}
                        {activeTab === 'data' && <DataSettings />}
                        {activeTab === 'appearance' && <AppearanceSettings />}
                        {activeTab === 'dev' && <DeveloperSettings />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Sub-Components ---

const GeneralSettings = () => {
    const settings = useAppStore(state => state.settings);
    const updateSettings = useAppStore(state => state.actions.updateSettings);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">General Preferences</h2>
                <p className="text-slate-500 text-sm">Manage your daily workflow settings.</p>
            </div>

            {/* Popup Frequency */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-slate-900">Popup Frequency</h3>
                        <p className="text-xs text-slate-500 mt-1">How often vocabulary cards appear on screen.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-blue-600">{settings.frequency}</span>
                        <span className="text-xs text-slate-400 ml-1">sec</span>
                    </div>
                </div>
                <input
                    type="range"
                    min={3}
                    max={60}
                    step={1}
                    value={settings.frequency}
                    onChange={(e) => updateSettings({ frequency: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                    <span>3 sec</span>
                    <span>30 sec</span>
                    <span>60 sec</span>
                </div>
            </div>

            {/* Focus Mode */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-slate-900">Focus Mode</h3>
                        <p className="text-xs text-slate-500 mt-1">Restrict learning popups to specific work hours.</p>
                    </div>
                    <Switch
                        checked={settings.focusModeEnabled}
                        onChange={(val) => updateSettings({ focusModeEnabled: val })}
                    />
                </div>

                {settings.focusModeEnabled && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-50">
                        <TimeInput label="Start Time" value={settings.workHoursStart} onChange={(v) => updateSettings({ workHoursStart: v })} />
                        <TimeInput label="End Time" value={settings.workHoursEnd} onChange={(v) => updateSettings({ workHoursEnd: v })} />
                    </div>
                )}
            </div>


        </div>
    );
};

const DataSettings = () => {
    const settings = useAppStore(state => state.settings);
    const updateSettings = useAppStore(state => state.actions.updateSettings);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Dictionary & Data</h2>
                <p className="text-slate-500 text-sm">Configure data sources (Local).</p>
            </div>

            {/* Dictionary Source */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data Source</label>
                <div className="relative">
                    <select
                        value={settings.dataSource || 'dummy'}
                        onChange={(e) => updateSettings({ dataSource: e.target.value as any })}
                        className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="dummy">Dummy Data (Offline)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                    Using local JSON file (a2_vocab.json) and Electron store.
                </p>
            </div>
        </div>
    );
};

const AppearanceSettings = () => {
    const settings = useAppStore(state => state.settings);
    const updateSettings = useAppStore(state => state.actions.updateSettings);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Appearance</h2>
                <p className="text-slate-500 text-sm">Customize how the app looks and feels.</p>
            </div>

            {/* Popup Position Selector */}
            <div>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <LayoutTemplate size={18} className="text-slate-400" />
                    Popup Position
                </h3>

                {/* Visual Representation */}
                <div className="bg-slate-100 rounded-2xl p-8 flex items-center justify-center relative h-48 border border-slate-200">
                    <div className="w-64 h-32 bg-white rounded-lg shadow-sm border border-slate-300 relative">
                        {/* Center Screen */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Screen</span>
                        </div>

                        {/* Interactive Zones */}
                        <PositionZone pos="top-0 left-0" active={settings.popupPosition === 'Top Left'} onClick={() => updateSettings({ popupPosition: 'Top Left' })} />
                        <PositionZone pos="top-0 right-0" active={settings.popupPosition === 'Top Right'} onClick={() => updateSettings({ popupPosition: 'Top Right' })} />
                        <PositionZone pos="bottom-0 left-0" active={settings.popupPosition === 'Bottom Left'} onClick={() => updateSettings({ popupPosition: 'Bottom Left' })} />
                        <PositionZone pos="bottom-0 right-0" active={settings.popupPosition === 'Bottom Right'} onClick={() => updateSettings({ popupPosition: 'Bottom Right' })} />
                        <PositionZone pos="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-8" active={settings.popupPosition === 'Center'} onClick={() => updateSettings({ popupPosition: 'Center' })} />
                    </div>
                </div>
                <p className="text-center text-xs text-slate-500 mt-4 font-bold">Selected: {settings.popupPosition || 'Bottom Right'}</p>
            </div>
        </div>
    );
};

const DeveloperSettings = () => {
    const clearLocalData = useAppStore(state => state.actions.clearLocalData);
    const updateSettings = useAppStore(state => state.actions.updateSettings);

    const handleTestPopup = () => {
        if (window.electron) window.electron.showPopup(true);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Advanced</h2>
                <p className="text-slate-500 text-sm">Danger zone and debugging tools.</p>
            </div>

            <div className="bg-red-50/50 rounded-2xl border border-red-100 p-6">
                <h3 className="text-red-900 font-bold mb-4 flex items-center gap-2">
                    <Shield size={18} />
                    Danger Zone
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-100">
                        <div>
                            <p className="font-bold text-slate-800 text-sm">Test Popup Window</p>
                            <p className="text-xs text-slate-400">Trigger immediate popup.</p>
                        </div>
                        <button
                            onClick={handleTestPopup}
                            className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                        >
                            Trigger
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-100">
                        <div>
                            <p className="font-bold text-slate-800 text-sm">Reset App Settings</p>
                            <p className="text-xs text-slate-400">Restore default configuration.</p>
                        </div>
                        <button
                            onClick={() => {
                                updateSettings({
                                    workHoursStart: '09:00',
                                    workHoursEnd: '18:00',
                                    focusModeEnabled: false,
                                    frequency: 5,
                                    dataSource: 'dummy',
                                    popupPosition: 'Bottom Right'
                                });
                                alert('Settings reset to defaults');
                            }}
                            className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-100">
                        <div>
                            <p className="font-bold text-slate-800 text-sm">Clear Local Data</p>
                            <p className="text-xs text-slate-400">Wipe all storage and cache.</p>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm('Are you sure? This will reload the app.')) {
                                    await clearLocalData();
                                }
                            }}
                            className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                        >
                            Clear Data
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-mono text-[10px] text-slate-500">
                    App Version: 1.0.0-beta<br />
                    Electron: v28.0.0<br />
                    React: v18.2.0
                </p>
            </div>
        </div>

    );
};

// --- Helpers ---

const Switch = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 transition-colors"></div>
    </label>
);

const TimeInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
        <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono text-sm"
        />
    </div>
);

const PositionZone = ({ pos, active, onClick }: { pos: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`absolute w-8 h-8 rounded m-2 transition-all duration-300 ${active ? 'bg-blue-500 shadow-lg shadow-blue-500/50 scale-110' : 'bg-slate-100 hover:bg-slate-200'} ${pos}`}
    >
        {active && <CheckCircle size={12} className="text-white mx-auto" />}
    </button>
);

export default SettingsView;
