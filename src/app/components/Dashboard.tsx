"use client";

import { Spinner } from "@material-tailwind/react";
import Card from "../departments/components/CustomCard";
import CardBody from "../departments/components/CustomCardBody";
import Typography from "../departments/components/CustomTypography";
import {
  apiSlice,
  GetIssues,
  useGetIssuesQuery,
} from "@/_core/api";
import { IssueView } from "../departments/components/gc/IssueView";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Button from "../departments/components/CustomButton";
import { useAppDispatch } from "@/_core/store";

export function Dashboard({ programa }: { programa: string }) {
  const {
    data: pending,
    isFetching: isPending,
    isSuccess: isPendingSuccess,
    isError: isPendingError,
    error: pendingError,
  } = useGetIssuesQuery({
    state: "pending",
    department: programa,
  });
  const {
    data: working,
    isFetching: isWorking,
    isSuccess: isWorkingSuccess,
    isError: isWorkingError,
    error: workingError,
  } = useGetIssuesQuery({
    state: "working",
    department: programa,
  });
  const {
    data: terminated,
    isFetching: isTerminated,
    isSuccess: isTerminatedSuccess,
    isError: isTerminatedError,
    error: terminatedError,
  } = useGetIssuesQuery({
    state: "terminated",
    department: programa,
  });
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (pending !== undefined && Array.isArray(pending)) {
      pending.forEach((item) => {
        dispatch(
          apiSlice.util.upsertQueryData("getIssues", { id: item.id }, item)
        );
      });
    }
    if (working !== undefined && Array.isArray(working)) {
      working.forEach((item) => {
        dispatch(
          apiSlice.util.upsertQueryData("getIssues", { id: item.id }, item)
        );
      });
    }
    if (terminated !== undefined && Array.isArray(terminated)) {
      terminated.forEach((item) => {
        dispatch(
          apiSlice.util.upsertQueryData("getIssues", { id: item.id }, item)
        );
      });
    }
  }, [dispatch, pending, working, terminated]);

  const [open, setOpen] = useState<boolean>(false);
  const [selectedIssue, setSelectedIssue] = useState<string>("");
  const [issue, setIssue] = useState<GetIssues>({
    createdAt: new Date(),
    description: "",
    email: "",
    email2: "",
    phone2: "",
    files: [],
    id: "",
    kind: { name: "" },
    lastName: "",
    name: "",
    phone: "",
    socialSecurityNumber: "",
    state: { state: "pending" },
    department: "",
  });
  return (
    <section className="w-full flex flex-col justify-center">
      <Typography variant="h1" color="blue" className="w-full text-center mt-4">
        {programa}
      </Typography>

      <Card className="w-full mx-4 mt-4">
        <CardBody>
          <Typography variant="h2" color="blue" className="w-full text-center">
            Nuevas Gestiones
          </Typography>
        </CardBody>
        <CardBody className="grid grid-cols-12 gap-4">
          <Typography
            variant="h6"
            color="blue-gray"
            className="col-span-2 flex justify-center text-center"
          >
            Fecha de ingreso
          </Typography>
          <Typography className="col-span-3" variant="h6" color="blue-gray">
            Nombre
          </Typography>
          <Typography className="col-span-2" variant="h6" color="blue-gray">
            Problema
          </Typography>
          <Typography className="col-span-2" variant="h6" color="blue-gray">
            Telefono
          </Typography>
          <Typography className="col-span-3" variant="h6" color="blue-gray">
            e-Mail
          </Typography>
          {isPending ? (
            <Spinner fontSize={60} className="mx-auto" />
          ) : isPendingSuccess && Array.isArray(pending) ? (
            pending.map((item, i) => {
              console.log(item, "dada");
              return (
                <IssueRow
                  key={item.id}
                  id={item.id}
                  setOpen={setOpen}
                  setSelectedIssue={setSelectedIssue}
                />
              );
            })
          ) : isPendingError ? (
            "data" in pendingError && pendingError.data === "Unauthorized" ? (
              <div className="flex flex-col outline-2 outline-red-500 p-5 text-red-500 w-full col-span-12 font-sans justify-center text-3xl text-center">
                Acceso no Autorizado
              </div>
            ) : (
              <div className="flex flex-col outline-2 outline-red-500 p-5 ">
                <p className="font-bold text-lg ">Error</p>
                <p className="text-md ">Sin conexion</p>
              </div>
            )
          ) : (
            <Spinner fontSize={60} className="mx-auto" />
          )}
        </CardBody>
      </Card>

      <Card className="w-full mx-4 mt-4">
        <CardBody>
          <Typography variant="h2" color="blue" className="w-full text-center">
            Tramites en trabajo
          </Typography>
        </CardBody>
        <CardBody className="grid grid-cols-12 gap-4">
          <Typography
            variant="h6"
            color="blue-gray"
            className="col-span-2 flex justify-center text-center"
          >
            Fecha de ingreso
          </Typography>
          <Typography className="col-span-3" variant="h6" color="blue-gray">
            Nombre
          </Typography>
          <Typography className="col-span-2" variant="h6" color="blue-gray">
            Problema
          </Typography>
          <Typography className="col-span-2" variant="h6" color="blue-gray">
            Telefono
          </Typography>
          <Typography className="col-span-3" variant="h6" color="blue-gray">
            e-Mail
          </Typography>
          {isWorking ? (
            <Spinner fontSize={60} className="mx-auto" />
          ) : isWorkingSuccess && Array.isArray(working) ? (
            working.map((item, i) => {
              console.log(item, "dada");
              return (
                <IssueRow
                  key={item.id}
                  id={item.id}
                  setOpen={setOpen}
                  setSelectedIssue={setSelectedIssue}
                />
              );
            })
          ) : isWorkingError ? (
            "data" in workingError && workingError.data === "Unauthorized" ? (
              <div className="flex flex-col outline-2 outline-red-500 p-5 text-red-500 w-full col-span-12 font-sans justify-center text-3xl text-center">
                Acceso no Autorizado
              </div>
            ) : (
              <div className="flex flex-col outline-2 outline-red-500 p-5 ">
                <p className="font-bold text-lg ">Error</p>
                <p className="text-md ">Sin conexion</p>
              </div>
            )
          ) : (
            <Spinner fontSize={60} className="mx-auto" />
          )}
        </CardBody>
      </Card>

      <Card className="w-full mx-4 mt-4">
        <CardBody>
          <Typography variant="h2" color="blue" className="w-full text-center">
            Tramites Finalizados
          </Typography>
        </CardBody>
        <CardBody className="grid grid-cols-12 gap-4">
          <Typography
            variant="h6"
            color="blue-gray"
            className="col-span-2 flex justify-center text-center"
          >
            Fecha de ingreso
          </Typography>
          <Typography className="col-span-3" variant="h6" color="blue-gray">
            Nombre
          </Typography>
          <Typography className="col-span-2" variant="h6" color="blue-gray">
            Problema
          </Typography>
          <Typography className="col-span-2" variant="h6" color="blue-gray">
            Telefono
          </Typography>
          <Typography className="col-span-3" variant="h6" color="blue-gray">
            e-Mail
          </Typography>
          {isTerminated ? (
            <Spinner fontSize={60} className="mx-auto" />
          ) : isTerminatedSuccess && Array.isArray(terminated) ? (
            terminated.map((item, i) => {
              console.log(item, "dada");
              return (
                <IssueRow
                  key={item.id}
                  id={item.id}
                  setOpen={setOpen}
                  setSelectedIssue={setSelectedIssue}
                />
              );
            })
          ) : isTerminatedError ? (
            "data" in terminatedError &&
            terminatedError.data === "Unauthorized" ? (
              <div className="flex flex-col outline-2 outline-red-500 p-5 text-red-500 w-full col-span-12 font-sans justify-center text-3xl text-center">
                Acceso no Autorizado
              </div>
            ) : (
              <div className="flex flex-col outline-2 outline-red-500 p-5 ">
                <p className="font-bold text-lg ">Error</p>
                <p className="text-md ">Sin conexion</p>
              </div>
            )
          ) : (
            <Spinner fontSize={60} className="mx-auto" />
          )}
        </CardBody>
      </Card>

      <IssueView open={open} setOpen={setOpen} issueId={selectedIssue} />
    </section>
  );
}

