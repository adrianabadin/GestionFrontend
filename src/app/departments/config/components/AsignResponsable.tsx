"use client";
import {
  useAddResponsableMutation,
  useGetDepartmentsQuery,
  useGetUsersQuery,
} from "@/_core/api";
import {
  Button,
  Checkbox,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import Card from "../../components/CustomCard";
import { CardBody, CardFooter } from "@material-tailwind/react/components/Card";
import { useForm } from "react-hook-form";

export default function AsignResponsable() {
  const { data: users, isFetching } = useGetUsersQuery({});
  return (
    <>
      {isFetching ? (
        <Spinner />
      ) : (
        users?.map((item) => <UserCard id={item.id} key={item.id} />)
      )}
    </>
  );
}

function UserCard({ id }: { id: string }) {
  const [linkDepartment, { isLoading }] = useAddResponsableMutation();
  const { data: user } = useGetUsersQuery({ id });

  const { register, handleSubmit } = useForm<{ name: string }>();
  const { data, isFetching } = useGetDepartmentsQuery(undefined);
  const onSubmit = (dataParam: any) => {
    console.log(dataParam, "submited", id);
    let stringData: string[] = [];
    Object.keys(dataParam).forEach((key) => {
      console.log(key);
      if (dataParam[key]) stringData.push(key);
    });
    console.log(stringData);
    linkDepartment({ id, data: { name: stringData } })
      .then((res) => console.log(res, "ok"))
      .catch((e) => console.log(e));
  };
  if (user === undefined || user.length === 0) return <Spinner />;
  return (
    <>
      <Card className="mt-6 w-3/5">
        <CardBody className="flex flex-col justify-center items-center">
          <Typography variant="h3">{`${user[0].name} ${user[0].lastname}`}</Typography>
          <Typography
            variant="h5"
            color="light-blue"
            className="font-bold text-left"
          >
            Programas
          </Typography>
          <div className="grid grid-cols-3">
            {isFetching ? (
              <Spinner />
            ) : data !== undefined ? (
              data?.map((program) => (
                <Checkbox
                  {...register(program.name as any)}
                  label={program.name}
                  name={program.name}
                  key={program.id}
                  className="col-span-1"
                  defaultChecked={
                    user[0].responsibleFor.find(
                      (department) => department.name === program.name
                    ) !== undefined
                      ? true
                      : undefined
                  }
                />
              ))
            ) : null}
          </div>
        </CardBody>
        <CardFooter className="flex flex-row justify-end">
          <Button
            variant="gradient"
            color="blue"
            onClick={handleSubmit(onSubmit)}
          >
            {isLoading ? <Spinner className="self-center" /> : "Actualizar"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
