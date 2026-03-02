"use client";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Card,
} from "@material-tailwind/react";
import { MapIcon, ListBulletIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface PreviewData {
  totalDemographies: number;
  totalItems: number;
  estimatedImages: number;
  estimatedTime: string;
}

interface GanttReportConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  departmentName: string;
  previewData: PreviewData | null;
}

/**
 * Dialog de confirmación previo a generar el reporte
 *
 * Muestra un resumen previo con:
 * - Cantidad de localidades
 * - Total de actividades (si está disponible)
 * - Cantidad de imágenes que se generarán
 * - Tiempo estimado
 *
 * El usuario puede cancelar o confirmar la generación.
 */
export function GanttReportConfirmDialog({
  open,
  onClose,
  onConfirm,
  departmentName,
  previewData
}: GanttReportConfirmDialogProps) {

  return (
    <Dialog open={open} handler={onClose} size="md" dismiss={{ outsidePress: true }}>
      <DialogHeader className="flex justify-between items-center" placeholder="">
        <Typography variant="h5" color="blue-gray" placeholder="">
          Generar Reporte de Actividades
        </Typography>
      </DialogHeader>

      <DialogBody className="space-y-4" placeholder="">
        <Typography variant="small" color="blue-gray" className="font-bold" placeholder="">
          Departamento:
        </Typography>
        <Typography variant="paragraph" color="gray" placeholder="">
          {departmentName}
        </Typography>

        <Typography variant="small" color="blue-gray" className="font-bold mt-4" placeholder="">
          Se incluirá en el reporte:
        </Typography>

        <Card className="p-4 bg-blue-50 border-l-4 border-blue-500" placeholder="">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapIcon className="h-5 w-5 text-blue-600" />
              <Typography variant="small" placeholder="">
                <strong>{previewData?.totalDemographies || 0}</strong> localidades con actividades
              </Typography>
            </div>

            {previewData?.totalItems !== undefined && previewData.totalItems > 0 && (
              <div className="flex items-center gap-3">
                <ListBulletIcon className="h-5 w-5 text-blue-600" />
                <Typography variant="small" placeholder="">
                  <strong>{previewData.totalItems}</strong> actividades en total
                </Typography>
              </div>
            )}

            <div className="flex items-center gap-3">
              <PhotoIcon className="h-5 w-5 text-blue-600" />
              <Typography variant="small" placeholder="">
                <strong>{previewData?.estimatedImages || 0}</strong> imágenes del timeline (2 por localidad)
              </Typography>
            </div>
          </div>
        </Card>

        <Typography variant="small" color="gray" className="italic" placeholder="">
          ⏱️ Tiempo estimado: {previewData?.estimatedTime || "calculando..."}
        </Typography>

        <Typography variant="small" color="gray" className="mt-4" placeholder="">
          <strong>Nota:</strong> El documento se creará en Google Docs y se compartirá automáticamente con su cuenta y todos los directores.
        </Typography>
      </DialogBody>

      <DialogFooter className="space-x-2" placeholder="">
        <Button variant="text" color="blue-gray" onClick={onClose} placeholder="">
          Cancelar
        </Button>
        <Button variant="filled" color="blue" onClick={onConfirm} placeholder="">
          Generar Reporte
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default GanttReportConfirmDialog;
