"use client";

import Header from "@/components/dashboard/Header";
import Footer from "@/components/dashboard/Footer";
import Content from "@/components/dashboard/Content";
import { useGetProjects } from "@/hooks/useProject";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { data, isLoading, refetch } = useGetProjects(!!user);

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Content isLoading={isLoading || !isLoaded} data={data?.projects} />
      </main>
      <Footer />
    </div>
  );
}
