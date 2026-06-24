import type { CaseType, Priority } from "./ticket-parser";

export interface HistoryEntry {
  id: string;
  fecha: string; // ISO
  sot: string;
  caso: CaseType;
  prioridad: Priority;
  estado: string;
  respuesta: string;
  cliente?: string;
}

const KEY = "helpdesk_claro_history_v1";

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(entries));
}

export function exportCsv(entries: HistoryEntry[]): string {
  const header = ["fecha", "sot", "caso", "prioridad", "estado", "cliente", "respuesta"];
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = entries.map((e) =>
    [e.fecha, e.sot, e.caso, e.prioridad, e.estado, e.cliente ?? "", e.respuesta]
      .map((v) => escape(String(v)))
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
