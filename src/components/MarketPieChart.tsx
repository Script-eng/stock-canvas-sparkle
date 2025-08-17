import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const portfolioData = [
  { name: 'Technology', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Healthcare', value: 25, color: 'hsl(var(--accent))' },
  { name: 'Finance', value: 20, color: 'hsl(var(--warning))' },
  { name: 'Energy', value: 12, color: 'hsl(var(--success))' },
  { name: 'Consumer', value: 8, color: 'hsl(var(--destructive))' }
]

export function MarketPieChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Portfolio Allocation</CardTitle>
        <p className="text-sm text-muted-foreground">By sector distribution</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={portfolioData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {portfolioData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => [`${value}%`, 'Allocation']}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Custom Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {portfolioData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">{entry.name}</span>
              <span className="text-sm font-medium ml-auto">{entry.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}