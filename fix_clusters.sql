-- ==========================================
-- SCRIPT DE CORREÇÃO DE DADOS (CLUSTERS) - V2
-- Baseado no screenshot dos dados sujos
-- ==========================================

-- 1. CASOS ESPECÍFICOS (CLEANUP)

-- "MINAS GERAIS, NORDESTE, BAHIA/SERGIPE..." (Envios Multi-regionais)
UPDATE activity_logs 
SET regional = 'NACIONAL' 
WHERE length(regional) > 50; 

-- "Minas Gerais (MG-01)" -> MINAS GERAIS
UPDATE activity_logs 
SET regional = 'MINAS GERAIS' 
WHERE regional ILIKE 'Minas Gerais%';

-- "RJ-02" e "Rio de Janeiro (RJ-02)" -> RIO DE JANEIRO / ESPIRITO SANTO
UPDATE activity_logs 
SET regional = 'RIO DE JANEIRO / ESPIRITO SANTO' 
WHERE regional ILIKE 'RJ-%' 
   OR regional ILIKE 'Rio de Janeiro%';

-- "Sao Paulo (SP-01)" -> Não está na lista de 6 clusters oficiais.
-- Vou mover para NACIONAL ou OUTROS para não quebrar o gráfico.
UPDATE activity_logs 
SET regional = 'OUTROS' 
WHERE regional ILIKE 'Sao Paulo%';

-- 2. REFORÇO DA PADRONIZAÇÃO (CASOS GERAIS)

-- RIO DE JANEIRO / ESPIRITO SANTO
UPDATE activity_logs 
SET regional = 'RIO DE JANEIRO / ESPIRITO SANTO' 
WHERE regional IN ('RJ', 'ES', 'RIO DE JANEIRO', 'ESPIRITO SANTO');

-- BAHIA / SERGIPE
UPDATE activity_logs 
SET regional = 'BAHIA / SERGIPE' 
WHERE regional IN ('BA', 'SE', 'BAHIA', 'SERGIPE');

-- NORDESTE (O que sobrou que não é BA/SE)
UPDATE activity_logs 
SET regional = 'NORDESTE' 
WHERE regional ILIKE '%NORDESTE%' AND regional <> 'BAHIA / SERGIPE';

-- CENTRO OESTE
UPDATE activity_logs 
SET regional = 'CENTRO OESTE' 
WHERE regional ILIKE '%CENTRO OESTE%';

-- NORTE
UPDATE activity_logs 
SET regional = 'NORTE' 
WHERE regional ILIKE '%NORTE%';

-- 3. CONFIRMAÇÃO
-- Rodar após o update para conferir
-- SELECT regional, count(*) FROM activity_logs GROUP BY regional;
