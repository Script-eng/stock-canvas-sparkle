import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { StockSidebar } from "@/components/StockSidebar";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { MarketSummaryTable } from "@/components/MarketSummaryTable";
import { StockPerformanceChart } from "@/components/StockPerformanceChart";
import { getMarketSummary, getCompanyHistory } from "@/lib/api";

const Analytics = () => {
  // --- THE FIX IS HERE ---
  // Ensure state is always initialized as a guaranteed empty array.
  const [marketSummary, setMarketSummary] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'D' | 'ME' | 'YE'>('D');
  const [chartDatasets, setChartDatasets] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  useEffect(() => {
    const loadMarketData = async () => {
      const summary = await getMarketSummary();
      setMarketSummary(summary || []); // Defensively ensure it's an array
      if (summary && summary.length > 0) {
        setSelectedStocks([summary[0]]); // Select first stock by default
      }
    };
    loadMarketData();
  }, []);

  useEffect(() => {
    const loadChartData = async () => {
      setIsChartLoading(true);
      const datasets = await getCompanyHistory(selectedStocks, selectedTimeframe);
      setChartDatasets(datasets || []); // Defensively ensure it's an array
      setIsChartLoading(false);
    };
    loadChartData();
  }, [selectedStocks, selectedTimeframe]);

  const getChartTitle = () => {
    if (selectedStocks.length > 1) return "Stock Performance Comparison";
    if (selectedStocks.length === 1) return `${selectedStocks[0].name} Performance`;
    return "Stock Performance";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <StockSidebar />
        <SidebarInset className="flex-1">
          <header className="flex items-center justify-between p-6 border-b bg-card">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground">Advanced market analysis & comparison tools</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            <div className="h-[40vh]">
              <StockPerformanceChart 
                datasets={chartDatasets}
                title={getChartTitle()}
                isLoading={isChartLoading}
                activeTimeframe={selectedTimeframe}
                onTimeframeChange={setSelectedTimeframe}
              />
            </div>
            <div className="h-[45vh]">
              <MarketSummaryTable 
                data={marketSummary}
                selectedStocks={selectedStocks}
                onSelectionChange={setSelectedStocks}
              />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Analytics;