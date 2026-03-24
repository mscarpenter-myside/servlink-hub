import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContent } from "./contexts/GlobalContentContext";
import { useLanguage } from "./contexts/LanguageContext";
import { EditableText } from "./components/EditableText";
import { EditableList } from "./components/EditableList";
import { EditModeFAB } from "./components/EditModeFAB";
import { SyncIndicator } from "./components/SyncIndicator";
import { supabase } from "./services/api";

const THEMES = {
  dunas: {
    name: "Dunas de Jurerê",
    colors: { bg: "#F9F9F8", bgAlt: "#F1F1F0", surface: "rgba(255, 255, 255, 0.7)", surfaceSolid: "#FFFFFF", border: "rgba(226, 232, 240, 0.4)", text: "#000000", textMuted: "#666666", textDim: "#A3A3A3", accent: "#171717", highlight: "#0066FF", slate: "#0F172A" }
  },
  ventosul: {
    name: "Vento Sul",
    colors: { bg: "#FFFFFF", bgAlt: "#FAFAFA", surface: "rgba(255, 255, 255, 0.8)", surfaceSolid: "#FFFFFF", border: "rgba(0, 0, 0, 0.1)", text: "#111111", textMuted: "#888888", textDim: "#BBBBBB", accent: "#000000", highlight: "#0051FF", slate: "#1A1A1A" }
  },
  reserva: {
    name: "Reserva Natural",
    colors: { bg: "#F4F7F6", bgAlt: "#ECF1EF", surface: "rgba(255, 255, 255, 0.6)", surfaceSolid: "#FFFFFF", border: "rgba(180, 200, 190, 0.3)", text: "#0D2B1D", textMuted: "#4A6B5D", textDim: "#8DAA9D", accent: "#0A2016", highlight: "#10B981", slate: "#163D2B" }
  },
  sunset: {
    name: "Sunset Gold",
    colors: { bg: "#FAFAF9", bgAlt: "#F5F5F4", surface: "rgba(255, 255, 255, 0.7)", surfaceSolid: "#FFFFFF", border: "rgba(214, 211, 209, 0.4)", text: "#1C1917", textMuted: "#78716C", textDim: "#A8A29E", accent: "#0C0A09", highlight: "#D97706", slate: "#292524" }
  }
};

const TYPOGRAPHIES = {
  tecnologica: { name: "A Tecnológica", primary: '"Geist", "Inter", sans-serif', secondary: '"Geist Mono", "JetBrains Mono", monospace' },
  narrativa: { name: "A Narrativa", primary: '"SF Pro Display", "-apple-system", sans-serif', secondary: '"New York", "Georgia", serif' },
  contemporanea: { name: "A Contemporânea", primary: '"Montserrat", sans-serif', secondary: '"Roboto Mono", monospace' },
  classica: { name: "A Clássica de Luxo", primary: '"Cabinet Grotesk", sans-serif', secondary: '"EB Garamond", serif' }
};

const COLORS = {
  bg: "#F9F9F8",
  bgAlt: "#F1F1F0",
  surface: "rgba(255, 255, 255, 0.7)",
  surfaceSolid: "#FFFFFF",
  border: "rgba(226, 232, 240, 0.4)",
  text: "#000000",
  textMuted: "#666666",
  textDim: "#A3A3A3",
  accent: "#171717",
  highlight: "#0066FF",
  slate: "#0F172A",
  green: "#0070F3",
  red: "#E00",
  codeBg: "#0A0A0A",
  codeText: "#EDEDED",
};

// Inline SVG Icons
const Icons = {
  System: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
  Growth: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  Tech: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
  Play: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
  Sprints: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>,
  List: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  Board: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  Checkbox: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>,
  Calendar: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  High: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="5 12 12 5 19 12"></polyline></svg>,
  Medium: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><line x1="5" y1="6" x2="19" y2="6"></line></svg>,
  Low: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>,
  Save: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>,
  Send: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  Home: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  ArrowRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>,
  Github: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>,
  Book: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  Refresh: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,
  Sync: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  GoogleCal: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="12" y1="14" x2="12" y2="14"></line></svg>,
  ExternalLink: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
};

const CustomSelect = ({ value, options, onChange, renderOption }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div 
        onClick={() => setOpen(!open)}
        style={{ padding: "6px 12px", border: "1px solid var(--theme-border)", borderRadius: 6, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "var(--theme-surfaceSolid)", fontSize: 13, color: "var(--theme-text)", minWidth: 160, justifyContent: "space-between" }}
      >
        {renderOption(options.find(o => o.id === value) || options[0])}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "var(--theme-surfaceSolid)", border: "1px solid var(--theme-border)", borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {options.map(opt => (
            <div 
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false); }}
              style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", borderBottom: "1px solid var(--theme-border)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--theme-bgAlt)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {renderOption(opt)}
              {value === opt.id && <svg style={{ marginLeft: "auto", minWidth: 12 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"></path></svg>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



export default function ServLinkBackOffice() {
  const { data, updateData, isEditMode } = useGlobalContent();
  const { lang, toggleLang, t } = useLanguage();
  
  const currentTheme = data?.branding?.theme || 'dunas';
  const currentTypo = data?.branding?.typography || 'tecnologica';
  const themeData = THEMES[currentTheme] || THEMES.dunas;
  const typoData = TYPOGRAPHIES[currentTypo] || TYPOGRAPHIES.tecnologica;

  const [activeMain, setActiveMain] = useState("home");
  const [activeSub, setActiveSub] = useState(null);
  const [globalHover, setGlobalHover] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const gridRef = useRef(null);

  // States for SCRUM Board mapping from context
  const tasks = data.scrum.tasks;
  const setTasks = (newTasks) => updateData('scrum.tasks', newTasks);
  
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const selectedTask = selectedTaskId ? (tasks.find(t => t.id === selectedTaskId) || null) : null;
  const setSelectedTask = (t) => setSelectedTaskId(t ? t.id : null);
  const [sprintView, setSprintView] = useState("board");

  // Filters
  const [filterModeEu, setFilterModeEu] = useState(false);
  const [filterSortPriority, setFilterSortPriority] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState(null);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  // New Issue modal
  const [showNewIssue, setShowNewIssue] = useState(false);
  const emptyDraft = () => ({ title: "", desc: "", status: "To Do", priority: "Medium", points: 1, assignees: ["MC"], deadline: "", subtasks: [] });
  const [newIssueDraft, setNewIssueDraft] = useState(emptyDraft());
  const [modalOffset, setModalOffset] = useState({ x: 0, y: 0 });
  const modalDragRef = useRef(null);
  const [newDraftSubtask, setNewDraftSubtask] = useState({ text: "", deadline: "", assignee: "MC" });

  // New subtask input per task panel
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [noteStatus, setNoteStatus] = useState("note_status_draft");

  // Assignee popover inside task panel
  const [showAddMember, setShowAddMember] = useState(false);

  // Google Sign-In (unified)
  const [googleUser, setGoogleUser] = useState(null); // { name, email, picture, initials }

  // Gmail notifications
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailConnecting, setGmailConnecting] = useState(false);
  const gmailTokenRef = useRef(null);
  const NOTIFY_EMAIL = import.meta.env.VITE_NOTIFY_EMAIL || "2521660@unicesusc.edu.br";

  // GitHub Sync
  const [githubSyncMap, setGithubSyncMap] = useState({});
  const [githubSyncingAll, setGithubSyncingAll] = useState(false);

  // Google Calendar
  const [calEvents, setCalEvents] = useState([]);
  const [calConnected, setCalConnected] = useState(false);
  const [calLoading, setCalLoading] = useState(false);
  const [calError, setCalError] = useState(null);
  const [gsiReady, setGsiReady] = useState(false);
  const calTokenRef = useRef(null);

  // Google Drive — Pitch Studio video library
  const [pitchVideos, setPitchVideos] = useState([]);
  const [selectedPitchVideoIdx, setSelectedPitchVideoIdx] = useState(0);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState(null);
  const [videoLinkInput, setVideoLinkInput] = useState("");
  const [videoLinkAdding, setVideoLinkAdding] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null | "uploading" | "done" | string (error)
  const [libraryOpen, setLibraryOpen] = useState(true);

  // Blog Engine — Google Docs integration + in-app editor
  const [blogDocStatus, setBlogDocStatus] = useState({}); // postId → "creating"|"done"|"error"
  const [copiedPostId, setCopiedPostId] = useState(null); // postId of last copied post
  const [blogEditorIdx, setBlogEditorIdx] = useState(null); // postIdx being edited | null
  const [editorTitle, setEditorTitle] = useState("");
  const [editorSaveStatus, setEditorSaveStatus] = useState(null); // null|"saving"|"saved"
  const editorContentRef = useRef(null);

  const handleSaveNote = () => {
    setNoteStatus("note_status_saving");
    setTimeout(() => setNoteStatus("note_status_saved"), 500);
    setTimeout(() => setNoteStatus("note_status_draft"), 3000);
  };

  const handleSendToSprints = () => {
    const newId = "SL-" + String(tasks.length + 1).padStart(2, '0');
    setTasks([...tasks, {
      id: newId,
      title: data.diferencial.docTitle || "Ideia Operacional Sem Título",
      desc: data.diferencial.docText,
      status: "Backlog",
      priority: "Medium",
      points: 2,
      sprint: "Sprint 01",
      assignees: ["MC"],
      deadline: "TBD",
    }]);
    setNoteStatus("note_status_injected");
    setTimeout(() => setNoteStatus("note_status_draft"), 3500);
  };

  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, status) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    setTasks(tasks.map(t => t.id === draggedTaskId ? { ...t, status } : t));
    setDraggedTaskId(null);
  };
  
  const getPriorityColor = (p) => p === "High" ? COLORS.text : p === "Medium" ? COLORS.textMuted : COLORS.textDim;

  // ─── Task helpers ─────────────────────────────────────────────────────────
  const updateTask = (taskId, field, value) => {
    if (field === "status") {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== value) {
        sendGmailNotification(
          `[ServLink] ${taskId}: ${task.status} → ${value}`,
          buildEmailHTML({ ...task, status: value }, `🔄 Status Atualizado`, task.status)
        );
      }
    }
    setTasks(tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t));
  };

  const getSubtasks = (task) => {
    if (Array.isArray(task.subtasks)) return task.subtasks;
    if (task.subtasks && typeof task.subtasks === "object") {
      return Array.from({ length: task.subtasks.total || 0 }, (_, i) => ({
        id: `st${i}`, text: `Subtask ${i + 1}`, done: i < (task.subtasks.done || 0)
      }));
    }
    return [];
  };

  const toggleSubtask = (taskId, stId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const subs = getSubtasks(task).map(s => s.id === stId ? { ...s, done: !s.done } : s);
    updateTask(taskId, "subtasks", subs);
  };

  const addSubtask = (taskId, text) => {
    if (!text.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const subs = [...getSubtasks(task), { id: `st${Date.now()}`, text: text.trim(), done: false }];
    updateTask(taskId, "subtasks", subs);
  };

  const removeSubtask = (taskId, stId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    updateTask(taskId, "subtasks", getSubtasks(task).filter(s => s.id !== stId));
  };

  const formatDeadline = (d) => {
    if (!d || d === "TBD") return d || "";
    try {
      return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    } catch { return d; }
  };

  const STATUS_DOT = { "Backlog": COLORS.textDim, "To Do": COLORS.highlight, "In Progress": "#F59E0B", "Done": "#22C55E" };

  const DRIVE_FOLDER_ID = "1GGex_T_q6t6aWYSFk5hSOiHFhUFkXJdm";
  const rawMembers = data?.scrum?.members || [{ initials: "MC", name: "Mateus Carpenter", email: "mateus@servlink.io" }];
  // When signed in with Google, use the Google account email/name for the first member
  const members = rawMembers.map((m, i) =>
    i === 0 && googleUser ? { ...m, email: googleUser.email, name: googleUser.name } : m
  );

  // ─── Gmail ───────────────────────────────────────────────────────────────
  const connectGmail = () => {
    if (!gsiReady || !window.google?.accounts?.oauth2) return;
    setGmailConnecting(true);
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/gmail.send",
      callback: (response) => {
        setGmailConnecting(false);
        if (response.access_token) {
          gmailTokenRef.current = response.access_token;
          setGmailConnected(true);
        }
      },
    });
    tokenClient.requestAccessToken({ prompt: "" });
  };

  // ─── Google Auth — localStorage persistence ───────────────────────────────
  const LS_TOKEN    = "sl_g_token";
  const LS_EXPIRY   = "sl_g_expiry";
  const LS_USER     = "sl_g_user";

  const GOOGLE_SCOPES = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents",
  ].join(" ");

  const saveGoogleSession = (token, expiresIn, user) => {
    try {
      localStorage.setItem(LS_TOKEN,  token);
      localStorage.setItem(LS_EXPIRY, String(Date.now() + (expiresIn || 3600) * 1000));
      localStorage.setItem(LS_USER,   JSON.stringify(user));
    } catch (_) {}
  };

  const clearGoogleSession = () => {
    try {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_EXPIRY);
      localStorage.removeItem(LS_USER);
    } catch (_) {}
  };

  const applyGoogleToken = (token, user) => {
    calTokenRef.current   = token;
    gmailTokenRef.current = token;
    setGmailConnected(true);
    setGoogleUser(user);
  };

  // ─── Google Sign-In (unified: Calendar + Gmail) ───────────────────────────
  const signInWithGoogle = () => {
    if (!gsiReady || !window.google?.accounts?.oauth2) {
      setCalError("Google SDK ainda carregando. Aguarde e tente novamente.");
      return;
    }
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: async (response) => {
        if (response.error) { setCalError("Login cancelado: " + response.error); return; }
        const token = response.access_token;
        calTokenRef.current   = token;
        gmailTokenRef.current = token;
        setGmailConnected(true);
        // Fetch user profile
        let user = { name: "Usuário", email: "", picture: "", initials: "G" };
        try {
          const profileResp = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const profile = await profileResp.json();
          const initials = (profile.given_name?.[0] || "") + (profile.family_name?.[0] || "");
          user = { name: profile.name, email: profile.email, picture: profile.picture, initials: initials.toUpperCase() || "G" };
        } catch (_) {}
        setGoogleUser(user);
        saveGoogleSession(token, response.expires_in, user);
        // Load calendar + Drive videos
        fetchCalendarEvents(token);
        fetchDriveVideos(token);
      },
    });
    tokenClient.requestAccessToken({ prompt: "select_account" });
  };

  const buildEmailHTML = (task, eventTitle, previousStatus = null) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#1a1a1a;background:#fff;">
  <div style="border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:12px;font-weight:700;letter-spacing:0.1em;color:#000;text-transform:uppercase;">ServLink WorkOS</span>
    <span style="font-size:11px;color:#999;font-family:monospace;">${new Date().toLocaleString("pt-BR")}</span>
  </div>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 24px 0;letter-spacing:-0.02em;">${eventTitle}</h1>
  <div style="background:#f9f9f8;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #e2e8f0;">
    <div style="font-family:monospace;font-size:11px;color:#999;margin-bottom:10px;">${task.id || "—"} &middot; ${task.sprint || "Sprint 01"}</div>
    <h2 style="font-size:17px;font-weight:600;margin:0 0 10px 0;">${task.title}</h2>
    ${task.desc ? `<p style="font-size:13px;color:#555;margin:0 0 16px 0;line-height:1.6;">${task.desc}</p>` : ""}
    <table style="width:100%;font-size:13px;border-collapse:collapse;">
      ${previousStatus ? `<tr><td style="padding:5px 0;color:#888;width:130px;">Status anterior</td><td style="color:#aaa;text-decoration:line-through;">${previousStatus}</td></tr>` : ""}
      <tr><td style="padding:5px 0;color:#666;width:130px;">Status</td><td style="font-weight:600;">${task.status}</td></tr>
      <tr><td style="padding:5px 0;color:#666;">Prioridade</td><td>${task.priority}</td></tr>
      <tr><td style="padding:5px 0;color:#666;">Responsável</td><td>${(task.assignees || []).map(a => { const m = rawMembers.find(x => x.initials === a); const email = (googleUser && a === rawMembers[0]?.initials) ? googleUser.email : (m ? m.email : ""); return m ? (m.name + " <" + email + ">") : a; }).join(", ") || "—"}</td></tr>
      <tr><td style="padding:5px 0;color:#666;">Estimativa</td><td style="font-family:monospace;">${task.points || 1} pts</td></tr>
      ${task.deadline ? `<tr><td style="padding:5px 0;color:#666;">Due Date</td><td>${task.deadline}</td></tr>` : ""}
    </table>
  </div>
  <p style="font-size:11px;color:#bbb;margin:0;border-top:1px solid #f0f0f0;padding-top:16px;">Notificação automática &mdash; ServLink WorkOS &middot; PMI 2026</p>
