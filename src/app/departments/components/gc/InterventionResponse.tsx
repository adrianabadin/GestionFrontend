import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Spinner,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { error } from "console";
import { useAppSelector } from "@/_core/store";
import { useSendMailMutation } from "@/_core/api";
import swal from "sweetalert2";
const answerSchema = z.object({
  answer: z
    .string({ required_error: "Debes ingresar una cadena de texto" })
    .min(10, {
      message: "La respuesta tiene que tener al menos 10 caracteres",
    }),
});
type Answer = z.infer<typeof answerSchema>;
export function InterventionResponse({
  open,
  setOpen,
  to,
  userName,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  to: string;
  userName: string;
}) {
  const [sendMail] = useSendMailMutation();
  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm<Answer>({
    resolver: zodResolver(answerSchema),
    mode: "all",
  });
  const { name, lastname } = useAppSelector((store) => store.auth);
  return (
    <Dialog
      size="xl"
      open={open}
      title="Enviar Respuesta"
      handler={() => setOpen((prev) => !prev)}
    >
      <DialogHeader>
        <Typography variant="h3" color="blue">
          Responder al Ciudadano
        </Typography>
      </DialogHeader>
      <form
        onSubmit={handleSubmit((data) => {
          console.log(data);
          sendMail({
            autor: `${name} ${lastname}`,
            nombre: userName,
            to,
            body: data.answer,
          })
            .unwrap()
            .then(() => setOpen(false))
            .catch((e) => {
              swal.fire("Error", e.text, "error");
            });
        })}
      >
        <DialogBody>
          <Textarea
            {...register("answer")}
            label="Respuesta"
            variant="outlined"
            error={errors.answer !== undefined ? true : undefined}
          />
          <p className="text-red-500 font-bold w-full text-center">
            {errors.answer !== undefined ? errors.answer?.message : "  "}
          </p>
        </DialogBody>
        <DialogFooter className="flex justify-around">
          <Button
            type="button"
            variant="gradient"
            color="red"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="gradient"
            color="blue"
            disabled={errors.answer !== undefined ? true : undefined}
          >
            {isSubmitting !== undefined ? <Spinner /> : "Enviar"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
