import { Typography } from "@material-tailwind/react";
import Link from "next/link";
import React from "react";

function Menuitem({ name, id }: { name: string; id: string }) {
  return (
    <Typography
      as="li"
      variant="small"
      color="white"
      className="p-1 font-normal"
    >
      <Link href={`/departments/${id}`} className="flex items-center">
        {name}
      </Link>
    </Typography>
  );
}

export default Menuitem;
