import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, User, Search, TrendingUp, TrendingDown, Activity, DollarSign, ArrowLeft, RefreshCw, BarChart3, LineChart, PieChart } from 'lucide-react';
import { getLiveMarketData } from "@/lib/api"; // Using our real API function

// --- HELPER FUNCTIONS ---
const formatNumber = (value: number | null | undefined, decimals = 2): string => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toFixed(decimals);
  }
  return '--';
};

const formatLargeNumber = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || isNaN(value)) return '--';
  if (value >= 1e12) return (value / 1e12).toFixed(1) + 'T';
  if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toString();
};

// --- SUB-COMPONENTS (Adapted for real API data) ---

function MarketRow({ stock, onClick, isEven }) {
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 500);
    return () => clearTimeout(timer);
  }, [stock.latest_price]);

  const priceColor = stock.change_direction === 'UP' ? 'text-green-600' : 'text-red-600';
  const bgColor = isEven ? 'bg-gray-50/50' : 'bg-white';
  const flashBg = flash ? 'bg-blue-100' : '';

  return (
    <tr className={`${bgColor} ${flashBg} hover:bg-blue-50 cursor-pointer transition-colors duration-300 border-b`} onClick={() => onClick(stock)}>
      <td className="px-4 py-3"><div className="font-bold text-gray-900">{stock.symbol}</div><div className="text-xs text-gray-500 truncate max-w-[120px]">{stock.name}</div></td>
      <td className={`px-4 py-3 font-semibold ${priceColor}`}>${formatNumber(stock.latest_price)}</td>
      <td className={`px-4 py-3 font-medium ${priceColor}`}>{stock.change_direction === 'UP' ? '+' : ''}{formatNumber(stock.change_abs)}</td>
      <td className={`px-4 py-3 font-medium ${priceColor}`}>{stock.change_direction === 'UP' ? '+' : ''}{formatNumber(stock.change_pct)}%</td>
      <td className="px-4 py-3 text-gray-700">{formatLargeNumber(stock.volume)}</td>
      <td className="px-4 py-3 text-gray-700">${formatNumber(stock.high)}</td>
      <td className="px-4 py-3 text-gray-700">${formatNumber(stock.low)}</td>
      <td className="px-4 py-3 text-xs text-gray-500">{stock.trade_time}</td>
    </tr>
  );
}

function DetailedStockCard({ stock, onBack }) {
  // Sparkline and other detailed view logic can remain as you designed it
  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" />Back to Market</Button>
          <div><h1 className="text-3xl font-bold text-gray-900">{stock.symbol}</h1><p className="text-lg text-gray-600">{stock.name}</p></div>
        </div>
      </div>
      {/* All the beautiful card details you designed would go here, using the `stock` prop */}
      <Card><CardContent className="p-6">Displaying details for {stock.name}</CardContent></Card>
    </div>
  );
}

// --- MAIN LIVE MARKET PAGE ---
export default function LiveMarket() {
  const [liveData, setLiveData] = useState([]);
  const [marketStatus, setMarketStatus] = useState("loading");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("volume");
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getLiveMarketData();
      if (response && Array.isArray(response.data)) {
        setLiveData(response.data);
        setMarketStatus(response.status);
        setLastUpdated(new Date(response.data_timestamp));
        setIsLoading(false);
      } else {
        // Handle API failure case
        setMarketStatus("error");
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // --- FULLY IMPLEMENTED LOGIC ---
  const sortedAndFilteredData = useMemo(() => {
    let data = [...liveData];
    if (searchTerm) {
      data = data.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    switch (sortOrder) {
      case 'gainers': data.sort((a, b) => (b.change_pct || 0) - (a.change_pct || 0)); break;
      case 'losers': data.sort((a, b) => (a.change_pct || 0) - (b.change_pct || 0)); break;
      case 'volume': default: data.sort((a, b) => (b.volume || 0) - (a.volume || 0)); break;
    }
    return data;
  }, [liveData, searchTerm, sortOrder]);

  const marketStats = useMemo(() => {
    if (!liveData.length) return { gainers: 0, losers: 0, neutral: 0, totalVolume: 0 };
    return {
      gainers: liveData.filter(s => s.change_direction === 'UP').length,
      losers: liveData.filter(s => s.change_direction === 'DOWN').length,
      neutral: liveData.filter(s => s.change_direction !== 'UP' && s.change_direction !== 'DOWN').length,
      totalVolume: liveData.reduce((sum, stock) => sum + (stock.volume || 0), 0)
    };
  }, [liveData]);
  
  const currentStockData = useMemo(() => {
    if (!selectedStock) return null;
    return liveData.find(stock => stock.symbol === selectedStock.symbol) || selectedStock;
  }, [liveData, selectedStock]);

  if (selectedStock) {
    return <DetailedStockCard stock={currentStockData} onBack={() => setSelectedStock(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Stock Market</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${marketStatus === 'live' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className={`w-2 h-2 rounded-full ${marketStatus === 'live' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                Market is {marketStatus}
              </div>
              <p className="text-sm text-gray-500">Last updated: {lastUpdated?.toLocaleTimeString() || '...'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-green-100 text-sm">Gainers</p><p className="text-2xl font-bold">{marketStats.gainers}</p></div><TrendingUp className="w-8 h-8 text-green-200" /></div></CardContent></Card>
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-red-100 text-sm">Losers</p><p className="text-2xl font-bold">{marketStats.losers}</p></div><TrendingDown className="w-8 h-8 text-red-200" /></div></CardContent></Card>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-blue-100 text-sm">Total Volume</p><p className="text-2xl font-bold">{formatLargeNumber(marketStats.totalVolume)}</p></div><Activity className="w-8 h-8 text-blue-200" /></div></CardContent></Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-purple-100 text-sm">Active Stocks</p><p className="text-2xl font-bold">{liveData.length}</p></div><DollarSign className="w-8 h-8 text-purple-200" /></div></CardContent></Card>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" /><Input placeholder="Search stocks..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Sort by..." /></SelectTrigger>
            <SelectContent><SelectItem value="volume">Most Active</SelectItem><SelectItem value="gainers">Top Gainers</SelectItem><SelectItem value="losers">Top Losers</SelectItem></SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="text-center py-20 text-gray-600">Loading Live Market Data...</div>
        ) : (
          <Card className="overflow-hidden"><div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredData.map((stock, index) => (<MarketRow key={stock.symbol} stock={stock} onClick={setSelectedStock} isEven={index % 2 === 0}/>))}
              </tbody>
            </table>
          </div></Card>
        )}
      </div>
    </div>
  );
}