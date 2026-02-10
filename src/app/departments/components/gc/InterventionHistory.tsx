import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Button,
  Dialog,
  DialogBody,
  DialogHeader,
  Spinner,
  Typography,
} from "@material-tailwind/react";

import picture from "@/icons/picture.svg";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import close from "@/icons/close.svg";
import { DocumentationView } from "./DocumentationView";
import {
  apiSlice,
  GetInterventions,
  useGetInterventionsQuery,
} from "@/_core/api";
function InterventionHistory({
  id,
  isOpen,
  setOpen,
}: {
  id: string;
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { data, isFetching } = useGetInterventionsQuery(id);
  console.log(data, "DATA INTERVENCIONES");
  return (
    <Dialog
      placeholder={""}
      open={isOpen}
      size="xl"
      className="mx-4"
      handler={(prev) => setOpen(!prev)}
    >
      <DialogHeader placeholder={""} className="flex justify-between">
        <Typography placeholder={""} variant="h2" color="blue">
          Historial de Intervenciones
        </Typography>
        <Button
          placeholder={""}
          variant="filled"
          className="w-fit bg-transparent shadow-none border-none outline-none"
          onClick={() => setOpen(false)}
        >
          <Image src={close} alt="Cerrar" width={32} height={32} />
        </Button>
      </DialogHeader>
      <DialogBody placeholder={""} className="w-full">
        {isFetching ? (
          <Spinner />
        ) : data !== undefined ? (
          data.interventions.map((item) => (
            <InterventionRow data={item} key={item.id} />
          ))
        ) : null}
      </DialogBody>
    </Dialog>
  );
}

function InterventionRow({ data }: { data: GetInterventions }) {
  const [open, setOpen] = useState<number>(0);
  const [documentation, setDocumentation] = useState<boolean>(false);
  const [url, setUrl] = useState<
    {
      id: string;
      driveId: string;
      data: string;
      name: string;
      description: string;
    }[]
  >([]);
  const [getFiles, { isFetching: isFetchingFiles }] =
    apiSlice.endpoints.getFiles.useLazyQuery();

  useEffect(() => {
    data.files?.forEach((file) => {
      getFiles(file.driveId)
        .unwrap()
        .then((res) => {
          const blob = new Blob([
            new Uint8Array(Buffer.from(res.data, "base64")),
          ]);
          const urlToPush = {
            ...file,
            id: file.driveId,
            data: URL.createObjectURL(blob),
          };

          setUrl((prev) => {
            if (prev.find((item) => item.id === urlToPush.id)) {
              return prev;
            }
            return [...prev, urlToPush];
          });
        })
        .catch((e) => console.log(e));
    });
  }, [getFiles, data]);

  const handler = (value: number) => {
    if (open === value) return setOpen(0);
    setOpen(value);
  };
  return (
    <Accordion placeholder={""} open={open === 1} className="w-full">
      <AccordionHeader
        placeholder={""}
        onClick={() => handler(1)}
        className="w-full"
      >
        <div className="grid grid-cols-12 justify-around w-full ">
          <Typography
            placeholder={""}
            variant="h5"
            color="blue-gray"
            className="col-span-3"
          >{`Fecha: ${new Date(
            data.createdAt,
          ).toLocaleDateString()}`}</Typography>
          <Typography
            placeholder={""}
            variant="h5"
            color="blue-gray"
            className="col-span-3"
          >
            {`Hora: ${new Date(data.createdAt).toLocaleTimeString()}`}
          </Typography>
          <Typography
            placeholder={""}
            variant="h5"
            color="blue-gray"
            className="col-span-6"
          >
            {`Usuario Interviniente: ${
              data.user !== null
                ? data.user.username !== null
                  ? data.user.username
                  : ""
                : ""
            }`}
          </Typography>
        </div>
      </AccordionHeader>
      <AccordionBody className="flex flex-row">
        <div className="flex flex-col w-2/3">
          <Typography
            placeholder={""}
            variant="h5"
            color="blue-gray"
            className="col-span-9"
          >
            {`Descripcion:`}
          </Typography>
          <Typography
            placeholder={""}
            variant="paragraph"
            color="black"
            className="col-span-9"
          >
            {data.text}
          </Typography>
        </div>
        <div className="w-1/3 justify-center flex">
          <Button
            placeholder={""}
            className="bg-transparent w-fit shadow-none justify-center"
            variant="filled"
            onClick={() => setDocumentation((prev) => !prev)}
          >
            {Array.isArray(url) && url.length > 0 ? (
              url.map((image, index) => {
                console.log(image, "IMAGE URL");
                return (
                  <Image
                    src={image.data}
                    alt="Documentacion asociada"
                    width={64}
                    height={64}
                    key={index}
                  />
                );
              })
            ) : isFetchingFiles ? (
              <Spinner />
            ) : (
              <Image
                src={picture}
                alt="Documentacion asociada"
                width={64}
                height={64}
              />
            )}
          </Button>
        </div>
      </AccordionBody>
      <DocumentationView
        files={url}
        open={documentation}
        setOpen={setDocumentation}
      />
    </Accordion>
  );
}
function Documentation({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Dialog
      placeholder={""}
      handler={() => {
        console.log(open, "texto");
        setOpen((prev) => !prev);
      }}
      open={open}
      size="xl"
    >
      <DialogHeader placeholder={""} className="flex justify-between">
        <Typography placeholder={""} variant="h3" color="blue">
          Documentacion agregada
        </Typography>
        <Button
          placeholder={""}
          variant="filled"
          className=" bg-transparent shadow-none"
          onClick={() => setOpen((prev) => !prev)}
        >
          <Image src={close} alt="Cerrar" width={32} height={32} />
        </Button>
      </DialogHeader>
    </Dialog>
  );
}
export default InterventionHistory;
