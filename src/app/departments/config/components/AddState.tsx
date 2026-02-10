"use client";

import {
  useCreateStateMutation,
  useGetStatesQuery,
} from "@/_core/api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardBody,
  Typography,
  CardFooter,
  Button,
  Spinner,
  Input,
} from "@material-tailwind/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
export const DemographyCreateSchema = z.object({
  state: z.string().min(3, { message: "El minimo de caracteres es de 3" }),
  population: z.string().refine(
    (value) => {
      const parsedData = parseInt(value);
      if (isNaN(parsedData)) return false;
      else return true;
    },
    { message: "Debe contener un numero" }
  ),
  politics: z.string().min(3, { message: "El minimo de caracteres es de 3" }),
  description: z
    .string()
    .min(3, { message: "El minimo de caracteres es de 3" }),
});
export type DemografyCreateType = z.infer<typeof DemographyCreateSchema>;
/**
 *
 */
export default function AddState() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DemografyCreateType>({
    resolver: zodResolver(DemographyCreateSchema),
    mode: "onBlur",
  });
  const [createState, { isLoading }] = useCreateStateMutation();
  const onSubmit = (data: any) => {
    createState({ ...data, population: parseInt(data.population) });
  };
  const { data, isFetching } = useGetStatesQuery(undefined);
  return (
    <section className="w-full flex flex-col justify-between items-center">
      <Card className="w-2/3 ">
        <CardBody className="flex flex-col justify-between content-between h-96">
          <Typography color="blue" variant="h3" className="mb-4">
            Agregar Partido
          </Typography>
          <Input
            {...register("state")}
            label="Nombre del Partido"
            error={errors.state !== undefined ? true : false}
          />
          {errors.state !== undefined ? (
            <Typography variant="paragraph" className="text-center" color="red">
              {errors.state.message}
            </Typography>
          ) : null}
          <Input
            {...register("description")}
            label="Descripcion del partido"
            error={errors.description !== undefined ? true : false}
          />
          {errors.description !== undefined ? (
            <Typography variant="paragraph" color="red" className="text-center">
              {errors.description.message}
            </Typography>
          ) : null}
          <Input
            {...register("politics")}
            label="Partido politico gobernante"
            error={errors.politics !== undefined ? true : false}
          />
          {errors.politics !== undefined ? (
            <Typography variant="paragraph" color="red" className="text-center">
              {errors.politics.message}
            </Typography>
          ) : null}
          <Input
            {...register("population")}
            label="Numero de habitantes"
            type="number"
            error={errors.population !== undefined ? true : false}
          />
          {errors.population !== undefined ? (
            <Typography variant="paragraph" color="red" className="text-center">
              {errors.population.message}
            </Typography>
          ) : null}
        </CardBody>
        <CardFooter className="flex flex-col justify-center">
          <Button
            variant="gradient"
            onClick={handleSubmit(onSubmit)}
            color="blue"
            disabled={isLoading}
          >
            {isLoading ? <Spinner className="self-center" /> : "Agregar"}
          </Button>
        </CardFooter>
      </Card>
      <Card className="w-full  mt-8 max-h-[400px] min-h-[250px]">
        <Typography variant="h3" color="blue" className="m-3">
          Partidos
        </Typography>

        <CardBody className="grid grid-cols-4 ">
          {data?.map((item) => (
            <Typography
              variant="lead"
              key={item.id}
              className="col-span-1 text-center row-span-1"
            >
              {item.state}
            </Typography>
          ))}
        </CardBody>
      </Card>
    </section>
  );
}
