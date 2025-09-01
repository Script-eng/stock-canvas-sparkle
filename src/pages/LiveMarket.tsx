import React, { useEffect, useMemo, useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { StockSidebar } from "@/components/StockSidebar";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { getLiveMarketData } from '@/lib/api';
import LiveMarket from "@/components/LiveMarket";

const Dashboard = () => {
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
              <div className="flex items-center gap-4"> <SidebarTrigger /> <div> <h1 className="text-2xl font-bold text-foreground">Live Market</h1> <p className="text-sm text-muted-foreground">Real-time stock prices and market movements</p> </div> </div>
            </div>
            <div className="flex items-center gap-3">
              {/* <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button> */}
            </div>
          </header>

          {/* Live Market Table */}
          <main className="flex-1 p-6">
            <LiveMarket />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
