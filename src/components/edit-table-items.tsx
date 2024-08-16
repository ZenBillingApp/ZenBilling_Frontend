import React from "react";
import { useTranslations } from "next-intl";

import { Item } from "@/types/Item";

import useFormattedAmount from "@/hooks/useFormattedAmount";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";

import { Plus, Save, DeleteIcon } from "lucide-react";

type Props = {
    items: Item[];
    handleOnSaveItems: (items: Item[]) => void;
};

export default function EditTableItems({ items, handleOnSaveItems }: Props) {
    const t = useTranslations();

    const { formatAmount } = useFormattedAmount();

    const [newItems, setNewItems] = React.useState<Item[]>(items);

    const handleChangeItem = (index: number, key: string, value: any) => {
        setNewItems(
            newItems.map((item, i) =>
                i === index ? { ...item, [key]: value } : item
            )
        );
    };

    const handleDeleteItem = (index: number) => {
        setNewItems(newItems.filter((item, i) => i !== index));
    };

    const addItem = () => {
        setNewItems((prev) => [
            ...prev,
            {
                description: "",
                item_id: items.length + 1,
                total_price: 0,
                quantity: 0,
                unit_price: 0,
                vat_rate: 0,
                vat_amount: 0,
            },
        ]);
    };

    return (
        <>
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-96">
                            {t("items.item_table_header_description")}
                        </TableHead>
                        <TableHead className="min-w-40">
                            {t("items.item_table_header_unit_price")}
                        </TableHead>
                        <TableHead className="min-w-32">
                            {t("items.item_table_header_quantity")}
                        </TableHead>
                        <TableHead className="min-w-32">
                            {t("items.item_table_header_vat_rate")}
                        </TableHead>
                        <TableHead className="min-w-32">
                            {t("items.item_table_header_total")}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {newItems.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Input
                                    value={item.description}
                                    placeholder={t(
                                        "items.item_table_placeholder_description"
                                    )}
                                    onChange={(e) =>
                                        handleChangeItem(
                                            index,
                                            "description",
                                            e.target.value
                                        )
                                    }
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    value={item.unit_price}
                                    onChange={(e) =>
                                        handleChangeItem(
                                            index,
                                            "unit_price",
                                            e.target.value || 0
                                        )
                                    }
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        handleChangeItem(
                                            index,
                                            "quantity",
                                            e.target.value || 0
                                        )
                                    }
                                />
                            </TableCell>

                            <TableCell>
                                <Input
                                    type="number"
                                    value={item.vat_rate}
                                    onChange={(e) =>
                                        handleChangeItem(
                                            index,
                                            "vat_rate",
                                            e.target.value || 0
                                        )
                                    }
                                />
                            </TableCell>
                            <TableCell>
                                {formatAmount(
                                    item.unit_price * item.quantity +
                                        (item.vat_rate / 100) *
                                            item.unit_price *
                                            item.quantity,
                                    {
                                        currency: "EUR",
                                    }
                                )}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteItem(index)}
                                >
                                    <DeleteIcon size={20} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-end mt-4 flex-wrap gap-2">
                <Button className="flex gap-1" onClick={addItem}>
                    <Plus size={20} />
                    {t("items.item_table_add_item")}
                </Button>
                <Button
                    className="flex gap-1"
                    onClick={() => handleOnSaveItems(newItems)}
                >
                    <Save size={20} />
                    {t("common.common_save")}
                </Button>
            </div>
        </>
    );
}
