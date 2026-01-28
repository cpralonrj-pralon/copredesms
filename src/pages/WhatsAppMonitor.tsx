import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Users, MessageSquare, Clock, Wifi, WifiOff, Radio } from 'lucide-react';

interface WhatsAppGroupUpdate {
    groupId: string;
    groupName: string;
    description?: string; // Descrição do grupo
    lastMessage?: {
        sender: string;
        content: string;
        timestamp: string;
    };
    memberCount?: number;
    status?: 'active' | 'idle' | 'offline';
    unreadCount?: number;
    recentMessages?: {
        sender: string;
        content: string;
        timestamp: string;
    }[];
}

// WebSocket não usa o prefixo /api/v1, então precisamos da URL base
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const BACKEND_URL = API_URL.endsWith('/api/v1')
    ? API_URL.replace('/api/v1', '')
    : API_URL; // Remove o prefixo para WebSocket se ele existir

export function WhatsAppMonitor() {
    const [groups, setGroups] = useState<Map<string, WhatsAppGroupUpdate>>(new Map());
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Conectar ao WebSocket
        const socket = io(`${BACKEND_URL}/whatsapp-monitor`, {
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Conectado ao monitor WhatsApp');
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Desconectado do monitor WhatsApp');
            setConnected(false);
        });

        // Receber atualização de grupo individual
        socket.on('group-update', (update: WhatsAppGroupUpdate) => {
            console.log('Atualização recebida:', update);
            setGroups((prev) => {
                const newGroups = new Map(prev);
                newGroups.set(update.groupId, update);
                return newGroups;
            });
        });

        // Receber sincronização de múltiplos grupos
        socket.on('groups-sync', (groupsList: WhatsAppGroupUpdate[]) => {
            console.log('Sincronização recebida:', groupsList.length, 'grupos');
            console.log('Primeiro grupo:', groupsList[0]); // Debug: ver estrutura
            setGroups((prev) => {
                const newGroups = new Map(prev);
                groupsList.forEach((group) => {
                    if (group.groupId) { // Só adicionar se tiver groupId
                        newGroups.set(group.groupId, group);
                    } else {
                        console.warn('Grupo sem groupId:', group);
                    }
                });
                return newGroups;
            });
        });

        // Scroll Lock Effect
        document.body.style.overflow = 'hidden';
        return () => {
            socket.disconnect();
            document.body.style.overflow = 'unset';
        };
    }, []);

    const formatTime = (timestamp?: string) => {
        if (!timestamp) return '--:--';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const groupsArray = Array.from(groups.values()).sort((a, b) => {
        // Ordenar por timestamp da última mensagem (mais recente primeiro)
        if (!a.lastMessage?.timestamp) return 1;
        if (!b.lastMessage?.timestamp) return -1;
        return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });

    return (
        <div className="p-6 space-y-6 h-screen overflow-y-auto pb-20 custom-scrollbar bg-app-main">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-app-text-main flex items-center gap-3">
                        <Radio className="text-green-500" size={28} />
                        Monitor de Grupos WhatsApp
                    </h1>
                    <p className="text-app-text-secondary mt-1">
                        Monitoramento em tempo real dos grupos WhatsApp
                    </p>
                </div>

                {/* Status de Conexão */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${connected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    {connected ? (
                        <>
                            <Wifi size={18} />
                            <span className="font-medium">Conectado</span>
                        </>
                    ) : (
                        <>
                            <WifiOff size={18} />
                            <span className="font-medium">Desconectado</span>
                        </>
                    )}
                </div>
            </div>

            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-app-card border border-app-border rounded-lg p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-app-text-secondary">Total de Grupos</p>
                            <p className="text-3xl font-bold text-app-text-main mt-1">{groups.size}</p>
                        </div>
                        <Users className="text-app-primary" size={32} />
                    </div>
                </div>

                <div className="bg-app-card border border-app-border rounded-lg p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-app-text-secondary">Grupos Ativos</p>
                            <p className="text-3xl font-bold text-green-500 mt-1">
                                {groupsArray.filter((g) => g.status === 'active').length}
                            </p>
                        </div>
                        <MessageSquare className="text-green-500" size={32} />
                    </div>
                </div>

                <div className="bg-app-card border border-app-border rounded-lg p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-app-text-secondary">Mensagens Não Lidas</p>
                            <p className="text-3xl font-bold text-yellow-500 mt-1">
                                {groupsArray.reduce((acc, g) => acc + (g.unreadCount || 0), 0)}
                            </p>
                        </div>
                        <Clock className="text-yellow-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Grid de Grupos */}
            {groupsArray.length === 0 ? (
                <div className="bg-app-card/30 border border-app-border rounded-lg p-12 text-center">
                    <MessageSquare className="mx-auto text-app-text-secondary opacity-30 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-app-text-secondary mb-2">
                        Nenhum grupo sendo monitorado
                    </h3>
                    <p className="text-app-text-secondary opacity-60">
                        Aguardando dados do n8n via webhook...
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center pb-10">
                    {groupsArray.map((group) => (
                        <div key={group.groupId} className="relative w-full max-w-[300px] aspect-[9/19] group select-none">


                            {/* Screen Content Wrapper - Com borda de fallback para parecer um celular mesmo sem a imagem */}
                            {/* Ajustei o top/bottom para alinhar melhor e adicionei borda preta grossa */}
                            <div className="absolute top-[2%] left-[3%] right-[3%] bottom-[2%] bg-[#0b141a] z-10 rounded-[2.5rem] border-[8px] border-[#121212] overflow-hidden flex flex-col shadow-2xl">

                                {/* Header do App (Simulando WhatsApp) */}
                                <div className="bg-[#202c33] px-3 py-3 flex items-center gap-2 border-b border-white/5 shrink-0 pt-8">
                                    <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden relative">
                                        {/* Avatar Placeholder */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800"></div>
                                        <span className="relative z-10">{group.groupName.substring(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-gray-100 text-sm font-semibold truncate leading-tight">
                                            {group.groupName}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 truncate">
                                            {group.status === 'active' ? 'online' : 'visto por último hoje'}
                                        </p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${group.status === 'active' ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                                </div>

                                {/* Área de Mensagens */}
                                <div className="flex-1 p-2 overflow-y-auto space-y-3 custom-scrollbar flex flex-col-reverse bg-[#0b141a] bg-opacity-95 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                                    {(group.recentMessages && group.recentMessages.length > 0) ? (
                                        group.recentMessages.map((msg, idx) => (
                                            <div key={idx} className="bg-[#202c33] rounded-lg rounded-tl-none p-2.5 shadow-sm text-sm border border-white/5">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[11px] font-bold ${['text-orange-400', 'text-purple-400', 'text-blue-400'][idx % 3]}`}>
                                                        {msg.sender.split(' ')[0]}
                                                    </span>
                                                    <span className="text-[9px] text-gray-500 ml-2">
                                                        {formatTime(msg.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-200 text-xs whitespace-pre-wrap break-words leading-relaxed tracking-wide">
                                                    {msg.content}
                                                </p>
                                            </div>
                                        ))
                                    ) : group.lastMessage ? (
                                        <div className="bg-[#202c33] rounded-lg rounded-tl-none p-2.5 shadow-sm text-sm animate-fade-in border border-white/5">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[11px] font-bold text-blue-400">
                                                    {group.lastMessage.sender}
                                                </span>
                                                <span className="text-[9px] text-gray-500 ml-2">
                                                    {formatTime(group.lastMessage.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-gray-200 text-xs whitespace-pre-wrap break-words leading-relaxed tracking-wide">
                                                {group.lastMessage.content}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 opacity-50">
                                            <p className="text-[10px] text-gray-500 italic">Sem mensagens recentes</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Fake (Input Area) */}
                                <div className="bg-[#202c33] p-2 flex items-center gap-2 shrink-0 border-t border-white/5 pb-4">
                                    <div className="w-6 h-6 rounded-full bg-slate-600/30"></div>
                                    <div className="flex-1 h-8 rounded-full bg-slate-700/20"></div>
                                    <div className="w-8 h-8 rounded-full bg-teal-600/40"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
