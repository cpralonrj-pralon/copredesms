import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';

type AnyJson = Record<string, any>;

@Injectable()
export class N8nService {
    private readonly logger = new Logger(N8nService.name);

    // Carrega as variáveis do ambiente (definidas no .env do backend)
    private readonly n8nUrl = process.env.N8N_WEBHOOK_URL!;
    private readonly secret = process.env.N8N_HMAC_SECRET!;

    constructor() {
        if (!this.n8nUrl) {
            throw new Error('N8N_WEBHOOK_URL não definido no ambiente');
        }
        if (!this.secret) {
            throw new Error('N8N_HMAC_SECRET não definido no ambiente');
        }
    }

    /** Gera assinatura HMAC-SHA256 do corpo (em string JSON canônica) */
    private makeSignature(body: unknown): string {
        const payload = JSON.stringify(body ?? {});
        return crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
    }

    /** Envia para o n8n com headers X-Secret (segredo) e X-Signature (HMAC do corpo) */
    private async postOnce(body: AnyJson) {
        const signature = this.makeSignature(body);

        const res = await axios.post(this.n8nUrl, body, {
            timeout: 10_000,
            // IMPORTANTE: evite seguir redirecionamentos automáticos para não “esconder” erros 308
            maxRedirects: 0,
            // Aceite 2xx e 3xx (caso você queira capturar 308 e tratar explicitamente)
            validateStatus: (s) => s >= 200 && s < 400,
            headers: {
                'Content-Type': 'application/json',
                // Alternativa B (zero-trust no n8n): segredo trafega via HTTPS, não é salvo no n8n
                'X-Secret': this.secret,
                'X-Signature': signature,
            },
        });

        // Se o proxy devolver 308, a URL está incorreta (http→https, barra final, path base).
        if (res.status === 308) {
            throw new Error(`n8n respondeu 308 (Permanent Redirect). Ajuste N8N_WEBHOOK_URL para a URL final sem redirecionamento.`);
        }

        return res;
    }

    /**
     * Enfileira o disparo no n8n.
     * - `body` deve conter o payload final (ex.: regional, mensagem, tipo, autor, timestamp, protocolo_local etc.)
     * - Retry simples com backoff
     */
    async dispatch(body: AnyJson): Promise<{
        sucesso: boolean;
        data?: any;
        status?: number;
        protocolo?: string | null;
    }> {
        const maxAttempts = 2;
        let lastErr: any = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const res = await this.postOnce(body);
                const data = res.data;

                // Tente padronizar o campo protocolo vindo do workflow
                const protocolo =
                    (data && (data.protocolo || data.protocol || data.id || null)) ?? null;

                return {
                    sucesso: true,
                    data,
                    status: res.status,
                    protocolo,
                };
            } catch (e) {
                lastErr = e as AxiosError | Error;
                const msg =
                    (lastErr as AxiosError)?.response?.data ||
                    (lastErr as Error)?.message ||
                    'Erro desconhecido';

                this.logger.warn(
                    `Falha ao enviar para n8n (tentativa ${attempt}/${maxAttempts}): ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`
                );

                // backoff simples entre tentativas
                if (attempt < maxAttempts) {
                    await new Promise((r) => setTimeout(r, 1000));
                    continue;
                }
            }
        }

        // Se chegou aqui, todas as tentativas falharam
        const message =
            (lastErr as AxiosError)?.response?.data ||
            (lastErr as Error)?.message ||
            'Erro desconhecido no envio ao n8n';

        throw new Error(
            `Dispatch para n8n falhou após ${maxAttempts} tentativas: ${typeof message === 'string' ? message : JSON.stringify(message)
            }`
        );
    }
}
