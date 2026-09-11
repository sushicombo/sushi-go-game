import type { Metadata } from "next";
import { Fredoka, Nunito, Kosugi_Maru } from "next/font/google";
import "./globals.css";
import { ClickSound } from "@/components/ClickSound";

/** Fredoka carries every name, numeral and label — it is the only face with the plush set's roundness. */
const display = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Kosugi Maru is the closest rounded feel to Fredoka that also covers Japanese glyphs. */
const displayJp = Kosugi_Maru({
  variable: "--font-display-jp",
  subsets: ["latin"],
  weight: "400",
});

/** Nunito takes the prose: rounded enough to belong, quiet enough to read at length. */
const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sushi Combo",
  description: "Play Sushi Combo solo against bots and learn to read the table.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${displayJp.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClickSound />
        {children}
      </body>
    </html>
  );
}
