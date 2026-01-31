import { useState } from 'react';
import { Flame } from 'lucide-react';
import { useAppStore } from '../../store';

// Components
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import WordsView from '../../components/admin/WordsView';
import SettingsView from '../../components/admin/SettingsView';

const DashboardLayout = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const isGuest = useAppStore(state => state.isGuest);

    return (
        <div className="flex h-screen bg-[#F3F6F8] font-sans text-slate-800">
            {/* Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area */}
            <main className="flex-1 ml-72 flex flex-col h-full overflow-hidden">
                {isGuest && (
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 shrink-0 flex items-center justify-between shadow-md z-20">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-1.5 rounded-lg animate-pulse">
                                <Flame size={16} className="text-yellow-300 fill-yellow-300" />
                            </div>
                            <p className="text-sm font-bold">
                                Guest Mode Active. <span className="font-normal opacity-90">Sign up to save your progress and access all features!</span>
                            </p>
                        </div>
                        <button
                            onClick={() => useAppStore.getState().actions.logout()}
                            className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide hover:bg-blue-50 transition-colors shadow-sm"
                        >
                            Create Account
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <Header activeTab={activeTab} />

                    {activeTab === 'dashboard' && <DashboardOverview />}
                    {activeTab === 'words' && <WordsView />}
                    {activeTab === 'settings' && <SettingsView />}
                </div>
            </main>
        </div>
    );
};

const Header = ({ activeTab }: { activeTab: string }) => {
    const titles = {
        dashboard: { title: 'Dashboard', desc: 'Your personal learning overview.' },
        words: { title: 'My Words', desc: 'Manage your vocabulary list.' },
        settings: { title: 'Settings', desc: 'Configure app preferences.' }
    };

    const current = titles[activeTab as keyof typeof titles] || titles.dashboard;

    return (
        <header className="flex justify-between items-center mb-8 animate-fade-in-down">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    {current.title}
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                    {current.desc}
                </p>
            </div>

        </header>
    );
};

export default DashboardLayout;
