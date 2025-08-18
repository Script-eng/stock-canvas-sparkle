// import { useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
// import { Maximize2 } from "lucide-react"

// // Structure of a data point from your history API
// interface HistoryDataPoint {
//   date: string;       // e.g., "Wed, 13 Aug 2025 00:00:00 GMT"
//   closing: number;
// }

// // The cleaner format our internal chart component will use
// interface ChartDataPoint {
//   time: string;       // e.g., "Aug 13"
//   price: number;
// }

// interface StockPerformanceChartProps {
//   data: HistoryDataPoint[];
//   title: string;
// }

// function ChartComponent({ data, height = 300 }: { data: ChartDataPoint[], height?: number }) {
//   if (data.length === 0) {
//     return (
//       <div style={{ height }} className="flex items-center justify-center">
//         <p className="text-muted-foreground">No data available for this period.</p>
//       </div>
//     );
//   }

//   return (
//     <ResponsiveContainer width="100%" height={height}>
//       <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
//         <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
//         <XAxis 
//           dataKey="time" 
//           axisLine={false}
//           tickLine={false}
//           className="text-xs"
//         />
//         <YAxis 
//           axisLine={false}
//           tickLine={false}
//           className="text-xs"
//           domain={['dataMin - 1', 'dataMax + 1']}
//           tickFormatter={(value) => `$${value.toFixed(2)}`}
//         />
//         <Tooltip 
//           contentStyle={{
//             backgroundColor: 'hsl(var(--card))',
//             border: '1px solid hsl(var(--border))',
//             borderRadius: '8px',
//           }}
//           formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
//           labelFormatter={(label) => `Date: ${label}`}
//         />
//         <Line 
//           type="monotone" 
//           dataKey="price" 
//           stroke="hsl(var(--primary))" 
//           strokeWidth={2}
//           dot={false}
//           name="Price"
//         />
//       </LineChart>
//     </ResponsiveContainer>
//   )
// }

// export function StockPerformanceChart({ data, title }: StockPerformanceChartProps) {
//   const [isFullScreen, setIsFullScreen] = useState(false);

//   // --- THE FIX IS HERE ---
//   // We MUST format the complex date string from the API into a simple,
//   // human-readable format before passing it to the chart.
//   const chartData = data.map(item => {
//     const date = new Date(item.date);
//     // Formats the date to a short version, e.g., "Aug 13"
//     const formattedDate = date.toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric',
//     });
//     return { time: formattedDate, price: item.closing };
//   });

//   const chartTitle = title || "Stock Performance";

//   return (
//     <>
//       <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group" onClick={() => setIsFullScreen(true)}>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <div>
//             <CardTitle className="text-lg font-semibold">{chartTitle}</CardTitle>
//             <p className="text-sm text-muted-foreground">Daily price history</p>
//           </div>
//           <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
//             <Maximize2 className="h-4 w-4" />
//           </Button>
//         </CardHeader>
//         <CardContent>
//           <ChartComponent data={chartData} />
//         </CardContent>
//       </Card>

//       <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
//         <DialogContent className="max-w-7xl w-[95vw] h-[90vh] flex flex-col">
//           <DialogHeader className="flex-shrink-0">
//             <DialogTitle className="text-2xl font-bold">{chartTitle}</DialogTitle>
//           </DialogHeader>
//           <div className="flex-1 overflow-auto p-4">
//             <ChartComponent data={chartData} height={500} />
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }
// import { useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
// import { Maximize2 } from "lucide-react"

// interface HistoryDataPoint {
//   date: string;
//   closing: number;
// }
// interface ChartDataPoint {
//   time: string;
//   price: number;
// }

// interface StockPerformanceChartProps {
//   data: HistoryDataPoint[];
//   title: string;
//   isLoading: boolean;
//   activeTimeframe: 'D' | 'ME' | 'YE';
//   onTimeframeChange: (timeframe: 'D' | 'ME' | 'YE') => void;
// }

// function ChartComponent({ data, height = 300 }: { data: ChartDataPoint[], height?: number }) {
//   // Chart rendering logic (unchanged)
//   return (
//     <ResponsiveContainer width="100%" height={height}>
//       <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
//         <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
//         <XAxis dataKey="time" axisLine={false} tickLine={false} className="text-xs" />
//         <YAxis 
//           axisLine={false} 
//           tickLine={false} 
//           className="text-xs" 
//           domain={['dataMin - 1', 'dataMax + 1']} 
//           tickFormatter={(value) => `$${value.toFixed(2)}`} 
//         />
//         <Tooltip
//           contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
//           formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
//           labelFormatter={(label) => `Date: ${label}`}
//         />
//         <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Price" />
//       </LineChart>
//     </ResponsiveContainer>
//   )
// }

