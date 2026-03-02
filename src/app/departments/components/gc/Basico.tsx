"use client";

import TaskManager from "@/app/components/Agenda";
import Agenda from "@/app/components/Agenda";
import { Typography } from "@material-tailwind/react";
import TabBar from "../TabBar";
import Foda from "../Foda";
import { Dashboard } from "@/app/components/Dashboard";
import GanttPage from "@/app/gantt/page";
import GanttModule from "@/app/gantt/components/GanttModule";

/**
 * Programa Component - Vista de tabs por departamento
 *
 * ETAPA 5: Integración /departments
 * - Integra GanttModule en la tab "Gantt"
 * - GanttModule usa arquitectura híbrida con optimistic updates
 * - Polling automático cada 30s para sincronización
 * - Cache hydration para mejor performance
 */
function Programa({ department }: { department: string }) {
  return (
    <>
      <TabBar
        data={[
          {
            value: "dash",
            label: "Dashboard",
            content: <Dashboard programa={department} />,
          },
          {
            value: "tasks",
            label: "Agenda",
            content: <TaskManager filter={{ department: department }} />,
          },
          {
            value: "foda",
            label: "FODA",
            content: <Foda departmentProp={department} />,
          },
          {
            // ✅ ETAPA 5: Tab Gantt con arquitectura híbrida
            value: "gantt",
            label: "Gantt",
            content: <GanttModule departmentProp={department} />,
          },
        ]}
      />
    </>
  );
}

export default Programa;
