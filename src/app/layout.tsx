import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "KcBlendz — Fresh Smoothies, Made Your Way",
    template: "%s · KcBlendz",
  },
  description:
    "Experience the ultimate fruit-inspired nutrition. We blend organic ingredients into masterpieces, delivered fresh to your door.",
  applicationName: "KcBlendz",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "KcBlendz", statusBarStyle: "default" },
  openGraph: {
    title: "KcBlendz — Fresh Smoothies, Made Your Way",
    description: "Fresh, vibrant wellness delivered to your door.",
    type: "website",
    siteName: "KcBlendz",
  },
};

export const viewport: Viewport = {
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-white text-ink antialiased">{children}</body>
    </html>
  );
}
