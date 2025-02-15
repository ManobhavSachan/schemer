"use client";
import { SignUp } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

export default function Page() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex justify-center items-center h-screen">
      <SignUp appearance={{ baseTheme: resolvedTheme === "dark" ? dark : undefined }} />
    </div>
  );
}