import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

// Base query básico con cookies
const baseFetchQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BACKURL,
  credentials: "include", // Envía cookies HTTP-only automáticamente
  mode: "cors",
  prepareHeaders: (headers) => {
    // Asegurar que las cookies se envíen en todas las peticiones
    // No es necesario agregar nada aquí si usamos credentials: "include"
    // pero lo dejamos por si necesitamos agregar headers adicionales
    return headers;
  }
});

// Base query mejorado con logging y manejo de errores de autenticación
export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseFetchQuery(args, api, extraOptions);

  // Logging de errores de autenticación
  if (result.error) {
    const status = result.error.status;

    if (status === 401 || status === 403) {
      console.error("🔒 Error de autenticación detectado:", {
        status,
        endpoint: typeof args === "string" ? args : args.url,
        message: "La sesión puede haber expirado o no tiene permisos para esta operación"
      });

      // Opcional: Mostrar alerta al usuario
      if (typeof window !== "undefined") {
        console.warn("⚠️ Sesión expirada o sin permisos. Por favor, recargue la página e inicie sesión nuevamente.");
      }
    } else if (status === "FETCH_ERROR") {
      console.error("🌐 Error de red:", {
        endpoint: typeof args === "string" ? args : args.url,
        message: "No se pudo conectar con el backend. Verifique su conexión a internet."
      });
    } else {
      console.error("❌ Error en petición API:", {
        status,
        endpoint: typeof args === "string" ? args : args.url,
        error: result.error
      });
    }
  }

  return result;
};
