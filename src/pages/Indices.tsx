import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { StockSidebar } from "@/components/StockSidebar";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity } from "lucide-react"; 
import { MetricCard } from "@/components/MetricCard"; 
import { StockPerformanceChart } from "@/components/StockPerformanceChart"; // Assuming this component exists
import { getIndices } from "@/lib/api"; // Make sure this path is correct for your getIndices function
import { useLocalStorage } from "@/hooks/useLocalStorage";
import ThemeToggle from "@/components/ui/ThemeToggle";

// --- Type Definitions for StockPerformanceChart (adjust path if imported) ---
// These types should ideally be in a shared 'types.ts' file or in StockPerformanceChart.tsx
// If StockPerformanceChart exports these, you should import them:
// import { DataPoint, StockDataset } from "@/components/StockPerformanceChart";
export interface DataPoint {
  date: string;
  closing: number;
  // Add other properties that your chart's data points might have (e.g., open, high, low, volume)
}

export interface StockDataset {
  code: string;
  name: string; // This was the missing property causing the error!
  dataPoints: DataPoint[];
  // Add other properties that your chart might use (e.g., color)
}
// --- End Type Definitions ---


const MarketIndexPage = () => {
  // State to hold the fetched index data
  const [indexChartData, setIndexChartData] = useState<DataPoint[]>([]); // Use DataPoint[] type
  const [isChartLoading, setIsChartLoading] = useState(true);
  
  // Get the dark mode state from useLocalStorage for ThemeToggle and chart styling
  const [isDarkMode] = useLocalStorage<boolean>('theme_dark_mode', false); 

  useEffect(() => {
    const loadIndexData = async () => {
      setIsChartLoading(true);
      try {
        // Directly fetch the pre-calculated index data from the API
        const data = await getIndices();
        // Assuming getIndices returns DataPoint[]
        setIndexChartData(data || []); 
      } catch (error) {
        console.error("Error fetching market index:", error);
        setIndexChartData([]); // Clear data on error
      } finally {
        setIsChartLoading(false);
      }
    };
    loadIndexData();
  }, []); // Empty dependency array means this runs once on mount

  // Calculate index-specific KPIs based on the fetched data
  const currentIndexValue = indexChartData.length > 0 ? indexChartData[indexChartData.length - 1].closing : 0;
  const previousIndexValue = indexChartData.length > 1 ? indexChartData[indexChartData.length - 2].closing : 0;
  
  const indexDailyChange = currentIndexValue - previousIndexValue;
  const indexDailyChangePct = previousIndexValue !== 0 ? (indexDailyChange / previousIndexValue) * 100 : 0;

  const getChangeType = (change: number) => {
    if (change > 0) return "increase";
    if (change < 0) return "decrease";
    return "neutral";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <StockSidebar />
        <SidebarInset className="flex-1">
          <header className="flex items-center justify-between p-6 border-b bg-card">
            <div>
              <div className="flex items-center gap-4"> 
                <SidebarTrigger /> 
                <div> 
                  <h1 className="text-2xl font-bold text-foreground">Market Index</h1> 
                  <p className="text-sm text-muted-foreground">Performance of the Top 10 Stocks by Volume</p> 
                </div> 
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {/* Optional Bell and User icons, commented out as in original */}
              {/* <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button> */}
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Current Index Value" 
                value={isChartLoading ? '...' : currentIndexValue.toFixed(2)} 
                change="" 
                changeType="neutral" 
                icon={Activity} 
              />
              <MetricCard 
                title="Today's Change" 
                // Only show change if there's enough data and not loading
                value={isChartLoading || indexChartData.length < 2 ? '...' : `${indexDailyChange.toFixed(2)} (${indexDailyChangePct.toFixed(2)}%)`} 
                change="" 
                changeType={getChangeType(indexDailyChange)} 
                icon={indexDailyChange > 0 ? TrendingUp : (indexDailyChange < 0 ? TrendingDown : Activity)} 
              />
              {/* You can add more index-specific metric cards here if desired */}
            </div>
            
            <div className="h-[50vh]">
              <StockPerformanceChart
                // The StockPerformanceChart expects an array of StockDataset objects.
                // We create one dataset for the Market Index.
                datasets={[{ 
                    code: "MARKET_INDEX", 
                    name: "Market Index", 
                    dataPoints: indexChartData 
                }]} 
                title="Market Index Performance (Top 10 by Volume)"
                isLoading={isChartLoading}
                isDarkMode={isDarkMode} 
                activeTimeframe={'D'} // Index calculation is daily; timeframe change is not implemented for this index
                onTimeframeChange={() => {}} // No timeframe changes for this static index chart on this page
              />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MarketIndexPage;