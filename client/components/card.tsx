import type React from "react"
import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <div className={cn("rounded-xl border border-border bg-surface p-4 shadow-sm", className)}>{children}</div>
}
