import {
    Users,
    Settings,
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
                    href: "/dashboard/home",
                    label: t("dashboard.dashboard"),
                    active: pathname.includes("/home"),
                    icon: LayoutGrid,
                    submenus: [],
                },
            ],
        },
        {
            groupLabel: "Management",
            menus: [
                {
                    href: "",
                    label: t("invoices.invoices"),
                    active: pathname.includes("/invoices"),
                    icon: FolderArchive,
                    submenus: [
                        {
                            href: "/dashboard/invoices",
                            label: t("invoices.all_invoices"),
                            active: pathname === "/dashboard/invoices",
                        },
                        {
                            href: "/dashboard/invoices/create",
                            label: t("invoices.create_invoice"),
                            active: pathname === "/dashboard/invoices/create",
                        },
                    ],
                },
                {
                    href: "/dashboard/customers",
                    label: t("customers.customers"),
                    active: pathname.includes("/dashboard/customers"),
                    icon: Users,
                    submenus: [],
                },
            ],
        },
        {
            groupLabel: t("settings.settings"),
            menus: [
                {
                    href: "/dashboard/profile",
                    label: t("profile.profile"),
                    active: pathname.includes("/profile"),
                    icon: User2Icon,
                    submenus: [],
                },
                {
                    href: "/dashboard/my-company",
                    label: t("company.company"),
                    active: pathname.includes("/my-company"),
                    icon: Home,
                    submenus: [],
                },
            ],
        },
    ];
}
