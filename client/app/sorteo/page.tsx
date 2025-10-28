"use client"

import { Card } from "@/components/card"
import { Button } from "@/components/ui/button"
import { StatItem } from "@/components/stat-item"
import { Countdown } from "@/components/countdown"
import { Badge } from "@/components/ui/badge"
import { Gift, Trophy, Lock, ExternalLink } from "lucide-react"

export default function SorteoPage() {
  const hasWon = false // Placeholder

  return (
    <div className="pb-20 px-4 pt-6 space-y-4">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Sorteo</h1>
        <p className="text-sm text-muted-foreground">Transparente y verificable en blockchain</p>
      </div>

      {/* Active Draw */}
      <Card className="border-accent/30 bg-gradient-to-br from-primary/5 via-surface to-accent/5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Sorteo activo</span>
            <Badge variant="default" className="bg-accent/20 text-accent border-accent/30">
              En curso
            </Badge>
          </div>

          <Countdown targetDate={new Date(Date.now() + 765000)} large />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <StatItem label="Premio estimado" value="12.3 USDC" />
            <StatItem label="Participantes" value="134" />
          </div>
        </div>
      </Card>

      {/* Your Probability */}
      <Card className="bg-surface/80">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Tu probabilidad</span>
            <Trophy className="w-4 h-4 text-accent" />
          </div>
          <div className="text-3xl font-bold text-accent tabular-nums">1.2%</div>
          <p className="text-xs text-muted-foreground">
            Basada en tu balance de 25.50 USDC del total de 2,125 USDC en el pool.
          </p>
          <div className="w-full bg-border/30 rounded-full h-2 overflow-hidden">
            <div className="bg-accent h-full rounded-full" style={{ width: "1.2%" }} />
          </div>
        </div>
      </Card>

      {/* Transparency */}
      <Card className="bg-surface/50">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Transparencia</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
              <span className="text-muted-foreground">Commit Hash</span>
              <code className="text-foreground font-mono">a3f9...2b1c</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
              <span className="text-muted-foreground">Reveal Hash</span>
              <code className="text-muted-foreground font-mono">Pendiente</code>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full text-xs">
            Ver reglas del sorteo
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </Card>

      {/* Recent Result */}
      <Card className="bg-surface/80">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Último sorteo</span>
            <Badge variant="outline" className="text-xs">
              Finalizado
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ganador</span>
              <code className="text-foreground font-mono text-xs">GA...5D</code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Premio</span>
              <span className="text-foreground font-semibold">10.0 USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fecha</span>
              <span className="text-foreground">Hace 2 horas</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Claim Prize (conditional) */}
      {hasWon && (
        <Card className="border-success/30 bg-gradient-to-br from-success/10 to-surface">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-success/20 flex items-center justify-center">
              <Gift className="w-6 h-6 text-success" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">¡Felicidades!</h3>
              <p className="text-sm text-muted-foreground">Ganaste el sorteo del 28 de octubre</p>
            </div>
            <div className="text-2xl font-bold text-success tabular-nums">10.0 USDC</div>
            <Button className="w-full" size="lg">
              Reclamar premio
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
