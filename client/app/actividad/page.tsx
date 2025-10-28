"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/empty-state"
import { ArrowDownCircle, ArrowUpCircle, Trophy, Filter } from "lucide-react"

type ActivityType = "all" | "deposit" | "withdrawal" | "draw"

interface Activity {
  id: string
  type: "deposit" | "withdrawal" | "draw"
  amount?: number
  date: string
  status: "completed" | "won" | "lost"
  prize?: number
}

const activities: Activity[] = [
  { id: "1", type: "draw", date: "Hace 2 horas", status: "lost" },
  { id: "2", type: "deposit", amount: 5, date: "Hace 1 día", status: "completed" },
  { id: "3", type: "withdrawal", amount: 2, date: "Hace 3 días", status: "completed" },
  { id: "4", type: "draw", date: "Hace 5 días", status: "won", prize: 10 },
  { id: "5", type: "deposit", amount: 10, date: "Hace 1 semana", status: "completed" },
]

export default function ActividadPage() {
  const [filter, setFilter] = useState<ActivityType>("all")

  const filteredActivities = activities.filter((activity) => filter === "all" || activity.type === filter)

  return (
    <div className="pb-20 px-4 pt-6 space-y-4">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Actividad</h1>
        <p className="text-sm text-muted-foreground">Historial de transacciones y sorteos</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          Todos
        </FilterButton>
        <FilterButton active={filter === "deposit"} onClick={() => setFilter("deposit")}>
          Depósitos
        </FilterButton>
        <FilterButton active={filter === "withdrawal"} onClick={() => setFilter("withdrawal")}>
          Retiros
        </FilterButton>
        <FilterButton active={filter === "draw"} onClick={() => setFilter("draw")}>
          Sorteos
        </FilterButton>
      </div>

      {/* Activity List */}
      {filteredActivities.length > 0 ? (
        <div className="space-y-2">
          {filteredActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Filter}
          title="Sin actividad"
          description="Aún no hay actividad. ¡Empieza con tu primer depósito!"
        />
      )}
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active ? "bg-accent text-background" : "bg-surface text-muted-foreground hover:bg-surface/80"
      }`}
    >
      {children}
    </button>
  )
}

function ActivityItem({ activity }: { activity: Activity }) {
  const getIcon = () => {
    switch (activity.type) {
      case "deposit":
        return <ArrowDownCircle className="w-5 h-5 text-success" />
      case "withdrawal":
        return <ArrowUpCircle className="w-5 h-5 text-warning" />
      case "draw":
        return <Trophy className="w-5 h-5 text-accent" />
    }
  }

  const getTitle = () => {
    switch (activity.type) {
      case "deposit":
        return "Depósito"
      case "withdrawal":
        return "Retiro"
      case "draw":
        return activity.status === "won" ? "Sorteo ganado" : "Sorteo"
    }
  }

  const getAmount = () => {
    if (activity.type === "draw" && activity.status === "won") {
      return `+${activity.prize} USDC`
    }
    if (activity.amount) {
      return activity.type === "deposit" ? `+${activity.amount} USDC` : `-${activity.amount} USDC`
    }
    return null
  }

  return (
    <Card className="bg-surface/50 hover:bg-surface/80 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{getTitle()}</span>
            {activity.type === "draw" && activity.status === "won" && (
              <Badge variant="default" className="bg-success/20 text-success border-success/30 text-xs">
                Ganaste
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{activity.date}</span>
        </div>
        {getAmount() && (
          <div
            className={`text-sm font-semibold tabular-nums ${
              activity.type === "deposit" || activity.status === "won" ? "text-success" : "text-foreground"
            }`}
          >
            {getAmount()}
          </div>
        )}
      </div>
    </Card>
  )
}
