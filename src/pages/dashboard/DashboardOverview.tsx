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
            <div className="flex h-full items-center justify-center bg-app-main">
                <div className="text-app-primary animate-pulse text-sm font-medium">Carregando dados operacionais...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-app-main text-app-text-main">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-app-text-main">Visão Geral da Operação</h1>
                    <p className="text-app-text-secondary text-sm mt-1">Monitoramento em tempo real do gateway de mensagens.</p>
                </div>
                <div className="text-xs text-app-text-secondary bg-app-sidebar border border-app-border px-3 py-1.5 rounded-md">
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
                    icon={<MessageSquare className="text-app-primary" size={24} />}
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
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border), 0.5)" />
                            <XAxis dataKey="date" stroke="rgb(var(--text-secondary))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgb(var(--text-secondary))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgb(var(--bg-card))',
                                    borderColor: 'rgb(var(--border))',
                                    color: 'rgb(var(--text-main))'
                                }}
                                itemStyle={{ color: 'rgb(var(--text-main))' }}
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
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border), 0.5)" horizontal={false} />
                            <XAxis type="number" stroke="rgb(var(--text-secondary))" fontSize={10} tickLine={false} axisLine={false} hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="rgb(var(--text-secondary))"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                width={120}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(var(--bg-card), 0.5)' }}
                                contentStyle={{
                                    backgroundColor: 'rgb(var(--bg-card))',
                                    borderColor: 'rgb(var(--border))',
                                    color: 'rgb(var(--text-main))'
                                }}
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
