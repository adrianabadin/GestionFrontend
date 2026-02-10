import { useAddMailMutation } from "@/_core/api";
import { zodResolver } from "@hookform/resolvers/zod";
import email from "@/icons/emailadd.svg";
import document from "@/icons/document.svg";
import exit from "@/icons/exit.svg";
import close from "@/icons/close.svg";
import download from "@/icons/download.svg";
import upload from "@/icons/UPLOAD.svg";
import addPhone from "@/icons/addPhone.svg";

import swal from "sweetalert2";
import Image from "next/image";
import {
  Dialog,
  DialogHeader,
  Typography,
  Button,
  DialogBody,
  DialogFooter,
  Input,
  Spinner,
} from "@material-tailwind/react";

import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const addMailSchema = z.object({
  email: z
    .string({ required_error: "Debes proveer un mail" })
    .email({ message: "Debes proveer un mail valido" }),
});
type AddMailType = z.infer<typeof addMailSchema>;
export function AddMail({
  open,
  setOpen,
  id,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  id: string;
}) {
  const [addMail, { isLoading }] = useAddMailMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddMailType>({
    resolver: zodResolver(addMailSchema),
    mode: "all",
  });
  return (
    <Dialog open={open} handler={() => setOpen((prev) => !prev)}>
      <DialogHeader title="Agregar Telefono">
        <div className="w-full flex justify-between">
          <Typography variant="h3" color="blue">
            Agregar Mail
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
          addMail({ id, mail: data.email })
            .unwrap()
            .then(() => {
              setOpen(false);
            })
            .catch((error) => {
              console.log(error);
              swal.fire("Error", `${error.message}`, "error");
            });
        })}
      >
        <DialogBody>
          <Input
            {...register("email")}
            label="Nuevo Mail"
            variant="outlined"
            error={errors.email === undefined ? undefined : true}
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
