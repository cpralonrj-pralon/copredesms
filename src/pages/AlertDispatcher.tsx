import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { DispatchForm } from '../components/DispatchForm';
import { SMSPreview } from '../components/SMSPreview';
import { DispatchHistory } from '../components/DispatchHistory';
import type { DispatchLog } from '../components/DispatchHistory';

export function AlertDispatcher() {
    const { user, profile } = useAuth();
    const [currentMessage, setCurrentMessage] = useState('');
    const [logs, setLogs] = useState<DispatchLog[]>([]);

    useEffect(() => {
        const fetchRecentLogs = async () => {
            try {
                const { data } = await api.get('/logs');
                if (data) {
                    const formattedLogs: DispatchLog[] = data.slice(0, 50).map((log: any) => ({
                        id: log.id,
                        timestamp: new Date(log.created_at).toLocaleTimeString('pt-BR'),
                        region: log.regional || 'N/A',
                        status: log.status === 'SUCCESS' ? 'DELIVERED' : 'FAILED',
                        team: log.users?.nome || 'Sistema',
                        action: 'DETALHES'
                    }));
                    setLogs(formattedLogs);
                }
            } catch (error) {
                console.error('Failed to fetch logs', error);
            }
        };
        fetchRecentLogs();
    }, []);

    const handleDispatch = async (data: any) => {
        try {
            const response = await api.post('/messages/send', {
                canal: 'SMS', // Default for this module
                regional: data.region,
                telefone: '5521999999999', // Placeholder idealmente vindo do form
                mensagem: currentMessage,
                tipo: 'ALERTA',
                autor: profile?.nome || user?.email
            });

            const newLog: DispatchLog = {
                id: response.data.id,
                timestamp: new Date().toLocaleTimeString('pt-BR'),
                region: data.region.split(' ')[0],
                status: response.data.status === 'SUCCESS' ? 'DELIVERED' : 'FAILED',
                team: profile?.nome || 'Sistema',
                action: 'DETALHES'
            };
            setLogs([newLog, ...logs]);
        } catch (error) {
            console.error('Erro ao despachar alerta:', error);
            // Fallback for demo
            setLogs([{
                id: Date.now().toString(),
                timestamp: new Date().toLocaleTimeString('pt-BR'),
                region: data.region.split(' ')[0],
                status: 'FAILED',
                team: profile?.nome || 'Sistema',
                action: 'REENTRADA'
            }, ...logs]);
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto custom-scrollbar">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <span>Operações</span>
                    <span>›</span>
                    <span className="text-cyan-400">Despacho de Alertas</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">CONTROLE OPERACIONAL DE SMS</h1>
                <p className="text-slate-400 text-sm">Despacho de alertas técnicos localizados para equipes de manutenção regional.</p>
            </div>

            <div className="grid grid-cols-12 gap-8 h-full">
                {/* Main Content Area - Form & History */}
                <div className="col-span-8 space-y-6">
                    <div className="p-6 bg-slate-900 rounded-lg border border-slate-800">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                            CONFIGURAÇÃO DE DESPACHO
                        </h2>
                        <DispatchForm
                            onMessageChange={setCurrentMessage}
                            onDispatch={handleDispatch}
                        />
                    </div>

                    <DispatchHistory logs={logs} />
                </div>

                {/* Right Panel - Phone Preview */}
                <div className="col-span-4">
                    <SMSPreview message={currentMessage} />
                </div>
            </div>
        </div>
    );
}
