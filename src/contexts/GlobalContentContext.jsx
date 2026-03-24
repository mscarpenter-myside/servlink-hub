import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchHubData, updateHubData } from "../services/api";

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultData = {
  home: {
    heroTitle: "Bem-vindo ao ServLink Hub.",
    heroDesc: "Este é o ecossistema central de desenvolvimento do projeto de ADS, onde a estratégia de negócio (B2B Staffing) e a execução técnica se encontram. Maneje a planta matriz do app, acompanhe o crescimento analítico ou direcione a arquitetura técnica.",
    cards: [
      { id: "core_bmc", title: "Business Model Canvas", desc: "A engrenagem do blueprint estratégico e as regras de negócio em alto nível." },
      { id: "core_proposta", title: "Proposta de Valor", desc: "Onde a dor estrutural de Jurerê encontra a resiliência escalável do nosso app." },
      { id: "core_diferencial", title: "Diferencial Competitivo", desc: "O que nos torna uma proposta absurdamente única perante o cenário catarinense." },
      { id: "sprints_board", title: "SCRUM Board", desc: "Gestão executiva linear e coordenação ágil das nossas Sprints de engenharia." },
      { id: "growth_partners", title: "Marketing & Parcerias", desc: "Nossa estratégia B2B de invasão descentralizada e integração com sindicatos." },
      { id: "tech_archi", title: "Stack Técnica", desc: "Arquitetura base do projeto: frontend, backend, cloud e integrações." }
    ],
    milestone: { title: "Próxima Milestone", event: "Status Report ADS", time: "Segunda-feira 20h00" }
  },
  bmc: {
    title: "Business Model Canvas",
    subtitle: "Mapeamento estrutural do ecossistema b2b2c.",
    cards: [
      { id: "partners", type: "infra", title: "Key Partners", col: "1/3", row: "1/3", items: [{id:"p1",text: "SHRBS (Sindicato Hoteleiro)"}, {id:"p2",text: "Gateways de Pagamento"}, {id:"p3",text: "SEBRAE / SENAC"}] },
      { id: "activities", type: "infra", title: "Key Activities", col: "3/5", row: "1/2", items: [{id:"a1",text: "Onboarding & Curadoria"}, {id:"a2",text: "Motor de Pagamento"}] },
      { id: "resources", type: "infra", title: "Key Resources", col: "3/5", row: "2/3", items: [{id:"r1",text: "API Laravel + Next.js"}, {id:"r2",text: "Base Validada"}] },
      { id: "vp", type: "core", title: "Value Proposition", col: "5/7", row: "1/3", items: [{id: "vp_agile", text: "Agilidade (Match 60s)"}, {id:"v2",text: "Custo Fixo → Variável"}, {id:"v3",text: "Selo ServLink Verificado"}] },
      { id: "relations", type: "market", title: "Customer Relationships", col: "7/9", row: "1/2", items: [{id:"rl1",text: "Self-Service Assistido"}, {id:"rl2",text: "Comunidade Hiperlocal"}] },
      { id: "channels", type: "market", title: "Channels", col: "7/9", row: "2/3", items: [{id:"c1",text: "Web App Mobile-First"}, {id:"c2",text: "Marketing Integrado"}] },
      { id: "segments", type: "market", title: "Customer Segments", col: "9/11", row: "1/3", items: [{id: "seg_b2b", text: "Estabelecimentos B2B"}, {id:"s2",text: "Profissionais A & B"}] },
    ]
  },
  proposta: {
    title: "The Fricton Map",
    subtitle: "A dor real da sazonalidade em Florianópolis.",
    desc: "A informalidade dita as regras do turnover na alta estação. Enquanto a demanda escala exponencialmente de Dezembro a Março, a estrutura fixa de hospitalidade não suporta. O gatilho de dor não é apenas o No-Show, é a perda imediata da margem premium.",
    steps: [
      { id: "step1", time: "18:00", event: "Casa Lotada", desc: "100% de ocupação esperada no Réveillon em Jurerê Internacional.", status: "normal" },
      { id: "jurere", time: "18:45", event: "O Choque", desc: "Chef descobre que 2 garçons e 1 auxiliar não apareceram. Nenhum aviso prévio.", status: "critical" },
      { id: "step3", time: "19:00", event: "Caos Oculto", desc: "Grupos de WhatsApp frenéticos. 'Alguém tem indicação livre?'. Ninguém responde.", status: "warning" },
      { id: "step4", time: "20:30", event: "Impacto Visível", desc: "Gargalo no salão. Pratos atrasam 45min. Clientes premium insatisfeitos e reviews negativos.", status: "critical" },
      { id: "step5", time: "01:00", event: "Fechamento", desc: "Receita sub-otimizada em 25% na noite mais importante devido ao gargalo operacional.", status: "loss" },
    ]
  },
  diferencial: {
    title: "Diferencial Competitivo",
    subtitle: "A essência do fosso institucional B2B.",
    docTitle: "Ideias",
    docText: "Digite aqui"
  },
  pitch: {
    title: "Pitch Studio",
    subtitle: "Script master.",
    acts: [
      { id: "act1", act: "01", title: "O Gancho", text: "Imagine o restaurante mais caro da ilha. Hoje é Réveillon. 2 garçons faltaram." },
      { id: "act2", act: "02", title: "A Fricção", text: "Grupos de WhatsApp não resolvem o hiato de Confiança. É roleta russa operacional." },
      { id: "act3", act: "03", title: "A Magia", text: "ServLink notifica a rede local. Profissionais verificados aplicam. Match em 60s." },
      { id: "act4", act: "04", title: "Tração", text: "2.700 CNPJs ativos só no epicentro de Floripa. Custo fixo vira variável." }
    ]
  },
  scrum: {
    sprintTitle: "Sprint 01: Modelagem",
    members: [
      { initials: "MC", name: "Mateus Carpenter", email: "mateus@servlink.io" },
      { initials: "EQ", name: "Equipe Técnica", email: "tech@servlink.io" }
    ],
    tasks: [
      {
        id: "SL-01", title: "Refinar Proposta de Valor no BMC",
        desc: "Ajustar o texto do Business Model Canvas para focar na métrica de 60s de match. Revisar o bloco Value Proposition e alinhar com o storytelling do Réveillon de Jurerê.",
        status: "Done", priority: "High", points: 3, sprint: "Sprint 01", assignees: ["MC"], deadline: "2026-03-21",
        subtasks: [
          { id: "s1", text: "Revisar bloco Value Proposition", done: true },
          { id: "s2", text: "Alinhar métricas com ROI Calculator", done: true },
          { id: "s3", text: "Validar com stakeholders", done: true }
        ]
      },
      {
        id: "SL-02", title: "Estruturar Storytelling Jurerê",
        desc: "Montar narrativa do Réveillon e impacto do No-Show. Criar o arco dramático completo para uso em pitch e materiais de marketing da ServLink.",
        status: "In Progress", priority: "Medium", points: 5, sprint: "Sprint 01", assignees: ["MC"], deadline: "2026-03-23",
        subtasks: [
          { id: "s1", text: "Mapear timeline do evento Réveillon", done: true },
          { id: "s2", text: "Calcular impacto financeiro do No-Show", done: false },
          { id: "s3", text: "Redigir narrativa para pitch deck", done: false },
          { id: "s4", text: "Validar com chef parceiro Jurerê", done: false }
        ]
      },
      {
        id: "SL-03", title: "Arquitetura Next.js/Laravel",
        desc: "Criar o arquivo boilerplate YAML com a stack completa. Configurar CI/CD básico com GitHub Actions. Definir estrutura de pastas e padrões de código para o MVP.",
        status: "Backlog", priority: "Low", points: 8, sprint: "Sprint 01", assignees: ["EQ"], deadline: "2026-03-28",
        subtasks: [
          { id: "s1", text: "Configurar repositório Next.js 14 App Router", done: false },
          { id: "s2", text: "Setup Laravel 11 API base + Sanctum", done: false },
          { id: "s3", text: "CI/CD pipeline com GitHub Actions", done: false },
          { id: "s4", text: "Docker Compose para dev environment", done: false },
          { id: "s5", text: "README e documentação inicial", done: false }
        ]
      },
      {
        id: "SL-04", title: "Branding & Identidade Visual ServLink",
        desc: "Desenvolver a identidade visual completa da marca ServLink. Definir paleta Sand White & Slate Gray, tipografia, logotipo e brandbook. Base para todos os materiais digitais e físicos do MVP.",
        status: "To Do", priority: "High", points: 5, sprint: "Sprint 01", assignees: ["MC"], deadline: "2026-03-30",
        subtasks: [
          { id: "s1", text: "Pesquisa de referências e moodboard", done: false },
          { id: "s2", text: "Criar 3 conceitos de logotipo", done: false },
          { id: "s3", text: "Definir paleta de cores e tipografia", done: false },
          { id: "s4", text: "Criar brandbook PDF completo", done: false }
        ]
      },
      {
        id: "SL-05", title: "Refinar Business Model Canvas",
        desc: "Atualizar o BMC com os aprendizados das últimas reuniões com SHRBS. Revisar Customer Segments, Revenue Streams e Cost Structure à luz dos feedbacks recebidos no último Sprint Review.",
        status: "To Do", priority: "Medium", points: 3, sprint: "Sprint 01", assignees: ["MC"], deadline: "2026-03-27",
        subtasks: [
          { id: "s1", text: "Revisar Customer Segments B2B e B2C", done: false },
          { id: "s2", text: "Atualizar Revenue Streams com Stripe Connect", done: false },
          { id: "s3", text: "Incorporar feedback reunião SHRBS", done: false }
        ]
      }
    ]
  },
  blog: {
    title: "Technical Papers",
    subtitle: "Conteúdo estratégico sobre a economia gig em Florianópolis.",
    posts: [
      { id: "pt1", tag: "MERCADO", title: "O Custo Invisível do No-Show", date: "Q3 2026", desc: "Análise quantitativa do impacto de faltas na margem de lucro de 2.700 estabelecimentos." },
      { id: "pt2", tag: "PRODUTO", title: "O Match de 60 Segundos", date: "Q4 2026", desc: "Como a arquitetura de eventos distribui oportunidades na rede ServLink." },
      { id: "pt3", tag: "PARCERIAS", title: "Integração SHRBS", date: "Draft", desc: "Validação institucional e seus efeitos em redes hiperlocais." },
      { id: "pt4", tag: "VISÃO", title: "Artesãos do Serviço", date: "Draft", desc: "Mobilidade social e o sistema de reputação bilateral." }
    ]
  },
  partners: {
    title: "Validation Ecosystem",
    subtitle: "Integrações B2B e parceiros institucionais.",
    list: [
      { id: "prt1", name: "SHRBS", status: "Strategic" },
      { id: "prt2", name: "SENAC", status: "Technical" },
      { id: "prt3", name: "SEBRAE", status: "Business" },
      { id: "prt4", name: "Stripe", status: "Infra" },
      { id: "prt5", name: "Vercel", status: "Infra" },
      { id: "prt6", name: "AWS", status: "Infra" }
    ]
  },
  branding: {
    theme: "dunas",
    typography: "tecnologica"
  }
};

