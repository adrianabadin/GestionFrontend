"use client";

import close from "@/icons/close.svg";

import Dialog, {
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "../CustomDialog";
import CustomTypography from "../CustomTypography";
import Image from "next/image";
import { Controller, Control, useForm } from "react-hook-form";
import { Option, Button, Select, Spinner } from "@material-tailwind/react";
import {
  apiSlice,
  derivationSchema,
  DerivationType,
  useDerivateIssueMutation,
  useGetDepartmentsQuery,
  useGetUsersQuery,
} from "@/_core/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/_core/store";

export function DerivationView({
  issueId,
  state,
  setState,
}: {
  issueId: string;
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    data: departments,
    isSuccess,
    isFetching: isDepartments,
  } = useGetDepartmentsQuery({});
  const {
    data: users,
    isSuccess: userSuccess,
    isFetching: userFetching,
  } = useGetUsersQuery({});
  const dispatch = useAppDispatch();
  const {
    control,
    formState: { errors },
    getValues,
  } = useForm<DerivationType>({
    resolver: zodResolver(derivationSchema),
    mode: "onBlur",
    defaultValues: { issueId: issueId },
  });
  const [derivateTrigger] = useDerivateIssueMutation();

  return (
    <Dialog size="md" className="mx-4" open={state} setOpen={setState}>
      <DialogHeader title="Problema del ciudadano">
        <div className="flex justify-between w-full align-middle items-center">
          <CustomTypography variant="h3" color="blue">
            Derivar para resolucion
          </CustomTypography>
          <Button
            placeholder={""}
            variant="filled"
            className="w-fit bg-transparent shadow-none border-none outline-none"
            onClick={() => setState(false)}
          >
            <Image src={close} alt="Cerrar" width={32} height={32} />
          </Button>
        </div>
      </DialogHeader>
      <DialogBody className="flex gap-10  justify-around">
        <Controller
          name="userIssue"
          control={control}
          render={({ field }) => (
            <Select
              className="px-4 "
              containerProps={{ className: "col-span-2 col-start-2" }}
              placeholder="Selecciona un departamento"
              label="Usuario"
              {...field}
            >
              {isDepartments ? (
                <Spinner></Spinner>
              ) : userSuccess ? (
                users?.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.name} {user.lastname}
                  </Option>
                ))
              ) : (
                <Option value="">-Sin Datos-</Option>
              )}
            </Select>
          )}
        ></Controller>
        <Controller
          name="departmentId"
          control={control}
          render={({ field }) => (
            <Select
              className="px-4 col-span-2"
              containerProps={{ className: "col-span-2 col-start-5" }}
              placeholder="Selecciona un usuario"
              label="Departamento"
              {...field}
            >
              {isDepartments ? (
                <Spinner></Spinner>
              ) : isSuccess ? (
                departments?.map((department) => (
                  <Option key={department.id} value={department.id}>
                    {department.name}
                  </Option>
                ))
              ) : (
                <Option value="">-Sin Datos-</Option>
              )}
            </Select>
          )}
        ></Controller>
      </DialogBody>
      <DialogFooter className="w-full  flex justify-around align-middle items-center">
        <Button
          variant="gradient"
          color="blue"
          placeholder={""}
          className="w-28 text-center p-0 py-3"
          onClick={() => {
            const data = getValues();
            console.log(data);
            derivateTrigger(data)
              .unwrap()
              .then((response) => {
                console.log(response);
                const req = getValues();
                dispatch(
                  apiSlice.util.invalidateTags([
                    { type: "issues", id: "LIST" },
                  ]),
                );
                dispatch(
                  apiSlice.util.invalidateTags([
                    { type: "issues", id: req.issueId },
                  ]),
                );
                setState(false);
              })
              .catch((error) => {
                console.log(error);
              });
          }}
        >
          Derivar
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
