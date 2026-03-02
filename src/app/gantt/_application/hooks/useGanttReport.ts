"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useAppSelector } from "@/_core/store";
import {
  useGetGanttItemsQuery,
  useLazyGetGanttItemsQuery,
  useGetUsersQuery,
  useGetStatesQuery,
  type GanttItemResponse,
  type User,
  useCreateStructuredDocumentMutation,
  useUploadGoogleImageMutation,
  type StructuredDocumentRequest,
  authApiSlice,
} from "@/_core/api";
import { captureAsBlob } from "../../components/GanttChart";
import Swal from "sweetalert2";
import { useJwtLoginQuery } from "@/_core/api";
import { ganttApiSlice } from '../slices/ganttApiSlice';
// ========== TYPES ==========

interface ReportStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "error" | "skipped";
  detail?: string;
}

interface PreviewData {
  totalDemographies: number;
  totalItems: number;
  estimatedImages: number;
  estimatedTime: string;
}

interface UseGanttReportProps {
  departmentId: string;
  departmentName: string;
}

interface UseGanttReportReturn {
  // Estado
  isGenerating: boolean;
  progress: number; // 0-100
  currentStep: string;
  steps: ReportStep[];
  documentUrl: string | null;
  errors: string[];
  hasFatalError: boolean;

  // Acciones
  generateReport: () => Promise<void>;
  cancelReport: () => void;
  reset: () => void;

  // Preview
  previewData: PreviewData | null;
  loadPreview: () => void;
}

// ========== HOOK ==========

/**
 * Hook principal para generar reportes de Gantt en Google Docs
 *
 * Orquesta todo el flujo de generación de reportes:
 * 1. Recopila datos de todas las demographies
 * 2. Genera imágenes PNG secuencialmente (dhtmlx-gantt singleton)
 * 3. Sube imágenes a Google Drive
 * 4. Construye payload estructurado con tablas
 * 5. Obtiene emails de directores
 * 6. Crea documento en Google Docs
 * 7. Muestra SweetAlert con resultado
 *
 * @param departmentId - ID del departamento actual
 * @param departmentName - Nombre del departamento para el título del documento
 * @returns UseGanttReportReturn - Estados y acciones del hook
 */
export function useGanttReport({
  departmentId,
  departmentName,
}: UseGanttReportProps): UseGanttReportReturn {

  // ========== STATE ==========
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [steps, setSteps] = useState<ReportStep[]>([]);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasFatalError, setHasFatalError] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  // AbortController para cancelación
  const abortControllerRef = useRef<AbortController | null>(null);

  // ========== REDUX SELECTORS ==========
  const auth = useAppSelector((state) => state.auth);

  // Obtener demographies (estados/localidades)
  const { data: demographies, isLoading: isLoadingDemographies, error: demographiesError } = useGetStatesQuery(undefined);

  // Obtener todos los usuarios (para filtrar directores)
  const { data: allUsers, isLoading: isLoadingUsers, error: usersError } = useGetUsersQuery({});
