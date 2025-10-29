"use client"

import { useEffect, useState } from "react"
import { Clock, Timer } from "lucide-react"

interface CountdownProps {
  targetDate: Date
  large?: boolean
}

export function Countdown({ targetDate, large = false }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = targetDate.getTime() - Date.now()
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const formatTime = (num: number) => String(num).padStart(2, "0")

  if (large) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Timer className="w-4 h-4" />
          <span className="text-sm font-medium">Tiempo restante</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {formatTime(timeLeft.days)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Días</div>
          </div>
          <div className="text-center p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {formatTime(timeLeft.hours)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Horas</div>
          </div>
          <div className="text-center p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {formatTime(timeLeft.minutes)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Min</div>
          </div>
          <div className="text-center p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="text-2xl font-bold text-accent tabular-nums">
              {formatTime(timeLeft.seconds)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Seg</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <Clock className="w-5 h-5 text-accent flex-shrink-0" />
      <div
        className="font-bold tabular-nums text-2xl text-foreground"
        role="timer"
        aria-label={`Tiempo restante: ${timeLeft.days} días, ${timeLeft.hours} horas, ${timeLeft.minutes} minutos, ${timeLeft.seconds} segundos`}
      >
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </div>
    </div>
  )
}
