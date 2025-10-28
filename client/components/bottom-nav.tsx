"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, Activity, User } from "lucide-react"

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/sorteo", label: "Sorteo", icon: Trophy },
  { href: "/actividad", label: "Actividad", icon: Activity },
  { href: "/perfil", label: "Perfil", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 border-t border-border/40">
      <div className="max-w-2xl mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
