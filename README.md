# ServLink Hub — Back Office

> **Back office** centralizado para gestão estratégica, execução e publicação de conteúdo da plataforma ServLink — marketplace de mão de obra temporária para o setor de hospitalidade em Florianópolis, SC.

---

## Visão Geral

O ServLink Hub é uma SPA (Single Page Application) que reúne em um único painel:

- Gestão de estratégia de negócio (BMC, proposta de valor, diferencial)
- Execução de sprints (SCRUM board Kanban + lista)
- Pitch narrativo (Pitch Studio)
- Motor de blog e publicação de conteúdo
- Gestão de parceiros
- Integrações com Google Workspace (Calendar, Gmail, Drive, Docs) e GitHub
- Sincronização em tempo real via Supabase

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite |
| Animações | Framer Motion |
| Banco de dados | Supabase (PostgreSQL) |
| Auth | Google Identity Services (GSI) |
| Deploy | Vite build → static hosting |
| Edge Functions | Supabase Edge Functions (Deno) |

---

## Pré-requisitos

- Node.js 18+
- Conta Supabase com tabela `hub_content`
- Google Cloud Project com OAuth 2.0 configurado
- Escopos OAuth: `openid`, `email`, `profile`, `calendar.readonly`, `gmail.send`, `drive`, `documents`

---

## Configuração

```bash
# Instalar dependências
npm install

# Criar arquivo .env com as variáveis necessárias
cp .env.example .env

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Variáveis de Ambiente (`.env`)

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_CLIENT_ID=...
VITE_NOTIFY_EMAIL=...
VITE_GITHUB_PAT=...
```

---

## Estrutura do Projeto

```
servlink/
├── src/
│   ├── App.jsx                        # Componente principal (~2800 linhas)
│   ├── main.jsx                       # Entry point React
│   ├── components/
│   │   ├── EditModeFAB.jsx            # Botão flutuante de edição
│   │   ├── EditableText.jsx           # Texto editável inline
│   │   ├── EditableList.jsx           # Lista editável inline
│   │   └── SyncIndicator.jsx          # Indicador de status de sync
│   ├── contexts/
│   │   ├── GlobalContentContext.jsx   # Estado global + persistência Supabase
│   │   └── LanguageContext.jsx        # i18n PT/EN
│   ├── i18n/
│   │   └── translations.js            # Traduções PT e EN (100+ chaves)
│   └── services/
│       └── api.js                     # Cliente Supabase
├── supabase/
│   └── functions/
│       └── github-sync/
│           └── index.ts               # Edge Function: sync de issues GitHub
├── index.html
├── vite.config.js
└── package.json
```

---

## Navegação do Hub

### Hub Station (Home)
- Dashboard principal com cards de acesso rápido
- Integração Google Calendar: próximos eventos + links Meet
- Integração Gmail: envio de notificações
- Métricas de sprint em andamento
- Botão de login Google unificado (Calendar + Drive + Docs + Gmail)
- Progresso do sprint atual e telemetria

### The Engine (Core)
Sub-seções:
- **Business Model Canvas (BMC)**: Canvas interativo com blocos editáveis
- **Proposta de Valor**: Passos e diferenciais da proposta
- **Diferencial Competitivo**: Posicionamento e documento de diferencial

### Strategy Lab (Growth)
Sub-seções:
- **Branding**: Seletor de temas visuais (4 temas) e tipografias (4 famílias)
- **ROI**: Calculadora e análise de retorno (em desenvolvimento)
- **Blog Engine**: Motor de publicação com editor de texto rico e integração Google Docs
- **Parceiros**: Gestão do ecossistema de parceiros

### Pitch Studio
- Apresentação narrativa em 7 atos
- Player de vídeo integrado ao Google Drive
- Biblioteca de arquivos de apresentação

### Sprints
- Board Kanban: Backlog → To Do → In Progress → Done
- Vista em lista com filtros
- Criação de issues com drag-and-drop no modal
- Subtarefas por issue
- Painel lateral de detalhes do issue
- Sync bidirecional com GitHub Issues
- Filtros: apenas eu, prioridade, assignee, todos

---

## Funcionalidades

### Edit Mode
- Botão flutuante (FAB) no canto inferior direito
- Ativa edição inline de todos os textos e listas
- Detecta alterações pendentes
- Salva no Supabase ou descarta

### Sincronização (Supabase)
- Fetch automático dos dados ao carregar
- Upsert ao salvar
- Indicador de status: synced / saving / offline
- Dados persistidos na tabela `hub_content`

### i18n (PT / EN)
- Toggle de idioma no header (botão PT/EN)
- Persistência no `localStorage` (`sl_lang`)
- 100+ chaves de tradução cobrindo toda a interface

### Temas Visuais
| ID | Nome |
|---|---|
| `dunas` | Dunas de Jurerê |
| `ventosul` | Vento Sul |
| `reserva` | Reserva Natural |
| `sunset` | Sunset Gold |

### Tipografias
| ID | Nome |
|---|---|
| `tecnologica` | A Tecnológica (Geist/Inter) |
| `narrativa` | A Narrativa (SF Pro/Georgia) |
| `contemporanea` | A Contemporânea (Montserrat/Roboto Mono) |
| `classica` | A Clássica de Luxo (Cabinet Grotesk/EB Garamond) |

### Blog Engine
- Cards de posts com título, descrição, tags e data
- Botão de copiar texto para área de transferência
- Editor de texto rico in-app (negrito, itálico, sublinhado, H1/H2, parágrafo, listas)
- Salvar rascunho (persiste em Supabase via `data.blog.posts[i].content`)
- Criar documento no Google Docs via Drive API + Docs API
- Abrir doc existente diretamente no Google Docs
- Escolha: redigir no hub ou redigir no Google Docs

### Sprint Board
- Kanban drag-and-drop visual
- Lista com colunas sortable
- Modal de novo issue arrastável
- Subtarefas com checkbox
- Painel lateral de detalhes
- Sync com GitHub Issues (Edge Function Supabase)

---

## Integrações Externas

| Serviço | Uso |
|---|---|
| **Supabase** | Banco de dados, persistência, edge functions |
| **Google Calendar API** | Leitura de eventos, links Meet |
| **Gmail API** | Envio de e-mails de notificação |
| **Google Drive API v3** | Upload de arquivos, criação de Google Docs, player de vídeo |
| **Google Docs API v1** | Inserção de conteúdo em documentos |
| **GitHub API** | Sync bidirecional de issues |
| **Google Identity Services** | OAuth 2.0 unificado |

---

## Desenvolvimento

```bash
# Dev server com HMR
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

### Edge Function (GitHub Sync)

```bash
# Deploy da edge function
supabase functions deploy github-sync
```

---

## Contexto de Produto

**ServLink** é um marketplace B2B que conecta estabelecimentos de hospitalidade (restaurantes, hotéis, eventos) com trabalhadores freelance verificados para cobrir demandas sazonais e de última hora. O modelo resolve o gap de contratação informal via WhatsApp, oferecendo:

- Estabelecimentos: flexibilidade de custo, cobertura rápida
- Trabalhadores: visibilidade, renda previsível, selo "ServLink Verificado"
- Receita: 15-20% de comissão dos estabelecimentos + SaaS futuro

Localização inicial: Florianópolis, SC — mercado de turismo sazonal.

---

## Licença

Uso interno — ServLink © 2026
