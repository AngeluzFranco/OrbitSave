import { Rocket } from "lucide-react"
import { ConnectionStatus, NetworkIndicator } from "./ui-components"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">OrbitSave</span>
        </div>
        
        <div className="flex items-center gap-3">
          <NetworkIndicator />
          <ConnectionStatus />
        </div>
      </div>
    </header>
  )
}
