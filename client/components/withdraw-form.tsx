"use client"

import { useState } from "react"
import { Card } from "@/components/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { useAppState, useBalance } from "@/hooks/use-app-state"
import { useOrbitSavePool } from "@/hooks/use-orbit-save"
import { 
  Wallet, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  X, 
  Loader2,
  ArrowUpCircle,
  DollarSign
} from "lucide-react"

interface WithdrawFormProps {
  onClose: () => void
  onSuccess?: () => void
}

type WithdrawStatus = 'idle' | 'pending-signature' | 'processing' | 'success' | 'error'

export function WithdrawForm({ onClose, onSuccess }: WithdrawFormProps) {
  const userBalance = useBalance() // Use the real balance from global state
  const { withdraw } = useOrbitSavePool()
  const { addTransaction, updateTransactionStatus } = useAppState()
  
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState<WithdrawStatus>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  const amountValue = parseFloat(amount) || 0
  const isValidAmount = amountValue > 0 && amountValue <= userBalance

  const handleWithdrawAll = () => {
    setAmount(userBalance.toString())
  }

  const handleWithdraw = async () => {
    if (!isValidAmount) return

    try {
      setStatus('pending-signature')
      setErrorMessage("")

      // Add transaction to state immediately as pending
      const txId = addTransaction({
        type: 'withdraw',
        amount: amountValue,
        status: 'pending'
      })

      // Simulate signature waiting
      await new Promise(resolve => setTimeout(resolve, 2000))

      setStatus('processing')
      
      // Call the withdraw function
      const success = await withdraw(amountValue)
      
      if (success) {
        setStatus('success')
        const mockTxHash = `w1x2y3z4${Math.random().toString(36).substr(2, 6)}`
        
        // Update transaction as confirmed
        updateTransactionStatus(txId, 'confirmed', mockTxHash)
        
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 2000)
      } else {
        setStatus('error')
        setErrorMessage("Error al procesar el retiro")
        updateTransactionStatus(txId, 'failed')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  const resetForm = () => {
    setStatus('idle')
    setErrorMessage("")
    setAmount("")
  }

  const isProcessing = ['pending-signature', 'processing'].includes(status)

  return (
    <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-red-500/5">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Retiro</h3>
              <p className="text-xs text-muted-foreground">
                Retira tus fondos depositados
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
        {status === 'pending-signature' && (
          <Card className="bg-orange-500/10 border-orange-500/30">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-500 animate-pulse" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Pendiente de firma</h4>
                <p className="text-xs text-muted-foreground">
                  Por favor firma la transacción en tu wallet Freighter
                </p>
              </div>
            </div>
          </Card>
        )}

        {status === 'processing' && (
          <Card className="bg-blue-500/10 border-blue-500/30">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Procesando</h4>
                <p className="text-xs text-muted-foreground">
                  Tu retiro está siendo procesado en la blockchain
                </p>
              </div>
            </div>
          </Card>
        )}

        {status === 'success' && (
          <Card className="bg-green-500/10 border-green-500/30">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">¡Éxito!</h4>
                <p className="text-xs text-muted-foreground">
                  Has retirado {amountValue} USDC exitosamente
                </p>
              </div>
            </div>
          </Card>
        )}

        {status === 'error' && (
          <Card className="bg-red-500/10 border-red-500/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Error</h4>
                <p className="text-xs text-muted-foreground">
                  {errorMessage || "Ha ocurrido un error al procesar el retiro"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Balance Depositado */}
        <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Balance depositado</div>
              <div className="text-xs text-muted-foreground">Disponible para retiro</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-foreground tabular-nums">
              {userBalance.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">USDC</div>
          </div>
        </div>

        {/* Input de Monto */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Cantidad a retirar
          </label>
          
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max={userBalance}
              placeholder="0.00"
              className={`w-full p-4 pr-20 rounded-lg bg-background border text-foreground text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                amount && !isValidAmount 
                  ? 'border-red-500' 
                  : 'border-border'
              }`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isProcessing || status === 'success'}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              USDC
            </div>
          </div>

          {/* Botón "Retirar todo" */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleWithdrawAll}
            disabled={isProcessing || status === 'success' || userBalance <= 0}
            className="w-full"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Retirar todo ({userBalance.toFixed(2)} USDC)
          </Button>

          {/* Validation Messages */}
          {amount && amountValue <= 0 && (
            <div className="flex items-center gap-2 text-red-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>La cantidad debe ser mayor a 0</span>
            </div>
          )}
          
          {amount && amountValue > userBalance && (
            <div className="flex items-center gap-2 text-red-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>No puedes retirar más de lo depositado</span>
            </div>
          )}
        </div>

        {/* Botón Primario: Confirmar retiro */}
        <Button
          onClick={handleWithdraw}
          disabled={!isValidAmount || isProcessing || status === 'success'}
          className="w-full"
          size="lg"
        >
          {status === 'pending-signature' ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-pulse" />
              Pendiente de firma
            </>
          ) : status === 'processing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              ¡Éxito!
            </>
          ) : (
            <>
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Confirmar retiro
            </>
          )}
        </Button>

        {/* Botón de retry para errores */}
        {status === 'error' && (
          <Button
            variant="outline"
            onClick={resetForm}
            className="w-full"
          >
            Intentar de nuevo
          </Button>
        )}

        {/* Info adicional */}
        {amount && isValidAmount && status === 'idle' && (
          <div className="text-xs text-muted-foreground text-center p-3 bg-muted/20 rounded-lg">
            Al retirar {amountValue} USDC perderás aproximadamente {Math.floor(amountValue / 5)} tickets de la lotería.
          </div>
        )}
      </div>
    </Card>
  )
}