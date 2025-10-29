"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/empty-state"
import { TransactionHistory } from "@/components/transaction-history"
import { useWallet } from "@/hooks/use-wallet"
import { useAppState } from "@/hooks/use-app-state"
import { useOrbitSavePool } from "@/hooks/use-orbit-save"
import { 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trophy, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Filter,
  Calendar,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Hash
} from "lucide-react"

type FilterType = 'all' | 'deposits' | 'withdrawals' | 'prizes'

export default function ActividadPage() {
  const { isConnected } = useWallet()
  const { state } = useAppState()
  const { poolData, recentTransactions } = useOrbitSavePool()
  const [filter, setFilter] = useState<FilterType>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filterTransactions = () => {
    const allTransactions = [...state.transactions, ...recentTransactions]
    switch (filter) {
      case 'deposits':
        return allTransactions.filter(tx => tx.type === 'deposit')
      case 'withdrawals':
        return allTransactions.filter(tx => tx.type === 'withdraw')
      case 'prizes':
        return allTransactions.filter(tx => tx.type === 'prize_won' || tx.type === 'prize' || tx.type === 'prize_lost')
      default:
        return allTransactions
    }
  }

  const getFilteredStats = () => {
    const filtered = filterTransactions()
    const totalAmount = filtered
      .filter(tx => tx.status === 'confirmed')
      .reduce((sum, tx) => {
        if (tx.type === 'deposit' || tx.type === 'prize_won' || tx.type === 'prize') {
          return sum + tx.amount
        } else if (tx.type === 'withdraw') {
          return sum - tx.amount
        }
        return sum
      }, 0)

    return {
      count: filtered.length,
      totalAmount,
      pending: filtered.filter(tx => tx.status === 'pending').length,
      failed: filtered.filter(tx => tx.status === 'failed').length
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const stats = getFilteredStats()

  if (!isConnected) {
    return (
      <div className="pb-20 px-4 pt-6 space-y-4">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-foreground">Actividad</h1>
          <p className="text-sm text-muted-foreground">Historial de transacciones y premios</p>
        </div>
        
        <EmptyState
          icon={Activity}
          title="Conecta tu wallet"
          description="Conecta tu wallet para ver tu historial de actividad y transacciones"
        />
      </div>
    )
  }

  return (
    <div className="pb-20 px-4 pt-6 space-y-6">
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Actividad</h1>
            <p className="text-sm text-muted-foreground">
              {stats.count} transacciones registradas
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="shrink-0"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-surface/80">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Balance neto</span>
            </div>
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {stats.totalAmount >= 0 ? '+' : ''}{stats.totalAmount.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">USDC total</div>
          </div>
        </Card>

        <Card className="bg-surface/80">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Transacciones</span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-foreground">{stats.count}</div>
              {stats.pending > 0 && (
                <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-500">
                  {stats.pending} pendientes
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">Total realizadas</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-surface/50">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtrar por tipo</span>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Todas', icon: Activity },
              { key: 'deposits', label: 'Depósitos', icon: ArrowDownLeft },
              { key: 'withdrawals', label: 'Retiros', icon: ArrowUpRight },
              { key: 'prizes', label: 'Premios', icon: Trophy }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(key as FilterType)}
                className="text-xs"
              >
                <Icon className="w-3 h-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-accent/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Acciones rápidas</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <ArrowDownLeft className="w-3 h-3 mr-2" />
              Depositar más
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <ExternalLink className="w-3 h-3 mr-2" />
              Ver en explorer
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Historial de transacciones
          </h2>
          {stats.failed > 0 && (
            <Badge variant="destructive" className="text-xs">
              {stats.failed} fallidas
            </Badge>
          )}
        </div>

        {filterTransactions().length === 0 ? (
          <Card className="bg-surface/50">
            <EmptyState
              icon={filter === 'all' ? Activity : 
                    filter === 'deposits' ? ArrowDownLeft :
                    filter === 'withdrawals' ? ArrowUpRight : Trophy}
              title={`No hay ${filter === 'all' ? 'transacciones' : 
                               filter === 'deposits' ? 'depósitos' :
                               filter === 'withdrawals' ? 'retiros' : 'premios'}`}
              description={`Aún no has realizado ${filter === 'all' ? 'ninguna transacción' :
                                                   filter === 'deposits' ? 'ningún depósito' :
                                                   filter === 'withdrawals' ? 'ningún retiro' : 'ganado premios'}`}
              compact
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {filterTransactions().slice(0, 20).map((transaction, index) => (
              <TransactionCard key={transaction.id || index} transaction={transaction} />
            ))}
            
            {filterTransactions().length > 20 && (
              <Card className="bg-surface/50">
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Mostrando las primeras 20 transacciones
                  </p>
                  <Button variant="outline" size="sm">
                    Ver todas las transacciones
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Activity Summary */}
      <Card className="bg-surface/50">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Resumen de actividad</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Primera transacción:</span>
              <div className="text-foreground">
                {state.transactions.length > 0 
                  ? state.transactions[state.transactions.length - 1].date.toLocaleDateString('es-ES')
                  : 'No disponible'
                }
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Última actividad:</span>
              <div className="text-foreground">
                {state.lastActivityUpdate.toLocaleDateString('es-ES')}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Total depositado:</span>
              <div className="text-foreground">{state.totalDeposited.toFixed(2)} USDC</div>
            </div>
            <div>
              <span className="text-muted-foreground">Tickets activos:</span>
              <div className="text-foreground">{state.totalTickets}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function TransactionCard({ transaction }: { transaction: any }) {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />
      case 'withdraw':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />
      case 'prize_won':
      case 'prize':
        return <Trophy className="w-4 h-4 text-yellow-500" />
      case 'prize_lost':
        return <XCircle className="w-4 h-4 text-gray-500" />
      default:
        return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'confirmed':
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'pending':
        return <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />
      case 'failed':
        return <XCircle className="w-3 h-3 text-red-500" />
      default:
        return <AlertCircle className="w-3 h-3 text-gray-500" />
    }
  }

  const getTransactionLabel = () => {
    switch (transaction.type) {
      case 'deposit':
        return 'Depósito'
      case 'withdraw':
        return 'Retiro'
      case 'prize_won':
      case 'prize':
        return 'Premio ganado'
      case 'prize_lost':
        return 'Premio perdido'
      default:
        return 'Transacción'
    }
  }

  const formatAmount = () => {
    const sign = transaction.type === 'deposit' || transaction.type === 'prize_won' || transaction.type === 'prize' ? '+' : '-'
    return `${sign}${transaction.amount.toFixed(2)} USDC`
  }

  return (
    <Card className="bg-surface/80 hover:bg-surface/90 transition-colors">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center">
              {getTransactionIcon()}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {getTransactionLabel()}
              </div>
              <div className="text-xs text-muted-foreground">
                {transaction.date.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-semibold tabular-nums ${
              transaction.type === 'deposit' || transaction.type === 'prize_won' || transaction.type === 'prize' 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {formatAmount()}
            </div>
            <div className="flex items-center gap-1 justify-end">
              {getStatusIcon()}
              <span className="text-xs text-muted-foreground capitalize">
                {transaction.status === 'confirmed' ? 'Confirmada' : 
                 transaction.status === 'pending' ? 'Pendiente' : 'Fallida'}
              </span>
            </div>
          </div>
        </div>

        {transaction.hash && transaction.hash !== 'pending...' && (
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Hash className="w-3 h-3 text-muted-foreground" />
              <code className="text-xs font-mono text-muted-foreground">
                {transaction.hash.length > 16 
                  ? `${transaction.hash.slice(0, 8)}...${transaction.hash.slice(-8)}`
                  : transaction.hash
                }
              </code>
            </div>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Ver
            </Button>
          </div>
        )}

        {transaction.tickets && transaction.tickets > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <Trophy className="w-3 h-3 text-accent" />
            <span className="text-xs text-muted-foreground">
              +{transaction.tickets} tickets generados
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}