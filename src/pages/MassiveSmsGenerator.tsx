import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { SMSPreview } from '../components/SMSPreview';
import { DispatchHistory } from '../components/DispatchHistory';
import type { DispatchLog } from '../components/DispatchHistory';
import { Copy, Check, Send, Globe, AlertCircle } from 'lucide-react';

const REGIONS = [
    'RIO DE JANEIRO/ESPIRITO SANTO',
    'MINAS GERAIS',
    'NORDESTE',
    'BAHIA/SERGIPE',
    'NORTE',
    'CENTRO OESTE',
];

const MOCK_LOGS: DispatchLog[] = [
    { id: 'm1', timestamp: '11:20:05', region: 'SP-01', status: 'DELIVERED', team: 'Equipe_5', action: 'DETALHES' },
    { id: 'm2', timestamp: '10:55:12', region: 'RJ-04', status: 'DELIVERED', team: 'Equipe_3', action: 'DETALHES' },
];

export function MassiveSmsGenerator() {
    const { user, profile } = useAuth();
    const [message, setMessage] = useState('');
    const [selectedRegions, setSelectedRegions] = useState<string[]>(REGIONS);
    const [logs, setLogs] = useState<DispatchLog[]>(MOCK_LOGS);
    const [copied, setCopied] = useState(false);
    const [dispatched, setDispatched] = useState(false);

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
                // Send single request with ALL regions
                const response = await api.post('/messages/send', {
                    canal: 'SMS',
                    regional: selectedRegions, // Send array directly
                    telefone: '5521999999999', // Placeholder
                    mensagem: message,
                    tipo: 'MASSIVO',
                    autor: profile?.nome || user?.email
                });

                // Add log entry (Massive type)
                dispatchedLogs.push({
                    id: response.data.id || (Date.now() + Math.random()).toString(),
                    timestamp: now,
                    region: 'MULTI', // Indicate multiple regions
                    status: response.data.status === 'SUCCESS' ? 'DELIVERED' : 'FAILED',
                    team: 'Equipe_M',
                    action: 'DETALHES'
                });

            } catch (error) {
                console.error(`Erro ao disparar massivo:`, error);
                dispatchedLogs.push({
                    id: (Date.now() + Math.random()).toString(),
                    timestamp: now,
                    region: 'MULTI',
                    status: 'FAILED',
                    team: 'Sistema',
                    action: 'REENTRADA'
                });
            }

            setLogs([...dispatchedLogs, ...logs]);
            setTimeout(() => setDispatched(false), 3000);
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto custom-scrollbar">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <span>Operações</span>
                    <span>›</span>
                    <span className="text-cyan-500">Envio Massivo Regional</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Envio de SMS Massivo</h1>
                <p className="text-slate-400 text-sm">Disparo de comunicações em massa para equipes técnicas regionais simultaneamente.</p>
            </div>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Region Selection */}
                    <div className="p-6 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2 uppercase tracking-tight">
                                <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                                Seleção de Destinatários
                            </h2>
                            <button
                                onClick={toggleAll}
                                className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 uppercase border border-cyan-900/50 px-2 py-1 rounded"
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
                                            ? 'bg-cyan-900/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}
                                    `}
                                >
                                    {region}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Area */}
                    <div className="p-6 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-white uppercase tracking-tight">Conteúdo da Mensagem</h2>
                            <span className={`text-[10px] font-bold ${message.length > 2000 ? 'text-red-500' : 'text-slate-600'}`}>
                                {message.length} / 2000 CARACTERES
                            </span>
                        </div>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={2000}
                            className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg p-5 text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none font-mono text-sm leading-relaxed placeholder:text-slate-800"
                            placeholder="Digite aqui o texto da mensagem que sera enviada para todas as regionais selecionadas..."
                        />

                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleCopy}
                                    disabled={!message}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-xs font-bold transition-all"
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
                                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'}
                                `}
                            >
                                {dispatched ? <Check size={18} /> : <Send size={18} />}
                                {dispatched ? 'SMS DISPARADOS' : 'DISPARAR SMS MASSIVO'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-cyan-950/20 border border-cyan-900/30 rounded-lg">
                        <Globe className="text-cyan-500 shrink-0 mt-1" size={20} />
                        <div>
                            <h4 className="text-xs font-bold text-cyan-400 uppercase mb-1">Impacto Global</h4>
                            <p className="text-[10px] text-cyan-500/80 uppercase leading-relaxed">
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
