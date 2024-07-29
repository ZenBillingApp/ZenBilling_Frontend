import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import FlagComponent from "../language-switcher";
import { locales } from "@/config";
import { setUserLocale, getUserLocale } from "@/hooks/locale";
import { CountryCode } from "libphonenumber-js";
import React, { useEffect, useState } from "react";

interface NavbarProps {
    title: string;
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
    const [locale, setLocale] = useState<CountryCode | null>(null);

    useEffect(() => {
        const fetchLocale = async () => {
            const userLocale = await getUserLocale();
            setLocale(userLocale as CountryCode);
        };
        fetchLocale();
    }, []);

    const handleLocaleChange = (newLocale: CountryCode) => {
        setUserLocale(newLocale);
        setLocale(newLocale);
    };

    return (
        <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
            <div className="mx-4 sm:mx-8 flex h-14 items-center">
                <div className="flex items-center space-x-4 lg:space-x-0">
                    <SheetMenu />
                    <h1 className="font-bold">{title}</h1>
                </div>
                <div className="flex flex-1 items-center space-x-2 justify-end">
                    {locale && (
                        <FlagComponent
                            value={locale}
                            onChange={(newLocale) =>
                                handleLocaleChange(newLocale as CountryCode)
                            }
                            options={locales as CountryCode[]}
                        />
                    )}
                    <ModeToggle />
                    {/* <UserNav /> */}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
