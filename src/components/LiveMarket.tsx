import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, TrendingDown, Activity, DollarSign, ArrowLeft } from 'lucide-react';
import { getLiveMarketData } from '@/lib/api';

// ------------------ Types ------------------
interface LiveStock {
  symbol: string;
  name?: string;
  prev_close?: number | null;
  latest_price?: number | null;
  change_direction?: 'UP' | 'DOWN' | 'FLAT' | null;
  change_abs?: number | null;
  change_pct?: number | null;
  high?: number | null;
  low?: number | null;
  avg_price?: number | null;
  volume?: number | null;
  trade_time?: string | null;
}

// Helper functions

const formatNumber = (
  value: number | null | undefined,
  decimals: number = 2,
  useGrouping: boolean = false
): string => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping,
    });
  }
  return '--';
};

// ------------------ Row ------------------
function MarketRow({ stock, onClick, isEven }: { stock: LiveStock; onClick: (s: LiveStock) => void; isEven: boolean }) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 400);
    return () => clearTimeout(t);
  }, [stock.latest_price]);

  const priceColor =
    stock.change_direction === 'UP' ? 'text-green-600' : stock.change_direction === 'DOWN' ? 'text-red-600' : 'text-gray-600';

  const bgColor = isEven ? 'bg-gray-50/50' : 'bg-white';
  const flashBg = flash ? 'bg-blue-50' : '';

  return (
    <tr
      className={`${bgColor} ${flashBg} hover:bg-blue-50 cursor-pointer transition-colors duration-300 border-b`}
      onClick={() => onClick(stock)}
    >
      <td className="px-4 py-3">
        <div className="font-bold text-gray-900">{stock.symbol}</div>
        <div className="text-xs text-gray-500 truncate max-w-[160px]">{stock.name}</div>
      </td>
      <td className="px-4 py-3 text-gray-700">{formatNumber(stock.prev_close, 2, true)}</td>
      <td className="px-4 py-3 text-gray-700">{formatNumber(stock.latest_price, 2, true)}</td>
      <td className={`px-4 py-3 font-medium ${priceColor}`}>
        {stock.change_direction === 'UP' && '+'}
        {stock.change_direction === 'DOWN' && '-'}
        {formatNumber(stock.change_abs, 2, true)}
      </td>
      <td className={`px-4 py-3 font-medium ${priceColor}`}>
        {stock.change_direction === 'UP' && '+'}
        {stock.change_direction === 'DOWN' && '-'}
        {formatNumber(stock.change_pct, 2, true)}%
      </td>

      <td className="px-4 py-3 text-gray-700">{formatNumber(stock.high, 2, true)}</td>
      <td className="px-4 py-3 text-gray-700">{formatNumber(stock.low, 2, true)}</td>
      <td className="px-4 py-3 text-gray-700">{formatNumber(stock.avg_price, 2, true)}</td>
      <td className="px-4 py-3 text-gray-700">{formatNumber(stock.volume, 0, true)}</td>
      {/* <td className="px-4 py-3 text-gray-700">{formatLargeNumber(stock.volume)}</td> */}
      <td className="px-4 py-3 text-xs text-gray-500">{stock.trade_time || '--'}</td>
    </tr>
  );
}

// ------------------ Detailed Card ------------------
// function DetailedStockCard({ stock, onBack }: { stock: LiveStock; onBack: () => void }) {
//   return (
//     <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
//             <ArrowLeft className="w-4 h-4" /> Back to Market
//           </Button>
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">{stock.symbol}</h1>
//             <p className="text-lg text-gray-600">{stock.name}</p>
//           </div>
//         </div>
//       </div>
//       <Card>
//         <CardContent className="p-6">Displaying details for {stock.name || stock.symbol}</CardContent>
//       </Card>
//     </div>
//   );
// }

