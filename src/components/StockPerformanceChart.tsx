import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- NEW: Single stock data point structure ---
interface HistoryDataPoint {
  date: string;
  closing: number;
}

// Multi-stock dataset structure
interface StockDataset {
  companyName: string;
  code: string;
  dataPoints: HistoryDataPoint[];
}

interface StockPerformanceChartProps {
  // --- MODIFIED PROPS ---
  // Accept EITHER the old `data` prop OR the new `datasets` prop
  data?: HistoryDataPoint[]; // For single stock on Markets page
  datasets?: StockDataset[]; // For multiple stocks on Analytics page
  
  title: string;
  isLoading: boolean;
  activeTimeframe: 'D' | 'ME' | 'YE';
  onTimeframeChange: (timeframe: 'D' | 'ME' | 'YE') => void;
  isDarkMode?: boolean; // Now explicitly added to the interface
}

// Helper to get a CSS variable value, returning an HSL string
const getCssVar = (varName: string, fallbackLight: string, fallbackDark: string, isDark: boolean) => {
  if (typeof window === 'undefined' || !document.documentElement) {
    return isDark ? fallbackDark : fallbackLight;
  }
  const rootStyle = getComputedStyle(document.documentElement);
  const value = rootStyle.getPropertyValue(varName).trim();
  // Return as HSL string, Recharts generally handles this well
  return value ? `hsl(${value})` : (isDark ? fallbackDark : fallbackLight);
};


