import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { IncidentImpactForm } from '../components/IncidentImpactForm';
import { SMSPreview } from '../components/SMSPreview';
import { Copy, Check, AlertCircle, Send } from 'lucide-react';


export function IncidentImpactGenerator() {
    const { user, profile } = useAuth();
    const [currentMessage, setCurrentMessage] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const [dispatched, setDispatched] = useState(false);

    const handleCopy = () => {
        if (currentMessage) {
            navigator.clipboard.writeText(currentMessage);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDispatch = async () => {
        if (currentMessage && isValid) {
            try {
                setDispatched(true);
                await api.post('/messages/send', {
                    canal: 'WHATSAPP', // Incidente com impacto costuma ser via WhatsApp/Grupo
                    regional: 'NACIONAL', // Default para impacto
                    telefone: '5521999999999', // Placeholder para grupo ou gestor
                    mensagem: currentMessage,
                    tipo: 'IMPACTO',
                    autor: profile?.nome || user?.email
                });
                setTimeout(() => setDispatched(false), 3000);
                setDispatched(false);
            } catch (error: any) {
                console.error('Erro ao disparar incidente:', error);
                setDispatched(false);
                const msg = error.response?.data?.message || error.message || 'Falha desconhecida';
                alert(`Erro no Backend: ${msg}`);
            }
        }
    };

    return (
        <div className="p-8 h-full overflow-y-auto custom-scrollbar">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <span>Operações</span>
                    <span>›</span>
                    <span className="text-amber-500">Incidente com Impacto</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 uppercase">Gerador de Incidente Padronizado</h1>
                <p className="text-slate-400 text-sm">Estruturação de mensagens de impacto seguindo o protocolo oficial COP REDE.</p>
            </div>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="p-6 bg-slate-900 rounded-lg border border-slate-800">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
                            <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                            Dados Técnicos do Incidente
                        </h2>
                        <IncidentImpactForm
                            onMessageChange={setCurrentMessage}
                            onValidationChange={(valid, missing) => {
                                setIsValid(valid);
                                setMissingFields(missing);
                            }}
                        />
                    </div>

                    {!isValid && (
                        <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg flex gap-3 animate-fade-in">
                            <AlertCircle className="text-red-500 shrink-0" size={20} />
                            <div>
                                <h4 className="text-xs font-bold text-red-400 uppercase mb-1">Campos Obrigatórios Pendentes</h4>
                                <p className="text-[10px] text-red-500/80 uppercase">
                                    Aguardando preenchimento: {missingFields.join(', ')}
                                </p>
                            </div>
                        </div>
                    )}

                    {isValid && (
                        <div className="p-6 bg-slate-900 rounded-lg border border-slate-800 border-l-4 border-l-emerald-500 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold text-emerald-500 uppercase">Mensagem Final Pronta</h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-bold transition-all"
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        {copied ? 'COPIADO' : 'COPIAR'}
                                    </button>
                                    <button
                                        onClick={handleDispatch}
                                        disabled={dispatched}
                                        className={`
                                            flex items-center gap-2 px-6 py-2 rounded-md text-xs font-bold transition-all shadow-lg
                                            ${dispatched
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20'}
                                        `}
                                    >
                                        {dispatched ? <Check size={14} /> : <Send size={14} />}
                                        {dispatched ? 'DISPARADO' : 'DISPARAR AGORA'}
                                    </button>
                                </div>
                            </div>
                            <pre className="p-4 bg-slate-950 rounded border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                                {currentMessage}
                            </pre>
                            {currentMessage.length > 2000 && (
                                <p className="mt-3 text-[10px] text-amber-500 font-bold uppercase flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Aviso: Conteúdo extenso para SMS único ({currentMessage.length} caracteres)
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <SMSPreview message={currentMessage} />
                </div>
            </div>
        </div>
    );
}
