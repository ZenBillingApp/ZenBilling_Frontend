import React from "react";

import { Button } from "@/components/ui/button";

type Props = {
  filter: string;
  text: string;
  selectedFilter: boolean;
  setSelectedFilter: (filter: string) => void;
};

const BtnFilter = ({
  filter,
  text,
  selectedFilter,
  setSelectedFilter,
}: Props) => {
  return (
    <Button
      variant={selectedFilter ? "default" : "secondary"}
      onClick={() => setSelectedFilter(filter)}
    >
      {text}
    </Button>
  );
};

export default BtnFilter;
