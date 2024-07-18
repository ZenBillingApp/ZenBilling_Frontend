import React from "react";

type Props = {};

export default function Header({}: Props) {
    return (
        <nav className=" w-full bg-transparent flex items-start ">
            <h1 className="text-2xl font-bold text-center m-6">
                <span className="text-primary">Z</span>enBilling
            </h1>
        </nav>
    );
}
