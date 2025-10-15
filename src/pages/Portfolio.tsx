import { useState, useEffect, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { StockSidebar } from "@/components/StockSidebar";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { MarketSummaryTable } from "@/components/MarketSummaryTable";
import { StockPerformanceChart } from "@/components/StockPerformanceChart"; 
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getMarketSummary, getCompanyHistory } from "@/lib/api";
// --- Using the user-provided import path for ThemeToggle ---
import ThemeToggle from "@/components/ui/ThemeToggle"; 
// -----------------------------------------------------------

const Portfolio = () => {
  const [marketSummary, setMarketSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [watchlist, setWatchlist] = useLocalStorage<string[]>('stock_watchlist', []);

  // --- NEW STATE FOR THE CHART ---
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'D' | 'ME' | 'YE'>('D');
  const [chartData, setChartData] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  // --- Get the dark mode state from useLocalStorage ---
  const [isDarkMode] = useLocalStorage<boolean>('theme_dark_mode', false); 
  // --- End Dark Mode state retrieval ---

  // Effect to load the full market data once
  useEffect(() => {
    const loadMarketData = async () => {
      setIsLoading(true);
      const summary = await getMarketSummary();
      setMarketSummary(summary || []); // Ensure summary is always an array
      setIsLoading(false);
    };
    loadMarketData();
  }, []); // Run once on mount

  // Filter the full market summary to get only the watched stocks
  // Memoize this to prevent unnecessary re-renders of children
  const watchedStocks = useMemo(() => {
    return marketSummary.filter(stock => watchlist.includes(stock.code));
  }, [marketSummary, watchlist]);

  // --- NEW EFFECT TO SELECT THE FIRST STOCK ---
  // When the list of watched stocks is available, select the first one by default.
  useEffect(() => {
    // Only set if watchedStocks has items AND no stock is currently selected
    if (watchedStocks.length > 0 && !selectedStock) {
      setSelectedStock(watchedStocks[0]);
    } 
    // If watchlist becomes empty and a stock was selected, clear the selection
    else if (watchedStocks.length === 0 && selectedStock) { 
      setSelectedStock(null);
      setChartData([]); // Clear chart if selection is cleared
    }
  }, [watchedStocks, selectedStock]); // Dependencies: re-run if watchlist changes or selectedStock is externally cleared

  // --- NEW EFFECT TO FETCH CHART DATA ---
  // Re-fetches data whenever the selected stock or timeframe changes.
  useEffect(() => {
    const loadChartData = async () => {
      if (!selectedStock) {
        setChartData([]); // Clear the chart if no stock is selected
        return;
      }
      setIsChartLoading(true);
      
      const history = await getCompanyHistory([selectedStock], selectedTimeframe);
      // --- Ensure chartData is always an array ---
      setChartData(history || []); 
      // ------------------------------------------
      setIsChartLoading(false);
    };
    loadChartData();
  }, [selectedStock, selectedTimeframe]); // Dependencies: re-run if selectedStock or timeframe changes

  const handleWatchlistToggle = (stockCode: string) => {
    const isInWatchlist = watchlist.includes(stockCode);
    if (isInWatchlist) {
      setWatchlist(watchlist.filter(code => code !== stockCode));
    } else {
      setWatchlist([...watchlist, stockCode]);
    }
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
                    <h1 className="text-2xl font-bold text-foreground">My Watchlist</h1> 
                    <p className="text-sm text-muted-foreground">A personalized list of stocks you are tracking</p> 
                  </div> 
                </div>
            </div>
            <div className="flex items-center gap-3">
              {/* --- Theme Toggle Component --- */}
              <ThemeToggle />
              {/* Optional Bell and User icons */}
              {/* <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button> */}
            </div>
          </header>

          <main className="flex-1 p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-96 text-muted-foreground"><p>Loading watchlist data...</p></div>
            ) : watchlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg bg-card border-border p-4 text-center space-y-2"> {/* Added bg-card, border-border, p-4, text-center, space-y-2 */}
                <p className="font-semibold text-foreground">Your watchlist is empty.</p>
                <p className="text-sm text-muted-foreground">You can add stocks by clicking the star icon on the Markets or Analytics pages.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Chart Area */}
                <div>
                  <StockPerformanceChart
                    // --- IMPORTANT: Use 'data' prop for single stock history ---
                    data={chartData} 
                    title={`${selectedStock?.name || 'Select a Stock'} Performance`}
                    isLoading={isChartLoading}
                    activeTimeframe={selectedTimeframe}
                    onTimeframeChange={setSelectedTimeframe}
                    // Pass dark mode state
                    isDarkMode={isDarkMode} 
                  />
                </div>
                {/* Right Column: Watchlist Table */}
                <div>
                  <MarketSummaryTable 
                    data={watchedStocks}
                    selectionMode="single"
                    onRowClick={setSelectedStock}
                    selectedStockCode={selectedStock?.code}
                    watchlist={watchlist}
                    onWatchlistToggle={handleWatchlistToggle}
                  />
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Portfolio;