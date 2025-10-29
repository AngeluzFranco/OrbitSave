"use client"
import { useState } from "react"
import { Card } from "@/components/card"
import { Button } from "@/components/ui/button"
import { StatItem } from "@/components/stat-item"
import { Countdown } from "@/components/countdown"
import { Onboarding } from "@/components/onboarding"
import { GuestView } from "@/components/guest-view"
import { DepositForm } from "@/components/deposit-form"
import { WithdrawForm } from "@/components/withdraw-form"
import { TransactionHistory } from "@/components/transaction-history"
import { PoolStats } from "@/components/pool-stats"
import { useWallet } from "@/hooks/use-wallet"
import { useOrbitSavePool } from "@/hooks/use-orbit-save"
import { Rocket, TrendingUp, Gift, Wallet, Plus, Minus, AlertCircle, DollarSign, Trophy, Target } from "lucide-react"

export default function HomePage() {
  const { isConnected, balance, isLoading: walletLoading, connect } = useWallet()
  const { poolData, deposit, withdraw } = useOrbitSavePool()
  const [showOnboarding, setShowOnboarding] = useState(!isConnected)
  const [showGuestView, setShowGuestView] = useState(false)
  const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw' | null>(null)

  // Show onboarding if not connected and haven't chosen guest mode
  if (!isConnected && showOnboarding && !showGuestView) {
    return (
      <Onboarding 
        onGuestMode={() => {
          setShowOnboarding(false)
          setShowGuestView(true)
        }}
      />
    )
  }

  // Show guest view if in guest mode
  if (!isConnected && showGuestView) {
    return (
      <GuestView 
        onConnectWallet={() => {
          setShowGuestView(false)
          setShowOnboarding(true)
        }}
      />
    )
  }

  // Connected user view
  if (isConnected) {
    return (
      <div className="pb-20 px-4 pt-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">OrbitSave</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Tu ahorro, tu boleto a premios sin riesgo
          </p>
        </div>

        {/* Tu Balance Card */}
        <Card className="bg-gradient-to-br from-surface via-surface to-surface/50 border-border/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tu balance</span>
              <Wallet className="w-4 h-4 text-accent" />
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-bold tabular-nums text-foreground">
                {balance.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">USDC disponible</div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                className="flex-1" 
                size="lg"
                onClick={() => setActiveAction('deposit')}
                disabled={poolData.isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Depositar
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 bg-transparent" 
                size="lg"
                onClick={() => setActiveAction('withdraw')}
                disabled={poolData.isLoading || poolData.userDeposit === 0}
              >
                <Minus className="w-4 h-4 mr-2" />
                Retirar
              </Button>
            </div>
          </div>
        </Card>

        {/* Deposit/Withdraw Forms */}
        {activeAction === 'deposit' && (
          <DepositForm 
            onClose={() => setActiveAction(null)}
            onSuccess={() => {
              // Refresh data or show success message
              console.log('Deposit successful')
            }}
          />
        )}

        {activeAction === 'withdraw' && (
          <WithdrawForm 
            onClose={() => setActiveAction(null)}
            onSuccess={() => {
              // Refresh data or show success message
              console.log('Withdraw successful')
            }}
          />
        )}

        {/* Transaction History */}
        <TransactionHistory limit={5} />

        {/* Pool Statistics */}
        <PoolStats />

        {/* Sorteo en Curso Card */}
        <Card className="border-accent/30 bg-gradient-to-br from-primary/10 via-surface to-accent/10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Sorteo en curso</span>
              <Gift className="w-5 h-5 text-accent" />
            </div>

            {/* Large Countdown */}
            <div className="text-center py-4">
              <Countdown targetDate={poolData.nextDrawDate} large />
            </div>

            {/* Prize Pool and Stats */}
            <div className="space-y-3">
              <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                <div className="text-sm text-muted-foreground mb-1">Premio estimado</div>
                <div className="text-3xl font-bold text-accent tabular-nums">
                  {poolData.nextPrizeAmount.toFixed(1)} USDC
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{poolData.totalParticipants}</div>
                  <div className="text-xs text-muted-foreground">Participantes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent">{poolData.userTickets}</div>
                  <div className="text-xs text-muted-foreground">Tus tickets</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{poolData.userProbability.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">Tu probabilidad</div>
                </div>
              </div>

              {poolData.userDeposit > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tu participación</span>
                    <span className="text-foreground">{poolData.userProbability.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-border/30 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-accent h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(poolData.userProbability, 100)}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Cómo Funciona Card */}
        <Card className="bg-surface/50">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              ¿Cómo funciona?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Deposita</div>
                  <div className="text-xs text-muted-foreground">
                    Deposita USDC y obtén boletos automáticamente
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Participa</div>
                  <div className="text-xs text-muted-foreground">
                    Participa automáticamente en sorteos semanales
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Reclama</div>
                  <div className="text-xs text-muted-foreground">
                    Gana premios sin perder tu depósito original
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {poolData.error && (
          <Card className="bg-red-500/10 border-red-500/20">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{poolData.error}</span>
            </div>
          </Card>
        )}
      </div>
    )
  }

  // Not connected - show CTA
  return (
    <div className="pb-20 px-4 pt-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center shadow-lg">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-foreground">OrbitSave</h1>
            <p className="text-sm text-accent font-medium">Tu ahorro, tu boleto a premios sin riesgo</p>
          </div>
        </div>
      </div>

      {/* CTA Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-surface to-accent/10 border-accent/30">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-accent" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Conecta tu wallet</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Conecta tu wallet Freighter para empezar a ahorrar y participar en sorteos
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Button 
              onClick={connect}
              disabled={walletLoading}
              className="w-full" 
              size="lg"
            >
              {walletLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Conectando...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Conectar Freighter
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowGuestView(true)}
              className="w-full" 
              size="sm"
            >
              Explorar como invitado
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Cards */}
      <Card className="bg-surface/50 opacity-60">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pool actual</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatItem label="Total depositado" value="8,420 USDC" />
            <StatItem label="Participantes" value="187" />
            <StatItem label="Próximo premio" value="24.7 USDC" highlight />
            <StatItem label="Tiempo restante" value="3d 12h" />
          </div>
        </div>
      </Card>
    </div>
  )
}
