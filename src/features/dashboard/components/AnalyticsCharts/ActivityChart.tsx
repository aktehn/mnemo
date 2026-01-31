/**
 * Activity Chart Component
 * 
 * Displays weekly learning activity as a bar chart
 */

import { BarChart, Bar, XAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { BlurredOverlay } from './BlurredOverlay';
import { useAppStore } from '../../../../store';

export const ActivityChart = () => {
    const isGuest = useAppStore(state => state.isGuest);

    // Mock data - In real app, calculate from progress history
    const data = [
        { day: 'Mon', count: 12 },
        { day: 'Tue', count: 18 },
        { day: 'Wed', count: 5 },
        { day: 'Thu', count: 24 },
        { day: 'Fri', count: 15 },
        { day: 'Sat', count: 8 },
        { day: 'Sun', count: 20 },
    ];

    if (isGuest) {
        return <BlurredOverlay title="Learning Activity" />;
    }

    return (
        <div className="h-full flex flex-col p-5">
            <h3 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">Weekly Activity</h3>
            <div className="flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={4}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.4} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: '#F1F5F9', radius: 4 }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '8px 12px' }}
                        />
                        <Bar
                            dataKey="count"
                            fill="url(#colorCount)"
                            radius={[6, 6, 6, 6]}
                            barSize={12}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
