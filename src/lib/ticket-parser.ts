// Lógica de parseo, clasificación y generación de respuesta.
// 100% local. No envía datos a ningún servidor.

export type CaseType =
  | "INCUMPLIMIENTO"
  | "ADELANTAR_VISITA"
  | "MANTENER_FRANJA"
  | "COORDINACION"
  | "RESCATE_COMERCIAL"
  | "GENERAL";

export type Franja = "AM0" | "AM1" | "PM1" | "PM3" | "";

export interface ParsedTicket {
  sot: string;
  sotCandidates: string[];
  cliente: string;
  dni: string;
  telefono: string;
  departamento: string;
  distrito: string;
  fechaInstalacion: string;
  franja: Franja;
  contrata: string;
  dac: string;
  observacion: string;
  codCliente: string;
  subtipo: string;
  servicio: string;
  direccion: string;
  plano: string;
  caso: CaseType;
  accionSugerida: string;
}

const CASE_KEYWORDS: Record<Exclude<CaseType, "GENERAL">, string[]> = {
  INCUMPLIMIENTO: [
    "incumplimiento", "no fue atendido", "fuera de franja", "franja vencida",
    "no llegaron", "cliente esperando", "cliente critico", "cliente crítico",
    "no atendieron", "no se acercaron",
  ],
  ADELANTAR_VISITA: [
    "adelantar visita", "adelanto", "urgente", "que se acerquen hoy",
    "hoy si o si", "hoy sí o sí", "cliente solicita que se acerquen",
    "no podra otro dia", "no podrá otro día",
  ],
  MANTENER_FRANJA: [
    "mantener franja", "confirma para hoy", "cliente confirma",
    "mantener pm1", "mantener am1", "mantener am2", "mantener pm2",
    "esta a la espera de los tecnicos", "está a la espera de los técnicos",
  ],
  COORDINACION: [
    "coordinacion", "coordinación", "reprogramar", "reprogramacion",
    "reprogramación", "desea visita", "solicita visita", "jueves", "viernes",
    "sabado", "sábado", "lunes", "por disponibilidad laboral",
    "cambio de fecha", "nueva fecha",
  ],
  RESCATE_COMERCIAL: [
    "rescate comercial", "cliente si desea", "cliente sí desea",
    "confirma paquete", "confirma disponibilidad", "critico", "crítico",
    "apoyo para la atencion", "apoyo para la atención",
    "contesta tambien por whatsapp", "contesta también por whatsapp",
  ],
};

const normalize = (s: string) => s.toLowerCase();

function findCase(text: string): CaseType {
  const t = normalize(text);
  // ADELANTAR se detecta antes que MANTENER si hay urgencia
  const order: Exclude<CaseType, "GENERAL">[] = [
    "ADELANTAR_VISITA",
    "INCUMPLIMIENTO",
    "RESCATE_COMERCIAL",
    "MANTENER_FRANJA",
    "COORDINACION",
  ];
  for (const c of order) {
    if (CASE_KEYWORDS[c].some((k) => t.includes(k))) return c;
  }
  return "GENERAL";
}

function detectFranja(text: string): Franja {
  const t = text.toUpperCase();
  if (/\bAM0\b/.test(t)) return "AM0";
  if (/\bAM1\b/.test(t)) return "AM1";
  if (/\bPM1\b/.test(t)) return "PM1";
  if (/\bPM3\b/.test(t)) return "PM3";
  const hourMatch = t.match(/\b(\d{1,2}):(\d{2})\b/);
  if (hourMatch) {
    const h = parseInt(hourMatch[1], 10);
    if (h >= 7 && h < 9) return "AM0";
    if (h >= 9 && h < 13) return "AM1";
    if (h >= 14 && h < 18) return "PM1";
    if (h >= 18 && h < 20) return "PM3";
  }
  return "";
}

