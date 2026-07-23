import { ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";
import { ThemeInit } from "../.flowbite-react/init";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinSight | Invest and Save",
  description:
    "FinSight is a modern finance landing page for investing, savings, and wealth management.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body className="antialiased">
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
