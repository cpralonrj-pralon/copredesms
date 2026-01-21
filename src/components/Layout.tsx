import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import type { ViewType } from '../App';

export function Layout({ children, activeView, onViewChange }: {
    children: React.ReactNode;
    activeView: ViewType;
    onViewChange: (view: ViewType) => void;
}) {
    const [gatewayStatus, setGatewayStatus] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');

    useEffect(() => {
        const checkHealth = async () => {
            try {
                // Usa fetch direto ou api.get. Se api.get interceptar erros, fetch pode ser mais seguro para health check silencioso.
                // Fallback para api/v1 caso a env var não esteja carregada
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
                const response = await fetch(`${apiUrl}/health`);
                if (response.ok) {
                    setGatewayStatus('ONLINE');
                } else {
                    setGatewayStatus('OFFLINE');
                }
            } catch (error) {
                setGatewayStatus('OFFLINE');
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
            <Sidebar activeView={activeView} onViewChange={onViewChange} />
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 z-10">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${gatewayStatus === 'ONLINE'
                        ? 'bg-green-900/30 text-green-400 border-green-900/50'
                        : 'bg-red-900/30 text-red-400 border-red-900/50'
                        }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${gatewayStatus === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        GATEWAY: {gatewayStatus}
                    </span>
                </div>
                {children}
            </main>
        </div>
    );
}
