import { Controller, Post, Body, UseGuards, Req, Logger, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { N8nService } from '../n8n/n8n.service';
import { LogsService } from '../logs/logs.service';
import { SupabaseService } from '../../shared/supabase.service'; // Added import
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateMessageDto {
    @IsOptional() // Changed to Optional to allow manual validation or array check
    regional: string | string[];

    @IsString()
    @IsNotEmpty()
    mensagem: string;

    @IsString()
    @IsNotEmpty()
    tipo: 'ALERTA' | 'IMPACTO' | 'MASSIVO';

    @IsString()
    @IsOptional()
    autor?: string;

    @IsString()
    @IsOptional()
    canal?: string;

    @IsString()
    @IsOptional()
    telefone?: string;
}

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
    private readonly logger = new Logger(MessagesController.name);

    constructor(
        private readonly n8nService: N8nService,
        private readonly logsService: LogsService,
        private readonly supabaseService: SupabaseService, // Injected
    ) { }

    @Post('send')
    async sendMessage(@Body() createMessageDto: CreateMessageDto, @Req() req: any) {
        const user = req.user;
        const { regional, mensagem, tipo, autor } = createMessageDto;

        // 1. Log Debug User
        console.log('👤 [Debug Controller] User:', user);

        // 2. Fetch entidade_id if missing
        // 2. Fetch entidade_id and regional if missing or needed
        let entidadeId = user.entidade_id;
        let userRegional = user.regional;

        // Sempre buscar no banco para garantir dados atualizados (regional e entidade_id)
        if (!entidadeId || !userRegional) {
            console.log('⚠️ [Debug Controller] Buscando dados do usuário (entidade_id/regional) no banco...');
            const { data, error } = await this.supabaseService.getClient()
                .from('users')
                .select('tenant_id, regional')
                .eq('id', user.id)
                .maybeSingle();

            if (error) {
                console.error('❌ Erro no Banco ao buscar usuário:', error.message);
                // Não bloquear se for apenas erro de busca, mas idealmente deveria ter profile
            }

            if (data) {
                entidadeId = data.tenant_id || entidadeId;
                userRegional = data.regional || userRegional;
                console.log('✅ Dados encontrados - Entidade:', entidadeId, 'Regional:', userRegional);
            } else {
                console.warn('⚠️ Perfil não encontrado na tabela public.users.');
            }

            if (!entidadeId) {
                // Fallback crítico se realmente não tiver entidade
                console.error('❌ Entidade não encontrada para dispatch.');
                // throw new InternalServerErrorException('Perfil do usuário incompleto (sem entidade).');
                // User asked to fix regional, assuming entidade might be handled or optional? 
                // Keeping exception if strict, but maybe logging is enough if validation passes later?
                // Original code threw exception. Keeping it safer to throw ONLY if needed for Logic.
                throw new InternalServerErrorException('Perfil do usuário incompleto (sem entidade).');
            }
        }

        // 3. Determine final regional
        let finalRegional: string | string[] = regional;

        // Logic: if Massive (Array), keep it. If single/missing, fallback to user.
        if (Array.isArray(regional)) {
            finalRegional = regional; // Keep array for Massive
        } else {
            // Standard single region logic
            finalRegional = (regional === 'NACIONAL' || !regional) && userRegional
                ? userRegional
                : regional;
        }

        // Format for DB/Log (Must be string)
        const dbRegional = Array.isArray(finalRegional) ? finalRegional.join(', ') : finalRegional;

        // 4. Log PENDING
        const logId = await this.logsService.createLog({
            entidade: entidadeId,
            entidade_id: entidadeId,
            user_id: user.id,
            acao: `ENVIO_${tipo}`,
            canal: 'SMS',
            regional: dbRegional, // Store as string in DB
            mensagem,
            status: 'PENDING',
        });

        try {
            // 5. Prepare payload for n8n
            const payload = {
                regional: finalRegional, // Send Array or String to n8n
                mensagem,
                tipo,
                autor: autor || user.email,
                timestamp: new Date().toISOString(),
                protocolo_local: logId,
                entidade_id: entidadeId,
                user_id: user.id
            };

            // 5. Send to n8n (with HMAC & Zero-Trust headers)
            const { protocolo, status } = await this.n8nService.dispatch(payload);

            const finalProtocol = protocolo || `LOCAL-${logId}`;

            // 6. Log SUCCESS
            await this.logsService.updateLogStatus(logId, 'SUCCESS', finalProtocol);

            return {
                id: logId,
                status: 'SUCCESS',
                protocolo: finalProtocol,
                created_at: new Date(),
            };

        } catch (error) {
            // 7. Log FAILED
            await this.logsService.updateLogStatus(logId, 'FAILED', undefined, error.message);

            this.logger.error(`Failed to send message: ${error.message}`);
            throw new InternalServerErrorException(error.message || 'Falha no envio da mensagem.');
        }
    }
}
