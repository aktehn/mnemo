import { useState } from 'react';

// Components
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import WordsView from '../../components/admin/WordsView';
import SettingsView from '../../components/admin/SettingsView';

const DashboardLayout = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="flex h-screen bg-[#F3F6F8] font-sans text-slate-800">
            {/* Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area */}
            <main className="flex-1 ml-72 flex flex-col h-full overflow-hidden">
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
