"use client";

import {
  useCreateDepartmentMutation,
  useGetDepartmentsQuery,
} from "@/_core/api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Input,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
export const departmentAddSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe contener 3 letras" }),
  description: z
    .string()
    .min(3, { message: "La descripcion debe contener al menos 3 letras" }),
});
export type DepartmentAddType = z.infer<typeof departmentAddSchema>;

export default function AddDepartment() {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentAddType>({
    resolver: zodResolver(departmentAddSchema),
    mode: "onBlur",
  });
  const [createDepartment, { isLoading }] = useCreateDepartmentMutation();
  const onSubmit = (data: DepartmentAddType) => {
    createDepartment(data)
      .unwrap()
      .then(() => reset());
  };
  const { data, isFetching } = useGetDepartmentsQuery(undefined);
  return (
    <section className="w-full flex flex-col justify-between items-center">
      <Card className="w-2/3 ">
        <CardBody className="flex flex-col justify-between content-between h-64">
          <Typography color="blue" variant="h3" className="mb-4">
            Agregar Servicio
          </Typography>
          <Input
            {...register("name")}
            label="Nombre del Servicio"
            error={errors.name !== undefined ? true : false}
          />
          {errors.name !== undefined ? (
            <Typography variant="paragraph" className="text-center" color="red">
              {errors.name.message}
            </Typography>
          ) : null}
          <Input
            {...register("description")}
            label="Descripcion del servicio"
            error={errors.description !== undefined ? true : false}
          />
          {errors.description !== undefined ? (
            <Typography variant="paragraph" color="red" className="text-center">
              {errors.description.message}
            </Typography>
          ) : null}
        </CardBody>
        <CardFooter className="flex flex-col justify-center">
          <Button
            variant="gradient"
            onClick={handleSubmit(onSubmit)}
            color="blue"
            disabled={isLoading}
            className="self-center"
          >
            {isLoading ? <Spinner /> : "Agregar"}
          </Button>
        </CardFooter>
      </Card>
      <Card className="w-full  mt-12 max-h-[400px] min-h-[250px]">
        <Typography variant="h3" color="blue" className="m-3">
          Programas
        </Typography>

        <CardBody className="grid grid-cols-4 ">
          {data?.map((item) => (
            <Typography
              variant="lead"
              key={item.id}
              className="col-span-1 text-center row-span-1"
            >
              {item.name}
            </Typography>
          ))}
        </CardBody>
      </Card>
    </section>
  );
}
