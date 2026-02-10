"use-client";
import trash from "@/icons/trash fondoblanco.svg";
import close from "@/icons/close.svg";
import swal from "sweetalert2";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import TabBar from "./TabBar";
import {
  FodaItem,
  fodaItem,
  useAddMenaceMutation,
  useAddOportunityMutation,
  useAddStrategySMMutation,
  useAddStrategySOMutation,
  useAddStrategyWMMutation,
  useAddStrategyWOMutation,
  useAddStrengthMutation,
  useAddWeaknessMutation,
  useGetFodaQuery,
  useGetStatesQuery,
  useRemoveMenaceMutation,
  useRemoveOportunityMutation,
  useRemoveStrategySMMutation,
  useRemoveStrategySOMutation,
  useRemoveStrategyWMMutation,
  useRemoveStrategyWOMutation,
  useRemoveStrengthMutation,
  useRemoveWeaknessMutation,
} from "@/_core/api";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Member } from "../../../../../Backend/foda/foda.schema";
import Image from "next/image";
import { PrismaError } from "../../../../../Backend/prisma/prisma.errors";
const formSchema = fodaItem.pick({ description: true, title: true });
export function Foda({ departmentProp }: { departmentProp?: string }) {
  const { data, isFetching, error, isSuccess } = useGetStatesQuery(undefined);
  //if (isSuccess) console.log(data);
  return (
    <div className="col-span-4 w-full">
      {isFetching ? <Spinner /> : null}
      {isSuccess && data !== undefined ? (
        <TabBar
          data={[
            {
              label: "Global",
              value: "global",
              content: <FodaCards department={departmentProp} />,
            },
            ...data.map((item) => {
              return {
                label: item.state,
                value: item.state.toLowerCase(),
                content: (
                  <FodaCards department={departmentProp} state={item.state} />
                ),
              };
            }),
          ]}
        />
      ) : null}
    </div>
  );
}

function FodaCards({
  department,
  state,
}: {
  department?: string;
  state?: string;
}) {
  const requestObject = { department, state };
  const { data, isSuccess, isError } = useGetFodaQuery(requestObject);
  if (isSuccess) console.log(data);
  else if (isError) console.log("error");
  const [addStrength] = useAddStrengthMutation();
  const [removeStrength] = useRemoveStrengthMutation();
  const [addWeakness] = useAddWeaknessMutation();
  const [removeWeakness] = useRemoveWeaknessMutation();
  const [addOportunity] = useAddOportunityMutation();
  const [removeOportunity] = useRemoveOportunityMutation();
  const [addMenace] = useAddMenaceMutation();
  const [removeMenace] = useRemoveMenaceMutation();
  const [addSO] = useAddStrategySOMutation();
  const [removeSO] = useRemoveStrategySOMutation();
  const [addWO] = useAddStrategyWOMutation();
  const [removeWO] = useRemoveStrategyWOMutation();
  const [addSM] = useAddStrategySMMutation();
  const [removeSM] = useRemoveStrategySMMutation();
  const [addWM] = useAddStrategyWMMutation();
  const [removeWM] = useRemoveStrategyWMMutation();
  return (
    <section className="grid grid-cols-3 w-full ">
      <Card className="col-span-1 min-h-72 m-1 flex rounded-none bg-gradient-to-br from-pink-600 to-blue-600">
        <CardBody className="flex flex-col items-center justify-center align-middle h-full">
          <Typography
            variant="h4"
            color="white"
            className="font-bold  text-center items-center self-center"
          >
            Partido: {state !== undefined ? "\n" + state + "\n" : "\nGlobal\n"}
          </Typography>
          <Typography
            variant="h4"
            color="white"
            className="font-bold  text-center items-center self-center"
          >
            Area: {department !== undefined ? "\n" + department : "\nGlobal"}
          </Typography>
        </CardBody>
      </Card>

      <SingleCard
        color="pink"
        title="Fortalezas"
        data={data !== undefined ? data.Strength : undefined}
        handleUpdate={addStrength}
        handleRemove={removeStrength}
        service={department}
        state={state}
      />

      <SingleCard
        color="pink"
        title="Debilidades"
        data={data !== undefined ? data.Weakness : undefined}
        handleUpdate={addWeakness}
        handleRemove={removeWeakness}
        service={department}
        state={state}
      />

      <SingleCard
        color="blue"
        title="Oportunidades"
        data={data !== undefined ? data.Oportunity : undefined}
        handleUpdate={addOportunity}
        handleRemove={removeOportunity}
        service={department}
        state={state}
      />

      <SingleCard
        color="gray"
        title="Estrategia FO"
        noUnderline
        handleUpdate={addSO}
        handleRemove={removeSO}
        service={department}
        state={state}
        data={data !== undefined ? data.StrategySO : undefined}
      />
      <SingleCard
        color="gray"
        title="Estrategia DO"
        noUnderline
        handleUpdate={addWO}
        handleRemove={removeWO}
        service={department}
        state={state}
        data={data !== undefined ? data.StrategyWO : undefined}
      />
      <SingleCard
        color="blue"
        title="Amenazas"
        data={data !== undefined ? data.Menace : undefined}
        service={department}
        state={state}
        handleUpdate={addMenace}
        handleRemove={removeMenace}
      />

      <SingleCard
        color="gray"
        title="Estrategia FA"
        noUnderline
        data={data !== undefined ? data.StrategySM : undefined}
        service={department}
        state={state}
        handleUpdate={addSM}
        handleRemove={removeSM}
      />
      <SingleCard
        color="gray"
        title="Estrategia DA"
        noUnderline
        data={data !== undefined ? data.StrategyWM : undefined}
        service={department}
        state={state}
        handleUpdate={addWM}
        handleRemove={removeWM}
      />
    </section>
  );
}

