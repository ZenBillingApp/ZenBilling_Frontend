import React from "react";
import Header from "@/components/header";

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Props) {
    return (
        <div className="h-full w-full flex flex-col ">
            <div className="w-full min-h-screen dark:bg-black bg-white dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex flex-col items-center justify-center">
                <Header />
                <div className="flex items-center justify-center flex-1 w-full z-10">
                    {children}
                </div>
                {/* <BackgroundBeams /> */}
            </div>
        </div>
    );
}
