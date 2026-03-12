import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '../../../store';

const AdminStats = () => {
    const words = useAppStore(state => state.words);
    const settings = useAppStore(state => state.settings);

    const learned = words.filter(w => w.is_learned).length;
    const inProgress = words.filter(w => !w.is_learned && w.repetition && w.repetition > 0).length;
    const remaining = words.filter(w => !w.is_learned).length;

    return (
            <div className="w-full h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <BookOpen size={16} className="text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Your Progress</h3>
                </div>

                <div className="space-y-4">
                    <Metric
                        label="Learned"
                        value={learned.toString()}
                        icon={<CheckCircle size={18} />}
                        gradient="from-emerald-500 to-teal-500"
                    />
                    <Metric
                        label="In Progress"
                        value={inProgress.toString()}
                        icon={<Clock size={18} />}
                        gradient="from-amber-500 to-orange-500"
                    />
                    <Metric
                        label="Remaining"
                        value={remaining.toString()}
                        icon={<BookOpen size={18} />}
                        gradient="from-slate-400 to-slate-500"
                    />
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Next popup in ~{settings.frequency} sec
                    </p>
                    <div className="w-full bg-slate-100 rounded-full h-1 mt-1">
                        <div
                            className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min((learned / (words.length || 1)) * 100, 100)}%` }}
                        />
                    </div>
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
