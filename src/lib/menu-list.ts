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
                    href: "/dashboard",
                    label: "Dashboard",
                    active: pathname.includes("/dashboard"),
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
                            href: "/invoices",
                            label: "All Invoices",
                            active: pathname === "/invoices",
                        },
                        {
                            href: "/invoices/create",
                            label: "New Invoice",
                            active: pathname === "/invoices/create",
                        },
                    ],
                },
                {
                    href: "/customers",
                    label: "Customers",
                    active: pathname.includes("/customers"),
                    icon: Users,
                    submenus: [],
                },
            ],
        },
        {
            groupLabel: "Settings",
            menus: [
                {
                    href: "/profile",
                    label: "Profile",
                    active: pathname.includes("/profile"),
                    icon: User2Icon,
                    submenus: [],
                },
                {
                    href: "/my-company",
                    label: "My Company",
                    active: pathname.includes("/my-company"),
                    icon: Home,
                    submenus: [],
                },
            ],
        },
    ];
}
