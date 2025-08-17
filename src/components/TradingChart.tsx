import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const chartData = [
  { time: "09:00", portfolio: 32000, market: 31500 },
  { time: "10:00", portfolio: 33200, market: 32100 },
  { time: "11:00", portfolio: 31800, market: 31900 },
  { time: "12:00", portfolio: 34500, market: 33200 },
  { time: "13:00", portfolio: 35100, market: 34100 },
  { time: "14:00", portfolio: 33900, market: 33800 },
  { time: "15:00", portfolio: 36200, market: 35400 },
  { time: "16:00", portfolio: 35800, market: 35100 }
]

export function TradingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Portfolio Performance</CardTitle>
        <p className="text-sm text-muted-foreground">Today's trading session</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              className="text-xs"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-xs"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="portfolio" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              name="Portfolio"
            />
            <Line 
              type="monotone" 
              dataKey="market" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 3 }}
              name="Market"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-sm text-muted-foreground">Portfolio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <span className="text-sm text-muted-foreground">Market</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}