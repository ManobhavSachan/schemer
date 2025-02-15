"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ProjectBox } from "./ProjectBox";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useState } from "react";
import { FilterDropdown, SortType, SortOrder } from "./FilterDropdown";

export default function Header() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [selectedSorts, setSelectedSorts] = useState<{
    date: SortOrder;
    name: SortOrder;
  }>({ date: "asc", name: "asc" });
  const handleSignIn = () => {
    router.push("/sign-in");
  };

  const handleSignUp = () => {
    router.push("/sign-up");
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-background">
      <div className="flex justify-between items-center gap-4 bg-background">
        <Button variant="default" onClick={() => handleSignIn()}>
          + New
        </Button>
        <div className="items-center gap-2 md:flex hidden">
          <Input placeholder="Search" className="lg:w-[75vh] w-[40vh]" />
          <FilterDropdown
            selectedSorts={selectedSorts}
            onSort={(sortType: SortType, sortOrder: SortOrder) => {
              if (sortType === "date") {
                setSelectedSorts({ ...selectedSorts, date: sortOrder });
              } else if (sortType === "name") {
                setSelectedSorts({ ...selectedSorts, name: sortOrder });
              }
            }}
          />
        </div>
        {isSignedIn ? (
          <div className="flex gap-4">
            <ProjectBox />
            <UserButton
              appearance={{
                baseTheme: resolvedTheme === "dark" ? dark : undefined,
              }}
            />
          </div>
        ) : (
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => handleSignUp()}>
              Sign Up
            </Button>
            <Button variant="default" onClick={() => handleSignIn()}>
              Log In
            </Button>
          </div>
        )}
      </div>
      <div className="items-center gap-2 md:hidden flex">
        <Input placeholder="Search" className="w-full" />
        <FilterDropdown
          selectedSorts={selectedSorts}
          onSort={(sortType: SortType, sortOrder: SortOrder) => {
            if (sortType === "date") {
              setSelectedSorts({ ...selectedSorts, date: sortOrder });
            } else if (sortType === "name") {
              setSelectedSorts({ ...selectedSorts, name: sortOrder });
            }
          }}
        />
      </div>
    </div>
  );
}