</body></html>`;

  const sendGmailNotification = async (subject, htmlBody) => {
    if (!gmailTokenRef.current) return;
    try {
      // RFC 2822 message — UTF-8 safe encoding
      const encode = (s) => btoa(unescape(encodeURIComponent(s)));
      const encSubject = `=?utf-8?B?${encode(subject)}?=`;
      const rawLines = [
        `To: ${NOTIFY_EMAIL}`,
        `From: me`,
        `Subject: ${encSubject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=UTF-8`,
        `Content-Transfer-Encoding: base64`,
        ``,
        encode(htmlBody),
      ].join("\r\n");
      const raw = btoa(rawLines).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const resp = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${gmailTokenRef.current}`, "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
      });
      if (resp.status === 401) { gmailTokenRef.current = null; setGmailConnected(false); }
    } catch (err) {
      console.warn("Gmail notification:", err.message);
    }
  };

  const createNewIssue = () => {
    if (!newIssueDraft.title.trim()) return;
    const newId = "SL-" + String(tasks.length + 1).padStart(2, "0");
    const newTask = { ...newIssueDraft, id: newId, sprint: data.scrum.sprintTitle?.split(":")[0] || "Sprint 01" };
    setTasks([...tasks, newTask]);
    sendGmailNotification(
      `[ServLink] Nova Issue: ${newTask.title}`,
      buildEmailHTML(newTask, "✅ Nova Issue Criada")
    );
    setNewIssueDraft(emptyDraft());
    setShowNewIssue(false);
  };

  // Filtered/sorted tasks for board & list
  let visibleTasks = tasks;
  if (filterModeEu) visibleTasks = visibleTasks.filter(t => t.assignees?.includes("MC"));
  if (filterAssignee) visibleTasks = visibleTasks.filter(t => t.assignees?.includes(filterAssignee));
  if (filterSortPriority) {
    const order = { High: 0, Medium: 1, Low: 2 };
    visibleTasks = [...visibleTasks].sort((a, b) => (order[a.priority] ?? 2) - (order[b.priority] ?? 2));
  }

  // ─── GitHub Sync ─────────────────────────────────────────────────────────
  const buildIssueBody = (task) => [
    `## ${task.id} — ${task.title}`,
    "",
    `| Campo | Valor |`,
    `|-------|-------|`,
    `| **Sprint** | ${task.sprint || "—"} |`,
    `| **Status** | ${task.status || "—"} |`,
    `| **Priority** | ${task.priority || "—"} |`,
    `| **Points** | ${task.points ?? "—"} |`,
    `| **Due Date** | ${task.deadline || "—"} |`,
    `| **Assignees** | ${(task.assignees || []).join(", ") || "—"} |`,
    "",
    task.desc ? `### Descrição\n${task.desc}` : "",
    "",
    "---",
    "*Sincronizado via ServLink WorkOS*",
  ].join("\n");

  const syncTaskToGitHub = async (task) => {
    setGithubSyncMap(prev => ({ ...prev, [task.id]: "syncing" }));
    const devPat = import.meta.env.VITE_GITHUB_PAT;
    try {
      if (devPat) {
        // Dev mode: direct GitHub API call (PAT stays in .env, never in bundle for prod)
        const repo = "mscarpenter/servlink-hub";
        const issueTitle = `[${task.id}] ${task.title}`;
        // Check if issue already exists
        const searchResp = await fetch(
          `https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${repo} "${issueTitle}" in:title is:issue`)}&per_page=1`,
          { headers: { Authorization: `token ${devPat}`, Accept: "application/vnd.github.v3+json" } }
        );
        const searchData = await searchResp.json();
        const existing = searchData.items?.[0];
        if (existing) {
          await fetch(`https://api.github.com/repos/${repo}/issues/${existing.number}`, {
            method: "PATCH",
            headers: { Authorization: `token ${devPat}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
            body: JSON.stringify({ body: buildIssueBody(task), state: task.status === "Done" ? "closed" : "open" }),
          });
        } else {
          const createResp = await fetch(`https://api.github.com/repos/${repo}/issues`, {
            method: "POST",
            headers: { Authorization: `token ${devPat}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
            body: JSON.stringify({ title: issueTitle, body: buildIssueBody(task) }),
          });
          if (!createResp.ok) {
            const err = await createResp.json();
            throw new Error(err.message || `HTTP ${createResp.status}`);
          }
        }
      } else if (supabase) {
        // Production: Supabase Edge Function (PAT hidden as secret)
        const { data: resp, error } = await supabase.functions.invoke("github-sync", {
          body: { task, repo: "mscarpenter/servlink-hub" },
        });
        if (error || !resp?.success) throw new Error(error?.message || resp?.error || "Edge function failed");
      } else {
        throw new Error("Configure VITE_GITHUB_PAT no .env");
      }
      setGithubSyncMap(prev => ({ ...prev, [task.id]: "synced" }));
      setTimeout(() => setGithubSyncMap(prev => ({ ...prev, [task.id]: "idle" })), 4000);
    } catch (err) {
      console.error("GitHub sync:", err.message);
      setGithubSyncMap(prev => ({ ...prev, [task.id]: "error" }));
      setTimeout(() => setGithubSyncMap(prev => ({ ...prev, [task.id]: "idle" })), 4000);
    }
  };

  const syncAllToGitHub = async () => {
    if (githubSyncingAll) return;
    setGithubSyncingAll(true);
    for (const task of tasks) {
      await syncTaskToGitHub(task);
    }
    setGithubSyncingAll(false);
  };

  // ─── Google Calendar ──────────────────────────────────────────────────────
  // Initialize editor when a post is opened for editing
  useEffect(() => {
    if (blogEditorIdx === null) return;
    const post = data.blog.posts[blogEditorIdx];
    if (!post) return;
    setEditorTitle(post.title || "");
    if (editorContentRef.current) {
      editorContentRef.current.innerHTML = post.content || post.desc || "";
    }
  }, [blogEditorIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !clientId.includes(".apps.googleusercontent.com")) return;
    // Already loaded (hot reload)
    if (window.google?.accounts?.oauth2) { setGsiReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiReady(true);
    script.onerror = () => setCalError("Falha ao carregar Google SDK. Verifique sua conexão.");
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  // ─── Restore Google session after page reload ─────────────────────────────
  useEffect(() => {
    if (!gsiReady) return;
    try {
      const savedToken  = localStorage.getItem(LS_TOKEN);
      const savedExpiry = Number(localStorage.getItem(LS_EXPIRY) || 0);
      const savedUser   = JSON.parse(localStorage.getItem(LS_USER) || "null");
      if (!savedToken || !savedUser) return;

      // Restore user info immediately (avatar shows right away)
      setGoogleUser(savedUser);

      if (savedExpiry > Date.now() + 60_000) {
        // Token still valid — restore silently
        applyGoogleToken(savedToken, savedUser);
        fetchCalendarEvents(savedToken);
        fetchDriveVideos(savedToken);
      } else {
        // Token expired — silent re-auth (no popup if user already consented)
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: GOOGLE_SCOPES,
          callback: async (response) => {
            if (response.error || !response.access_token) {
              // Silent re-auth failed — clear stored session, user signs in manually
              clearGoogleSession();
              setGoogleUser(null);
              return;
            }
            const token = response.access_token;
            applyGoogleToken(token, savedUser);
            saveGoogleSession(token, response.expires_in, savedUser);
            fetchCalendarEvents(token);
            fetchDriveVideos(token);
          },
        });
        tokenClient.requestAccessToken({ prompt: "" });
      }
    } catch (_) {}
  }, [gsiReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCalendarEvents = async (token) => {
    setCalLoading(true);
    setCalError(null);
    try {
      const now = new Date().toISOString();
      const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${now}&timeMax=${weekLater}&maxResults=6`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${token || calTokenRef.current}` } });
      const json = await resp.json();
      if (json.error) {
        const code = json.error.code;
        if (code === 401) { setCalConnected(false); clearGoogleSession(); setGoogleUser(null); setCalError("Sessão expirada. Faça login novamente."); }
        else if (code === 403) setCalError("Google Calendar API não habilitada. Ative em console.cloud.google.com → APIs & Services.");
        else setCalError(json.error.message || "Erro da API Google");
        return;
      }
      setCalEvents((json.items || []).filter(e => e.status !== "cancelled"));
      setCalConnected(true);
    } catch (err) {
      setCalError("Erro de rede: " + err.message);
    } finally {
      setCalLoading(false);
    }
  };

  const connectGoogleCalendar = () => {
    setCalError(null);
    if (!gsiReady || !window.google?.accounts?.oauth2) {
      setCalError("Google SDK ainda carregando. Aguarde alguns segundos e tente novamente.");
      return;
    }
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      callback: (response) => {
        if (response.error) { setCalError("OAuth cancelado ou negado: " + response.error); return; }
        if (response.access_token) {
          calTokenRef.current = response.access_token;
          fetchCalendarEvents(response.access_token);
        }
      },
    });
    tokenClient.requestAccessToken({ prompt: "" });
  };

  const formatCalTime = (event) => {
    if (!event.start) return "";
    const start = new Date(event.start.dateTime || event.start.date);
    const today = new Date(); today.setHours(0,0,0,0);
    const evDay = new Date(start); evDay.setHours(0,0,0,0);
    const diff = Math.round((evDay - today) / 86400000);
    const timeStr = event.start.dateTime
      ? start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : "";
    const days = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
    if (diff === 0) return `Hoje${timeStr ? `, ${timeStr}h` : ""}`;
    if (diff === 1) return `Amanhã${timeStr ? `, ${timeStr}h` : ""}`;
    if (diff < 7) return `${days[start.getDay()]}${timeStr ? `, ${timeStr}h` : ""}`;
    return start.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const getMeetLink = (event) => {
    return event.hangoutLink
      || event.conferenceData?.entryPoints?.find(e => e.entryPointType === "video")?.uri
      || null;
  };

  // ─── Google Drive video library ──────────────────────────────────────────
  const fetchDriveVideos = async (token) => {
    const tok = token || calTokenRef.current;
    if (!tok) return;
    setDriveLoading(true);
    setDriveError(null);
    try {
      // Fetch ALL files in folder: real videos AND our .url reference files
      const q = encodeURIComponent(`'${DRIVE_FOLDER_ID}' in parents and trashed=false`);
      const fields = encodeURIComponent("files(id,name,mimeType,thumbnailLink,createdTime,size,description)");
      const resp = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=createdTime+desc&pageSize=50`,
        { headers: { Authorization: `Bearer ${tok}` } }
      );
      const json = await resp.json();
      if (json.error) { setDriveError(json.error.message); return; }

      const videos = (json.files || []).flatMap(f => {
        if (f.mimeType && f.mimeType.includes("video")) {
          // Real video file in Drive
          return [{
            id: f.id, name: f.name, type: "drive", driveId: f.id,
            thumbnailLink: f.thumbnailLink,
            embedUrl: `https://drive.google.com/file/d/${f.id}/preview`,
            createdTime: f.createdTime,
          }];
        }
        // .url reference file: YouTube URL stored in description field
        if (f.name && f.name.endsWith(".url") && f.description) {
          const ytId = extractYouTubeId(f.description);
          if (ytId) {
            return [{
              id: f.id,
              name: f.description.length < 60 ? f.description : "YouTube — " + ytId,
              type: "youtube",
              embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
              thumbnailLink: `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`,
              createdTime: f.createdTime,
            }];
          }
          // Generic URL file (non-YouTube external)
          const url = f.description;
          return [{
            id: f.id, name: f.name.replace(".url", ""), type: "external",
            embedUrl: url, thumbnailLink: null, createdTime: f.createdTime,
          }];
        }
        return []; // skip other file types
      });

      setPitchVideos(videos);
      if (videos.length > 0) setSelectedPitchVideoIdx(0);
    } catch (err) {
      setDriveError("Erro de rede: " + err.message);
    } finally {
      setDriveLoading(false);
    }
  };

  const extractDriveFileId = (url) => {
    const m = url.match(/\/file\/d\/([^\/\?]+)/) || url.match(/id=([^&\s]+)/);
    return m ? m[1] : null;
  };

  const extractYouTubeId = (url) => {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return m ? m[1] : null;
  };

  // Save a reference file (.url) to Drive — URL stored in description for easy retrieval
  const saveRefToDrive = async (url, fileName) => {
    const content = `[InternetShortcut]\nURL=${url}`;
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify({
      name: fileName,
      parents: [DRIVE_FOLDER_ID],
      mimeType: "text/plain",
      description: url, // key: URL stored here so fetchDriveVideos can reconstruct it
    })], { type: "application/json" }));
    form.append("file", new Blob([content], { type: "text/plain" }), fileName);
    const resp = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      { method: "POST", headers: { Authorization: `Bearer ${calTokenRef.current}` }, body: form }
    );
    return resp.json();
  };

  // Upload a blob (video file) to the Drive folder
  const uploadFileToDrive = async (blob, name) => {
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify({
      name, parents: [DRIVE_FOLDER_ID], mimeType: blob.type || "video/mp4",
    })], { type: "application/json" }));
    form.append("file", blob, name);
    const resp = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,thumbnailLink",
      { method: "POST", headers: { Authorization: `Bearer ${calTokenRef.current}` }, body: form }
    );
    return resp.json();
  };

  const addVideoLink = async () => {
    if (!videoLinkInput.trim()) return;
    const url = videoLinkInput.trim();
    setVideoLinkAdding(true);
    setUploadStatus("uploading");
    setDriveError(null);

    try {
      // ── YouTube URL ──────────────────────────────────────────────────────
      const ytId = extractYouTubeId(url);
      if (ytId) {
        // Optimistically add to library immediately
        const newVideo = {
          id: "yt_" + ytId, name: url, type: "youtube",
          embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
          thumbnailLink: `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`,
        };
        setPitchVideos(prev => [newVideo, ...prev]);
        setSelectedPitchVideoIdx(0);
        setVideoLinkInput("");
        // Save .url reference to Drive so it persists and survives page reload
        if (calTokenRef.current) {
          await saveRefToDrive(url, `youtube_${ytId}.url`);
          setUploadStatus("done");
          // Refresh from Drive to get the canonical entry
          await fetchDriveVideos();
        } else {
          setUploadStatus("done");
        }
        setTimeout(() => setUploadStatus(null), 2500);
        return;
      }

      // ── Google Drive share link ──────────────────────────────────────────
      const driveId = extractDriveFileId(url);
      if (driveId && calTokenRef.current) {
        const copyResp = await fetch(
          `https://www.googleapis.com/drive/v3/files/${driveId}/copy`,
          { method: "POST", headers: { Authorization: `Bearer ${calTokenRef.current}`, "Content-Type": "application/json" }, body: JSON.stringify({ parents: [DRIVE_FOLDER_ID] }) }
        );
        if (copyResp.ok) {
          setVideoLinkInput("");
          await fetchDriveVideos();
          setUploadStatus("done");
        } else {
          const err = await copyResp.json();
          setUploadStatus(err.error?.message || "Erro ao copiar do Drive");
        }
        setTimeout(() => setUploadStatus(null), 2500);
        return;
      }

      // ── Direct video URL (.mp4, .webm, etc.) ────────────────────────────
      // Try to fetch the file. If CORS allows, upload binary to Drive.
      // If CORS blocks, save a .url reference so at least it persists.
      if (calTokenRef.current) {
        let blob = null;
        try {
          const r = await fetch(url);
          if (r.ok && r.headers.get("content-type")?.includes("video")) blob = await r.blob();
        } catch (_) { /* CORS blocked */ }

        if (blob) {
          const fileName = url.split("?")[0].split("/").pop() || "video.mp4";
          const result = await uploadFileToDrive(blob, fileName);
          if (result.id) {
            setVideoLinkInput("");
            await fetchDriveVideos();
            setUploadStatus("done");
          } else {
            setUploadStatus(result.error?.message || "Erro no upload");
          }
        } else {
          // CORS blocked binary download — save as .url reference (still playable as embed)
          const fileName = (url.split("?")[0].split("/").pop() || "video") + ".url";
          await saveRefToDrive(url, fileName);
          setVideoLinkInput("");
          await fetchDriveVideos();
          setUploadStatus("done");
        }
      } else {
        // Not signed in — add locally only
        setPitchVideos(prev => [{
          id: "ext_" + Math.random().toString(36).substr(2, 6),
          name: url.split("?")[0].split("/").pop() || "Vídeo",
          type: "external", embedUrl: url, thumbnailLink: null,
        }, ...prev]);
        setSelectedPitchVideoIdx(0);
        setVideoLinkInput("");
        setUploadStatus("done");
      }
      setTimeout(() => setUploadStatus(null), 2500);
    } catch (err) {
      setUploadStatus("Erro: " + err.message);
      setTimeout(() => setUploadStatus(null), 5000);
    } finally {
      setVideoLinkAdding(false);
    }
  };

  // States for ROI Calculator
  const [roiNoShow, setRoiNoShow] = useState(350);
  const [roiEvents, setRoiEvents] = useState(48);
  const [roiRate, setRoiRate] = useState(30);
  const roiTotal = roiNoShow * roiEvents * (roiRate / 100);
  const roiSaved = roiTotal * 0.72;

  const handleMouseMove = (e) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Montserrat:wght@400;500;600&family=Roboto+Mono:wght@400&family=EB+Garamond:wght@400;500&display=swap');

    :root {
      --font-ui: 'Inter', -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    body {
      margin: 0; padding: 0;
      font-family: var(--font-ui); color: ${COLORS.text};
      -webkit-font-smoothing: antialiased;
      background: ${COLORS.bg};
      overflow-x: hidden;
    }

    * { box-sizing: border-box; }

    .mesh-bg {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -1;
      background: radial-gradient(circle at 15% 50%, #F1F1F0 0%, transparent 50%),
                  radial-gradient(circle at 85% 30%, rgba(226, 232, 240, 0.5) 0%, transparent 50%);
      animation: meshPulse 15s ease-in-out infinite alternate;
    }
    @keyframes meshPulse {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(1.1); opacity: 1; }
    }

    .glassmorphic {
      background: ${COLORS.surface};
      backdrop-filter: blur(12px) saturate(140%);
      border: 1px solid ${COLORS.border};
      border-radius: 16px;
    }
      
    .glass-dock {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(0,0,0,0.05);
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02);
    }
      
    .glass-nav {
      background: rgba(249, 249, 248, 0.8);
      backdrop-filter: blur(12px) saturate(150%);
      border-bottom: 1px solid ${COLORS.border};
    }

    .status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
    .status-ok { background: #22C55E; box-shadow: 0 0 8px #22C55E88; }
    .status-alert { background: #EAB308; }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    ::-webkit-scrollbar { width: 0; height: 0; }
    
    input[type=range] {
      -webkit-appearance: none; width: 100%; background: transparent;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 16px; width: 16px; border-radius: 50%;
      background: ${COLORS.surfaceSolid}; cursor: pointer;
      border: 1px solid #D0D0D5;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-top: -6px;
    }
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%; height: 4px; cursor: pointer;
      background: ${COLORS.border}; border-radius: 2px;
    }

    .bento-card {
      background: ${COLORS.surfaceSolid}; border: 1px solid ${COLORS.border}; border-radius: 12px;
      transition: all 0.2s ease; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .bento-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.04);
    }
  `;

  const NavTab = ({ id, label, icon: Icon, active, set }) => (
    <button onClick={() => set(id)} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "8px 16px", borderRadius: 8,
      background: active ? COLORS.surfaceSolid : "transparent",
      color: active ? COLORS.text : COLORS.textMuted,
      fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: active ? 600 : 500,
      border: `1px solid ${active ? COLORS.border : "transparent"}`,
      boxShadow: active ? "0 2px 4px rgba(0,0,0,0.02)" : "none",
      cursor: "pointer", transition: "all 0.2s ease",
    }}>
      <Icon /> {label}
    </button>
  );

  const SectionTitle = ({ title, subtitle }) => (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: COLORS.text, marginBottom: 4 }}>{title}</h2>
      <p style={{ fontSize: 14, color: COLORS.textMuted }}>{subtitle}</p>
    </div>
  );

  const LivingConnectors = () => {
    const isJurereHovered = globalHover === "jurere";
    return (
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
        <motion.path 
          d="M 60% 30% C 75% 30%, 80% 20%, 90% 20%" 
          fill="none" 
          stroke={isJurereHovered ? COLORS.highlight : "rgba(0,0,0,0.05)"} 
          strokeWidth="2" 
          initial={{ pathLength: 0 }} 
          animate={{ pathLength: 1 }} 
          transition={{ duration: 1.5, ease: "easeInOut" }} 
        />
        {isJurereHovered && (
          <motion.circle r="3" fill={COLORS.highlight}
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            style={{ offsetPath: "path('M 60% 30% C 75% 30%, 80% 20%, 90% 20%')" }}
          />
        )}
      </svg>
    );
  };

  const renderCard = (block, blockIndex) => {
    const isCore = block.type === "core";
    const isInfra = block.type === "infra";
    const xParallax = mousePos.x * (isCore ? 15 : isInfra ? -5 : 5);
    const yParallax = mousePos.y * (isCore ? 15 : isInfra ? -5 : 5);
    
    const hasHighlight = block.items.some(it => 
      (globalHover === "jurere" && (it.id === "vp_agile" || it.id === "seg_b2b"))
    );

    return (
      <motion.div
        key={block.id}
        className="glassmorphic"
        style={{
          gridColumn: block.col, gridRow: block.row,
          display: "flex", flexDirection: "column", padding: 20,
          position: "relative", zIndex: isCore ? 10 : 1,
          border: hasHighlight ? `1px solid ${COLORS.highlight}` : `1px solid ${COLORS.border}`,
          boxShadow: hasHighlight ? `0 0 20px rgba(0,102,255,0.15)` : 'none'
        }}
        animate={{ x: xParallax, y: yParallax }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        whileHover={{ scale: 1.02, zIndex: 20, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
        onMouseEnter={() => setGlobalHover(block.id)}
        onMouseLeave={() => setGlobalHover(null)}
      >
        {isCore && (
          <motion.div 
            style={{ position: "absolute", top: -50, left: -50, right: -50, bottom: -50, background: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)`, zIndex: -1 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        )}
        
        <div style={{
          fontFamily: isInfra ? "var(--font-mono)" : "var(--font-ui)",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          color: isCore ? COLORS.text : COLORS.textMuted,
          marginBottom: 16, display: "flex", alignItems: "center", gap: 8
        }}>
          {isInfra && <span className="status-dot status-ok" />}
          {isCore && <span className="status-dot status-alert" style={{ background: COLORS.highlight, boxShadow: `0 0 8px ${COLORS.highlight}88` }} />}
          <EditableText path={`bmc.cards.${blockIndex}.title`} />
        </div>

        <EditableList
          listPath={`bmc.cards.${blockIndex}.items`}
          renderItem={(item, i) => {
            const itemHighlight = globalHover === "jurere" && (item.id === "vp_agile" || item.id === "seg_b2b");
            return (
              <div key={item.id || i} style={{ display: "flex", alignItems: "baseline", gap: 8, flex: 1 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: itemHighlight ? COLORS.highlight : COLORS.textDim, flexShrink: 0 }} />
                <EditableText
                  path={`bmc.cards.${blockIndex}.items.${i}.text`}
                  style={{
                    fontSize: isCore ? 14 : 12,
                    fontFamily: isInfra ? "var(--font-mono)" : "var(--font-ui)",
                    fontWeight: itemHighlight || isCore ? 600 : 400,
                    color: itemHighlight ? COLORS.highlight : COLORS.textMuted,
                    lineHeight: 1.4, transition: "color 0.3s ease",
                    flex: 1
                  }}
                />
              </div>
            );
          }}
        />
      </motion.div>
    );
  };

  const renderCoreBMC = () => (
    <motion.div 
      key="bmc"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6 }}
      style={{ display: "flex", flexDirection: "column", gap: 32 }}
    >
      <div style={{ marginBottom: 16 }}>
        <EditableText path="bmc.title" as="h2" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", color: COLORS.text, marginBottom: 4 }} />
        <EditableText path="bmc.subtitle" as="p" style={{ fontSize: 13, color: COLORS.textMuted, margin: 0 }} />
      </div>

      <div 
        ref={gridRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        style={{ 
          position: "relative",
          display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gridTemplateRows: "repeat(2, 140px)", gap: 16 
        }}
      >
        <LivingConnectors />
        {data.bmc.cards.map((block, i) => renderCard(block, i))}
      </div>

      <motion.div className="glass-dock" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, padding: "24px 32px", marginTop: 16, position: "relative" }}>
        <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", background: COLORS.text, color: "#FFF", padding: "4px 16px", borderRadius: 20, fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "0.05em", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>
          FINANCIAL ENGINE
        </div>
        <div style={{ borderRight: `1px solid ${COLORS.border}`, paddingRight: 24 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: COLORS.textMuted, marginBottom: 12 }}>COST STRUCTURE</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {["Cloud Infra AWS", "Gateway Fees", "Manual Curation"].map(c => (
               <div key={c} style={{ fontSize: 12, padding: "4px 8px", background: "rgba(0,0,0,0.03)", borderRadius: 6, color: COLORS.textMuted }}>{c}</div>
            ))}
          </div>
        </div>
        <div style={{ paddingLeft: 8 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: COLORS.textMuted, marginBottom: 12 }}>REVENUE STREAMS</div>
          <div style={{ display: "flex", gap: 32 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.04em", color: COLORS.text }}>15-20%</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>Take Rate (Fase 1)</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.04em", color: COLORS.text }}>Pro</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>SaaS Mensal (Fase 2)</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderCoreDiferencial = () => (
    <motion.div key="diferencial" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40, height: "100%" }}>
      <SectionTitle title="Diferencial Competitivo" subtitle="A essência do fosso institucional B2B." />
      
      <div style={{ background: "#FFF", borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "40px 60px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", fontFamily: "var(--font-ui)", lineHeight: 1.8, fontSize: 16, color: COLORS.text, display: "flex", flexDirection: "column", minHeight: 480 }}>
        <input 
          type="text" 
          value={data.diferencial.docTitle}
          onChange={(e) => updateData('diferencial.docTitle', e.target.value)}
          readOnly={!isEditMode}
          style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 24, paddingBottom: 16, border: "none", outline: "none", width: "100%", color: COLORS.text, background: "transparent", borderBottom: `1px dashed ${COLORS.border}` }} 
          placeholder="Título do documento..."
        />
        
        <textarea
          value={data.diferencial.docText}
          onChange={(e) => updateData('diferencial.docText', e.target.value)}
          readOnly={!isEditMode}
          placeholder="Comece a digitar suas ideias estratégicas aqui..."
          style={{ flex: 1, width: "100%", border: "none", outline: "none", resize: "none", background: "transparent", color: COLORS.textMuted, fontSize: 15, lineHeight: 1.8, fontFamily: "var(--font-ui)" }}
        />

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, color: noteStatus === "note_status_injected" ? "#22C55E" : COLORS.textDim, fontFamily: "var(--font-mono)", transition: "0.2s" }}>
            {t(noteStatus)}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button 
              onClick={() => { setActiveMain("growth"); setActiveSub("partners"); }}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, background: "transparent", color: COLORS.textMuted, borderRadius: 8, border: `1px solid transparent`, cursor: "pointer", transition: "all 0.2s" }}
              title="Sinergia de Parcerias Institucionais"
              onMouseEnter={e => { e.currentTarget.style.color = COLORS.text; }}
              onMouseLeave={e => { e.currentTarget.style.color = COLORS.textMuted; }}
            >
              <Icons.System />
            </button>
            <div style={{ height: 24, width: 1, background: COLORS.border }} />
            <button 
              onClick={handleSaveNote}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "transparent", color: COLORS.textMuted, borderRadius: 8, border: `1px solid transparent`, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.color = COLORS.text; }}
              onMouseLeave={e => { e.currentTarget.style.color = COLORS.textMuted; }}
            >
              <Icons.Save /> {t("note_save")}
            </button>
            <button
              onClick={handleSendToSprints}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: COLORS.text, color: "#fff", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Icons.Send /> {t("note_send_sprint")}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderCoreProposta = () => (
    <motion.div key="proposta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
      <div style={{ paddingRight: 40 }}>
        <div style={{ marginBottom: 32 }}>
          <EditableText path="proposta.title" as="h2" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: COLORS.text, margin: 0, marginBottom: 4 }} />
          <EditableText path="proposta.subtitle" as="p" style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }} />
        </div>
        <EditableText path="proposta.desc" as="div" style={{ fontSize: 15, color: COLORS.slateDim, lineHeight: 1.6, marginBottom: 24 }} />
        
        {/* Stage Manager Style Lead Gen Tracker */}
        <div className="glass-dock" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, background: COLORS.surfaceSolid }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: COLORS.text, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.text }}>TELEMETRY</div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: COLORS.textMuted }}>Match Efficiency</div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: "var(--font-mono)" }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: COLORS.text, letterSpacing: "-0.05em" }}>60.0<span style={{ fontSize: 12, color: COLORS.textMuted }}>s</span></div>
          </div>
        </div>
      </div>
      
      <div style={{ position: "relative", paddingLeft: 24, borderLeft: `1px solid ${COLORS.border}` }}>
        <EditableList
          listPath="proposta.steps"
          renderItem={(step, i) => {
            const isHovered = globalHover === step.id;
            return (
              <div key={step.id || i} style={{ position: "relative", cursor: "pointer", display: "flex", flexDirection: "column", flex: 1, paddingBottom: 24 }}
                   onMouseEnter={() => setGlobalHover(step.id)}
                   onMouseLeave={() => setGlobalHover(null)}>
                <div style={{
                  position: "absolute", left: -30, top: 4, width: 11, height: 11, borderRadius: "50%",
                  background: step.status === 'critical' ? COLORS.red : step.status === 'loss' ? COLORS.slate : COLORS.surfaceSolid,
                  border: `2px solid ${step.status === 'normal' ? COLORS.textMuted : 'transparent'}`,
                  boxShadow: isHovered && step.id === 'jurere' ? `0 0 12px ${COLORS.highlight}` : 'none'
                }} />
                <EditableText path={`proposta.steps.${i}.time`} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: isHovered && step.id === 'jurere' ? COLORS.highlight : COLORS.textMuted, marginBottom: 4 }} />
                <EditableText path={`proposta.steps.${i}.event`} style={{ fontSize: 14, fontWeight: isHovered && step.id === 'jurere' ? 600 : 500, color: isHovered && step.id === 'jurere' ? COLORS.highlight : COLORS.text, marginBottom: 4 }} />
                <EditableText path={`proposta.steps.${i}.desc`} as="div" style={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1.5 }} />
              </div>
            )
          }}
        />
      </div>
    </motion.div>
  );

  const renderCorePitch = () => {
    const currentVideo = pitchVideos[selectedPitchVideoIdx] || null;
    const hasPrev = selectedPitchVideoIdx > 0;
    const hasNext = selectedPitchVideoIdx < pitchVideos.length - 1;
    const GlassBtn = ({ onClick, children, title, style = {} }) => (
      <button onClick={onClick} title={title} style={{
        background: "rgba(15,15,25,0.55)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.75)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s", ...style
      }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(15,15,25,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
      >{children}</button>
    );
    return (
      <motion.div key="pitch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, height: "calc(100vh - 240px)" }}>

        {/* ── Left: Script ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", paddingRight: 6 }}>
          <div style={{ marginBottom: 20 }}>
            <EditableText path="pitch.title" as="h2" style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: COLORS.text, margin: 0, marginBottom: 4 }} />
            <EditableText path="pitch.subtitle" as="p" style={{ fontSize: 12, color: COLORS.textMuted, margin: 0 }} />
          </div>
          <EditableList listPath="pitch.acts" renderItem={(s, i) => (
            <div key={s.id || i} style={{ padding: 14, background: COLORS.surfaceSolid, border: `1px solid ${COLORS.border}`, borderRadius: 10, display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: COLORS.highlight, marginBottom: 4 }}>ACT <EditableText path={`pitch.acts.${i}.act`} /></div>
              <EditableText path={`pitch.acts.${i}.title`} style={{ fontSize: 13, fontWeight: 500, color: COLORS.text, marginBottom: 4 }} />
              <EditableText path={`pitch.acts.${i}.text`} as="div" style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5 }} />
            </div>
          )} />
        </div>

        {/* ── Right: Video Player + Library ── */}
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#06080F", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>

          {/* ── Video ── */}
          <div style={{ position: "absolute", inset: 0 }}>
            {!currentVideo ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
                    {!googleUser ? "Pitch Studio" : driveLoading ? t("library_syncing") : t("library_empty")}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                    {!googleUser ? t("library_login_hint") : isEditMode ? t("library_add_edit_hint") : t("library_add_noauth_hint")}
                  </div>
                </div>
              </div>
            ) : currentVideo.type === "external" ? (
              <video key={currentVideo.id} src={currentVideo.embedUrl} controls autoPlay style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              <iframe key={currentVideo.id} src={currentVideo.embedUrl} allow="autoplay; fullscreen" allowFullScreen style={{ width: "100%", height: "100%", border: "none" }} />
            )}
          </div>

          {/* ── Top chrome bar (always visible, glass) ── */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10, background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)", pointerEvents: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#FF5F57","#FFBD2E","#28C840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.85 }} />)}
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentVideo ? currentVideo.name : "PITCH_STUDIO"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, pointerEvents: "auto" }}>
              {currentVideo?.type === "drive" && (
                <a href={"https://drive.google.com/file/d/" + currentVideo.driveId + "/view"} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
                ><Icons.ExternalLink /> Drive</a>
              )}
              {pitchVideos.length > 0 && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{selectedPitchVideoIdx + 1}/{pitchVideos.length}</span>
              )}
            </div>
          </div>

          {/* ── Prev / Next arrows (overlay, glass) ── */}
          {hasPrev && (
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 10 }}>
              <GlassBtn onClick={() => setSelectedPitchVideoIdx(i => i - 1)} title="Anterior" style={{ width: 36, height: 36, borderRadius: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </GlassBtn>
            </div>
          )}
          {hasNext && (
            <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 10 }}>
              <GlassBtn onClick={() => setSelectedPitchVideoIdx(i => i + 1)} title="Próximo" style={{ width: 36, height: 36, borderRadius: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </GlassBtn>
            </div>
          )}

          {/* ── Collapsible bottom library ── */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 }}>

            {/* Toggle pill */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: libraryOpen ? 0 : 8 }}>
              <button onClick={() => setLibraryOpen(v => !v)} style={{
                background: "rgba(10,12,20,0.7)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px 8px 0 0", padding: "4px 16px",
                cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4, fontSize: 10, transition: "0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transition: "transform 0.2s", transform: libraryOpen ? "rotate(0deg)" : "rotate(180deg)" }}><polyline points="18 15 12 9 6 15"/></svg>
                <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>LIBRARY</span>
                {pitchVideos.length > 0 && <span style={{ background: "rgba(255,255,255,0.12)", borderRadius: 4, padding: "1px 5px" }}>{pitchVideos.length}</span>}
              </button>
            </div>

            {/* Library panel */}
            {libraryOpen && (
              <div style={{ background: "rgba(6,8,15,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>

                {/* Edit-mode URL input */}
                {isEditMode && (
                  <div style={{ padding: "10px 14px 8px", display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      value={videoLinkInput}
                      onChange={e => setVideoLinkInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addVideoLink()}
                      placeholder={t("library_placeholder")}
                      style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 11px", fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-mono)", outline: "none" }}
                      onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.28)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                    <GlassBtn onClick={addVideoLink} title="Salvar no Drive" style={{ padding: "7px 13px", gap: 5, fontSize: 11, fontWeight: 600, opacity: videoLinkAdding ? 0.5 : 1, borderRadius: 7, pointerEvents: videoLinkAdding ? "none" : "auto", background: videoLinkInput.trim() ? "rgba(0,102,255,0.35)" : undefined }}>
                      {videoLinkAdding
                        ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> {t("library_saving")}</>
                        : <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> {t("library_confirm")}</>
                      }
                    </GlassBtn>
                    <GlassBtn onClick={() => fetchDriveVideos()} title="Recarregar" style={{ width: 32, height: 32, borderRadius: 7 }}>
                      <Icons.Refresh />
                    </GlassBtn>
                  </div>
                )}

                {/* Status feedback */}
                {uploadStatus && (
                  <div style={{ padding: "3px 14px 6px", fontSize: 10, fontFamily: "var(--font-mono)", color: uploadStatus === "done" ? "#28C840" : uploadStatus === "uploading" ? COLORS.highlight : "#FF5F57" }}>
                    {uploadStatus === "done" ? t("library_saved") : uploadStatus === "uploading" ? t("upload_sending") : uploadStatus}
                  </div>
                )}

                {/* Carousel */}
                <div style={{ display: "flex", gap: 8, padding: isEditMode ? "4px 14px 10px" : "8px 14px 10px", overflowX: "auto", scrollbarWidth: "none" }}>
                  {driveLoading && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", padding: "10px 0", fontFamily: "var(--font-mono)", alignSelf: "center" }}>{t("library_syncing")}</div>}
                  {!driveLoading && pitchVideos.length === 0 && (
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", padding: "10px 0", fontFamily: "var(--font-mono)", alignSelf: "center" }}>
                      {googleUser ? t("library_drive_empty") : t("library_login_hint")}
                    </div>
                  )}
                  {pitchVideos.map((v, i) => (
                    <div key={v.id} onClick={() => setSelectedPitchVideoIdx(i)} style={{
                      flexShrink: 0, width: 108, cursor: "pointer", borderRadius: 8, overflow: "hidden",
                      border: `1.5px solid ${i === selectedPitchVideoIdx ? COLORS.highlight : "rgba(255,255,255,0.07)"}`,
                      background: i === selectedPitchVideoIdx ? "rgba(0,102,255,0.1)" : "rgba(255,255,255,0.04)",
                      transform: i === selectedPitchVideoIdx ? "scale(1.04) translateY(-1px)" : "scale(1)",
                      transition: "all 0.15s ease",
                      boxShadow: i === selectedPitchVideoIdx ? "0 4px 20px rgba(0,102,255,0.3)" : "none",
                    }}>
                      <div style={{ width: "100%", aspectRatio: "16/9", position: "relative", overflow: "hidden", background: "#0a0c14" }}>
                        {v.thumbnailLink
                          ? <img src={v.thumbnailLink} alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {v.type === "youtube"
                                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.52v-7.04L15.5 12l-5.75 3.52z"/></svg>
                                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                              }
                            </div>
                        }
                        {i === selectedPitchVideoIdx && (
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,102,255,0.15)" }}>
                            <div style={{ width: 18, height: 18, borderRadius: "50%", background: COLORS.highlight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="6" height="6" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "5px 7px" }}>
                        <div style={{ fontSize: 9, color: i === selectedPitchVideoIdx ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.45)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", marginTop: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>{v.type === "youtube" ? "YT" : v.type === "drive" ? "Drive" : "URL"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGrowthROI = () => (
    <motion.div key="roi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ maxWidth: 800 }}>
      <SectionTitle title="Technical ROI Tool" subtitle="Calculadora de conversão B2B." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ padding: 24, background: COLORS.surfaceSolid, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
          {[
            { label: "Lost revenue / event", val: roiNoShow, set: setRoiNoShow, min: 50, max: 2000, prefix: "R$" },
            { label: "High-volume events / year", val: roiEvents, set: setRoiEvents, min: 10, max: 365, prefix: "" },
            { label: "No-Show factor", val: roiRate, set: setRoiRate, min: 5, max: 80, prefix: "", suffix: "%" }
          ].map((inp, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.textMuted }}>{inp.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: COLORS.text }}>{inp.prefix}{inp.val}{inp.suffix}</span>
              </div>
              <input type="range" min={inp.min} max={inp.max} value={inp.val} onChange={e => inp.set(Number(e.target.value))} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ flex: 1, padding: 24, background: COLORS.surfaceSolid, borderRadius: 12, border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.textMuted, marginBottom: 8 }}>Estimated Lost Margin</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 500, color: COLORS.text }}>R$ {roiTotal.toLocaleString("pt-BR", {maximumFractionDigits:0})}</div>
          </div>
          <div style={{ flex: 1, padding: 24, background: COLORS.slate, borderRadius: 12, display: "flex", flexDirection: "column", justifyContent: "center" }}>
             <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>Value Recovered (72% efficiency)</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 500, color: COLORS.green }}>+R$ {roiSaved.toLocaleString("pt-BR", {maximumFractionDigits:0})}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const themeOptions = Object.entries(THEMES).map(([id, t]) => ({ id, name: t.name, colors: t.colors }));
  const fontOptions = Object.entries(TYPOGRAPHIES).map(([id, t]) => ({ id, name: t.name, primary: t.primary }));

  const renderThemeOption = (opt) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ 
        width: 14, height: 14, borderRadius: "50%", 
        background: `linear-gradient(135deg, ${opt.colors?.highlight} 0%, ${opt.colors?.slate} 50%, ${opt.colors?.bg} 100%)`,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.1)"
      }} />
      <span style={{ whiteSpace: "nowrap" }}>{opt.name}</span>
    </div>
  );

  const renderFontOption = (opt) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: opt.primary }}>
      <span style={{ whiteSpace: "nowrap" }}>{opt.name}</span>
    </div>
  );

  const renderGrowthBranding = () => (
    <motion.div key="branding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* 1. Header */}
      <SectionTitle title="Branding Artifacts" subtitle="Assets and typography identity." />
      
      {/* 2. Top 3 Promo Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div style={{ padding: 40, background: themeData.colors.surfaceSolid, borderRadius: 12, border: `1px solid ${themeData.colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: typoData.primary, transition: "all 0.3s ease" }}>
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.04em", color: themeData.colors.text }}>ServLink</span>
        </div>
        <div style={{ padding: 40, background: themeData.colors.slate, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: typoData.primary, transition: "all 0.3s ease" }}>
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.04em", color: themeData.colors.surfaceSolid }}>ServLink</span>
        </div>
        <div style={{ padding: 40, background: themeData.colors.surfaceSolid, borderRadius: 12, border: `1px solid ${themeData.colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: typoData.primary, transition: "all 0.3s ease" }}>
          <div style={{ width: 40, height: 40, background: themeData.colors.slate, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: themeData.colors.surfaceSolid, fontWeight: 600, fontSize: 18 }}>S</div>
        </div>
      </div>

      {/* 3. Bottom 2 Info Cards */}
      <div style={{ 
        marginTop: 24, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16,
        '--theme-bg': themeData.colors.bg,
        '--theme-bgAlt': themeData.colors.bgAlt,
        '--theme-surfaceSolid': themeData.colors.surfaceSolid,
        '--theme-border': themeData.colors.border,
        '--theme-text': themeData.colors.text,
        '--theme-textMuted': themeData.colors.textMuted
      }}>
        
        {/* Typography Card */}
        <div style={{ padding: 24, background: themeData.colors.surfaceSolid, borderRadius: 12, border: `1px solid ${themeData.colors.border}`, transition: "all 0.3s ease", position: "relative", zIndex: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 11, color: themeData.colors.textMuted, textTransform: "uppercase" }}>TYPOGRAPHY — {typoData.name}</div>
            <div style={{ transform: "translateY(-4px)", position: "relative", zIndex: 10 }}>
              <CustomSelect 
                value={currentTypo} 
                options={fontOptions} 
                onChange={val => updateData('branding.typography', val)}
                renderOption={renderFontOption}
              />
            </div>
          </div>
          <div style={{ fontSize: 48, fontWeight: 300, color: themeData.colors.text, fontFamily: typoData.primary, lineHeight: 1 }}>Aa</div>
          <div style={{ fontSize: 14, color: themeData.colors.textMuted, marginTop: 8, fontFamily: typoData.primary }}>The quick brown fox jumps over the lazy dog.</div>
        </div>

        {/* Palette Card */}
        <div style={{ padding: 24, background: themeData.colors.surfaceSolid, borderRadius: 12, border: `1px solid ${themeData.colors.border}`, display: "flex", flexDirection: "column", transition: "all 0.3s ease", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 11, color: themeData.colors.textMuted, textTransform: "uppercase" }}>CORE PALETTE</div>
            <div style={{ transform: "translateY(-4px)", position: "relative", zIndex: 10 }}>
              <CustomSelect 
                value={currentTheme} 
                options={themeOptions} 
                onChange={val => updateData('branding.theme', val)}
                renderOption={renderThemeOption}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: "auto", flexWrap: "wrap" }}>
            {[themeData.colors.bg, themeData.colors.surfaceSolid, themeData.colors.border, themeData.colors.text, themeData.colors.slate, themeData.colors.highlight].map((c, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 4, background: c, border: `1px solid rgba(0,0,0,0.1)` }} title={c} />
            ))}
          </div>
        </div>

      </div>

      {/* 4. Brand Direction */}
      <div style={{ 
        marginTop: 24, padding: 32, borderRadius: 16, border: `1px solid ${themeData.colors.border}`,
        background: `linear-gradient(to bottom, ${themeData.colors.bgAlt}, ${themeData.colors.surfaceSolid})`, 
        display: "flex", flexDirection: "column", gap: 24, transition: "all 0.3s ease",
        fontFamily: "var(--font-ui)" 
      }}>
        <div style={{ fontSize: 11, color: themeData.colors.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Direção de Marca</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          
          {/* Tom de Voz */}
          <div style={{ padding: 24, background: themeData.colors.surfaceSolid, borderRadius: 12, border: `1px solid ${themeData.colors.border}`, display: "flex", flexDirection: "column", gap: 20, transition: "all 0.3s ease" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: themeData.colors.highlight, fontFamily: typoData.primary }}>Tom de Voz</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 13, color: themeData.colors.textMuted, lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: themeData.colors.textDim }}>→</span> Profissional mas acessível</div>
              <div style={{ fontSize: 13, color: themeData.colors.textMuted, lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: themeData.colors.textDim }}>→</span> Confiança sem arrogância</div>
              <div style={{ fontSize: 13, color: themeData.colors.textMuted, lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: themeData.colors.textDim }}>→</span> Linguagem direta, sem jargões</div>
            </div>
          </div>

          {/* Personalidade */}
          <div style={{ padding: 24, background: themeData.colors.surfaceSolid, borderRadius: 12, border: `1px solid ${themeData.colors.border}`, display: "flex", flexDirection: "column", gap: 20, transition: "all 0.3s ease" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: themeData.colors.highlight, fontFamily: typoData.primary }}>Personalidade</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 13, color: themeData.colors.textMuted, lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: themeData.colors.textDim }}>→</span> Confiável como um maître</div>
              <div style={{ fontSize: 13, color: themeData.colors.textMuted, lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: themeData.colors.textDim }}>→</span> Ágil como um barista</div>
              <div style={{ fontSize: 13, color: themeData.colors.textMuted, lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: themeData.colors.textDim }}>→</span> Preciso como um sommelier</div>
            </div>
          </div>

          {/* Valores Visuais */}
          <div style={{ padding: 24, background: themeData.colors.surfaceSolid, borderRadius: 12, border: `1px solid ${themeData.colors.border}`, display: "flex", flexDirection: "column", gap: 20, transition: "all 0.3s ease" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: themeData.colors.highlight, fontFamily: typoData.primary }}>Valores Visuais</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 13, color: themeData.colors.textMuted, lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: themeData.colors.textDim }}>→</span> Minimalismo funcional</div>
              <div style={{ fontSize: 13, color: themeData.colors.textMuted, lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: themeData.colors.textDim }}>→</span> Hierarquia clara</div>
              <div style={{ fontSize: 13, color: themeData.colors.textMuted, lineHeight: 1.5, display: "flex", gap: 8 }}><span style={{ color: themeData.colors.textDim }}>→</span> Espaço para respirar</div>
            </div>
          </div>

        </div>
      </div>

    </motion.div>
  );

  // ─── Blog: Google Docs ────────────────────────────────────────────────────
  // Returns docId on success, null on failure
  const createDocForPost = async (post, postIdx, plainText) => {
    const tok = calTokenRef.current;
    if (!tok) return null;
    const postId = post.id || String(postIdx);
    setBlogDocStatus(prev => ({ ...prev, [postId]: "creating" }));
    try {
      // 1. Create blank Google Doc via Drive API
      const createResp = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: post.title || "Blog Draft", mimeType: "application/vnd.google-apps.document" }),
      });
      const { id: docId, error: createErr } = await createResp.json();
      if (createErr || !docId) throw new Error(createErr?.message || "Falha ao criar documento");

      // 2. Insert content via Docs API batchUpdate (plain text)
      const body = plainText || [post.tag ? `[${post.tag}]  ${post.date || ""}\n\n` : "", `${post.title || ""}\n\n`, post.desc || ""].join("");
      if (body.trim()) {
        await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
          method: "POST",
          headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
          body: JSON.stringify({ requests: [{ insertText: { location: { index: 1 }, text: body } }] }),
        });
      }

      // 3. Persist docId
      updateData(`blog.posts.${postIdx}.docId`, docId);
      setBlogDocStatus(prev => ({ ...prev, [postId]: "done" }));
      setTimeout(() => setBlogDocStatus(prev => { const n = { ...prev }; delete n[postId]; return n; }), 3000);
      return docId;
    } catch (err) {
      console.error("Docs create:", err.message);
      setBlogDocStatus(prev => ({ ...prev, [postId]: "error" }));
      setTimeout(() => setBlogDocStatus(prev => { const n = { ...prev }; delete n[postId]; return n; }), 4000);
      return null;
    }
  };

  const copyPostText = (post, postIdx) => {
    const el = editorContentRef.current;
    const richText = (blogEditorIdx === postIdx && el) ? (el.textContent || el.innerText || "") : "";
    const text = richText || [post.title, "", post.desc].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
    const postId = post.id || String(postIdx);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const saveEditorContent = (postIdx) => {
    const html = editorContentRef.current?.innerHTML || "";
    updateData(`blog.posts.${postIdx}.content`, html);
    updateData(`blog.posts.${postIdx}.title`, editorTitle);
    setEditorSaveStatus("saving");
    setTimeout(() => setEditorSaveStatus("saved"), 300);
    setTimeout(() => setEditorSaveStatus(null), 2500);
  };

  const pushToDocsAndOpen = async (post, postIdx) => {
    // Extract plain text from editor
    const el = editorContentRef.current;
    const plainText = el ? (el.textContent || el.innerText || "") : (post.desc || "");
    const fullText = `${editorTitle || post.title || ""}\n\n${plainText}`;
    let docId = post.docId;
    if (!docId) {
      docId = await createDocForPost({ ...post, title: editorTitle || post.title }, postIdx, fullText);
    }
    if (docId) {
      window.open(`https://docs.google.com/document/d/${docId}/edit`, "_blank");
    }
  };

  const renderBlogEditor = (post, postIdx) => {
    const postId = post.id || String(postIdx);
    const docStatus = blogDocStatus[postId];
    const hasDoc = !!post.docId;
    const isCopied = copiedPostId === postId;

    const execCmd = (cmd, val = null) => {
      document.execCommand(cmd, false, val);
      editorContentRef.current?.focus();
    };

    const ToolBtn = ({ cmd, val, title, children }) => (
      <button
        onMouseDown={e => { e.preventDefault(); execCmd(cmd, val); }}
        title={title}
        style={{ background: "transparent", border: "none", cursor: "pointer", width: 28, height: 28, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: COLORS.textMuted, transition: "0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.background = COLORS.bgAlt; e.currentTarget.style.color = COLORS.text; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = COLORS.textMuted; }}
      >{children}</button>
    );

    return (
      <AnimatePresence>
        {blogEditorIdx === postIdx && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}
          >
            {/* ── Editor chrome bar ── */}
            <div style={{ width: "100%", background: COLORS.surfaceSolid, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", padding: "0 24px", height: 48, flexShrink: 0, gap: 12 }}>
              {/* Close */}
              <button onClick={() => { saveEditorContent(postIdx); setBlogEditorIdx(null); }}
                style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: COLORS.textMuted, fontSize: 13, fontWeight: 500, padding: "4px 8px", borderRadius: 6 }}
                onMouseEnter={e => e.currentTarget.style.color = COLORS.text}
                onMouseLeave={e => e.currentTarget.style.color = COLORS.textMuted}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Blog Engine
              </button>

              <div style={{ width: 1, height: 20, background: COLORS.border }} />

              {/* Formatting toolbar */}
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ToolBtn cmd="bold" title="Negrito (Ctrl+B)"><b>B</b></ToolBtn>
                <ToolBtn cmd="italic" title="Itálico (Ctrl+I)"><i>I</i></ToolBtn>
                <ToolBtn cmd="underline" title="Sublinhado (Ctrl+U)"><u style={{ fontSize: 12 }}>U</u></ToolBtn>
                <div style={{ width: 1, height: 16, background: COLORS.border, margin: "0 4px" }} />
                <ToolBtn cmd="formatBlock" val="h1" title="Título 1"><span style={{ fontSize: 11 }}>H1</span></ToolBtn>
                <ToolBtn cmd="formatBlock" val="h2" title="Título 2"><span style={{ fontSize: 11 }}>H2</span></ToolBtn>
                <ToolBtn cmd="formatBlock" val="p" title="Parágrafo"><span style={{ fontSize: 11 }}>¶</span></ToolBtn>
                <div style={{ width: 1, height: 16, background: COLORS.border, margin: "0 4px" }} />
                <ToolBtn cmd="insertUnorderedList" title="Lista com marcadores">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
                </ToolBtn>
                <ToolBtn cmd="insertOrderedList" title="Lista numerada">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" strokeLinecap="round"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1.5"/></svg>
                </ToolBtn>
              </div>

              <div style={{ flex: 1 }} />

              {/* Save status */}
              {editorSaveStatus && (
                <span style={{ fontSize: 11, color: editorSaveStatus === "saved" ? "#22C55E" : COLORS.textMuted, fontFamily: "var(--font-mono)", transition: "0.2s" }}>
                  {editorSaveStatus === "saving" ? "Salvando..." : "✓ Salvo"}
                </span>
              )}

              {/* Copy text */}
              <button onClick={() => copyPostText(post, postIdx)} title="Copiar texto"
                style={{ background: isCopied ? "rgba(34,197,94,0.08)" : "transparent", border: `1px solid ${isCopied ? "rgba(34,197,94,0.3)" : COLORS.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: isCopied ? "#22C55E" : COLORS.textMuted, transition: "0.2s" }}>
                {isCopied
                  ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copiado</>
                  : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar</>
                }
              </button>

              {/* Salvar rascunho */}
              <button onClick={() => saveEditorContent(postIdx)}
                style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", color: COLORS.text, transition: "0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.textDim}
                onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
              >Salvar rascunho</button>

              {/* Abrir no Docs */}
              <button
                onClick={() => pushToDocsAndOpen(post, postIdx)}
                disabled={!googleUser || !!docStatus}
                style={{ background: COLORS.text, border: "none", borderRadius: 6, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: googleUser && !docStatus ? "pointer" : "not-allowed", color: "#fff", display: "flex", alignItems: "center", gap: 6, opacity: !googleUser ? 0.5 : 1, transition: "0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
                title={!googleUser ? "Faça login para usar o Google Docs" : hasDoc ? "Abrir documento no Google Docs" : "Criar e abrir no Google Docs"}
              >
                {docStatus === "creating"
                  ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Criando…</>
                  : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
                    {hasDoc ? "Abrir no Docs" : "Salvar no Docs"} <Icons.ExternalLink /></>
                }
              </button>
            </div>

            {/* ── Document area ── */}
            <div style={{ flex: 1, width: "100%", overflowY: "auto", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "100%", maxWidth: 760, background: "#FFFFFF", borderRadius: 4, boxShadow: "0 4px 32px rgba(0,0,0,0.18)", minHeight: "calc(100vh - 200px)", display: "flex", flexDirection: "column" }}>
                {/* Page inner */}
                <div style={{ padding: "72px 96px", display: "flex", flexDirection: "column", flex: 1 }}>
                  {/* Title */}
                  <input
                    value={editorTitle}
                    onChange={e => setEditorTitle(e.target.value)}
                    placeholder="Título do artigo"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: "#111", fontFamily: "var(--font-ui)", marginBottom: 8, background: "transparent", lineHeight: 1.2 }}
                  />
                  {/* Tag + date row */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 40, paddingBottom: 24, borderBottom: "1px solid #E8E8E8" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: COLORS.highlight, background: "rgba(0,102,255,0.07)", padding: "3px 8px", borderRadius: 4 }}>{post.tag || "TAG"}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#999" }}>{post.date || ""}</span>
                  </div>
                  {/* Contenteditable body */}
                  <div
                    ref={editorContentRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={() => {}}
                    style={{
                      flex: 1, outline: "none", fontSize: 16, lineHeight: 1.8,
                      color: "#1a1a1a", fontFamily: "var(--font-ui)",
                      minHeight: 400,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderGrowthBlog = () => (
    <motion.div key="blog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Editor overlays — one per post, shown when blogEditorIdx matches */}
      {data.blog.posts.map((p, i) => renderBlogEditor(p, i))}

      <div style={{ marginBottom: 32 }}>
        <EditableText path="blog.title" as="h2" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: COLORS.text, margin: 0, marginBottom: 4 }} />
        <EditableText path="blog.subtitle" as="p" style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {data.blog.posts.map((p, i) => {
          const postId = p.id || String(i);
          const docStatus = blogDocStatus[postId];
          const isCopied = copiedPostId === postId;
          const hasDoc = !!p.docId;
          return (
            <div key={p.id || i} className="bento-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header row: tag + date + copy button */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <EditableText path={`blog.posts.${i}.tag`} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: COLORS.highlight }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <EditableText path={`blog.posts.${i}.date`} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: COLORS.textMuted }} />
                  {/* Copy button */}
                  <button
                    onClick={() => copyPostText(p, i)}
                    title="Copiar texto"
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: 3, color: isCopied ? "#22C55E" : COLORS.textDim, display: "flex", alignItems: "center", transition: "color 0.2s" }}
                    onMouseEnter={e => { if (!isCopied) e.currentTarget.style.color = COLORS.text; }}
                    onMouseLeave={e => { if (!isCopied) e.currentTarget.style.color = COLORS.textDim; }}
                  >
                    {isCopied
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <EditableText path={`blog.posts.${i}.title`} as="h3" style={{ fontSize: 16, fontWeight: 500, color: COLORS.text, margin: 0 }} />
                <EditableText path={`blog.posts.${i}.desc`} as="p" style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5, margin: 0 }} />
              </div>

              {/* Write / Edit button */}
              <button
                onClick={() => setBlogEditorIdx(i)}
                style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", color: COLORS.textMuted, transition: "0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = COLORS.text; e.currentTarget.style.borderColor = COLORS.textDim; e.currentTarget.style.background = COLORS.surfaceSolid; }}
                onMouseLeave={e => { e.currentTarget.style.color = COLORS.textMuted; e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.bg; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                {p.content ? "Editar" : "Escrever"}
              </button>

              {/* Docs footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${COLORS.border}`, marginTop: 4 }}>
                {/* Docs link badge */}
                {hasDoc ? (
                  <a
                    href={"https://docs.google.com/document/d/" + p.docId + "/edit"}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: COLORS.highlight, textDecoration: "none", fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Abrir no Docs <Icons.ExternalLink />
                  </a>
                ) : (
                  <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "var(--font-mono)" }}>
                    {!googleUser ? "Login para salvar" : "Sem documento vinculado"}
                  </div>
                )}

                {/* Save / status button */}
                {googleUser && (
                  <button
                    onClick={() => !hasDoc && !docStatus && createDocForPost(p, i)}
                    disabled={!!docStatus || hasDoc}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: hasDoc ? "transparent" : docStatus === "done" ? "rgba(34,197,94,0.08)" : docStatus === "error" ? "rgba(220,0,0,0.06)" : COLORS.bg,
                      border: `1px solid ${hasDoc ? "transparent" : docStatus === "done" ? "rgba(34,197,94,0.3)" : docStatus === "error" ? "rgba(220,0,0,0.2)" : COLORS.border}`,
                      borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 500, cursor: hasDoc || docStatus ? "default" : "pointer",
                      color: hasDoc ? COLORS.textDim : docStatus === "done" ? "#22C55E" : docStatus === "error" ? COLORS.red : COLORS.textMuted,
                      transition: "0.2s",
                    }}
                    onMouseEnter={e => { if (!hasDoc && !docStatus) { e.currentTarget.style.borderColor = COLORS.textDim; e.currentTarget.style.color = COLORS.text; } }}
                    onMouseLeave={e => { if (!hasDoc && !docStatus) { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textMuted; } }}
                  >
                    {docStatus === "creating"
                      ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Criando…</>
                      : docStatus === "done"
                      ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Salvo!</>
                      : docStatus === "error"
                      ? "⚠ Erro"
                      : hasDoc
                      ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Vinculado</>
                      : <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Salvar no Docs</>
                    }
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  const renderGrowthPartners = () => (
    <motion.div key="partners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div style={{ marginBottom: 32 }}>
        <EditableText path="partners.title" as="h2" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: COLORS.text, margin: 0, marginBottom: 4 }} />
        <EditableText path="partners.subtitle" as="p" style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {data.partners.list.map((p, i) => (
          <div key={p.id || i} className="bento-card" style={{ height: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", filter: isEditMode ? "none" : "grayscale(100%)", transition: "all 0.3s ease", padding: 16 }}
               onMouseEnter={e => e.currentTarget.style.filter = "grayscale(0%)"}
               onMouseLeave={e => e.currentTarget.style.filter = isEditMode ? "none" : "grayscale(100%)"}>
            <EditableText path={`partners.list.${i}.name`} style={{ fontSize: 18, fontWeight: 600, color: COLORS.text, letterSpacing: "-0.04em", cursor: "default" }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: COLORS.textMuted, marginTop: 8, display: "flex", gap: 4 }}>[<EditableText path={`partners.list.${i}.status`} />]</div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderArchitecture = () => (
    <motion.div key="archi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", justifyContent: "center", paddingTop: 32 }}>
      <div style={{ width: "100%", maxWidth: 800, background: COLORS.codeBg, borderRadius: 16, border: `1px solid rgba(255,255,255,0.1)`, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ height: 32, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", padding: "0 16px", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F56" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27C93F" }} />
          <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.3)", transform: "translateX(-24px)" }}>stack.config.yaml</div>
        </div>
        <div style={{ padding: 24, fontFamily: "var(--font-mono)", fontSize: 13, color: COLORS.codeText, lineHeight: 1.6 }}>
          <span style={{ color: "#FF7B72" }}>version:</span> <span style={{ color: "#79C0FF" }}>"2026.2"</span><br/>
          <span style={{ color: "#FF7B72" }}>project:</span> <span style={{ color: "#79C0FF" }}>"ServLink MVP"</span><br/><br/>
          <span style={{ color: "#FF7B72" }}>infrastructure:</span><br/>
          &nbsp;&nbsp;<span style={{ color: "#7EE787" }}>cloud:</span> AWS<br/>
          &nbsp;&nbsp;<span style={{ color: "#7EE787" }}>compute:</span> Serverless + Vercel<br/>
          &nbsp;&nbsp;<span style={{ color: "#7EE787" }}>database:</span> PostgreSQL (Supabase)<br/><br/>
          
          <span style={{ color: "#FF7B72" }}>frontend:</span><br/>
          &nbsp;&nbsp;<span style={{ color: "#7EE787" }}>framework:</span> Next.js 14 (App Router)<br/>
          &nbsp;&nbsp;<span style={{ color: "#7EE787" }}>styling:</span> Tailwind CSS<br/>
          &nbsp;&nbsp;<span style={{ color: "#7EE787" }}>state:</span> Zustand / React Query<br/><br/>

          <span style={{ color: "#FF7B72" }}>backend:</span><br/>
          &nbsp;&nbsp;<span style={{ color: "#7EE787" }}>core:</span> Laravel 11 / Octane<br/>
          &nbsp;&nbsp;<span style={{ color: "#7EE787" }}>payments:</span> Stripe Connect<br/>
          &nbsp;&nbsp;<span style={{ color: "#7EE787" }}>cache:</span> Redis<br/><br/>
          
          <span style={{ color: "#8B949E" }}># Status: Bootstrapping...</span>
        </div>
      </div>
    </motion.div>
  );

  const renderSprintsBoard = () => {
    const columns = ["Backlog", "To Do", "In Progress", "Done"];
    const colLabel = { "Backlog": t("col_backlog"), "To Do": t("col_todo"), "In Progress": t("col_inprogress"), "Done": t("col_done") };
    return (
      <motion.div key="sprints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: "calc(100vh - 160px)", display: "flex", flexDirection: "column" }}>
        
        {/* Gestão Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <EditableText path="scrum.sprintTitle" as="h2" style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: COLORS.text, marginBottom: 4, margin: 0 }} />
              <div style={{ fontSize: 13, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 6 }}><Icons.List /> {visibleTasks.length}{visibleTasks.length !== tasks.length ? ` / ${tasks.length}` : ""} issues</div>
            </div>
            
            <div style={{ height: 24, width: 1, background: COLORS.border, margin: "0 8px" }} />
            
            <div style={{ display: "flex", gap: 4, background: COLORS.surfaceSolid, padding: 4, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
              <button onClick={() => setSprintView("board")} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: sprintView === "board" ? COLORS.border : "transparent", color: sprintView === "board" ? COLORS.text : COLORS.textMuted, border: "none", cursor: "pointer" }}><Icons.Board /></button>
              <button onClick={() => setSprintView("list")} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: sprintView === "list" ? COLORS.border : "transparent", color: sprintView === "list" ? COLORS.text : COLORS.textMuted, border: "none", cursor: "pointer" }}><Icons.List /></button>
            </div>
            
            <div style={{ display: "flex", gap: 8, marginLeft: 8, position: "relative" }}>
              <button
                onClick={() => setFilterModeEu(v => !v)}
                style={{ background: filterModeEu ? COLORS.text : "transparent", border: `1px solid ${filterModeEu ? COLORS.text : COLORS.border}`, padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 500, color: filterModeEu ? "#fff" : COLORS.textMuted, cursor: "pointer", transition: "0.2s" }}
              >{t("filter_just_me")}</button>
              <button
                onClick={() => setFilterSortPriority(v => !v)}
                style={{ background: filterSortPriority ? COLORS.text : "transparent", border: `1px solid ${filterSortPriority ? COLORS.text : COLORS.border}`, padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 500, color: filterSortPriority ? "#fff" : COLORS.textMuted, cursor: "pointer", transition: "0.2s" }}
              >{t("filter_priority")}</button>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowAssigneeDropdown(v => !v)}
                  style={{ background: filterAssignee ? COLORS.text : "transparent", border: `1px solid ${filterAssignee ? COLORS.text : COLORS.border}`, padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 500, color: filterAssignee ? "#fff" : COLORS.textMuted, cursor: "pointer", transition: "0.2s", display: "flex", alignItems: "center", gap: 6 }}
                >{filterAssignee || t("filter_assignee")} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
                {showAssigneeDropdown && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: COLORS.surfaceSolid, border: `1px solid ${COLORS.border}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 50, minWidth: 180, overflow: "hidden" }}>
                    <div onClick={() => { setFilterAssignee(null); setShowAssigneeDropdown(false); }} style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", color: COLORS.textMuted }} onMouseEnter={e => e.currentTarget.style.background = COLORS.bgAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{t("filter_all")}</div>
                    {members.map(m => (
                      <div key={m.initials} onClick={() => { setFilterAssignee(m.initials); setShowAssigneeDropdown(false); }} style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: COLORS.text }} onMouseEnter={e => e.currentTarget.style.background = COLORS.bgAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS.text, color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{m.initials}</div>
                        {m.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Gmail notification toggle */}
            <button
              onClick={gmailConnected ? () => { gmailTokenRef.current = null; setGmailConnected(false); } : connectGmail}
              disabled={gmailConnecting || !gsiReady}
              title={gmailConnected ? `Notificações ativas → ${NOTIFY_EMAIL}` : "Ativar notificações por email"}
              style={{ background: "transparent", border: `1px solid ${gmailConnected ? "#22C55E" : COLORS.border}`, padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: (gmailConnecting || !gsiReady) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5, color: gmailConnected ? "#22C55E" : COLORS.textMuted, transition: "0.2s", opacity: (!gsiReady && !gmailConnected) ? 0.5 : 1 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {gmailConnecting ? t("gmail_connecting") : gmailConnected ? t("gmail_active") : t("gmail_label")}
            </button>
            <button
              onClick={syncAllToGitHub}
              disabled={githubSyncingAll}
              style={{ background: "transparent", color: githubSyncingAll ? COLORS.textMuted : COLORS.text, border: `1px solid ${COLORS.border}`, padding: "8px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: githubSyncingAll ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, transition: "0.2s", opacity: githubSyncingAll ? 0.7 : 1 }}
              onMouseEnter={e => { if (!githubSyncingAll) e.currentTarget.style.borderColor = COLORS.textDim; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; }}
            >
              <Icons.Github />
              {githubSyncingAll ? t("gmail_connecting") : t("sync_github")}
            </button>
            <button onClick={() => { setNewIssueDraft(emptyDraft()); setNewDraftSubtask({ text: "", deadline: "", assignee: "MC" }); setModalOffset({ x: 0, y: 0 }); setShowNewIssue(true); }} style={{ background: COLORS.text, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}><span style={{ fontFamily: "var(--font-mono)" }}>+</span> {t("new_issue")}</button>
          </div>
        </div>

        {/* Board View */}
        {sprintView === "board" && (
          <div style={{ flex: 1, display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16 }}>
            {columns.map(col => {
              const colTasks = visibleTasks.filter(t => t.status === col);
              return (
                <div
                  key={col}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, col)}
                  style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 12, background: "rgba(255,255,255,0.4)", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12 }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, padding: "0 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_DOT[col] || COLORS.textDim }} />
                      {colLabel[col] || col}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "var(--font-mono)", background: COLORS.surfaceSolid, padding: "2px 6px", borderRadius: 12, border: `1px solid ${COLORS.border}` }}>{colTasks.length}</div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {colTasks.map(task => {
                      const subs = getSubtasks(task);
                      const subsDone = subs.filter(s => s.done).length;
                      return (
                        <motion.div
                          layoutId={task.id}
                          key={task.id}
                          draggable
                          onDragStart={e => handleDragStart(e, task.id)}
                          onClick={() => setSelectedTask(task)}
                          className="bento-card"
                          style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, background: COLORS.surfaceSolid, opacity: draggedTaskId === task.id ? 0.4 : 1, cursor: "pointer" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: COLORS.textDim }}>{task.id}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <button onClick={e => { e.stopPropagation(); syncTaskToGitHub(task); }} title="Sync to GitHub"
                                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2, color: githubSyncMap[task.id] === "synced" ? "#22C55E" : githubSyncMap[task.id] === "error" ? COLORS.red : COLORS.textDim, display: "flex", alignItems: "center" }}>
                                {githubSyncMap[task.id] === "syncing" ? <Icons.Refresh /> : githubSyncMap[task.id] === "synced" ? <Icons.Check /> : <Icons.Sync />}
                              </button>
                              <div style={{ color: task.priority === "High" ? COLORS.text : COLORS.textMuted }}>
                                {task.priority === "High" && <Icons.High />}
                                {task.priority === "Medium" && <Icons.Medium />}
                                {task.priority === "Low" && <Icons.Low />}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text, lineHeight: 1.4 }}>{task.title}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 10 }}>
                              {subs.length > 0 && (
                                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: COLORS.textMuted, fontFamily: "var(--font-mono)" }}><Icons.Checkbox /> {subsDone}/{subs.length}</div>
                              )}
                              {task.deadline && task.deadline !== "TBD" && (
                                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: COLORS.textMuted, fontFamily: "var(--font-mono)" }}><Icons.Calendar /> {formatDeadline(task.deadline)}</div>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              {(task.assignees || []).map(a => (
                                <div key={a} style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS.text, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 600, border: `2px solid ${COLORS.surfaceSolid}`, marginLeft: -4 }}>{a}</div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {sprintView === "list" && (
          <div style={{ flex: 1, overflowY: "auto", background: COLORS.surfaceSolid, border: `1px solid ${COLORS.border}`, borderRadius: 12 }}>
            <div style={{ display: "flex", padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.textMuted, fontWeight: 600 }}>
              <div style={{ width: 80 }}>{t("list_id")}</div>
              <div style={{ flex: 1 }}>{t("list_title")}</div>
              <div style={{ width: 120 }}>{t("list_status")}</div>
              <div style={{ width: 100 }}>{t("list_priority")}</div>
              <div style={{ width: 100 }}>{t("list_assignee")}</div>
            </div>
            {visibleTasks.map(task => (
              <div key={task.id} onClick={() => setSelectedTask(task)} style={{ display: "flex", padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`, alignItems: "center", fontSize: 13, cursor: "pointer" }} className="bento-card">
                <div style={{ width: 80, fontFamily: "var(--font-mono)", color: COLORS.textMuted }}>{task.id}</div>
                <div style={{ flex: 1, fontWeight: 500, color: COLORS.text }}>{task.title}</div>
                <div style={{ width: 120 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: COLORS.surface, border: `1px solid ${COLORS.border}`, padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_DOT[task.status] || COLORS.textDim }} /> {task.status}
                  </span>
                </div>
                <div style={{ width: 100, display: "flex", alignItems: "center", gap: 6, color: task.priority === "High" ? COLORS.text : COLORS.textMuted }}>
                  {task.priority === "High" && <Icons.High />}
                  {task.priority === "Medium" && <Icons.Medium />}
                  {task.priority === "Low" && <Icons.Low />}
                  {task.priority}
                </div>
                <div style={{ width: 100 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {(task.assignees || []).map(a => (
                      <div key={a} style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS.text, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, border: `2px solid ${COLORS.surfaceSolid}`, marginLeft: -4 }}>{a}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── New Issue Modal (draggable) ── */}
        <AnimatePresence>
          {showNewIssue && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { setShowNewIssue(false); setModalOffset({ x: 0, y: 0 }); }}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", zIndex: 200 }} />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                style={{
                  position: "fixed",
                  top: `calc(50% + ${modalOffset.y}px)`,
                  left: `calc(50% + ${modalOffset.x}px)`,
                  transform: "translate(-50%,-50%)",
                  width: 540,
                  maxHeight: "85vh",
                  overflowY: "auto",
                  background: COLORS.surfaceSolid,
                  borderRadius: 16,
                  border: `1px solid ${COLORS.border}`,
                  zIndex: 201,
                  boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Drag handle header */}
                <div
                  ref={modalDragRef}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX - modalOffset.x;
                    const startY = e.clientY - modalOffset.y;
                    const onMove = (ev) => setModalOffset({ x: ev.clientX - startX, y: ev.clientY - startY });
                    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
                    document.addEventListener("mousemove", onMove);
                    document.addEventListener("mouseup", onUp);
                  }}
                  style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "grab", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.textDim} strokeWidth="2"><circle cx="8" cy="6" r="1.5" fill={COLORS.textDim}/><circle cx="16" cy="6" r="1.5" fill={COLORS.textDim}/><circle cx="8" cy="12" r="1.5" fill={COLORS.textDim}/><circle cx="16" cy="12" r="1.5" fill={COLORS.textDim}/><circle cx="8" cy="18" r="1.5" fill={COLORS.textDim}/><circle cx="16" cy="18" r="1.5" fill={COLORS.textDim}/></svg>
                    <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{t("modal_new_issue")}</div>
                  </div>
                  <button onClick={() => { setShowNewIssue(false); setModalOffset({ x: 0, y: 0 }); }} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 20, color: COLORS.textMuted, lineHeight: 1 }}>&times;</button>
                </div>

                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Título */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{t("field_title")}</label>
                    <input value={newIssueDraft.title} onChange={e => setNewIssueDraft(p => ({...p, title: e.target.value}))} placeholder={t("field_title_placeholder")} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", color: COLORS.text, background: COLORS.bg, outline: "none", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = COLORS.text} onBlur={e => e.target.style.borderColor = COLORS.border} />
                  </div>
                  {/* Descrição */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{t("field_desc")}</label>
                    <textarea value={newIssueDraft.desc} onChange={e => setNewIssueDraft(p => ({...p, desc: e.target.value}))} placeholder={t("field_desc_placeholder")} rows={3} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: COLORS.text, background: COLORS.bg, outline: "none", resize: "vertical", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = COLORS.text} onBlur={e => e.target.style.borderColor = COLORS.border} />
                  </div>
                  {/* Metadata grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{t("field_status")}</label>
                      <select value={newIssueDraft.status} onChange={e => setNewIssueDraft(p => ({...p, status: e.target.value}))} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: COLORS.text, background: COLORS.bg, outline: "none" }}>
                        {["Backlog","To Do","In Progress","Done"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{t("field_priority")}</label>
                      <select value={newIssueDraft.priority} onChange={e => setNewIssueDraft(p => ({...p, priority: e.target.value}))} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: COLORS.text, background: COLORS.bg, outline: "none" }}>
                        {["High","Medium","Low"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{t("field_assignee")}</label>
                      <select value={newIssueDraft.assignees[0] || ""} onChange={e => setNewIssueDraft(p => ({...p, assignees: [e.target.value]}))} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: COLORS.text, background: COLORS.bg, outline: "none" }}>
                        {members.map(m => <option key={m.initials} value={m.initials}>{m.name} ({m.initials})</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{t("field_estimate")}</label>
                      <input type="number" min="1" max="21" value={newIssueDraft.points} onChange={e => setNewIssueDraft(p => ({...p, points: Number(e.target.value)}))} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: COLORS.text, background: COLORS.bg, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                  {/* Due Date */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{t("field_duedate")}</label>
                    <input type="date" value={newIssueDraft.deadline} onChange={e => setNewIssueDraft(p => ({...p, deadline: e.target.value}))} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: COLORS.text, background: COLORS.bg, outline: "none", boxSizing: "border-box" }} />
                  </div>

                  {/* ── Subtasks ── */}
                  <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>{t("field_subtasks")}</label>
                    {/* Existing draft subtasks */}
                    {newIssueDraft.subtasks.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                        {newIssueDraft.subtasks.map((st, i) => (
                          <div key={st.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                            <div style={{ flex: 1, fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{st.text}</div>
                            {st.deadline && <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "var(--font-mono)" }}>{st.deadline}</div>}
                            {st.assignee && <div style={{ fontSize: 11, background: COLORS.bgAlt, padding: "2px 6px", borderRadius: 4, color: COLORS.textMuted, fontWeight: 600 }}>{st.assignee}</div>}
                            <button onClick={() => setNewIssueDraft(p => ({ ...p, subtasks: p.subtasks.filter((_, j) => j !== i) }))} style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.textDim, fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0 }}>&times;</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Add subtask row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 36px", gap: 8, alignItems: "center" }}>
                      <input
                        value={newDraftSubtask.text}
                        onChange={e => setNewDraftSubtask(p => ({...p, text: e.target.value}))}
                        placeholder={t("field_subtask_placeholder")}
                        onKeyDown={e => {
                          if (e.key === "Enter" && newDraftSubtask.text.trim()) {
                            setNewIssueDraft(p => ({ ...p, subtasks: [...p.subtasks, { id: Math.random().toString(36).substr(2,6), text: newDraftSubtask.text.trim(), deadline: newDraftSubtask.deadline, assignee: newDraftSubtask.assignee, done: false }] }));
                            setNewDraftSubtask({ text: "", deadline: "", assignee: "MC" });
                          }
                        }}
                        style={{ padding: "7px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 13, fontFamily: "inherit", color: COLORS.text, background: COLORS.bg, outline: "none" }}
                        onFocus={e => e.target.style.borderColor = COLORS.text} onBlur={e => e.target.style.borderColor = COLORS.border}
                      />
                      <input
                        type="date"
                        value={newDraftSubtask.deadline}
                        onChange={e => setNewDraftSubtask(p => ({...p, deadline: e.target.value}))}
                        style={{ padding: "7px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 12, fontFamily: "inherit", color: COLORS.text, background: COLORS.bg, outline: "none" }}
                      />
                      <select
                        value={newDraftSubtask.assignee}
                        onChange={e => setNewDraftSubtask(p => ({...p, assignee: e.target.value}))}
                        style={{ padding: "7px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 12, fontFamily: "inherit", color: COLORS.text, background: COLORS.bg, outline: "none" }}
                      >
                        {members.map(m => <option key={m.initials} value={m.initials}>{m.initials}</option>)}
                      </select>
                      <button
                        onClick={() => {
                          if (!newDraftSubtask.text.trim()) return;
                          setNewIssueDraft(p => ({ ...p, subtasks: [...p.subtasks, { id: Math.random().toString(36).substr(2,6), text: newDraftSubtask.text.trim(), deadline: newDraftSubtask.deadline, assignee: newDraftSubtask.assignee, done: false }] }));
                          setNewDraftSubtask({ text: "", deadline: "", assignee: "MC" });
                        }}
                        style={{ width: 36, height: 36, border: `1px solid ${COLORS.border}`, borderRadius: 7, background: COLORS.text, color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1 }}
                      >+</button>
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 6 }}>{t("subtask_hint")}</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button onClick={() => { setShowNewIssue(false); setModalOffset({ x: 0, y: 0 }); }} style={{ flex: 1, padding: "10px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: "transparent", color: COLORS.textMuted, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>{t("btn_cancel")}</button>
                    <button onClick={createNewIssue} disabled={!newIssueDraft.title.trim()} style={{ flex: 2, padding: "10px", border: "none", borderRadius: 8, background: newIssueDraft.title.trim() ? COLORS.text : COLORS.textDim, color: "#fff", fontSize: 14, fontWeight: 600, cursor: newIssueDraft.title.trim() ? "pointer" : "not-allowed", boxShadow: newIssueDraft.title.trim() ? "0 4px 12px rgba(0,0,0,0.15)" : "none" }}>{t("btn_create_issue")}</button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Task Detail Panel (fully editable) ── */}
        <AnimatePresence>
          {selectedTask && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedTask(null)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)", zIndex: 100 }} />
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, background: COLORS.surfaceSolid, borderLeft: `1px solid ${COLORS.border}`, zIndex: 101, display: "flex", flexDirection: "column", boxShadow: "-20px 0 40px rgba(0,0,0,0.1)" }}
              >
                {/* Panel Header */}
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.bg, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: COLORS.textMuted, background: COLORS.surfaceSolid, padding: "2px 8px", borderRadius: 4, border: `1px solid ${COLORS.border}` }}>{selectedTask.id}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>{t("panel_in")} <b style={{ color: COLORS.text }}>{selectedTask.sprint}</b></div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => syncTaskToGitHub(selectedTask)} disabled={githubSyncMap[selectedTask.id] === "syncing"}
                      style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6, cursor: "pointer", padding: "4px 10px", color: githubSyncMap[selectedTask.id] === "synced" ? "#22C55E" : githubSyncMap[selectedTask.id] === "error" ? COLORS.red : COLORS.textMuted, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, transition: "0.2s" }}>
                      {githubSyncMap[selectedTask.id] === "syncing" ? <><Icons.Refresh /> Syncing...</> : githubSyncMap[selectedTask.id] === "synced" ? <><Icons.Check /> Synced</> : githubSyncMap[selectedTask.id] === "error" ? "⚠ Erro" : <><Icons.Github /> GitHub</>}
                    </button>
                    <button onClick={() => setSelectedTask(null)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 20, color: COLORS.textMuted, lineHeight: 1 }}>&times;</button>
                  </div>
                </div>

                {/* Scrollable Body */}
                <div style={{ padding: "24px 28px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
                  {/* Title — clearly labelled + editable */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{t("panel_title_label")}</div>
                    <textarea
                      value={selectedTask.title}
                      onChange={e => updateTask(selectedTask.id, "title", e.target.value)}
                      rows={2}
                      placeholder={t("panel_title_placeholder")}
                      style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: 8, outline: "none", resize: "none", background: COLORS.bg, fontFamily: "inherit", width: "100%", lineHeight: 1.35, padding: "10px 12px", boxSizing: "border-box", transition: "border-color 0.2s" }}
                      onFocus={e => e.target.style.borderColor = COLORS.text}
                      onBlur={e => e.target.style.borderColor = COLORS.border}
                    />
                  </div>

                  {/* Meta Fields Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", rowGap: 14, fontSize: 13 }}>
                    {/* Assignee */}
                    <div style={{ color: COLORS.textMuted, display: "flex", alignItems: "center", fontSize: 12 }}>{t("field_assignee")}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", position: "relative" }}>
                      {(selectedTask.assignees || []).map(a => {
                        const member = members.find(m => m.initials === a);
                        return (
                          <div key={a} style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.bgAlt, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "3px 8px" }}>
                            <div style={{ width: 18, height: 18, borderRadius: "50%", background: COLORS.text, color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{a}</div>
                            <span style={{ fontSize: 12, color: COLORS.text }}>{member?.name || a}</span>
                            {member?.email && <span style={{ fontSize: 10, color: COLORS.textDim }}>{member.email}</span>}
                            <button onClick={() => updateTask(selectedTask.id, "assignees", (selectedTask.assignees || []).filter(x => x !== a))}
                              style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.textDim, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                          </div>
                        );
                      })}
                      {/* Custom +Add popover */}
                      {members.filter(m => !(selectedTask.assignees || []).includes(m.initials)).length > 0 && (
                        <div style={{ position: "relative" }}>
                          <button
                            onClick={() => setShowAddMember(v => !v)}
                            style={{ border: `1px dashed ${showAddMember ? COLORS.text : COLORS.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, background: showAddMember ? COLORS.bgAlt : "transparent", color: COLORS.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "0.15s", fontFamily: "inherit" }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add
                          </button>
                          {showAddMember && (
                            <>
                              <div onClick={() => setShowAddMember(false)} style={{ position: "fixed", inset: 0, zIndex: 200 }} />
                              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: COLORS.surfaceSolid, border: `1px solid ${COLORS.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 201, minWidth: 220, overflow: "hidden" }}>
                                <div style={{ padding: "8px 12px 6px", fontSize: 10, fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("panel_add_assignee")}</div>
                                {members.filter(m => !(selectedTask.assignees || []).includes(m.initials)).map(m => (
                                  <div key={m.initials}
                                    onClick={() => { updateTask(selectedTask.id, "assignees", [...(selectedTask.assignees || []), m.initials]); setShowAddMember(false); }}
                                    style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "0.15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = COLORS.bgAlt}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                  >
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.text, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.initials}</div>
                                    <div>
                                      <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text }}>{m.name}</div>
                                      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{m.email}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div style={{ color: COLORS.textMuted, display: "flex", alignItems: "center", fontSize: 12 }}>Status</div>
                    <div>
                      <select value={selectedTask.status} onChange={e => updateTask(selectedTask.id, "status", e.target.value)}
                        style={{ display: "inline-flex", alignItems: "center", padding: "5px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 12, fontWeight: 500, color: COLORS.text, background: COLORS.bg, cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                        {["Backlog","To Do","In Progress","Done"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Priority */}
                    <div style={{ color: COLORS.textMuted, display: "flex", alignItems: "center", fontSize: 12 }}>{t("field_priority")}</div>
                    <div>
                      <select value={selectedTask.priority} onChange={e => updateTask(selectedTask.id, "priority", e.target.value)}
                        style={{ display: "inline-flex", alignItems: "center", padding: "5px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 12, fontWeight: 500, color: COLORS.text, background: COLORS.bg, cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                        {["High","Medium","Low"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Estimate */}
                    <div style={{ color: COLORS.textMuted, display: "flex", alignItems: "center", fontSize: 12 }}>{t("field_estimate")}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="number" min="1" max="21" value={selectedTask.points || 1} onChange={e => updateTask(selectedTask.id, "points", Number(e.target.value))}
                        style={{ width: 56, padding: "5px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 12, fontFamily: "var(--font-mono)", color: COLORS.text, background: COLORS.bg, outline: "none", textAlign: "center" }} />
                      <span style={{ fontSize: 12, color: COLORS.textMuted }}>{t("pts_suffix")}</span>
                    </div>

                    {/* Due Date */}
                    <div style={{ color: COLORS.textMuted, display: "flex", alignItems: "center", fontSize: 12 }}>{t("field_duedate")}</div>
                    <div>
                      <input type="date" value={selectedTask.deadline && selectedTask.deadline.includes("-") ? selectedTask.deadline : ""} onChange={e => updateTask(selectedTask.id, "deadline", e.target.value)}
                        style={{ padding: "5px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 12, color: COLORS.text, background: COLORS.bg, outline: "none", fontFamily: "inherit" }} />
                    </div>
                  </div>

                  <div style={{ height: 1, background: COLORS.border, margin: "0 -28px" }} />

                  {/* Description */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{t("panel_description")}</div>
                    <textarea
                      value={selectedTask.desc || ""}
                      onChange={e => updateTask(selectedTask.id, "desc", e.target.value)}
                      placeholder={t("panel_desc_placeholder")}
                      rows={4}
                      style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, lineHeight: 1.6, color: COLORS.text, background: COLORS.bg, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = COLORS.text}
                      onBlur={e => e.target.style.borderColor = COLORS.border}
                    />
                  </div>

                  {/* Subtasks */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {t("panel_subtasks")} {getSubtasks(selectedTask).length > 0 && `(${getSubtasks(selectedTask).filter(s=>s.done).length}/${getSubtasks(selectedTask).length})`}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {getSubtasks(selectedTask).map((sub) => (
                        <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 6, background: COLORS.bgAlt, border: `1px solid ${COLORS.border}` }}>
                          <input type="checkbox" checked={sub.done} onChange={() => toggleSubtask(selectedTask.id, sub.id)}
                            style={{ width: 15, height: 15, accentColor: COLORS.text, cursor: "pointer", flexShrink: 0 }} />
                          <input
                            value={sub.text}
                            onChange={e => {
                              const subs = getSubtasks(selectedTask).map(s => s.id === sub.id ? {...s, text: e.target.value} : s);
                              updateTask(selectedTask.id, "subtasks", subs);
                            }}
                            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: sub.done ? COLORS.textDim : COLORS.text, textDecoration: sub.done ? "line-through" : "none", fontFamily: "inherit" }}
                          />
                          <button onClick={() => removeSubtask(selectedTask.id, sub.id)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.textDim, fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
                        </div>
                      ))}
                      {/* Add subtask input */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <input
                          value={newSubtaskText}
                          onChange={e => setNewSubtaskText(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { addSubtask(selectedTask.id, newSubtaskText); setNewSubtaskText(""); } }}
                          placeholder={t("panel_subtask_placeholder")}
                          style={{ flex: 1, padding: "8px 10px", border: `1px dashed ${COLORS.border}`, borderRadius: 6, fontSize: 13, background: "transparent", color: COLORS.text, outline: "none", fontFamily: "inherit" }}
                          onFocus={e => e.target.style.borderColor = COLORS.textDim}
                          onBlur={e => e.target.style.borderColor = COLORS.border}
                        />
                        {newSubtaskText && (
                          <button onClick={() => { addSubtask(selectedTask.id, newSubtaskText); setNewSubtaskText(""); }}
                            style={{ padding: "8px 12px", background: COLORS.text, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>{t("panel_add_btn")}</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderHome = () => (
    <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 60, height: "100%" }}>
      {/* Hero Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16, marginTop: 20 }}>
        <EditableText 
          path="home.heroTitle" 
          as="h1" 
          style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.04em", color: COLORS.text, margin: 0 }} 
        />
        <EditableText 
          path="home.heroDesc" 
          as="p" 
          style={{ fontSize: 18, color: COLORS.textMuted, lineHeight: 1.6, maxWidth: 800, margin: 0 }} 
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
        
        {/* Bento Grid Navegacao */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {data.home.cards.map((card, idx) => {
            const navMap = {
              core_proposta:   { main: "core",    sub: "proposta",  icon: Icons.Play },
              core_bmc:        { main: "core",    sub: "bmc",       icon: Icons.System },
              sprints_board:   { main: "sprints", sub: "board",     icon: Icons.Sprints },
              growth_partners: { main: "growth",  sub: "partners",  icon: Icons.Growth },
              core_diferencial:{ main: "core",    sub: "diferencial",icon: Icons.Book },
              tech_archi:      { main: "tech",    sub: null,        icon: Icons.Tech },
            };
            const nav = navMap[card.id] || { main: "home", sub: null, icon: Icons.System };
            const Icon = nav.icon;
            return (
            <motion.div 
              key={card.id}
              onClick={(e) => { 
                if (isEditMode) e.stopPropagation();
                else { setActiveMain(nav.main); setActiveSub(nav.sub); }
              }}
              className="bento-card"
              style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, background: COLORS.surfaceSolid, height: "100%", cursor: isEditMode ? 'default' : 'pointer' }}
              whileHover={{ y: isEditMode ? 0 : -4, borderColor: isEditMode ? COLORS.border : COLORS.textDim }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.bg, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.text, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Icon />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <EditableText path={`home.cards.${idx}.title`} as="h3" style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, letterSpacing: "-0.01em", margin: 0 }} />
                <EditableText path={`home.cards.${idx}.desc`} as="p" style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.5, margin: 0 }} />
              </div>
              <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", alignItems: "center", color: COLORS.textDim, fontSize: 13, fontWeight: 500, fontFamily: "var(--font-mono)" }}>
                {t("nav_access")} <span style={{ marginLeft: 6 }}><Icons.ArrowRight /></span>
              </div>
            </motion.div>
          )})}
        </div>

        {/* Status Widget Lateral */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Google Calendar Widget */}
          <div className="bento-card" style={{ padding: 24, background: "#FFF", display: "flex", flexDirection: "column", gap: 16, cursor: "default" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", color: COLORS.textMuted, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                <Icons.GoogleCal /> Google Calendar
              </div>
              {calConnected && (
                <button onClick={() => fetchCalendarEvents()} style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.textDim, display: "flex", alignItems: "center", padding: 2 }} title="Atualizar">
                  <Icons.Refresh />
                </button>
              )}
            </div>

            {!import.meta.env.VITE_GOOGLE_CLIENT_ID || !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes(".apps.googleusercontent.com") ? (
              <div style={{ fontSize: 12, color: COLORS.textMuted, padding: "8px 12px", background: COLORS.bgAlt, borderRadius: 6, lineHeight: 1.5 }}>
                Adicione <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>VITE_GOOGLE_CLIENT_ID</code> no <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>.env</code> e reinicie o servidor.
              </div>
            ) : !calConnected ? (
              <>
                <button
                  onClick={connectGoogleCalendar}
                  disabled={!gsiReady}
                  style={{ width: "100%", padding: "10px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: "#FFF", cursor: gsiReady ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 500, color: gsiReady ? COLORS.text : COLORS.textMuted, transition: "0.2s", opacity: gsiReady ? 1 : 0.6 }}
                  onMouseEnter={e => { if (gsiReady) e.currentTarget.style.borderColor = COLORS.textDim; }}
                  onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
                >
                  <Icons.GoogleCal /> {gsiReady ? t("cal_connect") : t("loading_sdk")}
                </button>
                {calError && <div style={{ fontSize: 11, color: COLORS.red, lineHeight: 1.5, marginTop: -8 }}>{calError}</div>}
              </>
            ) : calLoading ? (
              <div style={{ fontSize: 13, color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 8 }}>
                <Icons.Refresh /> {t("cal_loading")}
              </div>
            ) : calError ? (
              <div style={{ fontSize: 12, color: COLORS.red, lineHeight: 1.5, padding: "8px 12px", background: "rgba(220,0,0,0.04)", borderRadius: 6, border: "1px solid rgba(220,0,0,0.12)" }}>
                {calError}
                {calError.includes("expirada") && (
                  <button onClick={connectGoogleCalendar} style={{ display: "block", marginTop: 8, background: "transparent", border: "none", color: COLORS.highlight, cursor: "pointer", fontSize: 12, padding: 0, fontWeight: 500 }}>{t("cal_reconnect")}</button>
                )}
              </div>
            ) : calEvents.length === 0 ? (
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>{t("cal_no_events")}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {calEvents.slice(0, 3).map((event, i) => {
                  const meetLink = getMeetLink(event);
                  const isNext = i === 0;
                  return (
                    <div key={event.id || i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 8, background: isNext ? "rgba(0,102,255,0.04)" : "transparent", border: `1px solid ${isNext ? "rgba(0,102,255,0.12)" : COLORS.border}`, transition: "0.2s" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: isNext ? "#EF4444" : COLORS.textDim, marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{event.summary}</div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted }}>{formatCalTime(event)}</div>
                        {meetLink && (
                          <a href={meetLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: COLORS.highlight, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3, marginTop: 4, fontWeight: 500 }}>
                            {t("cal_meet_link")} <Icons.ExternalLink />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Milestone (fallback when Calendar not connected) */}
          {!calConnected && (
          <div className="bento-card" style={{ padding: 24, background: "#FFF", display: "flex", flexDirection: "column", gap: 16, cursor: "default" }}>
            <EditableText path="home.milestone.title" as="div" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", color: COLORS.textMuted, textTransform: "uppercase" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(0,102,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.highlight, border: `1px solid rgba(0,102,255,0.15)` }}>
                <Icons.Calendar />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <EditableText path="home.milestone.event" as="div" style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }} />
                <EditableText path="home.milestone.time" as="div" style={{ fontSize: 13, color: COLORS.textMuted }} />
              </div>
            </div>
          </div>
          )}

          {/* Sprint Progress */}
          <div className="bento-card" style={{ padding: 24, background: "#FFF", display: "flex", flexDirection: "column", gap: 16, cursor: "default" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", color: COLORS.textMuted, textTransform: "uppercase" }}>{t("cal_sprint_progress")}</div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: COLORS.text }}>45%</div>
            </div>
            <div style={{ width: "100%", height: 6, background: COLORS.bg, borderRadius: 3, overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: "45%" }} transition={{ duration: 1, delay: 0.2 }} style={{ height: "100%", background: COLORS.text }} />
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}><b>Sprint 01</b> - Modelagem (Em progresso)</div>
          </div>

          {/* Lead Counter */}
          <div className="bento-card" style={{ padding: 24, background: COLORS.slate, color: "#FFF", display: "flex", flexDirection: "column", gap: 16, cursor: "default", boxShadow: "0 12px 24px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green || "#22C55E" }} />
              {t("cal_telemetry")}
            </div>
            <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.04em", fontFamily: "var(--font-mono)" }}>142</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>Talentos mapeados e injetados em database. Pronto para simulação.</div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div style={{ marginTop: "auto", paddingTop: 32, borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: COLORS.textMuted }}>{t("footer_hint")}</div>
        <div style={{ display: "flex", gap: 24 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: COLORS.textDim, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.color = COLORS.text} onMouseLeave={e => e.currentTarget.style.color = COLORS.textDim}>
            <Icons.Book /> {t("nav_gitbook")}
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: COLORS.textDim, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.color = COLORS.text} onMouseLeave={e => e.currentTarget.style.color = COLORS.textDim}>
            <Icons.Github /> {t("nav_github")}
          </button>
        </div>
      </div>

    </motion.div>
  );

  return (
    <>
      <EditModeFAB />
      <style>{css}</style>
      <div className="mesh-bg" />
      <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
        <header className="glass-nav" style={{ position: "sticky", top: 0, zIndex: 50, padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 28, height: 28, background: COLORS.text, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontWeight: 700, fontSize: 14 }}>S</div>
            <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>ServLink WorkOS</div>
            <div style={{ width: 1, height: 16, background: COLORS.border, marginLeft: 8 }} />
            <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
              <NavTab id="home" label={t("nav_home")} icon={Icons.Home} active={activeMain === "home"} set={(id) => { setActiveMain(id); setActiveSub(null); }} />
              <NavTab id="core" label={t("nav_core")} icon={Icons.System} active={activeMain === "core"} set={(id) => { setActiveMain(id); setActiveSub("bmc"); }} />
              <NavTab id="growth" label={t("nav_growth")} icon={Icons.Growth} active={activeMain === "growth"} set={(id) => { setActiveMain(id); setActiveSub("branding"); }} />

              <div style={{ width: 1, height: 16, background: COLORS.border, margin: "0 8px" }} />
              <NavTab id="sprints" label={t("nav_sprints")} icon={Icons.Sprints} active={activeMain === "sprints"} set={(id) => { setActiveMain(id); setActiveSub("board"); }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <SyncIndicator />
            <button
              onClick={toggleLang}
              style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)", color: COLORS.textMuted, cursor: "pointer", letterSpacing: "0.04em", transition: "0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = COLORS.text; e.currentTarget.style.borderColor = COLORS.textDim; }}
              onMouseLeave={e => { e.currentTarget.style.color = COLORS.textMuted; e.currentTarget.style.borderColor = COLORS.border; }}
              title={lang === "pt" ? "Mudar para English" : "Switch to Português"}
            >{lang.toUpperCase()}</button>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>PMI 2026.1</div>
            {googleUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px", borderRadius: 20, border: `1px solid ${COLORS.border}`, background: COLORS.surface }}>
                {googleUser.picture
                  ? <img src={googleUser.picture} alt="" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} />
                  : <div style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS.highlight, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{googleUser.initials}</div>
                }
                <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.text }}>{googleUser.name?.split(" ")[0]}</span>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                disabled={!gsiReady}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 20, background: "#FFF", cursor: gsiReady ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 500, color: COLORS.text, opacity: gsiReady ? 1 : 0.5, transition: "0.2s" }}
                onMouseEnter={e => { if (gsiReady) e.currentTarget.style.borderColor = COLORS.textMuted; }}
                onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
              >
                <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                {gsiReady ? t("sign_in_google") : t("loading_sdk")}
              </button>
            )}
          </div>
        </header>

        {activeMain === "core" && (
          <div style={{ padding: "20px 40px 0", maxWidth: 1200, margin: "0 auto 16px", display: "flex", gap: 24, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: "16px", width: "100%" }}>
            {[{id: "bmc", label: t("nav_bmc")}, {id: "proposta", label: t("nav_proposta")}, {id: "diferencial", label: t("nav_diferencial")}, {id: "pitch", label: t("nav_pitch")}].map(tab => (
              <div key={tab.id} onClick={() => setActiveSub(tab.id)} style={{ fontSize: 13, fontWeight: activeSub === tab.id ? 600 : 500, color: activeSub === tab.id ? COLORS.text : COLORS.textMuted, cursor: "pointer", position: "relative" }}>
                {tab.label}
                {activeSub === tab.id && <div style={{ position: "absolute", bottom: -17, left: 0, right: 0, height: 2, background: COLORS.text }} />}
              </div>
            ))}
          </div>
        )}

        {activeMain === "growth" && (
          <div style={{ padding: "20px 40px 0", maxWidth: 1200, margin: "0 auto 16px", display: "flex", gap: 24, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: "16px", width: "100%" }}>
            {[
              {id: "branding", label: t("nav_branding")},
              {id: "roi", label: t("nav_roi")},
              {id: "blog", label: t("nav_blog")},
              {id: "partners", label: t("nav_partners")}
            ].map(tab => (
              <div key={tab.id} onClick={() => setActiveSub(tab.id)} style={{ fontSize: 13, fontWeight: activeSub === tab.id ? 600 : 500, color: activeSub === tab.id ? COLORS.text : COLORS.textMuted, cursor: "pointer", position: "relative" }}>
                {tab.label}
                {activeSub === tab.id && <div style={{ position: "absolute", bottom: -17, left: 0, right: 0, height: 2, background: COLORS.text }} />}
              </div>
            ))}
          </div>
        )}

        {activeMain === "sprints" && (
          <div style={{ padding: "20px 40px 0", maxWidth: 1200, margin: "0 auto 16px", display: "flex", gap: 24, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: "16px", width: "100%" }}>
            {[{id: "board", label: t("nav_sprints")}].map(tab => (
              <div key={tab.id} onClick={() => setActiveSub(tab.id)} style={{ fontSize: 13, fontWeight: activeSub === tab.id ? 600 : 500, color: activeSub === tab.id ? COLORS.text : COLORS.textMuted, cursor: "pointer", position: "relative" }}>
                {tab.label}
                {activeSub === tab.id && <div style={{ position: "absolute", bottom: -17, left: 0, right: 0, height: 2, background: COLORS.text }} />}
              </div>
            ))}
          </div>
        )}

        <main style={{ flex: 1, padding: "40px 60px", maxWidth: 1200, width: "100%", margin: "0 auto" }}>
          <AnimatePresence mode="wait">
            {activeMain === "home" ? renderHome() : null}
            {activeMain === "core" && activeSub === "bmc" ? renderCoreBMC() : null}
            {activeMain === "core" && activeSub === "proposta" ? renderCoreProposta() : null}
            {activeMain === "core" && activeSub === "diferencial" ? renderCoreDiferencial() : null}
            {activeMain === "core" && activeSub === "pitch" ? renderCorePitch() : null}
            
            {activeMain === "growth" && activeSub === "branding" ? renderGrowthBranding() : null}
            {activeMain === "growth" && activeSub === "roi" ? renderGrowthROI() : null}
            {activeMain === "growth" && activeSub === "blog" ? renderGrowthBlog() : null}
            {activeMain === "growth" && activeSub === "partners" ? renderGrowthPartners() : null}

            {activeMain === "tech" ? renderArchitecture() : null}
            {activeMain === "sprints" ? renderSprintsBoard() : null}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}