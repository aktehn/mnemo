import { useEffect } from 'react';
import { useAppStore } from '../../../store';
import DashboardHeader from './DashboardHeader';
// import SRSActionCard from './SRSActionCard';
import { LevelDistributionChart } from './AnalyticsCharts';
import QuickSearch from './QuickSearch';
import AdminStats from './AdminStats';

const DashboardView = () => {
    const loadWords = useAppStore(state => state.actions.loadWords);

    useEffect(() => {
        loadWords();
    }, [loadWords]);

    return (
        <div className="animate-fade-in space-y-6 pb-12 opacity-0 fill-mode-forwards" style={{ animationDelay: '0.1s' }}>
            {/* Header Section */}
            <DashboardHeader />

            {/* Quick Actions / Search */}
            <div className="w-full">
                <QuickSearch />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Level Distribution Chart */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-white/40 min-h-[360px] flex flex-col relative overflow-hidden group hover:shadow-2xl hover:shadow-cyan-500/5 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity duration-500"></div>
                    <LevelDistributionChart />
                </div>

                {/* System/Admin Stats or Activity Placeholder */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-white/40 min-h-[360px] flex flex-col justify-start relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-16 -mb-16 transition-opacity duration-500"></div>
                    <AdminStats />
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
