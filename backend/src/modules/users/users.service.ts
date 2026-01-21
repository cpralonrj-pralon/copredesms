import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(private supabaseService: SupabaseService) { }

    async findAll(tenantId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('users')
            .select('*')
            .eq('tenant_id', tenantId);

        if (error) throw error;
        return data;
    }

    async getTenantId(userId: string): Promise<string> {
        const { data, error } = await this.supabaseService.getClient()
            .from('users')
            .select('tenant_id')
            .eq('id', userId)
            .single();

        if (error || !data) {
            throw new Error('Falha ao recuperar ID da Entidade (Profile not found)');
        }
        return data.tenant_id;
    }

    async register(registerUserDto: any, adminTenantId: string) {
        const { email, password, nome, role, regional } = registerUserDto;

        // 1. Create User in Supabase Auth (using Service Role Client)
        const { data: authData, error: authError } = await this.supabaseService.getClient().auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                tenant_id: adminTenantId,
                role,
                entidade_id: adminTenantId // Legacy support
            }
        });

        if (authError) {
            throw new Error(`Auth Creation Failed: ${authError.message}`);
        }

        if (!authData.user) {
            throw new Error('Auth User not created');
        }

        const userId = authData.user.id;

        // 2. Insert into Public Users table
        const { data: publicData, error: publicError } = await this.supabaseService.getClient()
            .from('users')
            .insert([{
                id: userId,
                nome,
                email,
                role,
                regional,
                tenant_id: adminTenantId,
                ativo: true
            }])
            .select()
            .single();

        if (publicError) {
            // Rollback: try to delete the auth user if public insert fails
            await this.supabaseService.getClient().auth.admin.deleteUser(userId);
            throw new Error(`Profile Creation Failed: ${publicError.message}`);
        }

        return publicData;
    }

    async create(createUserDto: CreateUserDto & { entidade_id: string }) {
        // 1. Create User in Supabase Auth (using Admin API via service role)
        // Note: For now, assuming we just create the generic DB record as per request context.
        // If Auth creation is strictly needed, we'd use supabase.auth.admin.createUser().
        // Given SupabaseService usually gives a client, let's assume we insert into public.users first 
        // and let Supabase triggers/Auth handle the rest or manual signup.

        // HOWEVER, "Cadastrar novos usuários através do site" usually implies full creation.
        // Let's check SupabaseService capabilities. If it uses Service Key, we can do admin auth.

        const { data, error } = await this.supabaseService
            .getClient()
            .from('users')
            .insert([{
                ...createUserDto,
                tenant_id: createUserDto.entidade_id, // Map entity to tenant if needed or just use as is
                // Ensure required fields are met
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findOne(id: string, tenantId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('users')
            .select('*')
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .single();

        if (error || !data) throw new NotFoundException('Usuário não encontrado');
        return data;
    }

    async toggleActive(id: string, ativo: boolean, tenantId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('users')
            .update({ ativo })
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
