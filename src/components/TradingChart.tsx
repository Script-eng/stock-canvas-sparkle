import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Maximize2, TrendingUp, TrendingDown } from "lucide-react"

const chartData = {
  "1D": [
    { time: "09:00", portfolio: 32000, market: 31500 },
    { time: "10:00", portfolio: 33200, market: 32100 },
    { time: "11:00", portfolio: 31800, market: 31900 },
    { time: "12:00", portfolio: 34500, market: 33200 },
    { time: "13:00", portfolio: 35100, market: 34100 },
    { time: "14:00", portfolio: 33900, market: 33800 },
    { time: "15:00", portfolio: 36200, market: 35400 },
    { time: "16:00", portfolio: 35800, market: 35100 }
  ],
  "1W": [
    { time: "Mon", portfolio: 32000, market: 31500 },
    { time: "Tue", portfolio: 33500, market: 32800 },
    { time: "Wed", portfolio: 31200, market: 31100 },
    { time: "Thu", portfolio: 34800, market: 33900 },
    { time: "Fri", portfolio: 36200, market: 35400 },
    { time: "Sat", portfolio: 35900, market: 35200 },
    { time: "Sun", portfolio: 36800, market: 36100 }
  ],
  "1M": [
    { time: "Week 1", portfolio: 30000, market: 29800 },
    { time: "Week 2", portfolio: 32500, market: 31900 },
    { time: "Week 3", portfolio: 31800, market: 31200 },
    { time: "Week 4", portfolio: 36200, market: 35400 }
  ],
  "1Y": [
    { time: "Jan", portfolio: 25000, market: 24500 },
    { time: "Mar", portfolio: 28000, market: 27200 },
    { time: "May", portfolio: 32000, market: 31100 },
    { time: "Jul", portfolio: 30500, market: 30800 },
    { time: "Sep", portfolio: 34000, market: 33200 },
    { time: "Nov", portfolio: 36200, market: 35400 }
  ]
}

interface ChartComponentProps {
  data: typeof chartData["1D"]
  height?: number
  showStats?: boolean
}

function ChartComponent({ data, height = 300, showStats = false }: ChartComponentProps) {
  const latestData = data[data.length - 1]
  const firstData = data[0]
  const portfolioChange = ((latestData.portfolio - firstData.portfolio) / firstData.portfolio) * 100
  const marketChange = ((latestData.market - firstData.market) / firstData.market) * 100

  return (
    <div>
      {showStats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-medium">Portfolio Performance</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">${latestData.portfolio.toLocaleString()}</div>
              <div className={`text-sm ${portfolioChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {portfolioChange >= 0 ? '+' : ''}{portfolioChange.toFixed(2)}% change
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-accent" />
              <span className="font-medium">Market Benchmark</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">${latestData.market.toLocaleString()}</div>
              <div className={`text-sm ${marketChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {marketChange >= 0 ? '+' : ''}{marketChange.toFixed(2)}% change
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
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
    </div>
  )
}

export function TradingChart() {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [activeTimeRange, setActiveTimeRange] = useState<keyof typeof chartData>("1D")

  return (
    <>
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group" onClick={() => setIsFullScreen(true)}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Portfolio Performance</CardTitle>
            <p className="text-sm text-muted-foreground">Today's trading session</p>
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ChartComponent data={chartData["1D"]} />
        </CardContent>
      </Card>

      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold">Portfolio Performance Analysis</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            <Tabs value={activeTimeRange} onValueChange={(value) => setActiveTimeRange(value as keyof typeof chartData)}>
              <div className="flex items-center justify-between mb-6">
                <TabsList className="grid w-fit grid-cols-4">
                  <TabsTrigger value="1D">1 Day</TabsTrigger>
                  <TabsTrigger value="1W">1 Week</TabsTrigger>
                  <TabsTrigger value="1M">1 Month</TabsTrigger>
                  <TabsTrigger value="1Y">1 Year</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="1D" className="mt-0">
                <ChartComponent data={chartData["1D"]} height={400} showStats={true} />
              </TabsContent>
              <TabsContent value="1W" className="mt-0">
                <ChartComponent data={chartData["1W"]} height={400} showStats={true} />
              </TabsContent>
              <TabsContent value="1M" className="mt-0">
                <ChartComponent data={chartData["1M"]} height={400} showStats={true} />
              </TabsContent>
              <TabsContent value="1Y" className="mt-0">
                <ChartComponent data={chartData["1Y"]} height={400} showStats={true} />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}