function extractAfter(text: string, labels: string[]): string {
  for (const label of labels) {
    const re = new RegExp(
      `${label}\\s*[:;\\-]\\s*([^\\n\\r]+)`,
      "i",
    );
    const m = text.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return "";
}

function extractSOTs(text: string): string[] {
  const out = new Set<string>();
  const re = /SOT[\s:\-]*?(\d{7,10})/gi;
  let m;
  while ((m = re.exec(text)) !== null) out.add(m[1]);
  return [...out];
}

function extractPhone(text: string): string {
  const labels = ["TELEFONO", "TELÉFONO", "TELEF", "TELF", "NUMERO", "NÚMERO", "CELULAR", "CEL"];
  const labelVal = extractAfter(text, labels);
  if (labelVal) {
    const m = labelVal.match(/(\+?51)?\s?(\d{9})/);
    if (m) return m[2];
  }
  const m = text.match(/(?:\+?51)?\s?(\b9\d{8}\b)/);
  return m ? m[1] : "";
}

function extractDni(text: string): string {
  const v = extractAfter(text, ["DNI/RUC", "DNI", "RUC"]);
  if (v) {
    const m = v.match(/\d{8,11}/);
    if (m) return m[0];
  }
  return "";
}

/** Ticket copiado de TOA: etiqueta en una línea y valor en la siguiente. */
export function isToaTicket(text: string): boolean {
  return /ID de actividad/i.test(text) && /Datos del cliente/i.test(text);
}

function toaLines(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim());
}

function toaValue(lines: string[], label: string): string {
  const key = label.toLowerCase();
  const i = lines.findIndex((l) => l.toLowerCase() === key);
  if (i < 0) return "";
  for (let j = i + 1; j < Math.min(lines.length, i + 3); j++) {
    if (lines[j]) return lines[j];
  }
  return "";
}

function parseToa(text: string): ParsedTicket {
  const L = toaLines(text);
  const header = toaValue(L, "Detalles de actividad");
  // "INST CICSA TACNA MULTI - 4F ZN01, 20/10/26" -> CICSA
  const contrata = header.split(/\s+/)[1] ?? "";
  const fechaProg = toaValue(L, "Fecha de Programacion");
  const iFecha = L.findIndex((l) => l.toLowerCase() === "fecha de programacion");
  const franjaLine = iFecha >= 0 ? L.slice(iFecha + 2, iFecha + 4).join(" ") : "";
  const subtipo = toaValue(L, "Sub Tipo de Orden");
  const habilidad = toaValue(L, "Habilidad").replace(/\s*\(.*\)\s*$/, "");
  const notas = toaValue(L, "Notas / Observaciones");
  const franja = detectFranja(franjaLine) || detectFranja(text);
  const caso = findCase(notas);
  return {
    sot: toaValue(L, "SOT"),
    sotCandidates: [],
    cliente: toaValue(L, "Nombre"),
    dni: toaValue(L, "Nro. Documento Cliente"),
    telefono: toaValue(L, "Telefono"),
    departamento: toaValue(L, "Departmento") || toaValue(L, "Departamento"),
    distrito: toaValue(L, "Distrito"),
    fechaInstalacion: fechaProg,
    franja,
    contrata,
    dac: "",
    observacion: notas,
    codCliente: toaValue(L, "Código de Cliente") || toaValue(L, "Codigo de Cliente"),
    subtipo,
    servicio: habilidad,
    direccion: toaValue(L, "Direccion"),
    plano: toaValue(L, "Plano"),
    caso,
    accionSugerida: "",
  };
}

export function parseTicket(text: string): ParsedTicket {
  if (isToaTicket(text)) return parseToa(text);
  const sots = extractSOTs(text);
  const cliente = extractAfter(text, ["CLIENTE"]);
  const dni = extractDni(text);
  const telefono = extractPhone(text);
  const departamento = extractAfter(text, ["DEPARTAMENTO", "DPTO", "DEP"]);
  const distrito = extractAfter(text, ["DISTRITO"]);
  const fechaInstalacion =
    extractAfter(text, [
      "FECHA Y HORARIO DE INSTALACION",
      "FECHA Y HORARIO DE INSTALACIÓN",
      "FECHA DE INSTALACION",
      "FECHA DE INSTALACIÓN",
      "FECHA INSTALACION",
      "FECHA DE PROGRAMACION",
      "FECHA DE PROGRAMACIÓN",
      "FECHA",
    ]) || "";
  const contrata = extractAfter(text, ["CONTRATA"]);
  const dac = extractAfter(text, ["DAC"]);
  const observacion = extractAfter(text, ["OBSERVACION", "OBSERVACIÓN", "OBS"]);
  const franja = detectFranja(text);
  const caso = findCase(text);

  const accionSugerida = (() => {
    switch (caso) {
      case "INCUMPLIMIENTO":
        return "Validar TOA/SGA, revisar técnico asignado y regularizar atención.";
      case "ADELANTAR_VISITA":
        return "Coordinar con contrata disponibilidad operativa en zona para hoy.";
      case "MANTENER_FRANJA":
        return "Confirmar técnico asignado y mantener franja programada.";
      case "COORDINACION":
        return "Validar agenda y disponibilidad para nueva fecha/franja.";
      case "RESCATE_COMERCIAL":
        return "Priorizar atención y confirmar paquete con cliente.";
      default:
        return "Revisar TOA y SGA y dar actualización al asesor.";
    }
  })();

  return {
    sot: sots[0] ?? "",
    sotCandidates: sots,
    cliente,
    dni,
    telefono,
    departamento,
    distrito,
    fechaInstalacion,
    franja,
    contrata,
    dac,
    observacion,
    codCliente: extractAfter(text, ["CODIGO DE CLIENTE", "CÓDIGO DE CLIENTE", "COD CLIENTE"]),
    subtipo: extractAfter(text, ["SUB TIPO", "SUBTIPO"]),
    servicio: extractAfter(text, ["SERVICIO"]),
    direccion: extractAfter(text, ["DIRECCION", "DIRECCIÓN"]),
    plano: extractAfter(text, ["PLANO"]),
    caso,
    accionSugerida,
  };
}

