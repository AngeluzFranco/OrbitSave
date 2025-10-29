"use client"

import { Card } from "@/components/card"
import { Button } from "@/components/ui/button"
import { StatItem } from "@/components/stat-item"
import { Countdown } from "@/components/countdown"
import { Eye, Users, Coins, Gift, TrendingUp, Rocket } from "lucide-react"

interface GuestViewProps {
  onConnectWallet: () => void
}

export function GuestView({ onConnectWallet }: GuestViewProps) {
  // Mock data for pool statistics
  const poolData = {
    totalDeposited: 8420.50,
    totalParticipants: 187,
    nextPrize: 24.7,
    timeToNextDraw: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
    recentWinners: [
      { address: "GA7Q...X5D9", amount: 18.5, date: "2 días" },
      { address: "GBKM...A2L8", amount: 31.2, date: "1 semana" },
      { address: "GCVN...M9Q3", amount: 22.8, date: "2 semanas" },
    ]
  }

  return (
    <div className="pb-20 px-4 pt-6 space-y-4">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">OrbitSave</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Vista de invitado - Conecta tu wallet para participar
        </p>
      </div>

      {/* CTA Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Modo invitado activado</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Conecta tu wallet Freighter para depositar y participar en sorteos
          </p>
          <Button onClick={onConnectWallet} size="sm" className="w-full">
            Conectar Wallet
          </Button>
        </div>
      </Card>

      {/* Current Pool Stats */}
      <Card className="bg-surface/80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Coins className="w-4 h-4 text-accent" />
              Pool actual
            </h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <StatItem 
              label="Total depositado" 
              value={`${poolData.totalDeposited.toLocaleString()} USDC`} 
            />
            <StatItem 
              label="Participantes" 
              value={poolData.totalParticipants.toString()} 
            />
            <StatItem 
              label="Próximo premio" 
              value={`${poolData.nextPrize} USDC`} 
              highlight 
            />
            <StatItem 
              label="APY promedio" 
              value="4.2%" 
            />
          </div>
        </div>
      </Card>

      {/* Next Draw Countdown */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Gift className="w-4 h-4 text-accent" />
              Próximo sorteo
            </span>
          </div>

          <Countdown targetDate={poolData.timeToNextDraw} />

          <div className="text-center space-y-2 pt-2">
            <p className="text-xs text-muted-foreground">
              El premio se distribuye entre los ganadores seleccionados aleatoriamente
            </p>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              Ver historial de sorteos
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Winners */}
      <Card className="bg-surface/50">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            Ganadores recientes
          </h3>
          
          <div className="space-y-3">
            {poolData.recentWinners.map((winner, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-accent/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-accent">
                      {winner.address.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{winner.address}</p>
                    <p className="text-xs text-muted-foreground">Hace {winner.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-500">+{winner.amount} USDC</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* How it Works Info */}
      <Card className="bg-surface/50">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            ¿Cómo funciona?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>Los usuarios depositan USDC y reciben boletos automáticamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>Los premios provienen del rendimiento generado por el pool</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>Sorteos automáticos cada semana usando VRF</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>Los depósitos siempre están disponibles para retiro</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Network Info */}
      <div className="text-center pt-4">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span>Stellar Testnet • Soroban Smart Contracts</span>
        </div>
      </div>
    </div>
  )
}