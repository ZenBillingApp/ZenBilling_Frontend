import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type Props = {
    handleRetry: () => void;
};

const ErrorScreen = ({ handleRetry }: Props) => {
    const t = useTranslations();
    return (
        <div className="flex flex-col w-full justify-center items-center gap-4">
            <Image
                src={"/assets/illustrations/illu_error.svg"}
                width={200}
                height={200}
                alt="Error"
            />
            <h1 className="text-2xl font-semibold">
                {t("common.common_error_fetch")}
            </h1>
            <p className="text-gray-500">
                {t("common.common_error_fetch_message")}
            </p>
            <Button onClick={handleRetry}>{t("common.common_retry")}</Button>
        </div>
    );
};

export default ErrorScreen;
