"use client";
import { useChangePasswordMutation } from "@/_core/auth/_application/slices";
import errorsToRecord from "@hookform/resolvers/io-ts/dist/errorsToRecord.js";
import { Button, Input, Spinner, Typography } from "@material-tailwind/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function Page() {
  const query = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const [fetched, setFetched] = useState(false);
  let token: string;
  if (Array.isArray(params.token)) token = params.token[0];
  else token = params.token;
  const [changePassword, { isError, isLoading, error: fetchError }] =
    useChangePasswordMutation();
  const error: any = fetchError;
  console.log({ params });
  const [password, setPassword] = useState("");
  if (isError) console.log(error, error.data.name, "otro");

  return (
    <section className="w-full flex justify-center">
      <article className="w-1/2 border border-blue flex text-center flex-col items-center justify-center mt-4 bg-white box-border p-6 rounded-md">
        <Typography
          variant="h2"
          color="blue"
          placeholder={""}
          className="text-center"
        >
          Cambio de Contraseña
        </Typography>
        <br />
        <Input
          label="Ingrese su nueva contraseña"
          title="Ingrese su nueva contraseña"
          placeholder="Ingrese su nueva contraseña"
          crossOrigin={""}
          variant="outlined"
          type="password"
          name="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <Button
          variant="filled"
          color="blue"
          placeholder={""}
          className="pt-4 mt-4"
          onClick={(e) => {
            e.preventDefault();
            setFetched(true);
            changePassword({
              password,
              token,
              username: query.get("username") ?? "",
            })
              .unwrap()
              .then((e) => {
                router.push("/login");
              })
              .finally(() => {
                setFetched(false);
              });
          }}
        >
          {fetched ? <Spinner /> : "Modificar"}
        </Button>
        {isError ? (
          <p className="text-red-500 text-center">
            {error?.data !== undefined &&
            error?.data?.errorContent?.map((e: any) => e.message + ", ") !==
              undefined
              ? error?.data?.errorContent?.map((e: any) => e.message + ", ")
              : error?.data !== undefined && error.data.name !== undefined
                ? error.data.name
                : "Error al modificar el usuario intente nuevamente mas tarde"}
          </p>
        ) : (
          ""
        )}
      </article>
    </section>
  );
}

export default Page;
