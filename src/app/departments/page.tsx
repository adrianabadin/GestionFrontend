"use client";

import { useState } from "react";
import Gestion from "./components/Gestion";
import Practicas from "./components/Practicas";
import Cronicos from "./components/Cronicos";
import { Button } from "@material-tailwind/react";
import AsignDepartment from "./config/components/AsignDepartment";
import Protesis from "./components/Protesis";
import { useGetDepartmentsQuery } from "./_application/slices";
import { useAppSelector } from "@/_core/store";
import Item from "./components/MenuItem";
import Gc from "./components/Gc";
import Programa from "./components/gc/Basico";
import Link from "next/link";

export default function Departments() {
  const auth = useAppSelector((state) => state.auth);
  const [choice, setChoice] = useState<string>("");
  const { Departments, isAdmin } = auth;
  const { data } = useGetDepartmentsQuery(undefined);
  console.log(auth, "ASignados");
  return (
    <>
      <main className="grid grid-cols-12 bg-gray-200  min-h-screen  flex-col  ">
        <nav className="col-span-3  bg-gray-300 w-full flex flex-col">
          {isAdmin === true
            ? data?.map((item) => {
                if (
                  item.name === "Gestion Ciudadana" ||
                  item.name === "Gestion Ciudadana "
                ) {
                  return (
                    <Button
                      key={item.id}
                      variant="gradient"
                      color="white"
                      className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1"
                      onClick={() => setChoice("gc")}
                    >
                      {item.name.trim()}
                    </Button>
                  );
                } else
                  return (
                    <Button
                      key={item.id}
                      variant="gradient"
                      color="white"
                      className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1"
                      onClick={() => setChoice(item.name)}
                    >
                      {item.name}
                    </Button>
                  );
              })
            : Departments?.map((item) => {
                if (
                  item.name === "Gestion Ciudadana" ||
                  item.name === "Gestion Ciudadana "
                ) {
                  return (
                    <Button
                      key={item.id}
                      variant="gradient"
                      color="white"
                      className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1"
                      onClick={() => setChoice("gc")}
                    >
                      {item.name.trim()}
                    </Button>
                  );
                } else
                  return (
                    <Button
                      key={item.id}
                      variant="gradient"
                      color="white"
                      className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1"
                      onClick={() => setChoice(item.name)}
                    >
                      {item.name}
                    </Button>
                  );
              })}
          {/*<Item name="gestion" setChoice={setChoice} />
           <Button
            variant="gradient"
            color="white"
            className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1"
            onClick={() => setChoice("cronicos")}
          >
            Cronicos y alto costo
          </Button>
          <Button
            variant="gradient"
            color="white"
            className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1"
            onClick={() => setChoice("protesis")}
          >
            Protesis
          </Button>
          <Button
            variant="gradient"
            color="white"
            className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1 "
            onClick={() => setChoice("practicas")}
          >
            Practicas
          </Button> */}
          {(Departments !== undefined && Departments?.length > 0) || isAdmin ? (
            <Link
              href={"/GCiudadana"}
              className="flex flex-col justify-center w-full"
            >
              <Button
                variant="gradient"
                color="white"
                className="m-2 justify-center px-2  hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1 "
                // onClick={() => setChoice("gc")}
              >
                Gestion Ciudadana Ingreso
              </Button>
            </Link>
          ) : null}
        </nav>
        <div className="col-span-9  w-full items-center mx-auto  flex flex-col">
          {choice === "gc" ? (
            <Gc />
          ) : choice !== "" ? (
            <Programa department={choice} />
          ) : null}
        </div>
      </main>
    </>
  );
}
