import React from "react";
import Sidebar from "@/components/sidebar";

function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen w-full bg-white text-black flex ">
      <Sidebar />
      {children}
    </div>
  );
}

export default DashboardLayout;
