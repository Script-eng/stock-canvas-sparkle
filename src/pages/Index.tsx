// import { useState, useEffect } from "react";
// import { TrendingUp, TrendingDown, Activity, List } from "lucide-react";
// import { MetricCard } from "@/components/MetricCard";
// import { MarketSummaryTable } from "@/components/MarketSummaryTable";
// import { StockPerformanceChart } from "@/components/StockPerformanceChart";
// import { MoversList } from "@/components/MoversList";
// import { MarketPieChart, PieChartDataPoint } from "@/components/MarketPieChart";
// import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
// import { StockSidebar } from "@/components/StockSidebar";
// import { Button } from "@/components/ui/button";
// import { Bell, User } from "lucide-react";
// import { getMarketSummary, getMarketMovers, getCompanyHistory, getSectorDistribution } from "@/lib/api";

// const Index = () => {
//   // State Management
//   const [marketSummary, setMarketSummary] = useState([]);
//   const [marketMovers, setMarketMovers] = useState(null);
//   const [sectorData, setSectorData] = useState<PieChartDataPoint[]>([]);
//   const [selectedStock, setSelectedStock] = useState(null);
//   const [selectedTimeframe, setSelectedTimeframe] = useState<'D' | 'ME' | 'YE'>('D');
//   const [chartData, setChartData] = useState([]);
//   const [isChartLoading, setIsChartLoading] = useState(true);

//   // Data Fetching for initial dashboard load
//   useEffect(() => {
//     const loadDashboardData = async () => {
//       const [summary, movers, sectors] = await Promise.all([
//         getMarketSummary(),
//         getMarketMovers(),
//         getSectorDistribution()
//       ]);
//       setMarketSummary(summary);
//       setMarketMovers(movers);
//       setSectorData(sectors);

//       if (movers?.gainers && movers.gainers.length > 0) {
//         setSelectedStock(movers.gainers[0]);
//       } else if (summary.length > 0) {
//         setSelectedStock(summary[0]);
//       }
//     };
//     loadDashboardData();
//   }, []);

//   // Effect to fetch data when the selected stock changes
//   useEffect(() => {
//     if (!selectedStock) return;
//     const loadChartData = async () => {
//       setSelectedTimeframe('D'); // Reset to daily view when stock changes
//       setIsChartLoading(true);
//       const history = await getCompanyHistory(selectedStock.code, 'D');
//       setChartData(history);
//       setIsChartLoading(false);
//     };
//     loadChartData();
//   }, [selectedStock]);

//   // Effect to fetch data when only the timeframe changes
//   useEffect(() => {
//     if (!selectedStock) return;
//     const loadChartDataForTimeframe = async () => {
//       setIsChartLoading(true);
//       const history = await getCompanyHistory(selectedStock.code, selectedTimeframe);
//       setChartData(history);
//       setIsChartLoading(false);
//     };
//     loadChartDataForTimeframe();
//   }, [selectedTimeframe]);

//   const topGainer = marketMovers?.gainers?.[0];
//   const topLoser = marketMovers?.losers?.[0];
//   const mostActiveStock = marketSummary.length > 0 ? [...marketSummary].sort((a, b) => b.volume - a.volume)[0] : null;

//   const handleCardClick = (stock) => {
//     if (stock) setSelectedStock(stock);
//   };

//   return (
//     <SidebarProvider>
//       <div className="min-h-screen flex w-full bg-background">
//         <StockSidebar />
//         <SidebarInset className="flex-1">
//           <header className="flex items-center justify-between p-6 border-b bg-card">
//             <div className="flex items-center gap-4">
//               <SidebarTrigger />
//               <div>
//                 <h1 className="text-2xl font-bold text-foreground">Market Dashboard</h1>
//                 <p className="text-sm text-muted-foreground">Live Market Overview</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
//               <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
//             </div>
//           </header>

