import localFont from "next/font/local";

/**
 * Inter Variable Font - Fuente principal del proyecto
 * Soporta todos los pesos (100-900) dinámicamente
 */
export const inter = localFont({
  src: [
    {
      path: "./../../public/fonts/Inter-VariableFont_opsz,wght.ttf",
      style: "normal",
    },
    {
      path: "./../../public/fonts/Inter-Italic-VariableFont_opsz,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

/**
 * Roboto Variable Font - Fuente secundaria/alternativa
 * Soporta diferentes anchos (wdth) y pesos (wght)
 */
export const roboto = localFont({
  src: [
    {
      path: "./../../public/fonts/Roboto-VariableFont_wdth,wght.ttf",
      style: "normal",
    },
    {
      path: "../../public/fonts/Roboto-Italic-VariableFont_wdth,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-roboto",
  display: "swap",
  preload: true,
});

/**
 * Roboto Condensed - Fuente estática para encabezados o espacios reducidos
 * Configuración con múltiples pesos para fallback si se necesita
 */
export const robotoCondensed = localFont({
  src: [
    {
      path: "../../public/fonts/Roboto_Condensed-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-ThinItalic.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-ExtraLightItalic.ttf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-ExtraBoldItalic.ttf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Roboto_Condensed-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-roboto-condensed",
  display: "swap",
});
