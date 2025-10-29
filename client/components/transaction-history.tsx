"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useOrbitSavePool } from "@/hooks/use-orbit-save"
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Trophy, 
  ExternalLink, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  History
} from "lucide-react"

interface TransactionHistoryProps {
  className?: string
  limit?: number
}

export function TransactionHistory({ className = "", limit = 5 }: TransactionHistoryProps) {
  const { recentTransactions } = useOrbitSavePool()
  const [expandedTx, setExpandedTx] = useState<string | null>(null)

  const displayTransactions = limit ? recentTransactions.slice(0, limit) : recentTransactions

  const getTransactionIcon = (type: string, status: string) => {
    const iconClass = "w-4 h-4"
    
    if (status === 'pending') {
      return <Loader2 className={`${iconClass} text-orange-500 animate-spin`} />
    }
    
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className={`${iconClass} text-green-500`} />
      case 'withdraw':
        return <ArrowUpCircle className={`${iconClass} text-orange-500`} />
      case 'prize':
        return <Trophy className={`${iconClass} text-accent`} />
      default:
        return <Clock className={`${iconClass} text-muted-foreground`} />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-xs">
            Pendiente
          </Badge>
        )
      case 'confirmed':
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
            Confirmado
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="secondary" className="bg-red-500/20 text-red-500 border-red-500/30 text-xs">
            Fallido
          </Badge>
        )
      default:
        return null
    }
  }

  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Depósito'
      case 'withdraw':
        return 'Retiro'
      case 'prize':
        return 'Premio ganado'
      default:
        return 'Transacción'
    }
  }

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'prize':
        return 'text-green-500'
      case 'withdraw':
        return 'text-orange-500'
      default:
        return 'text-foreground'
    }
  }

  const formatAmount = (type: string, amount: number) => {
    const prefix = type === 'withdraw' ? '-' : '+'
    return `${prefix}${amount.toFixed(2)} USDC`
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    if (days < 7) return `Hace ${days}d`
    return date.toLocaleDateString()
  }

  if (displayTransactions.length === 0) {
    return (
      <Card className={`bg-surface/50 ${className}`}>
        <div className="text-center py-6">
          <History className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">
            No hay transacciones recientes
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Realiza tu primer depósito para empezar
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`bg-surface/50 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <History className="w-4 h-4 text-accent" />
            Transacciones recientes
          </h3>
          {limit && recentTransactions.length > limit && (
            <Button variant="ghost" size="sm" className="text-xs">
              Ver todas
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {displayTransactions.map((transaction) => (
            <div key={transaction.id} className="space-y-2">
              <div 
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                onClick={() => setExpandedTx(expandedTx === transaction.id ? null : transaction.id)}
              >
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.type, transaction.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {getTransactionTitle(transaction.type)}
                    </span>
                    {getStatusBadge(transaction.status)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(transaction.date)}
                  </div>
                </div>

                <div className={`text-sm font-semibold tabular-nums ${getAmountColor(transaction.type)}`}>
                  {formatAmount(transaction.type, transaction.amount)}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedTx === transaction.id && (
                <div className="ml-7 p-3 bg-background/30 rounded-lg border border-border/50">
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Fecha completa:</span>
                        <div className="font-medium text-foreground">
                          {transaction.date.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Estado:</span>
                        <div className={`font-medium ${
                          transaction.status === 'confirmed' ? 'text-green-500' :
                          transaction.status === 'pending' ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {transaction.status === 'confirmed' ? 'Confirmado' :
                           transaction.status === 'pending' ? 'Pendiente' : 'Fallido'}
                        </div>
                      </div>
                    </div>

                    {transaction.hash && transaction.hash !== 'pending...' && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Hash de transacción:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-surface/50 px-2 py-1 rounded font-mono text-foreground flex-1">
                            {transaction.hash}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`https://stellar.expert/explorer/testnet/tx/${transaction.hash}`, '_blank')
                            }}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Additional info based on transaction type */}
                    {transaction.type === 'deposit' && (
                      <div className="text-xs text-muted-foreground">
                        • Boletos ganados: {Math.floor(transaction.amount / 5)}
                        <br />
                        • Participación automática en sorteos habilitada
                      </div>
                    )}

                    {transaction.type === 'withdraw' && (
                      <div className="text-xs text-muted-foreground">
                        • Boletos perdidos: {Math.floor(transaction.amount / 5)}
                        <br />
                        • Fondos enviados a tu wallet
                      </div>
                    )}

                    {transaction.type === 'prize' && (
                      <div className="text-xs text-accent">
                        • ¡Felicidades por ganar este premio!
                        <br />
                        • Los premios se depositan automáticamente
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live updates indicator */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">
            Actualizaciones en tiempo real
          </span>
        </div>
      </div>
    </Card>
  )
}