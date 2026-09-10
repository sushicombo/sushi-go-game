import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const mincho = Fredoka({
  variable: "--font-mincho",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const archivo = Nunito({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sushi Go!",
  description: "Play Sushi Go! solo against bots and learn to read the table.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${mincho.variable} ${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