// ============================================================
// Generación de respuesta
// ============================================================

export type ToaChecks = {
  estadoAgenda: boolean;
  estadoCancelado: boolean;
  estadoReagendado: boolean;
  estadoPendiente: boolean;
  estadoEjecucion: boolean;
  clienteConfProgramacion: boolean;
  clienteConfSeguimiento: boolean;
  clienteNoContactado: boolean;
  clienteRecuperado: boolean;
  alertaReagendamiento: boolean;
  franjaVigente: boolean;
  franjaVencida: boolean;
  tieneTecnico: boolean;
  sinTecnico: boolean;
  requiereEscalamiento: boolean;
  observacionRegistrada: boolean;
  fueraDeTOA: boolean;
  adelantoContratista: boolean;
  retornoCampo: boolean;
  derivadoBuzon: boolean;
};

export type SgaChecks = {
  enAgenda: boolean;
  reagendado: boolean;
  cancelado: boolean;
  pendiente: boolean;
  enEjecucion: boolean;
  tieneCuadrilla: boolean;
  sinCuadrilla: boolean;
  coincideFecha: boolean;
  noCoincideFecha: boolean;
  historialReprogramacion: boolean;
  observacionContacto: boolean;
  anotacionOperativa: boolean;
  serviciosAInstalar: boolean;
  fechaCompromisoVencida: boolean;
  fechaCompromisoVigente: boolean;
};

export const emptyToa = (): ToaChecks => ({
  estadoAgenda: false, estadoCancelado: false, estadoReagendado: false,
  estadoPendiente: false, estadoEjecucion: false,
  clienteConfProgramacion: false, clienteConfSeguimiento: false,
  clienteNoContactado: false, clienteRecuperado: false,
  alertaReagendamiento: false, franjaVigente: false, franjaVencida: false,
  tieneTecnico: false, sinTecnico: false, requiereEscalamiento: false,
  observacionRegistrada: false, fueraDeTOA: false, adelantoContratista: false,
  retornoCampo: false, derivadoBuzon: false,
});

export const emptySga = (): SgaChecks => ({
  enAgenda: false, reagendado: false, cancelado: false, pendiente: false,
  enEjecucion: false, tieneCuadrilla: false, sinCuadrilla: false,
  coincideFecha: false, noCoincideFecha: false,
  historialReprogramacion: false, observacionContacto: false,
  anotacionOperativa: false, serviciosAInstalar: false,
  fechaCompromisoVencida: false, fechaCompromisoVigente: false,
});

export type Tono = "Formal" | "Corto" | "Detallado";
export type Destino = "Asesor comercial" | "Mesa de seguimiento" | "Buzón" | "Contrata";

export interface ResponseInput {
  ticket: ParsedTicket;
  toa: ToaChecks;
  sga: SgaChecks;
  tono: Tono;
  destino: Destino;
}

function destinoHeader(d: Destino): string {
  switch (d) {
    case "Asesor comercial": return "Estimado asesor";
    case "Mesa de seguimiento": return "Estimada mesa de seguimiento";
    case "Buzón": return "Buen día, equipo";
    case "Contrata": return "Estimada contrata";
  }
}