const {data:loginData,isSuccess:loginSuccess} = useJwtLoginQuery(undefined);

  useEffect(() => {
   // if (loginSuccess){
    console.log("📊 Estado de queries RTK (useGanttReport):", {
      demographies: {
        loading: isLoadingDemographies,
        data: demographies ? `${demographies.length} items` : "undefined",
        error: demographiesError ? "❌ Error" : null
      },
      allUsers: {
        loading: isLoadingUsers,
        data: allUsers ? `${allUsers.length} users` : "undefined",
        error: usersError ? "❌ Error" : null
      },
      auth: {
        user: loginData ? `${loginData.name} ${loginData.lastname}` : "❌ No autenticado",
        isAdmin: loginData?.isAdmin
      }
    });

    if (demographiesError) {
      console.error("❌ Error al cargar demographies:", demographiesError);
    }
    if (usersError) {
      console.error("❌ Error al cargar usuarios:", usersError);
    }
  }, [demographies, allUsers, auth.user, isLoadingDemographies, isLoadingUsers, demographiesError, usersError, auth.isAdmin,loginSuccess,loginData]);

  // ========== RTK QUERY MUTATIONS & LAZY QUERIES ==========
  const [uploadImage] = useUploadGoogleImageMutation();
  const [createDocument] = useCreateStructuredDocumentMutation();
  const [fetchGanttItems] = ganttApiSlice.endpoints.getGanttItems.useLazyQuery();

  // ========== HELPER FUNCTIONS ==========

  /**
   * Actualiza el progreso general y el estado de un paso específico
   */
  const updateStep = useCallback((
    stepId: string,
    status: ReportStep["status"],
    detail?: string
  ) => {
    setSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, status, detail } : step
      )
    );

    // Calcular progreso general (% de pasos completados/skipped/error)
    setSteps(prev => {
      const completed = prev.filter(s =>
        s.status === "completed" || s.status === "skipped" || s.status === "error"
      ).length;
      setProgress(Math.round((completed / prev.length) * 100));
      return prev;
    });
  }, []);

  /**
   * Carga preview: cuenta demographies, items totales, estima tiempo
   */
  const loadPreview = useCallback(() => {
    if (!demographies) return;

    // Contar demographies que tienen items
    const totalDemographies = demographies.length;
    const estimatedImages = totalDemographies * 4; // 4 imágenes por demography (q1, q2, q3, q4)
    const estimatedTimeSeconds = totalDemographies * 4 * 5 + 15; // 5s por imagen + 15s overhead

    const minutes = Math.floor(estimatedTimeSeconds / 60);
    const seconds = estimatedTimeSeconds % 60;
    const estimatedTimeString = minutes > 0
      ? `~${minutes} min ${seconds}s`
      : `~${seconds} segundos`;

    setPreviewData({
      totalDemographies,
      totalItems: 0, // Se calculará durante la generación
      estimatedImages,
      estimatedTime: estimatedTimeString
    });

    console.log("📊 Preview cargado:", {
      totalDemographies,
      estimatedImages,
      estimatedTime: estimatedTimeString
    });
  }, [demographies]);

  /**
   * Sube una imagen a Google Drive con retry logic
   */
  const uploadImageWithRetry = useCallback(
    async (blob: Blob, filename: string, maxRetries = 1): Promise<string | null> => {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const formData = new FormData();
          formData.append("image", blob, filename);

          console.log(`📤 Subiendo imagen: ${filename} (intento ${attempt + 1}/${maxRetries + 1})...`);
          const result = await uploadImage(formData).unwrap();
          console.log(`✅ Imagen subida: ${result.id}`);
          return result.id;
        } catch (error: any) {
          console.error(`❌ Error al subir imagen (intento ${attempt + 1}):`, error);

          // Si es error de autenticación, no reintentar
          if (error.status === 401 || error.status === 403) {
            console.error("🔒 Error de autenticación al subir imagen. No se reintentará.");
            throw new Error("AUTHENTICATION_ERROR");
          }

          if (attempt < maxRetries) {
            console.log("⏳ Reintentando en 2 segundos...");
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            return null; // Falló después de todos los reintentos
          }
        }
      }
      return null;
    },
    [uploadImage]
  );
