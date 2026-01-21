import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LogsService } from './logs.service';
import { SupabaseService } from '../../shared/supabase.service';

@Controller('logs')
@UseGuards(AuthGuard('jwt'))
export class LogsController {
    constructor(
        private readonly logsService: LogsService,
        private readonly supabaseService: SupabaseService
    ) { }

    @Get()
    async findAll(@Req() req: any) {
        const user = req.user;
        let entidadeId = user.entidade_id;

        if (!entidadeId) {
            const { data } = await this.supabaseService.getClient()
                .from('users')
                .select('tenant_id')
                .eq('id', user.id)
                .single();

            if (data) {
                entidadeId = data.tenant_id;
            }
        }

        return this.logsService.findAll(entidadeId);
    }
}
