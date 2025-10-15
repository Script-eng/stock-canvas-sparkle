
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { StockSidebar } from "@/components/StockSidebar";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMarketMovers } from "@/lib/api";
import { useLocalStorage } from "@/hooks/useLocalStorage"; // Keep this for other uses if any, but dark mode specific state is gone.

import ThemeToggle from "@/components/ui/ThemeToggle"; 

const Activity = () => {
  const [movers, setMovers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMoversData = async () => {
      setIsLoading(true);
      const moversData = await getMarketMovers();
      setMovers(moversData);
      setIsLoading(false);
    };
    loadMoversData();
  }, []);

  const gainers = movers?.gainers || [];
  const losers = movers?.losers || [];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <StockSidebar />
        <SidebarInset className="flex-1">
          <header className="flex items-center justify-between p-6 border-b bg-card">
            <div>
            <div className="flex items-center gap-4"> <SidebarTrigger /> <div> <h1 className="text-2xl font-bold text-foreground">Market Activity</h1> <p className="text-sm text-muted-foreground">A detailed look at today's top moving stocks</p> </div> </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {/* <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button> */}
              {/* <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button> */}
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Top Gainers</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Symbol</TableHead><TableHead>Name</TableHead><TableHead className="text-right">% Change</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {gainers.map(g => (<TableRow key={g.code}><TableCell>{g.code}</TableCell><TableCell>{g.name}</TableCell><TableCell className="text-right text-success">+{g.change_pct.toFixed(2)}%</TableCell></TableRow>))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Top Losers</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Symbol</TableHead><TableHead>Name</TableHead><TableHead className="text-right">% Change</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {losers.map(l => (<TableRow key={l.code}><TableCell>{l.code}</TableCell><TableCell>{l.name}</TableCell><TableCell className="text-right text-destructive">{l.change_pct.toFixed(2)}%</TableCell></TableRow>))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Activity;