import { Geist } from "next/font/google";
import localFont from "next/font/local";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

const vcHenrietta = localFont({
  src: [
    {
      path: "./files/VCHenrietta-Medium-Trial.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./files/VCHenrietta-Bold-Trial.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./files/VCHenrietta-Black-Trial.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-vc-henrietta",
  display: "swap",
});

export const FONT_VARIABLES = [geist.variable, vcHenrietta.variable].join(" ");

export const FONTS = {
  compactaLight: "Compacta Light",
  compactaPro: "Compacta Pro",
  vcHenrietta: "VC Henrietta Trial",
};
