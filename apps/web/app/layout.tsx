import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PostHogProvider } from "./providers/PostHogProvider";
import InstallPrompt from "./components/InstallPrompt";
import { InstallProvider } from "./contexts/InstallContext";
import { ToastProvider } from "./components/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#667eea",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "PortalElétricos",
  description: "Crie orçamentos profissionais de materiais elétricos de forma rápida e fácil",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PortalElétricos",
  },
  // Icons are handled automatically by app/icon.png
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <InstallProvider>
                  {children}
                  {/* <InstallPrompt /> */}
                </InstallProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
