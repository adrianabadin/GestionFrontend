"use client";
import { useAppSelector } from "@/_core/store";
import IssueForm from "./components/IssueForm";

export default function GestionIngreso() {
  const auth = useAppSelector((state) => state.auth);

  return (
    <>
      <IssueForm auth={auth} />
    </>
  );
}
