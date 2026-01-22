import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon?: React.ReactNode;
}

export function StatsCard({ title, value, trend, trendValue, icon }: StatsCardProps) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {icon}
            </div>

            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</h3>

            <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-white tracking-tight">{value}</span>

                {trend && (
                    <div className={`flex items-center text-xs font-medium mb-1.5 px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-500/10 text-green-400' :
                            trend === 'down' ? 'bg-red-500/10 text-red-400' :
                                'bg-slate-500/10 text-slate-400'
                        }`}>
                        {trend === 'up' && <ArrowUpRight size={14} className="mr-1" />}
                        {trend === 'down' && <ArrowDownRight size={14} className="mr-1" />}
                        {trend === 'neutral' && <Minus size={14} className="mr-1" />}
                        {trendValue}
                    </div>
                )}
            </div>
        </div>
    );
}
