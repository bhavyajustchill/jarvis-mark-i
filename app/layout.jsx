import { Orbitron, JetBrains_Mono, Rajdhani } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000814",
};

export const metadata = {
  title: "J.A.R.V.I.S. // Mark I",
  description:
    "Just A Rather Very Intelligent System: a voice-first desktop assistant with a holographic display and the Gemini Live voice engine",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "J.A.R.V.I.S.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${jetbrainsMono.variable} ${rajdhani.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[var(--void-black)] text-[var(--text-primary)] select-none">
        {children}
      </body>
    </html>
  );
}

