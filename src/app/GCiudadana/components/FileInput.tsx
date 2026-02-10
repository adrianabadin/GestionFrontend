import { Typography, Button, Input } from "@material-tailwind/react";
import Image from "next/image";
import upload from "@/icons/UPLOAD.svg";
import {
  ChangeEvent,
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  useState,
} from "react";

export function FileInput({
  text,
  fileName,
  setFileName,
  setState,
}: {
  text: string;
  setState: Dispatch<SetStateAction<FileList | undefined>>;
  fileName: string;
  setFileName: Dispatch<SetStateAction<string>>;
}) {
  const onChangeImage: ChangeEventHandler<HTMLInputElement> = (onFile) => {
    if (
      onFile.target.files !== null &&
      onFile.target.files.length > 0 &&
      onFile.target.files[0].name !== undefined
    ) {
      console.log("entro");
      setState(onFile.target.files);
      setFileName(onFile.target.files[0].name);
    } else {
      setFileName("");
      setState(undefined);
    }
  };
  return (
    <Typography
      variant="h6"
      color={`${fileName === "" ? "blue" : "green"}`}
      className="relative text-center flex flex-col justify-center outline-1"
    >
      <input
        type="file"
        className="opacity-0 absolute h-full w-full z-10 cursor-pointer"
        onChange={onChangeImage}
        accept="image/jpeg"
      />
      <Image
        src={upload}
        alt="Subir Archivo"
        className="bg-white self-center "
        width={48}
        height={48}
      />

      {fileName === "" ? text : fileName}
    </Typography>
  );
}

export default FileInput;
