import React, { ButtonHTMLAttributes, RefAttributes } from "react";
import { Button } from "./button";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
  href?: string;
};

function Nav({ children, href }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = pathname === href;

  return (
    <Button
      className={`flex items-center gap-2 p-2 rounded-lg ${
        isActive ? "bg-gray-200" : ""
      }`}
      onClick={() => {
        if (href) {
          router.push(href);
        }
      }}
    >
      {children}
    </Button>
  );
}

export default Nav;
