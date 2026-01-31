import { BarChart, BookOpen, Settings as SettingsIcon, LogOut, Crown } from 'lucide-react';
import { useAppStore } from '../../../store';
import { MnemoLogo } from '../../../components/MnemoLogo';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
    const logout = useAppStore(state => state.actions.logout);
    const user = useAppStore(state => state.user);
    const isAdmin = useAppStore(state => state.isAdmin);
    const isGuest = useAppStore(state => state.isGuest);

    return (
        <aside className="w-72 bg-white/95 backdrop-blur-xl border-r border-slate-100 flex flex-col fixed h-full z-20 transition-all duration-300 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)]">
            {/* Logo Section */}
            <div className="p-8 pb-6 flex items-center gap-3.5">
                <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
                    {/* Clean logo presentation without box, or minimal glow */}
                    <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                    <div className="relative z-10">
                        <MnemoLogo className="w-10 h-10 object-contain drop-shadow-sm" />
                    </div>
                </div>
                <div>
                    <span className="block text-2xl font-black text-slate-800 tracking-tight leading-none">Mnemo</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold ml-0.5">Master Your Vocab</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-2">
                <div className="px-4 mb-3 mt-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Main Menu</span>
                </div>

                {isAdmin && (
                    <NavItem
                        icon={<BarChart size={20} />}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                )}
                <NavItem
                    icon={<BookOpen size={20} />}
                    label="My Vocabulary"
                    active={activeTab === 'words'}
                    onClick={() => setActiveTab('words')}
                    badge={!isGuest && activeTab !== 'words' ? undefined : undefined} // Cleaned up random badge logic
                />
                <NavItem
                    icon={<SettingsIcon size={20} />}
                    label="Settings"
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                />

                {/* Premium Banner (Decorative for Non-Admins/Guests) */}
                {/* {!isAdmin && (
                    <div className="mt-8 mx-2 p-5 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl relative overflow-hidden group cursor-pointer shadow-xl shadow-indigo-200">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-start gap-3">
                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-sm">
                                <Crown size={20} className="text-yellow-300 fill-yellow-300" />
                            </div>
                            <div>
                                <p className="text-white font-black text-lg leading-tight tracking-tight">Go Premium</p>
                                <p className="text-blue-100 text-[11px] mt-1 font-medium leading-relaxed opacity-90 max-w-[140px]">
                                    Unlock unlimited words, AI pronunciation, and advanced stats.
                                </p>
                            </div>
                            <button className="mt-1 px-4 py-2 bg-white text-blue-700 rounded-lg text-xs font-bold w-full hover:bg-blue-50 transition-colors shadow-sm">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                )} */}
            </nav>

            {/* Profile Section */}
            <div className="p-4 mx-4 mb-4">
                <div className="bg-slate-50/80 p-3 rounded-[20px] border border-slate-200/60 shadow-sm group hover:bg-white hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-300">
                    <div className="flex items-center gap-3 p-1 rounded-xl transition-colors">
                        <div className="relative shrink-0">
                            <img
                                src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email || (isGuest ? 'Guest' : 'Admin')}&background=0F172A&color=fff`}
                                className="w-11 h-11 rounded-2xl object-cover ring-4 ring-white shadow-md group-hover:scale-105 transition-transform duration-300"
                                alt="Profile"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-[3px] border-white rounded-full ${user ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                {user?.user_metadata?.full_name || (isGuest ? 'Guest User' : (user?.email?.split('@')[0] || 'User'))}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold truncate flex items-center gap-1 mt-0.5">
                                {isGuest ? 'Starter Plan' : (isAdmin ? 'Admin Console' : 'Pro Plan')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full mt-3 flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 hover:bg-red-50 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold border border-transparent hover:border-red-100 group-hover:bg-white"
                    >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
    badge?: string;
}

const NavItem = ({ icon, label, active, onClick, badge }: NavItemProps) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm group relative overflow-hidden ${active
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 bg-transparent'
            }`}
    >
        <div className="flex items-center gap-4 relative z-10">
            <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:-rotate-3'}`}>
                {icon}
            </span>
            <span className="tracking-wide">{label}</span>
        </div>

        {badge && (
            <span className="bg-orange-500 text-white text-[9px] px-2 py-0.5 rounded-full shadow-sm animate-pulse font-black">
                {badge}
            </span>
        )}

        {/* Active Indicator decorative blur */}
        {active && (
            <div className="absolute top-0 right-0 w-20 h-full bg-white/10 skew-x-12 blur-md -mr-4 pointer-events-none"></div>
        )}
    </button>
);

export default Sidebar;
