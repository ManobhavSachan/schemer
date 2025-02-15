"use client";
import { SignIn } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

export default function Page() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn appearance={{ baseTheme: resolvedTheme === "dark" ? dark : undefined }} />
    </div>
  );
}