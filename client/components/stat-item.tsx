interface StatItemProps {
  label: string
  value: string
  highlight?: boolean
}

export function StatItem({ label, value, highlight }: StatItemProps) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold tabular-nums ${highlight ? "text-accent" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  )
}
