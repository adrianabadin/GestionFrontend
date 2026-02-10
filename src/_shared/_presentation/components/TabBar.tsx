"use client";

import {
  Tab,
  TabPanel,
  Tabs,
  TabsBody,
  TabsHeader,
} from "@material-tailwind/react";

export function TabBar({
  department,
  state,
  data,
}: {
  department?: string;
  state?: string;
  data: {
    value: string;
    label: string;
    content: JSX.Element;
  }[];
}) {
  return (
    <Tabs value="tasks" id="menu" className="w-full bg-gray-100 text-blue-500">
      <TabsHeader
        placeholder={""}
        className="w-fit bg-white text-blue-500"
        indicatorProps={{ className: "bg-blue-50 font-bold text-white " }}
      >
        {data.map((item) => (
          <Tab
            placeholder={""}
            key={item.value}
            value={item.value}
            className="bg-white   text-blue-600 active:bg-blue-200  active:text-white"
          >
            {item.label}
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody
        placeholder=""
        animate={{
          initial: { y: 250 },
          mount: { y: 0 },
          unmount: { y: 250 },
        }}
        className="bg-blue-300 text-white font-bold "
      >
        {data.map((item) => (
          <TabPanel
            value={item.value}
            key={item.value}
            className="flex justify-center bg-gray-200 opacity-100 m-0 p-0"
          >
            {item.content}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>
  );
}

export default TabBar;
