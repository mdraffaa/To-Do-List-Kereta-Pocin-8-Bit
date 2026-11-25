import { JetBrains_Mono, Pixelify_Sans, Silkscreen } from "next/font/google";
import "./globals.css";

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-silkscreen",
});

const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pixelify",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "KRL Depok 8-Bit | Stasiun Pondok Cina Todo",
  description:
    "Simulasi KRL Commuter Line 8-bit semi-3D interaktif yang terhubung langsung dengan daftar tugas & pengingat Windows.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${silkscreen.variable} ${pixelifySans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
