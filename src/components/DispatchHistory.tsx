

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
        <div className="bg-app-card rounded-lg border border-app-border overflow-hidden">
            <div className="p-4 border-b border-app-border flex justify-between items-center">
                <h3 className="text-xs font-semibold text-app-text-secondary opacity-70 uppercase tracking-wider">Histórico de Despacho (Últimas 24h)</h3>
                <button className="text-xs text-app-primary hover:text-app-primary/80 font-medium flex items-center gap-1 transition-colors">
                    VER LOGS COMPLETOS <span>→</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-app-text-secondary">
                    <thead className="bg-app-sidebar text-xs uppercase text-app-text-secondary opacity-70 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Horário</th>
                            <th className="px-6 py-4">Região</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Operador</th>
                            <th className="px-6 py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-app-sidebar/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-app-text-main">{log.timestamp}</td>
                                <td className="px-6 py-4 text-app-text-main">{log.region}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={log.status} />
                                </td>
                                <td className="px-6 py-4 text-app-text-main">{log.team}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-xs font-bold text-app-primary hover:text-app-primary/80 uppercase tracking-wider">{log.action}</button>
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
        PENDING: 'bg-app-text-secondary/10 text-app-text-secondary border-app-text-secondary/20',
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
