import React from "react";

function DashboardLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="min-h-screen w-full bg-white text-black flex ">
            {children}
        </div>
    );
}

export default DashboardLayout;
