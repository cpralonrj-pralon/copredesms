import { useState, useEffect } from 'react';
import { Send, Clock } from 'lucide-react';

interface DispatchFormProps {
    onMessageChange: (msg: string) => void;
    onDispatch: (data: any) => void;
}

const MESSAGE_TYPES = [
    { id: 'network_outage', label: 'Indisponibilidade de Rede (Crítico)', prefix: 'ALERTA DE INCIDENTE' },
    { id: 'maintenance', label: 'Manutenção Programada', prefix: 'MANUTENÇÃO PROGRAMADA' },
    { id: 'normalization', label: 'Normalização de Rede', prefix: 'NORMALIZAÇÃO DE REDE' },
    { id: 'critical', label: 'Alerta Crítico', prefix: 'ALERTA CRÍTICO' },
    { id: 'operational', label: 'Aviso Operacional', prefix: 'AVISO OPERACIONAL' },
];

const REGIONS = [
    'RIO DE JANEIRO/ESPIRITO SANTO',
    'MINAS GERAIS',
    'NORDESTE',
    'BAHIA/SERGIPE',
    'NORTE',
    'CENTRO OESTE',
];

export function DispatchForm({ onMessageChange, onDispatch }: DispatchFormProps) {
    const [formData, setFormData] = useState({
        type: MESSAGE_TYPES[0].id,
        region: REGIONS[0],
        description: '',
        time: 'NOW',
        action: ''
    });

    // Calculate message preview
    useEffect(() => {
        const selectedType = MESSAGE_TYPES.find(t => t.id === formData.type);
        const prefix = selectedType ? selectedType.prefix : 'AVISO';

        // Format: [TIPO] \n Regional: ... \n Descrição: ... \n Horário: ... \n Ação: ...
        const message = `[${prefix}]
Regional: ${formData.region}
Descrição: ${formData.description || '(Sem descrição)'}
Horário: ${formData.time === 'NOW' ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : formData.time}${formData.action ? `\nAção: ${formData.action}` : ''}`;

        onMessageChange(message);
    }, [formData, onMessageChange]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onDispatch(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Mensagem</label>
                    <select
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none"
                        value={formData.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                    >
                        {MESSAGE_TYPES.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Setor Regional</label>
                    <select
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none"
                        value={formData.region}
                        onChange={(e) => handleChange('region', e.target.value)}
                    >
                        {REGIONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição do Alerta</label>
                    <span className="text-xs text-slate-600">{formData.description.length} / 2000 CARACTERES</span>
                </div>
                <textarea
                    className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none placeholder:text-slate-700 font-mono text-sm"
                    placeholder="[CLARO-OPS] URGENTE: Falha crítica detectada no Site SP-01-A..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    maxLength={2000}
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Despacho Agendado</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="time"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-cyan-500"
                                disabled={formData.time === 'NOW'}
                                value={formData.time === 'NOW' ? '' : formData.time}
                                onChange={(e) => handleChange('time', e.target.value)}
                            />
                            <Clock className="absolute right-3 top-3.5 text-slate-500" size={16} />
                        </div>
                        <button
                            type="button"
                            className={`px-4 rounded-lg font-bold text-xs transition-colors ${formData.time === 'NOW' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                            onClick={() => handleChange('time', 'NOW')}
                        >
                            AGORA
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ação Necessária</label>
                    <input
                        type="text"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-cyan-500 uppercase placeholder:normal-case"
                        placeholder="NODE_INSPECTION_B12"
                        value={formData.action}
                        onChange={(e) => handleChange('action', e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span>Validado pelo Coordenador #1203</span>
                </div>
                <button
                    type="submit"
                    className="bg-[#008CBA] hover:bg-[#007da6] text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/20 transition-all transform hover:scale-105 active:scale-95"
                >
                    <Send size={18} />
                    DESPACHAR ALERTA
                </button>
            </div>
        </form>
    );
}
