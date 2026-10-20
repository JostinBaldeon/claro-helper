import { expect, test } from "bun:test";
import { exportCsv, filterHistory, localDateKey, personalMetrics, type HistoryEntry } from "./history";
import { EXAMPLE_TICKET, parseTicket } from "./ticket-parser";

const today = localDateKey(new Date(2026, 9, 20));
function entry(id: string, day: number, adp = "Jesus Cerna", templateId = "confirma-visita", sot = "91835706"): HistoryEntry {
  return { id, fecha: new Date(2026, 9, day, 10).toISOString(), adp, templateId, sot, caso: "GENERAL", estado: templateId, respuesta: "Respuesta", cliente: "Cliente prueba" };
}
const rows = [entry("1", 20), entry("2", 20, "Jesus Cerna", "ciclo-llamadas"), entry("3", 19), entry("4", 20, "Paul Carrasco")];

test("Daily personal history excludes yesterday and other advisors", () => {
  expect(filterHistory(rows, { date: today, adp: "Jesus Cerna" }).map(e => e.id).sort()).toEqual(["1", "2"]);
});
test("History supports case, state, search, and advisor filters", () => {
  expect(filterHistory(rows, { date: today, adp: "ALL", query: "cliente prueba", caso: "GENERAL", estado: "ciclo-llamadas" }).map(e => e.id)).toEqual(["2"]);
  expect(filterHistory(rows, { date: today, adp: "ALL", query: "not found" })).toHaveLength(0);
});
test("Personal metrics count saved work and unique SOTs, not other advisors", () => {
  expect(personalMetrics(rows, "Jesus Cerna", today)).toMatchObject({ total: 2, unique: 1, confirmations: 1, calls: 1, rejections: 0, rescues: 0, difference: 1 });
});
test("Rejections and rescues are measured from the saved template", () => {
  const metrics = personalMetrics([entry("r", 20, "Jesus Cerna", "rech-fraude-mesa"), entry("s", 20, "Jesus Cerna", "rescate-comercial")], "Jesus Cerna", today);
  expect(metrics.rejections).toBe(1);
  expect(metrics.rescues).toBe(1);
  expect(metrics.confirmations).toBe(1);
});
test("Unattributed history is visible without crediting the active advisor", () => {
  const unknown = { ...entry("old", 20), adp: undefined };
  expect(filterHistory([unknown], { date: today, adp: "UNKNOWN" })).toHaveLength(1);
  expect(personalMetrics([unknown], "Jesus Cerna", today).total).toBe(0);
});
test("Ticket parsing and CSV export no longer contain priority", () => {
  expect(parseTicket(EXAMPLE_TICKET)).not.toHaveProperty("prioridad");
  expect(parseTicket("SOT: 91835706 urgente")).not.toHaveProperty("prioridad");
  expect(exportCsv(rows).split("\n")[0]).toBe("fecha,sot,caso,estado,cliente,adp,respuesta");
});