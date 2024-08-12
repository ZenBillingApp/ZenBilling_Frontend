import React from "react";
import { useTranslations } from "next-intl";

import {
    Credenza,
    CredenzaClose,
    CredenzaContent,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaDescription,
    CredenzaTrigger,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";

type Props = {
    trigger: React.ReactNode;
    title: string;
    description: string;
    loading?: boolean;
    confirmText: string;
    handleOnConfirm: () => void;
};

const AlertDialog = (props: Props) => {
    const t = useTranslations();
    return (
        <Credenza>
            <CredenzaTrigger>{props.trigger}</CredenzaTrigger>
            <CredenzaContent>
                <CredenzaHeader>
                    <CredenzaTitle>{props.title}</CredenzaTitle>
                    <CredenzaDescription>
                        {props.description}
                    </CredenzaDescription>
                </CredenzaHeader>

                <CredenzaFooter>
                    <CredenzaClose asChild>
                        <Button variant="outline">
                            {t("common.common_cancel")}
                        </Button>
                    </CredenzaClose>
                    <Button
                        disabled={props.loading}
                        variant={"destructive"}
                        onClick={props.handleOnConfirm}
                    >
                        {props.loading
                            ? t("common.common_loading")
                            : props.confirmText}
                    </Button>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
};

export default AlertDialog;
