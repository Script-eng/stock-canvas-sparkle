// pages/MarketIndexPage.tsx
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { StockSidebar } from "@/components/StockSidebar";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, List } from "lucide-react"; // Added List icon for general metric cards
import { MetricCard } from "@/components/MetricCard"; 
import { StockPerformanceChart } from "@/components/StockPerformanceChart"; 
// Import the new/modified API functions and types
import { getIndices, getHistoricalIndexData, DataPoint, IndexSummary } from "@/lib/api"; // Ensure path is correct
import { useLocalStorage } from "@/hooks/useLocalStorage";
import ThemeToggle from "@/components/ui/ThemeToggle";

// --- StockDataset for the chart, likely from StockPerformanceChart.tsx or a types file ---
// If StockPerformanceChart exports these, you should import them:
// import { DataPoint, StockDataset } from "@/components/StockPerformanceChart";
export interface StockDataset {
  code: string;
  name: string; 
  dataPoints: DataPoint[];
}
// --- End Type Definitions ---


const MarketIndexPage = () => {
  // State for the list of available indices (e.g., NSE All-Share, NSE 10-Share)
  const [availableIndices, setAvailableIndices] = useState<IndexSummary[]>([]);
  const [isLoadingIndices, setIsLoadingIndices] = useState(true); // For loading the metric cards

  // State for the currently selected index from the 'availableIndices' list
  const [selectedIndexSummary, setSelectedIndexSummary] = useState<IndexSummary | null>(null);

  // State for the historical chart data of the selected index
  const [selectedIndexHistory, setSelectedIndexHistory] = useState<DataPoint[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true); // For loading the chart

  // State for the title coming from the API
  const [pageTitle, setPageTitle] = useState("Market Indices");

  const [isDarkMode] = useLocalStorage<boolean>('theme_dark_mode', false); 

  // Effect to load the list of available indices (for the metric cards)
  useEffect(() => {
    const loadAvailableIndices = async () => {
      setIsLoadingIndices(true);
      try {
        const response = await getIndices(); // Use the modified getIndices
        if (response) {
          setAvailableIndices(response.data || []);
          setPageTitle(response.title || "Market Indices"); // Set page title from API
          if (response.data.length > 0) {
            // Select the first index by default for the chart
            setSelectedIndexSummary(response.data[0]);
          }
        } else {
            setAvailableIndices([]);
            setSelectedIndexSummary(null);
        }
      } catch (error) {
        console.error("Error fetching available market indices:", error);
      } finally {
        setIsLoadingIndices(false);
      }
    };
    loadAvailableIndices();
  }, []); // Runs once on mount

  // Effect to load historical data for the currently selected index (for the chart)
  useEffect(() => {
    const loadIndexHistory = async () => {
      if (!selectedIndexSummary) {
        setSelectedIndexHistory([]);
        setIsLoadingHistory(false);
        return;
      }

      setIsLoadingHistory(true);
      try {
        // Call the new API function to get historical data for the selected index
        const history = await getHistoricalIndexData(selectedIndexSummary.name, 'D'); // 'D' for daily timeframe
        setSelectedIndexHistory(history || []);
      } catch (error) {
        console.error(`Error fetching historical data for ${selectedIndexSummary.name}:`, error);
        setSelectedIndexHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadIndexHistory();
  }, [selectedIndexSummary]); // Re-run whenever the selectedIndexSummary changes

  // Helper to determine change type for MetricCard
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
                  <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1> {/* Dynamic title */}
                  <p className="text-sm text-muted-foreground">Overview of key market indices</p> 
                </div> 
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {/* Optional Bell and User icons */}
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Metric Cards for each available index */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoadingIndices ? (
                // Show skeleton loaders while fetching the list of indices
                Array.from({ length: 4 }).map((_, i) => (
                  <MetricCard 
                    key={i} 
                    title="..." 
                    value="..." 
                    change="..." 
                    changeType="neutral" 
                    icon={Activity} 
                    isLoading={true} 
                  />
                ))
              ) : (
                availableIndices.map((index) => (
                  <MetricCard 
                    key={index.name}
                    title={index.name}
                    value={index.closing.toFixed(2)}
                    change={`${index.change_abs > 0 ? '+' : ''}${index.change_abs.toFixed(2)} (${index.change_pct.toFixed(2)}%)`}
                    changeType={getChangeType(index.change_abs)}
                    icon={index.change_abs > 0 ? TrendingUp : (index.change_abs < 0 ? TrendingDown : Activity)}
                    onClick={() => setSelectedIndexSummary(index)}
                    // Add a border to highlight the currently selected index card
                    className={selectedIndexSummary?.name === index.name ? 'border-primary border-2' : ''}
                  />
                ))
              )}
            </div>
            
            {/* StockPerformanceChart for the selected index's historical data */}
            <div className="h-[50vh]">
              <StockPerformanceChart
                // Pass an array with a single dataset for the selected index's history
                datasets={selectedIndexSummary ? [{ 
                  code: selectedIndexSummary.name, // Using name as code for simplicity, adjust if your API has an actual 'code'
                  name: selectedIndexSummary.name, 
                  dataPoints: selectedIndexHistory 
                }] : []} 
                title={`${selectedIndexSummary?.name || 'Select an Index'} Performance`}
                isLoading={isLoadingHistory}
                isDarkMode={isDarkMode} 
                activeTimeframe={'D'} // Keep timeframe static for this component as interaction is not defined
                onTimeframeChange={() => {}} 
              />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MarketIndexPage;