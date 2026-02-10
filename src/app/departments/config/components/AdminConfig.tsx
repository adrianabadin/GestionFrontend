"use client";
import {
  apiSlice,
  useDeleteUserMutation,
  useDropAdminMutation,
  useGetUsersQuery,
  useReviveUserMutation,
  usersApiSlice,
  useSetAdminMutation,
} from "@/_core/api";
import { useAppDispatch } from "@/_core/store";
import { Button, Spinner, Typography } from "@material-tailwind/react";
import Card, {
  CardBody,
  CardHeader,
} from "@material-tailwind/react/components/Card";
import { useEffect, useState } from "react";

export default function AdminConfig() {
  const { data, isFetching, isSuccess } = useGetUsersQuery({});
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log("useEffect", data, "d");
    data?.forEach((user) => {
      dispatch(
        usersApiSlice.util.upsertQueryData("getUsers", { id: user.id }, [user]),
      );
    });
  }, [data, dispatch]);

  return (
    <>
      {isFetching ? (
        <Spinner />
      ) : (
        data?.map((item) => (
          <UserCard
            isAdmin={item.isAdmin !== undefined ? item.isAdmin : false}
            name={item.name}
            lastname={item.lastname}
            id={item.id}
            key={item.id}
          />
        ))
      )}
    </>
  );
}
function UserCard({
  name,
  lastname,
  isAdmin,
  id,
}: {
  name: string;
  lastname: string;
  isAdmin: boolean;
  id: string;
}) {
  const [setAdmin] = useSetAdminMutation();
  const [dropAdmin] = useDropAdminMutation();
  // const [] = useSta
  const [
    reviveUser,
    {
      isError: isReviveError,
      isSuccess: isReviveSuccess,
      isLoading: isReviveLoading,
    },
  ] = useReviveUserMutation();
  const [
    deleteUser,
    { isError, isSuccess: isDeleteSuccess, isLoading: isDeleteLoading },
  ] = useDeleteUserMutation();
  const [isDelete, setIsDelete] = useState<boolean>(true);
  return (
    <>
      <Card placeholder={""} className="mt-6 w-3/5">
        <CardBody
          className={`flex flex-col justify-center items-center  `}
          placeholder={""}
        >
          <Typography
            variant="h3"
            placeholder={""}
          >{`${name} ${lastname}`}</Typography>
          <div className="flex content-between">
            <Button
              placeholder={""}
              variant="gradient"
              onClick={isAdmin ? () => dropAdmin(id) : () => setAdmin(id)}
              color={`${isAdmin ? "green" : "blue"}`}
              className="m-4"
            >
              {isAdmin ? "Administrador" : "Usuario"}
            </Button>
            <Button
              placeholder={""}
              variant="gradient"
              color={`${isDelete ? "red" : "yellow"}`}
              className="m-4"
              onClick={() => {
                if (isDelete) {
                  deleteUser({ id })
                    .unwrap()
                    .then(() => {
                      setIsDelete((prev) => !prev);
                    });
                } else {
                  reviveUser({ id })
                    .unwrap()
                    .then(() => {
                      setIsDelete((prev) => !prev);
                    });
                }
              }}
            >
              {isDeleteLoading || isReviveLoading ? (
                <Spinner />
              ) : isDelete ? (
                "Borrar Usuario"
              ) : (
                "Restaurar Usuario"
              )}
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
