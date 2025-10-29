"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { Badge } from "@/components/ui/badge"
import { useOrbitSavePool } from "@/hooks/use-orbit-save"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Trophy,
  Clock,
  Target,
  Zap,
  Activity
} from "lucide-react"

interface PoolStatsProps {
  className?: string
}

interface StatChange {
  value: number
  trend: 'up' | 'down' | 'stable'
  percentage: number
}

export function PoolStats({ className = "" }: PoolStatsProps) {
  const { poolData } = useOrbitSavePool()
  const [stats, setStats] = useState({
    totalDeposited: { value: 0, trend: 'stable' as 'up' | 'down' | 'stable', percentage: 0 },
    participants: { value: 0, trend: 'stable' as 'up' | 'down' | 'stable', percentage: 0 },
    prizePool: { value: 0, trend: 'stable' as 'up' | 'down' | 'stable', percentage: 0 },
    avgDeposit: { value: 0, trend: 'stable' as 'up' | 'down' | 'stable', percentage: 0 }
  })

  const [liveUpdates, setLiveUpdates] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    if (!liveUpdates) return

    const interval = setInterval(() => {
      setStats(prev => {
        const variations = {
          totalDeposited: (Math.random() - 0.5) * 100, // ±50 USDC
          participants: Math.random() > 0.95 ? 1 : 0, // Occasionally +1 participant
          prizePool: (Math.random() - 0.5) * 2, // ±1 USDC
          avgDeposit: (Math.random() - 0.5) * 10 // ±5 USDC
        }

        return {
          totalDeposited: {
            value: Math.max(0, poolData.totalDeposited + variations.totalDeposited),
            trend: variations.totalDeposited > 0 ? 'up' : variations.totalDeposited < 0 ? 'down' : 'stable',
            percentage: Math.abs(variations.totalDeposited / poolData.totalDeposited * 100)
          },
          participants: {
            value: poolData.totalParticipants + variations.participants,
            trend: variations.participants > 0 ? 'up' : 'stable',
            percentage: variations.participants > 0 ? (variations.participants / poolData.totalParticipants * 100) : 0
          },
          prizePool: {
            value: Math.max(0, poolData.nextPrizeAmount + variations.prizePool),
            trend: variations.prizePool > 0 ? 'up' : variations.prizePool < 0 ? 'down' : 'stable',
            percentage: Math.abs(variations.prizePool / poolData.nextPrizeAmount * 100)
          },
          avgDeposit: {
            value: Math.max(0, (poolData.totalDeposited / poolData.totalParticipants) + variations.avgDeposit),
            trend: variations.avgDeposit > 0 ? 'up' : variations.avgDeposit < 0 ? 'down' : 'stable',
            percentage: Math.abs(variations.avgDeposit / (poolData.totalDeposited / poolData.totalParticipants) * 100)
          }
        }
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [poolData, liveUpdates])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />
      default:
        return <Activity className="w-3 h-3 text-muted-foreground" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-500'
      case 'down':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value).replace('US$', '$')
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-ES').format(Math.floor(value))
  }

  return (
    <Card className={`bg-surface/50 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            Estadísticas del Pool
          </h3>
          <div className="flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${liveUpdates ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
            ></div>
            <span className="text-xs text-muted-foreground">
              {liveUpdates ? 'En vivo' : 'Pausado'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Total Depositado */}
          <div className="p-3 rounded-lg bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Total Pool</span>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(stats.totalDeposited.trend)}
                <span className={`text-xs ${getTrendColor(stats.totalDeposited.trend)}`}>
                  {stats.totalDeposited.percentage > 0 ? `${stats.totalDeposited.percentage.toFixed(1)}%` : ''}
                </span>
              </div>
            </div>
            <div className="text-lg font-bold text-foreground tabular-nums">
              {formatCurrency(stats.totalDeposited.value || poolData.totalDeposited)}
            </div>
          </div>

          {/* Participantes */}
          <div className="p-3 rounded-lg bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Usuarios</span>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(stats.participants.trend)}
                <span className={`text-xs ${getTrendColor(stats.participants.trend)}`}>
                  {stats.participants.percentage > 0 ? `+${stats.participants.percentage.toFixed(0)}%` : ''}
                </span>
              </div>
            </div>
            <div className="text-lg font-bold text-foreground tabular-nums">
              {formatNumber(stats.participants.value || poolData.totalParticipants)}
            </div>
          </div>

          {/* Premio Acumulado */}
          <div className="p-3 rounded-lg bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Premio</span>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(stats.prizePool.trend)}
                <span className={`text-xs ${getTrendColor(stats.prizePool.trend)}`}>
                  {stats.prizePool.percentage > 0 ? `${stats.prizePool.percentage.toFixed(1)}%` : ''}
                </span>
              </div>
            </div>
            <div className="text-lg font-bold text-accent tabular-nums">
              {formatCurrency(stats.prizePool.value || poolData.nextPrizeAmount)}
            </div>
          </div>

          {/* Depósito Promedio */}
          <div className="p-3 rounded-lg bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Promedio</span>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(stats.avgDeposit.trend)}
                <span className={`text-xs ${getTrendColor(stats.avgDeposit.trend)}`}>
                  {stats.avgDeposit.percentage > 0 ? `${stats.avgDeposit.percentage.toFixed(1)}%` : ''}
                </span>
              </div>
            </div>
            <div className="text-lg font-bold text-foreground tabular-nums">
              {formatCurrency(stats.avgDeposit.value || (poolData.totalDeposited / poolData.totalParticipants))}
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2 p-2 rounded bg-accent/10">
            <Zap className="w-3 h-3 text-accent" />
            <span className="text-xs text-muted-foreground">
              Actividad alta: {Math.floor(Math.random() * 12) + 3} transacciones en la última hora
            </span>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded bg-green-500/10">
            <Clock className="w-3 h-3 text-green-500" />
            <span className="text-xs text-muted-foreground">
              Próximo sorteo en {Math.floor(Math.random() * 4) + 1} días
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center pt-2 border-t border-border/50">
          <button
            onClick={() => setLiveUpdates(!liveUpdates)}
            className="text-xs text-accent hover:text-accent/80 transition-colors"
          >
            {liveUpdates ? 'Pausar actualizaciones' : 'Reanudar actualizaciones'}
          </button>
          
          <Badge variant="secondary" className="text-xs">
            Última actualización: hace {Math.floor(Math.random() * 30) + 1}s
          </Badge>
        </div>
      </div>
    </Card>
  )
}