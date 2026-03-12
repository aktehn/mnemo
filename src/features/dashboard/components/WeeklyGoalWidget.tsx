import { Target } from 'lucide-react';

const WeeklyGoalWidget = () => {
    // Mock data
    const weeklyTarget = 100;
    const currentProgress = 65;
    const percentage = Math.round((currentProgress / weeklyTarget) * 100);

    return (
        <div className="h-full flex flex-col justify-between p-5 bg-gradient-to-br from-violet-600 to-purple-700 text-white relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-lg">Weekly Goal</h3>
                        <p className="text-white/70 text-xs">Keep pushing!</p>
                    </div>
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Target size={18} className="text-white" />
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-end gap-1 mb-1">
                        <span className="text-3xl font-black">{currentProgress}</span>
                        <span className="text-sm font-medium text-white/80 mb-1">/{weeklyTarget}</span>
                    </div>

                    <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Decoration */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
        </div>
    );
};

export default WeeklyGoalWidget;