export function StockPerformanceChart({ data, datasets, title, isLoading, activeTimeframe, onTimeframeChange, isDarkMode = false }: StockPerformanceChartProps) {
  
  // This logic makes the component flexible.
  // It ensures `safeDatasets` is always in the multi-stock format, regardless of which prop was passed.
  let safeDatasets: StockDataset[] = [];
  if (Array.isArray(datasets)) {
    safeDatasets = datasets;
  } else if (Array.isArray(data)) {
    // If the old `data` prop is used, we convert it into the `datasets` structure.
    // We extract the title to get the company name.
    const companyName = title.replace(" Performance", "");
    safeDatasets = [{
      companyName: companyName,
      code: companyName, // Use name as a fallback for the legend/dataKey
      dataPoints: data
    }];
  }
  
  // Memoize theme-dependent chart configurations
  const chartTheme = useMemo(() => {
    return {
      axisLineAndTickColor: getCssVar('--muted-foreground', 'hsl(215 16% 47%)', 'hsl(215 20.2% 65.1%)', isDarkMode),
      gridStrokeColor: getCssVar('--border', 'hsl(220 10% 90%)', 'hsl(217.2 32.6% 17.5%)', isDarkMode),
      tooltipBg: getCssVar('--popover', 'hsl(0 0% 100%)', 'hsl(222.2 84% 4.9%)', isDarkMode),
      tooltipBorder: getCssVar('--border', 'hsl(220 10% 90%)', 'hsl(217.2 32.6% 17.5%)', isDarkMode),
      tooltipText: getCssVar('--popover-foreground', 'hsl(215 25% 27%)', 'hsl(210 40% 98%)', isDarkMode),
      legendText: getCssVar('--muted-foreground', 'hsl(215 16% 47%)', 'hsl(215 20.2% 65.1%)', isDarkMode),
    };
  }, [isDarkMode]); // Recalculate if dark mode changes

  // Dynamically generated line colors for multiple datasets
  const dynamicLineColors = useMemo(() => {
    // These colors correspond to the CSS variables defined in your globals.css
    // Ensure these variables provide good contrast in both light and dark modes
    return [
      getCssVar('--primary', 'hsl(217 91% 55%)', 'hsl(217 91% 70%)', isDarkMode),
      getCssVar('--accent', 'hsl(142 76% 36%)', 'hsl(142 70% 60%)', isDarkMode),
      getCssVar('--destructive', 'hsl(0 84% 60%)', 'hsl(0 80% 65%)', isDarkMode),
      getCssVar('--warning', 'hsl(25 95% 53%)', 'hsl(25 90% 65%)', isDarkMode),
      getCssVar('--secondary-foreground', 'hsl(215 25% 27%)', 'hsl(210 40% 98%)', isDarkMode), // A fallback/additional color
      '#6366f1', // Direct hex as a last resort, but prefer CSS vars
      '#8b5cf6',
    ];
  }, [isDarkMode]);

  const baseData = safeDatasets.length > 0 
    ? safeDatasets.reduce((longest, current) => current.dataPoints.length > longest.dataPoints.length ? current : longest)
    : { dataPoints: [] };
    
  const combinedData = baseData.dataPoints.map((point, index) => {
    const date = new Date(point.date);
    const formatOptions: Intl.DateTimeFormatOptions = activeTimeframe === 'D' 
      ? { month: 'short', day: 'numeric' }
      : { month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', formatOptions);
    
    let dataEntry: any = { time: formattedDate };
    safeDatasets.forEach(set => {
      if (set.dataPoints[index]) {
        dataEntry[set.code] = set.dataPoints[index].closing;
      }
    });
    return dataEntry;
  });

  return (
    <Card className="h-full flex flex-col bg-card text-card-foreground"> {/* Ensure Card uses theme-aware classes */}
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-card-foreground">{title}</CardTitle> {/* Ensure CardTitle uses theme-aware classes */}
          <p className="text-sm text-muted-foreground">Price history comparison</p>
        </div>
        <Tabs value={activeTimeframe} onValueChange={(value) => onTimeframeChange(value as 'D' | 'ME' | 'YE')} className="w-fit">
          <TabsList>
            <TabsTrigger value="D">Daily</TabsTrigger>
            <TabsTrigger value="ME">Monthly</TabsTrigger>
            <TabsTrigger value="YE">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full"><p className="text-muted-foreground">Loading chart data...</p></div>
        ) : safeDatasets.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStrokeColor} className="opacity-70" /> {/* Use theme-aware grid color */}
              <XAxis dataKey="time" axisLine={false} tickLine={false} className="text-xs" stroke={chartTheme.axisLineAndTickColor} tick={{ fill: chartTheme.axisLineAndTickColor }} /> {/* Use theme-aware axis/tick color */}
              <YAxis axisLine={false} tickLine={false} className="text-xs" tickFormatter={(value) => `${value.toFixed(2)}`} stroke={chartTheme.axisLineAndTickColor} tick={{ fill: chartTheme.axisLineAndTickColor }} /> {/* Use theme-aware axis/tick color */}
              <Tooltip
                contentStyle={{ 
                  backgroundColor: chartTheme.tooltipBg, 
                  border: `1px solid ${chartTheme.tooltipBorder}`, 
                  borderRadius: '0.5rem',
                  color: chartTheme.tooltipText, // For content text color
                }}
                itemStyle={{ color: chartTheme.tooltipText }} // For individual item text color
                labelStyle={{ color: chartTheme.tooltipText }} // For label text color
              />
              {/* Only show the legend in multi-select mode */}
              {safeDatasets.length > 1 && (
                <Legend 
                  verticalAlign="bottom" 
                  wrapperStyle={{ paddingTop: '20px' }} 
                  iconType="circle" 
                  payload={safeDatasets.map((set, idx) => ({ 
                    id: set.code, 
                    value: set.companyName, 
                    type: 'line', 
                    color: dynamicLineColors[idx % dynamicLineColors.length] 
                  }))}
                  formatter={(value, entry) => <span style={{ color: chartTheme.legendText }}>{entry.value}</span>} // Use theme-aware legend text color
                />
              )}
              {safeDatasets.map((dataset, index) => (
                <Line 
                  key={dataset.code}
                  type="monotone" 
                  dataKey={dataset.code}
                  name={dataset.companyName} // Use companyName for clearer legend/tooltip
                  stroke={dynamicLineColors[index % dynamicLineColors.length]} // Use theme-aware line colors
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full"><p className="text-muted-foreground">No data available.</p></div>
        )}
      </CardContent>
    </Card>
  );
}