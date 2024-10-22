import React from "react";

import { Card, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";

type Props = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
};

const DashboardShorcut: React.FC<Props> = ({ icon, title, value }) => {
  return (
    <Card className="flex items-center w-full p-4 gap-6">
      {icon && (
        <div
          className={cn("flex items-center justify-center p-2 rounded-full")}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col w-full">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <h1 className="text-4xl font-light">{value}</h1>
      </div>
    </Card>
  );
};

export default DashboardShorcut;
