import { useEffect, useState } from 'react';
import api, { supabase } from '../services/api';
import { Clock, RefreshCw, Smartphone, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ActivityLog {
    id: string;
    created_at: string;
    action: string;
    canal: 'SMS' | 'WHATSAPP';
    regional: string;
    mensagem: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    user_id: string;
    users?: {
        nome: string;
    };
}

export function ActivityLogs() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/logs');
            setLogs(response.data || []);
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();

        // Realtime subscription
        const subscription = supabase
            .channel('activity_logs_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
                setLogs((prev) => [payload.new as ActivityLog, ...prev]);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'FAILED': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        }
    };

    const getChannelIcon = (canal: string) => {
        return canal === 'WHATSAPP' ? <Smartphone size={14} /> : <MessageSquare size={14} />;
    };

    return (
        <div className="p-8 h-full overflow-y-auto custom-scrollbar">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <span>Monitoramento</span>
                        <span>›</span>
                        <span className="text-cyan-500">Auditoria</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Logs de Atividade</h1>
                    <p className="text-slate-400 text-sm">Histórico operacional de todos os disparos realizados.</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950 text-xs uppercase font-bold text-slate-500 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4">Horário</th>
                            <th className="px-6 py-4">Operador</th>
                            <th className="px-6 py-4">Canal</th>
                            <th className="px-6 py-4">Regional</th>
                            <th className="px-6 py-4">Mensagem</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-white">
                                    {new Date(log.created_at).toLocaleString('pt-BR')}
                                </td>
                                <td className="px-6 py-4 font-medium text-white">
                                    {log.users?.nome || 'Sistema'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {getChannelIcon(log.canal)}
                                        {log.canal}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full bg-slate-800 text-xs font-bold border border-slate-700">
                                        {log.regional || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 max-w-[300px]">
                                    <p className="truncate text-xs font-mono text-slate-500" title={log.mensagem}>
                                        {log.mensagem}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(log.status)}`}>
                                        {log.status === 'SUCCESS' && <CheckCircle2 size={10} />}
                                        {log.status === 'FAILED' && <AlertCircle size={10} />}
                                        {log.status === 'PENDING' && <Clock size={10} />}
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {!loading && logs.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
