"use client";
import closeIcon from "@/icons/close.svg";
import trashIcon from "@/icons/trash fondoblanco.svg";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Option,
  Select,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import Image from "next/image";
import { Dispatch, MouseEventHandler, SetStateAction, useState } from "react";
import FileInput from "./FileInput";
import { UserIssue } from "./IssueForm";
import {
  useDeleteImageMutation,
  useUploadImageMutation,
} from "@/_core/api";
import swal from "sweetalert2";

import { GoogleError } from "./google.errors";
import { UseFormGetValues } from "react-hook-form";
import { Intervention } from "@/app/departments/components/Gc";
function FileUpload({
  title,
  open,
  setOpen,
  setValue,
  getValues,
}: {
  setValue: (...args: any) => any;
  getValues: UseFormGetValues<UserIssue | Intervention>; //(...args: any) => any;
  title: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [fileState, setFileState] = useState<FileList | undefined>();
  const [description, setDescription] = useState<string>("");
  const [filesContainer, setFilesContainer] = useState<
    {
      driveId: string;
      description: string;
      name: string;
    }[]
  >(getValues("files") || [{ description: "", driveId: "", name: "" }]);
  const [fileName, setFileName] = useState<string>("");
  const [uploadImage, { isLoading }] = useUploadImageMutation();
  const handleAddImage = () => {
    const body = new FormData();
    if (fileState !== undefined) {
      body.append("image", fileState[0]);
      uploadImage(body)
        .unwrap()
        .then((response) => {
          setFilesContainer((prev) => [
            ...prev,
            { name: fileName, description: description, driveId: response.id },
          ]);
          setFileName("");
          setDescription("");
          setFileState(undefined);
          setValue(
            "files",
            filesContainer.filter((file) => file.driveId !== "")
          );
        })
        .catch((error: GoogleError) => {
          swal.fire(
            "Error al guardar imagen",
            error.name + ": " + error.text,
            "error"
          );
        });
    }
  };
  const [deleteImage, { isLoading: isDeleting }] = useDeleteImageMutation();
  const handleRemoveItem: MouseEventHandler<HTMLButtonElement> = (event) => {
    if ("id" in event.target) {
      console.log(event.target.id, event.target);
      const id = event.target.id as string;
      deleteImage(id)
        .unwrap()
        .then((res) => console.log(res, "Delete"))
        .catch((e) => {
          swal.fire("Error:", e.text, "error");
          console.log(e);
        });
      setFilesContainer((state) => {
        const data = state.filter((item) => {
          console.log(item);
          return item.driveId !== id;
        });
        console.log(data, id, "algo");
        return data;
      });
    }
  };
  return (
    <Dialog open={open} handler={() => setOpen((prev) => !prev)} title={title}>
      <DialogHeader
        title="Cargar documentacion"
        className="flex justify-between"
      >
        <Typography variant="h3" color="blue">
          Cargar documentacion
        </Typography>
        <Button
          variant="filled"
          className="bg-transparent w-fit outline-none border-none shadow-none"
          onClick={() => setOpen((prev) => !prev)}
        >
          <Image alt="Cerrar" src={closeIcon} width={32} height={32} />
        </Button>
      </DialogHeader>
      <DialogBody className="grid grid-cols-4 w-5/6 mx-auto align-middle items-center gap-3">
        <Select
          variant="outlined"
          placeholder="Tipo de documento"
          label="Tipo de documento"
          containerProps={{ className: "col-span-3" }}
          value={description}
          onChange={(event) => {
            if (event !== undefined) setDescription(event);
          }}
        >
          <Option value="dni">DNI</Option>
          <Option value="estudio">Orden de estudio</Option>
          <Option value="medicacion">Receta de medicamento</Option>
          <Option value="resumen">Resumen de Historia Clinica</Option>
          <Option value="otro">Otro</Option>
        </Select>
        <FileInput
          text="Seleccionar Archivo"
          fileName={fileName}
          setFileName={setFileName}
          setState={setFileState}
        />
        <article
          className={`p-6 col-span-4 flex flex-col justify-center items-center outline-2 outline-dashed ${
            description === "" || fileState === undefined
              ? "outline-red-400"
              : "outline-blue-500"
          }`}
        >
          {fileState !== undefined && fileState?.length !== 0 ? (
            <Image
              alt="Imagen Seleccionada"
              width={150}
              height={150}
              src={
                fileState !== undefined && fileState.length > 0
                  ? URL.createObjectURL(fileState[0])
                  : ""
              }
            />
          ) : (
            <Typography variant="h4" color="deep-orange">
              No ha seleccionado una imagen
            </Typography>
          )}
          <div className="flex flex-col justify-center">
            <Typography variant="h4" color="blue" className="text-center p-3">
              Descripcion:{" "}
            </Typography>
            <Typography
              variant="h6"
              color="blue-gray"
              className="  text-center"
            >
              {description.toUpperCase()}
            </Typography>
          </div>
        </article>
        <Button
          variant="gradient"
          color="blue"
          disabled={
            description === "" || fileState === undefined ? true : undefined
          }
          className="col-span-4 mx-auto w-1/3 mt-2 flex justify-center text-center"
          onClick={handleAddImage}
        >
          {isLoading ? <Spinner /> : "Agregar"}
        </Button>
        <ul className="outline-2 col-span-4 outline-dashed outline-blue-400 w-full">
          {Array.isArray(filesContainer)
            ? filesContainer.map((item, index) =>
                item.description !== "" ? (
                  <li
                    className="p-2 font-bold flex align-middle items-center justify-between"
                    key={`listItem${index}`}
                  >
                    <Typography variant="h6" color="blue-gray">
                      {`${item.description.toUpperCase()} ${item.name}`}
                    </Typography>
                    <Button
                      variant="filled"
                      className="bg-blue-50 z-10 text-center flex justify-center"
                      id={`${item.driveId}`}
                      onClick={handleRemoveItem}
                    >
                      {isDeleting ? (
                        <Spinner />
                      ) : (
                        <Image
                          alt="Borrar"
                          src={trashIcon}
                          width={24}
                          height={24}
                          id={`${item.driveId}`}
                          onClick={handleRemoveItem as any}
                        />
                      )}
                    </Button>
                  </li>
                ) : null
              )
            : null}
        </ul>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="gradient"
          color="blue"
          className="p-3"
          disabled={
            filesContainer.length === 1 && filesContainer[0].driveId === ""
              ? true
              : undefined
          }
          onClick={() => {
            setValue(
              "files",
              filesContainer.filter((file) => file.driveId !== "")
            );
            setOpen((prev) => !prev);
          }}
        >
          Aceptar
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default FileUpload;
