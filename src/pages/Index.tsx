import { Wallet, TrendingUp, Activity, DollarSign } from "lucide-react"
import { MetricCard } from "@/components/MetricCard"
import { TradingTable } from "@/components/TradingTable"
import { TradingChart } from "@/components/TradingChart"
import { ActivityFeed } from "@/components/ActivityFeed"
import { MarketPieChart } from "@/components/MarketPieChart"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { StockSidebar } from "@/components/StockSidebar"
import { Button } from "@/components/ui/button"
import { Bell, User } from "lucide-react"

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <StockSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex items-center justify-between p-6 border-b bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, trader</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Portfolio Value"
                value="$125,430"
                change="+12.5%"
                changeType="increase"
                icon={Wallet}
                subtitle="This month"
              />
              <MetricCard
                title="Today's P&L"
                value="$2,847"
                change="+8.2%"
                changeType="increase"
                icon={TrendingUp}
                subtitle="Last 24h"
              />
              <MetricCard
                title="Active Positions"
                value="24"
                change="-2"
                changeType="decrease"
                icon={Activity}
                subtitle="Open trades"
              />
              <MetricCard
                title="Available Cash"
                value="$18,520"
                change="0%"
                changeType="neutral"
                icon={DollarSign}
                subtitle="Ready to trade"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TradingChart />
              <MarketPieChart />
            </div>

            {/* Table and Activity Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <TradingTable />
              </div>
              <div>
                <ActivityFeed />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
