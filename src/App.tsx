import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Activity from "./pages/Activity";
import LiveMarket from "./pages/LiveMarket";
import WorkInProgress from "./pages/WorkInProgress";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Index />} /> */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          {/* <Route path="/live-market" element={<LiveMarket />} /> */}
          <Route path="/" element={<LiveMarket />} />
          {/* Other routes can be added here */}
          {/* <Route path="/analytics" element={<Analytics />} /> */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* <Route path="/portfolio" element={<Portfolio />} /> */}
          {/* <Route path="/activity" element={<Activity />} /> */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<WorkInProgress />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
