import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Schemer",
  description:
    "Schemer is a tool that helps you to create database schemas and generate code",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <body>{children}</body>
        </ThemeProvider>
      </html>
    </ClerkProvider>
  );
}
