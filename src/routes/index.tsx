import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ClipboardCopy,
  Download,
  Eraser,
  FileText,
  History,
  RefreshCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  CASE_LABEL,
  EXAMPLE_TICKET,
  emptySga,
  emptyToa,
  generateResponse,
  parseTicket,
  type CaseType,
  type Destino,
  type Franja,
  type ParsedTicket,
  type Priority,
  type SgaChecks,
  type Tono,
  type ToaChecks,
} from "@/lib/ticket-parser";
import { exportCsv, loadHistory, saveHistory, type HistoryEntry } from "@/lib/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Asistente Help Desk Claro · Instalaciones" },
      {
        name: "description",
        content:
          "Panel local para acelerar la atención de tickets de instalación de internet recibidos por WhatsApp. Extrae datos, clasifica el caso y genera respuesta lista para copiar.",
      },
    ],
  }),
  component: Dashboard,
});

const TOA_LABELS: { key: keyof ToaChecks; label: string }[] = [
  { key: "estadoAgenda", label: "Estado en agenda" },
  { key: "estadoCancelado", label: "Cancelado" },
  { key: "estadoReagendado", label: "Reagendado" },
  { key: "estadoPendiente", label: "Pendiente" },
  { key: "estadoEjecucion", label: "En ejecución" },
  { key: "clienteConfProgramacion", label: "Cliente confirmado programación" },
  { key: "clienteConfSeguimiento", label: "Cliente confirmado seguimiento" },
  { key: "clienteNoContactado", label: "Cliente no contactado" },
  { key: "clienteRecuperado", label: "Cliente recuperado" },
  { key: "alertaReagendamiento", label: "Alerta de reagendamiento" },
  { key: "franjaVigente", label: "Franja vigente" },
  { key: "franjaVencida", label: "Franja vencida" },
  { key: "tieneTecnico", label: "Tiene técnico/cuadrilla" },
  { key: "sinTecnico", label: "Sin técnico/cuadrilla" },
  { key: "requiereEscalamiento", label: "Requiere escalamiento" },
  { key: "observacionRegistrada", label: "Obs. de seguimiento" },
  { key: "fueraDeTOA", label: "Fuera de TOA" },
  { key: "adelantoContratista", label: "Adelanto contratista" },
  { key: "retornoCampo", label: "Retorno a campo" },
  { key: "derivadoBuzon", label: "Derivado vía buzón" },
];

const SGA_LABELS: { key: keyof SgaChecks; label: string }[] = [
  { key: "enAgenda", label: "En agenda" },
  { key: "reagendado", label: "Reagendado" },
  { key: "cancelado", label: "Cancelado" },
  { key: "pendiente", label: "Pendiente" },
  { key: "enEjecucion", label: "En ejecución" },
  { key: "tieneCuadrilla", label: "Tiene cuadrilla" },
  { key: "sinCuadrilla", label: "No tiene cuadrilla" },
  { key: "coincideFecha", label: "Coincide fecha/franja" },
  { key: "noCoincideFecha", label: "No coincide fecha/franja" },
  { key: "historialReprogramacion", label: "Historial de reprogramación" },
  { key: "observacionContacto", label: "Observación de contacto" },
  { key: "anotacionOperativa", label: "Anotación operativa" },
  { key: "serviciosAInstalar", label: "Servicios a instalar" },
  { key: "fechaCompromisoVencida", label: "Fecha compromiso vencida" },
  { key: "fechaCompromisoVigente", label: "Fecha compromiso vigente" },
];

const PRIORITY_STYLE: Record<Priority, string> = {
  "Crítica": "bg-critical text-critical-foreground",
  "Alta": "bg-warn text-warn-foreground",
  "Media/Alta": "bg-info text-info-foreground",
  "Media": "bg-muted text-muted-foreground",
  "Baja": "bg-muted text-muted-foreground",
};

const CASE_DOT: Record<CaseType, string> = {
  INCUMPLIMIENTO: "bg-warn",
  ADELANTAR_VISITA: "bg-critical",
  MANTENER_FRANJA: "bg-success",
  COORDINACION: "bg-info",
  RESCATE_COMERCIAL: "bg-rescue",
  GENERAL: "bg-muted-foreground",
};

