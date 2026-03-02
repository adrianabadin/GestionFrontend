"use client";
import { useEffect, useState } from "react";
import { Spinner, Typography, Button, Card } from "@material-tailwind/react";
import {
  ganttApiSlice,
  useGetDepartmentsQuery,
  useGetStatesQuery,
  useJwtLoginQuery,
  type GanttItemResponse,
} from "@/_core/api";
import TabBar from "@/app/departments/components/TabBar";
import GanttChart from "./GanttChart";
import GanttItemModal from "./GanttItemModal";
import GanttReportButton from "./GanttReportButton";
import { useAppDispatch } from "@/_core/store";

interface GanttModuleProps {
  departmentProp?: string;
  initialData?: any[]; // Datos del servidor (opcional)
  filters?: {
    departmentsId?: string;
    demographyId?: string;
    page?: number;
    limit?: number;
  };
}

export function GanttModule({ departmentProp = "Regional", initialData, filters }: GanttModuleProps) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ETAPA 4: Cache Hydration
  // - initialData viene del servidor (SSR)
  // - Si initialData existe, NO mostrar loading state inicial
  // - RTK Query usa cache hidratado automáticamente
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Cargar usuario desde JWT cookie
  const { isLoading: isLoadingAuth } = useJwtLoginQuery(undefined);

  const { data: states, isFetching, isSuccess } = useGetStatesQuery(undefined);
  const {
    data: departmentsData,
    isFetching: isFetchingDep,
    isSuccess: isSuccessDep,
  } = useGetDepartmentsQuery({});
  const [departmentState, setDepartmentState] = useState<{
    id: string;
    name: string;
  }>({ name: departmentProp, id: "" });
  const dispatch = useAppDispatch();
  const [getGanttItems, { data: ganttItems, isLoading: isLoadingGantt }] =
    ganttApiSlice.endpoints.getGanttItems.useLazyQuery();

  // ✅ HYDRATION: Cargar datos iniciales en cache individual
  useEffect(() => {
    if (initialData && Array.isArray(initialData) && initialData.length > 0) {
      console.log('✅ [GanttModule] Hydrating individual item cache with initialData:', {
        count: initialData.length,
      });

      // Upsert cada item individual en el cache de getGanttItem
      initialData.forEach((item) => {
        dispatch(
          ganttApiSlice.util.upsertQueryData("getGanttItem", item.id, item),
        );
      });
    }
  }, [initialData, dispatch]);

  useEffect(() => {
    // Solo ejecutar cuando departmentsData esté cargado
    if (!departmentsData || departmentsData.length === 0) {
      console.log("⏳ Esperando a que carguen los departamentos...");
      return;
    }

    setDepartmentState(() => {
      const id =
        departmentsData?.find((d) => d.name === departmentProp)?.id ?? "";

      // Solo hacer la query si tenemos un ID válido Y no tenemos initialData
      if (id && !initialData) {
        console.log(
          `✅ Cargando items de Gantt para departamento: ${departmentProp} (${id})`,
        );
        getGanttItems({ departmentsId: id, page: 1, limit: 100 });
      } else if (id && initialData) {
        console.log(
          `✅ [GanttModule] Usando initialData para departamento: ${departmentProp} (${id})`,
        );
      } else {
        console.warn(
          `⚠️ No se encontró departamento con nombre: "${departmentProp}"`,
        );
      }

      return { id, name: departmentProp };
    });
  }, [departmentsData, departmentProp, getGanttItems, initialData]);

  // Upsert items individuales cuando llegan del lazy query
  useEffect(() => {
    if (
      ganttItems !== undefined &&
      Array.isArray(ganttItems) &&
      ganttItems.length > 0
    ) {
      ganttItems.forEach((item) => {
        dispatch(
          ganttApiSlice.util.upsertQueryData("getGanttItem", item.id, item),
        );
      });
    }
  }, [dispatch, ganttItems]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GanttItemResponse | undefined>(
    undefined,
  );

  // ✅ HYDRATION: NO mostrar loading si tenemos initialData
  // Solo mostrar loading si NO tenemos initialData y estamos fetching
  const shouldShowLoading =
    (isFetching || isFetchingDep || isLoadingAuth || isLoadingGantt) &&
    !initialData;

  // ✅ HYDRATION: Log de debugging para verificar cache
  console.log('🟢 [GanttModule] Render state:', {
    hasInitialData: !!initialData,
    initialDataCount: initialData?.length || 0,
    modalOpen,
    editingItem: !!editingItem,
    isLoadingAuth,
    isFetching,
    isFetchingDep,
    isLoadingGantt,
    shouldShowLoading,
  });

  const handleOpenCreate = () => {
    setEditingItem(undefined);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: GanttItemResponse) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("🔵 GanttModule handleCloseModal - ANTES:", {
      modalOpen,
      editingItem,
    });
    setModalOpen(false);
    setEditingItem(undefined);
    console.log("🔵 GanttModule handleCloseModal - DESPUÉS de setStates");
  };

  if (shouldShowLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <Spinner />
        {isLoadingAuth && (
          <Typography variant="small" color="gray" className="ml-2" placeholder="">
            Verificando autenticación...
          </Typography>
        )}
        {(isFetching || isFetchingDep) && !isLoadingAuth && (
          <Typography variant="small" color="gray" className="ml-2" placeholder="">
            Cargando configuración...
          </Typography>
        )}
      </div>
    );
  }

  if (!isSuccess || !states || !isSuccessDep || !departmentsData) {
    return (
      <div className="w-full p-8 text-center text-red-500">
        <Typography variant="h5" color="red" placeholder="">
          Error al cargar los estados
        </Typography>
      </div>
    );
  }

  return (
    <div className="w-full ">
      {/* Header con botón Nueva Actividad */}
      <Card className="p-4" placeholder="">
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h5" color="blue-gray" placeholder="">
              Planificación de Actividades
            </Typography>
            {departmentProp && (
              <Typography variant="small" color="gray" placeholder="">
                Departamento: {departmentProp}
              </Typography>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <GanttReportButton
              departmentId={departmentState.id}
              departmentName={departmentProp}
              disabled={departmentState.id === ""}
            />

            <Button
              disabled={departmentState.id !== "" ? undefined : true}
              color="blue"
              size="md"
              className="flex items-center gap-2 h-8 "
              onClick={handleOpenCreate}
              placeholder=""
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Nueva Actividad
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal de creación/edición */}
      <GanttItemModal
        open={modalOpen}
        onClose={handleCloseModal}
        item={editingItem}
        defaultDepartment={departmentProp ?? "Regional"}
      />

      {/* Tabs por estado/localidad */}
      <div className="flex flex-row bg-white items-center justify-around">
        <TabBar
          data={[
            ...states.map((state) => {
              return {
                label: state.state,
                value: state.state.toLowerCase(),
                content: (
                  <GanttChart
                    department={{
                      id: departmentState.id,
                      name: departmentProp,
                    }}
                    state={{ name: state.state, id: state.id }}
                    onEditItem={handleOpenEdit}
                  />
                ),
              };
            }),
          ]}
        />
      </div>
    </div>
  );
}

export default GanttModule;
