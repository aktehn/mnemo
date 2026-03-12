import { User } from 'lucide-react';

const DashboardHeader = () => {
    return (
        <div className="flex flex-col gap-1 mb-8">
            <div className="mt-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 rounded-3xl p-8 relative overflow-hidden shadow-2xl text-white">
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
                        <User className="text-white/80" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-1">
                            Welcome back to Mnemo, Learner! 👋
                        </h2>
                        <p className="text-white/60 font-medium text-sm">
                            You're doing great! Keep up the momentum.
                        </p>
                    </div>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>
        </div>
    );
};

export default DashboardHeader;
