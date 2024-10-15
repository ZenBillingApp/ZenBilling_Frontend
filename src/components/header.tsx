"use client";
import React, { useEffect, useState } from "react";
import Brand from "./brand";
import FlagComponent from "@/components/language-switcher";
import { locales } from "@/config";
import { setUserLocale, getUserLocale } from "@/hooks/locale";
import { CountryCode } from "libphonenumber-js";

type Props = {};

const Header: React.FC<Props> = () => {
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
    <nav className=" w-full bg-transparent flex items-center justify-between px-2 ">
      <Brand />
      {/* {locale && (
                <FlagComponent
                    value={locale}
                    onChange={(newLocale) =>
                        handleLocaleChange(newLocale as CountryCode)
                    }
                    options={locales as CountryCode[]}
                />
            )} */}
    </nav>
  );
};

export default Header;
