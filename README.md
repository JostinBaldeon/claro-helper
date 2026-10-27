# WhatsApp Assistant Pro

Quiero crear una aplicación web interna llamada Asistente Help Desk Claro - Instalaciones, orientada a reducir el tiempo de atención de tickets recibidos por WhatsApp sobre instalaciones de internet.



La aplicación debe funcionar como un panel de apoyo para un operador Help Desk. No debe conectarse directamente a WhatsApp, TOA ni SGA. El flujo será manual y seguro: el usuario pega el ticket de WhatsApp, la web extrae los datos importantes, clasifica el caso, muestra checklist de validación para TOA y SGA, y genera una respuesta lista para copiar y pegar en WhatsApp.



Usar React + TypeScript + Tailwind CSS + shadcn/ui. La interfaz debe ser moderna, rápida, limpia, tipo dashboard operativo. Debe estar optimizada para escritorio, porque se usará junto con WhatsApp Web, TOA y SGA abiertos en otras pestañas.



Objetivo principal:

Reducir el tiempo de atención de tickets repetitivos mediante:



1. Extracción automática de datos del ticket.

2. Clasificación automática del caso.

3. Botones de checklist para validaciones en TOA y SGA.

4. Generación automática de plantilla de respuesta.

5. Botón para copiar SOT.

6. Botón para copiar respuesta.

7. Historial local de tickets atendidos.



IMPORTANTE SOBRE PRIVACIDAD:

La app no debe enviar datos a servidores externos.

No debe conectarse a sistemas reales de Claro.

No debe almacenar datos sensibles de forma obligatoria.

El historial debe guardarse solo en localStorage.

Debe existir botón “Limpiar datos”.

Debe existir advertencia visible: “No pegues datos sensibles si no corresponde. Herramienta local de apoyo operativo”.



Estructura visual de la app:



Crear una pantalla principal con 4 secciones:



1. Panel izquierdo: “Ticket WhatsApp”



- Textarea grande donde el usuario pega el ticket.

- Botón “Analizar ticket”.

- Botón “Limpiar”.

- Botón “Ejemplo de ticket”.

- Contador de caracteres.

- Soportar tickets en mayúsculas, minúsculas y con formatos variables.



2. Panel central superior: “Datos detectados”

   Mostrar cards o filas con:



- Tipo de caso

- Prioridad

- SOT

- Cliente

- DNI/RUC

- Teléfono

- Departamento

- Distrito

- Fecha de instalación

- Franja detectada

- Contrata

- DAC

- Observación

- Acción sugerida



Cada campo debe tener estado:



- Detectado

- No detectado

- Editar manualmente



Agregar botón “Copiar SOT”.



3. Panel central inferior: “Validación TOA y SGA”

   Crear dos bloques de checklist.



Checklist TOA:



- Estado en agenda

- Estado cancelado

- Estado reagendado

- Estado pendiente

- Estado en ejecución

- Cliente confirmado programación

- Cliente confirmado seguimiento

- Cliente no contactado

- Cliente recuperado

- Alerta de reagendamiento

- Franja vigente

- Franja vencida

- Tiene técnico/cuadrilla

- Sin técnico/cuadrilla

- Requiere escalamiento

- Observación de seguimiento registrada

- Fuera de TOA

- Adelanto por contratista

- Retorno a campo

- Derivado vía buzón



Checklist SGA:



- En agenda

- Reagendado

- Cancelado

- Pendiente

- En ejecución

- Tiene cuadrilla

- No tiene cuadrilla

- Coincide fecha/franja con WhatsApp

- No coincide fecha/franja con WhatsApp

- Tiene historial de reprogramación

- Tiene observación de contacto

- Tiene anotación operativa

- Tiene servicios a instalar

- Fecha compromiso vencida

- Fecha compromiso vigente



Los checklists deben funcionar como botones tipo toggle. Cuando el usuario marque o desmarque una opción, la respuesta sugerida debe actualizarse automáticamente.



4. Panel derecho: “Respuesta sugerida”



- Mostrar respuesta generada en una caja editable.

- Botón “Copiar respuesta”.

- Botón “Guardar en historial”.

- Botón “Regenerar respuesta”.

- Selector de tono:

  - Formal

  - Corto

  - Detallado

- Selector de destino:

  - Asesor comercial

  - Mesa de seguimiento

  - Buzón

  - Contrata



Casos que debe detectar automáticamente:



1. INCUMPLIMIENTO

   Palabras clave:



