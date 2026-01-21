

export interface DispatchLog {
    id: string;
    timestamp: string;
    region: string;
    status: 'DELIVERED' | 'FAILED' | 'RETRY' | 'PENDING';
    team: string;
    action: string;
}

export function DispatchHistory({ logs }: { logs: DispatchLog[] }) {
    return (
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Histórico de Despacho (Últimas 24h)</h3>
                <button className="text-xs text-[#0092D8] hover:text-[#4dbced] font-medium flex items-center gap-1 transition-colors">
                    VER LOGS COMPLETOS <span>→</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Horário</th>
                            <th className="px-6 py-4">Região</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Equipe</th>
                            <th className="px-6 py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-slate-300">{log.timestamp}</td>
                                <td className="px-6 py-4 text-slate-300">{log.region}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={log.status} />
                                </td>
                                <td className="px-6 py-4 text-slate-300">{log.team}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-xs font-bold text-[#006497] hover:text-[#0092D8] uppercase tracking-wider">{log.action}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
        RETRY: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        PENDING: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };

    const statusMap: Record<string, string> = {
        DELIVERED: 'ENTREGUE',
        FAILED: 'FALHOU',
        RETRY: 'REENTRADA',
        PENDING: 'PENDENTE'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status as keyof typeof styles]}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'DELIVERED' ? 'bg-emerald-400' : status === 'FAILED' ? 'bg-red-400' : 'bg-amber-400'}`}></span>
            {statusMap[status] || status}
        </span>
    );
}
