import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { StockSidebar } from "@/components/StockSidebar";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { MarketSummaryTable } from "@/components/MarketSummaryTable";
import { StockPerformanceChart } from "@/components/StockPerformanceChart"; // Import the chart
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getMarketSummary, getCompanyHistory } from "@/lib/api";

const Portfolio = () => {
  const [marketSummary, setMarketSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [watchlist, setWatchlist] = useLocalStorage<string[]>('stock_watchlist', []);

  // --- NEW STATE FOR THE CHART ---
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'D' | 'ME' | 'YE'>('D');
  const [chartData, setChartData] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Effect to load the full market data once
  useEffect(() => {
    const loadMarketData = async () => {
      setIsLoading(true);
      const summary = await getMarketSummary();
      setMarketSummary(summary || []);
      setIsLoading(false);
    };
    loadMarketData();
  }, []);

  // Filter the full market summary to get only the watched stocks
  const watchedStocks = marketSummary.filter(stock => watchlist.includes(stock.code));

  // --- NEW EFFECT TO SELECT THE FIRST STOCK ---
  // When the list of watched stocks is available, select the first one by default.
  useEffect(() => {
    if (watchedStocks.length > 0 && !selectedStock) {
      setSelectedStock(watchedStocks[0]);
    } else if (watchedStocks.length === 0) {
      setSelectedStock(null); // Clear selection if watchlist is empty
    }
  }, [watchedStocks, selectedStock]);

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
      setChartData(history);
      setIsChartLoading(false);
    };
    loadChartData();
  }, [selectedStock, selectedTimeframe]);

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
                <div className="flex items-center gap-4"> <SidebarTrigger /> <div> <h1 className="text-2xl font-bold text-foreground">My Watchlist</h1> <p className="text-sm text-muted-foreground">A personalized list of stocks you are tracking</p> </div> </div>
            </div>
            {/* <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
            </div> */}
          </header>

          <main className="flex-1 p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-96"><p>Loading watchlist data...</p></div>
            ) : watchlist.length === 0 ? (
              <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <p className="font-semibold">Your watchlist is empty.</p>
                  <p className="text-sm">You can add stocks by clicking the star icon on the Markets or Analytics pages.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Chart Area */}
                <div>
                  <StockPerformanceChart
                    datasets={chartData}
                    title={`${selectedStock?.name || 'Select a Stock'} Performance`}
                    isLoading={isChartLoading}
                    activeTimeframe={selectedTimeframe}
                    onTimeframeChange={setSelectedTimeframe}
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