- incumplimiento

- no fue atendido

- fuera de franja

- franja vencida

- no llegaron

- cliente esperando

- cliente crítico

- no atendieron

- no se acercaron



Prioridad: Alta



2. ADELANTAR VISITA

   Palabras clave:



- adelantar visita

- adelanto

- urgente

- que se acerquen hoy

- hoy sí o sí

- cliente solicita que se acerquen

- no podrá otro día



Prioridad: Crítica



3. MANTENER FRANJA

   Palabras clave:



- mantener franja

- confirma para hoy

- cliente confirma

- mantener PM1

- mantener AM1

- mantener AM2

- mantener PM2

- está a la espera de los técnicos



Prioridad: Media/Alta



4. COORDINACIÓN / REPROGRAMACIÓN

   Palabras clave:



- coordinación

- reprogramar

- reprogramación

- desea visita

- solicita visita

- jueves

- viernes

- sábado

- lunes

- por disponibilidad laboral

- cambio de fecha

- nueva fecha



Prioridad: Media



5. RESCATE COMERCIAL

   Palabras clave:



- rescate comercial

- cliente sí desea

- confirma paquete

- confirma disponibilidad

- crítico

- apoyo para la atención

- contesta también por whatsapp



Prioridad: Alta



6. CASO GENERAL

   Cuando no se detecta ninguno de los anteriores.



Extracción automática de datos:



Crear una función parseTicket(texto) que extraiga:



SOT:



- Buscar patrones como “SOT: 88459734”, “SOT 88459734”, “SOT-88459734”.

- También detectar números de 7 a 10 dígitos cercanos a la palabra SOT.



Cliente:



- Buscar línea que empiece con CLIENTE:

- También aceptar CLIENTE;



DNI/RUC:



- Buscar “DNI”, “RUC”, “DNI/RUC”

- Extraer número cercano.



Teléfono:



- Buscar TELEF, TELÉFONO, NUMERO, NÚMERO, CELULAR.

- Extraer número de 9 dígitos o con prefijo +51.



Departamento:



- Buscar DEPARTAMENTO:, DPTO:, DEP:



Distrito:



- Buscar DISTRITO:



Fecha instalación:



- Buscar “FECHA”, “FECHA Y HORARIO DE INSTALACION”, “FECHA INSTALACION”, “FECHA DE PROGRAMACION”.

- Detectar formatos dd/mm/yyyy, dd/mm/yy y fecha con hora.



Franja:

Detectar:



- AM1

- AM2

- PM1

- PM2

- Horarios como 08:00, 11:00, 14:00, 16:00

- Si aparece 11:00, sugerir AM2.

- Si aparece 14:00, sugerir PM1.

- Si aparece 08:00, sugerir AM1.

- Si aparece 16:00 o más, sugerir PM2.



Contrata:



- Buscar CONTRATA:



DAC:



- Buscar DAC:



Observación:



- Buscar OBS:, OBSERVACION:, OBSERVACIÓN:

- Guardar todo el texto posterior como observación.



Reglas para generar respuesta:



La respuesta debe usar este formato base:



“Estimado asesor, se valida la SOT {SOT}. {mensaje_principal} {accion}. Quedamos atentos.”



Pero debe adaptarse según el caso y los checks seleccionados.



Plantillas base:



CASO INCUMPLIMIENTO:

Si franja vencida:

“Estimado asesor, se valida la SOT {SOT}. Se evidencia incumplimiento de franja, por lo que se procede con la revisión correspondiente para regularizar la atención y/o reprogramación según disponibilidad. Quedamos atentos a la actualización.”



Si franja vigente:

“Estimado asesor, se valida la SOT {SOT}. La orden aún se encuentra dentro de la franja programada, por lo que se mantiene en seguimiento para la atención correspondiente. Quedamos atentos.”



Si sin técnico/cuadrilla:

“Estimado asesor, se valida la SOT {SOT}. La orden presenta solicitud por incumplimiento; sin embargo, no se evidencia técnico/cuadrilla asignada. Se solicita apoyo para validación operativa y asignación según disponibilidad. Quedamos atentos.”



Si tiene técnico/cuadrilla:

“Estimado asesor, se valida la SOT {SOT}. La orden cuenta con técnico/cuadrilla asignada y se mantiene en gestión para la atención correspondiente. Quedamos atentos.”



CASO ADELANTAR VISITA:

Si tiene técnico/cuadrilla:

