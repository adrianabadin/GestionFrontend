"use client";
import { apiSlice } from "@/_shared/_infrastructure/api";

// ========== INTERFACES ==========

/**
 * Request body para crear un documento estructurado en Google Docs
 *
 * Este payload incluye:
 * - title: Título del documento
 * - users: Array de emails para compartir (writer permissions)
 * - content: Metadata, estadísticas y tablas por demography
 */
interface StructuredDocumentRequest {
  title: string;
  users: string[]; // Array de emails para compartir
  content: {
    metadata: {
      generatedAt: string; // Fecha de generación (formato local)
      generatedBy: string; // Nombre completo del usuario
      department: string; // Nombre del departamento
      state?: string; // Estado/localidad (opcional)
    };
    statistics: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
    };
    demographies: Array<{
      name: string; // Nombre del estado/localidad
      hasItems?: boolean; // Indica si hay items (true) o está vacío (false)
      items: Array<{
        title: string;
        startDate: string; // DD/MM/YYYY
        endDate: string; // DD/MM/YYYY
        progress: number; // 0-100
        assignedTo: string; // Nombre completo o "Sin asignar"
        priority: string; // "low" | "medium" | "high"
        type: string; // "task" | "milestone" | "summary"
      }>;
      images?: {
        semester1Id?: string; // ID de imagen en Google Drive
        semester2Id?: string; // ID de imagen en Google Drive
      };
      emptyMessage?: string; // Mensaje cuando no hay items (ej: "No se han creado actividades...")
    }>;
  };
}

/**
 * Response del endpoint createStructuredDocument
 */
interface CreateStructuredDocumentResponse {
  id: string; // documentId de Google Docs
  url?: string; // URL directa al documento (opcional)
}

/**
 * Response del endpoint uploadImage
 */
interface UploadImageResponse {
  id: string; // imageId en Google Drive
}

// ========== API SLICE ==========

/**
 * API Slice para Google APIs
 *
 * Incluye endpoints para:
 * - Crear documentos estructurados con tablas
 * - Subir imágenes a Google Drive
 *
 * IMPORTANTE: Este slice NO define tagTypes propios porque usa el apiSlice
 * unificado que ya tiene configurados los tags globales.
 */
export const googleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /google/createStructuredDocument
     *
     * Crea un documento Google Docs estructurado con:
     * - Metadata (fecha, autor, departamento)
     * - Estadísticas resumen
     * - Tablas REALES por demography (no texto plano)
     * - Links a imágenes en Drive
     * - Compartido con múltiples usuarios
     *
     * @param body - StructuredDocumentRequest
     * @returns { id: documentId, url?: documentUrl }
     *
     * Ejemplo de uso:
     * ```typescript
     * const [createDocument] = useCreateStructuredDocumentMutation();
     * const result = await createDocument(payload).unwrap();
     * console.log("Documento creado:", result.id);
     * ```
     */
    createStructuredDocument: builder.mutation<
      CreateStructuredDocumentResponse,
      StructuredDocumentRequest
    >({
      query: (body) => ({
        url: "/google/createStructuredDocument",
        method: "POST",
        body,
      }),
      // No invalidamos tags porque los documentos de Google no se cachean localmente
    }),

    /**
     * POST /google/uploadImage
     *
     * Sube una imagen PNG/JPEG a Google Drive
     *
     * @param formData - FormData con field "image" (File | Blob)
     * @returns { id: imageId }
     *
     * IMPORTANTE: El backend usa multer para procesar el FormData
     *
     * Ejemplo de uso:
     * ```typescript
     * const [uploadImage] = useUploadGoogleImageMutation();
     *
     * const formData = new FormData();
     * formData.append("image", blob, "gantt-report.png");
     *
     * const result = await uploadImage(formData).unwrap();
     * console.log("Imagen subida:", result.id);
     * ```
     */
    uploadGoogleImage: builder.mutation<UploadImageResponse, FormData>({
      query: (formData) => ({
        url: "/google/uploadImage",
        method: "POST",
        body: formData,
        // RTK Query maneja FormData automáticamente, no necesita headers especiales
      }),
      // No invalidamos tags porque las imágenes no se cachean localmente
    }),
  }),
});

// ========== EXPORT HOOKS ==========

/**
 * Hooks auto-generados por RTK Query
 *
 * Estos hooks se pueden usar directamente en componentes Client:
 * - useCreateStructuredDocumentMutation
 * - useUploadGoogleImageMutation
 */
export const {
  useCreateStructuredDocumentMutation,
  useUploadGoogleImageMutation,
} = googleApiSlice;

// ========== EXPORT TYPES (para re-export en @/_core/api) ==========

export type {
  StructuredDocumentRequest,
  CreateStructuredDocumentResponse,
  UploadImageResponse,
};
