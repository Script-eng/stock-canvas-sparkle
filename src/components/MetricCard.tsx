import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  change: string
  changeType: "increase" | "decrease" | "neutral"
  icon: LucideIcon
  subtitle?: string
  onClick?: () => void; // Added for interactivity
}

// THIS IS A NAMED EXPORT
export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  subtitle,
  onClick
}: MetricCardProps) {
  const badgeVariant = {
    increase: "default" as const,
    decrease: "destructive" as const,
    neutral: "secondary" as const
  }[changeType]

  const isClickable = !!onClick;

  return (
    <Card 
      onClick={onClick}
      className={`transition-shadow duration-200 ${
        isClickable ? 'cursor-pointer hover:shadow-lg hover:border-primary/50' : 'hover:shadow-md'
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-2 mt-2">
          {change && (
            <Badge variant={badgeVariant} className="text-xs">
              {change}
            </Badge>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}