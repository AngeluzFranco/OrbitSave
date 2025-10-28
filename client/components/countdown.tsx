"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

interface CountdownProps {
  targetDate: Date
  large?: boolean
}

export function Countdown({ targetDate, large = false }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = targetDate.getTime() - Date.now()
    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 }
    }

    return {
      hours: Math.floor(difference / (1000 * 60 * 60)),
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

  return (
    <div className="flex items-center justify-center gap-3">
      <Clock className={`${large ? "w-6 h-6" : "w-5 h-5"} text-accent flex-shrink-0`} />
      <div
        className={`font-bold tabular-nums ${large ? "text-4xl" : "text-2xl"} text-foreground`}
        role="timer"
        aria-label={`Tiempo restante: ${timeLeft.hours} horas, ${timeLeft.minutes} minutos, ${timeLeft.seconds} segundos`}
      >
        {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </div>
    </div>
  )
}
