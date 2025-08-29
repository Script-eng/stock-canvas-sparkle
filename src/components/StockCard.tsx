import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LiveStockData } from '@/pages/LiveMarket';

interface StockCardProps {
  stock: LiveStockData;
  previousStock?: LiveStockData;
}

// --- NEW HELPER FUNCTION ---
// A safe way to format numbers, with a fallback for null/undefined values.
const formatNumber = (value: number | null | undefined, decimals = 2): string => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toFixed(decimals);
  }
  return '--'; // Fallback display text
};

export function StockCard({ stock, previousStock }: StockCardProps) {
  const [flashColor, setFlashColor] = useState<'green' | 'red' | null>(null);

  useEffect(() => {
    if (previousStock && stock.latest_price !== previousStock.latest_price) {
      const newFlashColor = stock.latest_price > previousStock.latest_price ? 'green' : 'red';
      setFlashColor(newFlashColor);
      const timer = setTimeout(() => setFlashColor(null), 500);
      return () => clearTimeout(timer);
    }
  }, [stock.latest_price, previousStock]);

  const priceColor = stock.change_direction === 'UP' ? 'text-success' : stock.change_direction === 'DOWN' ? 'text-destructive' : 'text-muted-foreground';
  
  const flashBgClass = {
    green: 'bg-green-500/20',
    red: 'bg-red-500/20',
  }[flashColor] || '';
  
  // --- ROBUST CALCULATION ---
  // Ensure high and low are numbers before calculating the range.
  const rangePercentage = (typeof stock.high === 'number' && typeof stock.low === 'number' && (stock.high - stock.low) > 0)
    ? (( (stock.latest_price || 0) - stock.low) / (stock.high - stock.low)) * 100
    : 50;

  return (
    <Card className={`transition-all duration-300 ${flashBgClass}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-bold">{stock.symbol}</span>
          <span className="text-xs text-muted-foreground">{stock.trade_time}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground truncate">{stock.name || stock.symbol}</p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className={`text-3xl font-bold ${priceColor}`}>{formatNumber(stock.latest_price)}</p>
          <p className={`text-sm font-medium ${priceColor}`}>
            {stock.change_direction === 'UP' ? '+' : ''}{formatNumber(stock.change_abs)}
            {' ('}{stock.change_direction === 'UP' ? '+' : ''}{formatNumber(stock.change_pct)}%
            {')'}
          </p>
        </div>

        <div className="space-y-1 mb-4">
            <div className="relative w-full h-1.5 bg-muted rounded-full">
                <div 
                    className="absolute h-1.5 bg-primary rounded-full"
                    style={{ left: `${Math.max(0, Math.min(100, rangePercentage))}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="w-3 h-3 -mt-1 rounded-full bg-primary border-2 border-card"></div>
                </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatNumber(stock.low)}</span>
                <span>{formatNumber(stock.high)}</span>
            </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Volume: {(typeof stock.volume === 'number') ? stock.volume.toLocaleString() : '--'}
        </div>
      </CardContent>
    </Card>
  );
}