//           <main className="flex-1 p-6 space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                <MetricCard title="Top Gainer" value={topGainer?.name || '...'} change={topGainer ? `+${topGainer.change_pct.toFixed(2)}%` : ''} changeType="increase" icon={TrendingUp} subtitle={topGainer?.code || ''} onClick={() => handleCardClick(topGainer)} />
//                <MetricCard title="Top Loser" value={topLoser?.name || '...'} change={topLoser ? `${topLoser.change_pct.toFixed(2)}%` : ''} changeType="decrease" icon={TrendingDown} subtitle={topLoser?.code || ''} onClick={() => handleCardClick(topLoser)} />
//                <MetricCard title="Most Active" value={mostActiveStock?.name || '...'} change={mostActiveStock ? mostActiveStock.volume.toLocaleString() : ''} changeType="neutral" icon={Activity} subtitle="Volume" onClick={() => handleCardClick(mostActiveStock)} />
//                <MetricCard title="Listed Companies" value={marketSummary.length > 0 ? marketSummary.length.toString() : '...'} change="" changeType="neutral" icon={List} subtitle="" />
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <StockPerformanceChart 
//                 data={chartData}
//                 title={`${selectedStock?.name || 'Select a Stock'} Performance`}
//                 isLoading={isChartLoading}
//                 activeTimeframe={selectedTimeframe}
//                 onTimeframeChange={setSelectedTimeframe}
//               />
//               <MarketPieChart data={sectorData} />
//             </div>

//             <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//               <div className="xl:col-span-2">
//                 <MarketSummaryTable 
//                   data={marketSummary}
//                   onRowClick={setSelectedStock}
//                   selectedStockCode={selectedStock?.code}
//                 />
//               </div>
//               <div>
//                 <MoversList 
//                   movers={marketMovers}
//                   onItemClick={setSelectedStock}
//                 />
//               </div>
//             </div>
//           </main>
//         </SidebarInset>
//       </div>
//     </SidebarProvider>
//   );
// };

// export default Index;

// import { useState, useEffect } from "react";
// import { TrendingUp, TrendingDown, Activity, List } from "lucide-react";
// import { MetricCard } from "@/components/MetricCard";
// import { MarketSummaryTable } from "@/components/MarketSummaryTable";
// import { StockPerformanceChart } from "@/components/StockPerformanceChart";
// import { MoversList } from "@/components/MoversList";
// import { MarketPieChart, PieChartDataPoint } from "@/components/MarketPieChart";
// import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
// import { StockSidebar } from "@/components/StockSidebar";
// import { Button } from "@/components/ui/button";
// import { Bell, User } from "lucide-react";
// import { getMarketSummary, getMarketMovers, getCompanyHistory, getSectorDistribution } from "@/lib/api";

// const Index = () => {
//   // State Management
//   const [marketSummary, setMarketSummary] = useState([]);
//   const [marketMovers, setMarketMovers] = useState(null);
//   const [sectorData, setSectorData] = useState<PieChartDataPoint[]>([]);
  
//   // --- STATE MODIFIED FOR MULTI-SELECT ---
//   const [selectedStocks, setSelectedStocks] = useState([]); // Now an array
//   const [selectedTimeframe, setSelectedTimeframe] = useState<'D' | 'ME' | 'YE'>('D');
//   const [chartDatasets, setChartDatasets] = useState([]); // Holds datasets for the chart
//   const [isChartLoading, setIsChartLoading] = useState(true);

//   // Initial dashboard load
//   useEffect(() => {
//     const loadDashboardData = async () => {
//       const [summary, movers, sectors] = await Promise.all([ getMarketSummary(), getMarketMovers(), getSectorDistribution() ]);
//       setMarketSummary(summary);
//       setMarketMovers(movers);
//       setSectorData(sectors);

//       // Initially select the top gainer
//       if (movers?.gainers && movers.gainers.length > 0) {
//         setSelectedStocks([movers.gainers[0]]);
//       } else if (summary.length > 0) {
//         setSelectedStocks([summary[0]]);
//       }
//     };
//     loadDashboardData();
//   }, []);

