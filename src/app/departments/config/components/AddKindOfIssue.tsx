import {
  useAddKindOfIssueMutation,
  useDeleteKOIMutation,
  useGetKOIsQuery,
  useUpdateKOIMutation,
} from "@/_core/api";
import trash from "@/icons/trash fondoblanco.svg";
import swal from "sweetalert2";
import edit from "@/icons/edit.svg";
import Image from "next/image";
import close from "@/icons/close.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NewKindOfIssue } from "../../../../../../Backend/gc/gc.schemas";
import { handleClientScriptLoad } from "next/script";

export const addIssue = z.object({
  name: z.string().min(3, { message: "Debe tener al menos 3 caracteres" }),
  text: z.string().min(3, { message: "Debe tener al menos 3 caracteres" }),
});
export type AddKOI = z.infer<typeof addIssue>;
function AddKindOfIssue() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, disabled, errors, isValid },
  } = useForm<z.infer<typeof addIssue>>({
    mode: "all",
    resolver: zodResolver(addIssue),
  });
  const [addKOI] = useAddKindOfIssueMutation();
  const onSubmit = (data: AddKOI) => {
    console.log(data);
    addKOI(data);
  };
  return (
    <>
      <section className="w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex justify-center"
        >
          <Card className="w-2/3 ">
            <CardBody className="w-full">
              <Typography
                variant="h2"
                color="blue"
                className="text-center mb-4"
              >
                Agregar un tipo de Problema
              </Typography>
              <Input
                label="Nombre"
                {...register("name")}
                variant="outlined"
                containerProps={{ className: "my-4" }}
              />
              <p className="text-red-500 font-bold text-center w-full">
                {errors.name !== undefined ? errors.name.message : null}
              </p>
              <Textarea
                {...register("text")}
                label="Descripcion del problema"
                variant="outlined"
                containerProps={{ className: "my-4" }}
              />
              <p className="text-red-500 font-bold text-center w-full">
                {errors.text !== undefined ? errors.text.message : null}
              </p>
            </CardBody>
            <CardFooter className="flex justify-center">
              <Button
                type="submit"
                disabled={isValid ? undefined : true}
                color="blue"
                variant="gradient"
              >
                Guardar
              </Button>
            </CardFooter>
          </Card>
        </form>
      </section>
      <GetKOIs />
    </>
  );
}
export function GetKOIs() {
  const { data: kois } = useGetKOIsQuery(undefined);
  const [deleteKOI] = useDeleteKOIMutation();
  const [open, setOpen] = useState<boolean>(false);
  const [koi, setKOI] = useState<NewKindOfIssue & { id: string }>({
    id: "",
    name: "",
    text: "",
  });
  return (
    <section className="w-2/3 mt-4">
      <Card>
        <CardBody>
          <Typography variant="h3" color="blue">
            Tipos de problemas actuales
          </Typography>
        </CardBody>
        {kois !== undefined && Array.isArray(kois) ? (
          <CardBody
            color="white"
            className="flex flex-col justify-center align-middle"
          >
            <ul className="list-disc ">
              {kois.map((item) => (
                <li
                  className="grid grid-cols-3 list-disc align-middle justify-center items-center "
                  key={item.id}
                >
                  <Typography variant="h5" as="p" color="blue-gray">
                    {item.name}
                  </Typography>
                  <Button
                    variant="filled"
                    className="bg-transparent w-full outline-none shadow-none border-none rounded-full flex justify-center"
                    onClick={() => {
                      deleteKOI(item.id)
                        .unwrap()
                        .then()
                        .catch((e) => {
                          swal.fire("Error al eliminar", e.text, "error");
                        });
                    }}
                  >
                    <Image src={trash} alt="Borrar" width={32} height={32} />
                  </Button>
                  <Button
                    variant="filled"
                    className="bg-transparent w-full outline-none shadow-none border-none rounded-full flex justify-center"
                    onClick={() => {
                      setOpen(true);
                      setKOI({
                        name: item.name,
                        text: item.text,
                        id: item.id,
                      });
                    }}
                  >
                    <Image src={edit} alt="Editar" width={32} height={32} />
                  </Button>
                </li>
              ))}
            </ul>
          </CardBody>
        ) : null}
      </Card>
      <EditKOI open={open} setOpen={setOpen} koi={koi} />
    </section>
  );
}

function EditKOI({
  open,
  setOpen,
  koi,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  koi: NewKindOfIssue & { id: string };
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NewKindOfIssue>({
    resolver: zodResolver(addIssue),
    mode: "all",
  });
  const [updateKOI] = useUpdateKOIMutation();
  useEffect(() => {
    setValue("name", koi.name);
    setValue("text", koi.text);
  }, [setValue, koi]);
  return (
    <>
      <Dialog
        open={open}
        handler={() => {
          setOpen((prev) => !prev);
        }}
      >
        <DialogHeader
          title="Editar Tipo de problema"
          className="flex justify-between"
        >
          <Typography variant="h3" color="blue">
            Editar tipo de problema
          </Typography>
          <Button
            variant="filled"
            className="bg-transparent outline-none border-none shadow-none"
            onClick={() => setOpen(false)}
          >
            <Image src={close} alt="Cerrar" width={32} height={32} />
          </Button>
        </DialogHeader>
        <DialogBody className="m-3 ">
          <Input
            {...register("name")}
            label="Nombre"
            type="text"
            containerProps={{ className: "my-3 " }}
            error={errors.name !== undefined ? true : undefined}
          />
          <p className="text-red-500 font-bold text-center">
            {errors.name !== undefined ? `${errors.name.message}` : null}
          </p>
          <Input
            {...register("text")}
            label="Descripcion"
            type="text"
            containerProps={{ className: "my-3 " }}
            error={errors.text !== undefined ? true : undefined}
          />
          <p className="text-red-500 font-bold text-center">
            {errors.text !== undefined ? `${errors.text.message}` : null}
          </p>
        </DialogBody>
        <DialogFooter className="flex justify-end">
          <Button
            variant="gradient"
            color="blue"
            onClick={handleSubmit((data) => {
              updateKOI({ ...data, id: koi.id })
                .unwrap()
                .then()
                .catch((e) =>
                  swal.fire("Error al Actualizar", e.text, "error")
                );
              setOpen(false);
            })}
          >
            Guardar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
export default AddKindOfIssue;
