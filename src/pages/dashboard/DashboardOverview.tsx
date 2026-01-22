import { useEffect, useState } from 'react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { ChartContainer } from '../../components/dashboard/ChartContainer';
import { DashboardService } from '../../services/dashboard.service';
import type { DashboardKPI, DailyVolume, ClusterStats } from '../../services/dashboard.service';
import { MessageSquare, CheckCircle, Wifi } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';

export function DashboardOverview() {
    const [kpi, setKpi] = useState<DashboardKPI | null>(null);
    const [dailyVolume, setDailyVolume] = useState<DailyVolume[]>([]);
    const [clusterStats, setClusterStats] = useState<ClusterStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [kpiData, volumeData, clusterData] = await Promise.all([
                    DashboardService.getKPIs(),
                    DashboardService.getDailyVolume(),
                    DashboardService.getClusterStats()
                ]);
                setKpi(kpiData);
                setDailyVolume(volumeData);
                setClusterStats(clusterData);
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();

        const unsubscribe = DashboardService.subscribeToUpdates(() => {
            loadData();
        });

        return () => {
            unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-slate-950">
                <div className="text-cyan-500 animate-pulse text-sm font-medium">Carregando dados operacionais...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-950 text-slate-200">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white">Visão Geral da Operação</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitoramento em tempo real do gateway de mensagens.</p>
                </div>
                <div className="text-xs text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md">
                    Atualizado em: {new Date().toLocaleTimeString()}
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Mensagens"
                    value={kpi?.totalMessages.toLocaleString() || '0'}
                    trend={kpi?.trend}
                    trendValue="vs. ontem"
                    icon={<MessageSquare className="text-cyan-500" size={24} />}
                />
                <StatsCard
                    title="Envios SMS"
                    value={kpi?.smsCount.toLocaleString() || '0'}
                    trend="neutral"
                    trendValue="Estável"
                    icon={<Wifi className="text-blue-500" size={24} />}
                />
                <StatsCard
                    title="Envios WhatsApp"
                    value={kpi?.whatsappCount.toLocaleString() || '0'}
                    trend="up"
                    trendValue="+12%"
                    icon={<MessageSquare className="text-green-500" size={24} />}
                />
                <StatsCard
                    title="Taxa de Sucesso"
                    value={`${kpi?.successRate}%`}
                    trend={kpi && kpi.successRate > 98 ? 'up' : 'down'}
                    trendValue="SLA"
                    icon={<CheckCircle className={kpi && kpi.successRate > 98 ? 'text-green-500' : 'text-amber-500'} size={24} />}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <ChartContainer title="Volume de Envios (7 Dias)">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyVolume}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="sms" name="SMS" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="whatsapp" name="WhatsApp" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Distribuição por Cluster (Top 5)">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={clusterStats.filter(c => c.total > 0).slice(0, 5)}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                            <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#94a3b8"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                width={120}
                            />
                            <Tooltip
                                cursor={{ fill: '#1e293b' }}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
                            />
                            <Bar dataKey="success" name="Sucesso" stackId="a" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                            <Bar dataKey="failed" name="Falha" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </div>
    );
}
