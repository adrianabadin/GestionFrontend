// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Server Component (Next.js 14 App Router)
// Fetches datos iniciales con Next.js cache (revalidate: 60s)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Suspense } from "react";
import { getInitialGanttItems } from "@/app/actions/gantt";
import { GanttClientWrapper } from "./_components/GanttClientWrapper";

/**
 * Gantt Page - Server Component
 * - Fetch inicial de datos en servidor (SSR)
 * - Cache de Next.js (60s)
 * - Hydration de RTK Query en cliente
 */
export default async function GanttPage() {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FETCH EN SERVIDOR (con Next.js cache)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const initialData = await getInitialGanttItems({
    limit: 100,
    page: 1,
  });

  console.log('✅ [GanttPage Server] Initial data fetched:', {
    items: initialData?.items?.length || 0,
    total: initialData?.meta?.total,
  });

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-semibold text-blue-600">
        Gestión de Proyectos - Gantt
      </h2>

      {/* Suspense boundary para loading state */}
      <Suspense fallback={<GanttLoadingSkeleton />}>
        <GanttClientWrapper
          initialData={initialData}
          filters={{ limit: 100, page: 1 }}
        />
      </Suspense>
    </div>
  );
}

/**
 * Loading skeleton mientras el client component se hidrata
 */
function GanttLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header skeleton */}
      <div className="h-16 bg-gray-200 rounded-lg"></div>

      {/* Tabs skeleton */}
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-32 bg-gray-200 rounded"></div>
        ))}
      </div>

      {/* Gantt chart skeleton */}
      <div className="h-96 bg-gray-200 rounded-lg"></div>
    </div>
  );
}
