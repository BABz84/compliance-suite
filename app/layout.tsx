import "@/styles/globals.css"
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { type Metadata } from "next"
import { AppStateProvider } from "@/lib/store/AppStateProvider"
import { StateSynchronizer } from "@/components/shared/StateSynchronizer"
import { AuthWrapper } from "@/components/auth/AuthWrapper"
import { ThemeProvider } from "@/components/theme-provider"

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Gen-AI Compliance Suite",
  description: "An enterprise compliance system powered by AI",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AppStateProvider>
            <StateSynchronizer />
            <AuthWrapper>
              {children}
            </AuthWrapper>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'