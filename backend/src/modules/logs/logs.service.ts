import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase.service';
import { CreateLogDto, StatusLog } from './dto/create-log.dto';

@Injectable()
export class LogsService {
    constructor(private supabaseService: SupabaseService) { }

    async create(createLogDto: CreateLogDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('activity_logs')
            .insert([createLogDto])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async createLog(data: any) {
        const { data: log, error } = await this.supabaseService
            .getClient()
            .from('activity_logs')
            .insert(data)
            .select('id')
            .single();

        if (error) {
            throw new Error(`Failed to create log: ${error.message}`);
        }

        return log.id;
    }

    async updateLogStatus(id: string, status: 'SUCCESS' | 'FAILED', protocol?: string, errorMessage?: string) {
        const updateData: any = { status };
        if (protocol) updateData.protocolo = protocol;
        // Se quiser salvar erro, precisaria de uma coluna 'erro' ou 'detalhes' no banco.
        // Por enquanto, apenas status.

        const { error } = await this.supabaseService
            .getClient()
            .from('activity_logs')
            .update(updateData)
            .eq('id', id);

        if (error) {
            // Logar erro interno, mas não falhar a requisição principal se possível
            console.error(`Failed to update log ${id}: ${error.message}`);
        }
    }

    async updateStatus(id: string, status: StatusLog, tenantId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('activity_logs')
            .update({ status })
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findAll(tenantId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('activity_logs')
            .select('*')
            .eq('entidade_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
}
