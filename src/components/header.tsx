import React from "react";
import Brand from "./brand";

type Props = {};

export default function Header({}: Props) {
    return (
        <nav className=" w-full bg-transparent flex items-start ">
            <Brand />
        </nav>
    );
}
