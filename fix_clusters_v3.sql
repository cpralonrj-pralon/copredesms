-- ==========================================
-- SCRIPT DE PADRONIZAÇÃO FINAL (COM ESPAÇOS)
-- Ajusta para: "RIO DE JANEIRO / ESPIRITO SANTO"
-- ==========================================

-- 1. RIO DE JANEIRO / ESPIRITO SANTO
-- Pega todas as variações (com ou sem espaço, ou antigos RJ-02) e fixa com espaços
UPDATE activity_logs 
SET regional = 'RIO DE JANEIRO / ESPIRITO SANTO' 
WHERE regional ILIKE '%RIO DE JANEIRO%' 
   OR regional ILIKE '%ESPIRITO SANTO%'
   OR regional ILIKE 'RJ-%';

-- 2. BAHIA / SERGIPE
-- Pega variações e fixa com espaços
UPDATE activity_logs 
SET regional = 'BAHIA / SERGIPE' 
WHERE regional ILIKE '%BAHIA%' 
   OR regional ILIKE '%SERGIPE%';

-- 3. MINAS GERAIS (Garante que MG-01 e outros variantes virem oficial)
UPDATE activity_logs 
SET regional = 'MINAS GERAIS' 
WHERE regional ILIKE 'Minas%';

-- 4. OUTROS / NACIONAL
-- Mantemos Nacional para massivos e Outros para SP, pois não estão na lista de 6.
-- Se SP não deve aparecer, o ideal seria deletar ou mover para um dos 6 (mas qual?).
-- Por segurança, mantemos OUTROS.

-- 5. VALIDAÇÃO
-- SELECT DISTINCT regional FROM activity_logs;
