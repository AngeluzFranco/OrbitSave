"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { useWallet } from "@/hooks/use-wallet"
import { useOrbitSavePool } from "@/hooks/use-orbit-save"
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Trophy, 
  Filter, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  TrendingUp,
  Calendar,
  Activity,
  Target,
  Sparkles
} from "lucide-react"

type ActivityType = "all" | "deposit" | "withdraw" | "prize"

interface ActivityItem {
  id: string
  type: 'deposit' | 'withdraw' | 'prize' | 'raffle-win' | 'raffle-lose'
  amount: number
  date: Date
  status: 'pending' | 'confirmed' | 'failed'
  hash?: string
  extra?: {
    tickets?: number
    raffleId?: string
    prizePool?: number
  }
}

export default function ActividadPage() {
  const { isConnected, address } = useWallet()
  const { recentTransactions } = useOrbitSavePool()
  const [filter, setFilter] = useState<ActivityType>("all")
  const [expandedTx, setExpandedTx] = useState<string | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    if (isConnected && address) {
      // Generate comprehensive activity data
      const mockActivities: ActivityItem[] = [
        // Recent deposit
        {
          id: "1",
          type: "deposit",
          amount: 100,
          date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          status: "confirmed",
          hash: "d4e5f6a7b8c9...123456",
          extra: { tickets: 20 }
        },
        // Raffle participation - didn't win
        {
          id: "2",
          type: "raffle-lose",
          amount: 25.5, // prize pool amount
          date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          status: "confirmed",
          hash: "r1a2f3f4l5e6...789012",
          extra: { 
            raffleId: "RAFFLE-2025-042",
            prizePool: 25.5,
            tickets: 15
          }
        },
        // Previous deposit
        {
          id: "3",
          type: "deposit",
          amount: 75,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          status: "confirmed",
          hash: "a1b2c3d4e5f6...345678",
          extra: { tickets: 15 }
        },
        // Prize won
        {
          id: "4",
          type: "prize",
          amount: 15.3,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          status: "confirmed",
          hash: "p7r8i9z0e1w2...901234",
          extra: { 
            raffleId: "RAFFLE-2025-041",
            prizePool: 42.7
          }
        },
        // Partial withdrawal
        {
          id: "5",
          type: "withdraw",
          amount: 50,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          status: "confirmed",
          hash: "w3i4t5h6d7r8...567890",
          extra: { tickets: 10 }
        },
        // Raffle participation - won
        {
          id: "6",
          type: "raffle-win",
          amount: 22.1,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          status: "confirmed",
          hash: "r2w3i4n5s6t7...234567",
          extra: { 
            raffleId: "RAFFLE-2025-040",
            prizePool: 22.1,
            tickets: 25
          }
        },
        // Older deposit
        {
          id: "7",
          type: "deposit",
          amount: 200,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          status: "confirmed",
          hash: "o1l2d3d4e5p6...678901",
          extra: { tickets: 40 }
        }
      ]

      setActivities(mockActivities)
    }
  }, [isConnected, address])

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true
    if (filter === "deposit") return activity.type === "deposit"
    if (filter === "withdraw") return activity.type === "withdraw"
    if (filter === "prize") return activity.type === "prize" || activity.type === "raffle-win" || activity.type === "raffle-lose"
    return false
  })

  if (!isConnected) {
    return (
      <div className="pb-20 px-4 pt-6 space-y-4">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-foreground">Actividad</h1>
          <p className="text-sm text-muted-foreground">Historial cronológico de transacciones y sorteos</p>
        </div>
        
        <EmptyState
          icon={Activity}
          title="Conecta tu wallet"
          description="Conecta tu wallet Freighter para ver tu historial de actividad"
        />
      </div>
    )
  }

  return (
    <div className="pb-20 px-4 pt-6 space-y-6">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Actividad</h1>
        <p className="text-sm text-muted-foreground">Historial cronológico de transacciones y sorteos</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-surface/50 text-center">
          <div className="space-y-1">
            <div className="text-lg font-bold text-green-500">
              {activities
                .filter(a => a.type === 'deposit' && a.status === 'confirmed')
                .reduce((sum, a) => sum + a.amount, 0)
                .toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">USDC Depositados</div>
          </div>
        </Card>
        
        <Card className="bg-surface/50 text-center">
          <div className="space-y-1">
            <div className="text-lg font-bold text-accent">
              {activities
                .filter(a => (a.type === 'prize' || a.type === 'raffle-win') && a.status === 'confirmed')
                .reduce((sum, a) => sum + a.amount, 0)
                .toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">USDC Ganados</div>
          </div>
        </Card>
        
        <Card className="bg-surface/50 text-center">
          <div className="space-y-1">
            <div className="text-lg font-bold text-primary">
              {activities.filter(a => a.type === 'raffle-win' || a.type === 'raffle-lose').length}
            </div>
            <div className="text-xs text-muted-foreground">Sorteos</div>
          </div>
        </Card>
      </div>

      {/* Filtros Simples */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          <Filter className="w-3 h-3 mr-1" />
          Todos
        </FilterButton>
        <FilterButton active={filter === "deposit"} onClick={() => setFilter("deposit")}>
          <ArrowDownCircle className="w-3 h-3 mr-1" />
          Depósitos
        </FilterButton>
        <FilterButton active={filter === "withdraw"} onClick={() => setFilter("withdraw")}>
          <ArrowUpCircle className="w-3 h-3 mr-1" />
          Retiros
        </FilterButton>
        <FilterButton active={filter === "prize"} onClick={() => setFilter("prize")}>
          <Trophy className="w-3 h-3 mr-1" />
          Sorteos
        </FilterButton>
      </div>

      {/* Lista Cronológica */}
      {filteredActivities.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Ordenado por fecha (más reciente primero)</span>
          </div>
          
          {filteredActivities.map((activity, index) => (
            <ActivityItemComponent 
              key={activity.id} 
              activity={activity} 
              isExpanded={expandedTx === activity.id}
              onToggleExpand={() => setExpandedTx(
                expandedTx === activity.id ? null : activity.id
              )}
              isFirst={index === 0}
            />
          ))}
        </div>
      ) : activities.length === 0 ? (
        /* Estado Vacío */
        <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Aún no hay actividad
              </h3>
              <p className="text-sm text-muted-foreground">
                ¡Empieza con tu primer depósito!
              </p>
            </div>
            <Button className="mt-4">
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Hacer primer depósito
            </Button>
          </div>
        </Card>
      ) : (
        /* No hay resultados para el filtro */
        <Card className="bg-surface/50">
          <div className="text-center py-6 space-y-2">
            <Filter className="w-8 h-8 text-muted-foreground mx-auto" />
            <div className="text-sm font-medium text-foreground">
              Sin resultados para "{filter}"
            </div>
            <div className="text-xs text-muted-foreground">
              Cambia el filtro para ver más actividad
            </div>
          </div>
        </Card>
      )}

      {/* Activity Summary */}
      {activities.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-accent/20">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              Resumen de actividad
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Transacciones totales</div>
                <div className="text-lg font-bold text-foreground">{activities.length}</div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Sorteos participados</div>
                <div className="text-lg font-bold text-primary">
                  {activities.filter(a => a.type === 'raffle-win' || a.type === 'raffle-lose').length}
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Miembro activo desde {activities[activities.length - 1]?.date.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
        </Card>
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
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center ${
        active 
          ? "bg-accent text-background shadow-lg" 
          : "bg-surface text-muted-foreground hover:bg-surface/80 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function ActivityItemComponent({ 
  activity, 
  isExpanded, 
  onToggleExpand,
  isFirst
}: { 
  activity: ActivityItem
  isExpanded: boolean
  onToggleExpand: () => void
  isFirst: boolean
}) {
  const getIcon = () => {
    switch (activity.type) {
      case "deposit":
        return <ArrowDownCircle className="w-5 h-5 text-green-500" />
      case "withdraw":
        return <ArrowUpCircle className="w-5 h-5 text-orange-500" />
      case "prize":
        return <Trophy className="w-5 h-5 text-accent" />
      case "raffle-win":
        return <Sparkles className="w-5 h-5 text-green-500" />
      case "raffle-lose":
        return <Target className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusIcon = () => {
    switch (activity.status) {
      case "pending":
        return <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getTitle = () => {
    switch (activity.type) {
      case "deposit":
        return "Depósito"
      case "withdraw":
        return "Retiro"
      case "prize":
        return "Premio reclamado"
      case "raffle-win":
        return "Sorteo ganado"
      case "raffle-lose":
        return "Sorteo (no ganaste)"
    }
  }

  const getAmount = () => {
    if (activity.type === "withdraw") {
      return `-${activity.amount.toFixed(2)} USDC`
    }
    if (activity.type === "raffle-lose") {
      return `${activity.extra?.prizePool?.toFixed(1) || 0} USDC`
    }
    return `+${activity.amount.toFixed(2)} USDC`
  }

  const getAmountColor = () => {
    if (activity.type === "withdraw") return "text-orange-500"
    if (activity.type === "raffle-lose") return "text-muted-foreground"
    return "text-green-500"
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return "Hace unos minutos"
    if (hours < 24) return `Hace ${hours}h`
    if (days === 1) return "Ayer"
    if (days < 7) return `Hace ${days} días`
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  const getDescription = () => {
    switch (activity.type) {
      case "deposit":
        return `+${activity.extra?.tickets || 0} boletos para sorteos`
      case "withdraw":
        return `-${activity.extra?.tickets || 0} boletos perdidos`
      case "prize":
        return "Premio automáticamente agregado a tu balance"
      case "raffle-win":
        return `¡Felicidades! Ganaste el sorteo ${activity.extra?.raffleId}`
      case "raffle-lose":
        return `Participaste con ${activity.extra?.tickets || 0} boletos`
    }
  }

  return (
    <Card className={`bg-surface/50 hover:bg-surface/80 transition-all cursor-pointer ${
      isFirst ? 'ring-2 ring-accent/20' : ''
    }`}>
      <div className="space-y-3">
        {/* Main activity info */}
        <div 
          className="flex items-center gap-3"
          onClick={onToggleExpand}
        >
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">{getTitle()}</span>
              {getStatusIcon()}
              {isFirst && (
                <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 text-xs">
                  Reciente
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{getDescription()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDate(activity.date)}
            </div>
          </div>
          <div className={`text-sm font-semibold tabular-nums ${getAmountColor()}`}>
            {getAmount()}
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="pt-3 border-t border-border/50 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Estado:</span>
                <span className={`ml-2 font-medium ${
                  activity.status === 'confirmed' ? 'text-green-500' :
                  activity.status === 'pending' ? 'text-orange-500' : 'text-red-500'
                }`}>
                  {activity.status === 'confirmed' ? 'Confirmado' :
                   activity.status === 'pending' ? 'Pendiente' : 'Fallido'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha completa:</span>
                <span className="ml-2 font-medium text-foreground">
                  {activity.date.toLocaleString('es-ES')}
                </span>
              </div>
            </div>

            {(activity.type === 'raffle-win' || activity.type === 'raffle-lose') && activity.extra && (
              <div className="p-3 bg-background/50 rounded-lg space-y-2">
                <div className="text-xs font-medium text-foreground">Detalles del sorteo:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">ID del sorteo:</span>
                    <div className="font-mono text-foreground">{activity.extra.raffleId}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Premio total:</span>
                    <div className="font-semibold text-foreground">{activity.extra.prizePool} USDC</div>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tus boletos:</span>
                  <span className="ml-2 font-medium text-accent">{activity.extra.tickets} boletos</span>
                </div>
              </div>
            )}
            
            {activity.hash && activity.hash !== 'pending...' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Hash de transacción:</span>
                <code className="text-xs bg-background/50 px-2 py-1 rounded font-mono text-foreground flex-1">
                  {activity.hash}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(`https://stellar.expert/explorer/testnet/tx/${activity.hash}`, '_blank')
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
