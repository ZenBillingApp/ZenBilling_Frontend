import React from "react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

type Props = {
    trigger: React.ReactNode;
    value: Date | undefined;
    placeholder: string;
    onChange: (date: Date) => void;
};

const DatePicker = (props: Props) => {
    return (
        <Popover>
            <PopoverTrigger asChild>{props.trigger}</PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={props.value ? new Date(props.value) : new Date()}
                    onSelect={(date) => {
                        props.onChange(date as Date);
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
};

export default DatePicker;
