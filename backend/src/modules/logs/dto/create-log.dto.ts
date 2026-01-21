import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsInt } from 'class-validator';

export enum CanalEnvio {
    WHATSAPP = 'WHATSAPP',
    SMS = 'SMS',
}

export enum StatusLog {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export class CreateLogDto {
    @IsUUID()
    tenant_id: string;

    @IsUUID()
    @IsOptional()
    user_id?: string;

    @IsString()
    @IsNotEmpty()
    action: string;

    @IsEnum(CanalEnvio)
    canal: CanalEnvio;

    @IsString()
    @IsOptional()
    regional?: string;

    @IsString()
    @IsNotEmpty()
    mensagem: string;

    @IsEnum(StatusLog)
    @IsOptional()
    status?: StatusLog;

    @IsInt()
    @IsOptional()
    tentativa?: number;
}
