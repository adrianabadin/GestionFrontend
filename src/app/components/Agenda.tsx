"use client";
import trash from "@/icons/trash.svg";
import edit from "@/icons/edit.svg";
import check from "@/icons/check.svg";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  Button,
  Card,
  Input,
  CardBody,
  CardFooter,
  CardHeader,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Typography,
  Select,
  Option,
  Spinner,
  Textarea,
  Checkbox,
} from "@material-tailwind/react";
import { z } from "zod";
import { metadata } from "../layout";
import {
  TaskFilterType,
  TasksResponseType,
  apiSlice,
  useCloseTaskMutation,
  useCreateDocumentMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetDepartmentsQuery,
  useGetStatesQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from "@/_core/api";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "@/_core/store";
import Link from "next/link";
import { DocumentCreateError } from "../../../../Backend/google/google.errors";
import { clearAuth } from "@/_core/auth/_application/slices";

export const TaskSchema = z.object({
  title: z.string().min(3, { message: "debe tener al menos 3 caracteres" }),
  flag: z.enum(["red", "yellow", "green"], {
    invalid_type_error: "debe ser red, yellow or green",
  }),
  date: z.string(),
  time: z.string(),
  department: z
    .string()
    .min(3, { message: "debe tener al menos 3 caracteres" }),
  username: z.string().email({ message: "debe ser un email valido" }),
  state: z.string().min(3, { message: "debe tener al menos 3 caracteres" }),
});
export const closeTaskSchema = z.object({
  id: z.string().uuid({ message: "Debes proveer un id que sea un UUID" }),
  brief: z
    .string()
    .min(3, { message: "El informe debe tener al menos 3 letras" }),
  file: z.string().url({ message: "Debes ingresar un link valido" }).optional(),
});
export type CloseTaskType = z.infer<typeof closeTaskSchema>;
export type TaskType = z.infer<typeof TaskSchema>;
export default function TaskManager({
  // tasks,
  filter = {},
}: {
  filter: TaskFilterType;
  // tasks: TaskType[];
}) {
  const { username } = useAppSelector((state) => state.auth);
  const {
    data: tasks,
    isError: isErrorTasks,
    error: errorTasks,
  } = useGetTasksQuery({ ...filter, username });
  const {
    data: completedTasks,
    isError: isErrorCompleted,
    error: errorCompleted,
  } = useGetTasksQuery({
    ...filter,
    username,
    isCompleted: true,
  });
  if (
    isErrorTasks &&
    "data" in errorTasks &&
    errorTasks.data == "Unauthorized"
  ) {
    console.log("borrando auth");
    clearAuth();
  }
  if (
    isErrorCompleted &&
    "data" in errorCompleted &&
    errorCompleted.data == "Unauthorized"
  ) {
    clearAuth();
  }
  const { data: departments, refetch } = useGetDepartmentsQuery({
    username,
  });
  const { data: states, refetch: refetchStates } = useGetStatesQuery(undefined);
  const [createTask, setCreateTask] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const onCreate = () => {
    setCreateTask((prev) => !prev);
    refetch()
      .unwrap()
      .then(() => {
        refetchStates()
          .unwrap()
          .then(() => {})
          .catch((e) => console.log(e));
      })
      .catch((e) => console.log(e));
  };
  const [
    createDocument,
    {
      isSuccess,
      isError,
      isLoading,
      data: createDocResponse,
      error: createDocumentError,
      reset: resetCreateDocument,
    },
  ] = useCreateDocumentMutation();
  useEffect(() => {
    if (isError && "text" in createDocumentError)
      toast.error(createDocumentError.text as string, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
  }, [isError, createDocumentError]);
  return (
    <>
      <Card className="w-2/3 min-h-96 max-h-screen mt-4 flex flex-col justify-around content-around ">
        <Typography
          variant="h2"
          color="blue"
          className="font-bold font-sans m-3 text-center"
        >
          Agenda
        </Typography>
        <Typography
          variant="h5"
          color="light-blue"
          className="col-span-6 ml-6 mb-2"
        >
          Pendientes
        </Typography>
        <CardBody className="grid grid-cols-6 align-middle items-center overflow-scroll overflow-x-hidden scrollbar-thin scrollbar-corner-white scrollbar-track-white scrollbar-thumb-blue-600 hover:scrollbar-thumb-blue-800">
          <Typography variant="h6" color="gray" className="mx-auto">
            Fecha
          </Typography>
          <Typography variant="h6" color="gray" className="mx-auto">
            Hora
          </Typography>
          <Typography variant="h6" color="gray" className="mx-auto">
            Partido
          </Typography>
          <Typography variant="h6" color="gray" className="mx-auto">
            Programa
          </Typography>
          <Typography
            variant="h6"
            color="gray"
            className="place-content-center items-center mx-auto"
          >
            Prioridad
          </Typography>
          <Typography variant="h6" color="gray">
            {" "}
          </Typography>
          {tasks !== undefined ? (
            tasks.map((task: any) => (
              <Task
                departments={departments}
                states={states}
                username={username}
                task={task}
                key={task.id}
              />
            ))
          ) : isError &&
            errorTasks !== undefined &&
            "data" in errorTasks &&
            errorTasks.data === "Unauthorized" ? (
            <div className="text-red-500 text-3xl text-center w-full">
              Acceso Restringido
            </div>
          ) : (
            <div className="col-start-1 col-span-6">
              <Typography variant="h3" color="red">
                No hay tareas pendientes...
              </Typography>
            </div>
          )}
          <div className="flex justify-end h-auto  items-end col-span-1 col-start-6 pt-3 row-span-1">
            <Button
              onClick={onCreate}
              variant="gradient"
              color="blue"
              className="text-center self-center w-full"
            >
              Agregar
            </Button>
          </div>
        </CardBody>
        <Typography
          variant="h5"
          color="light-blue"
          className="col-span-6 ml-6 mb-2"
        >
          Completadas
        </Typography>
        <CardBody className="grid grid-cols-6 align-middle items-center mb-8 overflow-scroll overflow-x-hidden scrollbar-thin scrollbar-corner-white scrollbar-track-white scrollbar-thumb-blue-600 hover:scrollbar-thumb-blue-800">
          <Typography variant="h6" color="gray" className="mx-auto">
            Fecha
          </Typography>
          <Typography variant="h6" color="gray" className="mx-auto">
            Partido
          </Typography>
          <Typography variant="h6" color="gray" className="mx-auto col-span-3">
            Titulo
          </Typography>
          {completedTasks !== undefined
            ? completedTasks.map((task) => (
                <CompletedTask
                  task={task}
                  id={task.id}
                  key={task.id}
                  setChecked={setChecked}
                  resetCreateDocument={resetCreateDocument}
                />
              ))
            : null}
          {!isSuccess ? (
            <Button
              variant="gradient"
              color="blue"
              className="self-end col-span-1 col-start-6 mt-3 w-full text-center"
              onClick={() => {
                let text: string = "";
                checked.forEach((item) => {
                  const result = completedTasks?.find(
                    (task) => task.id === item
                  );
                  if (result !== undefined && result?.date !== null)
                    text +=
                      "\n" +
                      result?.title +
                      "\n" +
                      "Fecha : " +
                      new Date(result.date as Date).toLocaleDateString() +
                      "\nDistrito : " +
                      result?.Demography.state +
                      "\n\nInforme :\n" +
                      result?.brief +
                      "\n";
                });

                createDocument({
                  title:
                    "Informes territoriales " + new Date().toLocaleDateString(),
                  text,
                  user: username,
                })
                  .then((response) => console.log(response, "sllsfa"))
                  .catch((e) => console.log(e, "error"));
                console.log("Generando Informe", text);
              }}
            >
              {isLoading ? <Spinner /> : "Informe"}
            </Button>
          ) : (
            <a
              href={`https://docs.google.com/document/d/${createDocResponse.id}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="self-end col-span-1 col-start-6 mt-3 w-full text-center"
            >
              <Button
                variant="gradient"
                color="green"
                className="self-end col-span-1 col-start-6 mt-3 w-full text-center"
              >
                Ver
              </Button>
            </a>
          )}
        </CardBody>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <CreateTaskModal
          open={createTask}
          handler={() => setCreateTask((prev) => !prev)}
          departments={departments}
          states={states}
          // task={taskData as any}
        />
      </Card>
    </>
  );
}

function Task({
  task,
  setTask,
  username,
  setModal,
  departments,
  states,
}: {
  states?: {
    state: string;
    description: string;
    politics: string;
    population: number;
  }[];
  departments?: { id: string; name: string; description: string }[];
  task: TasksResponseType;
  username: string;
  setTask?: Dispatch<SetStateAction<TaskType>>; // (task: TaskType) => void;
  setModal?: Dispatch<SetStateAction<boolean>>;
}) {
  const [closeTaskState, setCloseTaskState] = useState<boolean>(false);
  const [modal, setModalToggle] = useState<boolean>(false);
  const [deleteTask] = useDeleteTaskMutation();
  return (
    <>
      <p className="col-start-1 my-5 ">
        {new Date(task.date).toLocaleDateString()}
      </p>
      <p className="mx-auto my-1">{new Date(task.date).toLocaleTimeString()}</p>
      <p className="mx-auto my-1">{task.Demography.state}</p>
      <p className="mx-auto my-1 text-center">{task.Departments.name}</p>
      <div
        className={`rounded-full w-6 h-6 items-center mx-auto outline-gray-400 outline-dotted outline-1 shadow-lg shadow-gray-700  align-middle   my-1 ${
          task.flag === "red"
            ? "bg-red-500"
            : task.flag === "green"
            ? "bg-green-500"
            : "bg-yellow-500"
        }`}
      ></div>
      <div className="flex justify-around items-start align-top">
        <button
          onClick={() => {
            Swal.fire({
              title: "¿Seguro deseas borrar esta tarea?",
              text: "Esta tarea no se puede deshacer.",
              icon: "question",
              showCancelButton: true,
              showConfirmButton: true,
              cancelButtonText: "No",
              cancelButtonColor: "blue",
              confirmButtonText: "Si",
              confirmButtonColor: "red",
            })
              .then((result) => {
                if (result.isConfirmed) deleteTask(task.id);
              })
              .catch((error) => {
                console.warn(error);
              });
          }}
        >
          <Image
            alt="Borrar"
            src={trash}
            width={24}
            height={24}
            className="bg-transparent hover:brightness-150 hover:scale-110 "
          />
        </button>
        <button
          onClick={() => {
            setModalToggle((prev) => !prev);
          }}
        >
          <Image
            alt="Editar"
            src={edit}
            width={24}
            height={24}
            className="bg-transparent hover:brightness-150 hover:scale-110 "
          />
        </button>
        <button onClick={() => setCloseTaskState((prev) => !prev)}>
          <Image
            alt="Cerrar"
            src={check}
            width={24}
            height={24}
            className="bg-transparent hover:brightness-150 hover:scale-110 "
          />
        </button>
      </div>
      <CreateTaskModal
        handler={() => setModalToggle((prev) => !prev)}
        open={modal}
        departments={departments}
        states={states}
        task={{
          ...task,
          department: task.Departments.name,
          state: task.Demography.state,
          username: task.Users.username,
          date: `${new Date(task.date).getFullYear()}-${
            new Date(task.date).getMonth() > 9
              ? new Date(task.date).getMonth()
              : "0" + (new Date(task.date).getMonth() + 1)
          }-${
            new Date(task.date).getDate() > 9
              ? new Date(task.date).getDate()
              : "0" + new Date(task.date).getDate()
          }`,
          time: (
            new Date(task.date).toLocaleString().split(",")[1].split(":")[0] +
            ":" +
            new Date(task.date).toLocaleString().split(",")[1].split(":")[1]
          ).trim(),
        }}
      />
      <CloseTask
        handler={() => setCloseTaskState((prev) => !prev)}
        open={closeTaskState}
        id={task.id}
      />
    </>
  );
}
function CompletedTask({
  task,
  id,
  setChecked,
  resetCreateDocument,
}: {
  task: TasksResponseType;
  id: string;
  setChecked: Dispatch<SetStateAction<string[]>>;
  resetCreateDocument: (...args: any) => void;
}) {
  console.log(task, "tarea");
  const [view, setView] = useState<boolean>(false);
  return (
    <>
      <Typography variant="paragraph" className="col-start-1 text-center">
        {new Date(task.date).toLocaleDateString()}
      </Typography>
      <Typography variant="paragraph" className="col-start-2 text-center">
        {task.Demography.state}
      </Typography>
      <button
        className=" col-span-3 text-center"
        onClick={() => setView((prev) => !prev)}
      >
        <Typography variant="paragraph" className=" text-center font-semibold">
          {task.title}
        </Typography>
      </button>
      <Checkbox
        onChange={(e) => {
          if (e.target.checked) setChecked((prev) => [...prev, id]);
          else
            setChecked((prev) => {
              return prev.filter((item) => item !== id);
            });
          resetCreateDocument();
        }}
      />
      <ViewTask
        task={task}
        open={view}
        handler={() => setView((prev) => !prev)}
      />
    </>
  );
}
function CreateTaskModal({
  open,
  handler,
  states,
  departments,
  task,
}: {
  task?: (TaskType & { id: string }) | undefined;
  open: boolean;
  handler: (...args: any) => void;
  states?: {
    state: string;
    description: string;
    politics: string;
    population: number;
  }[];
  departments?: { id: string; name: string; description: string }[];
}) {
  const [createTask] = useCreateTaskMutation();
  const { username } = useAppSelector((state) => state.auth);
  const {
    register,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskType>({
    resolver: zodResolver(TaskSchema),
    mode: "all",
    defaultValues: task,
  });
  useEffect(() => {
    setValue("username", username, { shouldValidate: true });
  }, [username, setValue]);
  const [updateTask] = useUpdateTaskMutation();

  const onSubmit = (data: TaskType) => {
    if (task?.title === undefined)
      createTask({
        ...data,
        date: new Date(data.date + "T" + data.time).toISOString(),
      });
    else {
      let hora;
      if (data.time.length < 5) hora = `0${data.time}`;
      else hora = `${data.time}`;
      let fechaData = new Date(data.date + "T" + data.time).toISOString();
      updateTask({
        ...data,
        date: fechaData,
        id: task.id,
      });
    }
    handler();
  };
  useEffect(() => {
    if (task?.title !== undefined) {
      setValue("date", task.date, { shouldValidate: true });
      setValue("department", task.department, { shouldValidate: true });
      setValue("flag", task.flag, { shouldValidate: true });
      setValue("state", task.state, { shouldValidate: true });
      setValue("time", task.time, { shouldValidate: true });
      setValue("title", task.title, { shouldValidate: true });
      setValue("username", task.username, { shouldValidate: true });
    }
  }, [setValue, task]);
  if (states == undefined || departments == undefined) return;

  return (
    <Dialog open={open} handler={handler}>
      <DialogHeader className="flex justify-between">
        <Typography variant="h3" color="blue">
          Crear Tarea
        </Typography>
        <Button variant="gradient" color="white" onClick={handler}>
          Cerrar
        </Button>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogBody className="flex flex-col">
          <Input
            {...register("title")}
            variant="static"
            label="Titulo"
            error={errors.title ? true : undefined}
          />
          {errors.title ? (
            <p className="text-red-500 text-center">{errors.title.message}</p>
          ) : null}
          <div className="flex justify-between mt-2">
            <Input {...register("date")} type="date" variant="static" />
            <Input {...register("time")} type="time" variant="static" />
          </div>
          <div className="flex justify-between mt-2">
            <Controller
              name="flag"
              control={control}
              render={({ field }) => (
                <Select
                  placeholder={null}
                  variant="static"
                  className="mr-2"
                  {...field}
                  onChange={(value) => field.onChange(value)}
                >
                  <Option
                    value="red"
                    className="bg-red-500 text-white focus:bg-red-700 focus:text-gray-300 hover:bg-red-700"
                  >
                    Rojo
                  </Option>
                  <Option
                    value="yellow"
                    className="bg-yellow-500 text-white focus:bg-yellow-700 focus:text-gray-300 hover:bg-yellow-700"
                  >
                    Amarillo
                  </Option>
                  <Option
                    value="green"
                    className="bg-green-500 text-white focus:bg-green-700 focus:text-gray-300 hover:bg-green-700"
                  >
                    Verde
                  </Option>
                </Select>
              )}
            ></Controller>
            <Controller
              control={control}
              name="department"
              render={({ field }) => (
                <Select
                  placeholder={null}
                  variant="static"
                  className="mr-2"
                  {...field}
                  onChange={(value) => field.onChange(value)}
                >
                  {departments !== undefined
                    ? departments.map((item) => (
                        <Option value={item.name} key={item.id}>
                          {item.name}
                        </Option>
                      ))
                    : null}
                </Select>
              )}
            ></Controller>
            <Controller
              control={control}
              name="state"
              render={({ field }) => (
                <Select
                  placeholder={null}
                  variant="static"
                  className="mr-2"
                  {...field}
                  onChange={(value) => field.onChange(value)}
                >
                  {states !== undefined
                    ? states.map((item) => (
                        <Option value={item.state} key={item.state}>
                          {item.state}
                        </Option>
                      ))
                    : null}
                </Select>
              )}
            ></Controller>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="gradient"
            color="blue"
            type="submit"
            disabled={
              !TaskSchema.safeParse(getValues()).success || isSubmitting
            }
          >
            {isSubmitting ? (
              <Spinner />
            ) : task?.title !== undefined ? (
              "Actualizar"
            ) : (
              "Agregar"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function CloseTask({
  handler,
  open,
  id,
}: {
  handler: (...args: any) => void;
  open: boolean;
  id: string;
}) {
  const {
    control,
    getValues,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CloseTaskType>({
    resolver: zodResolver(closeTaskSchema),
    mode: "all",
  });
  useEffect(() => {
    setValue("id", id, { shouldValidate: true });
  }, [setValue, id]);
  const [closeTask] = useCloseTaskMutation();
  const onSubmit = (data: CloseTaskType) => {
    closeTask(data)
      .unwrap()
      .then((response) => {
        if (response !== undefined && response.id !== undefined) handler();
      })
      .catch((error) => console.log(error));
  };
  return (
    <Dialog handler={handler} open={open} title="Cerrar la tarea">
      <DialogHeader className="flex flex-row justify-between">
        <Typography variant="h3" color="blue">
          Cerrar la Tarea
        </Typography>
        <Button
          type="button"
          variant="gradient"
          color="white"
          onClick={handler}
        >
          Cerrar
        </Button>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogBody>
          <Controller
            control={control}
            name="brief"
            render={({ field }) => (
              <>
                <Textarea
                  placeholder="Informe..."
                  label="Informe..."
                  {...field}
                  onChange={(value) => field.onChange(value)}
                />
                {errors.brief ? (
                  <p className="text-red-500 text-center">
                    {errors.brief.message}
                  </p>
                ) : null}
              </>
            )}
          />
          <Controller
            control={control}
            name="file"
            render={({ field }) => (
              <>
                <Input
                  type="url"
                  label="Link del informe"
                  {...field}
                  onChange={(value) => field.onChange(value)}
                  placeholder="Link del informe"
                />
                {errors.file ? (
                  <p className="text-red-500 text-center">
                    {errors.file.message}
                  </p>
                ) : null}
              </>
            )}
          />
        </DialogBody>
        <DialogFooter>
          <Button color="blue" variant="gradient" type="submit">
            Cerrar Tarea
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function ViewTask({
  task,
  open,
  handler,
}: {
  task: TasksResponseType;
  open: boolean;
  handler: (...args: any) => void;
}) {
  return (
    <>
      <Dialog open={open} handler={handler} title={task.title}>
        <DialogHeader>
          <Typography variant="h3" color="blue">
            {task.title}
          </Typography>
        </DialogHeader>
        <DialogBody className="grid grid-cols-2 justify-center">
          <div className="col-span-1 flex flex-row">
            <Typography variant="h5" color="gray" className="">
              Fecha :
            </Typography>
            <p className="ml-2">{`${new Date(
              task.date
            ).toLocaleDateString()}`}</p>
          </div>
          <div className="flex flex-row text-lg col-span-1 ">
            <Typography variant="h5" color="gray">
              Partido :
            </Typography>
            <p className="ml-2">{task.Demography.state}</p>
          </div>
          <div className="col-span-2 ">
            <Typography
              variant="h5"
              color="gray"
              className="col-start-1 font-bold mt-4"
            >
              Informe :<br />
            </Typography>
            <p className="mt-4">{task.brief}</p>
          </div>
          {task.file !== undefined && task.file !== null ? (
            <Link href={task.file}>Abrir informe adjunto</Link>
          ) : null}
        </DialogBody>
      </Dialog>
    </>
  );
}
