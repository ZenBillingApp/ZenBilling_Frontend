import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

function LoginLayout({ children }: Props) {
  return <div className="flex h-full w-full">{children}</div>;
}

export default LoginLayout;
