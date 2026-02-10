"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Typography,
} from "@material-tailwind/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSignUpMutation } from "@/_core/auth/_application/slices";
import { SignUpSchema } from "@/_core/auth/_domain/schemas";
import type { SignUpType } from "@/_core/auth/_domain/types";
export function SignUpModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignUpType>({
    resolver: zodResolver(SignUpSchema),
    mode: "onBlur",
  });
  const [signup, { isLoading }] = useSignUpMutation();
  const onSubmit = (data: SignUpType) => {
    signup({ ...data, password2: undefined as any })
      .unwrap()
      .then(() => setOpen(false))
      .catch((error) => setError("root", { message: error }));
  };

  return (
    <>
      <Dialog
        open={open}
        handler={() => setOpen((prev: boolean) => !prev)}
        placeholder={null}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader placeholder={null}>
            <div className="flex justify-between w-full">
              <Typography placeholder={null} variant="h3" color="blue">
                Registrar Usuario
              </Typography>
              <Button
                variant="gradient"
                color="white"
                placeholder={null}
                onClick={() => setOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </DialogHeader>
          <DialogBody className="w-2/3 mx-auto justify-around min-h-[400px] flex flex-col">
            <Input
              {...register("username")}
              variant="outlined"
              label="e-Mail"
              className=""
              error={errors.username ? true : undefined}
            ></Input>
            {errors.username && (
              <p className="text-red-500">{errors.username?.message}</p>
            )}
            <Input
              {...register("lastname")}
              variant="outlined"
              label="Apellido"
              className=""
              error={errors.lastname ? true : undefined}
            ></Input>
            {errors.lastname && (
              <p className="text-red-500">{errors.lastname?.message}</p>
            )}
            <Input
              {...register("name")}
              variant="outlined"
              label="Nombre"
              className=""
              error={errors.name ? true : undefined}
            ></Input>
            {errors.name && (
              <p className="text-red-500">{errors.name?.message}</p>
            )}

            <Input
              {...register("password")}
              variant="outlined"
              label="Contraseña"
              className=""
              error={errors.password ? true : undefined}
              type="password"
            ></Input>
            {errors.password && (
              <p className="text-red-500">{errors.password?.message}</p>
            )}
            <Input
              {...register("password2")}
              variant="outlined"
              label="Repetir contraseña"
              className=""
              error={errors.password2 ? true : undefined}
              type="password"
            ></Input>
            {errors.password2 && (
              <p className="text-red-500">{errors.password2?.message}</p>
            )}
          </DialogBody>
          {errors.root && (
            <p className="text-red-500">{errors.password2?.message}</p>
          )}
          <DialogFooter>
            <Button variant="gradient" type="submit" color="blue">
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </Button>
          </DialogFooter>
        </form>
        <button
          onClick={() => {
            const result = SignUpSchema.safeParse(getValues());
            if (!result.success) {
              console.log(result.error, result.error.issues[0].path);
            }
          }}
        ></button>
      </Dialog>
    </>
  );
}

export default SignUpModal;
