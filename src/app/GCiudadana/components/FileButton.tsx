import { Typography, Button, Input } from "@material-tailwind/react";
import Image from "next/image";
import upload from "@/icons/UPLOAD.svg";
import { ChangeEvent, ChangeEventHandler } from "react";
function FileButton({
  text,
  handleClick,
}: {
  text: string;
  handleClick?: (...args: any) => void;
}) {
  return (
    <Typography
      variant="h6"
      color="blue"
      className="text-center flex flex-col justify-center outline-1"
    >
      <Button
        variant="filled"
        className="bg-transparent self-center shadow-2xl "
        onClick={handleClick}
      >
        <Image
          src={upload}
          alt="Subir Archivo"
          className="bg-white"
          width={48}
          height={48}
        />
      </Button>
      {text}
    </Typography>
  );
}

export default FileButton;
