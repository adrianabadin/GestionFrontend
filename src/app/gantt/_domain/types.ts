// Re-export schemas types
export type {
  GanttItemType,
  CreateGanttItemType,
  UpdateGanttItemType,
  GanttItemResponse,
  GanttQueryFilters,
  GanttListResponse
} from "./schemas";

// dhtmlx-gantt data format
export interface DhtmlxGanttTask {
  id: string;
  text: string;
  start_date: Date;
  end_date: Date;
  duration?: number;
  progress: number; // 0-1 (dhtmlx usa 0-1, no 0-100)
  parent?: string;
  type?: string;
  // Custom fields
  assignedTo?: string;
  assignedToId?: string;
  color?: string;
  priority?: string;
}

export interface DhtmlxGanttLink {
  id: string;
  source: string;
  target: string;
  type: string; // "0" (finish-to-start), "1" (start-to-start), "2" (finish-to-finish), "3" (start-to-finish)
}

export interface DhtmlxGanttData {
  data: DhtmlxGanttTask[];
  links: DhtmlxGanttLink[];
}

// Prioridades y colores
export type GanttPriority = "low" | "medium" | "high" | "critical";
export type GanttStatus = "planned" | "inProgress" | "completed" | "onHold" | "cancelled";

export const GANTT_PRIORITY_COLORS: Record<GanttPriority, string> = {
  low: "#4CAF50",      // Verde
  medium: "#2196F3",   // Azul
  high: "#FF9800",     // Naranja
  critical: "#F44336"  // Rojo
};

export const GANTT_STATUS_LABELS: Record<GanttStatus, string> = {
  planned: "Planificada",
  inProgress: "En Progreso",
  completed: "Completada",
  onHold: "En Pausa",
  cancelled: "Cancelada"
};
