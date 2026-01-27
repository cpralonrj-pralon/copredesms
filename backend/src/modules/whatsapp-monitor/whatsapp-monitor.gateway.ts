import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export interface WhatsAppGroupUpdate {
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
    }[]; // Lista das últimas mensagens
}

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN || '*', // Permite configurar a origem via env para produção
    },
    namespace: '/whatsapp-monitor',
})
export class WhatsAppMonitorGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(WhatsAppMonitorGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Cliente conectado: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Cliente desconectado: ${client.id}`);
    }

    /**
     * Broadcast de atualização de grupo para todos os clientes conectados
     */
    broadcastGroupUpdate(update: WhatsAppGroupUpdate) {
        this.server.emit('group-update', update);
        this.logger.debug(`Broadcast: ${update.groupName}`);
    }

    /**
     * Broadcast de múltiplos grupos (para sincronização inicial)
     */
    broadcastGroupsSync(groups: WhatsAppGroupUpdate[]) {
        this.server.emit('groups-sync', groups);
        this.logger.debug(`Sync de ${groups.length} grupos`);
    }
}
