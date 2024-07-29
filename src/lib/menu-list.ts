import {
    Users,
    Settings,
    User2Icon,
    LayoutGrid,
    LucideIcon,
    FolderArchive,
    Home,
} from "lucide-react";

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

export function getMenuList(pathname: string): Group[] {
    return [
        {
            groupLabel: "",
            menus: [
                {
                    href: "/dashboard/home",
                    label: "Dashboard",
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
                    label: "Invoices",
                    active: pathname.includes("/invoices"),
                    icon: FolderArchive,
                    submenus: [
                        {
                            href: "/dashboard/invoices",
                            label: "All Invoices",
                            active: pathname === "/dashboard/invoices",
                        },
                        {
                            href: "/dashboard/invoices/create",
                            label: "New Invoice",
                            active: pathname === "/dashboard/invoices/create",
                        },
                    ],
                },
                {
                    href: "/dashboard/customers",
                    label: "Customers",
                    active: pathname.includes("/dashboard/customers"),
                    icon: Users,
                    submenus: [],
                },
            ],
        },
        {
            groupLabel: "Settings",
            menus: [
                {
                    href: "/dashboard/profile",
                    label: "Profile",
                    active: pathname.includes("/profile"),
                    icon: User2Icon,
                    submenus: [],
                },
                {
                    href: "/dashboard/my-company",
                    label: "My Company",
                    active: pathname.includes("/my-company"),
                    icon: Home,
                    submenus: [],
                },
            ],
        },
    ];
}