// export function StockPerformanceChart({ data, title, isLoading, activeTimeframe, onTimeframeChange }: StockPerformanceChartProps) {
//   const [isFullScreen, setIsFullScreen] = useState(false);

//   const chartData = data.map(item => {
//     const date = new Date(item.date);
//     const formatOptions: Intl.DateTimeFormatOptions = activeTimeframe === 'D' 
//       ? { month: 'short', day: 'numeric' }
//       : { month: 'short', year: 'numeric' };
//     return { time: date.toLocaleDateString('en-US', formatOptions), price: item.closing };
//   });

//   const chartTitle = title || "Stock Performance";

//   const TimeframeTabs = () => (
//     <Tabs value={activeTimeframe} onValueChange={(value) => onTimeframeChange(value as 'D' | 'ME' | 'YE')} className="w-fit">
//       <TabsList>
//         <TabsTrigger value="D">Daily</TabsTrigger>
//         <TabsTrigger value="ME">Monthly</TabsTrigger>
//         <TabsTrigger value="YE">Yearly</TabsTrigger>
//       </TabsList>
//     </Tabs>
//   );

//   return (
//     <>
//       <Card>
//         <CardHeader className="flex flex-row items-start justify-between">
//           <div>
//             <CardTitle className="text-lg font-semibold">{chartTitle}</CardTitle>
//             <p className="text-sm text-muted-foreground">Price history</p>
//           </div>
//           <TimeframeTabs />
//         </CardHeader>
//         <CardContent className="h-[300px]">
//           {isLoading ? (
//             <div className="flex items-center justify-center h-full">
//               <p className="text-muted-foreground">Loading chart data...</p>
//             </div>
//           ) : data.length > 0 ? (
//             <ChartComponent data={chartData} />
//           ) : (
//             <div className="flex items-center justify-center h-full">
//               <p className="text-muted-foreground">No data available for this timeframe.</p>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//       <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
//          <DialogContent className="max-w-7xl w-[95vw] h-[90vh] flex flex-col">
//           <DialogHeader className="flex-shrink-0">
//           <DialogTitle className="text-2xl font-bold">{chartTitle}</DialogTitle>
//         </DialogHeader>
//          <div className="flex-1 overflow-auto p-4">
//           <ChartComponent data={chartData} height={500} />
//         </div>
//        </DialogContent>
//      </Dialog>

//       {/* Full-screen dialog is removed for simplicity of this step. Can be re-added later. */}
//     </>
//   )
// }

// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// // A pre-defined color palette for the chart lines
// const COLORS = ["hsl(var(--primary))", "#10b981", "#f97316", "#ef4444", "#6366f1"];

// // The shape of a single dataset returned by our API
// interface StockDataset {
//   companyName: string;
//   code: string;
//   dataPoints: {
//     date: string;
//     closing: number;
//   }[];
// }

// interface StockPerformanceChartProps {
//   datasets: StockDataset[];
//   title: string;
//   isLoading: boolean;
//   activeTimeframe: 'D' | 'ME' | 'YE';
//   onTimeframeChange: (timeframe: 'D' | 'ME' | 'YE') => void;
// }

// export function StockPerformanceChart({ datasets, title, isLoading, activeTimeframe, onTimeframeChange }: StockPerformanceChartProps) {
  
//   // Find the longest data array to use as the base for the X-axis
//   const baseData = datasets.length > 0 
//     ? datasets.reduce((longest, current) => current.dataPoints.length > longest.dataPoints.length ? current : longest)
//     : { dataPoints: [] };
    
//   // Combine all data into a format recharts can use for a shared X-axis
//   const combinedData = baseData.dataPoints.map((point, index) => {
//     const date = new Date(point.date);
//     const formatOptions: Intl.DateTimeFormatOptions = activeTimeframe === 'D' 
//       ? { month: 'short', day: 'numeric' }
//       : { month: 'short', year: 'numeric' };
//     const formattedDate = date.toLocaleDateString('en-US', formatOptions);
    
//     let dataEntry: any = { time: formattedDate };
//     datasets.forEach(set => {
//       if (set.dataPoints[index]) {
//         dataEntry[set.code] = set.dataPoints[index].closing;
//       }
//     });
//     return dataEntry;
//   });