export function generateResponse(input: ResponseInput): string {
  const { ticket, toa, sga, tono, destino } = input;
  const sot = ticket.sot || "XXXX";
  const hello = destinoHeader(destino);

  // ¿Cancelado?
  if (toa.estadoCancelado || sga.cancelado) {
    return `${hello}, se valida la SOT ${sot}. La orden figura cancelada en sistema, por lo que no es posible continuar con la gestión de instalación bajo esta solicitud. Favor validar generación de nueva solicitud o regularización comercial según corresponda.`;
  }

  let body = "";

  switch (ticket.caso) {
    case "INCUMPLIMIENTO": {
      if (toa.sinTecnico || sga.sinCuadrilla) {
        body = `La orden presenta solicitud por incumplimiento; sin embargo, no se evidencia técnico/cuadrilla asignada. Se solicita apoyo para validación operativa y asignación según disponibilidad.`;
      } else if (toa.tieneTecnico || sga.tieneCuadrilla) {
        body = `La orden cuenta con técnico/cuadrilla asignada y se mantiene en gestión para la atención correspondiente.`;
      } else if (toa.franjaVencida || sga.fechaCompromisoVencida) {
        body = `Se evidencia incumplimiento de franja, por lo que se procede con la revisión correspondiente para regularizar la atención y/o reprogramación según disponibilidad.`;
      } else if (toa.franjaVigente || sga.fechaCompromisoVigente) {
        body = `La orden aún se encuentra dentro de la franja programada, por lo que se mantiene en seguimiento para la atención correspondiente.`;
      } else {
        body = `Se evidencia incumplimiento reportado por el cliente. Se procede con la revisión en TOA/SGA para regularizar la atención según disponibilidad.`;
      }
      break;
    }
    case "ADELANTAR_VISITA": {
      if (toa.tieneTecnico || sga.tieneCuadrilla) {
        body = `Cliente solicita adelanto de visita para el día de hoy. Se valida con la contrata/cuadrilla correspondiente para revisar disponibilidad de atención. La gestión queda sujeta a disponibilidad operativa en zona.`;
      } else if (toa.sinTecnico || sga.sinCuadrilla) {
        body = `Cliente solicita adelanto de visita; sin embargo, no se evidencia técnico/cuadrilla asignada por el momento. Se solicita apoyo para validar disponibilidad operativa. La atención queda sujeta a disponibilidad en zona.`;
      } else {
        body = `Cliente solicita adelantar la visita de manera urgente. Se procede con la validación de disponibilidad operativa con la contrata correspondiente. La atención queda sujeta a disponibilidad en zona.`;
      }
      break;
    }
    case "MANTENER_FRANJA": {
      if (toa.clienteConfProgramacion) {
        body = `Cliente figura confirmado para la programación, por lo que se mantiene la franja indicada para la atención correspondiente.`;
      } else {
        body = `Cliente confirma disponibilidad para la visita programada y solicita mantener la franja indicada${ticket.franja ? ` (${ticket.franja})` : ""}. Se mantiene en seguimiento para la atención correspondiente.`;
      }
      break;
    }
    case "COORDINACION": {
      if (toa.estadoReagendado || sga.reagendado) {
        body = `La orden figura reagendada según disponibilidad registrada en sistema. Favor validar con el cliente la nueva fecha y franja de atención.`;
      } else if (sga.noCoincideFecha) {
        body = `Se evidencia diferencia entre la fecha/franja solicitada y la programación registrada. Se solicita validar disponibilidad para regularizar la agenda según lo requerido por el cliente.`;
      } else {
        body = `Cliente solicita coordinación/reprogramación de visita para la fecha y franja indicada. Se valida disponibilidad en agenda para proceder con la actualización correspondiente.`;
      }
      break;
    }
    case "RESCATE_COMERCIAL": {
      if (toa.clienteRecuperado) {
        body = `Cliente figura como recuperado y confirma interés en continuar con la instalación. Se mantiene gestión para priorizar la atención correspondiente.`;
      } else {
        body = `Cliente confirma interés en continuar con la instalación. Se solicita apoyo para priorizar la atención, considerando que el caso corresponde a rescate comercial.`;
      }
      break;
    }
    default:
      body = `Se procede con la revisión correspondiente en TOA y SGA para brindar actualización del caso.`;
  }

  // Notas adicionales por checks
  const extras: string[] = [];
  if (toa.requiereEscalamiento) extras.push("Se sugiere escalamiento operativo.");
  if (toa.derivadoBuzon) extras.push("Caso derivado vía buzón para gestión.");
  if (toa.retornoCampo) extras.push("Se requiere retorno a campo.");
  if (sga.historialReprogramacion) extras.push("Se evidencia historial de reprogramación.");

  let full = `${hello}, se valida la SOT ${sot}. ${body}`;
  if (extras.length) full += ` ${extras.join(" ")}`;
  full += ` Quedamos atentos.`;

  if (tono === "Corto") {
    // Versión recortada
    full = `${hello}, SOT ${sot}: ${body.replace(/\.$/, "")}. Quedamos atentos.`;
  } else if (tono === "Detallado") {
    const detalles: string[] = [];
    if (ticket.cliente) detalles.push(`Cliente: ${ticket.cliente}`);
    if (ticket.distrito || ticket.departamento)
      detalles.push(`Zona: ${[ticket.distrito, ticket.departamento].filter(Boolean).join(", ")}`);
    if (ticket.fechaInstalacion) detalles.push(`Fecha programada: ${ticket.fechaInstalacion}`);
    if (ticket.franja) detalles.push(`Franja: ${ticket.franja}`);
    if (ticket.contrata) detalles.push(`Contrata: ${ticket.contrata}`);
    if (detalles.length) full += `\n\nDetalle del caso:\n- ${detalles.join("\n- ")}`;
  }

  return full;
}

