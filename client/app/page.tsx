"use client"
import { Card } from "@/components/card"
import { Button } from "@/components/ui/button"
import { StatItem } from "@/components/stat-item"
import { Countdown } from "@/components/countdown"
import { useWallet } from "@/hooks/use-wallet"
import { Rocket, TrendingUp, Gift, Wallet } from "lucide-react"

export default function HomePage() {
  const { isConnected, balance } = useWallet()

  return (
    <div className="pb-20 px-4 pt-6 space-y-4">
      {/* Hero Section */}
      <div className="text-center space-y-2 mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">OrbitSave</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">Tu ahorro, tu boleto a premios sin riesgo.</p>
      </div>

      {isConnected ? (
        <>
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-surface via-surface to-surface/50 border-border/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tu balance</span>
                <Wallet className="w-4 h-4 text-accent" />
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold tabular-nums text-foreground">{balance.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">USDC</div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" size="lg">
                  Depositar
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" size="lg">
                  Retirar
                </Button>
              </div>
            </div>
          </Card>

          {/* Draw Card */}
          <Card className="border-accent/20 bg-surface/80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Sorteo en curso</span>
                <Gift className="w-4 h-4 text-accent" />
              </div>

              <Countdown targetDate={new Date(Date.now() + 765000)} />

              <div className="grid grid-cols-3 gap-3 pt-2">
                <StatItem label="Premio" value="12.3 USDC" />
                <StatItem label="Participantes" value="134" />
                <StatItem label="Tu probabilidad" value="1.2%" highlight />
              </div>

              <Button variant="outline" className="w-full bg-transparent" size="sm">
                Ver detalles del sorteo
              </Button>
            </div>
          </Card>

          {/* How it Works */}
          <Card className="bg-surface/50">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                ¿Cómo funciona?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Deposita USDC y participa automáticamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Los premios provienen del rendimiento simulado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Retira tu depósito cuando quieras, sin penalización</span>
                </li>
              </ul>
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Guest View */}
          <Card className="bg-gradient-to-br from-primary/10 via-surface to-accent/5 border-accent/20">
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Bienvenido a OrbitSave</h2>
                <p className="text-sm text-muted-foreground">
                  Conecta tu wallet Freighter para empezar a ahorrar y participar en sorteos.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <Button className="w-full" size="lg">
                  Conectar Freighter
                </Button>
                <Button variant="ghost" className="w-full" size="sm">
                  Explorar como invitado
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-2">Nadie pierde su depósito. Premios del rendimiento.</p>
            </div>
          </Card>

          {/* Pool Stats for Guests */}
          <Card className="bg-surface/50">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Pool actual</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="Total depositado" value="3,420 USDC" />
                <StatItem label="Participantes" value="134" />
                <StatItem label="Próximo premio" value="12.3 USDC" />
                <StatItem label="Sorteo en" value="12m 45s" />
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
