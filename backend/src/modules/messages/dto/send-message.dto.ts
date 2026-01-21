import { IsEnum, IsNotEmpty, IsPhoneNumber, IsString, IsUUID } from 'class-validator';
import { CanalEnvio } from '../../logs/dto/create-log.dto';

export class SendMessageDto {
    @IsEnum(CanalEnvio)
    canal: CanalEnvio;

    @IsString()
    @IsNotEmpty()
    regional: string;

    @IsPhoneNumber('BR')
    telefone: string;

    @IsString()
    @IsNotEmpty()
    mensagem: string;
}
