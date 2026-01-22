import { useEffect, useState } from 'react';
import { ChartContainer } from '../../components/dashboard/ChartContainer';
import { DashboardService } from '../../services/dashboard.service';
import type { UserStat } from '../../services/dashboard.service';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Users, Trophy, Award, Medal } from 'lucide-react';

export function UserPerformance() {
    const [userStats, setUserStats] = useState<UserStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await DashboardService.getUserStats();
                setUserStats(data);
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
        return <div className="p-6 text-slate-500 animate-pulse">Carregando auditoria de usuários...</div>;
    }

    const topUser = userStats[0];

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full bg-slate-950">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Users className="text-blue-400" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Auditoria de Usuários</h1>
                </div>
                <p className="text-slate-500 text-sm">Ranking de atividade operacional e performance individual.</p>
            </header>

            {/* Top Performer Highlight */}
            {topUser && (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-bl-full translate-x-16 -translate-y-16" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="p-4 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                            <Trophy className="text-yellow-500" size={40} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Top Offensor (Volume)</p>
                            <h2 className="text-3xl font-bold text-white mb-1">{topUser.name}</h2>
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20">
                                {topUser.total.toLocaleString()} Mensagens
                            </span>
                        </div>
                    </div>
                    <div className="hidden md:block text-right relative z-10">
                        <p className="text-slate-500 text-xs mb-1">PARTICIPAÇÃO</p>
                        <p className="text-2xl font-bold text-slate-300">
                            {Math.round((topUser.total / userStats.reduce((acc, curr) => acc + curr.total, 0)) * 100)}%
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="h-[400px]">
                    <ChartContainer title="Volume por Operador (Top 10)">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userStats} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
                                />
                                <Bar dataKey="total" name="Total Enviado" radius={[0, 4, 4, 0]} barSize={20}>
                                    {userStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#eab308' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                {/* Ranking List */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h3 className="text-slate-100 font-semibold text-lg">Ranking Detalhado</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Posição</th>
                                    <th className="px-6 py-4">Usuário</th>
                                    <th className="px-6 py-4 text-right">Volume Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {userStats.map((user, index) => (
                                    <tr key={user.name} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {index === 0 && <Award size={18} className="text-yellow-500" />}
                                                {index === 1 && <Medal size={18} className="text-slate-400" />}
                                                {index === 2 && <Medal size={18} className="text-amber-700" />}
                                                <span className="font-mono text-slate-500">#{index + 1}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                        <td className="px-6 py-4 text-right font-mono">{user.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
