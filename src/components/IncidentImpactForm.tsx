import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface IncidentImpactFormProps {
    onMessageChange: (msg: string) => void;
    onValidationChange: (isValid: boolean, missingFields: string[]) => void;
}

export function IncidentImpactForm({ onMessageChange, onValidationChange }: IncidentImpactFormProps) {
    const [formData, setFormData] = useState({
        topologia: '',
        incidente: 'ROMPIMENTO DE FIBRA RESIDENCIAL',
        cidade_cluster: '',
        area_distrito: '',
        impacto: '',
        base_afetada: '',
        data_hora_abertura: '',
        previsao_outage: '',
        data_hora_acionamento: '',
        tipo_status: 'ACIONADO / MONITORANDO'
    });

    const fields = [
        { id: 'topologia', label: 'Topologia', placeholder: 'Ex: HFC / GPON' },
        { id: 'incidente', label: 'Incidente', placeholder: 'Ex: ROMPIMENTO DE FIBRA RESIDENCIAL' },
        { id: 'cidade_cluster', label: 'Cidade/Cluster', placeholder: 'Ex: SÃO PAULO / LESTE' },
        { id: 'area_distrito', label: 'Área/Distrito', placeholder: 'Ex: DISTRITO 01' },
        { id: 'impacto', label: 'Impacto', placeholder: 'Ex: INTERRUPÇÃO TOTAL' },
        { id: 'base_afetada', label: 'Base Afetada', placeholder: 'Ex: 1500 ASSINANTES' },
        { id: 'data_hora_abertura', label: 'Data/Hora Abertura', placeholder: 'Ex: 20/01 14:00' },
        { id: 'previsao_outage', label: 'Previsão Outage', placeholder: 'Ex: 04 HORAS' },
        { id: 'data_hora_acionamento', label: 'Data/Hora Acionamento', placeholder: 'Ex: 20/01 14:15' },
        { id: 'tipo_status', label: 'Status', placeholder: 'Ex: EM CAMPO / ACIONADO' },
    ];

    useEffect(() => {
        const missingFields = fields
            .filter(f => !formData[f.id as keyof typeof formData])
            .map(f => f.label);

        const isValid = missingFields.length === 0;
        onValidationChange(isValid, missingFields);

        if (isValid) {
            const message = `## COP REDE INFORMA: INCIDENTE COM IMPACTO
## ${formData.incidente}
## TOPOLOGIA: ${formData.topologia}
## INCIDENTE: ${formData.incidente}
## CIDADE/CLUSTER: ${formData.cidade_cluster}
## AREA/DISTRITO: ${formData.area_distrito}
## IMPACTO: ${formData.impacto}
## BASE AFETADA: ${formData.base_afetada}
## DATA E HORA DA ABERTURA: ${formData.data_hora_abertura}
## PREVISÃO DO OUTAGE: ${formData.previsao_outage}
## DATA E HORA DE ACIONAMENTO: ${formData.data_hora_acionamento}
## TIPO DE STATUS: ${formData.tipo_status}`;

            onMessageChange(message);
        } else {
            onMessageChange('');
        }
    }, [formData]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value.toUpperCase() }));
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.map((field) => (
                    <div key={field.id} className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {field.label}
                        </label>
                        <input
                            type="text"
                            value={formData[field.id as keyof typeof formData]}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all uppercase placeholder:normal-case placeholder:text-slate-800"
                            placeholder={field.placeholder}
                        />
                    </div>
                ))}
            </div>

            <div className="bg-amber-900/10 border border-amber-900/20 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                <div className="text-[10px] text-amber-200/70 leading-relaxed uppercase">
                    <p className="font-bold text-amber-500 mb-1">REGRAS DE CONFORMIDADE</p>
                    TODOS OS CAMPOS SÃO OBRIGATÓRIOS. NÃO USE EMOJIS. O TEXTO SERÁ AUTOMATICAMENTE FORMATADO PARA O PADRÃO COP REDE.
                </div>
            </div>
        </div>
    );
}
