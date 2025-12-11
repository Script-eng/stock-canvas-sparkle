import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { StockSidebar } from '@/components/StockSidebar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import PredictionsDashboard from '@/components/PredictionsDashboard';

const PredictionsPage: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <StockSidebar />

        {/* Main content */}
        <SidebarInset className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-6 border-b bg-card">
            <div>
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">ML Predictions</h1>
                  <p className="text-sm text-muted-foreground">
                    End-of-day closing price predictions powered by ensemble ML models
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </header>

          {/* Predictions Dashboard */}
          <main className="flex-1">
            <PredictionsDashboard />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PredictionsPage;
