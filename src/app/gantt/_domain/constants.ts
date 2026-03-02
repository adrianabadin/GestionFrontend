import type { GanttPriority, GanttStatus } from "./types";

// Colores por prioridad
export const PRIORITY_COLORS: Record<GanttPriority, string> = {
  low: "#4CAF50",      // Verde
  medium: "#2196F3",   // Azul
  high: "#FF9800",     // Naranja
  critical: "#F44336"  // Rojo
};

// Etiquetas de estado
export const STATUS_LABELS: Record<GanttStatus, string> = {
  planned: "Planificada",
  inProgress: "En Progreso",
  completed: "Completada",
  onHold: "En Pausa",
  cancelled: "Cancelada"
};

// Etiquetas de prioridad
export const PRIORITY_LABELS: Record<GanttPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica"
};

// Configuración de dhtmlx-gantt
export const GANTT_CONFIG = {
  dateFormat: "%Y-%m-%d %H:%i",
  scaleUnit: "week",
  step: 1,
  dateScale: "Semana %W",
  subscales: [
    { unit: "day", step: 1, date: "%d %M" }
  ],
  columns: [
    { name: "text", label: "Actividad", width: 200, tree: true },
    { name: "assignedTo", label: "Asignado", width: 120 },
    { name: "start_date", label: "Inicio", width: 80, align: "center" as const },
    { name: "duration", label: "Duración", width: 60, align: "center" as const }
  ],
  dragMove: true,
  dragResize: true
};
