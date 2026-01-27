import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { WhatsAppMonitorGateway, WhatsAppGroupUpdate } from './whatsapp-monitor.gateway';

/**
 * Payload esperado do n8n
 */
interface N8nWebhookPayload {
    groupId: string;
    groupName: string;
    sender?: string;
    message?: string;
    timestamp?: string;
    memberCount?: number;
    status?: 'active' | 'idle' | 'offline';
    unreadCount?: number;
    eventType?: 'message' | 'member-change' | 'status-change' | 'sync';
    groups?: WhatsAppGroupUpdate[]; // Para sincronização de múltiplos grupos
    // Suporte para múltiplas mensagens vindas do n8n
    messages?: {
        sender: string;
        content: string;
        timestamp: string;
    }[];
}

@Controller('whatsapp-monitor')
export class WhatsAppMonitorController {
    private readonly logger = new Logger(WhatsAppMonitorController.name);

    constructor(private readonly gateway: WhatsAppMonitorGateway) { }

    /**
     * Endpoint para receber webhooks do n8n com atualizações dos grupos
     * POST /whatsapp-monitor/webhook
     */
    @Post('webhook')
    @HttpCode(200)
    async handleWebhook(@Body() rawPayload: N8nWebhookPayload | N8nWebhookPayload[]) {
        // n8n pode enviar array ou objeto, normalizar para objeto
        const payload = Array.isArray(rawPayload) ? rawPayload[0] : rawPayload;

        this.logger.log(`Webhook recebido: ${payload.eventType || 'update'}`);
        this.logger.debug(`Payload completo: ${JSON.stringify(payload, null, 2)}`);

        // Se for uma sincronização de múltiplos grupos
        if (payload.eventType === 'sync' && payload.groups) {
            this.logger.log(`Sincronizando ${payload.groups.length} grupos`);
            this.gateway.broadcastGroupsSync(payload.groups);
            return { success: true, message: 'Groups synced', count: payload.groups.length };
        }

        // Atualização individual de grupo
        const groupUpdate: WhatsAppGroupUpdate = {
            groupId: payload.groupId,
            groupName: payload.groupName,
            memberCount: payload.memberCount,
            status: payload.status || 'active',
            unreadCount: payload.unreadCount || 0,
        };

        // Adicionar mensagens recentes se existirem
        if (payload.messages && Array.isArray(payload.messages)) {
            groupUpdate.recentMessages = payload.messages;
            // Mantém compatibilidade com lastMessage pegando a primeira (ou última dependendo da ordem)
            if (payload.messages.length > 0) {
                groupUpdate.lastMessage = payload.messages[0];
            }
        }
        // Fallback para campos individuais (retrocompatibilidade)
        else if (payload.message && payload.sender) {
            const msg = {
                sender: payload.sender,
                content: payload.message,
                timestamp: payload.timestamp || new Date().toISOString(),
            };
            groupUpdate.lastMessage = msg;
            groupUpdate.recentMessages = [msg];
        }

        // Broadcast para todos os clientes conectados
        this.gateway.broadcastGroupUpdate(groupUpdate);

        return {
            success: true,
            message: 'Update broadcasted',
            groupId: payload.groupId
        };
    }
}
