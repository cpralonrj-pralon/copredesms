import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { decode } from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(private configService: ConfigService) {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const supabaseAnonKey = configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('ERRO CRÍTICO: SUPABASE_URL ou SUPABASE_ANON_KEY faltando no .env!');
        } else {
            console.log(`📡 Configurando JWKS Strategy para: ${supabaseUrl}/auth/v1/jwks`);
        }

        super({
            // Restaurando o extrator com Logs de Debug
            jwtFromRequest: (req) => {
                const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
                if (!token) {
                    console.error('❌ [Debug Auth] Nenhum token encontrado na requisição!');
                } else {
                    console.log(`✅ [Debug Auth] Token recebido! Início: ${token.substring(0, 10)}...`);
                    const decoded = decode(token, { complete: true });
                    if (decoded && typeof decoded === 'object') {
                        console.log(`📜 [Debug Auth] Header Algoritmo: ${decoded.header.alg}`);
                    }
                }
                return token;
            },
            ignoreExpiration: false,
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
                // IMPORTANTE: Enviar a Key pública para poder baixar o JWKS
                requestHeaders: {
                    apikey: supabaseAnonKey || '',
                    Authorization: `Bearer ${supabaseAnonKey || ''}`,
                },
                handleSigningKeyError: (err) => {
                    console.error('⛔ [Debug JWKS] Erro ao buscar chave pública:', err?.message || 'Erro desconhecido');
                    return err;
                }
            }),
            algorithms: ['RS256', 'ES256', 'HS256'],
        });
    }

    async validate(payload: any) {
        this.logger.log(`🔐 Token VÁLIDO! Usuário: ${payload.sub}`);

        const entidadeId = payload.user_metadata?.entidade_id ||
            payload.app_metadata?.entidade_id ||
            payload.entidade_id ||
            payload.user_metadata?.tenant_id;

        return {
            id: payload.sub,
            email: payload.email,
            entidade_id: entidadeId,
            tenant_id: entidadeId, // Ensure compatibility with decorators
            role: payload.user_metadata?.role || payload.role,
        };
    }
}
