"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/use-wallet"
import { useOrbitSavePool } from "@/hooks/use-orbit-save"
import { 
  DollarSign, 
  Plus, 
  Wallet, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  X, 
  Info,
  Shield,
  Loader2
} from "lucide-react"

interface DepositFormProps {
  onClose: () => void
  onSuccess?: () => void
}

type DepositStatus = 'idle' | 'pending-signature' | 'processing' | 'success' | 'error' | 'signature-rejected'

export function DepositForm({ onClose, onSuccess }: DepositFormProps) {
  const { balance, address } = useWallet()
  const { deposit, poolData } = useOrbitSavePool()
  
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState<DepositStatus>('idle')
  const [errorMessage, setErrorMessage] = useState("")
  const [txHash, setTxHash] = useState("")

  // Configuration
  const MINIMUM_DEPOSIT = 1.0 // 1 USDC minimum
  const ESTIMATED_FEE = 0.001 // 0.001 XLM fee
  const QUICK_AMOUNTS = [1, 5, 10, 25]

  const amountValue = parseFloat(amount) || 0
  const isValidAmount = amountValue >= MINIMUM_DEPOSIT && amountValue <= balance
  const estimatedTickets = Math.floor(amountValue / 5)
  
  // Calculate if user has enough for fee (simplified)
  const hasEnoughForFee = balance >= (amountValue + 0.5) // Buffer for fees

  const handleQuickAmount = (quickAmount: number) => {
    const newAmount = Math.min(quickAmount, balance)
    setAmount(newAmount.toString())
  }

  const handleMaxAmount = () => {
    // Leave a small buffer for fees
    const maxAmount = Math.max(0, balance - 0.5)
    setAmount(maxAmount.toFixed(2))
  }

  const handleDeposit = async () => {
    if (!isValidAmount || !hasEnoughForFee) return

    try {
      setStatus('pending-signature')
      setErrorMessage("")

      // Simulate signature request
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check if user might reject (simulation)
      if (Math.random() < 0.1) { // 10% chance of rejection for demo
        setStatus('signature-rejected')
        setErrorMessage("Firma rechazada por el usuario")
        return
      }

      setStatus('processing')
      
      // Call the deposit function
      const success = await deposit(amountValue)
      
      if (success) {
        setStatus('success')
        setTxHash(`a7b8c9d0e1f2${Math.random().toString(36).substr(2, 6)}`)
        
        // Auto close after success
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 3000)
      } else {
        setStatus('error')
        setErrorMessage("Error al procesar el depósito")
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  const getStatusInfo = () => {
    switch (status) {
      case 'pending-signature':
        return {
          icon: <Clock className="w-5 h-5 text-orange-500" />,
          title: "Esperando firma",
          message: "Firma la transacción en tu wallet Freighter",
          color: "bg-orange-500/10 border-orange-500/20"
        }
      case 'processing':
        return {
          icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
          title: "Procesando depósito",
          message: "Tu transacción está siendo confirmada en la red Stellar",
          color: "bg-blue-500/10 border-blue-500/20"
        }
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          title: "¡Depósito exitoso!",
          message: `Has depositado ${amountValue} USDC y recibido ${estimatedTickets} boletos`,
          color: "bg-green-500/10 border-green-500/20"
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          title: "Error en el depósito",
          message: errorMessage || "Ha ocurrido un error inesperado",
          color: "bg-red-500/10 border-red-500/20"
        }
      case 'signature-rejected':
        return {
          icon: <X className="w-5 h-5 text-red-500" />,
          title: "Firma rechazada",
          message: "Has cancelado la transacción",
          color: "bg-red-500/10 border-red-500/20"
        }
      default:
        return null
    }
  }

  const statusInfo = getStatusInfo()
  const isProcessing = ['pending-signature', 'processing'].includes(status)

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Depositar USDC</h3>
              <p className="text-xs text-muted-foreground">
                Deposita y participa automáticamente en sorteos
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
            disabled={isProcessing}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Display */}
        {statusInfo && (
          <Card className={statusInfo.color}>
            <div className="flex items-start gap-3">
              {statusInfo.icon}
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">{statusInfo.title}</h4>
                <p className="text-xs text-muted-foreground">{statusInfo.message}</p>
                {txHash && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Hash:</span>
                    <code className="text-xs bg-surface/50 px-2 py-1 rounded font-mono text-foreground">
                      {txHash}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Available Balance */}
        <div className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Saldo disponible</span>
          </div>
          <div className="text-sm font-semibold text-foreground">
            {balance.toFixed(2)} USDC
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Cantidad a depositar
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min={MINIMUM_DEPOSIT}
                max={balance}
                placeholder="0.00"
                className={`w-full p-4 pr-16 rounded-lg bg-background border text-foreground text-xl font-semibold ${
                  amount && !isValidAmount 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-border focus:border-accent'
                }`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing || status === 'success'}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                USDC
              </div>
            </div>

            {/* Validation Messages */}
            {amount && amountValue < MINIMUM_DEPOSIT && (
              <div className="flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3" />
                <span>Mínimo {MINIMUM_DEPOSIT} USDC</span>
              </div>
            )}
            {amount && amountValue > balance && (
              <div className="flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3" />
                <span>Saldo insuficiente</span>
              </div>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Atajos rápidos:</div>
            <div className="flex gap-2">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(quickAmount)}
                  disabled={isProcessing || status === 'success' || quickAmount > balance}
                  className="flex-1"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {quickAmount}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaxAmount}
                disabled={isProcessing || status === 'success' || balance < MINIMUM_DEPOSIT}
                className="flex-1"
              >
                Max
              </Button>
            </div>
          </div>

          {/* Deposit Info */}
          {amount && isValidAmount && (
            <div className="space-y-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <div className="text-xs font-medium text-foreground mb-2">Resumen del depósito:</div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Boletos que recibirás:</span>
                  <div className="font-semibold text-accent">{estimatedTickets} boletos</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Comisión estimada:</span>
                  <div className="font-semibold text-foreground">{ESTIMATED_FEE} XLM</div>
                </div>
              </div>

              {estimatedTickets > 0 && (
                <div className="text-xs text-muted-foreground">
                  • Cada 5 USDC = 1 boleto para sorteos
                  <br />
                  • Mayor depósito = mayor probabilidad de ganar
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleDeposit}
          disabled={!isValidAmount || !hasEnoughForFee || isProcessing || status === 'success'}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {status === 'pending-signature' ? 'Esperando firma...' : 'Procesando...'}
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Depósito completado
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4 mr-2" />
              Confirmar depósito
            </>
          )}
        </Button>

        {/* Educational Note */}
        <Card className="bg-green-500/5 border-green-500/20">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-medium text-foreground">Garantía de seguridad</div>
              <div className="text-xs text-muted-foreground">
                <strong>Siempre puedes retirar tu depósito.</strong> Tu dinero nunca está bloqueado. 
                Los premios provienen del rendimiento del pool, no de otros usuarios.
              </div>
            </div>
          </div>
        </Card>

        {/* Retry Button for Error States */}
        {(status === 'error' || status === 'signature-rejected') && (
          <Button
            variant="outline"
            onClick={() => {
              setStatus('idle')
              setErrorMessage("")
              setTxHash("")
            }}
            className="w-full"
          >
            Intentar de nuevo
          </Button>
        )}
      </div>
    </Card>
  )
}