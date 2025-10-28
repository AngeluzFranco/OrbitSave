"use client"

import { Card } from "@/components/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/use-wallet"
import { Wallet, Network, Moon, Bell, Download, HelpCircle, LogOut, ChevronRight, Shield } from "lucide-react"

export default function PerfilPage() {
  const { isConnected, address, network } = useWallet()

  if (!isConnected) {
    return (
      <div className="pb-20 px-4 pt-6 space-y-4">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
        </div>
        <Card className="bg-surface/50">
          <div className="text-center space-y-4 py-8">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Wallet no conectada</h3>
              <p className="text-sm text-muted-foreground">Conecta tu wallet para acceder a tu perfil</p>
            </div>
            <Button className="mt-4">Conectar Freighter</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="pb-20 px-4 pt-6 space-y-4">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
        <p className="text-sm text-muted-foreground">Configuración y preferencias</p>
      </div>

      {/* Wallet Info */}
      <Card className="bg-gradient-to-br from-primary/10 via-surface to-accent/5 border-accent/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">Wallet conectada</div>
              <code className="text-xs text-muted-foreground font-mono">{address}</code>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-sm text-muted-foreground">Red</span>
            <Badge variant="outline" className="text-xs">
              {network}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Wallet Actions */}
      <Card className="bg-surface/50">
        <div className="space-y-2">
          <SettingItem icon={Network} label="Cambiar red" badge="Próximamente" />
          <SettingItem icon={LogOut} label="Desconectar wallet" danger />
        </div>
      </Card>

      {/* Preferences */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground px-1">Preferencias</h2>
        <Card className="bg-surface/50">
          <div className="space-y-2">
            <SettingItem icon={Moon} label="Tema" value="Oscuro" />
            <SettingItem icon={Bell} label="Notificaciones" badge="Web Push" />
          </div>
        </Card>
      </div>

      {/* PWA */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground px-1">Aplicación</h2>
        <Card className="bg-surface/50">
          <div className="space-y-2">
            <SettingItem icon={Download} label="Instalar app" />
            <SettingItem icon={Shield} label="Uso offline" badge="Habilitado" />
          </div>
        </Card>
      </div>

      {/* Help */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground px-1">Ayuda</h2>
        <Card className="bg-surface/50">
          <div className="space-y-2">
            <SettingItem icon={HelpCircle} label="¿Cómo funciona?" />
            <SettingItem icon={Shield} label="Seguridad y transparencia" />
          </div>
        </Card>
      </div>

      {/* Legal */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Educativo. Sin garantía de rendimiento real en MVP. Los sorteos son simulados con fines demostrativos.
        </p>
      </div>
    </div>
  )
}

function SettingItem({
  icon: Icon,
  label,
  value,
  badge,
  danger,
}: {
  icon: any
  label: string
  value?: string
  badge?: string
  danger?: boolean
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background/50 transition-colors ${
        danger ? "text-error" : "text-foreground"
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium flex-1 text-left">{label}</span>
      {value && <span className="text-sm text-muted-foreground">{value}</span>}
      {badge && (
        <Badge variant="outline" className="text-xs">
          {badge}
        </Badge>
      )}
      {!badge && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </button>
  )
}
