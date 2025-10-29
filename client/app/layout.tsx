import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { BottomNav } from "@/components/bottom-nav"
import { AppHeader } from "@/components/app-header"
import { WalletProvider } from "@/providers/wallet-provider"
import { AppStateProvider } from "@/hooks/use-app-state"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })

export const metadata: Metadata = {
  title: "OrbitSave - Tu ahorro, tu boleto a premios sin riesgo",
  description: "Lotería sin pérdida en Stellar. Deposita, participa y nunca pierdas tu ahorro.",
  manifest: "/manifest.json",
  themeColor: "#0B1220",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OrbitSave",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <WalletProvider>
          <AppStateProvider>
            <div className="min-h-screen bg-background text-foreground">
              <AppHeader />
              <main className="max-w-2xl mx-auto">{children}</main>
              <BottomNav />
            </div>
            <Toaster />
          </AppStateProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
