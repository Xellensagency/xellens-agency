import type { Metadata } from "next";
import "./globals.css";
import ThemeBoot from "@/components/theme/ThemeBoot";

export const metadata: Metadata = {
  title: {
    default: "Vorix Platform",
    template: "%s | Vorix Platform",
  },
  description: "Vorix Platform – Admin och kundportal.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body>
        <ThemeBoot />
        {children}
      </body>
    </html>
  );
}
