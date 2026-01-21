-- ======================================================
-- ESQUEMA SQL - PAINEL SMS COP REDE
-- ======================================================

-- 1. Enums para padronização
CREATE TYPE public.perfil_usuario AS ENUM ('ADMIN', 'COORDENADOR', 'OPERADOR');
CREATE TYPE public.canal_envio AS ENUM ('WHATSAPP', 'SMS');
CREATE TYPE public.status_log AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- 2. Tabela de Usuários (Extensão do schema auth do Supabase)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  perfil public.perfil_usuario DEFAULT 'OPERADOR'::public.perfil_usuario,
  entidade_id UUID NOT NULL,
  regional TEXT, -- Ex: 'SP-01', 'RJ-02'
  requires_pw_change BOOLEAN DEFAULT true, -- Força troca no primeiro login
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Logs de Atividade / Mensagens
CREATE TABLE public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entidade_id UUID NOT NULL,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL, -- Ex: 'ENVIO', 'RETRY'
  canal public.canal_envio NOT NULL,
  regional TEXT,
  mensagem TEXT NOT NULL,
  protocolo TEXT, -- Protocolo retornado pelo n8n
  status public.status_log DEFAULT 'PENDING'::public.status_log,
  tentativa INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de RLS
-- Nota: Estas políticas assumem que o tenant_id está presente no JWT do usuário.
-- O administrador do Supabase deve configurar o custom claim ou usar uma tabela de mapeamento.

CREATE POLICY "Acesso por entidade_id" ON public.users
FOR ALL USING (entidade_id = (auth.jwt() ->> 'entidade_id')::uuid);

CREATE POLICY "Logs por entidade_id" ON public.activity_logs
FOR ALL USING (entidade_id = (auth.jwt() ->> 'entidade_id')::uuid);

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_logs
BEFORE UPDATE ON public.activity_logs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
