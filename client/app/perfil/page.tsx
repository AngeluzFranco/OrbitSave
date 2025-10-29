"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/use-wallet"
import { 
  Wallet, 
  Network, 
  Moon, 
  Sun,
  Monitor,
  Bell, 
  Download, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Shield,
  Globe,
  Wifi,
  WifiOff,
  CheckCircle,
  Settings,
  User,
  Copy,
  ExternalLink,
  AlertCircle,
  Info
} from "lucide-react"

type Theme = 'light' | 'dark' | 'system'

export default function PerfilPage() {
  const { isConnected, address, disconnect } = useWallet()
  const [theme, setTheme] = useState<Theme>('system')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)

  useEffect(() => {
    // Check PWA installation status
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    setIsInstalled(isInStandaloneMode)
    
    // Check if PWA can be installed
    const checkInstallPrompt = () => {
      setCanInstall(!isInStandaloneMode && 'serviceWorker' in navigator)
    }
    
    // Check online status
    setIsOnline(navigator.onLine)
    
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') as Theme || 'system'
    setTheme(savedTheme)
    
    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }

    checkInstallPrompt()
    
    // Listen for online/offline changes
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))
    
    return () => {
      window.removeEventListener('online', () => setIsOnline(true))
      window.removeEventListener('offline', () => setIsOnline(false))
    }
  }, [])

  const maskAddress = (addr: string) => {
    if (!addr || addr.length <= 8) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      // You could add a toast notification here
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setShowDisconnectConfirm(false)
  }

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    
    // Apply theme immediately
    const root = document.documentElement
    if (nextTheme === 'dark') {
      root.classList.add('dark')
    } else if (nextTheme === 'light') {
      root.classList.remove('dark')
    } else {
      // System theme - check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Este navegador no soporta notificaciones')
      return
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(false)
      // In a real app, you'd unsubscribe from push notifications here
    } else if (Notification.permission === 'denied') {
      alert('Las notificaciones están bloqueadas. Cambia la configuración en tu navegador.')
    } else {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === 'granted')
    }
  }

  const installPWA = () => {
    // In a real implementation, you'd store the beforeinstallprompt event
    // and trigger it here. For now, show instructions.
    alert('Para instalar: Ve al menú de tu navegador y selecciona "Instalar OrbitSave" o "Agregar a pantalla de inicio"')
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun
      case 'dark': return Moon
      case 'system': return Monitor
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Claro'
      case 'dark': return 'Oscuro'
      case 'system': return 'Sistema'
    }
  }

  if (!isConnected) {
    return (
      <div className="pb-20 px-4 pt-6 space-y-4">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
          <p className="text-sm text-muted-foreground">Configuración de cuenta y preferencias</p>
        </div>
        
        <Card className="bg-surface/50">
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Wallet no conectada</h3>
              <p className="text-sm text-muted-foreground">
                Conecta tu wallet Freighter para acceder a tu perfil y configuración
              </p>
            </div>
            <Button className="mt-4">
              <Wallet className="w-4 h-4 mr-2" />
              Conectar Freighter
            </Button>
          </div>
        </Card>

        {/* Even when not connected, show some preferences */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground px-1">Preferencias básicas</h2>
            <Card className="bg-surface/50">
              <div className="space-y-2">
                <SettingItem 
                  icon={getThemeIcon()} 
                  label="Tema" 
                  value={getThemeLabel()} 
                  onClick={toggleTheme}
                />
                <SettingItem 
                  icon={Globe} 
                  label="Idioma" 
                  value="Español" 
                  badge="Próximamente"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 px-4 pt-6 space-y-6">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
        <p className="text-sm text-muted-foreground">Configuración de cuenta y preferencias</p>
      </div>

      {/* Wallet conectada: dirección abreviada, red */}
      <Card className="bg-gradient-to-br from-primary/10 via-surface to-accent/5 border-accent/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">Wallet conectada</div>
              <div className="flex items-center gap-2">
                <code className="text-sm text-muted-foreground font-mono">
                  {maskAddress(address || '')}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={copyAddress}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-green-500 font-medium">Activa</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Red</span>
            </div>
            <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-500 border-orange-500/30">
              Stellar Testnet
            </Badge>
          </div>
        </div>
      </Card>

      {/* Botones: Cambiar red, Desconectar */}
      <Card className="bg-surface/50">
        <div className="space-y-2">
          <SettingItem 
            icon={Network} 
            label="Cambiar red" 
            badge="Próximamente"
            disabled
          />
          <SettingItem 
            icon={LogOut} 
            label="Desconectar wallet" 
            danger
            onClick={() => setShowDisconnectConfirm(true)}
          />
        </div>
      </Card>

      {/* Preferencias: Tema, Notificaciones, i18n futuro */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground px-1 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Preferencias
        </h2>
        <Card className="bg-surface/50">
          <div className="space-y-2">
            <SettingItem 
              icon={getThemeIcon()} 
              label="Tema" 
              value={getThemeLabel()} 
              onClick={toggleTheme}
            />
            <SettingItem 
              icon={Bell} 
              label="Notificaciones" 
              value={notificationsEnabled ? "Habilitadas" : "Deshabilitadas"}
              badge="Web Push"
              onClick={toggleNotifications}
            />
            <SettingItem 
              icon={Globe} 
              label="Idioma" 
              value="Español"
              badge="Próximamente"
              disabled
            />
          </div>
        </Card>
      </div>

      {/* PWA: Instalar app, uso offline */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground px-1 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Aplicación
        </h2>
        <Card className="bg-surface/50">
          <div className="space-y-2">
            {!isInstalled && (
              <SettingItem 
                icon={Download} 
                label="Instalar app" 
                value={canInstall ? "Disponible" : "No disponible"}
                onClick={canInstall ? installPWA : undefined}
                disabled={!canInstall}
              />
            )}
            {isInstalled && (
              <SettingItem 
                icon={CheckCircle} 
                label="App instalada" 
                value="Activa"
                badge="PWA"
              />
            )}
            <SettingItem 
              icon={isOnline ? Wifi : WifiOff} 
              label="Uso offline" 
              value={isOnline ? "En línea" : "Sin conexión"}
              badge="Cache local"
              info="Los datos se guardan localmente para uso sin internet"
            />
          </div>
        </Card>
      </div>

      {/* Ayuda/FAQ */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground px-1 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Ayuda y soporte
        </h2>
        <Card className="bg-surface/50">
          <div className="space-y-2">
            <SettingItem 
              icon={HelpCircle} 
              label="¿Cómo funciona?" 
              info="Guía paso a paso sobre Prize-Linked Savings"
            />
            <SettingItem 
              icon={Shield} 
              label="Seguridad y transparencia" 
              info="Información sobre smart contracts y auditorías"
            />
            <SettingItem 
              icon={ExternalLink} 
              label="Documentación técnica" 
              info="GitHub, contratos, y recursos para desarrolladores"
            />
          </div>
        </Card>
      </div>

      {/* App Info */}
      <Card className="bg-muted/20">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Información de la app</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Versión:</span>
              <div className="font-mono text-foreground">v1.0.0-beta</div>
            </div>
            <div>
              <span className="text-muted-foreground">Red:</span>
              <div className="text-foreground">Stellar Testnet</div>
            </div>
            <div>
              <span className="text-muted-foreground">Estado:</span>
              <div className="text-green-500">Operativo</div>
            </div>
            <div>
              <span className="text-muted-foreground">Modo:</span>
              <div className="text-foreground">Demostración</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Legal disclaimer */}
      <div className="text-center py-4 space-y-2">
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          <strong>Aplicación educativa.</strong> Los sorteos y rendimientos son simulados con fines demostrativos. 
          No usar con fondos reales en testnet.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>© 2025 OrbitSave</span>
          <span>•</span>
          <span>MIT License</span>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-sm w-full">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Desconectar wallet</h3>
                  <p className="text-xs text-muted-foreground">Esta acción cerrará tu sesión</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                ¿Estás seguro de que quieres desconectar tu wallet? Tendrás que volver a conectarla para usar OrbitSave.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setShowDisconnectConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleDisconnect}
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Desconectar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function SettingItem({
  icon: Icon,
  label,
  value,
  badge,
  danger,
  disabled,
  info,
  onClick,
}: {
  icon: any
  label: string
  value?: string
  badge?: string
  danger?: boolean
  disabled?: boolean
  info?: string
  onClick?: () => void
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
        disabled 
          ? "opacity-50 cursor-not-allowed" 
          : onClick 
            ? "hover:bg-background/50 cursor-pointer" 
            : "cursor-default"
      } ${danger ? "text-red-500" : "text-foreground"}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1 text-left">
        <div className="text-sm font-medium">{label}</div>
        {info && (
          <div className="text-xs text-muted-foreground">{info}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-muted-foreground">{value}</span>}
        {badge && (
          <Badge variant="outline" className="text-xs">
            {badge}
          </Badge>
        )}
        {onClick && !badge && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </div>
    </button>
  )
}
