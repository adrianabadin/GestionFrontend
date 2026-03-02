"use client";
import { useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Textarea,
  Select,
  Option,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateGanttItemSchema,
  type CreateGanttItemType,
  type GanttItemResponse,
} from "../_domain/schemas";
import {
  useCreateGanttItemMutation,
  useUpdateGanttItemMutation,
  useGetDepartmentsQuery,
  useGetStatesQuery,
  useGetUsersQuery,
} from "@/_core/api";
import { useAppSelector } from "@/_core/store";

interface GanttItemModalProps {
  open: boolean;
  onClose: () => void;
  item?: GanttItemResponse;
  defaultDepartment?: string;
  defaultState?: string;
}

export function GanttItemModal({
  open,
  onClose,
  item,
  defaultDepartment ,
  defaultState,
}: GanttItemModalProps) {
  const auth = useAppSelector((state) => state.auth);
  const [createItem, { isLoading: isCreating }] = useCreateGanttItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateGanttItemMutation();

  const { data: departments } = useGetDepartmentsQuery({});
  const { data: states } = useGetStatesQuery(undefined);
  const { data: users } = useGetUsersQuery({});

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateGanttItemType>({
    resolver: zodResolver(CreateGanttItemSchema),
    defaultValues: {
      type: "task",
      progress: 0,
      priority: "medium",
      status: "planning",
      sortOrder: 0,
      createdById: auth?.id || "",
    },
  });

  // Efecto para cargar datos en modo edición o pre-seleccionar defaults
  useEffect(() => {
    if (item) {
      // Modo edición: cargar datos del item
      setValue("title", item.title);
      setValue("description", item.description || "");
      setValue("type", item.type);
      setValue("progress", item.progress);
      setValue("priority", item.priority);
      setValue("status", item.status);
      if (item.startDate) {
        setValue("startDate", item.startDate.split("T")[0]);
      }
      if (item.endDate) {
        setValue("endDate", item.endDate.split("T")[0]);
      }
      if (item.parentId) {
        setValue("parentId", item.parentId);
      }
      if (item.assignedToId) {
        setValue("assignedToId", item.assignedToId);
      }
      if (item.departmentsId) {
        setValue("departmentsId", item.departmentsId);
      }
      if (item.demographyId) {
        setValue("demographyId", item.demographyId);
      }
    } else {
      // Modo creación: usar defaults
      if (auth?.id) {
        setValue("createdById", auth.id);
        setValue("assignedToId", auth.id);
      }
    }
  }, [item, auth, setValue]);

  const onSubmit = async (data: CreateGanttItemType) => {
    try {
      if (item) {
        // Modo edición
        await updateItem({ id: item.id, data }).unwrap();
      } else {
        // Modo creación
        await createItem(data).unwrap();
      }
      reset();
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      // TODO: Mostrar notificación de error con SweetAlert2
    }
  };

  const handleClose = () => {
    console.log("🔴 handleClose llamado");
    try {
      reset();
      console.log("✅ reset() ejecutado");
      onClose();
      console.log("✅ onClose() ejecutado");
    } catch (error) {
      console.error("❌ Error en handleClose:", error);
    }
  };

  return (
    <Dialog
      open={open}
      handler={() => {}} // Handler vacío para prevenir cierre automático
      size="lg"
      placeholder=""
      animate={{
        mount: { scale: 1, opacity: 1, y: 0 },
        unmount: { scale: 0.95, opacity: 0, y: -20 },
      }}
      className="transition-all duration-300"
      dismiss={{
        enabled: false // Deshabilitar cierre por click fuera o ESC
      }}
    >
      <DialogHeader className="flex justify-between" placeholder="">
        <Typography variant="h4" color="blue" placeholder="">
          {item ? "Editar Actividad" : "Nueva Actividad"}
        </Typography>
        <Button
          type="button"
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
          placeholder=""
        >
          ✕
        </Button>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogBody className="max-h-[70vh] overflow-y-auto" placeholder="">
          <div className="flex flex-col gap-4">
            {/* Título */}
            <div>
              <Input
                {...register("title")}
                label="Título de la actividad *"
                error={!!errors.title}
                crossOrigin=""
              />
              {errors.title && (
                <Typography
                  variant="small"
                  color="red"
                  className="mt-1"
                  placeholder=""
                >
                  {errors.title.message}
                </Typography>
              )}
            </div>

            {/* Descripción */}
            <div>
              <Textarea
                {...register("description")}
                label="Descripción (opcional)"
              />
              {errors.description && (
                <Typography
                  variant="small"
                  color="red"
                  className="mt-1"
                  placeholder=""
                >
                  {errors.description.message}
                </Typography>
              )}
            </div>

            {/* Tipo y Prioridad */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Tipo *" placeholder="">
                      <Option value="task">Tarea</Option>
                      <Option value="milestone">Hito</Option>
                      <Option value="summary">Resumen</Option>
                    </Select>
                  )}
                />
                {errors.type && (
                  <Typography
                    variant="small"
                    color="red"
                    className="mt-1"
                    placeholder=""
                  >
                    {errors.type.message}
                  </Typography>
                )}
              </div>

              <div>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Prioridad *" placeholder="">
                      <Option value="low">Baja</Option>
                      <Option value="medium">Media</Option>
                      <Option value="high">Alta</Option>
                      <Option value="critical">Crítica</Option>
                    </Select>
                  )}
                />
                {errors.priority && (
                  <Typography
                    variant="small"
                    color="red"
                    className="mt-1"
                    placeholder=""
                  >
                    {errors.priority.message}
                  </Typography>
                )}
              </div>
            </div>

            {/* Estado */}
            <div>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Estado *" placeholder="">
                    <Option value="planning">Planificación</Option>
                    <Option value="active">Activo</Option>
                    <Option value="onhold">En Pausa</Option>
                    <Option value="completed">Completado</Option>
                    <Option value="cancelled">Cancelado</Option>
                  </Select>
                )}
              />
              {errors.status && (
                <Typography
                  variant="small"
                  color="red"
                  className="mt-1"
                  placeholder=""
                >
                  {errors.status.message}
                </Typography>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  {...register("startDate")}
                  type="date"
                  label="Fecha de Inicio"
                  error={!!errors.startDate}
                  crossOrigin=""
                />
                {errors.startDate && (
                  <Typography
                    variant="small"
                    color="red"
                    className="mt-1"
                    placeholder=""
                  >
                    {errors.startDate.message}
                  </Typography>
                )}
              </div>
              <div>
                <Input
                  {...register("endDate")}
                  type="date"
                  label="Fecha de Fin"
                  error={!!errors.endDate}
                  crossOrigin=""
                />
                {errors.endDate && (
                  <Typography
                    variant="small"
                    color="red"
                    className="mt-1"
                    placeholder=""
                  >
                    {errors.endDate.message}
                  </Typography>
                )}
              </div>
            </div>

            {/* Progreso */}
            <div>
              <Typography
                variant="small"
                color="gray"
                className="mb-2"
                placeholder=""
              >
                Progreso: {register("progress").name}%
              </Typography>
              <Input
                {...register("progress", { valueAsNumber: true })}
                type="number"
                min="0"
                max="100"
                label="Progreso (%)"
                error={!!errors.progress}
                crossOrigin=""
              />
              {errors.progress && (
                <Typography
                  variant="small"
                  color="red"
                  className="mt-1"
                  placeholder=""
                >
                  {errors.progress.message}
                </Typography>
              )}
            </div>

            {/* Departamento y Estado/Localidad */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Controller
                  name="departmentsId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Departamento (opcional)"
                      placeholder=""
                    >
                      {departments?.map((dept) => (
                        <Option key={dept.id} value={dept.id}>
                          {dept.name}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
                {errors.departmentsId && (
                  <Typography
                    variant="small"
                    color="red"
                    className="mt-1"
                    placeholder=""
                  >
                    {errors.departmentsId.message}
                  </Typography>
                )}
              </div>

              <div>
                <Controller
                  name="demographyId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Estado/Localidad (opcional)"
                      placeholder=""
                    >
                      {states?.map((state) => (
                        <Option key={state.id} value={state.id}>
                          {state.state}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
                {errors.demographyId && (
                  <Typography
                    variant="small"
                    color="red"
                    className="mt-1"
                    placeholder=""
                  >
                    {errors.demographyId.message}
                  </Typography>
                )}
              </div>
            </div>

            {/* Usuario asignado */}
            <div>
              <Controller
                name="assignedToId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Asignado a (opcional)"
                    placeholder=""
                  >
                    {users?.map((user) => (
                      <Option key={user.id} value={user.id}>
                        {user.name} {user.lastname} ({user.username})
                      </Option>
                    ))}
                  </Select>
                )}
              />
              {errors.assignedToId && (
                <Typography
                  variant="small"
                  color="red"
                  className="mt-1"
                  placeholder=""
                >
                  {errors.assignedToId.message}
                </Typography>
              )}
            </div>

            {/* Item padre (opcional - para jerarquía) */}
            <div>
              <Input
                {...register("parentId")}
                label="ID del item padre (opcional)"
                placeholder="UUID del item padre para crear jerarquía"
                crossOrigin=""
              />
              <Typography
                variant="small"
                color="gray"
                className="mt-1"
                placeholder=""
              >
                Dejar vacío si es un item raíz (sin padre)
              </Typography>
              {errors.parentId && (
                <Typography
                  variant="small"
                  color="red"
                  className="mt-1"
                  placeholder=""
                >
                  {errors.parentId.message}
                </Typography>
              )}
            </div>
          </div>
        </DialogBody>

        <DialogFooter placeholder="">
          <Button
            type="button"
            variant="text"
            color="red"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            className="mr-2"
            placeholder=""
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="blue"
            disabled={isCreating || isUpdating}
            placeholder=""
          >
            {isCreating || isUpdating ? (
              <Spinner className="h-4 w-4" />
            ) : item ? (
              "Actualizar"
            ) : (
              "Crear"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

export default GanttItemModal;
