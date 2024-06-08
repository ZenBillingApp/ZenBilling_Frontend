import React from "react";

import Sidebar from "@/components/sidebar";

import { LuUser2 } from "react-icons/lu";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { VscDashboard } from "react-icons/vsc";
import { PiBuildingApartment } from "react-icons/pi";

type Props = {
    children: React.ReactNode;
};

const menuItems = [
    {
        icon: <VscDashboard size={24} />,
        label: "Dashboard",
        link: "/dashboard",
    },
    {
        icon: <LiaFileInvoiceSolid size={24} />,
        label: "Invoices",
        link: "/dashboard/invoices",
    },
    {
        icon: <LuUser2 size={24} />,
        label: "Customers",
        link: "/dashboard/customers",
    },
    {
        icon: <PiBuildingApartment size={24} />,
        label: "My Company",
        link: "/dashboard/my-company",
    },
];

export default function layout({ children }: Props) {
    return (
        <div className="flex h-full w-full">
            <Sidebar items={menuItems} />
            <div className="w-full h-full overflow-auto p-6">{children}</div>
        </div>
    );
}
