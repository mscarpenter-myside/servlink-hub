# ServLink Hub — Documentação Técnica

> Registro completo do que foi implementado, decisões técnicas e backlog pendente.

---

## Índice

1. [Histórico de Implementações](#1-histórico-de-implementações)
2. [Arquitetura](#2-arquitetura)
3. [Modelo de Dados](#3-modelo-de-dados)
4. [Integrações Técnicas](#4-integrações-técnicas)
5. [Sistema de i18n](#5-sistema-de-i18n)
6. [Blog Engine](#6-blog-engine)
7. [Sprint Board](#7-sprint-board)
8. [Pendências e Backlog](#8-pendências-e-backlog)

---

## 1. Histórico de Implementações

### v0.1 — Setup Inicial
- Scaffold React 18 + Vite
- Estrutura de navegação principal (Hub Station / The Engine / Strategy Lab / Pitch Studio / Sprints)
- Sistema de temas com 4 opções (Dunas, Vento Sul, Reserva Natural, Sunset Gold)
- Sistema de tipografia com 4 famílias

### v0.2 — Edit Mode
- `GlobalContentContext` com `updateData(path, value)` para atualizações profundas
- Componentes `EditableText` e `EditableList`
- `EditModeFAB`: botão flutuante de ativar/desativar edição
- `hasPendingChanges` com botões de salvar/descartar
- Persistência em `localStorage` (fase pré-Supabase)

### v0.3 — Supabase Integration
- Cliente Supabase em `src/services/api.js`
- `fetchHubData()` na montagem do `GlobalContentProvider`
- `updateHubData()` com upsert na tabela `hub_content`
- `SyncIndicator` com estados: `synced` / `saving` / `offline`
- Edge Function `github-sync` em Deno para sync bidirecional com GitHub Issues

### v0.4 — Google Workspace Integration
- Login unificado via Google Identity Services (GSI)
- Escopos: `openid`, `email`, `profile`, `calendar.readonly`, `gmail.send`, `drive`, `documents`
- **Google Calendar**: busca de eventos, exibição na Home com links Meet
- **Gmail**: envio de e-mails de notificação com token de acesso GSI
- **Google Drive**: player de vídeo embutido na Pitch Studio (preview de arquivos Drive)
- **Google Drive API v3**: criação de Google Docs via `files.create` com `mimeType: application/vnd.google-apps.document`
- **Google Docs API v1**: inserção de conteúdo via `documents/{docId}:batchUpdate` com `insertText`

### v0.5 — Sprint Board
- Kanban board com 4 colunas: Backlog / To Do / In Progress / Done
- Vista em lista com cabeçalhos de coluna
- Modal de novo issue (arrastável/draggable) com campos: título, descrição, status, prioridade, assignee, estimativa, data, subtarefas
- Subtarefas com checkbox interativo
- Painel lateral de detalhes do issue
- Filtros: apenas eu / prioridade / assignee / todos
- Sync com GitHub Issues via Edge Function Supabase

### v0.6 — i18n PT/EN
- `LanguageContext` com `t(key)` e `toggleLang()`
- `translations.js` com 100+ chaves em PT e EN
- Persistência da preferência em `localStorage` (`sl_lang`)
- Botão toggle no header
- Tradução de strings de estado via chaves (ex: `noteStatus` armazena `"note_status_draft"` e renderiza `t(noteStatus)`)
- Mapa `colLabel` para colunas do Kanban (dados em inglês, exibição traduzida)
- Correção de bug: `.map(t => ...)` nas sub-navs shadowing a função `t()`

### v0.7 — Blog Engine + Google Docs
- Cards de posts com título, descrição, tags, data e status
- Ícone de copiar texto em cada card
- Editor de texto rico in-app (fullscreen overlay):
  - Barra de ferramentas: B / I / U / H1 / H2 / ¶ / lista não ordenada / lista ordenada
  - Implementado com `contentEditable` + `document.execCommand`
  - `useRef` para o contentEditable; `useEffect` para inicializar `innerHTML` ao abrir
- Salvar rascunho: persiste HTML em `data.blog.posts[i].content` e título em `data.blog.posts[i].title`
- "Salvar no Docs": extrai `textContent` do editor e envia para Google Docs API
- "Abrir no Docs": abre o doc existente (se `docId` salvo) ou cria novo e abre
- `createDocForPost(post, postIdx, plainText)`: cria doc no Drive + insere texto via Docs API + persiste `docId`
- Estratégia: HTML armazenado internamente; plain text exportado para Docs (Docs API não aceita HTML via `insertText`)

---

## 2. Arquitetura

```
React SPA
├── main.jsx
│   └── LanguageProvider
│       └── GlobalContentProvider
│           └── App.jsx
│               ├── EditModeFAB (fixed)
│               ├── SyncIndicator (header)
│               └── Pages (renderizadas por activePage + activeSub)
│
Supabase
├── hub_content (tabela: id, data jsonb, updated_at)
└── github-sync (edge function: Deno)
│
Google APIs (via GSI token)
├── Calendar API v3
├── Gmail API v1
├── Drive API v3
└── Docs API v1
│
GitHub API v3
└── issues (CRUD bidirecional via edge function)
```

### Fluxo de dados

```
Componente → updateData(path, value) → GlobalContentContext (estado local)
                                     ↓ (ao salvar)
                              Supabase upsert hub_content
                                     ↓ (ao carregar)
                              fetchHubData → merge no estado inicial
```

---

## 3. Modelo de Dados

### Supabase: tabela `hub_content`

```sql
CREATE TABLE hub_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Estrutura do JSONB `data`

```json
{
  "home": {
    "heroTitle": "string",
    "heroDesc": "string",
    "cards": [{ "icon": "string", "title": "string", "desc": "string" }],
    "milestone": "string"
  },
  "bmc": {
    "title": "string",
    "subtitle": "string",
    "cards": [{ "id": "string", "title": "string", "items": ["string"] }]
  },
  "proposta": {
    "title": "string",
    "subtitle": "string",
    "desc": "string",
    "steps": [{ "n": "string", "title": "string", "desc": "string" }]
  },
  "diferencial": {
    "title": "string",
    "subtitle": "string",
    "docTitle": "string",
    "docText": "string"
  },
  "pitch": {
    "title": "string",
    "subtitle": "string",
    "acts": [{ "n": "string", "title": "string", "desc": "string", "note": "string" }]
  },
  "scrum": {
    "sprintTitle": "string",
    "members": ["string"],
    "tasks": [{
      "id": "string",
      "title": "string",
      "desc": "string",
      "status": "Backlog|To Do|In Progress|Done",
      "priority": "High|Medium|Low",
      "assignee": "string",
      "estimate": "number",
      "dueDate": "string",
      "subtasks": [{ "id": "string", "text": "string", "done": "boolean" }],
      "githubNumber": "number"
    }]
  },
  "blog": {
    "title": "string",
    "subtitle": "string",
    "posts": [{
      "id": "string",
      "title": "string",
      "desc": "string",
      "content": "string (HTML)",
      "tags": ["string"],
      "date": "string",
      "status": "draft|published",
      "docId": "string (Google Doc ID)"
    }]
  },
  "partners": {
    "title": "string",
    "subtitle": "string",
    "list": [{ "name": "string", "desc": "string", "url": "string" }]
  },
  "branding": {
    "theme": "dunas|ventosul|reserva|sunset",
    "typography": "tecnologica|narrativa|contemporanea|classica"
  }
}
```

### Pendência: Schema para Mídias

> Ver [Seção 8 — Pendências](#8-pendências-e-backlog) — item "Inclusão de Mídias/Tabela"

---

## 4. Integrações Técnicas

### Google Identity Services (GSI)

```javascript
// Inicialização (index.html ou script inline)
google.accounts.oauth2.initTokenClient({
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  scope: [
    "openid", "email", "profile",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents"
  ].join(" "),
  callback: (response) => { /* salva accessToken */ }
});
```

**Problema conhecido:** O token GSI é de sessão e expira/é perdido a cada reload da página (ver Pendências).

### Google Calendar API v3

```
GET https://www.googleapis.com/calendar/v3/calendars/primary/events
  ?maxResults=10
  &orderBy=startTime
  &singleEvents=true
  &timeMin={now}
```

### Gmail API v1

```
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
Body: { raw: btoa(email headers + body) }
```

### Google Drive API v3 — Criar Google Doc

```
POST https://www.googleapis.com/drive/v3/files
Body: {
  name: "Título do Post",
  mimeType: "application/vnd.google-apps.document"
}
```

### Google Docs API v1 — Inserir conteúdo

```
POST https://docs.googleapis.com/v1/documents/{docId}:batchUpdate
Body: {
  requests: [{
    insertText: {
      location: { index: 1 },
      text: "plain text content"
    }
  }]
}
```

**Limitação:** A Docs API aceita apenas plain text via `insertText`. HTML não é suportado neste endpoint. O HTML é armazenado internamente no Supabase; para exportar ao Docs, usa-se `textContent`.

### GitHub Sync (Edge Function)

```typescript
// supabase/functions/github-sync/index.ts
// Endpoint: POST /github-sync
// Payload: { action: "push" | "pull", tasks: [...] }
// - push: cria/atualiza issues no GitHub
// - pull: busca issues do GitHub e retorna para sincronizar com tasks
```

---

## 5. Sistema de i18n

### Arquivos

- `src/i18n/translations.js` — objeto com chaves `pt` e `en`
- `src/contexts/LanguageContext.jsx` — Provider com `lang`, `setLang`, `toggleLang`, `t(key)`

### Padrão de uso

```jsx
const { t, lang, toggleLang } = useLanguage();

// Strings simples
<button>{t("btn_create_issue")}</button>

// Strings de estado (armazena chave, renderiza traduzida)
const [noteStatus, setNoteStatus] = useState("note_status_draft");
setNoteStatus("note_status_saving"); // armazena chave
<span>{t(noteStatus)}</span>         // renderiza traduzido

// Mapa de display para dados com valores fixos
const colLabel = {
  "Backlog": t("col_backlog"),
  "To Do": t("col_todo"),
  "In Progress": t("col_inprogress"),
  "Done": t("col_done")
};
```

### Grupos de chaves

| Grupo | Prefixo | Exemplos |
|---|---|---|
| Navegação | `nav_` | `nav_home`, `nav_core`, `nav_sprints` |
| Calendário | `cal_` | `cal_no_events`, `cal_meet_link` |
| Gmail | `gmail_` | `gmail_label`, `gmail_connecting` |
| Edição | `edit_` | `edit_activate`, `edit_revert`, `edit_publish` |
| Sync | `sync_` | `sync_synced`, `sync_saving`, `sync_offline` |
| Sprint | `col_`, `filter_`, `list_` | `col_backlog`, `filter_priority` |
| Modal | `modal_`, `field_`, `btn_` | `modal_new_issue`, `field_priority` |
| Painel | `panel_` | `panel_subtasks`, `panel_add_btn` |
| Blog | `blog_`, `library_`, `upload_` | `library_empty`, `upload_sending` |
| Status nota | `note_status_` | `note_status_draft`, `note_status_saved` |
| Sign-in | `sign_in_` | `sign_in_google` |
| Rodapé | `footer_` | `footer_hint` |

---

## 6. Blog Engine

### Fluxo completo

```
renderGrowthBlog()
  └── Para cada post:
      ├── Card com: título, desc, tags, data, status badge
      ├── [Ícone copiar] → copyPostText(post, postIdx)
      ├── [Escrever / Editar] → setBlogEditorIdx(i)
      └── Footer Docs:
          ├── [Abrir no Docs] → window.open(doc URL) se docId existir
          └── [Salvar no Docs] → pushToDocsAndOpen(post, postIdx)

renderBlogEditor(post, postIdx)  ← fullscreen overlay quando blogEditorIdx === i
  ├── Barra chrome:
  │   ├── [← Blog] → setBlogEditorIdx(null)
  │   ├── Toolbar: B/I/U/H1/H2/¶/ul/ol via document.execCommand
  │   ├── Status: editorSaveStatus
  │   ├── [Copiar] → copyPostText
  │   ├── [Salvar rascunho] → saveEditorContent(postIdx)
  │   └── [Salvar no Docs / Abrir no Docs] → pushToDocsAndOpen
  └── Área do documento:
      ├── <input> título → editorTitle state
      └── <div contentEditable> corpo → editorContentRef
```

### Funções principais

| Função | Descrição |
|---|---|
| `createDocForPost(post, idx, text)` | Cria Google Doc via Drive API, insere texto via Docs API, persiste `docId` |
| `copyPostText(post, idx)` | Copia texto do editor (se aberto) ou do post |
| `saveEditorContent(idx)` | Salva HTML e título no Supabase |
| `pushToDocsAndOpen(post, idx)` | Extrai plain text, cria/abre doc no Google Docs |

---

## 7. Sprint Board

### Estrutura de dados de task

```javascript
{
  id: "SL-001",
  title: "string",
  desc: "string",
  status: "Backlog" | "To Do" | "In Progress" | "Done",
  priority: "High" | "Medium" | "Low",
  assignee: "string",
  estimate: number,   // story points
  dueDate: "YYYY-MM-DD",
  subtasks: [{ id, text, done }],
  githubNumber: number  // Issue number no GitHub (opcional)
}
```

### Views disponíveis

| View | Componente lógico |
|---|---|
| Board (Kanban) | `renderSprintsBoard()` com `viewMode === "board"` |
| List | `renderSprintsBoard()` com `viewMode === "list"` |

### Filtros

- `filterMode: "all" | "mine" | "priority" | "assignee"`
- `filterAssignee`: string para filtrar por assignee específico

---

## 8. Pendências e Backlog

### 🔴 Alta Prioridade

#### [AUTH-01] Persistência do Login Google entre Reloads
**Problema:** O token GSI (Google Identity Services) é perdido a cada refresh da página. O usuário precisa fazer login novamente toda vez.

**Causa:** `google.accounts.oauth2.initTokenClient` retorna um token de acesso de curta duração (1h) que não é persistido. Não há refresh token disponível no fluxo implícito.

**Solução proposta:**
- Migrar para fluxo de autorização com `code` (Authorization Code Flow com PKCE)
- Usar backend (Supabase Edge Function) para trocar o code por tokens e armazenar refresh token
- Ou: salvar o token no `sessionStorage`/`localStorage` e verificar validade antes de cada chamada API, solicitando novo token silenciosamente se expirado
- Alternativa rápida: `google.accounts.oauth2.initTokenClient` com `prompt: ""` para tentar silent re-auth

---

#### [I18N-01] Revisão de Termos e Linguagem do Hub
**Situação:** A infraestrutura i18n está completa (PT/EN), mas os termos e a linguagem precisam ser revisados para refletir corretamente a identidade e nomenclatura do produto.

**Arquivo a revisar:** `src/i18n/translations.js`

**Escopo:** Revisar especialmente os labels de navegação, termos do sprint board, e textos de UI para melhor alinhamento com o vocabulário interno da equipe.

---

### 🟡 Médio Prazo

#### [BLOG-02] Gerador HTML para Textos
**Descrição:** Geração de arquivo HTML standalone a partir do conteúdo do editor in-app. O HTML gerado deve ser auto-contido (CSS inline ou embedded) para distribuição e preview fora do hub.

**Escopo técnico:**
- Botão "Exportar HTML" no editor
- Template HTML com estilos de tipografia e cores do tema atual
- `Blob` + `URL.createObjectURL` para download do arquivo `.html`
- Preview em nova aba via `data:text/html,...`

---

#### [BLOG-03] Publicação WordPress
**Descrição:** Integração com WordPress REST API para publicar posts diretamente do Blog Engine para um site WordPress.

**Escopo técnico:**
- Campo para URL da instalação WordPress + Application Password
- `POST /wp-json/wp/v2/posts` com título, conteúdo, status, categorias
- Converter HTML do editor para formato aceito pelo WordPress
- Feedback de status de publicação no card do post

---

#### [MEDIA-01] Schema de Banco de Dados para Mídias
**Descrição:** Criação de tabela dedicada no Supabase para gestão de ativos de mídia (textos, vídeos, imagens, documentos), separada do JSONB `hub_content`.

**Schema proposto:**

```sql
CREATE TABLE hub_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('video', 'text', 'image', 'document')),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,                    -- URL do arquivo (Drive, S3, etc.)
  drive_file_id TEXT,          -- Google Drive file ID
  doc_id TEXT,                 -- Google Docs ID (para textos)
  mime_type TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  section TEXT,                -- 'pitch', 'blog', 'branding', etc.
  metadata JSONB DEFAULT '{}', -- dados extras: duração, tamanho, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hub_media_type ON hub_media(type);
CREATE INDEX idx_hub_media_section ON hub_media(section);
```

---

### 🟢 Longo Prazo / Novas Seções

#### [DATA-01] SERP Analyzer & Keyword Tracking
**Issue ID:** SL-DATA-01

**Descrição:** Módulo de análise de SERP (Search Engine Results Page) e rastreamento de palavras-chave para monitorar posicionamento orgânico do ServLink e concorrentes.

**Funcionalidades planejadas:**
- Integração com API de SERP (SerpAPI, DataForSEO, ou similar)
- Dashboard de posicionamento por keyword
- Histórico de ranking com gráficos de tendência
- Alertas de variação de posição
- Mapeamento de keywords por intenção (informacional, transacional, navegacional)
- Análise de concorrentes por SERP

**Seção no hub:** Data Intelligence > SERP

---

#### [DATA-02] Content Crawler & Hospitality Mapper
**Issue ID:** SL-DATA-02

**Descrição:** Crawler de conteúdo para mapeamento do ecossistema de hospitalidade em Florianópolis — estabelecimentos, eventos, sazonalidade, perfil de demanda de mão de obra.

**Funcionalidades planejadas:**
- Crawler de sites de eventos e estabelecimentos (Floripa, região)
- Extração de dados: tipo de estabelecimento, capacidade, localização, sazonalidade
- Mapa visual georreferenciado dos estabelecimentos
- Estimativa de demanda por período/bairro
- Pipeline de atualização periódica (Supabase Edge Function + cron)
- Dashboard de densidade de oportunidades

**Seção no hub:** Data Intelligence > Hospitality Map

---

#### [DATA-03] Market Census & Socio-Economic Engine
**Issue ID:** SL-DATA-03

**Descrição:** Motor de censo de mercado com dados socioeconômicos para embasar decisões estratégicas — público-alvo, capacidade de pagamento, mercado endereçável.

**Funcionalidades planejadas:**
- Integração com dados públicos (IBGE, RAIS, CAGED)
- Análise de mercado endereçável (TAM/SAM/SOM) automatizada
- Segmentação de trabalhadores por renda, localização, setor
- Relatórios de tamanho de mercado por categoria (garçom, recepcionista, etc.)
- Exportação de relatórios em PDF e Google Docs
- Atualização periódica de indicadores macroeconômicos

**Seção no hub:** Data Intelligence > Market Census

---

#### [KNOW-01] Gestão de Conhecimento
**Descrição:** Nova seção do hub dedicada à gestão e organização do conhecimento interno da equipe ServLink.

**Funcionalidades planejadas:**
- Base de conhecimento estruturada (wiki interno)
- Artigos com editor rich text (reuso do Blog Engine editor)
- Categorização por áreas: Produto, Técnico, Comercial, Operacional
- Busca full-text por conteúdo
- Links cruzados entre artigos
- Histórico de versões (via Supabase)
- Integração com GitBook (link direto para a documentação técnica)

**Seção no hub:** Knowledge Base

---

#### [WRITE-01] Language Tool Clone — Assistente de Escrita
**Descrição:** Integração de assistente de escrita similar ao LanguageTool para melhorar a qualidade dos textos produzidos no Blog Engine e na Gestão de Conhecimento.

**Funcionalidades planejadas:**
- Verificação gramatical e ortográfica em PT-BR
- Sugestões de estilo e clareza
- Verificação de consistência de terminologia (glossário ServLink)
- Integração inline no editor (sublinhado + tooltip com sugestão)
- Opção: integrar com API do LanguageTool ou clonar modelo local
- Suporte a PT-BR como idioma primário, EN como secundário

**Implementação técnica:**
- Opção A: `POST https://api.languagetool.org/v2/check` (API pública, limite de requests)
- Opção B: Self-hosted LanguageTool via Docker + chamada interna
- Opção C: Integração com Claude API para sugestões contextuais de escrita

---

#### [HUB-01] Revisão de Nomenclatura e Escrita do Hub
**Descrição:** Revisão completa dos textos, labels e nomenclatura do backoffice para alinhamento com a identidade e vocabulário da marca ServLink.

**Escopo:**
- Labels de navegação (Hub Station, The Engine, Strategy Lab, Pitch Studio, Sprints)
- Terminologia do Sprint Board
- Textos dos cards de acesso rápido na Home
- Labels do BMC
- Mensagens de feedback (sync, save, error)
- Strings do `translations.js` (PT e EN)

**Pré-requisito:** Definição do glossário oficial ServLink com a equipe.

---

## Histórico de Commits

| Hash | Descrição | Data |
|---|---|---|
| `276ab11` | feat: i18n infrastructure + full PT/EN translation pass | 2026-03-23 |
| `9baa87d` | feat: integrate Supabase via MCP for real-time data synchronization | 2026-03-23 |
| `4e256d2` | feat: implement brand guidelines and color palettes in GlobalContentContext | 2026-03-23 |
| `edc61f6` | feat: add edit mode | 2026-03-23 |
| `421aaff` | feat: initial project setup with React and Vite | 2026-03-23 |

---

*Documentação atualizada em: 2026-03-23*
*Repositório: https://github.com/mscarpenter/servlink-hub.git*
