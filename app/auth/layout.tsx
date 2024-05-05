import React from "react";

import { cn } from "@/lib/utils";

type Props = {
    children: React.ReactNode;
};

function AuthLayout({ children }: Props) {
    return (
        <div className={cn("flex w-full h-screen bg-background")}>
            {children}
        </div>
    );
}

export default AuthLayout;