function IssueRow({
  id,
  setSelectedIssue,
  setOpen,
}: {
  id: string;
  setSelectedIssue: Dispatch<SetStateAction<string>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { data, isSuccess, isFetching } = useGetIssuesQuery({ id });
  return isFetching ? (
    <Spinner fontSize={60} className="mx-auto" />
  ) : isSuccess && data && !Array.isArray(data) ? (
    <Button
      variant="filled"
      key={data.id}
      className={`${
        new Date(data.createdAt).getMilliseconds() -
          new Date().getMilliseconds() >
        86400000
          ? "bg-red-300"
          : "bg-transparent"
      } p-0 m-0 py-3 w-full shadow-none border-none col-span-12 grid grid-cols-12 hover:bg-blue-200`}
      onClick={() => {
        setOpen(true);
        console.log(data, "fetcheado");
        setSelectedIssue(data.id);
      }}
    >
      <div className="col-span-2 flex justify-center text-blue-gray-700">
        {new Date(data.createdAt).toLocaleDateString()}
      </div>
      <div className="col-span-3 text-blue-gray-700">{`${data.name} ${data.lastName}`}</div>
      <div className="col-span-2 text-blue-gray-700">{data.kind.name}</div>
      <div className="col-span-2 text-blue-gray-700">{data.phone}</div>
      <div className="col-span-3 text-blue-gray-700">{data.email}</div>
    </Button>
  ) : null;
}
