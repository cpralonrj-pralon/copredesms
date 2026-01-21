# Painel de Controle SMS - COP REDE

Sistema para envio e gerenciamento de SMS para coordenação de rede da Claro. O sistema garante o envio de mensagens padronizadas e rápidas para as equipes técnicas regionais.

## Estrutura do Projeto

O projeto é um monorepo contendo:

- **Frontend**: React + TypeScript + Vite (na raiz)
- **Backend**: NestJS (na pasta `backend`)

## Pré-requisitos

- Node.js (v18 ou superior)
- Banco de dados Supabase configurado

## Configuração

### 1. Backend

Navegue até a pasta `backend` e configure as variáveis de ambiente:

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase e configurações de JWT.

Instale as dependências e inicie o servidor:

```bash
npm install
npm run start:dev
```

O backend rodará em `http://localhost:3000`.

### 2. Frontend

Na raiz do projeto, instale as dependências:

```bash
npm install
```

Configure o arquivo `.env` na raiz se necessário (verifique `.env.example`).

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Funcionalidades Principais

- Envio de SMS Padronizado (Incidente, Manutenção, Normalização, etc.)
- Gerenciamento de Usuários e Permissões
- Histórico de Mensagens
- Integração com Supabase para dados e autenticação

## Scripts Importantes

### Frontend
- `npm run dev`: Inicia servidor de desenvolvimento
- `npm run build`: Gera build de produção
- `npm run lint`: Verifica problemas de linting

### Backend
- `npm run start:dev`: Inicia servidor em modo watch
- `npm run build`: Compila o projeto NestJS
