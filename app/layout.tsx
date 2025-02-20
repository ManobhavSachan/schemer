import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Metadata } from "next";
import Providers from "./provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Schemer",
  description:
    "Schemer - A powerful tool for creating database schemas, generating code, and streamlining your database design workflow. Create, visualize, and manage your database architecture efficiently.",
  icons: {
    icon: [
      {
        url: "/favicon-light.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <Providers>
          <body>{children}</body>
          <Toaster />
        </Providers>
      </html>
    </ClerkProvider>
  );
}
