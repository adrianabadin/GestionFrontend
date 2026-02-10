"use client";
import { useRouter } from "next/navigation";
import { useJwtLoginQuery } from "@/_core/auth/_application/slices";
import LoginModal from "../components/Login";
import { Spinner } from "@material-tailwind/react";
import { useState } from "react";

function Page() {
  const { isError, isFetching, isSuccess } = useJwtLoginQuery(undefined);
  const [open, setOpen] = useState<boolean>(true);
  const router = useRouter();
  if (isError) {
    return <LoginModal open={open} setOpen={setOpen} />;
  } else
    return isFetching ? (
      <Spinner />
    ) : (
      <div className="text-3xl text-green-500">Ingreso correcto</div>
    );
}

export default Page;
