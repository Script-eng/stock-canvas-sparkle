import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { getLiveMarketData, getMarketStatus, getPredictions, type Prediction } from '@/lib/api';
import { ArrowUp, ArrowDown, Equal } from 'lucide-react';
import StockDetailModal from './StockDetailModal';


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
  // ML Prediction data
  prediction?: {
    predicted_close: number;
    confidence: number;
    signal: 'BUY' | 'SELL' | 'HOLD';
  };
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

// ------------------ MarketRow Component (UPDATED FOR DARK MODE) ------------------
function MarketRow({ stock, onClick, isEven }: { stock: LiveStock; onClick: (s: LiveStock) => void; isEven: boolean }) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 400);
    return () => clearTimeout(t);
  }, [stock.latest_price]);

  // Use theme-aware colors for price changes
  const priceColor =
    stock.change_direction === 'UP' ? 'text-success' : stock.change_direction === 'DOWN' ? 'text-destructive' : 'text-foreground';

  // Use theme-aware background colors for table rows
  // Tailwind's `even:` and `odd:` variants are more robust than `isEven` prop
  // The `bg-background` will be your base page color. `bg-muted` is a lighter/darker variant.
  // Using `even:bg-muted/20` and `odd:bg-background` provides subtle row distinction.
  const rowBgClass = isEven ? 'bg-muted/20' : 'bg-background'; // Keeping `isEven` for now, but `even:bg-muted/20` would be better on `<tr>`

  // Flash effect background, using primary theme color for emphasis
  const flashBg = flash ? 'bg-primary/10' : ''; 

  return (
    <tr
      // Apply theme-aware classes
      className={`${rowBgClass} ${flashBg} hover:bg-muted/50 cursor-pointer transition-colors duration-300 border-b border-border`}
      onClick={() => onClick(stock)}
    >
      <td className="px-4 py-3">
        <div className="font-bold text-foreground">{stock.symbol}</div> {/* Use foreground for main text */}
        <div className="text-xs text-muted-foreground truncate max-w-[160px]">{stock.name}</div> {/* Use muted-foreground for secondary text */}
      </td>
      <td className="px-4 py-3 text-foreground">{formatNumber(stock.prev_close, 2, true)}</td> {/* Use foreground */}
      <td className="px-4 py-3 text-foreground">{formatNumber(stock.latest_price, 2, true)}</td> {/* Use foreground */}

      {/* Predicted Close Column - NEW */}
      <td className="px-4 py-3">
        {stock.prediction ? (
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${
              stock.prediction.signal === 'BUY' ? 'text-success' :
              stock.prediction.signal === 'SELL' ? 'text-destructive' :
              'text-muted-foreground'
            }`}>
              {formatNumber(stock.prediction.predicted_close, 2, true)}
            </span>
            <Badge
              variant="outline"
              className={`text-xs ${
                stock.prediction.signal === 'BUY' ? 'border-success text-success' :
                stock.prediction.signal === 'SELL' ? 'border-destructive text-destructive' :
                'border-muted text-muted-foreground'
              }`}
            >
              {stock.prediction.signal} {(stock.prediction.confidence * 100).toFixed(0)}%
            </Badge>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">--</span>
        )}
      </td>

      <td className={`px-4 py-3 font-medium ${priceColor}`}>
        <span className="flex items-center gap-1">
          {stock.change_direction === 'UP' && (
            <ArrowUp className="w-4 h-4 text-success" />
          )}
          {stock.change_direction === 'DOWN' && (
            <ArrowDown className="w-4 h-4 text-destructive" />
          )}
          {stock.change_direction === 'FLAT' && (
            <Equal className="w-4 h-4 text-muted-foreground" />
          )}
          {formatNumber(stock.change_abs, 2, true)}
        </span>
      </td>
      <td className={`px-4 py-3 font-medium ${priceColor}`}>
        <span className="flex items-center gap-1">
          {stock.change_direction === 'UP' && '+'}
          {stock.change_direction === 'DOWN' && ''} {/* No '-' needed as formatNumber handles negative signs */}
          {formatNumber(stock.change_pct, 2, true)}%
        </span>
      </td>

      <td className="px-4 py-3 text-foreground">{formatNumber(stock.high, 2, true)}</td> {/* Use foreground */}
      <td className="px-4 py-3 text-foreground">{formatNumber(stock.low, 2, true)}</td> {/* Use foreground */}
      <td className="px-4 py-3 text-foreground">{formatNumber(stock.avg_price, 2, true)}</td> {/* Use foreground */}
      <td className="px-4 py-3 text-foreground">{formatNumber(stock.volume, 0, true)}</td> {/* Use foreground */}
      <td className="px-4 py-3 text-xs text-muted-foreground">{stock.trade_time || '--'}</td> {/* Use muted-foreground */}
    </tr>
  );
}

// ------------------ LiveMarket Component (UPDATED FOR DARK MODE) ------------------
const LiveMarket: React.FC = () => {
  const [liveData, setLiveData] = useState<LiveStock[]>([]);
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | 'pre-open' | 'loading' | 'error'>('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'alpha' | 'volume' | 'gainers' | 'losers'>('alpha');
  const [selectedStock, setSelectedStock] = useState<LiveStock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStockPrediction, setSelectedStockPrediction] = useState<Prediction | null>(null);

  const handleStockClick = async (stock: LiveStock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);

    // Fetch full prediction details for this stock
    if (stock.prediction) {
      try {
        const response = await getPredictions(stock.symbol);
        if (response && response.predictions && response.predictions.length > 0) {
          setSelectedStockPrediction(response.predictions[0]);
        }
      } catch (err) {
        console.error('Failed to fetch detailed prediction:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
    setSelectedStockPrediction(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both live data and predictions in parallel
        const [liveResponse, predictionsResponse] = await Promise.all([
          getLiveMarketData(),
          getPredictions()
        ]);

        let stockData: LiveStock[] = [];

        // Extract live data
        if (liveResponse && typeof liveResponse === 'object' && 'data' in liveResponse && Array.isArray((liveResponse as any).data)) {
          stockData = (liveResponse as any).data;
        } else if (Array.isArray(liveResponse)) {
          stockData = liveResponse as LiveStock[];
        }

        // Merge predictions into live data
        if (predictionsResponse && predictionsResponse.predictions) {
          const predictionsMap = new Map(
            predictionsResponse.predictions.map(pred => [
              pred.symbol,
              {
                predicted_close: pred.predicted_close,
                confidence: pred.ensemble_confidence,
                signal: pred.signal
              }
            ])
          );

          stockData = stockData.map(stock => ({
            ...stock,
            prediction: predictionsMap.get(stock.symbol)
          }));
        }

        setLiveData(stockData);
        setLastUpdated(new Date());
      } catch (e) {
        console.error('Error fetching live market data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const id = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(id);
  }, []);

  
  useEffect(() => {
      const fetchStatus = async () => {
      try {
        const status = await getMarketStatus();
        setMarketStatus(status as any);
      } catch (e) {
        setMarketStatus('error');
      }
    };
    fetchStatus();
    const statusId = setInterval(fetchStatus, 60000); // Poll every minute
    return () => clearInterval(statusId);
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

  // The DetailedStockCard is commented out, so this part isn't active
  // const currentStockData = useMemo(() => {
  //   if (!selectedStock) return null;
  //   return liveData.find((s) => s.symbol === selectedStock.symbol) || selectedStock;
  // }, [liveData, selectedStock]);

  return (
    // Top-level container uses `bg-background` to adapt
    <div className="min-h-screen bg-background text-foreground"> 

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPI Cards */}
        <div>
          <div className="flex flex-wrap items-center gap-4 mb-4 w-full">
            {/* Market Status Indicator - using theme-aware state colors */}
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold 
                ${
                  marketStatus === 'open'
                    ? 'bg-success/20 text-success' // Using success theme color
                    : marketStatus === 'pre-open'
                    ? 'bg-warning/20 text-warning' // Using warning theme color
                    : marketStatus === 'closed'
                    ? 'bg-muted/20 text-muted-foreground' // Using muted theme color
                    : marketStatus === 'error'
                    ? 'bg-destructive/20 text-destructive' // Using destructive theme color
                    : 'bg-primary/20 text-primary' // Using primary theme color as a fallback
                }`
              }
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
              <>
                <span className="text-xs text-muted-foreground">{lastUpdated.toLocaleTimeString()}</span> {/* Use muted-foreground */}
                <div className="flex-1" />
                <span className="text-xs text-muted-foreground">{lastUpdated.toLocaleDateString()}</span> {/* Use muted-foreground */}
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* KPI Cards - adapted to use `bg-card` and theme-aware text colors */}
          <Card className="bg-card text-foreground border border-border shadow-sm"> {/* Use bg-card, text-foreground, border-border */}
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Gainers</p> {/* Use muted-foreground */}
                  <p className="text-2xl font-bold text-success">{marketStats.gainers}</p> {/* Use text-success */}
                </div>
                <TrendingUp className="w-8 h-8 text-success" /> {/* Use text-success */}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card text-foreground border border-border shadow-sm"> {/* Use bg-card, text-foreground, border-border */}
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Losers</p> {/* Use muted-foreground */}
                  <p className="text-2xl font-bold text-destructive">{marketStats.losers}</p> {/* Use text-destructive */}
                </div>
                <TrendingDown className="w-8 h-8 text-destructive" /> {/* Use text-destructive */}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card text-foreground border border-border shadow-sm"> {/* Use bg-card, text-foreground, border-border */}
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Volume</p> {/* Use muted-foreground */}
                  <p className="text-2xl font-bold text-primary">{formatNumber(marketStats.totalVolume, 0, true)}</p> {/* Use text-primary */}
                </div>
                <Activity className="w-8 h-8 text-primary" /> {/* Use text-primary */}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card text-foreground border border-border shadow-sm"> {/* Use bg-card, text-foreground, border-border */}
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Turnover</p> {/* Use muted-foreground */}
                  <p className="text-2xl font-bold text-foreground"> {/* Use foreground for neutral color */}
                  {formatNumber(liveData.reduce((sum, s) => sum + ((s.avg_price ?? 0) * (s.volume ?? 0)), 0), 2, true)}
                  </p>
                </div>
                <p className="text-muted-foreground"> KES</p> {/* Use muted-foreground */}
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls - adapted to use `bg-card` and theme-aware colors */}
        <div className="flex items-center justify-between gap-4 mb-6 bg-card p-4 rounded-lg shadow-sm border border-border"> {/* Use bg-card, border-border */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" /> {/* Use muted-foreground */}
            <Input
              placeholder="Search stocks..."
              className="pl-10 bg-input text-foreground border-border placeholder:text-muted-foreground" // Use bg-input, text-foreground, border-border
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortOrder} onValueChange={(a: 'alpha' | 'volume' | 'gainers' | 'losers') => setSortOrder(a)}>
            <SelectTrigger className="w-[200px] bg-card text-foreground border-border [&>span]:text-foreground"> {/* Use bg-card, text-foreground */}
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            {/* SelectContent and SelectItem should already adapt if they use theme-aware components */}
            <SelectContent className="bg-popover text-popover-foreground border-border"> 
              <SelectItem value="alpha" className="hover:bg-accent hover:text-accent-foreground">Alphabetical</SelectItem>
              <SelectItem value="volume" className="hover:bg-accent hover:text-accent-foreground">Most Active</SelectItem>
              <SelectItem value="gainers" className="hover:bg-accent hover:text-accent-foreground">Top Gainers</SelectItem>
              <SelectItem value="losers" className="hover:bg-accent hover:text-accent-foreground">Top Losers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table - adapted to use theme-aware colors */}
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading Live Market Data...</div> // Use muted-foreground
        ) : (
          <Card className="overflow-hidden bg-card text-card-foreground border border-border shadow-sm"> {/* Use bg-card, text-card-foreground, border-border */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted border-b border-border"><tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Security</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prev Close</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Latest Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Predicted Close</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Change</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Change %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">High</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Low</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Volume</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                </tr></thead>
                <tbody>
                  {sortedAndFilteredData.map((stock, index) => (
                    // MarketRow component already updated
                    <MarketRow key={stock.symbol} stock={stock} onClick={handleStockClick} isEven={index % 2 === 0} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Stock Detail Modal */}
      <StockDetailModal
        stock={selectedStock}
        fullPrediction={selectedStockPrediction}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default LiveMarket;