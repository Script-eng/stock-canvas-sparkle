import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react"

interface Activity {
  id: string
  type: "trade" | "alert" | "news" | "system"
  title: string
  description: string
  timestamp: string
  status?: "success" | "warning" | "error"
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "trade",
    title: "Trade Executed",
    description: "Bought 100 shares of AAPL at $175.20",
    timestamp: "2 min ago",
    status: "success"
  },
  {
    id: "2", 
    type: "alert",
    title: "Price Alert Triggered",
    description: "TSLA reached your target price of $680.00",
    timestamp: "8 min ago",
    status: "warning"
  },
  {
    id: "3",
    type: "trade", 
    title: "Order Cancelled",
    description: "Sell order for MSFT cancelled by user",
    timestamp: "15 min ago",
    status: "error"
  },
  {
    id: "4",
    type: "news",
    title: "Market Update",
    description: "Tech sector showing strong gains in afternoon trading",
    timestamp: "23 min ago"
  },
  {
    id: "5",
    type: "system",
    title: "Account Verified", 
    description: "Your identity verification has been completed",
    timestamp: "1 hour ago",
    status: "success"
  }
]

function getActivityIcon(type: Activity["type"], status?: Activity["status"]) {
  switch (type) {
    case "trade":
      return status === "success" 
        ? <CheckCircle className="w-4 h-4 text-success" />
        : status === "error"
        ? <AlertCircle className="w-4 h-4 text-destructive" />
        : <TrendingUp className="w-4 h-4 text-primary" />
    case "alert":
      return <AlertCircle className="w-4 h-4 text-warning" />
    case "news":
      return <TrendingUp className="w-4 h-4 text-accent" />
    case "system":
      return <CheckCircle className="w-4 h-4 text-success" />
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />
  }
}

function getStatusBadge(status?: Activity["status"]) {
  if (!status) return null
  
  switch (status) {
    case "success":
      return <Badge className="bg-success text-success-foreground text-xs">Success</Badge>
    case "warning":
      return <Badge className="bg-warning text-warning-foreground text-xs">Alert</Badge>
    case "error":
      return <Badge variant="destructive" className="text-xs">Error</Badge>
  }
}

export function ActivityFeed() {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Latest updates and notifications</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockActivities.map((activity, index) => (
          <div key={activity.id} className="flex items-start gap-3 group">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type, activity.status)}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                  {activity.title}
                </h4>
                {getStatusBadge(activity.status)}
              </div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {activity.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <button className="text-sm text-primary hover:text-primary/80 font-medium">
            View all activities →
          </button>
        </div>
      </CardContent>
    </Card>
  )
}