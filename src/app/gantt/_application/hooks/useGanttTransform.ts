import { useMemo } from 'react';
import type { GanttItemResponse, DhtmlxGanttData, DhtmlxGanttTask, DhtmlxGanttLink } from '../../_domain/types';
import { PRIORITY_COLORS } from '../../_domain/constants';

export function useGanttTransform(items?: GanttItemResponse[], dependencies?: any[]) {
  return useMemo((): DhtmlxGanttData => {
    if (!items || items.length === 0) {
      return { data: [], links: [] };
    }

    const data: DhtmlxGanttTask[] = items.map((item) => {
      // dhtmlx-gantt espera fechas como Date objects
      const startDate = item.startDate ? new Date(item.startDate) : new Date();
      const endDate = item.endDate ? new Date(item.endDate) : new Date();

      // Calcular duración en días
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: item.id,
        text: item.title,
        start_date: startDate,
        end_date: endDate,
        duration: duration > 0 ? duration : 1,
        progress: item.progress / 100, // dhtmlx usa 0-1, no 0-100
        parent: item.parentId || undefined,
        type: item.type, // task, milestone, summary
        // Campos personalizados
        assignedTo: item.AssignedTo
          ? `${item.AssignedTo.name} ${item.AssignedTo.lastname}`
          : "Sin asignar",
        assignedToId: item.assignedToId || undefined,
        color: item.color || getItemColor(item),
        priority: item.priority
      };
    });

    // Transformar dependencies al formato dhtmlx-gantt
    const links: DhtmlxGanttLink[] = (dependencies || []).map((dep: any) => {
      // Mapeo de tipos del backend a dhtmlx-gantt
      const typeMap: Record<string, string> = {
        "endToStart": "0",   // Finish to Start (default)
        "startToStart": "1", // Start to Start
        "endToEnd": "2",     // Finish to Finish
        "startToEnd": "3"    // Start to Finish
      };

      return {
        id: dep.id,
        source: dep.sourceItemId,
        target: dep.targetItemId,
        type: typeMap[dep.type] || "0"
      };
    });

    return { data, links };
  }, [items, dependencies]);
}

function getItemColor(item: GanttItemResponse): string {
  // Colores basados en tipo
  const typeColors = {
    task: PRIORITY_COLORS.medium,     // Azul
    milestone: PRIORITY_COLORS.high,  // Naranja
    summary: PRIORITY_COLORS.low      // Verde
  };

  return typeColors[item.type] || PRIORITY_COLORS.medium;
}
