"use client";

import { Button } from "@material-tailwind/react";
import { SetStateAction } from "react";

export default function Item({
  name,
  setChoice,
}: {
  name: string;
  setChoice: (value: SetStateAction<string>) => void;
}) {
  return (
    <>
      <Button
        variant="gradient"
        color="white"
        className="m-2 justify-center px-2 hover:bg-blue-200 hover:text-white hover:outline-dashed hover:outline-1"
        onClick={() => setChoice(name.toLowerCase() as any)}
      >
        {name.toLowerCase().toLocaleUpperCase()}
      </Button>
    </>
  );
}
