import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { SMSPreview } from '../components/SMSPreview';
import { DispatchHistory } from '../components/DispatchHistory';
import type { DispatchLog } from '../components/DispatchHistory';
import { Copy, Check, Send, Globe, AlertCircle } from 'lucide-react';

const REGIONS = [
    'RIO DE JANEIRO / ESPIRITO SANTO',
    'MINAS GERAIS',
    'NORDESTE',
    'BAHIA / SERGIPE',
    'NORTE',
    'CENTRO OESTE',
];

export function MassiveSmsGenerator() {
    const { user, profile } = useAuth();
    const [message, setMessage] = useState('');
    const [selectedRegions, setSelectedRegions] = useState<string[]>(REGIONS);
    const [logs, setLogs] = useState<DispatchLog[]>([]);
    const [copied, setCopied] = useState(false);
    const [dispatched, setDispatched] = useState(false);

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

    const toggleRegion = (region: string) => {
        setSelectedRegions(prev =>
            prev.includes(region)
                ? prev.filter(r => r !== region)
                : [...prev, region]
        );
    };

    const toggleAll = () => {
        if (selectedRegions.length === REGIONS.length) {
            setSelectedRegions([]);
        } else {
            setSelectedRegions(REGIONS);
        }
    };

    const handleCopy = () => {
        if (message) {
            navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDispatch = async () => {
        if (message && selectedRegions.length > 0) {
            setDispatched(true);
            const now = new Date().toLocaleTimeString('pt-BR');
            const dispatchedLogs: DispatchLog[] = [];

            try {
                // Send request with ALL selected regions
                const response = await api.post('/messages/send', {
                    canal: 'SMS',
                    regional: selectedRegions, // Send array directly so backend handles it as Massive
                    telefone: '5521999999999', // Placeholder
                    mensagem: message,
                    tipo: 'MASSIVO',
                    autor: profile?.nome || user?.email
                });

                // Add log entry (Massive type)
                dispatchedLogs.push({
                    id: response.data.id || (Date.now() + Math.random()).toString(),
                    timestamp: now,
                    region: selectedRegions.length > 1 ? 'MULTI' : selectedRegions[0],
                    status: response.data.status === 'SUCCESS' ? 'DELIVERED' : 'FAILED',
                    team: profile?.nome || 'Sistema',
                    action: 'DETALHES'
                });

            } catch (error) {
                console.error(`Erro ao disparar massivo:`, error);
                dispatchedLogs.push({
                    id: (Date.now() + Math.random()).toString(),
                    timestamp: now,
                    region: 'MULTI',
                    status: 'FAILED',
                    team: profile?.nome || 'Sistema',
                    action: 'REENTRADA'
                });
            }

            setLogs(prev => [...dispatchedLogs, ...prev]);
            setTimeout(() => setDispatched(false), 3000);
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto custom-scrollbar bg-app-main">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-app-text-secondary mb-1">
                    <span>Operações</span>
                    <span>›</span>
                    <span className="text-app-primary">Envio Massivo Regional</span>
                </div>
                <h1 className="text-3xl font-bold text-app-text-main mb-2 uppercase tracking-tight">Envio de SMS Massivo</h1>
                <p className="text-app-text-secondary text-sm">Disparo de comunicações em massa para equipes técnicas regionais simultaneamente.</p>
            </div>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Region Selection */}
                    <div className="p-6 bg-app-card rounded-lg border border-app-border">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-app-text-main flex items-center gap-2 uppercase tracking-tight">
                                <span className="w-1 h-6 bg-app-primary rounded-full"></span>
                                Seleção de Destinatários
                            </h2>
                            <button
                                onClick={toggleAll}
                                className="text-[10px] font-bold text-app-primary hover:text-app-primary/80 uppercase border border-app-primary/30 px-2 py-1 rounded"
                            >
                                {selectedRegions.length === REGIONS.length ? 'DESMARCAR TODOS' : 'SELECIONAR TODOS'}
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {REGIONS.map(region => (
                                <button
                                    key={region}
                                    onClick={() => toggleRegion(region)}
                                    className={`
                                        px-4 py-2 rounded-full text-xs font-bold transition-all border
                                        ${selectedRegions.includes(region)
                                            ? 'bg-app-primary/10 border-app-primary text-app-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]'
                                            : 'bg-app-sidebar border-app-border text-app-text-secondary hover:border-app-text-secondary/50'}
                                    `}
                                >
                                    {region}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Area */}
                    <div className="p-6 bg-app-card rounded-lg border border-app-border">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-app-text-main uppercase tracking-tight">Conteúdo da Mensagem</h2>
                            <span className={`text-[10px] font-bold ${message.length > 2000 ? 'text-red-500' : 'text-app-text-secondary opacity-60'}`}>
                                {message.length} / 2000 CARACTERES
                            </span>
                        </div>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={2000}
                            className="w-full h-64 bg-app-sidebar border border-app-border rounded-lg p-5 text-app-text-main focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary transition-all resize-none font-mono text-sm leading-relaxed placeholder:text-app-text-secondary/20"
                            placeholder="Digite aqui o texto da mensagem que sera enviada para todas as regionais selecionadas..."
                        />

                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleCopy}
                                    disabled={!message}
                                    className="flex items-center gap-2 px-4 py-2 bg-app-sidebar hover:bg-app-border disabled:opacity-50 disabled:cursor-not-allowed text-app-text-main rounded-md text-xs font-bold transition-all border border-app-border"
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'COPIADO' : 'COPIAR TEXTO'}
                                </button>

                                {message.length > 160 && (
                                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase">
                                        <AlertCircle size={12} />
                                        <span>Multi-SMS ({Math.ceil(message.length / 160)} partes)</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleDispatch}
                                disabled={!message || selectedRegions.length === 0}
                                className={`
                                    flex items-center gap-2 px-8 py-3 rounded-md text-sm font-bold transition-all transform active:scale-95 shadow-xl
                                    ${dispatched
                                        ? 'bg-emerald-600 text-white shadow-emerald-900/20'
                                        : 'bg-app-primary hover:bg-app-primary/80 text-app-primary-foreground shadow-app-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'}
                                `}
                            >
                                {dispatched ? <Check size={18} /> : <Send size={18} />}
                                {dispatched ? 'SMS DISPARADOS' : 'DISPARAR SMS MASSIVO'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-app-primary/5 border border-app-primary/20 rounded-lg">
                        <Globe className="text-app-primary shrink-0 mt-1" size={20} />
                        <div>
                            <h4 className="text-xs font-bold text-app-primary uppercase mb-1">Impacto Global</h4>
                            <p className="text-[10px] text-app-text-secondary uppercase leading-relaxed">
                                ESTA MENSAGEM SERA ENVIADA PARA {selectedRegions.length} REGIONAIS SIMULTANEAMENTE.
                                USE ESTA FERRAMENTA PARA COMUNICADOS GERAIS, ALERTAS NACIONAIS OU ATUALIZACOES DE MALHA CRUCIAL.
                            </p>
                        </div>
                    </div>

                    {/* Added History Component */}
                    <DispatchHistory logs={logs} />
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <SMSPreview message={message} />
                </div>
            </div>
        </div>
    );
}
