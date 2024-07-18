import React from "react";

import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";

type Props = {
    children: React.ReactNode;
};

export default function layout({ children }: Props) {
    return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
