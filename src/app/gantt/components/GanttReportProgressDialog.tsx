"use client";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Button,
  Typography,
  Progress,
} from "@material-tailwind/react";
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface ReportStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "error" | "skipped";
  detail?: string;
}

interface GanttReportProgressDialogProps {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
  progress: number;
  currentStep: string;
  steps: ReportStep[];
}

/**
 * Dialog de progreso durante la generación del reporte
 *
 * Muestra:
 * - Barra de progreso general (0-100%)
 * - Descripción del paso actual
 * - Lista de todos los pasos con su estado (completado, en progreso, error, pendiente)
 * - Botón para cancelar la generación
 *
 * IMPORTANTE: No se puede cerrar clickeando fuera (dismiss.outsidePress = false)
 */
export function GanttReportProgressDialog({
  open,
  onClose,
  onCancel,
  progress,
  currentStep,
  steps
}: GanttReportProgressDialogProps) {

  /**
   * Retorna el icono correspondiente al estado del paso
   */
  const getStepIcon = (status: ReportStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "in_progress":
        return (
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
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
        );
      case "skipped":
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  /**
   * Retorna el color de texto correspondiente al estado del paso
   */
  const getStepTextColor = (status: ReportStep["status"]) => {
    switch (status) {
      case "completed":
        return "text-gray-600";
      case "error":
        return "text-red-600";
      case "in_progress":
        return "text-blue-gray-900 font-semibold";
      case "skipped":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <Dialog
      open={open}
      handler={onClose}
      size="lg"
      dismiss={{ outsidePress: false }} // No cerrar clickeando fuera
    >
      <DialogHeader className="flex justify-between items-center" placeholder="">
        <Typography variant="h5" color="blue-gray" placeholder="">
          Generando Reporte...
        </Typography>
        <Button
          variant="text"
          color="red"
          size="sm"
          onClick={onCancel}
          className="p-2"
          placeholder=""
        >
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </DialogHeader>

      <DialogBody className="space-y-4" placeholder="">
        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Typography variant="small" color="blue-gray" placeholder="">
              {currentStep}
            </Typography>
            <Typography variant="small" color="blue-gray" placeholder="">
              {progress}%
            </Typography>
          </div>
          <Progress value={progress} color="blue" placeholder="" />
        </div>

        {/* Lista de pasos */}
        <div className="max-h-96 overflow-y-auto space-y-2 mt-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-start gap-3 py-2 px-3 rounded hover:bg-gray-50 transition-colors"
            >
              <div className="mt-0.5">{getStepIcon(step.status)}</div>
              <div className="flex-1">
                <Typography
                  variant="small"
                  className={getStepTextColor(step.status)}
                  placeholder=""
                >
                  {step.label}
                </Typography>
                {step.detail && (
                  <Typography
                    variant="small"
                    color="gray"
                    className="text-xs mt-1"
                    placeholder=""
                  >
                    {step.detail}
                  </Typography>
                )}
                {step.status === "error" && (
                  <Typography
                    variant="small"
                    color="red"
                    className="text-xs mt-1"
                    placeholder=""
                  >
                    (omitido - continuará con los demás)
                  </Typography>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogBody>
    </Dialog>
  );
}

export default GanttReportProgressDialog;
