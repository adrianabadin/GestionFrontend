"use client";

import { Typography, Spinner, Card } from "@material-tailwind/react";
import { useGetDepartmentsQuery } from "@/_core/api";
import TabBar from "../departments/components/TabBar";
import GanttModule from "../gantt/components/GanttModule";

/**
 * Worklist Page - Vista consolidada de todos los departamentos
 *
 * ETAPA 5: Integración /worklist
 * - Muestra tabs por departamento
 * - Cada tab contiene un GanttModule con datos del departamento
 * - Usa la arquitectura híbrida (client-side por ahora, datos vienen de RTK Query)
 */
export function WorkListPage() {
  const { data: departments, isLoading, isError } = useGetDepartmentsQuery({});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (isError || !departments || departments.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-6" placeholder="">
          <Typography variant="h5" color="red" placeholder="">
            Error al cargar departamentos
          </Typography>
          <Typography variant="paragraph" color="gray" className="mt-2" placeholder="">
            No se pudieron cargar los departamentos. Por favor, intenta de nuevo más tarde.
          </Typography>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4 p-4" placeholder="">
        <Typography variant="h3" color="blue-gray" placeholder="">
          Lista de Trabajo - Todos los Proyectos
        </Typography>
        <Typography variant="small" color="gray" className="mt-1" placeholder="">
          Vista consolidada de actividades por departamento
        </Typography>
      </Card>

      {/* ✅ ETAPA 5: Tabs por departamento, cada uno con su GanttModule */}
      <TabBar
        data={departments
          .filter((dept) => {
            // Filtrar departamentos especiales si es necesario
            const name = dept.name.trim().toLowerCase();
            return !name.includes("gestion ciudadana");
          })
          .map((dept) => ({
            value: dept.id,
            label: dept.name,
            content: (
              <div className="bg-white p-4 rounded">
                <GanttModule
                  departmentProp={dept.name}
                  // ✅ No pasamos initialData aquí porque es Client Component
                  // El GanttModule hará fetch por su cuenta usando RTK Query
                />
              </div>
            ),
          }))}
      />
    </div>
  );
}

export default WorkListPage;
