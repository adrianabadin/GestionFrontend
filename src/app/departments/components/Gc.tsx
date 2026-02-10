/* eslint-disable @next/next/no-img-element */
"use client";

import {
  GetIssues,
  useGetIssuesByStateQuery,
  useGetIssuesQuery,
} from "@/_core/api";
import {
  Button,
  Card,
  CardBody,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { Dispatch, SetStateAction, useState } from "react";
import { IssueView } from "./gc/IssueView";
import { clearAuth } from "@/_core/auth/_application/slices";

function Gc() {
  const {
    data: issues,
    isFetching,
    error,
    isError,
    isSuccess,
  } = useGetIssuesByStateQuery("pending");
  const {
    data: working,
    isFetching: isFetchingW,
    isSuccess: isSuccessW,
  } = useGetIssuesByStateQuery("working");
  const {
    data: finished,
    isFetching: isFetchingF,
    isSuccess: isSuccessF,
  } = useGetIssuesByStateQuery("terminated");
  const [open, setOpen] = useState<boolean>(false);

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
  if (isError && "data" in error && error.data === "Unauthorized") {
    clearAuth();
  }
  console.log(error, "data");
  return (
    <section className="w-full flex flex-col justify-center">
      <Card placeholder={""} className="w-full mx-4 mt-4">
        <CardBody placeholder={""}>
          <Typography
            placeholder={""}
            variant="h2"
            color="blue"
            className="w-full text-center"
          >
            Nuevas Gestiones
          </Typography>
        </CardBody>
        <CardBody placeholder={""} className="grid grid-cols-12 gap-4">
          <Typography
            placeholder={""}
            variant="h6"
            color="blue-gray"
            className="col-span-2 flex justify-center text-center"
          >
            Fecha de ingreso
          </Typography>
          <Typography
            placeholder={""}
            className="col-span-3"
            variant="h6"
            color="blue-gray"
          >
            Nombre
          </Typography>
          <Typography
            className="col-span-2"
            placeholder={""}
            variant="h6"
            color="blue-gray"
          >
            Problema
          </Typography>
          <Typography
            className="col-span-2"
            variant="h6"
            placeholder={""}
            color="blue-gray"
          >
            Telefono
          </Typography>
          <Typography
            className="col-span-3"
            variant="h6"
            color="blue-gray"
            placeholder={""}
          >
            e-Mail
          </Typography>
          {isSuccess && Array.isArray(issues) ? (
            issues.map((item, i) => {
              console.log(item, "dada");
              return (
                <IssueRow
                  key={item.id}
                  data={item}
                  setOpen={setOpen}
                  setIssue={setIssue}
                />
              );
            })
          ) : isError ? (
            "data" in error && error.data === "Unauthorized" ? (
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

      <Card placeholder={""} className="w-full mx-4 mt-4">
        <CardBody placeholder={""}>
          <Typography
            placeholder={""}
            variant="h2"
            color="blue"
            className="w-full text-center"
          >
            Tramites en trabajo
          </Typography>
        </CardBody>
        <CardBody className="grid grid-cols-12 gap-4" placeholder={""}>
          <Typography
            placeholder={""}
            variant="h6"
            color="blue-gray"
            className="col-span-2 flex justify-center text-center"
          >
            Fecha de ingreso
          </Typography>
          <Typography
            className="col-span-3"
            placeholder={""}
            variant="h6"
            color="blue-gray"
          >
            Nombre
          </Typography>
          <Typography
            className="col-span-2"
            variant="h6"
            placeholder={""}
            color="blue-gray"
          >
            Problema
          </Typography>
          <Typography
            className="col-span-2"
            variant="h6"
            color="blue-gray"
            placeholder={""}
          >
            Telefono
          </Typography>
          <Typography
            className="col-span-3"
            variant="h6"
            color="blue-gray"
            placeholder={""}
          >
            e-Mail
          </Typography>
          {isSuccessW && Array.isArray(working) ? (
            working.map((item, i) => {
              console.log(item, "dada");
              return (
                <IssueRow
                  key={item.id}
                  data={item}
                  setOpen={setOpen}
                  setIssue={setIssue}
                />
              );
            })
          ) : isError ? (
            "data" in error && error.data === "Unauthorized" ? (
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

      <Card placeholder={""} className="w-full mx-4 mt-4">
        <CardBody placeholder={""}>
          <Typography
            variant="h2"
            placeholder={""}
            color="blue"
            className="w-full text-center"
          >
            Tramites Finalizados
          </Typography>
        </CardBody>
        <CardBody className="grid grid-cols-12 gap-4" placeholder={""}>
          <Typography
            placeholder={""}
            variant="h6"
            color="blue-gray"
            className="col-span-2 flex justify-center text-center"
          >
            Fecha de ingreso
          </Typography>
          <Typography
            className="col-span-3"
            placeholder={""}
            variant="h6"
            color="blue-gray"
          >
            Nombre
          </Typography>
          <Typography
            className="col-span-2"
            variant="h6"
            placeholder={""}
            color="blue-gray"
          >
            Problema
          </Typography>
          <Typography
            className="col-span-2"
            variant="h6"
            color="blue-gray"
            placeholder={""}
          >
            Telefono
          </Typography>
          <Typography
            className="col-span-3"
            variant="h6"
            color="blue-gray"
            placeholder={""}
          >
            e-Mail
          </Typography>
          {isSuccessW && Array.isArray(finished) ? (
            finished.map((item, i) => {
              console.log(item, "dada");
              return (
                <IssueRow
                  key={item.id}
                  data={item}
                  setOpen={setOpen}
                  setIssue={setIssue}
                />
              );
            })
          ) : isError ? (
            "data" in error && error.data === "Unauthorized" ? (
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

      <IssueView open={open} setOpen={setOpen} issueId={issue.id} />
    </section>
  );
}

function IssueRow({
  data,
  setIssue,
  setOpen,
}: {
  data: GetIssues;
  setIssue: Dispatch<SetStateAction<GetIssues>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Button
      placeholder={""}
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
        console.log(data);
        setIssue(data);
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
  );
}

export default Gc;
