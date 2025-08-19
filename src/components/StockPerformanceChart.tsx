import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ["hsl(var(--primary))", "#10b981", "#f97316", "#ef4444", "#6366f1", "#8b5cf6"];

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
}

export function StockPerformanceChart({ data, datasets, title, isLoading, activeTimeframe, onTimeframeChange }: StockPerformanceChartProps) {
  
  // --- THE FIX IS HERE ---
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
      code: companyName, // Use name as a fallback for the legend
      dataPoints: data
    }];
  }
  
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
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
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
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" tickFormatter={(value) => `$${value.toFixed(2)}`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
                formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
              />
              {/* Only show the legend in multi-select mode */}
              {safeDatasets.length > 1 && <Legend verticalAlign="bottom" wrapperStyle={{paddingTop: '20px'}} />}
              {safeDatasets.map((dataset, index) => (
                <Line 
                  key={dataset.code}
                  type="monotone" 
                  dataKey={dataset.code}
                  name={dataset.code}
                  stroke={COLORS[index % COLORS.length]}
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