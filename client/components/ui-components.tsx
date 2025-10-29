"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/use-wallet"
import { useOrbitSavePool } from "@/hooks/use-orbit-save"
import { AlertCircle, CheckCircle, Clock, Loader2, ExternalLink, Copy } from "lucide-react"

interface NotificationProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  onDismiss?: () => void
}

export function Notification({ 
  type, 
  title, 
  message, 
  action, 
  dismissible = true, 
  onDismiss 
}: NotificationProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20'
      case 'warning':
        return 'bg-orange-500/10 border-orange-500/20'
      case 'error':
        return 'bg-red-500/10 border-red-500/20'
      default:
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <Card className={`${getBgColor()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{message}</p>
          {action && (
            <Button variant="ghost" size="sm" onClick={action.onClick} className="h-6 px-2 text-xs">
              {action.label}
            </Button>
          )}
        </div>
        {dismissible && onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss} className="h-6 w-6 p-0">
            ✕
          </Button>
        )}
      </div>
    </Card>
  )
}

interface ConnectionStatusProps {
  className?: string
}

export function ConnectionStatus({ className = "" }: ConnectionStatusProps) {
  const { isConnected, isFreighterInstalled, address } = useWallet()
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-xs text-muted-foreground">Desconectado</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-xs text-foreground">Conectado</span>
      {address && (
        <Button
          variant="ghost"
          size="sm"
          onClick={copyAddress}
          className="h-5 px-1 text-xs font-mono"
        >
          {address.slice(0, 4)}...{address.slice(-4)}
          {copied ? (
            <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
          ) : (
            <Copy className="w-3 h-3 ml-1" />
          )}
        </Button>
      )}
    </div>
  )
}

interface TransactionStatusProps {
  status: 'pending' | 'confirmed' | 'failed'
  hash?: string
  type?: 'deposit' | 'withdraw' | 'prize'
}

export function TransactionStatus({ status, hash, type }: TransactionStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />,
          text: 'Procesando...',
          color: 'text-orange-500'
        }
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          text: 'Confirmado',
          color: 'text-green-500'
        }
      case 'failed':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-500" />,
          text: 'Fallido',
          color: 'text-red-500'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="flex items-center gap-2">
      {statusInfo.icon}
      <span className={`text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
      {hash && hash !== 'pending...' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${hash}`, '_blank')}
        >
          <ExternalLink className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}

interface NetworkIndicatorProps {
  className?: string
}

export function NetworkIndicator({ className = "" }: NetworkIndicatorProps) {
  const [network] = useState('Testnet') // In real app, get from wallet

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      <span className="text-xs text-muted-foreground">Stellar {network}</span>
    </div>
  )
}

interface PoolHealthIndicatorProps {
  className?: string
}

export function PoolHealthIndicator({ className = "" }: PoolHealthIndicatorProps) {
  const { poolData } = useOrbitSavePool()
  const [health, setHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy')

  useEffect(() => {
    // Simple health calculation based on pool size and participants
    const participantRatio = poolData.totalDeposited / poolData.totalParticipants
    
    if (participantRatio < 10) {
      setHealth('critical')
    } else if (participantRatio < 25) {
      setHealth('warning')
    } else {
      setHealth('healthy')
    }
  }, [poolData])

  const getHealthInfo = () => {
    switch (health) {
      case 'healthy':
        return {
          color: 'bg-green-500',
          text: 'Pool saludable',
          textColor: 'text-green-500'
        }
      case 'warning':
        return {
          color: 'bg-orange-500',
          text: 'Pool moderado',
          textColor: 'text-orange-500'
        }
      case 'critical':
        return {
          color: 'bg-red-500',
          text: 'Pool bajo',
          textColor: 'text-red-500'
        }
    }
  }

  const healthInfo = getHealthInfo()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 ${healthInfo.color} rounded-full`}></div>
      <span className={`text-xs ${healthInfo.textColor}`}>{healthInfo.text}</span>
    </div>
  )
}