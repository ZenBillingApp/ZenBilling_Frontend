"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";

import { User } from "@/types/User";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import EditUserDialog from "@/components/edit-user-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { ClipLoader } from "react-spinners";
import { MdOutlineEdit } from "react-icons/md";

type Props = {};

export default function Page({}: Props) {
    const { id } = useParams();
    const t = useTranslations();

    const [user, setUser] = React.useState<User>({} as User);
    const [loading, setLoading] = React.useState<boolean>(true);

    const handleSave = async (newUser: User) => {
        try {
            setLoading(true);
            const response = await fetch(
                process.env.NEXT_PUBLIC_API_URL + `/api/auth/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getCookie("token")}`,
                    },
                    body: JSON.stringify(newUser),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update user");
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
        } catch (error) {
            console.error(error);
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to update user. Please try again.
                </AlertDescription>
            </Alert>;
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_API_URL + `/api/auth/profile`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getCookie("token")}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch user");
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    return (
        <ContentLayout title={t("profile.profile")}>
            <div className="flex flex-col w-full gap-6">
                {loading ? (
                    <div className="flex w-full h-screen items-center justify-center">
                        <ClipLoader
                            color="#009933"
                            loading={loading}
                            size={50}
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col items-start gap-2">
                                <h1 className="text-3xl font-semibold">
                                    {t("profile.profile_title")}
                                </h1>
                                <p className=" text-gray-500">
                                    {t("profile.profile_description")}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <EditUserDialog
                                    trigger={
                                        <Button variant="default">
                                            <MdOutlineEdit size={20} />
                                            {t("profile.profile_edit")}
                                        </Button>
                                    }
                                    user={user}
                                    onSave={handleSave}
                                />
                            </div>
                        </div>
                        <div className="flex  w-full gap-6">
                            <div className="flex w-full flex-col justify-center p-4 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {t("profile.profile_information")}
                                        </CardTitle>
                                        <CardDescription>
                                            {t(
                                                "profile.profile_information_description"
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            <span className="font-semibold">
                                                {t(
                                                    "profile.profile_first_name"
                                                )}
                                                {" : "}
                                            </span>{" "}
                                            {user?.first_name}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                {t("profile.profile_last_name")}
                                                {" : "}
                                            </span>{" "}
                                            {user?.last_name}
                                        </div>

                                        <div>
                                            <span className="font-semibold">
                                                {t("profile.profile_email")}
                                                {" : "}
                                            </span>{" "}
                                            {user?.email}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                {t("profile.profile_phone")}
                                                {" :"}
                                            </span>{" "}
                                            {user?.phone}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {t("profile.profile_address")}
                                        </CardTitle>
                                        <CardDescription>
                                            {t(
                                                "profile.profile_address_description"
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            <span className="font-semibold">
                                                {t(
                                                    "profile.profile_street_address"
                                                )}{" "}
                                                {" : "}
                                            </span>{" "}
                                            {user?.street_address}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                {t("profile.profile_city")}{" "}
                                                {" : "}
                                            </span>{" "}
                                            {user?.city}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                {t("profile.profile_state")}{" "}
                                                {" : "}
                                            </span>{" "}
                                            {user?.state}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                {t("profile.profile_zip")}{" "}
                                                {" : "}
                                            </span>{" "}
                                            {user?.postal_code}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                {t("profile.profile_country")}
                                                {" : "}
                                            </span>{" "}
                                            {user?.country}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </ContentLayout>
    );
}
