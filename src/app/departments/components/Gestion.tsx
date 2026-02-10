"use client";

import TaskManager from "@/app/components/Agenda";
import Agenda from "@/app/components/Agenda";
import { Typography } from "@material-tailwind/react";
import TabBar from "./TabBar";
import Foda from "./Foda";

function Gestion() {
  return (
    <>
      <TabBar
        data={[
          {
            value: "tasks",
            label: "Agenda",
            content: <TaskManager filter={{ department: "Gestion" }} />,
          },
          {
            value: "foda",
            label: "FODA",
            content: <Foda departmentProp="Gestion" />,
          },
        ]}
      />
    </>
  );
}

export default Gestion;
