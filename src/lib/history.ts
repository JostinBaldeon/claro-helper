import type { CaseType } from "./ticket-parser";

export interface HistoryEntry {
  id: string;
  fecha: string; // ISO
  sot: string;
  caso: CaseType;
  estado: string;
  respuesta: string;
  cliente?: string;
  adp?: string;
  templateId?: string;
}

const KEY = "helpdesk_claro_history_v1";

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e) => e && typeof e.id === "string" && typeof e.fecha === "string" && typeof e.sot === "string" && typeof e.respuesta === "string").map((e) => ({
      id: e.id, fecha: e.fecha, sot: e.sot, caso: e.caso,
      estado: e.estado ?? "", respuesta: e.respuesta, cliente: e.cliente,
      adp: e.adp || e.respuesta.match(/REALIZADO POR:\s*([^\n]+?)(?:\s+-\s+ADP MULTISKILL HITSS)?\s*(?:\n|$)/)?.[1]?.trim(),
      templateId: e.templateId,
    }));
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(entries));
}

export function exportCsv(entries: HistoryEntry[]): string {
  const header = ["fecha", "sot", "caso", "estado", "cliente", "adp", "respuesta"];
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = entries.map((e) =>
    [e.fecha, e.sot, e.caso, e.estado, e.cliente ?? "", e.adp ?? "", e.respuesta]
      .map((v) => escape(String(v)))
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export interface HistoryFilters {
  date: string;
  adp: string;
  query?: string;
  caso?: string;
  estado?: string;
}

export function filterHistory(entries: HistoryEntry[], filters: HistoryFilters): HistoryEntry[] {
  const query = filters.query?.trim().toLocaleLowerCase() ?? "";
  return entries.filter(e =>
    localDateKey(new Date(e.fecha)) === filters.date &&
    (filters.adp === "ALL" || (filters.adp === "UNKNOWN" ? !e.adp : e.adp === filters.adp)) &&
    (!filters.caso || filters.caso === "ALL" || e.caso === filters.caso) &&
    (!filters.estado || filters.estado === "ALL" || e.estado === filters.estado) &&
    (!query || [e.sot, e.cliente, e.estado, e.adp].some(v => v?.toLocaleLowerCase().includes(query)))
  ).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export function personalMetrics(entries: HistoryEntry[], adp: string, date: string) {
  const today = filterHistory(entries, { date, adp });
  const previous = new Date(`${date}T12:00:00`);
  previous.setDate(previous.getDate() - 1);
  const yesterday = filterHistory(entries, { date: localDateKey(previous), adp });
  const count = (ids: string[], pattern: RegExp) => today.filter(e => e.templateId ? ids.includes(e.templateId) : pattern.test(e.estado)).length;
  return {
    total: today.length,
    unique: new Set(today.filter(e => e.sot !== "S/N" && e.sot.trim()).map(e => e.sot)).size,
    confirmations: count(["confirma-visita", "adelanto-visita", "mantiene-fecha", "rescate-comercial"], /confirma visita|adelanto de visita|mantiene fecha/i),
    rejections: today.filter(e => e.templateId ? e.templateId.startsWith("rech-") : /^Rechazo:/i.test(e.estado)).length,
    calls: count(["ciclo-llamadas"], /^Ciclo de llamadas/i),
    rescues: count(["rescate-comercial"], /^Rescate comercial/i),
    difference: today.length - yesterday.length,
    last: today[0]?.fecha,
  };
}
