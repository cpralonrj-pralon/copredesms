-- ==========================================
-- SCRIPT DE CRIAÇÃO DAS VIEWS (DASHBOARD)
-- Projeto: Painel COP REDE
-- ==========================================

-- 1. vw_envios_por_dia
DROP VIEW IF EXISTS vw_envios_por_dia CASCADE;
CREATE OR REPLACE VIEW vw_envios_por_dia AS
SELECT
    to_char(created_at, 'YYYY-MM-DD') as dia,
    COUNT(*) as total
FROM
    activity_logs
WHERE
    canal IN ('SMS', 'WHATSAPP')
GROUP BY
    to_char(created_at, 'YYYY-MM-DD');

-- 2. vw_volume_por_canal
DROP VIEW IF EXISTS vw_volume_por_canal CASCADE;
CREATE OR REPLACE VIEW vw_volume_por_canal AS
SELECT
    canal,
    COUNT(*) as total
FROM
    activity_logs
WHERE
    canal IN ('SMS', 'WHATSAPP')
GROUP BY
    canal;

-- 3. vw_mensagens_por_cluster
DROP VIEW IF EXISTS vw_mensagens_por_cluster CASCADE;
CREATE OR REPLACE VIEW vw_mensagens_por_cluster AS
SELECT
    regional as cluster,
    COUNT(*) as total
FROM
    activity_logs
WHERE
    canal IN ('SMS', 'WHATSAPP')
    AND regional IS NOT NULL
GROUP BY
    regional;

-- 4. vw_taxa_sucesso
DROP VIEW IF EXISTS vw_taxa_sucesso CASCADE;
CREATE OR REPLACE VIEW vw_taxa_sucesso AS
SELECT
    CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE status = 'SUCCESS')::decimal / COUNT(*)::decimal) * 100, 1)
    END as percentual
FROM
    activity_logs
WHERE
    canal IN ('SMS', 'WHATSAPP')
    AND status IN ('SUCCESS', 'FAILED');

-- 5. vw_ranking_usuarios
DROP VIEW IF EXISTS vw_ranking_usuarios CASCADE;
CREATE OR REPLACE VIEW vw_ranking_usuarios AS
SELECT
    u.nome as login,
    COUNT(l.id) as total
FROM
    activity_logs l
    LEFT JOIN users u ON l.user_id = u.id
WHERE
    l.canal IN ('SMS', 'WHATSAPP')
GROUP BY
    u.nome
ORDER BY
    total DESC;

-- 6. vw_sms_por_dia
DROP VIEW IF EXISTS vw_sms_por_dia CASCADE;
CREATE OR REPLACE VIEW vw_sms_por_dia AS
SELECT
    to_char(created_at, 'YYYY-MM-DD') as dia,
    COUNT(*) as total
FROM
    activity_logs
WHERE
    canal = 'SMS'
GROUP BY
    to_char(created_at, 'YYYY-MM-DD');

-- 7. vw_envios_por_hora
DROP VIEW IF EXISTS vw_envios_por_hora CASCADE;
CREATE OR REPLACE VIEW vw_envios_por_hora AS
SELECT
    to_char(created_at, 'HH24:00') as hora,
    COUNT(*) as total
FROM
    activity_logs
WHERE
    created_at >= NOW() - INTERVAL '24 hours'
    AND canal IN ('SMS', 'WHATSAPP')
GROUP BY
    to_char(created_at, 'HH24:00')
ORDER BY
    hora ASC;
