"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLoginMutation } from "@/_core/auth/_application/slices";
import { LoginSchema } from "@/_core/auth/_domain/schemas";
import { authApiSlice } from "@/_core/auth/_application/slices";
import type { LoginType } from "@/_core/auth/_domain/types";
import Link from "next/link";
import SignUpModal from "./Signup";
import { useRouter } from "next/navigation";

export function LoginModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const [
    sendTokenTrigger,
    {
      isError: isSendTokenError,
      error: sendTokenError,
      isFetching: isSendTokenFetching,
    },
  ] = authApiSlice.endpoints.sendToken.useLazyQuery();
  if (isSendTokenError) console.log(sendTokenError);
  const [login, { isLoading }] = useLoginMutation();
  const {
    register,
    reset,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
    mode: "onBlur",
  });
  const onSubmit = (data: LoginType) => {
    login(data)
      .unwrap()
      .then((response) => {
        console.log(response);
        reset();
        setOpen(false);
        // Redirect to departments after successful login
        router.push("/departments");
      })
      .catch((error) => setError("root", { message: error }));
  };
  const [signUp, setSignUp] = useState<boolean>(false);
  // const [
  //   signUp,
  //   { isError: isSignUpError, isLoading: isSignUpLoading, error: signUpError },
  // ] = useSignUpMutation();
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
                Ingrese Usuario y Contraseña
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
          <DialogBody
            className="w-2/3 mx-auto justify-around min-h-40 flex flex-col"
            placeholder={""}
          >
            <Input
              crossOrigin={""}
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
              crossOrigin={""}
              {...register("password")}
              variant="outlined"
              label="Contraseña"
              type="password"
              className=""
              error={errors.password ? true : undefined}
            ></Input>
            {errors.password && (
              <p className="text-red-500">{errors.password?.message}</p>
            )}
          </DialogBody>
          <DialogFooter placeholder={""} className="flex flex-col items-center">
            <Button
              placeholder={""}
              variant="gradient"
              type="submit"
              color="blue"
              disabled={isSubmitting}
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>
            <div className="flex justify-around w-full my-3">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const { username } = getValues();
                  if (username !== undefined && username !== null) {
                    sendTokenTrigger({ username });
                  }
                }}
              >
                {isSendTokenFetching ? <Spinner /> : "Recuperar Contraseña"}
              </a>
              <a
                href="#"
                onClick={() => {
                  setSignUp((e) => !e);
                }}
              >
                Registrar Usuario
              </a>
            </div>

            {isSendTokenError ? (
              <p className="text-red-500 text-center">
                Error al intentar modificar contraseña
              </p>
            ) : (
              ""
            )}
          </DialogFooter>
        </form>
        <SignUpModal open={signUp} setOpen={setSignUp} />
      </Dialog>
    </>
  );
}

export default LoginModal;
