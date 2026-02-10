"use client";
import { Button } from "@material-tailwind/react";
import React, { useState } from "react";
import AdminConfig from "./components/AdminConfig";
import AddDepartment from "./components/AddDepartment";
import AddState from "./components/AddState";
import AsignDepartment from "./components/AsignDepartment";
import AddKindOfIssue from "./components/AddKindOfIssue";
import AsignResponsable from "./components/AsignResponsable";

function Config() {
  const [choice, setChoice] = useState<
    | "admin"
    | "addProgram"
    | "asignProgram"
    | "addCity"
    | "addKindOfIssue"
    | ""
    | "asignResponsable"
  >("");
  return (
    <main className="grid grid-cols-12  gap-3 min-h-screen  flex-col  ">
      <nav className="col-span-3  bg-white w-full flex flex-col">
        <Button
          variant="gradient"
          color="white"
          className="m-2 justify-center px-2 hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1"
          onClick={() => setChoice("admin")}
        >
          Asignar Administrador
        </Button>
        <Button
          variant="gradient"
          color="white"
          className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1"
          onClick={() => setChoice("addProgram")}
        >
          Agregar Programa
        </Button>
        <Button
          variant="gradient"
          color="white"
          className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1"
          onClick={() => setChoice("asignProgram")}
        >
          Asignar Programa
        </Button>
        <Button
          variant="gradient"
          color="white"
          className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1"
          onClick={() => setChoice("asignResponsable")}
        >
          Asignar Responsable de Programa
        </Button>
        <Button
          variant="gradient"
          color="white"
          className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1 "
          onClick={() => setChoice("addCity")}
        >
          Agregar Partido
        </Button>
        <Button
          variant="gradient"
          color="white"
          className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1 "
          onClick={() => setChoice("addKindOfIssue")}
        >
          Agregar Problematica (GC)
        </Button>
      </nav>
      <div className="col-span-9  w-full items-center mx-auto mt-4 flex flex-col">
        {choice === "admin" ? (
          <AdminConfig />
        ) : choice === "addProgram" ? (
          <AddDepartment />
        ) : choice === "addCity" ? (
          <AddState />
        ) : choice === "asignProgram" ? (
          <AsignDepartment />
        ) : choice === "addKindOfIssue" ? (
          <AddKindOfIssue />
        ) : choice === "asignResponsable" ? (
          <AsignResponsable />
        ) : null}
      </div>
    </main>
  );
}

export default Config;