//   // Effect to fetch chart data when selection or timeframe changes
//   useEffect(() => {
//     const loadChartData = async () => {
//       setIsChartLoading(true);
//       const datasets = await getCompanyHistory(selectedStocks, selectedTimeframe);
//       setChartDatasets(datasets);
//       setIsChartLoading(false);
//     };
//     loadChartData();
//   }, [selectedStocks, selectedTimeframe]); // Re-fetches when either changes

//   const getChartTitle = () => {
//     if (selectedStocks.length > 1) return "Stock Performance Comparison";
//     if (selectedStocks.length === 1) return `${selectedStocks[0].name} Performance`;
//     return "Stock Performance";
//   };
  
//   return (
//     <SidebarProvider>
//       <div className="min-h-screen flex w-full bg-background">
//         <StockSidebar />
//         <SidebarInset className="flex-1">
//           <header className="flex items-center justify-between p-6 border-b bg-card">
//             {/* Header content unchanged */}
//           </header>

//           <main className="flex-1 p-6 space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {/* Metric cards are now single-select shortcuts */}
//               <MetricCard title="Top Gainer" value={marketMovers?.gainers?.[0]?.name || '...'} onClick={() => marketMovers?.gainers?.[0] && setSelectedStocks([marketMovers.gainers[0]])} />
//               {/* Other cards can be wired similarly */}
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <StockPerformanceChart 
//                 datasets={chartDatasets}
//                 title={getChartTitle()}
//                 isLoading={isChartLoading}
//                 activeTimeframe={selectedTimeframe}
//                 onTimeframeChange={setSelectedTimeframe}
//               />
//               <MarketPieChart data={sectorData} />
//             </div>

//             <div className="grid grid-cols-1">
//               <MarketSummaryTable 
//                 data={marketSummary}
//                 selectedStocks={selectedStocks}
//                 onSelectionChange={setSelectedStocks}
//               />
//             </div>
//           </main>
//         </SidebarInset>
//       </div>
//     </SidebarProvider>
//   );
// };

// export default Index;

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity, List } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { MarketSummaryTable } from "@/components/MarketSummaryTable";
import { StockPerformanceChart } from "@/components/StockPerformanceChart";
import { MoversList } from "@/components/MoversList";
import { MarketPieChart, PieChartDataPoint } from "@/components/MarketPieChart";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { StockSidebar } from "@/components/StockSidebar";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { getMarketSummary, getMarketMovers, getCompanyHistory, getSectorDistribution } from "@/lib/api";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Define the shape of our sorting state
interface SortConfig {
  key: string;
  order: 'asc' | 'desc';
}