“Estimado asesor, se valida la SOT {SOT}. Cliente solicita adelanto de visita para el día de hoy. Se valida con la contrata/cuadrilla correspondiente para revisar disponibilidad de atención. La gestión queda sujeta a disponibilidad operativa en zona.”



Si sin técnico/cuadrilla:

“Estimado asesor, se valida la SOT {SOT}. Cliente solicita adelanto de visita; sin embargo, no se evidencia técnico/cuadrilla asignada por el momento. Se solicita apoyo para validar disponibilidad operativa. La atención queda sujeta a disponibilidad en zona.”



Respuesta general:

“Estimado asesor, se valida la SOT {SOT}. Cliente solicita adelantar la visita de manera urgente. Se procede con la validación de disponibilidad operativa con la contrata correspondiente. La atención queda sujeta a disponibilidad en zona.”



CASO MANTENER FRANJA:

“Estimado asesor, se valida la SOT {SOT}. Cliente confirma disponibilidad para la visita programada y solicita mantener la franja indicada. Se mantiene en seguimiento para la atención correspondiente. Quedamos atentos.”



Si cliente confirmado programación:

“Estimado asesor, se valida la SOT {SOT}. Cliente figura confirmado para la programación, por lo que se mantiene la franja indicada para la atención correspondiente. Quedamos atentos.”



CASO COORDINACIÓN / REPROGRAMACIÓN:

“Estimado asesor, se valida la SOT {SOT}. Cliente solicita coordinación/reprogramación de visita para la fecha y franja indicada. Se valida disponibilidad en agenda para proceder con la actualización correspondiente. Quedamos atentos.”



Si reagendado:

“Estimado asesor, se valida la SOT {SOT}. La orden figura reagendada según disponibilidad registrada en sistema. Favor validar con el cliente la nueva fecha y franja de atención. Quedamos atentos.”



Si no coincide fecha/franja:

“Estimado asesor, se valida la SOT {SOT}. Se evidencia diferencia entre la fecha/franja solicitada y la programación registrada. Se solicita validar disponibilidad para regularizar la agenda según lo requerido por el cliente. Quedamos atentos.”



CASO RESCATE COMERCIAL:

“Estimado asesor, se valida la SOT {SOT}. Cliente confirma interés en continuar con la instalación. Se solicita apoyo para priorizar la atención, considerando que el caso corresponde a rescate comercial. Quedamos atentos.”



Si cliente recuperado:

“Estimado asesor, se valida la SOT {SOT}. Cliente figura como recuperado y confirma interés en continuar con la instalación. Se mantiene gestión para priorizar la atención correspondiente. Quedamos atentos.”



CASO CANCELADO:

Si TOA o SGA marca cancelado:

“Estimado asesor, se valida la SOT {SOT}. La orden figura cancelada en sistema, por lo que no es posible continuar con la gestión de instalación bajo esta solicitud. Favor validar generación de nueva solicitud o regularización comercial según corresponda.”



CASO GENERAL:

“Estimado asesor, se valida la SOT {SOT}. Se procede con la revisión correspondiente en TOA y SGA para brindar actualización del caso. Quedamos atentos.”



Reglas de prioridad:



- Si caso es ADELANTAR VISITA y contiene “urgente”, prioridad Crítica.

- Si caso contiene “cliente crítico”, prioridad Alta.

- Si caso es INCUMPLIMIENTO, prioridad Alta.

- Si caso es RESCATE COMERCIAL, prioridad Alta.

- Si caso es MANTENER FRANJA, prioridad Media/Alta.

- Si caso es COORDINACIÓN, prioridad Media.

- Si TOA o SGA está cancelado, mostrar alerta roja.

- Si franja vencida, mostrar alerta naranja.

- Si cliente confirmado, mostrar badge verde.

- Si sin técnico/cuadrilla, mostrar badge amarillo.



Historial:

Crear sección inferior “Historial de atención”.

Cada ticket guardado debe tener:



- Fecha/hora de atención

- SOT

- Caso

- Prioridad

- Estado generado

- Respuesta final

- Botón copiar respuesta

- Botón eliminar

- Buscador por SOT

- Filtro por caso

- Filtro por prioridad



El historial debe guardarse en localStorage.



Métricas simples:

Agregar cards superiores:



- Tickets atendidos hoy

- Incumplimientos

- Adelantos urgentes

- Reprogramaciones

- Rescates comerciales

- Promedio estimado de tiempo ahorrado



