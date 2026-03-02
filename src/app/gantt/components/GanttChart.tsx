"use client";
import { useEffect, useRef, useState } from "react";
import { gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import "./gantt-tooltip.css";
import { Spinner, Typography, Button } from "@material-tailwind/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import {
  useGetGanttItemsQuery,
  useGetGanttItemQuery,
  usePatchGanttDatesMutation,
  usePatchGanttProgressMutation,
  useUpdateGanttItemMutation,
  useGetDependenciesQuery,
  useCreateDependencyMutation,
  useDeleteDependencyMutation,
  type GanttItemResponse,
  useGetDepartmentsQuery,
  useGetStatesQuery,
  ganttApiSlice,
  GanttQueryFilters,
} from "@/_core/api";
import { useGanttTransform } from "../_application/hooks/useGanttTransform";
import { GANTT_CONFIG } from "../_domain/constants";
import { ListGanttItemsType } from "../../../../../managmentpanelback/src/gantt/gantt.schema";

interface GanttChartProps {
  department: { id: string; name: string };
  state?: { id: string; name: string };
  assignedToId?: string;
  onEditItem?: (item: GanttItemResponse) => void;
}

export function GanttChart({
  department,
  state,
  assignedToId,
  onEditItem,
}: GanttChartProps) {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const [patchDates] = usePatchGanttDatesMutation();
  const [patchProgress] = usePatchGanttProgressMutation();
  const [updateItem] = useUpdateGanttItemMutation();
  const [createDependency] = useCreateDependencyMutation();
  const [deleteDependency] = useDeleteDependencyMutation();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [exportOrientation, setExportOrientation] = useState<"landscape" | "portrait">("landscape");
  const [exportRange, setExportRange] = useState<"current" | "year" | "semester1" | "semester2">("current");

  // Variables para manejar click simple vs drag (Mejora UX #3)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);

  // Timer para debounce de actualizaciones (500ms)
  const updateDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: departmentsData } = useGetDepartmentsQuery({});
  const { data: statesData } = useGetStatesQuery(undefined);
  // Query para obtener el item completo cuando se hace doble click
  const { data: selectedItem } = useGetGanttItemQuery(selectedItemId || "", {
    skip: !selectedItemId,
  });
  const {
    data: response,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetGanttItemsQuery(
    {
      page: 1,
      limit: 100,
      departmentsId: department.id,
      demographyId: state?.id,
    },
    {
      // ✅ POLLING: Refetch cada 30 segundos para sincronizar con otros usuarios
      pollingInterval: 30000, // 30 segundos
      // ✅ Pausar polling cuando la pestaña no está visible
      skipPollingIfUnfocused: true,
    }
  );
  // Construir filtros para la query
  // TODO: Ajustar filtros cuando el backend esté listo con departmentsId y demographyId
  //if (department === undefined || state === undefined) return;
  // const [filters, setFilters] = useState<GanttQueryFilters>({
  //   page: 1,
  //   limit: 100,
  // });
  // const [
  //   getGantItems,
  //   { data: response, isFetching, isSuccess, isError, error },
  // ] = ganttApiSlice.endpoints.getGanttItems.useLazyQuery(); //useGetGanttItemsQuery(filters as ListGanttItemsType);
  // useEffect(() => {
  //   if (
  //     statesData !== undefined &&
  //     departmentsData !== undefined &&
  //     department !== undefined &&
  //     state !== undefined
  //   ) {
  //     setFilters((prev) => {
  //       const res = {
  //         page: prev?.page ?? 1,
  //         limit: prev?.limit ?? 100,

  //         departmentsId: departmentsData.find((e) => e.name === department)?.id,
  //         demographyId: statesData.find((e) => e.state === state)?.id,
  //       };
  //       getGantItems(res);

  //       return res;
  //     });
  //   }
  // }, [
  //   setFilters,
  //   department,
  //   state,
  //   statesData,
  //   departmentsData,
  //   getGantItems,
  // ]);
  // //console.log({ filters });
  // console.log({ response }, "respuesta");

  // Obtener dependencies de los items actuales
  const itemIds = response?.data?.map((item) => item.id) || [];
  const { data: dependencies } = useGetDependenciesQuery(
    { itemIds },
    { skip: itemIds.length === 0 } // Solo hacer query si hay items
  );

  // Transformar datos + dependencies al formato dhtmlx-gantt
  const transformedData = useGanttTransform(response?.data, dependencies);
  // if (isSuccess) {
  //   console.log(
  //     { transformedData, department, estado: state?.name, response },
  //     "data transformada",
  //   );
  // }
  // Inicializar dhtmlx-gantt y cargar datos
  useEffect(() => {
    console.log("🔧 useEffect combinado:", {
      containerExists: !!ganttContainer.current,
      isInitialized: isInitialized.current,
      isSuccess,
      hasTransformedData: !!transformedData,
      state: state?.name,
      department: department.name,
    });

    // Salir si no hay container
    if (!ganttContainer.current) {
      console.log("⚠️ Container no disponible aún");
      return;
    }

    // IMPORTANTE: dhtmlx-gantt es un singleton global
    // Limpiar datos de instancia anterior si existe (por cambio de tabs)
    if (isInitialized.current) {
      console.log("🔄 Limpiando instancia anterior de gantt...");
      try {
        // ❌ NO usar destructor() - mata la instancia global para siempre
        // ✅ Usar clearAll() - limpia datos pero mantiene estructura interna
        gantt.clearAll();
        gantt.detachAllEvents(); // Limpiar event listeners
      } catch (e) {
        console.warn("⚠️ Error controlado al limpiar gantt (cambio de tab):", e);
      }
      isInitialized.current = false;
    }

    // Limpiar antes de inicializar para asegurar estado limpio
    gantt.clearAll();

    // Inicializar gantt para esta tab
    console.log("⚙️ Inicializando dhtmlx-gantt...");

    // IMPORTANTE: No configurar date_format cuando pasamos Date objects
    // useGanttTransform ya convierte las fechas a Date objects

    // Configurar locale en español
    gantt.locale = {
      date: {
        month_full: [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ],
        month_short: [
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Sep",
          "Oct",
          "Nov",
          "Dic",
        ],
        day_full: [
          "Domingo",
          "Lunes",
          "Martes",
          "Miércoles",
          "Jueves",
          "Viernes",
          "Sábado",
        ],
        day_short: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      },
      labels: {
        new_task: "Nueva tarea",
        dhx_cal_today_button: "Hoy",
        day_tab: "Día",
        week_tab: "Semana",
        month_tab: "Mes",
        new_event: "Nuevo evento",
        icon_save: "Guardar",
        icon_cancel: "Cancelar",
        icon_details: "Detalles",
        icon_edit: "Editar",
        icon_delete: "Eliminar",
        confirm_closing: "",
        confirm_deleting: "¿Está seguro de que desea eliminar el elemento?",
        section_description: "Descripción",
        section_time: "Período de tiempo",
        section_type: "Tipo",
        column_text: "Nombre de tarea",
        column_start_date: "Inicio",
        column_duration: "Duración",
        column_add: "",
        link: "Enlace",
        confirm_link_deleting: "será eliminado",
        link_start: "(inicio)",
        link_end: "(fin)",
        type_task: "Tarea",
        type_project: "Proyecto",
        type_milestone: "Hito",
        minutes: "Minutos",
        hours: "Horas",
        days: "Días",
        weeks: "Semanas",
        months: "Meses",
        years: "Años",
      },
    };

    // Configuración de escala temporal: SOLO Meses con semanas como sub-escala
    gantt.config.scales = [
      { unit: "month", step: 1, format: "%F" },
      { unit: "week", step: 1, format: "S%W" },
    ];

    // IMPORTANTE: Configuración para controlar la visualización
    gantt.config.min_column_width = 50; // Ancho mínimo de cada semana
    gantt.config.scale_height = 60; // Altura total del header (dos escalas)

    // ========== Grid lateral mínimo para drag vertical ==========
    gantt.config.grid_width = 300; // Ancho del grid para columna de nombre + jerarquía
    gantt.config.columns = [
      {
        name: "text",
        label: "Tarea",
        tree: true, // Habilitar jerarquía visual (tree con expand/collapse)
        width: 280,
        resize: true
      }
    ];

    // Habilitar drag & drop
    gantt.config.drag_move = true; // Mover horizontalmente (fechas)
    gantt.config.drag_resize = true; // Redimensionar barras
    gantt.config.drag_project = true; // Arrastrar verticalmente para cambiar parent/jerarquía
    gantt.config.order_branch = true; // Reordenar items dentro del mismo nivel
    gantt.config.order_branch_free = true; // Permitir mover items entre diferentes ramas (parent/child)
    gantt.config.drag_links = true; // Crear links/dependencies (flechas)

    // Configurar modos de drag disponibles
    gantt.config.drag_mode = {
      resize: true,    // Redimensionar
      progress: true,  // Cambiar progreso
      move: true,      // Mover fechas
      ignore: false    // No ignorar ningún drag
    };

    // Auto-scheduling deshabilitado (manual)
    gantt.config.auto_scheduling = false;
    gantt.config.auto_scheduling_strict = false;

    // ========== MEJORA UX #3: Desactivar editor nativo de dhtmlx-gantt ==========
    // Esto previene que el doble-click abra el lightbox (editor) nativo
    gantt.config.details_on_dblclick = false;
    gantt.config.details_on_create = false;

    // Habilitar jerarquía (tree)
    gantt.config.open_tree_initially = true;

    // Fit tasks to scale (importante para ver las barras)
    gantt.config.fit_tasks = true;

    // ========== MEJORA UX #1: Activar plugin de tooltip ==========
    gantt.plugins({
      tooltip: true,
    });

    // ========== MEJORA UX #1: Template de tooltip expandido (Título + Asignado + Prioridad + Progreso + Fechas) ==========
    gantt.templates.tooltip_text = function (
      start: Date,
      end: Date,
      task: any
    ): string {
      const progressPercent = Math.round((task.progress || 0) * 100);
      const formatDate = gantt.date.date_to_str("%d/%m/%Y");

      // Mapeo de prioridades a español
      const priorityLabels: Record<string, string> = {
        low: "Baja",
        medium: "Media",
        high: "Alta",
        critical: "Crítica",
      };

      let tooltip = `<b>${task.text}</b>`;

      // Asignado (si existe)
      if (task.assignedTo) {
        tooltip += `<br/><b>Asignado:</b> ${task.assignedTo}`;
      }

      // Prioridad (si existe)
      if (task.priority) {
        tooltip += `<br/><b>Prioridad:</b> ${priorityLabels[task.priority] || task.priority}`;
      }

      tooltip += `<br/><b>Progreso:</b> ${progressPercent}%`;
      tooltip += `<br/><b>Inicio:</b> ${formatDate(start)}`;
      tooltip += `<br/><b>Fin:</b> ${formatDate(end)}`;

      return tooltip;
    };

    // ========== MEJORA UX #9: Mostrar título y progreso DENTRO de la barra ==========
    gantt.templates.task_text = function (
      start: Date,
      end: Date,
      task: any
    ): string {
      const progressPercent = Math.round((task.progress || 0) * 100);
      // Mostrar título y progreso dentro de la barra
      return `${task.text} (${progressPercent}%)`;
    };

    // ========== MEJORA UX #5: Colores de barras según prioridad ==========
    gantt.templates.task_class = function (start: Date, end: Date, task: any): string {
      // Asignar clase CSS según prioridad
      if (task.priority) {
        return `priority-${task.priority}`;
      }
      // Default: prioridad media (azul)
      return "priority-medium";
    };

    // ========== MEJORA UX #3: Click simple con delay inteligente para abrir modal ==========
    gantt.attachEvent("onTaskClick", (id: any, e: any) => {
      // Iniciar timer: si no se inicia drag en 250ms, abrir modal
      clickTimer.current = setTimeout(() => {
        if (!isDragging.current) {
          setSelectedItemId(id as string);
        }
      }, 250);
      return true; // Permitir selección visual default
    });

    // Evento: Antes de iniciar drag, cancelar apertura del modal
    gantt.attachEvent("onBeforeTaskDrag", (id: any, mode: any, e: any) => {
      // El usuario empezó a arrastrar: cancelar apertura del modal
      isDragging.current = true;
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
        clickTimer.current = null;
      }
      return true; // Permitir drag
    });

    // Evento: después de mover/redimensionar barra
    // ========== AUTO-SAVE: Drag & Drop con debounce de 500ms ==========
    gantt.attachEvent("onAfterTaskDrag", (id: any, mode: any, e: any) => {
      // Reset flag después del drag
      isDragging.current = false;

      // Cancelar debounce anterior si existe
      if (updateDebounceTimer.current) {
        clearTimeout(updateDebounceTimer.current);
      }

      // Debounce de 500ms para permitir correcciones
      updateDebounceTimer.current = setTimeout(() => {
        // ⚠️ IMPORTANTE: Obtener la tarea desde el gantt, NO usar el parámetro 'e' (que es el MouseEvent)
        const task = gantt.getTask(id);
        console.log(`💾 Auto-guardando cambios (mode: ${mode})`, {
          id,
          task,
          parent: task.parent,
          $original_parent: task.$original_parent,
          $drop_target: task.$drop_target
        });

        // Mode puede ser: "resize" (cambio de duración), "move" (cambio de fechas), "progress" (cambio de progreso)
        if (mode === "resize" || mode === "move") {
          // Validar que las fechas existan antes de actualizar
          if (task.start_date && task.end_date) {
            patchDates({
              id: id as string,
              startDate: task.start_date.toISOString(),
              endDate: task.end_date.toISOString(),
            })
              .unwrap()
              .then(() => console.log("✅ Fechas actualizadas"))
              .catch((error) => console.error("❌ Error al actualizar fechas:", error));
          } else {
            console.warn("⚠️ No se pueden guardar fechas: start_date o end_date es undefined", task);
          }
        }

        // Si cambió el parent, actualizar la relación
        // Normalizar valores: dhtmlx usa "0" para root, nosotros usamos null
        const currentParent = task.parent === "0" || task.parent === 0 || !task.parent ? null : task.parent;
        const originalParent = task.$original_parent === "0" || task.$original_parent === 0 || !task.$original_parent ? null : task.$original_parent;

        if (currentParent !== originalParent) {
          console.log(`📎 Actualizando parent: ${originalParent || "root"} → ${currentParent || "root"}`);
          updateItem({
            id: id as string,
            data: { parentId: currentParent },
          })
            .unwrap()
            .then(() => console.log("✅ Parent actualizado"))
            .catch((error) => console.error("❌ Error al actualizar parent:", error));
        }

        // Mode "progress" - cambio de progreso (barra interna)
        if (mode === "progress") {
          patchProgress({
            id: id as string,
            progress: Math.round(task.progress * 100), // dhtmlx usa 0-1, backend usa 0-100
          })
            .unwrap()
            .then(() => console.log("✅ Progreso actualizado"))
            .catch((error) => console.error("❌ Error al actualizar progreso:", error));
        }
      }, 500);
    });

    // ========== AUTO-SAVE: Cambio de parent/posición en jerarquía ==========
    gantt.attachEvent("onAfterTaskMove", (id: any, parent: any, tindex: any) => {
      console.log(`🌳 Cambio de parent detectado en onAfterTaskMove:`, { id, parent, tindex });

      // Cancelar debounce anterior
      if (updateDebounceTimer.current) {
        clearTimeout(updateDebounceTimer.current);
      }

      // Debounce de 500ms
      updateDebounceTimer.current = setTimeout(() => {
        const task = gantt.getTask(id);
        // Normalizar parent: dhtmlx usa "0" para root, nosotros usamos null
        const parentId = parent === "0" || parent === 0 || !parent ? null : parent;

        console.log(`📎 Guardando cambio de parent:`, {
          taskId: id,
          taskName: task.text,
          newParent: parentId || "root"
        });

        updateItem({
          id: id as string,
          data: { parentId },
        })
          .unwrap()
          .then(() => console.log("✅ Parent actualizado en BD"))
          .catch((error) => console.error("❌ Error al actualizar parent:", error));
      }, 500);
    });

    // ========== AUTO-SAVE: Cambio de progreso con debounce de 500ms ==========
    gantt.attachEvent("onAfterTaskUpdate", (id: any, task: any) => {
      // Detectar si cambió el progreso
      const originalProgress = task.$original?.progress;
      const currentProgress = task.progress;

      if (originalProgress !== undefined && originalProgress !== currentProgress) {
        console.log(`📊 Progreso cambió: ${Math.round(originalProgress * 100)}% → ${Math.round(currentProgress * 100)}%`);

        // Cancelar debounce anterior
        if (updateDebounceTimer.current) {
          clearTimeout(updateDebounceTimer.current);
        }

        // Debounce de 500ms
        updateDebounceTimer.current = setTimeout(() => {
          patchProgress({
            id: id as string,
            progress: Math.round(currentProgress * 100), // Backend espera 0-100
          })
            .unwrap()
            .then(() => console.log("✅ Progreso actualizado"))
            .catch((error) => console.error("❌ Error al actualizar progreso:", error));
        }, 500);
      }
    });

    // ========== AUTO-SAVE: Links/Dependencies (flechas) ==========
    gantt.attachEvent("onAfterLinkAdd", (id: any, link: any) => {
      console.log("🔗 Link creado:", { id, source: link.source, target: link.target, type: link.type });

      // Mapeo de tipos de dhtmlx-gantt a backend
      const typeMap: Record<string, string> = {
        "0": "endToStart",   // Finish to Start (default)
        "1": "startToStart", // Start to Start
        "2": "endToEnd",     // Finish to Finish
        "3": "startToEnd"    // Start to Finish
      };

      createDependency({
        sourceItemId: link.source,
        targetItemId: link.target,
        type: typeMap[link.type] || "endToStart",
        lagDays: 0
      })
        .unwrap()
        .then((result) => {
          console.log("✅ Dependency guardada en BD:", result);
          // Actualizar el ID del link en dhtmlx-gantt con el ID del backend
          if (result.id) {
            gantt.changeLinkId(id, result.id);
          }
        })
        .catch((error: any) => {
          // Si es error P2002 (duplicado), significa que ya existe - no hacer nada
          if (error?.data?.errorContent?.code === "P2002") {
            console.warn("⚠️ Dependency ya existe en BD (duplicado ignorado)");
            // No eliminar el link visual - ya existe en BD
            return;
          }

          console.error("❌ Error al guardar dependency:", error);
          // Solo eliminar el link visual si es otro tipo de error
          gantt.deleteLink(id);
        });
    });

    gantt.attachEvent("onAfterLinkDelete", (id: any, link: any) => {
      console.log("🗑️ Link eliminado:", { id, source: link.source, target: link.target });

      // Solo intentar eliminar en BD si el ID es UUID (no temporal)
      // IDs temporales de dhtmlx son números, IDs reales son UUID strings
      const isUUID = typeof id === "string" && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      if (!isUUID) {
        console.warn("⚠️ Link con ID temporal - no se puede eliminar de BD:", id);
        return;
      }

      deleteDependency(id as string)
        .unwrap()
        .then(() => console.log("✅ Dependency eliminada de BD"))
        .catch((error) => console.error("❌ Error al eliminar dependency:", error));
    });

    // ========== MEJORA UX #7: Keyboard Navigation (WCAG 2.1 AA) ==========
    gantt.attachEvent("onGanttReady", function () {
      // Hacer el contenedor del gantt focusable
      if (ganttContainer.current) {
        ganttContainer.current.setAttribute("tabindex", "0");
      }
    });

    // Event listener para navegación por teclado
    gantt.attachEvent("onKeyDown", function (keyCode: number, event: KeyboardEvent) {
      const selectedTaskId = gantt.getSelectedId();

      switch (keyCode) {
        case 13: // Enter - Abrir modal de edición
          if (selectedTaskId) {
            setSelectedItemId(selectedTaskId as string);
            return false; // Prevenir comportamiento default
          }
          break;

        case 38: // Arrow Up - Navegar a tarea anterior
          if (selectedTaskId) {
            const tasks = gantt.getTaskByTime();
            const currentIndex = tasks.findIndex((t: any) => t.id === selectedTaskId);
            if (currentIndex > 0) {
              gantt.selectTask(tasks[currentIndex - 1].id);
              gantt.showTask(tasks[currentIndex - 1].id);
              return false;
            }
          } else if (gantt.getTaskCount() > 0) {
            // Si no hay selección, seleccionar la primera tarea
            const firstTask = gantt.getTaskByTime()[0];
            if (firstTask) {
              gantt.selectTask(firstTask.id);
              gantt.showTask(firstTask.id);
              return false;
            }
          }
          break;

        case 40: // Arrow Down - Navegar a tarea siguiente
          if (selectedTaskId) {
            const tasks = gantt.getTaskByTime();
            const currentIndex = tasks.findIndex((t: any) => t.id === selectedTaskId);
            if (currentIndex < tasks.length - 1) {
              gantt.selectTask(tasks[currentIndex + 1].id);
              gantt.showTask(tasks[currentIndex + 1].id);
              return false;
            }
          } else if (gantt.getTaskCount() > 0) {
            // Si no hay selección, seleccionar la primera tarea
            const firstTask = gantt.getTaskByTime()[0];
            if (firstTask) {
              gantt.selectTask(firstTask.id);
              gantt.showTask(firstTask.id);
              return false;
            }
          }
          break;

        case 37: // Arrow Left - Colapsar nodo
          if (selectedTaskId) {
            const task = gantt.getTask(selectedTaskId);
            if (task && gantt.hasChild(selectedTaskId)) {
              gantt.close(selectedTaskId);
              return false;
            }
          }
          break;

        case 39: // Arrow Right - Expandir nodo
          if (selectedTaskId) {
            const task = gantt.getTask(selectedTaskId);
            if (task && gantt.hasChild(selectedTaskId)) {
              gantt.open(selectedTaskId);
              return false;
            }
          }
          break;
      }

      return true; // Permitir comportamiento default para otras teclas
    });

    // Inicializar gantt con el container de esta tab
    gantt.init(ganttContainer.current);
    isInitialized.current = true;
    console.log("✅ dhtmlx-gantt inicializado para tab actual");

    // Cargar datos si están disponibles
    if (isSuccess && transformedData) {
      console.log("🎯 Parseando datos en Gantt:", {
        cantidadItems: transformedData.data?.length,
        primerItem: transformedData.data?.[0],
        formatoCompleto: transformedData,
      });

      try {
        gantt.parse(transformedData);
        console.log("✅ Gantt parseado exitosamente");
        console.log(
          "📊 Items en gantt después del parse:",
          gantt.getTaskCount(),
        );

        // Forzar renderizado después del parse
        gantt.render();
        console.log("🎨 Gantt renderizado manualmente");
      } catch (error) {
        console.error("❌ Error al parsear gantt:", error);
      }
    }

    // Cleanup: limpiar gantt al desmontar componente (cambio de tab)
    return () => {
      console.log("🧹 Cleanup: limpiando datos del gantt (sin destruir instancia)");

      // Cancelar timers pendientes
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
        clickTimer.current = null;
      }
      if (updateDebounceTimer.current) {
        clearTimeout(updateDebounceTimer.current);
        updateDebounceTimer.current = null;
      }

      if (isInitialized.current) {
        try {
          // ❌ NO usar destructor() - mata la instancia global para siempre
          // ✅ Usar clearAll() - limpia datos pero mantiene estructura interna
          gantt.clearAll();
          gantt.detachAllEvents(); // Limpiar event listeners para evitar memory leaks
        } catch (e) {
          console.warn("⚠️ Error controlado al limpiar gantt (cleanup):", e);
        }
        isInitialized.current = false;
      }
    };
  }, [transformedData, isSuccess, patchDates, patchProgress, updateItem, createDependency, deleteDependency, state, department]);

  // Abrir modal de edición cuando se obtiene el item
  useEffect(() => {
    // Solo abrir modal si tenemos selectedItemId activo (indica click nuevo)
    if (selectedItem && onEditItem && selectedItemId) {
      console.log("📝 Abriendo modal para item:", selectedItem.id);
      onEditItem(selectedItem);
      setSelectedItemId(null); // Reset para la próxima edición
    }
  }, [selectedItem, onEditItem, selectedItemId]);

  // ========== MEJORA UX #10: Funciones de exportación ==========

  /**
   * Ajusta temporalmente el gantt para exportación:
   * - Oculta grid lateral
   * - Expande el ancho para mostrar todo el rango
   * - Ajusta fechas según selección
   * Retorna función para restaurar el estado original
   */
  const adjustGanttForExport = (): (() => void) => {
    if (!ganttContainer.current) return () => {};

    // Guardar estado original
    const originalStartDate = gantt.config.start_date;
    const originalEndDate = gantt.config.end_date;
    const originalFitTasks = gantt.config.fit_tasks;
    const originalGridWidth = gantt.config.grid_width;
    const originalContainerWidth = ganttContainer.current.style.width;
    const originalContainerHeight = ganttContainer.current.style.height;

    // Calcular año actual basado en las tareas
    const currentYear = new Date().getFullYear();
    let newStartDate: Date;
    let newEndDate: Date;

    if (exportRange === "current") {
      // Vista actual: solo ocultar grid y expandir
      newStartDate = originalStartDate || new Date(currentYear, 0, 1);
      newEndDate = originalEndDate || new Date(currentYear, 11, 31);
    } else {
      switch (exportRange) {
        case "year":
          newStartDate = new Date(currentYear, 0, 1);
          newEndDate = new Date(currentYear, 11, 31, 23, 59, 59);
          break;
        case "semester1":
          newStartDate = new Date(currentYear, 0, 1);
          newEndDate = new Date(currentYear, 5, 30, 23, 59, 59);
          break;
        case "semester2":
          newStartDate = new Date(currentYear, 6, 1);
          newEndDate = new Date(currentYear, 11, 31, 23, 59, 59);
          break;
        default:
          newStartDate = originalStartDate || new Date(currentYear, 0, 1);
          newEndDate = originalEndDate || new Date(currentYear, 11, 31);
      }
    }

    // 1. Ocultar grid lateral (columna de nombres)
    gantt.config.grid_width = 0;

    // 2. Desactivar fit_tasks para respetar fechas exactas
    gantt.config.fit_tasks = false;

    // 3. Aplicar nuevo rango de fechas
    gantt.config.start_date = gantt.date.date_part(newStartDate);
    gantt.config.end_date = gantt.date.add(gantt.date.date_part(newEndDate), 1, "day");

    // 4. Expandir contenedor a ancho grande para mostrar todo el timeline
    // Calculamos: aproximadamente 40px por semana
    const weeks = Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const estimatedWidth = Math.max(3000, weeks * 40); // Mínimo 3000px

    ganttContainer.current.style.width = `${estimatedWidth}px`;
    ganttContainer.current.style.height = "auto";
    ganttContainer.current.style.minHeight = "600px";

    // 5. Forzar re-render
    gantt.render();

    console.log(`📅 Gantt ajustado para exportación:`, {
      range: exportRange,
      start: gantt.config.start_date,
      end: gantt.config.end_date,
      weeks,
      containerWidth: estimatedWidth
    });

    // Retornar función de restauración
    return () => {
      gantt.config.grid_width = originalGridWidth;
      gantt.config.fit_tasks = originalFitTasks;
      gantt.config.start_date = originalStartDate;
      gantt.config.end_date = originalEndDate;

      if (ganttContainer.current) {
        ganttContainer.current.style.width = originalContainerWidth;
        ganttContainer.current.style.height = originalContainerHeight;
      }

      gantt.render();
      console.log("🔄 Vista restaurada a original");
    };
  };

  const exportToPNG = async () => {
    if (!ganttContainer.current) return;

    // Ajustar gantt para exportación (ocultar grid, expandir, ajustar fechas)
    const restoreGantt = adjustGanttForExport();

    // Esperar para que el gantt se re-renderice completamente con el nuevo tamaño
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Capturar el gantt con MUY alta calidad (scale: 3 para mejor resolución)
      const canvas = await html2canvas(ganttContainer.current, {
        backgroundColor: "#ffffff",
        scale: 3, // Aumentado de 2 a 3 para mejor calidad
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Dimensiones A4 @ 300dpi (alta calidad para impresión)
      const a4Dimensions = exportOrientation === "landscape"
        ? { width: 3508, height: 2480 } // Landscape: 297mm x 210mm @ 300dpi
        : { width: 2480, height: 3508 }; // Portrait: 210mm x 297mm @ 300dpi

      // Calcular escala manteniendo proporción
      const scale = Math.min(
        a4Dimensions.width / canvas.width,
        a4Dimensions.height / canvas.height
      );
      const scaledWidth = canvas.width * scale;
      const scaledHeight = canvas.height * scale;

      // Crear canvas escalado a A4
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = a4Dimensions.width;
      scaledCanvas.height = a4Dimensions.height;
      const ctx = scaledCanvas.getContext("2d");

      if (ctx) {
        // Fondo blanco
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, a4Dimensions.width, a4Dimensions.height);

        // Centrar la imagen en el canvas A4
        const x = (a4Dimensions.width - scaledWidth) / 2;
        const y = (a4Dimensions.height - scaledHeight) / 2;
        ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
      }

      const link = document.createElement("a");
      link.download = `gantt-${exportRange}-${exportOrientation}-${department.name}-${state?.name || "all"}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = scaledCanvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error al exportar PNG:", error);
      // TODO: Mostrar notificación de error con SweetAlert2
    } finally {
      // Restaurar vista original
      restoreGantt();
    }
  };

  const exportToPDF = async () => {
    if (!ganttContainer.current) return;

    // Ajustar gantt para exportación (ocultar grid, expandir, ajustar fechas)
    const restoreGantt = adjustGanttForExport();

    // Esperar para que el gantt se re-renderice completamente con el nuevo tamaño
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Capturar el gantt con alta calidad
      const canvas = await html2canvas(ganttContainer.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      // Crear PDF A4 con la orientación seleccionada
      const pdf = new jsPDF({
        orientation: exportOrientation,
        unit: "mm",
        format: "a4",
      });

      // Obtener dimensiones del PDF en mm
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calcular dimensiones de la imagen manteniendo proporción
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Centrar la imagen en el PDF
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight);

      // Agregar metadatos
      pdf.setProperties({
        title: `Gantt - ${department.name} - ${state?.name || "Todos"}`,
        subject: "Planificación de Actividades",
        author: "Sistema de Gestión",
        keywords: "gantt, planificación, actividades",
        creator: "mpf.ai"
      });

      pdf.save(
        `gantt-${exportRange}-${exportOrientation}-${department.name}-${state?.name || "all"}-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      // TODO: Mostrar notificación de error con SweetAlert2
    } finally {
      // Restaurar vista original
      restoreGantt();
    }
  };

  const exportToExcel = () => {
    if (!response || !response.data) return;

    try {
      // Preparar datos para Excel
      const excelData = response.data.map((item) => ({
        Título: item.title,
        Descripción: item.description || "",
        Tipo: item.type === "task" ? "Tarea" : item.type === "milestone" ? "Hito" : "Resumen",
        Prioridad:
          item.priority === "low"
            ? "Baja"
            : item.priority === "medium"
              ? "Media"
              : item.priority === "high"
                ? "Alta"
                : "Crítica",
        Estado:
          item.status === "planning"
            ? "Planificación"
            : item.status === "active"
              ? "Activo"
              : item.status === "onhold"
                ? "En Pausa"
                : item.status === "completed"
                  ? "Completado"
                  : "Cancelado",
        Progreso: `${item.progress}%`,
        "Fecha Inicio": item.startDate
          ? new Date(item.startDate).toLocaleDateString("es-AR")
          : "",
        "Fecha Fin": item.endDate
          ? new Date(item.endDate).toLocaleDateString("es-AR")
          : "",
        Asignado: item.assignedToId || "",
        Departamento: department.name,
        Estado: state?.name || "Todos",
      }));

      // Crear workbook y worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Gantt");

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 30 }, // Título
        { wch: 40 }, // Descripción
        { wch: 10 }, // Tipo
        { wch: 10 }, // Prioridad
        { wch: 12 }, // Estado
        { wch: 10 }, // Progreso
        { wch: 12 }, // Fecha Inicio
        { wch: 12 }, // Fecha Fin
        { wch: 20 }, // Asignado
        { wch: 20 }, // Departamento
        { wch: 15 }, // Estado
      ];
      ws["!cols"] = colWidths;

      // Descargar archivo
      XLSX.writeFile(
        wb,
        `gantt-${department.name}-${state?.name || "all"}-${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      // TODO: Mostrar notificación de error con SweetAlert2
    }
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <Spinner />
        <Typography
          variant="small"
          color="gray"
          className="ml-2"
          placeholder=""
        >
          Cargando actividades...
        </Typography>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-full p-8 text-center">
        <Typography variant="h6" color="red" placeholder="">
          Error al cargar las actividades
        </Typography>
        <Typography
          variant="small"
          color="gray"
          className="mt-2"
          placeholder=""
        >
          {(error as any)?.message || "Error desconocido"}
        </Typography>
      </div>
    );
  }

  // Empty state
  if (!response || !response.data || response.data.length === 0) {
    return (
      <div className="w-full p-8">
        <div className="text-center p-8 bg-gray-100 rounded">
          <Typography variant="h5" color="gray" placeholder="">
            No hay actividades planificadas
          </Typography>
          <Typography
            variant="paragraph"
            color="gray"
            className="mt-2"
            placeholder=""
          >
            {department && `Departamento: ${department.name}`}
            {state && ` - Estado: ${state.name}`}
          </Typography>
          <Typography
            variant="small"
            color="gray"
            className="mt-1"
            placeholder=""
          >
            {`Crea una nueva actividad usando el botón "+ Nueva Actividad"`}
          </Typography>
        </div>
      </div>
    );
  }

  // Render gantt chart
  return (
    <div className="w-full">
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="small" color="blue-gray" placeholder="">
              Mostrando {response.data.length} actividad(es)
            </Typography>
            {department && (
              <Typography variant="small" color="gray" placeholder="">
                Departamento: {department.name}
              </Typography>
            )}
            {state && (
              <Typography variant="small" color="gray" placeholder="">
                Estado: {state.name}
              </Typography>
            )}

            {/* ✅ INDICADOR DE POLLING: Muestra cuando se están sincronizando datos */}
            {isFetching && (
              <div className="flex items-center gap-2 mt-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                <Typography variant="small" color="blue" className="text-xs" placeholder="">
                  Sincronizando cambios...
                </Typography>
              </div>
            )}
          </div>

          {/* ========== MEJORA UX #10: Botones de exportación ========== */}
          <div className="flex gap-3 items-center">
            {/* Selector de rango temporal */}
            <div className="flex flex-col gap-1">
              <Typography variant="small" color="gray" className="text-xs" placeholder="">
                Rango:
              </Typography>
              <select
                value={exportRange}
                onChange={(e) => setExportRange(e.target.value as any)}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
              >
                <option value="current">Vista actual</option>
                <option value="year">Año completo</option>
                <option value="semester1">1er Semestre</option>
                <option value="semester2">2do Semestre</option>
              </select>
            </div>

            {/* Selector de orientación */}
            <div className="flex flex-col gap-1">
              <Typography variant="small" color="gray" className="text-xs" placeholder="">
                Orientación:
              </Typography>
              <div className="flex gap-1 border border-gray-300 rounded p-1">
              <Button
                size="sm"
                variant={exportOrientation === "landscape" ? "filled" : "text"}
                color="blue-gray"
                className="px-3 py-1"
                onClick={() => setExportOrientation("landscape")}
                placeholder=""
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </Button>
              <Button
                size="sm"
                variant={exportOrientation === "portrait" ? "filled" : "text"}
                color="blue-gray"
                className="px-3 py-1"
                onClick={() => setExportOrientation("portrait")}
                placeholder=""
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25M3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375-5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </Button>
            </div>
            </div>

            {/* Botones de exportación */}
            <Button
              size="sm"
              variant="outlined"
              color="blue"
              className="flex items-center gap-2"
              onClick={exportToPNG}
              placeholder=""
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              PNG
            </Button>

            <Button
              size="sm"
              variant="outlined"
              color="red"
              className="flex items-center gap-2"
              onClick={exportToPDF}
              placeholder=""
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              PDF
            </Button>

            <Button
              size="sm"
              variant="outlined"
              color="green"
              className="flex items-center gap-2"
              onClick={exportToExcel}
              placeholder=""
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
                />
              </svg>
              Excel
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={ganttContainer}
        style={{ width: "100%", height: "600px" }}
        className="border border-gray-300 rounded shadow-sm"
      />

      <div className="mt-4 p-3 bg-gray-50 rounded">
        <Typography
          variant="small"
          color="gray"
          className="font-semibold"
          placeholder=""
        >
          Leyenda de Prioridades:
        </Typography>
        <div className="flex gap-4 mt-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#4CAF50" }}
            />
            <Typography variant="small" color="gray" placeholder="">
              Baja
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#2196F3" }}
            />
            <Typography variant="small" color="gray" placeholder="">
              Media
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#FF9800" }}
            />
            <Typography variant="small" color="gray" placeholder="">
              Alta
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded animate-pulse"
              style={{ backgroundColor: "#F44336" }}
            />
            <Typography variant="small" color="gray" placeholder="">
              Crítica
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== EXPORTED UTILITY FUNCTION FOR REPORT GENERATION ==========

/**
 * Captura el Gantt como Blob PNG para uso en reportes automáticos
 *
 * IMPORTANTE: dhtmlx-gantt es un singleton global, solo puede haber 1 instancia.
 * Esta función renderiza temporalmente el gantt en un div oculto fuera del viewport
 * para no interferir con la visualización del usuario.
 *
 * @param items - Array de GanttItemResponse a renderizar
 * @param dependencies - Array de dependencies (links) para renderizar
 * @param range - Rango temporal: "quarter1" | "quarter2" | "quarter3" | "quarter4" | "semester1" | "semester2" | "year"
 * @param demographyName - Nombre de la demography (solo para logging)
 * @returns Promise<Blob | null> - Blob PNG de alta calidad (3x scale) o null si falla
 *
 * Ejemplo de uso:
 * ```typescript
 * const blob = await captureAsBlob(ganttItems, dependencies, "quarter1", "La Plata");
 * if (blob) {
 *   const formData = new FormData();
 *   formData.append("image", blob, `gantt-laplata-q1.png`);
 *   // Upload to backend...
 * }
 * ```
 */
export async function captureAsBlob(
  items: any[], // GanttItemResponse[]
  dependencies: any[],
  range: "quarter1" | "quarter2" | "quarter3" | "quarter4" | "semester1" | "semester2" | "year",
  demographyName: string
): Promise<Blob | null> {
  // Calcular altura dinámica basada en cantidad de items
  const ROW_HEIGHT = 40; // Altura aproximada por fila de tarea (px)
  const HEADER_HEIGHT = 60; // Altura del header de timeline (px)
  const PADDING = 40; // Padding superior + inferior (px)
  const MIN_HEIGHT = 200; // Altura mínima si no hay items (px)

  const calculatedHeight = items.length > 0
    ? HEADER_HEIGHT + (items.length * ROW_HEIGHT) + PADDING
    : MIN_HEIGHT;

  console.log(`📐 Altura calculada: ${calculatedHeight}px para ${items.length} item(s)`);

  // Crear div oculto fuera del viewport
  const hiddenDiv = document.createElement("div");
  hiddenDiv.id = `gantt-report-renderer-${Date.now()}`; // ID único para evitar conflictos
  hiddenDiv.style.position = "absolute";
  hiddenDiv.style.left = "-9999px"; // Fuera de la pantalla
  hiddenDiv.style.top = "0";
  hiddenDiv.style.width = "2480px"; // A4 portrait width at 300dpi
  hiddenDiv.style.height = `${calculatedHeight}px`; // Altura dinámica basada en items
  hiddenDiv.style.backgroundColor = "#ffffff";
  document.body.appendChild(hiddenDiv);

  // Agregar estilos CSS para colores de prioridad
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    /* Colores de prioridad para las barras del Gantt */
    .gantt_task_line.priority-low {
      background-color: #4CAF50 !important; /* Verde - Prioridad Baja */
      border-color: #388E3C !important;
    }
    .gantt_task_line.priority-medium {
      background-color: #2196F3 !important; /* Azul - Prioridad Media */
      border-color: #1976D2 !important;
    }
    .gantt_task_line.priority-high {
      background-color: #FF9800 !important; /* Naranja - Prioridad Alta */
      border-color: #F57C00 !important;
    }
    .gantt_task_line.priority-critical {
      background-color: #F44336 !important; /* Rojo - Prioridad Crítica */
      border-color: #D32F2F !important;
    }
  `;
  hiddenDiv.appendChild(styleTag);

  try {
    console.log(`📸 Capturando Gantt para ${demographyName} - ${range}...`);

    // Calcular rango de fechas según el parámetro
    const currentYear = new Date().getFullYear();
    let startDate: Date;
    let endDate: Date;

    switch (range) {
      case "quarter1":
        startDate = new Date(currentYear, 0, 1); // 1 enero
        endDate = new Date(currentYear, 2, 31, 23, 59, 59); // 31 marzo
        break;
      case "quarter2":
        startDate = new Date(currentYear, 3, 1); // 1 abril
        endDate = new Date(currentYear, 5, 30, 23, 59, 59); // 30 junio
        break;
      case "quarter3":
        startDate = new Date(currentYear, 6, 1); // 1 julio
        endDate = new Date(currentYear, 8, 30, 23, 59, 59); // 30 septiembre
        break;
      case "quarter4":
        startDate = new Date(currentYear, 9, 1); // 1 octubre
        endDate = new Date(currentYear, 11, 31, 23, 59, 59); // 31 diciembre
        break;
      case "semester1":
        startDate = new Date(currentYear, 0, 1); // 1 enero
        endDate = new Date(currentYear, 5, 30, 23, 59, 59); // 30 junio
        break;
      case "semester2":
        startDate = new Date(currentYear, 6, 1); // 1 julio
        endDate = new Date(currentYear, 11, 31, 23, 59, 59); // 31 diciembre
        break;
      case "year":
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59);
        break;
    }

    // Limpiar gantt global antes de inicializar en nuevo contenedor
    gantt.clearAll();

    // Configurar gantt para exportación (portrait, sin grid lateral)
    gantt.config.grid_width = 0; // Ocultar grid lateral
    gantt.config.fit_tasks = false; // No ajustar automáticamente
    gantt.config.start_date = gantt.date.date_part(startDate);
    gantt.config.end_date = gantt.date.add(gantt.date.date_part(endDate), 1, "day");

    // Configuración de escala (mes/semana)
    gantt.config.scale_unit = "month";
    gantt.config.date_scale = "%F %Y";
    gantt.config.subscales = [
      { unit: "week", step: 1, date: "Sem %W" }
    ];

    // Configurar locale en español
    gantt.locale = {
      date: {
        month_full: [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
        ],
        month_short: [
          "Ene", "Feb", "Mar", "Abr", "May", "Jun",
          "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
        ],
        day_full: [
          "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
        ],
        day_short: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      },
      labels: {
        new_task: "Nueva tarea",
        dhx_cal_today_button: "Hoy",
        day_tab: "Día",
        week_tab: "Semana",
        month_tab: "Mes",
        new_event: "Nuevo evento",
        icon_save: "Guardar",
        icon_cancel: "Cancelar",
        icon_details: "Detalles",
        icon_edit: "Editar",
        icon_delete: "Eliminar",
        confirm_closing: "",
        confirm_deleting: "¿Está seguro de que desea eliminar el elemento?",
        section_description: "Descripción",
        section_time: "Período de tiempo",
        section_type: "Tipo",
        column_text: "Nombre de tarea",
        column_start_date: "Inicio",
        column_duration: "Duración",
        column_add: "",
        link: "Enlace",
        confirm_link_deleting: "será eliminado",
        link_start: "(inicio)",
        link_end: "(fin)",
        type_task: "Tarea",
        type_project: "Proyecto",
        type_milestone: "Hito",
        minutes: "Minutos",
        hours: "Horas",
        days: "Días",
        weeks: "Semanas",
        months: "Meses",
        years: "Años",
      },
    };

    // Template para colores según prioridad
    gantt.templates.task_class = function (start: Date, end: Date, task: any): string {
      if (task.priority) {
        return `priority-${task.priority}`;
      }
      return "priority-medium";
    };

    // Template de texto dentro de la barra (con progreso en español)
    gantt.templates.task_text = function (start: Date, end: Date, task: any): string {
      const progressPercent = Math.round((task.progress || 0) * 100);
      return `${task.text} (${progressPercent}%)`;
    };

    // Inicializar gantt en el div oculto
    gantt.init(hiddenDiv);

    // Transformar datos al formato dhtmlx
    const transformedData = {
      data: items.map((item: any) => {
        const itemStartDate = item.startDate ? new Date(item.startDate) : new Date();
        const itemEndDate = item.endDate ? new Date(item.endDate) : new Date();
        const duration = Math.ceil((itemEndDate.getTime() - itemStartDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: item.id,
          text: item.title,
          start_date: itemStartDate,
          end_date: itemEndDate,
          duration: duration > 0 ? duration : 1,
          progress: item.progress / 100,
          parent: item.parentId || undefined,
          type: item.type,
          priority: item.priority || "medium", // ✅ Agregar prioridad para colores
        };
      }),
      links: (dependencies || []).map((dep: any) => ({
        id: dep.id,
        source: dep.sourceItemId,
        target: dep.targetItemId,
        type: dep.type === "endToStart" ? "0" : dep.type === "startToStart" ? "1" : "0"
      }))
    };

    gantt.parse(transformedData);

    // Esperar a que el gantt se renderice completamente
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log("📷 Capturando con html2canvas...");

    // Capturar con html2canvas (alta calidad)
    const canvas = await html2canvas(hiddenDiv, {
      backgroundColor: "#ffffff",
      scale: 3, // Alta calidad (3x)
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    console.log(`✅ Captura exitosa: ${canvas.width}x${canvas.height}px`);

    // Convertir canvas a Blob
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          console.log(`✅ Blob generado: ${(blob.size / 1024).toFixed(2)} KB`);
        }
        resolve(blob);
      }, "image/png");
    });

  } catch (error) {
    console.error(`❌ Error capturando Gantt para ${demographyName}:`, error);
    return null;
  } finally {
    // Limpiar: remover div oculto y resetear gantt
    gantt.clearAll();
    if (document.body.contains(hiddenDiv)) {
      document.body.removeChild(hiddenDiv);
    }
    console.log("🧹 Limpieza completada");
  }
}

export default GanttChart;
