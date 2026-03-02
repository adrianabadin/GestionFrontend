"use client";
import { useState, useEffect } from "react";
import { Button, Tooltip } from "@material-tailwind/react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useGanttReport } from "../_application/hooks/useGanttReport";
import GanttReportConfirmDialog from "./GanttReportConfirmDialog";
import GanttReportProgressDialog from "./GanttReportProgressDialog";

interface GanttReportButtonProps {
  departmentId: string;
  departmentName: string;
  disabled?: boolean;
}

/**
 * Botón principal para generar reportes de Gantt en Google Docs
 *
 * Renderiza el botón "Generar Reporte" y orquesta la apertura de los dialogs
 * (confirmación + progreso) según el estado del hook useGanttReport.
 *
 * @param departmentId - ID del departamento actual
 * @param departmentName - Nombre del departamento para el título del documento
 * @param disabled - Deshabilitar botón (cuando no hay departamento seleccionado)
 */
export function GanttReportButton({
  departmentId,
  departmentName,
  disabled = false
}: GanttReportButtonProps) {

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  const {
    isGenerating,
    progress,
    currentStep,
    steps,
    generateReport,
    cancelReport,
    previewData,
    loadPreview,
  } = useGanttReport({ departmentId, departmentName });

  // Cargar preview cuando se abre el dialog de confirmación
  useEffect(() => {
    if (showConfirmDialog && !previewData) {
      loadPreview();
    }
  }, [showConfirmDialog, previewData, loadPreview]);

  // Mostrar dialog de progreso cuando inicia generación
  useEffect(() => {
    if (isGenerating) {
      setShowProgressDialog(true);
      setShowConfirmDialog(false);
    } else {
      // Cerrar dialog de progreso cuando termina
      setShowProgressDialog(false);
    }
  }, [isGenerating]);

  const handleGenerate = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    generateReport();
  };

  const handleCancel = () => {
    cancelReport();
    setShowProgressDialog(false);
  };

  return (
    <>
      <Tooltip content="Generar reporte consolidado en Google Docs" placement="bottom">
        <Button
          variant="outlined"
          color="blue-gray"
          size="md"
          className="flex items-center gap-2"
          onClick={handleGenerate}
          disabled={disabled || isGenerating}
          placeholder=""
        >
          {isGenerating ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Generando...</span>
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-5 w-5" />
              <span>Generar Reporte</span>
            </>
          )}
        </Button>
      </Tooltip>

      <GanttReportConfirmDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirm}
        departmentName={departmentName}
        previewData={previewData}
      />

      <GanttReportProgressDialog
        open={showProgressDialog}
        onClose={() => setShowProgressDialog(false)}
        onCancel={handleCancel}
        progress={progress}
        currentStep={currentStep}
        steps={steps}
      />
    </>
  );
}

export default GanttReportButton;