const Index = () => {
  const [marketSummary, setMarketSummary] = useState([]);
  const [marketMovers, setMarketMovers] = useState(null);
  const [sectorData, setSectorData] = useState<PieChartDataPoint[]>([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'D' | 'ME' | 'YE'>('D');
  const [chartData, setChartData] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  
  // New state for sorting and watchlist
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', order: 'asc' });
  const [watchlist, setWatchlist] = useLocalStorage<string[]>('stock_watchlist', []);

  // Effect to load market summary data, now triggered by sorting changes
  useEffect(() => {
    const loadMarketData = async () => {
      // Note: We are not setting a loading state here to avoid a full-page loader on sort.
      // A loading state could be added to the table component itself if desired.
      const summary = await getMarketSummary(sortConfig.key, sortConfig.order);
      setMarketSummary(summary || []);

      // Only set the selected stock on the initial load, not on re-sorts
      if (!selectedStock && summary?.length > 0) {
        setSelectedStock(summary[0]);
      }
    };
    loadMarketData();
  }, [sortConfig]); // Re-fetches whenever the sort configuration changes

  // Effect for initial load of non-sorting data (Movers, Sectors)
  useEffect(() => {
    const loadOtherData = async () => {
      const [movers, sectors] = await Promise.all([ getMarketMovers(), getSectorDistribution() ]);
      setMarketMovers(movers);
      setSectorData(sectors || []);
      
      if (!selectedStock && movers?.gainers?.length) {
        setSelectedStock(movers.gainers[0]);
      }
    };
    loadOtherData();
  }, []);

  // Effect to fetch chart data when selection or timeframe changes
  useEffect(() => {
    const loadChartData = async () => {
      if (!selectedStock) return;
      setIsChartLoading(true);
      const history = await getCompanyHistory([selectedStock], selectedTimeframe);
      setChartData(history);
      setIsChartLoading(false);
    };
    loadChartData();
  }, [selectedStock, selectedTimeframe]);

  const handleSortChange = (sortKey: string) => {
    setSortConfig(currentConfig => {
      const isSameKey = currentConfig.key === sortKey;
      const newOrder = isSameKey && currentConfig.order === 'asc' ? 'desc' : 'asc';
      return { key: sortKey, order: newOrder };
    });
  };

  const handleWatchlistToggle = (stockCode: string) => {
    const isInWatchlist = watchlist.includes(stockCode);
    if (isInWatchlist) {
      setWatchlist(currentList => currentList.filter(code => code !== stockCode));
    } else {
      setWatchlist(currentList => [...currentList, stockCode]);
    }
  };

  const topGainer = marketMovers?.gainers?.[0];
  const topLoser = marketMovers?.losers?.[0];
  const mostActiveStock = marketSummary.length > 0 ? [...marketSummary].sort((a, b) => b.volume - a.volume)[0] : null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <StockSidebar />
        <SidebarInset className="flex-1">
          <header className="flex items-center justify-between p-6 border-b bg-card">
            <div className="flex items-center gap-4"> <SidebarTrigger /> <div> <h1 className="text-2xl font-bold text-foreground">Markets</h1> <p className="text-sm text-muted-foreground">Live Market Overview</p> </div> </div>
            <div className="flex items-center gap-3"> <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button> <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button> </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <MetricCard title="Top Gainer" value={topGainer?.name || '...'} change={topGainer ? `+${topGainer.change_pct.toFixed(2)}%` : ''} changeType="increase" icon={TrendingUp} subtitle={topGainer?.code || ''} onClick={() => topGainer && setSelectedStock(topGainer)} />
               <MetricCard title="Top Loser" value={topLoser?.name || '...'} change={topLoser ? `${topLoser.change_pct.toFixed(2)}%` : ''} changeType="decrease" icon={TrendingDown} subtitle={topLoser?.code || ''} onClick={() => topLoser && setSelectedStock(topLoser)} />
               <MetricCard title="Most Active" value={mostActiveStock?.name || '...'} change={mostActiveStock ? mostActiveStock.volume.toLocaleString() : ''} changeType="neutral" icon={Activity} subtitle="Volume" onClick={() => mostActiveStock && setSelectedStock(mostActiveStock)} />
               <MetricCard title="Listed Companies" value={marketSummary.length > 0 ? marketSummary.length.toString() : '...'} change="" changeType="neutral" icon={List} subtitle="" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StockPerformanceChart 
                datasets={chartData}
                title={`${selectedStock?.name || 'Select a Stock'} Performance`}
                isLoading={isChartLoading}
                activeTimeframe={selectedTimeframe}
                onTimeframeChange={setSelectedTimeframe}
              />
              <MarketPieChart data={sectorData} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <MarketSummaryTable 
                  data={marketSummary}
                  selectionMode="single"
                  onRowClick={setSelectedStock}
                  selectedStockCode={selectedStock?.code}
                  sortConfig={sortConfig}
                  onSortChange={handleSortChange}
                  watchlist={watchlist}
                  onWatchlistToggle={handleWatchlistToggle}
                />
              </div>
              <div>
                <MoversList 
                  movers={marketMovers}
                  onItemClick={setSelectedStock}
                />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;