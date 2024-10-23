import {
    Users,
    User2Icon,
    LayoutGrid,
    LucideIcon,
    FolderArchive,
    Home,
} from "lucide-react";

import { useTranslations } from "next-intl";

type Submenu = {
    href: string;
    label: string;
    active: boolean;
};

type Menu = {
    href: string;
    label: string;
    active: boolean;
    icon: LucideIcon;
    submenus: Submenu[];
};

type Group = {
    groupLabel: string;
    menus: Menu[];
};

export function GetMenuList(pathname: string): Group[] {
    const t = useTranslations();
    return [
        {
            groupLabel: "",
            menus: [
                {
                    href: "/dashboard",
                    label: t("dashboard.dashboard"),
                    active: pathname === "/dashboard",
                    icon: LayoutGrid,
                    submenus: [],
                },
            ],
        },
        {
            groupLabel: "Facturation",
            menus: [
                {
                    href: "/invoices",
                    label: "Factures",
                    active: pathname.includes("/invoices"),
                    icon: FolderArchive,
                    submenus: [],
                },
                {
                    href: "/customers",
                    label: "Clients",
                    active: pathname.includes("/customers"),
                    icon: Users,
                    submenus: [],
                },
            ],
        },
        {
            groupLabel: "Paramètres",
            menus: [
                {
                    href: "/my-company",
                    label: "Mon entreprise",
                    active: pathname.includes("/my-company"),
                    icon: Home,
                    submenus: [],
                },
            ],
        },
    ];
}
