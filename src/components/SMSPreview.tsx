import { Signal, Battery, Wifi } from 'lucide-react';


interface SMSPreviewProps {
    message: string;
}

export function SMSPreview({ message }: SMSPreviewProps) {
    return (
        <div className="flex flex-col items-center">
            <div className="mb-4 text-center">
                <h3 className="text-sm font-bold text-app-text-main tracking-wider uppercase">Pré-visualização do SMS</h3>
                <p className="text-xs text-app-text-secondary">Emulação de Dispositivo Técnico Regional</p>
            </div>

            {/* Device Frame */}
            <div className="relative w-[300px] h-[600px] bg-app-card rounded-[3rem] border-8 border-app-sidebar shadow-2xl overflow-hidden flex flex-col">
                {/* Notch/Top Bar */}
                <div className="bg-app-sidebar/50 h-8 flex items-center justify-between px-6 text-[10px] text-app-text-secondary">
                    <span>09:41</span>
                    <div className="flex items-center gap-1">
                        <Signal size={10} />
                        <Wifi size={10} />
                        <Battery size={10} />
                    </div>
                </div>

                {/* Message Header */}
                <div className="bg-app-sidebar/30 p-4 border-b border-app-border/50 backdrop-blur-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-app-border flex items-center justify-center">
                        <span className="text-xs font-bold text-app-text-main">CA</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-app-text-main">Alertas Claro</p>
                        <p className="text-[10px] text-app-text-secondary">Sistema Verificado</p>
                    </div>
                </div>

                {/* Message Area */}
                <div className="flex-1 bg-app-sidebar/20 p-4 relative overflow-y-auto">
                    <div className="text-center text-[10px] text-app-text-secondary mb-6 font-medium">HOJE 14:30</div>

                    {/* Message Bubble */}
                    <div className="bg-[#0092D8] p-3 rounded-2xl rounded-tl-none text-white text-xs leading-normal shadow-lg max-w-[85%] animate-fade-in-up">
                        {message || "Gerando visualização..."}
                    </div>
                </div>

                {/* Footer/Input Area (Mock) */}
                <div className="p-3 bg-app-sidebar/50 border-t border-app-border/50">
                    <div className="flex items-center gap-2">
                        <div className="h-8 bg-app-card rounded-full flex-1 border border-app-border/50"></div>
                        <div className="w-8 h-8 bg-[#0092D8] rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5"></div>
                        </div>
                    </div>
                    <div className="text-[9px] text-center text-app-text-secondary mt-2">SIM 1 . COP REDE/CLARO</div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-app-text-secondary rounded-full opacity-50"></div>
            </div>

            <div className="mt-6 flex items-start gap-3 p-4 bg-app-card rounded-lg border border-app-border max-w-[320px]">
                <div className="w-5 h-5 rounded-full bg-app-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-app-primary text-xs font-bold">i</span>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-app-text-main mb-1">PROTOCOLO DE PRÉ-VISUALIZAÇÃO</h4>
                    <p className="text-[11px] text-app-text-secondary leading-relaxed">
                        A mensagem adiciona automaticamente <span className="text-app-text-main font-semibold">[CLARO-OPS]</span> para fins de auditoria. Caracteres especiais codificados via padrão GSM 03.38.
                    </p>
                </div>
            </div>
        </div>
    );
}
