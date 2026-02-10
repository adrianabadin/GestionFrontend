import close from "@/icons/close.svg";

import { useAddPhoneMutation } from "@/_core/api";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import swal from "sweetalert2";
import {
  Input,
  Dialog,
  DialogHeader,
  Typography,
  Button,
  DialogBody,
  DialogFooter,
  Spinner,
} from "@material-tailwind/react";

import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const addPhoneSchema = z.object({
  phone: z
    .string({ required_error: "Debes proveer un numero de telefono" })
    .refine((value) => {
      let bool: boolean = true;
      if (value.length < 10) bool = false;
      value.split("").forEach((letter) => {
        if (Number.isNaN(parseInt(letter))) bool = false;
      });
      return bool;
    }),
});
type AddPhoneType = z.infer<typeof addPhoneSchema>;
export function AddPhone({
  open,
  setOpen,
  id,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  id: string;
}) {
  const [addPhone] = useAddPhoneMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddPhoneType>({
    resolver: zodResolver(addPhoneSchema),
    mode: "all",
  });
  return (
    <Dialog open={open} handler={() => setOpen((prev) => !prev)}>
      <DialogHeader title="Agregar Telefono">
        <div className="w-full flex justify-between">
          <Typography variant="h3" color="blue">
            Agregar Telefono
          </Typography>
          <Button
            variant="filled"
            className="bg-transparent shadow-none "
            onClick={() => setOpen(false)}
          >
            <Image src={close} alt="Cerrar" width={32} height={32} />
          </Button>
        </div>
      </DialogHeader>
      <form
        onSubmit={handleSubmit((data) => {
          console.log(data);
          addPhone({ id, phone: data.phone })
            .unwrap()
            .then(() => {
              setOpen(false);
            })
            .catch((error) => swal.fire("Error", error.message, "error"));
        })}
      >
        <DialogBody>
          <Input
            {...register("phone")}
            label="Nuevo Telefono"
            variant="outlined"
            error={errors.phone === undefined ? undefined : true}
          />
        </DialogBody>
        <DialogFooter className="w-full flex justify-around">
          <Button variant="gradient" color="red" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="gradient" color="blue" type="submit">
            {isSubmitting ? <Spinner /> : "Agregar"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
