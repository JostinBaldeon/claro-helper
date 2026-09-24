// Plantillas SGA y WhatsApp para Mesa Multiskill HITSS.
// El texto se mantiene tal cual lo dicta operación. Las variables se interpolan
// con {SOT}, {DIA_FRANJA}, {CLIENTE}, {NUMERO}, {CONTRATA}, {ADP}, {SUBMOTIVO}.

export type TemplateCategory =
  | "Confirmación"
  | "Habilitación"
  | "Ciclo de llamadas"
  | "Rechazo - Comercial"
  | "Rechazo - Técnico"
  | "Consulta";

export interface SgaTemplate {
  id: string;
  label: string;
  category: TemplateCategory;
  body: string;
  submotivos?: string[];
  /** Sub-campos adicionales que el usuario complete a mano (ej. dirección correcta). */
  extraNote?: string;
}

export const ADP_OPTIONS = [
  "Jhostin Baldeon",
  "Javier Carrion",
  "Patrick Coras",
  "Otro",
] as const;

/** Firma usada en respuestas WhatsApp según el ADP activo. */
export function adpSignature(adp: string): string {
  if (adp === "Patrick Coras") return "P.R";
  return "J.L";
}

export const FRANJAS_INFO: { value: string; label: string }[] = [
  { value: "AM0", label: "AM0 · 07:00 – 09:00" },
  { value: "AM1", label: "AM1 · 09:00 – 11:00" },
  { value: "AM2", label: "AM2 · 11:00 – 13:00" },
  { value: "PM1", label: "PM1 · 14:00 – 16:00" },
  { value: "PM2", label: "PM2 · 16:00 – 18:00" },
];

