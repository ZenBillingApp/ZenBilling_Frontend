import {
    Tag,
    Users,
    Settings,
    Bookmark,
    SquarePen,
    User2Icon,
    LayoutGrid,
    LucideIcon,
    FolderArchive,
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
            groupLabel: "Contents",
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
                    active: pathname.includes("/customers"),
                    icon: User2Icon,
                    submenus: [],
                },
                {
                    href: "/tags",
                    label: "Tags",
                    active: pathname.includes("/tags"),
                    icon: Tag,
                    submenus: [],
                },
            ],
        },
        {
            groupLabel: "Settings",
            menus: [
                {
                    href: "/users",
                    label: "Users",
                    active: pathname.includes("/users"),
                    icon: Users,
                    submenus: [],
                },
                {
                    href: "/account",
                    label: "Account",
                    active: pathname.includes("/account"),
                    icon: Settings,
                    submenus: [],
                },
            ],
        },
    ];
}
