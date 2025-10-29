"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/empty-state"
import { Countdown } from "@/components/countdown"
import { useWallet } from "@/hooks/use-wallet"
import { useOrbitSavePool } from "@/hooks/use-orbit-save"
import { 
  Gift, 
  Trophy, 
  ExternalLink, 
  Clock, 
  Users, 
  Shield, 
  Info,
  DollarSign,
  Hash,
  Eye,
  Sparkles,
  Star,
  Target,
  CheckCircle
} from "lucide-react"

interface Winner {
  address: string
  amount: number
  date: Date
  txHash: string
}

export default function SorteoPage() {
  const { isConnected, address } = useWallet()
  const { poolData } = useOrbitSavePool()
  const [hasUnclaimedPrize, setHasUnclaimedPrize] = useState(false)
  const [unclaimedAmount, setUnclaimedAmount] = useState(0)
  const [claimStatus, setClaimStatus] = useState<'idle' | 'claiming' | 'success'>('idle')
  const [showConfetti, setShowConfetti] = useState(false)
  const [recentWinner, setRecentWinner] = useState<Winner | null>(null)

  useEffect(() => {
    // Simulate data loading
    if (isConnected && address) {
      // Randomly set unclaimed prize for demo
      if (Math.random() > 0.7) {
        setHasUnclaimedPrize(true)
        setUnclaimedAmount(Math.floor(Math.random() * 50) + 10)
      }

      // Set recent winner
      setRecentWinner({
        address: "GAB2...XYZ9",
        amount: 34.7,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        txHash: "e5f6a7b8c9d0...1234567890"
      })
    }
  }, [isConnected, address])

  const handleClaimPrize = async () => {
    setClaimStatus('claiming')
    
    // Simulate claim process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setClaimStatus('success')
    setShowConfetti(true)
    setHasUnclaimedPrize(false)
    
    // Hide confetti after animation
    setTimeout(() => {
      setShowConfetti(false)
      setClaimStatus('idle')
    }, 3000)
  }

  const maskAddress = (addr: string) => {
    if (addr.length <= 8) return addr
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="pb-20 px-4 pt-6 space-y-4">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-foreground">Sorteo</h1>
          <p className="text-sm text-muted-foreground">Transparente y verificable en blockchain</p>
        </div>
        
        <EmptyState
          icon={Trophy}
          title="Conecta tu wallet"
          description="Conecta tu wallet para ver los detalles del sorteo y tu probabilidad de ganar"
        />
      </div>
    )
  }

  return (
    <div className="pb-20 px-4 pt-6 space-y-6 relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Star className="w-4 h-4 text-accent animate-spin" />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Sorteo</h1>
        <p className="text-sm text-muted-foreground">Transparente y verificable en blockchain</p>
      </div>

      {/* Claim Prize Banner */}
      {hasUnclaimedPrize && (
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 via-surface to-green-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="space-y-4 text-center relative z-10">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
              <Gift className="w-8 h-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">¡Felicidades! 🎉</h3>
              <p className="text-sm text-muted-foreground">Tienes un premio sin reclamar</p>
              <div className="text-3xl font-bold text-green-500 tabular-nums">
                {unclaimedAmount.toFixed(1)} USDC
              </div>
            </div>
            <Button 
              onClick={handleClaimPrize}
              disabled={claimStatus !== 'idle'}
              className="w-full bg-green-500 hover:bg-green-600 text-white" 
              size="lg"
            >
              {claimStatus === 'claiming' ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Reclamando premio...
                </>
              ) : claimStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  ¡Premio reclamado!
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Reclamar premio
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Encabezado con Countdown del Sorteo Activo */}
      <Card className="border-accent/30 bg-gradient-to-br from-primary/10 via-accent/5 to-surface relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -translate-y-12 translate-x-12" />
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Sorteo Activo</h2>
                <p className="text-xs text-muted-foreground">Próximo sorteo automático</p>
              </div>
            </div>
            <Badge variant="default" className="bg-accent/20 text-accent border-accent/30">
              En curso
            </Badge>
          </div>

          <Countdown targetDate={poolData.nextDrawDate} large />
        </div>
      </Card>

      {/* Tu Probabilidad + Premio Estimado + Participantes */}
      <div className="grid gap-4">
        {/* Tu Probabilidad */}
        <Card className="bg-surface/80">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Tu probabilidad</h3>
                <p className="text-xs text-muted-foreground">Basada en tus boletos activos</p>
              </div>
            </div>
            
            {poolData.userDeposit > 0 ? (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary tabular-nums">
                    {poolData.userProbability.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {poolData.userTickets} boletos activos
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progreso de probabilidad</span>
                    <span className="text-foreground">{poolData.userProbability.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-border/30 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min(poolData.userProbability * 2, 100)}%` }} 
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Cada 5 USDC = 1 boleto.</strong> Más depósito significa más boletos y mayor probabilidad de ganar premios.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <div className="text-2xl font-bold text-muted-foreground">0%</div>
                <p className="text-xs text-muted-foreground">
                  Deposita USDC para obtener boletos y participar
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Premio Estimado y Participantes */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-surface/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-foreground">Premio estimado</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500 tabular-nums">
                  {poolData.nextPrizeAmount.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">USDC</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Basado en rendimientos del pool
              </div>
            </div>
          </Card>

          <Card className="bg-surface/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-foreground">Participantes</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500 tabular-nums">
                  {poolData.totalParticipants}
                </div>
                <div className="text-xs text-muted-foreground">usuarios</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Compitiendo por el premio
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Sección Transparencia */}
      <Card className="bg-surface/50">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Transparencia</h3>
              <p className="text-xs text-muted-foreground">Verificable en blockchain</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Hash className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Hash Commit</span>
                </div>
                <code className="text-xs font-mono text-foreground bg-surface/50 px-2 py-1 rounded">
                  a7f3e9...b2c8d1
                </code>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Hash Reveal</span>
                </div>
                <code className="text-xs font-mono text-muted-foreground bg-surface/50 px-2 py-1 rounded">
                  Pendiente...
                </code>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="w-3 h-3 mr-2" />
              Ver reglas del sorteo
            </Button>
          </div>
        </div>
      </Card>

      {/* Resultado Más Reciente */}
      {recentWinner && (
        <Card className="bg-surface/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Último ganador</h3>
                <p className="text-xs text-muted-foreground">Resultado más reciente</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent" />
                  <code className="text-sm font-mono text-foreground">
                    {maskAddress(recentWinner.address)}
                  </code>
                </div>
                <div className="text-xs text-muted-foreground">
                  {recentWinner.date.toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-accent tabular-nums">
                  {recentWinner.amount.toFixed(1)} USDC
                </div>
                <Button variant="ghost" size="sm" className="text-xs p-1 h-auto">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Ver TX
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Información Adicional */}
      <Card className="bg-surface/50">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-accent" />
            ¿Cómo funcionan los sorteos?
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-accent mt-1">•</span>
              <span>Los sorteos se ejecutan automáticamente cada semana usando VRF (Verifiable Random Function)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent mt-1">•</span>
              <span>Los premios provienen del rendimiento generado por todo el pool de liquidez</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent mt-1">•</span>
              <span>Tu depósito principal siempre está seguro y disponible para retiro</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent mt-1">•</span>
              <span>Cada 5 USDC depositados te da 1 boleto para los sorteos</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