const [jwtLogin]=authApiSlice.endpoints.jwtLogin.useLazyQuery();
  // Debug: Logging del estado de las queries cuando cambian
  useEffect(()=>{
    jwtLogin(undefined).unwrap().then(e=>console.log(e,"login"));
  },[jwtLogin])
  /**
   * Genera el reporte completo
   */
  const generateReport = useCallback(async () => {
    // Debug: Verificar qué datos están faltando
    const auth={user: await jwtLogin(undefined).unwrap()}
    console.log("🔍 Verificando datos necesarios para el reporte:");
    console.log("  - demographies:", demographies ? `✅ ${demographies.length} encontradas` : "❌ undefined/null");
    console.log("  - allUsers:", allUsers ? `✅ ${allUsers.length} encontrados` : "❌ undefined/null");
    console.log("  - auth.user:", auth.user ? `✅ ${auth.user.name} ${auth.user.lastname}` : "❌ undefined/null");

    if (!demographies || !allUsers || !auth.user) {
      // Mensaje de error más específico
      const missingData = [];
      if (!demographies) missingData.push("localidades/estados");
      if (!allUsers) missingData.push("usuarios");
      if (!auth.user) missingData.push("sesión de usuario");

      Swal.fire({
        icon: "error",
        title: "Error",
        html: `
          <p>Faltan datos necesarios para generar el reporte:</p>
          <ul style="text-align: left; margin-top: 8px;">
            ${missingData.map(item => `<li style="color: #dc2626;">- ${item}</li>`).join("")}
          </ul>
          <p style="margin-top: 8px;">Por favor, recargue la página e intente nuevamente.</p>
        `,
        confirmButtonText: "Recargar Página",
        confirmButtonColor: "#2563eb",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
      return;
    }

    // Inicializar estado
    setIsGenerating(true);
    setProgress(0);
    setErrors([]);
    setHasFatalError(false);
    setDocumentUrl(null);
    abortControllerRef.current = new AbortController();

    console.log("🚀 Iniciando generación de reporte...");
    console.log(`📊 Departamento: ${departmentName} (${departmentId})`);
    console.log(`👤 Usuario: ${auth.user.name} ${auth.user.lastname}`);

    try {
      // ========== PASO 1: RECOPILAR DATOS ==========
      console.log("📥 PASO 1: Recopilando datos de actividades...");
      setCurrentStep("Recopilando datos de actividades...");

      const demographiesData: Array<{
        demography: typeof demographies[0];
        items: GanttItemResponse[];
        dependencies: any[];
        images: { quarter1Id?: string; quarter2Id?: string; quarter3Id?: string; quarter4Id?: string };
      }> = [];

      // Inicializar pasos dinámicamente según demographies
      const initialSteps: ReportStep[] = [
        { id: "collect", label: "Recopilando datos de actividades", status: "in_progress" },
      ];

      for (const demography of demographies) {
        initialSteps.push({
          id: `img-${demography.id}-q1`,
          label: `Generando imagen: ${demography.state} (1er Trimestre)`,
          status: "pending"
        });
        initialSteps.push({
          id: `img-${demography.id}-q2`,
          label: `Generando imagen: ${demography.state} (2do Trimestre)`,
          status: "pending"
        });
        initialSteps.push({
          id: `img-${demography.id}-q3`,
          label: `Generando imagen: ${demography.state} (3er Trimestre)`,
          status: "pending"
        });
        initialSteps.push({
          id: `img-${demography.id}-q4`,
          label: `Generando imagen: ${demography.state} (4to Trimestre)`,
          status: "pending"
        });
      }

      initialSteps.push(
        { id: "upload", label: "Subiendo imágenes a Google Drive", status: "pending" },
        { id: "create", label: "Creando documento en Google Docs", status: "pending" },
        { id: "permissions", label: "Configurando permisos de acceso", status: "pending" }
      );

      setSteps(initialSteps);

      // Obtener items de cada demography usando lazy query
      console.log(`📊 Obteniendo items de Gantt para ${demographies.length} localidades...`);

      for (const demography of demographies) {
        try {
          // ✅ Fetch items usando parámetros correctos del backend
          const result = await fetchGanttItems({
            demographyId: demography.id,
            departmentsId: departmentId,
            page: 1,
            pageSize: 100, // Backend usa "pageSize" (también acepta "limit" por compatibilidad)
            isActive: "true" // Backend espera string "true"|"false", no boolean includeInactive
          }).unwrap();

          // ✅ Backend retorna { data: items[], pagination: {...} }
          const items = result.data || [];
          console.log(`  - ${demography.state}: ${items.length} items encontrados`);

          demographiesData.push({
            demography,
            items: items,
            dependencies: [], // Las dependencies se generan del lado del frontend al renderizar
            images: {}
          });
        } catch (error) {
          console.error(`❌ Error al obtener items de ${demography.state}:`, error);
          // Agregar demography vacía si falla la query
          demographiesData.push({
            demography,
            items: [],
            dependencies: [],
            images: {}
          });
        }
      }

      const totalItems = demographiesData.reduce((sum, d) => sum + d.items.length, 0);
      updateStep("collect", "completed", `${demographiesData.length} localidades, ${totalItems} items totales`);

      // ========== PASO 2: GENERAR IMÁGENES PNG ==========
      console.log("🖼️ PASO 2: Generando imágenes PNG...");
      setCurrentStep("Generando imágenes PNG...");

      for (const data of demographiesData) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Cancelled");
        }

        // Verificar si hay items en esta demography
        if (!data.items || data.items.length === 0) {
          console.log(`⏭️ Salteando ${data.demography.state}: No hay items de Gantt`);
          updateStep(`img-${data.demography.id}-q1`, "skipped", "Sin actividades");
          updateStep(`img-${data.demography.id}-q2`, "skipped", "Sin actividades");
          updateStep(`img-${data.demography.id}-q3`, "skipped", "Sin actividades");
          updateStep(`img-${data.demography.id}-q4`, "skipped", "Sin actividades");
          continue; // Saltear esta demography
        }

        // Generar imagen quarter 1
        updateStep(`img-${data.demography.id}-q1`, "in_progress");
        try {
          const blob1 = await captureAsBlob(
            data.items,
            data.dependencies,
            "quarter1",
            data.demography.state
          );

          if (!blob1) {
            throw new Error("captureAsBlob retornó null");
          }

          // Upload imagen 1
          const imageId1 = await uploadImageWithRetry(
            blob1,
            `gantt-${data.demography.state.replace(/\s+/g, "-")}-q1.png`
          );

          if (imageId1) {
            data.images.quarter1Id = imageId1;
            updateStep(`img-${data.demography.id}-q1`, "completed");
          } else {
            throw new Error("Upload falló después de reintentos");
          }
        } catch (error: any) {
          console.error(`❌ Error generando imagen quarter1:`, error);
          updateStep(`img-${data.demography.id}-q1`, "error", "No se pudo generar");
          setErrors(prev => [...prev, `Imagen fallida: ${data.demography.state} - 1er Trimestre`]);
        }

        // Generar imagen quarter 2
        updateStep(`img-${data.demography.id}-q2`, "in_progress");
        try {
          const blob2 = await captureAsBlob(
            data.items,
            data.dependencies,
            "quarter2",
            data.demography.state
          );

          if (!blob2) {
            throw new Error("captureAsBlob retornó null");
          }

          const imageId2 = await uploadImageWithRetry(
            blob2,
            `gantt-${data.demography.state.replace(/\s+/g, "-")}-q2.png`
          );

          if (imageId2) {
            data.images.quarter2Id = imageId2;
            updateStep(`img-${data.demography.id}-q2`, "completed");
          } else {
            throw new Error("Upload falló después de reintentos");
          }
        } catch (error: any) {
          console.error(`❌ Error generando imagen quarter2:`, error);
          updateStep(`img-${data.demography.id}-q2`, "error", "No se pudo generar");
          setErrors(prev => [...prev, `Imagen fallida: ${data.demography.state} - 2do Trimestre`]);
        }

        // Generar imagen quarter 3
        updateStep(`img-${data.demography.id}-q3`, "in_progress");
        try {
          const blob3 = await captureAsBlob(
            data.items,
            data.dependencies,
            "quarter3",
            data.demography.state
          );

          if (!blob3) {
            throw new Error("captureAsBlob retornó null");
          }

          const imageId3 = await uploadImageWithRetry(
            blob3,
            `gantt-${data.demography.state.replace(/\s+/g, "-")}-q3.png`
          );

          if (imageId3) {
            data.images.quarter3Id = imageId3;
            updateStep(`img-${data.demography.id}-q3`, "completed");
          } else {
            throw new Error("Upload falló después de reintentos");
          }
        } catch (error: any) {
          console.error(`❌ Error generando imagen quarter3:`, error);
          updateStep(`img-${data.demography.id}-q3`, "error", "No se pudo generar");
          setErrors(prev => [...prev, `Imagen fallida: ${data.demography.state} - 3er Trimestre`]);
        }

        // Generar imagen quarter 4
        updateStep(`img-${data.demography.id}-q4`, "in_progress");
        try {
          const blob4 = await captureAsBlob(
            data.items,
            data.dependencies,
            "quarter4",
            data.demography.state
          );

          if (!blob4) {
            throw new Error("captureAsBlob retornó null");
          }

          const imageId4 = await uploadImageWithRetry(
            blob4,
            `gantt-${data.demography.state.replace(/\s+/g, "-")}-q4.png`
          );

          if (imageId4) {
            data.images.quarter4Id = imageId4;
            updateStep(`img-${data.demography.id}-q4`, "completed");
          } else {
            throw new Error("Upload falló después de reintentos");
          }
        } catch (error: any) {
          console.error(`❌ Error generando imagen quarter4:`, error);
          updateStep(`img-${data.demography.id}-q4`, "error", "No se pudo generar");
          setErrors(prev => [...prev, `Imagen fallida: ${data.demography.state} - 4to Trimestre`]);
        }
      }

      updateStep("upload", "completed", "Todas las imágenes procesadas");

      // ========== PASO 3: OBTENER EMAILS DE DIRECTORES ==========
      console.log("📧 PASO 3: Obteniendo emails de directores...");
      setCurrentStep("Obteniendo emails de directores...");

      const directorEmails = allUsers
        .filter(user =>
          user.role === "Director Asociado" || user.role === "Director Ejecutivo"
        )
        .map(user => user.email);

      // Agregar email del usuario autenticado (si está disponible)
      const userEmail = auth.user.email || auth.user.username || null;
      const shareWithEmails = [userEmail, ...directorEmails]
        .filter(email => email && email.trim() !== "") // Filtrar emails vacíos o null
        .filter((email, index, self) => self.indexOf(email) === index); // Eliminar duplicados

      console.log(`📤 Compartiendo con ${shareWithEmails.length} usuario(s):`, shareWithEmails);

      if (shareWithEmails.length === 0) {
        console.warn("⚠️ No se encontraron emails para compartir el documento. Se compartirá solo con la cuenta de servicio de Google.");
      }

      // ========== PASO 4: CONSTRUIR PAYLOAD ESTRUCTURADO ==========
      console.log("📝 PASO 4: Construyendo payload del documento...");
      setCurrentStep("Construyendo documento...");

      updateStep("create", "in_progress");

      const allItems = demographiesData.flatMap(d => d.items);
      const statistics = {
        total: allItems.length,
        completed: allItems.filter(i => i.progress === 100).length,
        inProgress: allItems.filter(i => i.progress > 0 && i.progress < 100).length,
        pending: allItems.filter(i => i.progress === 0).length,
      };

      const payload: StructuredDocumentRequest = {
        title: `Reporte de Proyectos - ${departmentName}`,
        users: shareWithEmails,
        content: {
          metadata: {
            generatedAt: new Date().toLocaleString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            generatedBy: `${auth.user.name} ${auth.user.lastname}`,
            department: departmentName,
          },
          statistics,
          demographies: demographiesData.map(d => ({
            name: d.demography.state,
            hasItems: d.items && d.items.length > 0, // Indicar si hay items
            items: d.items && d.items.length > 0
              ? d.items.map(item => ({
                  title: item.title,
                  startDate: item.startDate
                    ? new Date(item.startDate).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Sin fecha",
                  endDate: item.endDate
                    ? new Date(item.endDate).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Sin fecha",
                  progress: item.progress,
                  assignedTo: item.AssignedTo
                    ? `${item.AssignedTo.name} ${item.AssignedTo.lastname}`
                    : "Sin asignar",
                  priority: item.priority,
                  type: item.type,
                }))
              : [], // Array vacío si no hay items
            images: d.images,
            emptyMessage: d.items && d.items.length > 0
              ? undefined
              : "No se han creado actividades para esta localidad en el período reportado."
          })),
        },
      };

      console.log("📄 Payload construido:", {
        title: payload.title,
        usersCount: payload.users.length,
        demographiesCount: payload.content.demographies.length,
        totalItems: statistics.total
      });

      // ========== PASO 5: CREAR DOCUMENTO ==========
      console.log("☁️ PASO 5: Creando documento en Google Docs...");
      console.log(payload,"PAYLOAD COMPLETO")
      setCurrentStep("Creando documento en Google Docs...");

      let result;
      try {
        result = await createDocument(payload).unwrap();
      } catch (apiError: any) {
        console.error("❌ Error al crear documento:", apiError);

        // Verificar si es error de autenticación
        if (apiError.status === 401 || apiError.status === 403) {
          throw new Error("AUTHENTICATION_ERROR");
        }

        // Otro tipo de error
        throw apiError;
      }

      const docUrl = result.url || `https://docs.google.com/document/d/${result.id}/edit`;

      console.log(`✅ Documento creado: ${result.id}`);
      console.log(`🔗 URL: ${docUrl}`);

      updateStep("create", "completed");
      updateStep("permissions", "completed", `Compartido con ${shareWithEmails.length} usuarios`);

      setDocumentUrl(docUrl);
      setCurrentStep("Completado");
      setProgress(100);

      // ========== PASO 6: MOSTRAR RESULTADO ==========
      const hasErrors = errors.length > 0;

      if (hasErrors) {
        // SweetAlert de éxito parcial
        Swal.fire({
          icon: "warning",
          title: "Reporte generado con observaciones",
          html: `
            <p>El documento fue creado pero algunas imágenes no pudieron incluirse:</p>
            <ul style="text-align: left; margin-top: 8px;">
              ${errors.map(e => `<li style="color: #dc2626;">- ${e}</li>`).join("")}
            </ul>
            <p style="margin-top: 8px;">Puede agregar las imágenes manualmente desde Google Docs.</p>
          `,
          showCancelButton: true,
          confirmButtonText: "Abrir en Google Docs",
          cancelButtonText: "Copiar Link",
          confirmButtonColor: "#2563eb",
        }).then((result) => {
          if (result.isConfirmed) {
            window.open(docUrl, "_blank");
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            navigator.clipboard.writeText(docUrl);
            Swal.fire({
              icon: "info",
              title: "Link copiado",
              text: "El link fue copiado al portapapeles.",
              timer: 2000,
              showConfirmButton: false,
            });
          }
        });
      } else {
        // SweetAlert de éxito completo
        Swal.fire({
          icon: "success",
          title: "Reporte generado exitosamente",
          html: `
            <p>El documento está listo en Google Docs.</p>
            <div style="margin-top: 12px; padding: 8px; background: #f1f5f9; border-radius: 6px; word-break: break-all;">
              <a href="${docUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">
                ${docUrl}
              </a>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "Abrir en Google Docs",
          cancelButtonText: "Copiar Link",
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#64748b",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            window.open(docUrl, "_blank");
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            navigator.clipboard.writeText(docUrl);
            Swal.fire({
              icon: "info",
              title: "Link copiado",
              text: "El link fue copiado al portapapeles.",
              timer: 2000,
              showConfirmButton: false,
            });
          }
        });
      }
    } catch (error: any) {
      console.error("❌ Error fatal al generar reporte:", error);

      if (error.message === "Cancelled") {
        // Cancelación manual, no mostrar error
        setCurrentStep("Cancelado");
        return;
      }

      setHasFatalError(true);
      setCurrentStep("Error");

      // Mensaje de error específico según el tipo de error
      let errorTitle = "Error al generar reporte";
      let errorMessage = "No fue posible crear el documento en Google Docs.";

      if (error.message === "AUTHENTICATION_ERROR") {
        errorTitle = "Error de Autenticación";
        errorMessage = "Su sesión ha expirado o no tiene permisos para realizar esta operación. Por favor, recargue la página e inicie sesión nuevamente.";
      } else if (error.status === 401 || error.status === 403) {
        errorTitle = "Error de Autenticación";
        errorMessage = "No tiene permisos para crear documentos en Google Docs. Verifique que sus credenciales de Google estén configuradas correctamente en el backend.";
      } else if (error.status === "FETCH_ERROR" || !navigator.onLine) {
        errorTitle = "Error de Conexión";
        errorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet e intente nuevamente.";
      } else if (error.status === "PARSING_ERROR" && error.originalStatus === 500) {
        errorTitle = "Error del Servidor (500)";
        errorMessage = "El servidor encontró un error interno al procesar la solicitud. Este es un problema del BACKEND que debe ser corregido por el equipo de desarrollo. Detalles: Verifique que todos los schemas de Zod estén importados correctamente en el middleware de autenticación.";
      } else if (error.status === 500 || error.originalStatus === 500) {
        errorTitle = "Error del Servidor (500)";
        errorMessage = "El servidor encontró un error interno. Por favor, contacte al administrador del sistema.";
      } else {
        errorMessage = `No fue posible crear el documento en Google Docs. ${error.data?.message || "Verifique su conexión e intente nuevamente."}`;
      }

      Swal.fire({
        icon: "error",
        title: errorTitle,
        text: errorMessage,
        showCancelButton: error.message !== "AUTHENTICATION_ERROR",
        confirmButtonText: error.message === "AUTHENTICATION_ERROR" ? "Recargar Página" : "Reintentar",
        cancelButtonText: "Cerrar",
        confirmButtonColor: "#2563eb",
      }).then((result) => {
        if (result.isConfirmed) {
          if (error.message === "AUTHENTICATION_ERROR") {
            window.location.reload();
          } else {
            generateReport(); // Reintentar
          }
        }
      });
    } finally {
      setIsGenerating(false);
    }
  }, [demographies, allUsers, auth, departmentName, departmentId, uploadImageWithRetry, createDocument, updateStep, errors]);

  /**
   * Cancela la generación del reporte
   */
  const cancelReport = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsGenerating(false);
    setCurrentStep("Cancelado");

    // No mostrar SweetAlert, solo limpiar estado
    console.log("⚠️ Generación cancelada por el usuario");
  }, []);

  /**
   * Resetea el estado del hook
   */
  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setCurrentStep("");
    setSteps([]);
    setDocumentUrl(null);
    setErrors([]);
    setHasFatalError(false);
    abortControllerRef.current = null;
  }, []);

  // ========== RETURN ==========
  return {
    isGenerating,
    progress,
    currentStep,
    steps,
    documentUrl,
    errors,
    hasFatalError,
    generateReport,
    cancelReport,
    reset,
    previewData,
    loadPreview,
  };
}
