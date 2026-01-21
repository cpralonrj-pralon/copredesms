import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const url = this.configService.get<string>('SUPABASE_URL')!;
        // Tenta pegar a Service Role Key (que atualmente está na var SUPABASE_JWT_SECRET pelo visto no .env)
        // Se usar a chave ANON, o RLS bloqueia o insert de logs.
        const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
            this.configService.get<string>('SUPABASE_JWT_SECRET') ||
            this.configService.get<string>('SUPABASE_ANON_KEY')!;

        console.log(`🔌 Supabase Service usando chave de tamanho: ${key?.length || 0} (Deve ser longa para Service Role)`);

        this.supabase = createClient(url, key, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        });
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }
}
