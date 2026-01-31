import { Database, Users, Server, Shield } from 'lucide-react';
import { useAppStore } from '../../../store';

const AdminStats = () => {
    const isAdmin = useAppStore(state => state.isAdmin);
    const words = useAppStore(state => state.words);

    if (!isAdmin) {
        // Show something for regular users? Maybe total learned words.
        const learned = words.filter(w => w.is_learned).length;
        return (
            <div className="w-full h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <Shield size={16} className="text-blue-500" />
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Your Progress</h3>
                </div>
                <Metric
                    label="Learned Words"
                    value={learned.toString()}
                    icon={<Database size={16} />}
                    status="green"
                />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <Shield size={16} className="text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">System Overview</h3>
            </div>

            <div className="space-y-4">
                <Metric
                    label="Total Words"
                    value={words.length.toString()}
                    icon={<Database size={18} />}
                    gradient="from-cyan-500 to-blue-500"
                />
                {/* Add more system stats if available later */}
            </div>
        </div>
    );
};

const Metric = ({ label, value, icon, gradient = "from-slate-500 to-slate-600" }: any) => (
    <div className="relative overflow-hidden group p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className={`absolute top-0 right-0 p-20 bg-gradient-to-br ${gradient} opacity-[0.03] rounded-bl-full -mr-10 -mt-10 transition-opacity group-hover:opacity-[0.08]`}></div>

        <div className="relative z-10 flex items-center justify-between">
            <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="text-3xl font-black text-slate-800 tracking-tight">{value}</div>
            </div>
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
        </div>
    </div>
);

export default AdminStats;