const GlobalContentContext = createContext();

export const useGlobalContent = () => useContext(GlobalContentContext);

export const GlobalContentProvider = ({ children }) => {
  const [data, setData] = useState(defaultData);
  const [syncStatus, setSyncStatus] = useState('synced');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setSyncStatus('saving');
      const fetched = await fetchHubData();
      if (mounted && fetched) {
        if (fetched.home && fetched.home.cards) {
          const defaultOrderIds = defaultData.home.cards.map(c => c.id);
          fetched.home.cards.sort((a, b) => defaultOrderIds.indexOf(a.id) - defaultOrderIds.indexOf(b.id));
        }
        setData({ ...defaultData, ...fetched });
        setOriginalData({ ...defaultData, ...fetched });
      }
      if (mounted) setSyncStatus('synced');
    };
    load();
    return () => mounted = false;
  }, []);

  const [isEditMode, setIsEditMode] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [originalData, setOriginalData] = useState(defaultData);

  // Sync back to backend whenever user clicks save
  const saveChanges = async () => {
    setSyncStatus('saving');
    const res = await updateHubData(data);
    if (res.success) {
      setOriginalData(data);
      setHasPendingChanges(false);
      setSyncStatus('synced');
    } else {
      setSyncStatus('offline');
    }
  };

  const discardChanges = () => {
    setData(originalData);
    setHasPendingChanges(false);
  };

  // Helper to dynamically update deep nested state
  // path: string (e.g., 'home.heroTitle')
  const updateData = (path, value) => {
    setData((prev) => {
      const keys = path.split('.');
      const newState = JSON.parse(JSON.stringify(prev)); // Deep clone
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
    setHasPendingChanges(true);
  };

  return (
    <GlobalContentContext.Provider value={{
      data,
      syncStatus,
      setData,
      updateData,
      isEditMode,
      setIsEditMode,
      hasPendingChanges,
      saveChanges,
      discardChanges,
      generateId
    }}>
      {children}
    </GlobalContentContext.Provider>
  );
};
