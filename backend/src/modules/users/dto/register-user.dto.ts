import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserProfile } from './create-user.dto';

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    nome: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
    password: string;

    @IsEnum(UserProfile)
    role: UserProfile;

    @IsString()
    @IsNotEmpty()
    regional: string;
}
