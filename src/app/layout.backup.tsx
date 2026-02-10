import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, ReduxProvider } from "@/_core/providers";
import { NavbarSimple, StickyNavbar } from "./components/header";

export const metadata: Metadata = {
  title: "Tablero de gestion",
  description: "Region sanitaria X",
};

/**
 * LAYOUT DE RESPALDO - SIN FUENTES LOCALES
 * Usa fuentes del sistema para diagnosticar problemas
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <html lang="es">
          <body style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
            <StickyNavbar />
            {children}
          </body>
        </html>
      </ThemeProvider>
    </ReduxProvider>
  );
}