function SingleCard({
  color,
  title,
  data,
  handleUpdate,
  noUnderline,
  service,
  state,
  handleRemove,
}: {
  color: "pink" | "blue" | "gray" | "degrade";
  title: string;
  service?: string;
  state?: string;
  data?: FodaItem[];
  noUnderline?: true;
  handleUpdate: (...arg: any) => any;
  handleRemove: (...args: any) => any;
}) {
  const [open, setOpen] = useState(false);
  if (data !== undefined) console.log(data, "dentro del card");
  return (
    <Card
      className={`col-span-1 min-h-72 m-1 flex justify-between rounded-none ${
        color === "pink"
          ? "bg-pink-400"
          : color === "blue"
          ? "bg-blue-600"
          : color === "degrade"
          ? "bg-gradient-to-r from-pink-600 to-blue-600"
          : "bg-blue-gray-400"
      }`}
    >
      <CardBody className="flex flex-col justify-evenly">
        <Typography
          variant="h3"
          className={`font-bold ${
            noUnderline ? "" : "underline"
          } text-center text-gray-300 font-bold `}
        >
          {title}
        </Typography>
        <ul className="mt-2 text-white flex flex-col ">
          {data?.map((item) => {
            return (
              <ListItemComponent
                description={item.description}
                id={item.id}
                title={item.title}
                key={item.id}
                handleRemove={handleRemove}
              />
            );
          })}
        </ul>
      </CardBody>
      <CardFooter className="flex items-end justify-end p-3">
        <Button
          className={`${
            color === "pink"
              ? "bg-blue-500"
              : color === "blue"
              ? "bg-pink-400"
              : "bg-black"
          }`}
          variant="filled"
          onClick={() => setOpen(true)}
        >
          Agregar
        </Button>
      </CardFooter>
      <AddMemberForm
        open={open}
        setOpen={setOpen}
        title={title}
        addMember={handleUpdate}
        service={service}
        state={state}
      />
    </Card>
  );
}
function ListItemComponent({
  title,
  description,
  id,
  handleRemove,
}: {
  id: string;
  title: string;
  description: string;
  handleRemove: (...args: any) => { unwrap: (...args: any) => Promise<any> };
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <li
        key={id}
        className="list-disc justify-between content-between flex flex-row"
      >
        <Button
          variant="text"
          className="w-10/12 text-start"
          onClick={() => setOpen((prev) => !prev)}
        >
          <Typography variant="paragraph" color="white">
            {title}
          </Typography>
        </Button>
        <Button
          type="button"
          variant="text"
          className="bg-transparent w-fit"
          onClick={() =>
            handleRemove(id)
              .unwrap()
              .then()
              .catch((error: PrismaError) =>
                swal.fire(error.name, error.message, "error")
              )
          }
        >
          <Image alt="Borrar" src={trash} width={24} height={24} />
        </Button>
      </li>
      <DescriptionBox
        open={open}
        setOpen={setOpen}
        description={description}
        title={title}
      />
    </>
  );
}
function DescriptionBox({
  open,
  setOpen,
  title,
  description,
}: {
  title: string;
  description: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Dialog open={open} handler={() => setOpen((prev) => !prev)}>
      <DialogHeader title={title} className="flex flex-row justify-between">
        <Typography variant="h3" color="blue">
          {" "}
          {title}
        </Typography>
        <Button variant="text" type="button" onClick={() => setOpen(false)}>
          <Image alt="Close" width={24} height={24} src={close} />
        </Button>
      </DialogHeader>
      <DialogBody>
        <Typography variant="paragraph">{description}</Typography>
      </DialogBody>
    </Dialog>
  );
}
function AddMemberForm({
  title,
  open,
  setOpen,
  state,
  service,
  addMember,
}: {
  title: string;
  open: boolean;
  state?: string;
  service?: string;
  addMember: (data: {
    query: Member["query"];
    body: z.infer<typeof formSchema>;
  }) => { unwrap: () => Promise<any> };
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    register,
    handleSubmit,

    formState: { isSubmitting, errors },
  } = useForm<z.infer<typeof formSchema>>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
  });
  const onSubmit = (body: z.infer<typeof formSchema>) => {
    const request = {
      body,
      query: {
        service: service !== undefined ? service : undefined,
        state: state !== undefined ? state : undefined,
      },
    };
    if (request.query.state === undefined) delete request.query.state;
    if (request.query.service === undefined) delete request.query.service;
    addMember(request)
      .unwrap()
      .then()
      .catch((error: PrismaError) => {
        swal.fire(error.name, error.message, "error");
      });
    setOpen(false);
  };
  return (
    <Dialog open={open} handler={setOpen}>
      <DialogHeader className="flex flex-row justify-between">
        <Typography variant="h3" color="blue">
          Agregar una {title}
        </Typography>
        <Button variant="text" type="button" onClick={() => setOpen(false)}>
          <Image alt="Close" width={24} height={24} src={close} />
        </Button>
      </DialogHeader>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex justify-center w-full flex-col "
      >
        <DialogBody className="min-h-56 flex flex-col items-center justify-around">
          <Input
            type="text"
            variant="outlined"
            className=""
            {...register("title")}
            label={`Ingrese el titulo de su ${title}...`}
          />
          {errors.title && (
            <p className="text-red-500">{errors.title?.message}</p>
          )}
          <Input
            type="text"
            variant="outlined"
            className=""
            label={`Ingrese la descripcion de su ${title}...`}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-500">{errors.description?.message}</p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button type="submit">
            {isSubmitting ? <Spinner /> : "Agregar"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
export default Foda;
