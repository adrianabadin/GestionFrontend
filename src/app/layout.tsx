import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, ReduxProvider } from "@/_core/providers";
import { NavbarSimple, StickyNavbar } from "./components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tablero de gestion",
  description: "Region sanitaria X",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <html lang="en">
          <body className={inter.className}>
            <StickyNavbar />

            {children}
          </body>
        </html>
      </ThemeProvider>
    </ReduxProvider>
  );
}