export const CASE_LABEL: Record<CaseType, string> = {
  INCUMPLIMIENTO: "Incumplimiento",
  ADELANTAR_VISITA: "Adelantar visita",
  MANTENER_FRANJA: "Mantener franja",
  COORDINACION: "Coordinación / Reprogramación",
  RESCATE_COMERCIAL: "Rescate comercial",
  GENERAL: "Caso general",
};

export const EXAMPLE_TICKET = `Detalles de actividad
INST CICSA TACNA MULTI - 4F ZN01, 20/10/26
Datos de la actividad
ID de actividad
23898752
Posición en Ruta
Ordenado
SOT
91835706
Código de Cliente
05383948
ID Agenda
113289478
Estado
Pendiente
Estado Agenda
1
Acciones Orden
[830] FTTH - SISACT INSTALACION PAQUETES TODO CLARO DIGITAL
Habilidad
FTTH - Instalacion(75/100)
Tipo de Orden
FTTH Instalacion
Sub Tipo de Orden
FTTH01 - 1PLAY INTERNET
Fecha de Generacion de la Orden
17/10/2026
Fecha de Programacion
20/10/26
AM1
Intervalo de tiempo

20/10/26 09:00
SLA inicio
Formato de entrada: día/mes/año H:i. Pulse la tecla arriba y la tecla abajo para acceder al calendario. Pulse Mayús + tecla abajo o Mayús + tecla arriba para acceder al selector de hora.
20/10/26 13:00
SLA fin
Formato de entrada: día/mes/año H:i. Pulse la tecla arriba y la tecla abajo para acceder al calendario. Pulse Mayús + tecla abajo o Mayús + tecla arriba para acceder al selector de hora.
Duracion
2 Horas 20 min
Notas / Observaciones
PROCESO AUTOMATICO - INTERFAZ FTTH SISACT - PLAZO DE ACUERDO CONTRACTUAL 0SEC.108002589
Datos de la atención
Fecha de Generacion de la Orden
17/10/2026
Coordenada X
-70.23593
Coordenada Y
-17.99831
Observaciones y quiebre
Observación ADP Seguimiento
Seguimiento de Cuadrilla
Llamada de Seguimiento


¿Se requiere equipo?
Datos del cliente
Nombre
JORGE GUERRA MATA
Tipo de Documento del Cliente
CARNET DE EXTRANJERIA
Nro. Documento Cliente
009571913
Telefono
987545589
No
VIP

No
Alerta Reagendamiento

No
Alta Dilación

No
Cliente FOES

NO
Contingencia

No
Cliente Confirmado Programación

Cliente Confirmado Seguimiento

No
Cliente Recuperado

PM3 ADP


Revisión Overlap

Full Claro

Fuera de TOA

Adelanto por Contratista

Proyecto Titan

Puerta a Puerta

Mantenimiento 30 Días

Sin Servicio - IN HOUSE

Requiere Escalera

Retorno a Campo

Derivado vía Buzón
Dirección de atención de la actividad
Departmento
TACNA
Provincia
TACNA
Distrito
TACNA
Direccion
AV MIGUEL GRAU 1922 INTERIOR Piso CORONEL FRANCISCO BOLOGNESI -
Referencia Direccion
. -18.04844,-70.246483 - 987332639 -
Plano
0TCNA016-S
Zona de trabajo
9649 - TAC_TACNA_ZN01
Plantilla del Motor
Con Plantilla`;
