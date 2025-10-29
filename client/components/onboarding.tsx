"use client"

import { Card } from "@/components/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { Rocket, Download, Eye, Shield, Coins, TrendingUp } from "lucide-react"
import { useState } from "react"

interface OnboardingProps {
  onGuestMode: () => void
}

export function Onboarding({ onGuestMode }: OnboardingProps) {
  const { connect, installFreighter, isFreighterInstalled, isLoading, error } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    await connect()
    setIsConnecting(false)
  }

  return (
    <div className="pb-20 px-4 pt-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center shadow-lg">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-foreground">OrbitSave</h1>
            <p className="text-sm text-accent font-medium">Tu ahorro, tu boleto a premios sin riesgo</p>
          </div>
        </div>
        
        <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Conecta tu wallet Freighter para empezar a ahorrar en USDC y participar en sorteos automáticamente.
        </p>
      </div>

      {/* Main CTA Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-surface to-accent/10 border-accent/30">
        <div className="space-y-4 text-center">
          {!isFreighterInstalled ? (
            <>
              <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/10 flex items-center justify-center">
                <Download className="w-6 h-6 text-orange-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Instala Freighter Wallet</h2>
                <p className="text-sm text-muted-foreground">
                  Necesitas la wallet Freighter para interactuar con Stellar blockchain
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <Button 
                  onClick={installFreighter}
                  className="w-full" 
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Instalar Freighter
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={onGuestMode}
                  className="w-full" 
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Explorar como invitado
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">¡Freighter detectado!</h2>
                <p className="text-sm text-muted-foreground">
                  Conecta tu wallet para acceder a todas las funcionalidades
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <Button 
                  onClick={handleConnect}
                  disabled={isConnecting || isLoading}
                  className="w-full" 
                  size="lg"
                >
                  {isConnecting || isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Conectar Freighter
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={onGuestMode}
                  className="w-full" 
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Explorar como invitado
                </Button>
              </div>
            </>
          )}
          
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </Card>

      {/* Security Note */}
      <Card className="bg-green-500/5 border-green-500/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Shield className="w-4 h-4 text-green-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Garantía de seguridad</h3>
            <p className="text-xs text-muted-foreground">
              <strong>Nadie pierde su depósito.</strong> Los premios provienen del rendimiento generado por el pool. 
              Retira tu dinero cuando quieras, sin penalización.
            </p>
          </div>
        </div>
      </Card>

      {/* How it Works */}
      <Card className="bg-surface/50">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            ¿Cómo funciona OrbitSave?
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Deposita USDC</p>
                <p className="text-xs text-muted-foreground">
                  Deposita cualquier cantidad de USDC a través de Stellar blockchain
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-accent">2</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Participa automáticamente</p>
                <p className="text-xs text-muted-foreground">
                  Cada depósito te da boletos para los sorteos semanales
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-500">3</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Gana premios</p>
                <p className="text-xs text-muted-foreground">
                  Los premios vienen del rendimiento del pool, no de otros usuarios
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Network Info */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Coins className="w-3 h-3" />
          <span>Powered by Stellar & Soroban Smart Contracts</span>
        </div>
      </div>
    </div>
  )
}