//   return (
//     <Card className="h-full flex flex-col">
//       <CardHeader className="flex flex-row items-start justify-between">
//         <div>
//           <CardTitle className="text-lg font-semibold">{title}</CardTitle>
//           <p className="text-sm text-muted-foreground">Price history comparison</p>
//         </div>
//         <Tabs value={activeTimeframe} onValueChange={(value) => onTimeframeChange(value as 'D' | 'ME' | 'YE')} className="w-fit">
//           <TabsList>
//             <TabsTrigger value="D">Daily</TabsTrigger>
//             <TabsTrigger value="ME">Monthly</TabsTrigger>
//             <TabsTrigger value="YE">Yearly</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </CardHeader>
//       <CardContent className="flex-1">
//         {isLoading ? (
//           <div className="flex items-center justify-center h-full"><p className="text-muted-foreground">Loading chart data...</p></div>
//         ) : datasets.length > 0 ? (
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={combinedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
//               <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
//               <XAxis dataKey="time" axisLine={false} tickLine={false} className="text-xs" />
//               <YAxis axisLine={false} tickLine={false} className="text-xs" tickFormatter={(value) => `$${value.toFixed(2)}`} />
//               <Tooltip
//                 contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
//                 formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
//               />
//               <Legend />
//               {datasets.map((dataset, index) => (
//                 <Line 
//                   key={dataset.code}
//                   type="monotone" 
//                   dataKey={dataset.code}
//                   name={dataset.code} // The legend will show the stock code
//                   stroke={COLORS[index % COLORS.length]} // Cycle through our color palette
//                   strokeWidth={2}
//                   dot={false}
//                 />
//               ))}
//             </LineChart>
//           </ResponsiveContainer>
//         ) : (
//           <div className="flex items-center justify-center h-full"><p className="text-muted-foreground">Select one or more stocks to compare.</p></div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// interface HistoryDataPoint {
//   date: string;
//   closing: number;
// }
// interface ChartDataPoint {
//   time: string;
//   price: number;
// }

// interface StockPerformanceChartProps {
//   data: HistoryDataPoint[];
//   title: string;
//   isLoading: boolean;
//   activeTimeframe: 'D' | 'ME' | 'YE';
//   onTimeframeChange: (timeframe: 'D' | 'ME' | 'YE') => void;
// }

// function ChartComponent({ data, height = 300 }: { data: ChartDataPoint[], height?: number }) {
//   return (
//     <ResponsiveContainer width="100%" height={height}>
//       <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
//         <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
//         <XAxis dataKey="time" axisLine={false} tickLine={false} className="text-xs" />
//         <YAxis 
//           axisLine={false} 
//           tickLine={false} 
//           className="text-xs" 
//           domain={['dataMin - 1', 'dataMax + 1']} 
//           tickFormatter={(value) => `$${value.toFixed(2)}`} 
//         />
//         <Tooltip
//           contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
//           formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
//           labelFormatter={(label) => `Date: ${label}`}
//         />
//         <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Price" />
//       </LineChart>
//     </ResponsiveContainer>
//   )
// }

// export function StockPerformanceChart({ data, title, isLoading, activeTimeframe, onTimeframeChange }: StockPerformanceChartProps) {
//   // --- THE FIX IS HERE ---
//   // If `data` is not an array, default to an empty one before trying to map it.
//   const chartData = (Array.isArray(data) ? data : []).map(item => {
//     const date = new Date(item.date);
//     const formatOptions: Intl.DateTimeFormatOptions = activeTimeframe === 'D' 
//       ? { month: 'short', day: 'numeric' }
//       : { month: 'short', year: 'numeric' };
//     return { time: date.toLocaleDateString('en-US', formatOptions), price: item.closing };
//   });

//   const chartTitle = title || "Stock Performance";

//   const TimeframeTabs = () => (
//     <Tabs value={activeTimeframe} onValueChange={(value) => onTimeframeChange(value as 'D' | 'ME' | 'YE')} className="w-fit">
//       <TabsList>
//         <TabsTrigger value="D">Daily</TabsTrigger>
//         <TabsTrigger value="ME">Monthly</TabsTrigger>
//         <TabsTrigger value="YE">Yearly</TabsTrigger>
//       </TabsList>
//     </Tabs>
//   );

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-start justify-between">
//         <div>
//           <CardTitle className="text-lg font-semibold">{chartTitle}</CardTitle>
//           <p className="text-sm text-muted-foreground">Price history</p>
//         </div>
//         <TimeframeTabs />
//       </CardHeader>
//       <CardContent className="h-[300px]">
//         {isLoading ? (
//           <div className="flex items-center justify-center h-full">
//             <p className="text-muted-foreground">Loading chart data...</p>
//           </div>
//         ) : chartData.length > 0 ? (
//           <ChartComponent data={chartData} />
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             <p className="text-muted-foreground">No data available for this timeframe.</p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }
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