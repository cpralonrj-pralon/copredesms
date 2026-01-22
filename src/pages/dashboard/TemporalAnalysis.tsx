import { useEffect, useState } from 'react';
import { ChartContainer } from '../../components/dashboard/ChartContainer';
import { DashboardService } from '../../services/dashboard.service';
import type { HourlyTraffic } from '../../services/dashboard.service';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Clock, Activity, Zap } from 'lucide-react';

export function TemporalAnalysis() {
    const [hourlyData, setHourlyData] = useState<HourlyTraffic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await DashboardService.getHourlyTraffic();
                // Ensure full 24h coverage filling gaps with 0
                const fullDay = Array.from({ length: 24 }, (_, i) => {
                    const hourStr = `${i.toString().padStart(2, '0')}:00`;
                    const existing = data.find(d => d.hour === hourStr);
                    return existing || { hour: hourStr, count: 0 };
                });
                setHourlyData(fullDay);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        load();
        const unsubscribe = DashboardService.subscribeToUpdates(load);
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="p-6 text-slate-500 animate-pulse">Carregando análise temporal...</div>;
    }

    // Peak hour calculation
    const maxVolume = Math.max(...hourlyData.map(d => d.count));
    const peakHour = hourlyData.find(d => d.count === maxVolume)?.hour || '-';

    // Heatmap intensity helper
    const getIntensityColor = (count: number) => {
        if (maxVolume === 0) return 'bg-slate-800';
        const ratio = count / maxVolume;
        if (ratio > 0.8) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
        if (ratio > 0.5) return 'bg-amber-500';
        if (ratio > 0.2) return 'bg-emerald-500';
        return 'bg-slate-700';
    };

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-950">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Clock className="text-amber-400" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Análise Temporal</h1>
                </div>
                <p className="text-slate-500 text-sm">Distribuição de tráfego por horário e identificação de picos.</p>
            </header>

            {/* Peak Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Pico de Tráfego</p>
                        <h3 className="text-2xl font-bold text-white">{peakHour}</h3>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/10 rounded-full text-cyan-500">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Volume Máx/Hora</p>
                        <h3 className="text-2xl font-bold text-white">{maxVolume.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Main Hourly Chart */}
            <div className="h-[350px]">
                <ChartContainer title="Volume nas últimas 24 horas">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="hour" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            {/* Heatmap Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-slate-100 font-semibold text-lg mb-6">Mapa de Calor (Intensidade Horária)</h3>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
                    {hourlyData.map((slot) => (
                        <div key={slot.hour} className="flex flex-col gap-1 group">
                            <div className={`h-12 w-full rounded-md transition-all hover:scale-105 cursor-pointer ${getIntensityColor(slot.count)} relative`}>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-md font-bold text-xs text-white">
                                    {slot.count}
                                </div>
                            </div>
                            <span className="text-[10px] text-slate-500 text-center font-mono">{slot.hour.split(':')[0]}h</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end items-center gap-4 mt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-700"></div>Baixo</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500"></div>Médio</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500"></div>Alto</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>Pico</div>
                </div>
            </div>
        </div>
    );
}
