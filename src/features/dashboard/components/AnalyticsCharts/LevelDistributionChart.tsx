/**
 * Level Distribution Chart Component
 * 
 * Displays vocabulary words distribution by CEFR level as a pie chart
 */

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { useAppStore } from '../../../../store';

// Colors for the CEFR levels
const COLORS = {
    A1: '#22d3ee', // Cyan 400
    A2: '#3b82f6', // Blue 500
    B1: '#facc15', // Yellow 400
    B2: '#fb923c', // Orange 400
    C1: '#818cf8', // Indigo 400
    C2: '#a78bfa', // Violet 400
};

export const LevelDistributionChart = () => {
    const words = useAppStore(state => state.words);

    const data = useMemo(() => {
        const counts: Record<string, number> = {};
        words.forEach(w => {
            const lvl = w.level || 'Unknown';
            counts[lvl] = (counts[lvl] || 0) + 1;
        });

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [words]);

    const totalWords = words.length;

    return (
        <div className="h-full flex flex-col p-5">
            <h3 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">Vocabulary Levels</h3>
            <div className="flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            cornerRadius={4}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.name] || '#CBD5E1'} stroke="none" />
                            ))}
                            <Label
                                value={totalWords}
                                position="centerBottom"
                                className="text-2xl font-black fill-slate-800"
                                dy={-5}
                            />
                            <Label
                                value="Total Words"
                                position="centerTop"
                                className="text-[10px] font-bold fill-slate-400 uppercase tracking-wide"
                                dy={15}
                            />
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {data.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: (COLORS as any)[entry.name] || '#CBD5E1' }}></div>
                        <span className="text-[10px] font-bold text-slate-500">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
