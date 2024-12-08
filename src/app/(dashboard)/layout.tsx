"use client";

import { useEffect } from "react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const initializeUser = async () => {
      await getUser();
    };

    initializeUser();
  }, []);

  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
