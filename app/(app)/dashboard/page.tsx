"use client";

import Header from "@/components/dashboard/Header";
import Footer from "@/components/dashboard/Footer";
import Content from "@/components/dashboard/Content";
import { useGetProjects } from "@/hooks/useProject";
import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { SearchParams } from "@/types/search-params";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { data, isLoading, refetch } = useGetProjects(!!user);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    search: "",
    dateOrder: "asc",
    nameOrder: "asc",
  });

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const filteredAndSortedProjects = useMemo(() => {
    if (!data?.projects) return [];

    let filtered = data.projects;

    // Apply search filter
    if (searchParams.search) {
      const searchLower = searchParams.search.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      // First sort by date
      const dateA = new Date(searchParams.dateOrder === "asc" ? a.createdAt : b.createdAt);
      const dateB = new Date(searchParams.dateOrder === "asc" ? b.createdAt : a.createdAt);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }

      // Then sort by name
      const nameA = searchParams.nameOrder === "asc" ? a.title : b.title;
      const nameB = searchParams.nameOrder === "asc" ? b.title : a.title;
      return nameA.localeCompare(nameB);
    });
  }, [data?.projects, searchParams]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onSearchParamsChange={setSearchParams} />
      <main className="flex-grow">
        <Content isLoading={isLoading || !isLoaded} data={filteredAndSortedProjects} />
      </main>
      <Footer />
    </div>
  );
}