// ------------------ LiveMarket (template only; no sidebar) ------------------
const LiveMarket: React.FC = () => {
  const [liveData, setLiveData] = useState<LiveStock[]>([]);
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | 'pre-open' | 'loading' | 'error'>('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'alpha' | 'volume' | 'gainers' | 'losers'>('alpha');
  const [selectedStock, setSelectedStock] = useState<LiveStock | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: any = await getLiveMarketData();
        // Accept either { data, status, data_timestamp } or a raw array
        if (response && Array.isArray(response.data)) {
          setLiveData(response.data);
          setMarketStatus((response.status as any) || 'open');
          setLastUpdated(new Date(response.data_timestamp || Date.now()));
        } else if (Array.isArray(response)) {
          setLiveData(response as LiveStock[]);
          setMarketStatus('open');
          setLastUpdated(new Date());
        } else {
          setMarketStatus('error');
        }
      } catch (e) {
        setMarketStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, []);

  const sortedAndFilteredData = useMemo(() => {
    let data = [...liveData];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((s) => s.symbol.toLowerCase().includes(term) || (s.name && s.name.toLowerCase().includes(term)));
    }
    switch (sortOrder) {
      case 'alpha':
        data.sort((a, b) => a.symbol.localeCompare(b.symbol));
        break;

case 'gainers':
  data.sort((a, b) => {
    const getGroup = (s: LiveStock) => {
      if (s.change_direction === 'UP') return 0;
      if (!s.change_direction || s.change_direction === 'FLAT') return 1;
      return 2; // DOWN
    };

    const groupA = getGroup(a);
    const groupB = getGroup(b);

    if (groupA !== groupB) return groupA - groupB;

    // Inside UP group: highest to lowest change_pct
    if (groupA === 0) return (b.change_pct ?? 0) - (a.change_pct ?? 0);

    // Inside FLAT group: maintain order or sort alphabetically if needed
    if (groupA === 1) return 0;

    // Inside DOWN group: least negative to most negative
    return (a.change_pct ?? 0) - (b.change_pct ?? 0);
  });
  break;
case 'losers':
  data.sort((a, b) => {
    const getGroup = (s: LiveStock) => {
      if (s.change_direction === 'DOWN') return 0; // group 0 = losers
      if (!s.change_direction || s.change_direction === 'FLAT') return 1; // group 1 = no change
      return 2; // group 2 = gainers
    };

    const groupA = getGroup(a);
    const groupB = getGroup(b);

    if (groupA !== groupB) return groupA - groupB;

    const pctA = a.change_pct ?? 0;
    const pctB = b.change_pct ?? 0;

    if (groupA === 0) {
      // Sort losers: most negative first
      return pctB - pctA; // -9.3 comes before -0.2
    }

    if (groupA === 2) {
      // Sort gainers: smallest gain first
      return pctA - pctB; // +0.2 comes before +5.1
    }

    return 0; // No change — keep as is
  });
  break;


      case 'volume':
      default:
        data.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
        break;
    }

    return data;
  }, [liveData, searchTerm, sortOrder]);

  const marketStats = useMemo(() => {
    if (!liveData.length)
      return { gainers: 0, losers: 0, neutral: 0, totalVolume: 0 };
    return {
      gainers: liveData.filter((s) => s.change_direction === 'UP').length,
      losers: liveData.filter((s) => s.change_direction === 'DOWN').length,
      neutral: liveData.filter((s) => s.change_direction !== 'UP' && s.change_direction !== 'DOWN').length,
      totalVolume: liveData.reduce((sum, s) => sum + (s.volume || 0), 0),
    };
  }, [liveData]);

  const currentStockData = useMemo(() => {
    if (!selectedStock) return null;
    return liveData.find((s) => s.symbol === selectedStock.symbol) || selectedStock;
  }, [liveData, selectedStock]);

  // if (selectedStock && currentStockData) {
  //   return <DetailedStockCard stock={currentStockData} onBack={() => setSelectedStock(null)} />;
  // }

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPI Cards */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                marketStatus === 'open'
                  ? 'bg-green-100 text-green-700'
                  : marketStatus === 'pre-open'
                  ? 'bg-yellow-100 text-yellow-900'
                  : marketStatus === 'closed'
                  ? 'bg-gray-200 text-gray-600'
                  : marketStatus === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {marketStatus === 'open'
                ? 'Market Open'
                : marketStatus === 'closed'
                ? 'Market Closed'
                : marketStatus === 'pre-open'
                ? 'Market Pre-Open'
                : marketStatus === 'error'
                ? 'Error Loading Data'
                : 'Loading...'}
            </span>
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Gainers</p>
                  <p className="text-2xl font-bold">{marketStats.gainers}</p>
                </div>
                <TrendingUp className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Losers</p>
                  <p className="text-2xl font-bold">{marketStats.losers}</p>
                </div>
                <TrendingDown className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Volume</p>
                  <p className="text-2xl font-bold">{(marketStats.totalVolume)}</p>
                  {/* <p className="text-2xl font-bold">{formatLargeNumber(marketStats.totalVolume)}</p> */}
                </div>
                <Activity className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Active Stocks</p>
                  <p className="text-2xl font-bold">{liveData.length}</p>
                </div>
                <DollarSign className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search stocks..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortOrder} onValueChange={(a: 'alpha' | 'volume' | 'gainers' | 'losers') => setSortOrder(a)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alpha">Alphabetical</SelectItem>
              <SelectItem value="volume">Most Active</SelectItem>
              <SelectItem value="gainers">Top Gainers</SelectItem>
              <SelectItem value="losers">Top Losers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-600">Loading Live Market Data...</div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prev Close</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredData.map((stock, index) => (
                    <MarketRow key={stock.symbol} stock={stock} onClick={setSelectedStock} isEven={index % 2 === 0} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LiveMarket;
