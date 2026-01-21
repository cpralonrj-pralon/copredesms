-- Adiciona a coluna regional na tabela de usuários
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS regional TEXT;

-- (Opcional) Define um regional padrão para o usuário atual para teste imediato
-- Substitua 'RJ-02' pelo regional correto se souber
UPDATE public.users 
SET regional = 'RJ-02' 
WHERE email = 'claudio.pralon@claro.com.br';