export const SGA_TEMPLATES: SgaTemplate[] = [
  // 1
  {
    id: "confirma-visita",
    label: "Confirma visita en llamada",
    category: "Confirmación",
    body: `MESA MULTISKILL HITSS - CONFIRMA VISITA
SOT: {SOT}
DÍA Y FRANJA: {DIA_FRANJA}
CLIENTE: {CLIENTE}
NUMERO: {NUMERO}
CONTRATA: {CONTRATA}
ID DE LLAMADA: 
REALIZADO POR: {ADP}`,
  },
  // 2
  {
    id: "adelanto-visita",
    label: "Adelanto de visita",
    category: "Confirmación",
    body: `MESA MULTISKILL HITSS - ADELANTA VISITA
SOT: {SOT}
DÍA Y FRANJA: {DIA_FRANJA}
CLIENTE: {CLIENTE}
NUMERO: {NUMERO}
CONTRATA: {CONTRATA}
ID DE LLAMADA: 
REALIZADO POR: {ADP} - ADP MULTISKILL HITSS`,
  },
  // 3
  {
    id: "mantiene-fecha",
    label: "Mantiene fecha programada",
    category: "Confirmación",
    body: `MESA MULTISKILL HITSS - MANTIENE FECHA DE VISITA
SOT: {SOT}
DÍA Y FRANJA: {DIA_FRANJA}
CLIENTE: {CLIENTE}
NUMERO: {NUMERO}
CONTRATA: {CONTRATA}
ID DE LLAMADA: 
REALIZADO POR: {ADP}`,
  },
  // 4
  {
    id: "habilitacion-franjas",
    label: "Habilitación de franjas",
    category: "Habilitación",
    body: `MESA MULTISKILL HITSS - FORMATO PARA HABILITAR FRANJA
📥 SOT: {SOT}
🪚 PLANO: 
📅 FECHA Y FRANJA: {DIA_FRANJA}
📧 Motivo: SIN FRANJAS DISPONIBLES
🚨‍ Sup acargo: NICOL MALASQUEZ`,
  },
  // 5
  {
    id: "ciclo-llamadas",
    label: "Ciclo de llamadas",
    category: "Ciclo de llamadas",
    submotivos: [
      "Buzón de voz",
      "No contesta",
      "Número no existe",
      "Apagado",
      "Corta llamada",
    ],
    body: `MESA MULTISKILL HITSS - CICLO DE LLAMADAS
CICLO DE LLAMADA NRO: 1
CANTIDAD DE LLAMADAS: 4
NUMERO: {NUMERO}
MOTIVO: FALTA DE CONTACTO
SUB-MOTIVO: {SUBMOTIVO}
ID DE LLAMADA: 
REALIZADO POR: {ADP} - ADP MULTISKILL HITSS`,
  },
  // 6
  {
    id: "rech-no-desea-mesa",
    label: "Rechazo: Cliente no desea servicio - Mesa",
    category: "Rechazo - Comercial",
    submotivos: [
      "Cliente ya tiene servicio de otro operador",
      "Titular no ha contratado ningún servicio a Claro",
      "Demora en la atención de la solicitud, ya no desea esperar",
      "Cliente no desea servicio por motivos personales",
    ],
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZO EN MESA
PERSONA QUE CONTESTA: 
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: CLIENTE NO DESEA EL SERVICIO - MESA
SUBMOTIVO DE RECHAZO: {SUBMOTIVO}
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 7
  {
    id: "rech-no-desea-campo",
    label: "Rechazo: Cliente no desea servicio - Campo",
    category: "Rechazo - Comercial",
    submotivos: [
      "Cliente ya tiene servicio de otro operador",
      "Titular no ha contratado ningún servicio a Claro",
      "Demora en la atención de la solicitud, ya no desea esperar",
      "Cliente no desea servicio por motivos personales",
    ],
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZO EN CAMPO
PERSONA QUE CONTESTA: 
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: CLIENTE NO DESEA EL SERVICIO
SUBMOTIVO DE RECHAZO: {SUBMOTIVO}
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 8
  {
    id: "rech-duplicidad-mesa",
    label: "Rechazo: Por duplicidad - Mesa",
    category: "Rechazo - Comercial",
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN MESA
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: RECHAZADO POR DUPLICIDAD
PERSONA QUE CONTESTA: [NO APLICA]
NUMERO DE CONTACTO: [NO APLICA]
SUBMOTIVO DE RECHAZO: se atendió con otra SOT
SE PROCEDE AL RECHAZO DE LA SOLICITUD POR DUPLICIDAD DE SOT, SE ATENDIÓ CON LA SOT: (VALIDAR CON DNI O EN HISTORIAL DEL CLIENTE)
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 9
  {
    id: "rech-duplicidad-campo",
    label: "Rechazo: Por duplicidad - Campo",
    category: "Rechazo - Comercial",
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZO EN CAMPO
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: RECHAZADO POR DUPLICIDAD
PERSONA QUE CONTESTA: [NO APLICA]
NUMERO DE CONTACTO: [NO APLICA]
SUBMOTIVO DE RECHAZO: se atendió con otra SOT
SE PROCEDE AL RECHAZO DE LA SOLICITUD POR DUPLICIDAD DE SOT, SE ATENDIÓ CON LA SOT: (VALIDAR CON DNI O EN HISTORIAL DEL CLIENTE)
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 10
  {
    id: "rech-facil-tec-mesa",
    label: "Rechazo: Facilidades técnicas del cliente - Mesa",
    category: "Rechazo - Comercial",
    submotivos: [
      "Dueño de Casa y/o Edificio no autoriza la instalación",
      "Al momento de la instalación no hay acceso al techo",
      "Al momento de la instalación se valida ducterías obstruidas",
      "Cliente cuenta con SOT de suspensión y/o baja",
    ],
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN MESA
PERSONA QUE CONTESTA: 
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: FACILIDADES TÉCNICAS DEL CLIENTE
SUBMOTIVO DE RECHAZO: {SUBMOTIVO}
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 11
  {
    id: "rech-facil-tec-campo",
    label: "Rechazo: Facilidades técnicas del cliente - Campo",
    category: "Rechazo - Comercial",
    submotivos: [
      "Dueño de Casa y/o Edificio no autoriza la instalación",
      "Al momento de la instalación no hay acceso al techo",
      "Al momento de la instalación se valida ducterías obstruidas",
      "Cliente cuenta con SOT de suspensión y/o baja",
    ],
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN CAMPO
PERSONA QUE CONTESTA: 
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: FACILIDADES TÉCNICAS DEL CLIENTE
SUBMOTIVO DE RECHAZO: {SUBMOTIVO}
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 12
  {
    id: "rech-falta-contacto-mesa",
    label: "Rechazo: Falta de contacto - Mesa",
    category: "Rechazo - Comercial",
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZO EN MESA
PERSONA QUE CONTESTA: 
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: FALTA DE CONTACTO
SUBMOTIVO DE RECHAZO: No hay contacto con el cliente (números errados)
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 13
  {
    id: "rech-falta-contacto-campo",
    label: "Rechazo: Falta de contacto - Campo",
    category: "Rechazo - Comercial",
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZO EN CAMPO
PERSONA QUE CONTESTA: 
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: FALTA DE CONTACTO
SUBMOTIVO DE RECHAZO: No hay contacto con el cliente (números errados)
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 14
  {
    id: "rech-direccion-mesa",
    label: "Rechazo: Mal ingreso de dirección - Mesa",
    category: "Rechazo - Comercial",
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN MESA
PERSONA QUE CONTESTA: NOMBRE
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: MAL INGRESO DE DIRECCIÓN
DIRECCIÓN CORRECTA: 
SUBMOTIVO DE RECHAZO: 
*Dirección registrada en el sistema es errada. (número, lt, mz, nombre calle, distrito)
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 15
  {
    id: "rech-direccion-campo",
    label: "Rechazo: Mal ingreso de dirección - Campo",
    category: "Rechazo - Comercial",
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN CAMPO
PERSONA QUE CONTESTA: NOMBRE
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: MAL INGRESO DE DIRECCIÓN
DIRECCIÓN CORRECTA: 
SUBMOTIVO DE RECHAZO: 
*Dirección registrada en el sistema es errada. (número, lt, mz, nombre calle, distrito)
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 16
  {
    id: "rech-mala-oferta-mesa",
    label: "Rechazo: Mala oferta - Mesa",
    category: "Rechazo - Comercial",
    submotivos: [
      "Tecnología incorrecta FTTH/HFC/OVERLAP Instalación/Post Venta",
      "Velocidad de Internet no es acorde a lo solicitado por el cliente",
      "Cantidad o Modelo de Decos no es acorde a lo solicitado",
      "Cliente solicitó atención PostVenta (Decos adicionales, traslados, etc.)",
      "Cliente solicita adicionar la telefonía",
      "Decodificadores descontinuados (Básico HD, Básico, Standard, DVR)",
    ],
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN MESA
PERSONA QUE CONTESTA: TITULAR/ FAMILIAR + NOMBRE
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: MALA OFERTA
SUBMOTIVO DE RECHAZO: {SUBMOTIVO}
PAQUETE INGRESADO: XXXXX
PAQUETE CORRECTO: XXXXXXX
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 17
  {
    id: "rech-mala-oferta-campo",
    label: "Rechazo: Mala oferta - Campo",
    category: "Rechazo - Comercial",
    submotivos: [
      "Tecnología incorrecta FTTH/HFC/OVERLAP Instalación/Post Venta",
      "Velocidad de Internet no es acorde a lo solicitado por el cliente",
      "Cantidad o Modelo de Decos no es acorde a lo solicitado",
      "Cliente solicitó atención PostVenta (Decos adicionales, traslados, etc.)",
      "Cliente solicita adicionar la telefonía",
      "Decodificadores descontinuados (Básico HD, Básico, Standard, DVR)",
    ],
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN CAMPO
PERSONA QUE CONTESTA: TITULAR/ FAMILIAR + NOMBRE
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: MALA OFERTA
SUBMOTIVO DE RECHAZO: {SUBMOTIVO}
PAQUETE INGRESADO: XXXXX
PAQUETE CORRECTO: XXXXXXX
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 18
  {
    id: "rech-mudanza-mesa",
    label: "Rechazo: Mudanza o viaje - Mesa",
    category: "Rechazo - Comercial",
    submotivos: [
      "Cliente salió de viaje y en el domicilio no tienen conocimiento de la instalación",
      "Cliente no vive en esta dirección, se mudó",
      "Cliente indica que pronto se mudará o viajará y rechaza instalación",
    ],
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN MESA
PERSONA QUE CONTESTA: 
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: MUDANZA O VIAJE
SUBMOTIVO DE RECHAZO: {SUBMOTIVO}
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 19
  {
    id: "rech-mudanza-campo",
    label: "Rechazo: Mudanza o viaje - Campo",
    category: "Rechazo - Comercial",
    submotivos: [
      "Cliente salió de viaje y en el domicilio no tienen conocimiento de la instalación",
      "Cliente no vive en esta dirección, se mudó",
      "Cliente indica que pronto se mudará o viajará y rechaza instalación",
    ],
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN CAMPO
PERSONA QUE CONTESTA: 
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: MUDANZA O VIAJE
SUBMOTIVO DE RECHAZO: {SUBMOTIVO}
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 20
  {
    id: "rech-sot-errores-mesa",
    label: "Rechazo: SOT con errores de sistema - Mesa",
    category: "Rechazo - Comercial",
    submotivos: [
      "Sin workflow, sin tareas generadas",
      "Campaña mal configurada, no figura etiquetas correctas",
      "Solicitud mal generada (sin reservas, duplicidad, sin Co_id, sin CustomerID, sin plano, etc.)",
    ],
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN MESA
MOTIVO DEL RECHAZO: SOT CON ERRORES EN EL SISTEMA
SUBMOTIVO DE RECHAZO: {SUBMOTIVO}
**SE PROCEDE AL RECHAZO DE LA SOLICITUD POR TENER ERRORES DE SISTEMAS:
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 21
  {
    id: "rech-sot-errores-campo",
    label: "Rechazo: SOT con errores de sistema - Campo",
    category: "Rechazo - Comercial",
    submotivos: [
      "Sin workflow, sin tareas generadas",
      "Campaña mal configurada, no figura etiquetas correctas",
      "Solicitud mal generada (sin reservas, duplicidad, sin Co_id, sin CustomerID, sin plano, etc.)",
    ],
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN CAMPO
MOTIVO DEL RECHAZO: SOT CON ERRORES EN EL SISTEMA
SUBMOTIVO DE RECHAZO: {SUBMOTIVO}
**SE PROCEDE AL RECHAZO DE LA SOLICITUD POR TENER ERRORES DE SISTEMAS:
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 22
  {
    id: "rech-fraude-mesa",
    label: "Rechazo: Posible fraude - Mesa",
    category: "Rechazo - Comercial",
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN MESA
PERSONA QUE CONTESTA: 
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: POSIBLE FRAUDE
SUBMOTIVO DE RECHAZO: Cliente ya tiene un servicio activo en la misma dirección
CUSTOMER ID: (Solicitar DNI)
AUTORIZADO POR: 
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 23
  {
    id: "rech-fraude-campo",
    label: "Rechazo: Posible fraude - Campo",
    category: "Rechazo - Comercial",
    body: `MESA MULTISKILL HITSS
RECHAZO EN MESA / CAMPO: RECHAZADO EN CAMPO
PERSONA QUE CONTESTA: 
NUMERO DE CONTACTO: {NUMERO}
MOTIVO DEL RECHAZO: POSIBLE FRAUDE
SUBMOTIVO DE RECHAZO: Cliente ya tiene un servicio activo en la misma dirección
CUSTOMER ID: (Solicitar DNI)
AUTORIZADO POR: 
ID DE LLAMADA: 
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 24 — técnico
  {
    id: "tec-red-saturada",
    label: "Técnico: Red saturada",
    category: "Rechazo - Técnico",
    body: `MESA MULTISKILL HITSS
RECHAZO EN CAMPO
Técnico: - DNI/
Asesor: JAVIER CARRION
Tipo de caso: Rechazo
Tipo de actividad: Instalación
Estado de Solicitud: Atendido
Sub-estado de Solicitud: Se Rechaza SOT
Motivo rechazo: RED SATURADA
Sub-motivo rechazo: TAP Saturado
PLANO: 
Coordenada cliente: 
Coordenada del técnico: 
Observaciones: PROCEDE RECHAZO se verifica con plantilla TAP SATURADO`,
  },
  // 25
  {
    id: "tec-factibilidad",
    label: "Técnico: Factibilidad técnica",
    category: "Rechazo - Técnico",
    body: `MESA MULTISKILL HITSS
RECHAZO EN CAMPO
Técnico: - DNI/
Asesor: JAVIER CARRION
Tipo de caso: Rechazo
Tipo de actividad: Instalación
Estado de Solicitud: Atendido
Sub-estado de Solicitud: Se Rechaza SOT
Motivo rechazo: FACTIBILIDAD TECNICA
Sub-motivo rechazo: Acometida excede los 85 metros (HFC)
Coordenada cliente: 
Coordenada del técnico: 
Observaciones: PROCEDE RECHAZO, realizar quiebre en TOA. Se valida en street view domicilio, por lo cual excede acometida HFC, entrará a un proceso de revisión por un supervisor de campo`,
  },
  // 26
  {
    id: "tec-cambio-plano",
    label: "Técnico: Cambio de plano",
    category: "Rechazo - Técnico",
    body: `MESA MULTISKILL HITSS
MOTIVO: CAMBIO DE PLANO
PLANO CORRECTO: 
COORDENADA CLIENTE: 
REALIZADO POR: JAVIER CARRION - HITSS`,
  },
  // 27
  {
    id: "tec-infraestructura",
    label: "Técnico: Falta de infraestructura de red",
    category: "Rechazo - Técnico",
    body: `MESA MULTISKILL HITSS
RECHAZO EN CAMPO
TÉCNICO: - DNI/
ASESOR: JAVIER CARRION
TIPO DE CASO: Rechazo
TIPO DE ACTIVIDAD: Instalación - PostVenta
ESTADO DE SOLICITUD: Atendido
SUB-ESTADO DE SOLICITUD: Se Rechaza SOT
MOTIVO RECHAZO: FALTA DE INFRAESTRUCTURA DE RED
SUB-MOTIVO RECHAZO: No hay red HFC/FTTH en la zona/avenida
COORDENADA CLIENTE: 
COORDENADA DEL TÉCNICO: 
OBSERVACIONES: PROCEDE RECHAZO, según coordenadas enviadas, se valida domicilio del cliente fuera de cobertura.`,
  },
  // 28
  {
    id: "consulta-cintillos-hfc",
    label: "Consulta de cintillos - HFC",
    category: "Consulta",
    body: `MESA MULTISKILL HITSS - CONSULTA DE CINTILLOS HFC
PLANO: 
TAP: #X # NO SATURADO/SATURADO
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
  // 29
  {
    id: "consulta-cintillos-ftth",
    label: "Consulta de cintillos - FTTH",
    category: "Consulta",
    body: `MESA MULTISKILL HITSS - CONSULTA DE CINTILLOS FTTH
PLANO: 
FAT # SATURADO
FAT # SATURADO
FAT # NO SATURADO
REALIZADO POR: JAVIER CARRION - ADP MULTISKILL HITSS`,
  },
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "Confirmación",
  "Habilitación",
  "Ciclo de llamadas",
  "Rechazo - Comercial",
  "Rechazo - Técnico",
  "Consulta",
];

export function renderTemplate(
  tpl: SgaTemplate,
  vars: {
    SOT?: string;
    DIA_FRANJA?: string;
    CLIENTE?: string;
    NUMERO?: string;
    CONTRATA?: string;
    ADP?: string;
    SUBMOTIVO?: string;
  },
): string {
  return tpl.body.replace(/\{(SOT|DIA_FRANJA|CLIENTE|NUMERO|CONTRATA|ADP|SUBMOTIVO)\}/g, (_, k) => {
    const v = (vars as Record<string, string | undefined>)[k];
    return v && v.trim() ? v : "";
  });
}

// ============================================================
// Plantillas rápidas para WhatsApp (respuesta al asesor)
// ============================================================

export interface WspTemplate {
  id: string;
  label: string;
  /** Usa {SOT} y opcionalmente {SUBMOTIVO} */
  body: string;
  needsSubmotivo?: boolean;
}

export const WSP_TEMPLATES: WspTemplate[] = [
  { id: "ruta", label: "🚗 Técnico en ruta", body: "@ 🚗Estimado SOT: {SOT}. Técnico en ruta a la dirección. {FIRMA}" },
  { id: "no-contesta", label: "📵 Cliente no contesta", body: "@ 📵Estimado SOT: {SOT}. Se llamó a cliente y no contesta. {FIRMA}" },
  { id: "confirma-visita", label: "✅ Cliente confirma visita", body: "@ ✅Estimado SOT: {SOT}. Cliente confirma Visita - {SUBMOTIVO}. {FIRMA}", needsSubmotivo: true },
  { id: "en-atencion", label: "⏳ En proceso de atención", body: "@ ⏳ Estimado SOT: {SOT}. Cliente en proceso Atención. {FIRMA}" },
  { id: "rechazado", label: "❌ Cliente rechazado", body: "@ ❌ Estimado SOT: {SOT}. Cliente Rechazado – {SUBMOTIVO} {FIRMA}", needsSubmotivo: true },
  { id: "instalado", label: "🏠✅ Cliente instalado", body: "@ 🏠✅Estimado SOT: {SOT}. Cliente Instalado✅ {FIRMA}" },
  { id: "sot-iniciado", label: "✅ SOT iniciada", body: "@ ✅Estimado SOT: {SOT}. SOT INICIADO {FIRMA}" },
  { id: "confirmo-visita", label: "✅ Confirmó visita (validado)", body: "@ ✅ Estimado SOT: {SOT}, se valida que cliente confirmó Visita - {SUBMOTIVO}. {FIRMA}", needsSubmotivo: true },
  { id: "mantenimientos", label: "⏳ Contrata atendiendo mantenimientos", body: "@⏳Estimado SOT: {SOT}. Cliente en proceso Atención, la contrata se está haciendo cargo de los mantenimientos. {FIRMA}" },
  { id: "postventa", label: "⏳ Contrata atendiendo Postventa", body: "@⏳Estimado SOT: {SOT}. Cliente en proceso Atención, la contrata se está haciendo cargo de las Postventa Junior. {FIRMA}" },
  { id: "cobertura", label: "⏳ Plantilla de cobertura solicitada", body: "@⏳Estimado SOT: {SOT}, cliente en proceso Atención - Se solicitó plantilla de cobertura para poder gestionarlo. {FIRMA}" },
  { id: "escala-sup", label: "⏫ Escalado con supervisor", body: "@ Estimado SOT: {SOT}, se escalará el caso con el supervisor para que se gestione. {FIRMA}" },
  { id: "sin-franja", label: "🟡 Sin franja disponible", body: "@ Estimado SOT: {SOT}, se mantiene la fecha, no hay disponibilidad de franja. {FIRMA}" },
  { id: "3-intentos", label: "📵 3 intentos AICC", body: "@ Estimado SOT: {SOT}, cliente no contesta. Se realizó 3 intentos de llamada desde plataforma AICC. {FIRMA}" },
  { id: "adelanto-ok", label: "✅ Procede adelanto", body: "@ Estimado SOT: {SOT}. Procede adelanto, nueva fecha - {SUBMOTIVO}. {FIRMA}", needsSubmotivo: true },
  { id: "mantiene-franja", label: "✅ Mantiene franja - enrutada", body: "@ Estimado SOT: {SOT}. Se mantiene la franja, SOT enrutada. {FIRMA}" },
  { id: "reprog", label: "🔁 Reprogramó visita", body: "@ Estimado SOT: {SOT}. Se llamó al cliente y se reprogramó la visita {SUBMOTIVO}. {FIRMA}", needsSubmotivo: true },
  { id: "adelanto-llamada", label: "✅ Adelanto tras llamada", body: "@ Estimado SOT: {SOT}. Se llamó al cliente y procede adelanto, nueva fecha - {SUBMOTIVO}. {FIRMA}", needsSubmotivo: true },
  { id: "reprog-enrutada", label: "🔁 Reprogramada y enrutada", body: "@ Estimado SOT: {SOT}. Se reprogramó la visita {SUBMOTIVO}. SOT enrutada. {FIRMA}", needsSubmotivo: true },
  { id: "reprog-ausente", label: "🔁 Reprogramada - cliente ausente", body: "@ Estimado SOT: {SOT}. Se reprogramó la visita {SUBMOTIVO}. Cliente ausente. {FIRMA}", needsSubmotivo: true },
  { id: "reprog-cliente", label: "🔁 Reprogramada por cliente", body: "@ Estimado SOT: {SOT}. Se reprogramó la visita {SUBMOTIVO}. Reagendado por cliente. {FIRMA}", needsSubmotivo: true },
  { id: "enrutada", label: "✅ SOT enrutada", body: "@ Estimado SOT: {SOT}. SOT enrutada {SUBMOTIVO}. {FIRMA}", needsSubmotivo: true },
  { id: "a365", label: "🛠️ Mesa A365 a cargo", body: "@ Estimado SOT: {SOT}. Caso escalado. 🛠️ La mesa A365 está a cargo de la gestión de las SOT correspondientes a tal departamento y contratista. {FIRMA}" },
  { id: "planta-externa", label: "⏳ Derivado a planta externa", body: "@ Estimado SOT: {SOT}. ⏳ Cliente en proceso Atención - se encuentra en estado Derivado Planta Externa, por lo tanto, estaremos a la espera de la confirmación del área correspondiente para derivar a campo. {FIRMA}" },
  { id: "contratista", label: "🛠️ Escalado a contratista", body: "@ Estimado SOT: {SOT}. Caso escalado a la contratista. 🛠️ En Hitss quedamos a cargo del monitoreo para asegurar su cumplimiento. {FIRMA}" },
  { id: "mesa-depto", label: "⏳ Escalado a mesa del departamento", body: "@ Estimado SOT: {SOT}. ⏳ Cliente en proceso Atención - Se escaló caso a la mesa del departamento. {FIRMA}" },
  { id: "equipos", label: "📦 En espera de equipos", body: "@ Estimado SOT: {SOT}. Nos encontramos en espera de equipos, por favor volver a reenviar su plantilla por la tarde, está por confirmarnos el stock de equipos. {FIRMA}" },
  { id: "accesorios", label: "🛠️ Escalado contratista - accesorios", body: "@ Estimado SOT: {SOT}. Caso escalado a la contratista. 🛠️ En Hitss quedamos a cargo del monitoreo para asegurar su cumplimiento para los casos de accesorios adicionales. {FIRMA}" },
  { id: "cuota-completa", label: "📅 Mantiene fecha - cuota completa", body: "@ SOT: {SOT}. Estimado, por el momento se mantiene fecha de agendamiento según a disposición del SGA. Se verifica que la cuota asignada hasta la fecha se encuentra completa. En caso de tener caídas se priorizará el adelanto de visita. {FIRMA}" },
  { id: "seguimiento-instalado", label: "👀 Seguimiento - Cliente instalado", body: "@ Estimado SOT: {SOT}. Realizando seguimiento a la SOT, se verifica que cliente instalado. {FIRMA}" },
  { id: "seguimiento-rechazada", label: "👀 Seguimiento - SOT rechazada", body: "@ Estimado SOT: {SOT}. Realizando seguimiento a la SOT, se verifica que esta rechazada por {SUBMOTIVO}. {FIRMA}", needsSubmotivo: true },
];

export function renderWsp(
  tpl: WspTemplate,
  vars: { SOT?: string; SUBMOTIVO?: string; FIRMA?: string },
): string {
  return tpl.body.replace(/\{(SOT|SUBMOTIVO|FIRMA)\}/g, (_, k) => {
    const v = (vars as Record<string, string | undefined>)[k];
    return v && v.trim() ? v : "";
  });
}
