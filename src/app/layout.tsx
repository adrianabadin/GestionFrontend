import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, ReduxProvider } from "@/_core/providers";
import { NavbarSimple, StickyNavbar } from "./components/header";
import { inter, roboto } from "./fonts";

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
        <html lang="es" className={`${inter.variable} ${roboto.variable}`}>
          <body className={inter.className}>
            <StickyNavbar />

            {children}
          </body>
        </html>
      </ThemeProvider>
    </ReduxProvider>
  );
}
