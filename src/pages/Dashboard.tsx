import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { StockSidebar } from "@/components/StockSidebar";
import { Button } from "@/components/ui/button";
import { Bell, User, TrendingUp, TrendingDown, Activity, List } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { StockPerformanceChart } from "@/components/StockPerformanceChart"; // Import the chart component
import { getMarketSummary, getCompanyHistory } from "@/lib/api";

const Dashboard = () => {
  const [marketSummary, setMarketSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- NEW STATE FOR THE INDEX CHART ---
  const [indexChartData, setIndexChartData] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      const summary = await getMarketSummary();
      setMarketSummary(summary || []);
      setIsLoading(false);

      // --- NEW LOGIC TO BUILD THE INDEX ---
      if (summary && summary.length > 0) {
        setIsChartLoading(true);
        
        // 1. Identify Top 10 stocks by volume
        const top10ByVolume = [...summary].sort((a, b) => b.volume - a.volume).slice(0, 10);
        
        // 2. Fetch their daily history
        const historyDatasets = await getCompanyHistory(top10ByVolume, 'D');

        if (historyDatasets && historyDatasets.length > 0) {
          // 3. Calculate the average performance to create the index
          const firstDayPrices = new Map();
          historyDatasets.forEach(ds => {
            if(ds.dataPoints.length > 0) {
              firstDayPrices.set(ds.code, ds.dataPoints[0].closing);
            }
          });

          const longestDataset = historyDatasets.reduce((a, b) => a.dataPoints.length > b.dataPoints.length ? a : b);
          
          const calculatedIndex = longestDataset.dataPoints.map((_, index) => {
            let dailyTotalChange = 0;
            let stocksInAverage = 0;

            historyDatasets.forEach(ds => {
              const firstPrice = firstDayPrices.get(ds.code);
              if (firstPrice && ds.dataPoints[index]) {
                const currentPrice = ds.dataPoints[index].closing;
                // Calculate percentage change from the first day
                const pctChange = ((currentPrice - firstPrice) / firstPrice) * 100;
                dailyTotalChange += pctChange;
                stocksInAverage++;
              }
            });

            const averageChange = stocksInAverage > 0 ? dailyTotalChange / stocksInAverage : 0;
            return { date: longestDataset.dataPoints[index].date, closing: 100 + averageChange }; // Start index at 100
          });
          
          setIndexChartData(calculatedIndex);
        }
        setIsChartLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Calculate market-wide KPIs after data is fetched
  const totalVolume = isLoading ? 0 : marketSummary.reduce((sum, stock) => sum + (stock.volume || 0), 0);
  const advancingCount = isLoading ? 0 : marketSummary.filter(s => s.change_pct > 0).length;
  const decliningCount = isLoading ? 0 : marketSummary.filter(s => s.change_pct < 0).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <StockSidebar />
        <SidebarInset className="flex-1">
          <header className="flex items-center justify-between p-6 border-b bg-card">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Market Dashboard</h1>
              <p className="text-sm text-muted-foreground">A high-level overview of today's market health</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard title="Total Volume" value={isLoading ? '...' : totalVolume.toLocaleString()} change="" changeType="neutral" icon={Activity} />
              <MetricCard title="Advancing Stocks" value={isLoading ? '...' : advancingCount.toString()} change="" changeType="increase" icon={TrendingUp} />
              <MetricCard title="Declining Stocks" value={isLoading ? '...' : decliningCount.toString()} change="" changeType="decrease" icon={TrendingDown} />
              <MetricCard title="Listed Companies" value={isLoading ? '...' : marketSummary.length.toString()} change="" changeType="neutral" icon={List} />
            </div>
            
            <div className="h-[50vh]">
              <StockPerformanceChart
                data={indexChartData}
                title="Market Index Performance (Top 10 by Volume)"
                isLoading={isChartLoading}
                // These props are required but have no effect on a single-line index chart
                activeTimeframe={'D'}
                onTimeframeChange={() => {}}
              />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;