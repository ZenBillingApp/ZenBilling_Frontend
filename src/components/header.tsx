"use client";
import React from "react";
import Brand from "./brand";

type Props = {};

const Header: React.FC<Props> = () => {
  return (
    <nav className=" w-full bg-transparent flex items-center justify-between px-2 ">
      <Brand />
    </nav>
  );
};

export default Header;
