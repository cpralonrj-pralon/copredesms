import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LogsService } from '../logs/logs.service';
import { N8nService } from '../n8n/n8n.service';
import { SendMessageDto } from './dto/send-message.dto';
import { StatusLog } from '../logs/dto/create-log.dto';

@Injectable()
export class MessagesService {
    constructor(
        private logsService: LogsService,
        private n8nService: N8nService,
    ) { }

    async sendMessage(sendMessageDto: SendMessageDto, userId: string, tenantId: string) {
        // 1. Criar Log Inicial como PENDING
        const log = await this.logsService.create({
            tenant_id: tenantId,
            user_id: userId,
            action: 'ENVIO',
            canal: sendMessageDto.canal,
            regional: sendMessageDto.regional,
            mensagem: sendMessageDto.mensagem,
            status: StatusLog.PENDING,
        });

        try {
            // 2. Enviar para n8n
            const { protocolo, status } = await this.n8nService.dispatch({
                log_id: log.id,
                tenant_id: tenantId,
                user_id: userId,
                ...sendMessageDto,
            });

            // 3. Atualizar Log para SUCCESS
            // Nota: Se quiser salvar o protocolo aqui, teria que atualizar o método updateStatus no LogsService também,
            // ou usar updateLogStatus que criamos recentemente.
            // Para manter compatibilidade com o que já existe neste arquivo:
            await this.logsService.updateLogStatus(log.id, 'SUCCESS', protocolo || undefined);

            return { success: true, protocolo };
        } catch (error) {
            // 4. Se falhar, atualizar Log para FAILED
            await this.logsService.updateStatus(log.id, StatusLog.FAILED, tenantId);
            throw new InternalServerErrorException('Erro ao processar o disparo operacional');
        }
    }
}