function emptyTicket(): ParsedTicket {
  return {
    sot: "",
    sotCandidates: [],
    cliente: "",
    dni: "",
    telefono: "",
    departamento: "",
    distrito: "",
    fechaInstalacion: "",
    franja: "",
    contrata: "",
    dac: "",
    observacion: "",
    caso: "GENERAL",
    prioridad: "Media",
    accionSugerida: "",
  };
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.error("No se pudo copiar");
  }
}

function Dashboard() {
  const [raw, setRaw] = useState("");
  const [ticket, setTicket] = useState<ParsedTicket>(emptyTicket());
  const [analyzed, setAnalyzed] = useState(false);
  const [toa, setToa] = useState<ToaChecks>(emptyToa());
  const [sga, setSga] = useState<SgaChecks>(emptySga());
  const [tono, setTono] = useState<Tono>("Formal");
  const [destino, setDestino] = useState<Destino>("Asesor comercial");
  const [respuesta, setRespuesta] = useState("");
  const [respManual, setRespManual] = useState(false);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [query, setQuery] = useState("");
  const [filtroCaso, setFiltroCaso] = useState<string>("ALL");
  const [filtroPrio, setFiltroPrio] = useState<string>("ALL");

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Regenerar respuesta automática cuando cambian checks/tono/destino/ticket (si no la editaron manualmente)
  useEffect(() => {
    if (!analyzed) return;
    if (respManual) return;
    setRespuesta(generateResponse({ ticket, toa, sga, tono, destino }));
  }, [analyzed, respManual, ticket, toa, sga, tono, destino]);

  const handleAnalyze = () => {
    if (!raw.trim()) {
      toast.error("Pega un ticket primero");
      return;
    }
    const p = parseTicket(raw);
    setTicket(p);
    setAnalyzed(true);
    setRespManual(false);
    setToa(emptyToa());
    setSga(emptySga());
    if (!p.sot) {
      toast.warning("No se detectó SOT. Ingrésala manualmente.");
    } else if (p.sotCandidates.length > 1) {
      toast.message(`Se detectaron ${p.sotCandidates.length} SOTs. Verifica la correcta.`);
    } else {
      toast.success(`Caso detectado: ${CASE_LABEL[p.caso]}`);
    }
  };

  const handleClearTicket = () => {
    setRaw("");
    setTicket(emptyTicket());
    setAnalyzed(false);
    setToa(emptyToa());
    setSga(emptySga());
    setRespuesta("");
    setRespManual(false);
  };

  const handleExample = () => {
    setRaw(EXAMPLE_TICKET);
    toast.message("Ticket de ejemplo cargado");
  };

  const handleClearAll = () => {
    if (!confirm("¿Borrar ticket actual e historial local?")) return;
    handleClearTicket();
    saveHistory([]);
    setHistory([]);
    toast.success("Datos locales eliminados");
  };

  const handleSaveHistory = () => {
    if (!analyzed) {
      toast.error("Analiza un ticket primero");
      return;
    }
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      sot: ticket.sot || "S/N",
      caso: ticket.caso,
      prioridad: ticket.prioridad,
      estado: buildEstado(toa, sga),
      respuesta,
      cliente: ticket.cliente,
    };
    const next = [entry, ...history];
    setHistory(next);
    saveHistory(next);
    toast.success("Guardado en historial");
  };

  const handleDeleteHistory = (id: string) => {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    saveHistory(next);
  };

  const handleExport = () => {
    if (!history.length) {
      toast.error("Historial vacío");
      return;
    }
    const csv = exportCsv(history);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial_helpdesk_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Métricas
  const metrics = useMemo(() => {
    const today = new Date().toDateString();
    const todays = history.filter((h) => new Date(h.fecha).toDateString() === today);
    const count = (c: CaseType) => history.filter((h) => h.caso === c).length;
    return {
      hoy: todays.length,
      incumplimientos: count("INCUMPLIMIENTO"),
      adelantos: count("ADELANTAR_VISITA"),
      reprogramaciones: count("COORDINACION"),
      rescates: count("RESCATE_COMERCIAL"),
      ahorro: history.length * 2,
    };
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      if (query && !h.sot.toLowerCase().includes(query.toLowerCase())) return false;
      if (filtroCaso !== "ALL" && h.caso !== filtroCaso) return false;
      if (filtroPrio !== "ALL" && h.prioridad !== filtroPrio) return false;
      return true;
    });
  }, [history, query, filtroCaso, filtroPrio]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b bg-background sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-critical text-critical-foreground font-bold">
              C
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Asistente Help Desk Claro
              </h1>
              <p className="text-xs text-muted-foreground">
                Instalaciones · Panel local de apoyo operativo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-success" /> Sin backend
            </Badge>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Exportar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="mr-2 h-4 w-4" /> Limpiar datos
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] space-y-4 px-6 py-5">
        <Alert className="border-warn/40 bg-warn/10">
          <AlertTriangle className="h-4 w-4 text-warn" />
          <AlertTitle className="text-sm">Aviso de privacidad</AlertTitle>
          <AlertDescription className="text-xs">
            No pegues datos sensibles si no corresponde. Esta es una herramienta
            local de apoyo operativo; no se envía información a servidores externos
            y el historial se guarda únicamente en este navegador.
          </AlertDescription>
        </Alert>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <MetricCard label="Tickets hoy" value={metrics.hoy} />
          <MetricCard label="Incumplimientos" value={metrics.incumplimientos} tone="warn" />
          <MetricCard label="Adelantos urgentes" value={metrics.adelantos} tone="critical" />
          <MetricCard label="Reprogramaciones" value={metrics.reprogramaciones} tone="info" />
          <MetricCard label="Rescates" value={metrics.rescates} tone="rescue" />
          <MetricCard label="Min. ahorrados (est.)" value={metrics.ahorro} tone="success" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Panel izquierdo */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" /> Ticket WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder="Pega aquí el ticket recibido por WhatsApp..."
                className="min-h-[260px] font-mono text-xs"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{raw.length} caracteres</span>
                {ticket.sotCandidates.length > 1 && (
                  <span className="text-warn">
                    {ticket.sotCandidates.length} SOTs detectados
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={handleAnalyze} className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" /> Analizar ticket
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={handleClearTicket}>
                    <Eraser className="mr-2 h-4 w-4" /> Limpiar
                  </Button>
                  <Button variant="secondary" onClick={handleExample}>
                    Ejemplo
                  </Button>
                </div>
              </div>

              {ticket.sotCandidates.length > 1 && (
                <div className="space-y-1 rounded-md border bg-surface-2 p-2 text-xs">
                  <p className="font-medium">Selecciona la SOT correcta:</p>
                  <div className="flex flex-wrap gap-1">
                    {ticket.sotCandidates.map((s) => (
                      <button
                        key={s}
                        onClick={() => setTicket({ ...ticket, sot: s })}
                        className={`rounded-md border px-2 py-1 ${
                          ticket.sot === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel central */}
          <div className="space-y-4 lg:col-span-6">
            {/* Datos detectados */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className={`h-2.5 w-2.5 rounded-full ${CASE_DOT[ticket.caso]}`} />
                  Datos detectados
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={PRIORITY_STYLE[ticket.prioridad]}>
                    {ticket.prioridad}
                  </Badge>
                  <Badge variant="outline">{CASE_LABEL[ticket.caso]}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!analyzed ? (
                  <p className="rounded-md border border-dashed bg-surface-2 py-10 text-center text-sm text-muted-foreground">
                    Analiza un ticket para ver los datos extraídos automáticamente.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <FieldRow
                      label="SOT"
                      value={ticket.sot}
                      onChange={(v) => setTicket({ ...ticket, sot: v })}
                      action={
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyText(ticket.sot || "", "SOT")}
                        >
                          <ClipboardCopy className="h-3.5 w-3.5" />
                        </Button>
                      }
                    />
                    <FieldRow
                      label="Cliente"
                      value={ticket.cliente}
                      onChange={(v) => setTicket({ ...ticket, cliente: v })}
                    />
                    <FieldRow
                      label="DNI/RUC"
                      value={ticket.dni}
                      onChange={(v) => setTicket({ ...ticket, dni: v })}
                    />
                    <FieldRow
                      label="Teléfono"
                      value={ticket.telefono}
                      onChange={(v) => setTicket({ ...ticket, telefono: v })}
                    />
                    <FieldRow
                      label="Departamento"
                      value={ticket.departamento}
                      onChange={(v) => setTicket({ ...ticket, departamento: v })}
                    />
                    <FieldRow
                      label="Distrito"
                      value={ticket.distrito}
                      onChange={(v) => setTicket({ ...ticket, distrito: v })}
                    />
                    <FieldRow
                      label="Fecha instalación"
                      value={ticket.fechaInstalacion}
                      onChange={(v) => setTicket({ ...ticket, fechaInstalacion: v })}
                    />
                    <div className="space-y-1">
                      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Franja
                      </Label>
                      <Select
                        value={ticket.franja || "NONE"}
                        onValueChange={(v) =>
                          setTicket({
                            ...ticket,
                            franja: v === "NONE" ? "" : (v as Franja),
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="No detectada" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">No detectada</SelectItem>
                          <SelectItem value="AM1">AM1 (08:00)</SelectItem>
                          <SelectItem value="AM2">AM2 (11:00)</SelectItem>
                          <SelectItem value="PM1">PM1 (14:00)</SelectItem>
                          <SelectItem value="PM2">PM2 (16:00+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FieldRow
                      label="Contrata"
                      value={ticket.contrata}
                      onChange={(v) => setTicket({ ...ticket, contrata: v })}
                    />
                    <FieldRow
                      label="DAC"
                      value={ticket.dac}
                      onChange={(v) => setTicket({ ...ticket, dac: v })}
                    />
                    <div className="col-span-2 space-y-1 md:col-span-3">
                      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Observación
                      </Label>
                      <Textarea
                        value={ticket.observacion}
                        onChange={(e) =>
                          setTicket({ ...ticket, observacion: e.target.value })
                        }
                        className="min-h-[60px] text-xs"
                      />
                    </div>
                    <div className="col-span-2 space-y-1 md:col-span-3">
                      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Acción sugerida
                      </Label>
                      <p className="rounded-md border bg-surface-2 px-3 py-2 text-sm">
                        {ticket.accionSugerida}
                      </p>
                    </div>
                  </div>
                )}
                {analyzed && !ticket.sot && (
                  <Alert className="mt-3 border-warn/40 bg-warn/10">
                    <AlertTriangle className="h-4 w-4 text-warn" />
                    <AlertDescription className="text-xs">
                      No se detectó SOT. Ingrésala manualmente en el campo correspondiente.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              {analyzed && (
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                    {(toa.estadoCancelado || sga.cancelado) && (
                      <Badge className="bg-critical text-critical-foreground">
                        ⚠ Orden cancelada
                      </Badge>
                    )}
                    {toa.franjaVencida && (
                      <Badge className="bg-warn text-warn-foreground">Franja vencida</Badge>
                    )}
                    {(toa.clienteConfProgramacion || toa.clienteConfSeguimiento) && (
                      <Badge className="bg-success text-success-foreground">
                        Cliente confirmado
                      </Badge>
                    )}
                    {(toa.sinTecnico || sga.sinCuadrilla) && (
                      <Badge className="bg-warn/80 text-warn-foreground">
                        Sin técnico/cuadrilla
                      </Badge>
                    )}
                    <div className="flex-1" />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyText(ticket.sot || "", "SOT")}
                    >
                      <ClipboardCopy className="mr-2 h-4 w-4" /> Copiar SOT
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Validación */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Validación TOA & SGA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <ChecklistBlock
                    title="TOA"
                    accent="bg-info"
                    items={TOA_LABELS}
                    state={toa}
                    onToggle={(k) =>
                      setToa({ ...toa, [k]: !toa[k as keyof ToaChecks] })
                    }
                  />
                  <ChecklistBlock
                    title="SGA"
                    accent="bg-rescue"
                    items={SGA_LABELS}
                    state={sga}
                    onToggle={(k) =>
                      setSga({ ...sga, [k]: !sga[k as keyof SgaChecks] })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel derecho */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Respuesta sugerida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Tono
                  </Label>
                  <Select value={tono} onValueChange={(v) => setTono(v as Tono)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Formal">Formal</SelectItem>
                      <SelectItem value="Corto">Corto</SelectItem>
                      <SelectItem value="Detallado">Detallado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Destino
                  </Label>
                  <Select
                    value={destino}
                    onValueChange={(v) => setDestino(v as Destino)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asesor comercial">Asesor comercial</SelectItem>
                      <SelectItem value="Mesa de seguimiento">Mesa de seguimiento</SelectItem>
                      <SelectItem value="Buzón">Buzón</SelectItem>
                      <SelectItem value="Contrata">Contrata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Textarea
                value={respuesta}
                onChange={(e) => {
                  setRespuesta(e.target.value);
                  setRespManual(true);
                }}
                placeholder="Aquí aparecerá la respuesta generada..."
                className="min-h-[260px] text-sm"
              />

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => copyText(respuesta, "Respuesta")}>
                  <ClipboardCopy className="mr-2 h-4 w-4" /> Copiar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRespManual(false);
                    setRespuesta(
                      generateResponse({ ticket, toa, sga, tono, destino }),
                    );
                    toast.success("Respuesta regenerada");
                  }}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" /> Regenerar
                </Button>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleSaveHistory}
              >
                <Save className="mr-2 h-4 w-4" /> Guardar en historial
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Historial */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" /> Historial de atención
              <span className="text-xs font-normal text-muted-foreground">
                ({history.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por SOT"
                  className="h-9 pl-7 text-sm"
                />
              </div>
              <Select value={filtroCaso} onValueChange={setFiltroCaso}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Filtrar caso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los casos</SelectItem>
                  {(Object.keys(CASE_LABEL) as CaseType[]).map((c) => (
                    <SelectItem key={c} value={c}>{CASE_LABEL[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroPrio} onValueChange={setFiltroPrio}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las prioridades</SelectItem>
                  <SelectItem value="Crítica">Crítica</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Media/Alta">Media/Alta</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Exportar CSV
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Fecha</TableHead>
                    <TableHead>SOT</TableHead>
                    <TableHead>Caso</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Sin registros guardados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(h.fecha).toLocaleString("es-PE", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{h.sot}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`h-2 w-2 rounded-full ${CASE_DOT[h.caso]}`} />
                            {CASE_LABEL[h.caso]}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={PRIORITY_STYLE[h.prioridad]}>
                            {h.prioridad}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
                          {h.estado || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyText(h.respuesta, "Respuesta")}
                          >
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteHistory(h.id)}
                          >
                            <Trash2 className="h-4 w-4 text-critical" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Separator />
        <p className="pb-6 text-center text-xs text-muted-foreground">
          Herramienta interna de apoyo · Datos almacenados solo en este navegador
        </p>
      </div>
    </div>
  );
}

function buildEstado(toa: ToaChecks, sga: SgaChecks): string {
  const tags: string[] = [];
  if (toa.estadoCancelado || sga.cancelado) tags.push("Cancelado");
  if (toa.estadoReagendado || sga.reagendado) tags.push("Reagendado");
  if (toa.estadoAgenda || sga.enAgenda) tags.push("En agenda");
  if (toa.franjaVencida) tags.push("Franja vencida");
  if (toa.franjaVigente) tags.push("Franja vigente");
  if (toa.tieneTecnico || sga.tieneCuadrilla) tags.push("Con técnico");
  if (toa.sinTecnico || sga.sinCuadrilla) tags.push("Sin técnico");
  return tags.join(" · ");
}

function FieldRow({
  label,
  value,
  onChange,
  action,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  action?: React.ReactNode;
}) {
  const detected = value && value.trim().length > 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
        <span
          className={`text-[10px] font-medium ${
            detected ? "text-success" : "text-muted-foreground"
          }`}
        >
          {detected ? "OK" : "No detectado"}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          className="h-8 text-xs"
        />
        {action}
      </div>
    </div>
  );
}

function ChecklistBlock<T extends Record<string, boolean>>({
  title,
  accent,
  items,
  state,
  onToggle,
}: {
  title: string;
  accent: string;
  items: { key: keyof T; label: string }[];
  state: T;
  onToggle: (key: string) => void;
}) {
  const activos = items.filter((i) => state[i.key]).length;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {activos}/{items.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => {
          const active = state[i.key];
          return (
            <button
              key={String(i.key)}
              onClick={() => onToggle(String(i.key))}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-accent"
              }`}
            >
              {i.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warn" | "critical" | "info" | "rescue" | "success";
}) {
  const toneClass =
    tone === "critical"
      ? "text-critical"
      : tone === "warn"
        ? "text-warn"
        : tone === "info"
          ? "text-info"
          : tone === "rescue"
            ? "text-rescue"
            : tone === "success"
              ? "text-success"
              : "text-foreground";
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
