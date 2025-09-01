import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, ArrowUpDown } from "lucide-react";

// Define the shape of the data and props
interface Stock {
  code: string;
  name: string;
  closing: number;
  change_pct: number;
  volume: number;
}

interface SortConfig {
  key: string;
  order: 'asc' | 'desc';
}

interface MarketSummaryTableProps {
  data: Stock[];
  selectionMode: 'single' | 'multiple';
  
  // Single selection props
  onRowClick?: (stock: Stock) => void;
  selectedStockCode?: string;
  
  // Multi-selection props
  selectedStocks?: Stock[];
  onSelectionChange?: (selectedStocks: Stock[]) => void;
  
  // Sorting props
  sortConfig?: SortConfig;
  onSortChange?: (sortKey: string) => void;
  
  // Watchlist props
  watchlist?: string[];
  onWatchlistToggle?: (stockCode: string) => void;
}

export function MarketSummaryTable({
  data,
  selectionMode,
  onRowClick,
  selectedStockCode,
  selectedStocks,
  onSelectionChange,
  sortConfig,
  onSortChange,
  watchlist,
  onWatchlistToggle
}: MarketSummaryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Robustly handle props that might be initially undefined
  const tableData = Array.isArray(data) ? data : [];
  const safeSelectedStocks = Array.isArray(selectedStocks) ? selectedStocks : [];

  const filteredData = tableData.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCodes = new Set(safeSelectedStocks.map(s => s.code));

  const handleSelect = (stock: Stock) => {
    if (selectionMode === 'single' && onRowClick) {
      onRowClick(stock);
    } else if (selectionMode === 'multiple' && onSelectionChange) {
      const isSelected = selectedCodes.has(stock.code);
      if (isSelected) {
        onSelectionChange(safeSelectedStocks.filter(s => s.code !== stock.code));
      } else {
        onSelectionChange([...safeSelectedStocks, stock]);
      }
    }
  };

  // A helper component for creating sortable table headers
  const SortableHeader = ({ sortKey, children, className }: { sortKey: string, children: React.ReactNode, className?: string }) => (
    <Button variant="ghost" onClick={() => onSortChange && onSortChange(sortKey)} className={className}>
      {children}
      {sortConfig?.key === sortKey && <ArrowUpDown className="ml-2 h-4 w-4" />}
    </Button>
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Market Summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectionMode === 'single' ? 'Click a stock to view its chart' : 'Select stocks to compare'}
          </p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {onWatchlistToggle && <TableHead className="w-12"></TableHead>}
              {selectionMode === 'multiple' && <TableHead className="w-12"></TableHead>}
              <TableHead><SortableHeader sortKey="code">Symbol</SortableHeader></TableHead>
              <TableHead><SortableHeader sortKey="name">Company</SortableHeader></TableHead>
              <TableHead className="text-right"><SortableHeader sortKey="closing" className="justify-end w-full">Price</SortableHeader></TableHead>
              <TableHead className="text-right"><SortableHeader sortKey="change_pct" className="justify-end w-full">% Change</SortableHeader></TableHead>
              <TableHead className="text-right"><SortableHeader sortKey="volume" className="justify-end w-full">Volume</SortableHeader></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((stock) => {
              const isSelected = selectionMode === 'single' ? stock.code === selectedStockCode : selectedCodes.has(stock.code);
              const isInWatchlist = watchlist?.includes(stock.code);
              return (
                <TableRow
                  key={stock.code}
                  onClick={() => handleSelect(stock)}
                  className={`cursor-pointer transition-colors ${isSelected ? 'bg-muted hover:bg-muted' : 'hover:bg-muted/50'}`}
                  data-state={isSelected ? 'selected' : ''}
                >
                  {onWatchlistToggle && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => onWatchlistToggle(stock.code)}>
                        <Star className={`h-4 w-4 ${isInWatchlist ? 'fill-yellow-400 text-yellow-500' : 'text-muted-foreground'}`} />
                      </Button>
                    </TableCell>
                  )}
                  {selectionMode === 'multiple' && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onCheckedChange={() => handleSelect(stock)} />
                    </TableCell>
                  )}
                  <TableCell className={`font-semibold ${isSelected ? 'text-primary' : ''}`}>{stock.code}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{stock.name}</TableCell>
                  <TableCell className="font-medium text-right">{stock.closing.toFixed(2)}</TableCell>
                  <TableCell className={`font-medium text-right ${stock.change_pct >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{stock.volume.toLocaleString()}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}