El tiempo ahorrado puede calcularse como 2 minutos por ticket guardado.



UX/UI:



- Usar colores discretos.

- Rojo para crítico/cancelado.

- Naranja para incumplimiento/franja vencida.

- Verde para confirmado/en agenda.

- Azul para coordinación.

- Morado para rescate comercial.

- Diseño tipo dashboard.

- Cards con bordes suaves.

- Botones grandes y claros.

- Debe funcionar sin backend.

- Debe ser rápido y simple.



Funciones obligatorias:



- Analizar ticket.

- Copiar SOT.

- Copiar respuesta.

- Limpiar ticket.

- Editar datos detectados.

- Marcar checks TOA.

- Marcar checks SGA.

- Generar respuesta automática.

- Editar respuesta antes de copiar.

- Guardar historial.

- Eliminar historial.

- Exportar historial a CSV.

- Cargar ejemplo de ticket.



Ejemplos de tickets para pruebas:



Ejemplo 1:

INCUMPLIMIENTO

CLIENTE: CLIENTE DEMO

SOT: 88479396

FECHA Y HORARIO DE INSTALACION: 23/06/2026 11:00

TELEF: 999999999

DISTRITO: MARCONA

DPTO: ICA

CONTRATA: INSERTEL

OBSERVACION: CLIENTE EN CASA A LA ESPERA DE LA VISITA

DAC: MCORTEZ CALL



Ejemplo 2:

ADELANTAR VISITA URGENTE

CLIENTE: CLIENTE DEMO

SOT: 88562191

DEPARTAMENTO: LIMA

DISTRITO: SAN MARTIN DE PORRES

NUMERO: 999999999

CONTRATA: CARLEI TELECOMUNICACIONES SAC

OBS: CLIENTE SOLICITA QUE SE ACERQUEN HOY SÍ O SÍ ES URGENTE

DAC: KONECTAR



Ejemplo 3:

MANTENER FRANJA PM1

SOT: 88459734

DEPARTAMENTO: ANCASH

DISTRITO: HUARAZ

FECHA: 23/06/2026 14:00

TELEFONO: 999999999

CONTRATA: SERVICIOS SAVAL S.A.C.

DNI/RUC: 12345678

OBS: CLIENTE CRITICO CONFIRMO PARA HOY, ESTA A LA ESPERA DE LOS TECNICOS, NO PODRA OTRO DIA

DAC: MCORTEZ



Ejemplo 4:

COORDINACIÓN

CLIENTE: CLIENTE DEMO

SOT: 88532412

FECHA VENTA: 22/06/2026

FECHA Y HORARIO DE INSTALACION: 23/06/2026 14:00

TELEF: 999999999

DISTRITO: PAUCARPATA

DPTO: AREQUIPA

CONTRATA: SOLUCIONES Y SERVICIOS MULTIPLES PERU SAC

OBSERVACION: CLIENTE DESEA VISITA PARA EL JUEVES 25 EN FRANJA AM1 POR DISPONIBILIDAD LABORAL

DAC: MCORTEZ CALL



Ejemplo 5:

RESCATE COMERCIAL

CLIENTE: CLIENTE DEMO

SOT: 88476783

FECHA VENTA: 02/06/2026

FECHA Y HORARIO DE INSTALACION: 23/06

TELEF: 999999999

DISTRITO: WANCHAQ

DPTO: CUSCO

CONTRATA: TELECOMUNICACIONES MEGATIC SCRL

OBSERVACION: CLIENTE SI DESEA, ESTA CRITICO, CONFIRMA PAQUETE Y DISPONIBILIDAD, POR FAVOR APOYO PARA LA ATENCION

DAC: MCORTEZ CALL



Validaciones:



- Si no detecta SOT, mostrar alerta: “No se detectó SOT. Ingrésala manualmente.”

- Si detecta más de una SOT, mostrar selector para elegir la correcta.

- Si no detecta caso, asignar “Caso general”.

- Si no detecta franja, permitir elegir manualmente AM1, AM2, PM1, PM2.

- Si no detecta fecha, permitir ingresarla manualmente.

- La respuesta no debe bloquearse por campos faltantes.

- Usar “XXXX” o “No detectado” donde falte información.



Crear una app completamente funcional con datos de prueba, sin integraciones externas, con diseño profesional y código limpio. Priorizar que sea útil para operación real diaria.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9e104a02-feca-458c-9de2-b7b4e3620edb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
