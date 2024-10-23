import React, { useState, useCallback } from "react";
import flags from "react-phone-number-input/flags";
import * as RPNInput from "react-phone-number-input";
import { CountryCode } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, CheckIcon } from "lucide-react";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
  Command,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { locales } from "@/config";
import { getUserLocale, setUserLocale } from "@/hooks/locale";

type CountrySelectProps = {
  disabled?: boolean;
  value: string;
  onChange: (country: string) => void;
  options: CountryCode[];
};

const CountrySelect: React.FC<CountrySelectProps> = ({
  disabled = false,
  value,
  onChange,
  options,
}) => {
  const handleSelect = useCallback(
    (country: string) => {
      onChange(country);
    },
    [onChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("flex gap-1 px-3")}
          disabled={disabled}
        >
          <FlagComponent country={value as CountryCode} countryName={value} />
          <ChevronsUpDown
            className={cn(
              "-mr-2 h-4 w-4 opacity-50",
              disabled ? "hidden" : "opacity-100"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0">
        <Command>
          <CommandList>
            <ScrollArea className="h-fit">
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    className="gap-2"
                    key={option}
                    onSelect={() => handleSelect(option)}
                  >
                    <FlagComponent country={option} countryName={option} />
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        option === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent: React.FC<{
  country: CountryCode;
  countryName: string;
}> = ({ country, countryName }) => {
  const Flag = flags[country];

  return (
    <span className=" flex h-4 w-6 overflow-hidden rounded-sm">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

export default CountrySelect;
