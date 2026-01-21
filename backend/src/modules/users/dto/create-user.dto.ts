import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum UserProfile {
    ADMIN = 'ADMIN',
    COORDENADOR = 'COORDENADOR',
    OPERADOR = 'OPERADOR',
}

export class CreateUserDto {
    @IsUUID()
    @IsNotEmpty()
    id: string; // ID do auth.users do Supabase

    @IsString()
    @IsNotEmpty()
    nome: string;

    @IsEmail()
    email: string;

    @IsEnum(UserProfile)
    @IsOptional()
    perfil?: UserProfile;

    @IsUUID()
    @IsNotEmpty()
    tenant_id: string;
}
