import { useEffect, useState } from 'react';
import { ChartContainer } from '../../components/dashboard/ChartContainer';
import { DashboardService } from '../../services/dashboard.service';
import type { ClusterStats } from '../../services/dashboard.service';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Map, AlertTriangle, CheckCircle } from 'lucide-react';

export function RegionalAnalysis() {
    const [clusterData, setClusterData] = useState<ClusterStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await DashboardService.getClusterStats();
                setClusterData(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        load();

        const unsubscribe = DashboardService.subscribeToUpdates(() => {
            load();
        });

        return () => {
            unsubscribe();
        };
    }, []);

    if (loading) {
        return <div className="p-6 text-slate-500 animate-pulse">Carregando dados regionais...</div>;
    }

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-950">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Map className="text-purple-400" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Análise Regional</h1>
                </div>
                <p className="text-slate-500 text-sm">Performance detalhada por Cluster e Regional.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Chart */}
                <div className="lg:col-span-2 h-[400px]">
                    <ChartContainer title="Comparativo de Volume (Top Clusters)">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={clusterData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={90} />
                                <Tooltip
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
                                />
                                <Legend />
                                <Bar dataKey="success" name="Sucesso" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} barSize={24} />
                                <Bar dataKey="failed" name="Falha" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                {/* Right Column: KPIs Summary or Donuts can go here, using Table for now */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-slate-100 font-semibold text-lg mb-4">Métricas de Erro</h3>
                        <div className="space-y-4">
                            {clusterData.slice(0, 5).map((cluster) => {
                                const errorRate = (cluster.failed / cluster.total) * 100;
                                return (
                                    <div key={cluster.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${errorRate > 2 ? 'bg-red-500' : 'bg-green-500'}`} />
                                            <span className="text-sm text-slate-300">{cluster.name}</span>
                                        </div>
                                        <div className="text-xs font-mono text-slate-400">
                                            {errorRate.toFixed(1)}% Erro
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-slate-100 font-semibold text-lg">Detalhamento por Cluster</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Regional / Cluster</th>
                                <th className="px-6 py-4">Total Enviado</th>
                                <th className="px-6 py-4 text-center">Sucesso</th>
                                <th className="px-6 py-4 text-center">Falha</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {clusterData.map((row) => (
                                <tr key={row.name} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{row.name}</td>
                                    <td className="px-6 py-4">{row.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center text-green-400">{row.success.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center text-red-400 font-bold">{row.failed.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        {(row.failed / row.total) > 0.05 ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold">
                                                <AlertTriangle size={12} /> CRÍTICO
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-medium">
                                                <CheckCircle size={12} /> NORMAL
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
