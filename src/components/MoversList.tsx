import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Mover {
  code: string;
  name: string;
  change_pct: number;
}

interface MoversListProps {
  movers: {
    gainers: Mover[];
    losers: Mover[];
  } | null;
  // New prop to handle clicks
  onItemClick: (mover: Mover) => void; 
}

export function MoversList({ movers, onItemClick }: MoversListProps) {
  if (!movers) {
    return (
      <Card className="h-fit">
        <CardHeader><CardTitle className="text-lg font-semibold">Top Movers</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Loading movers data...</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Movers</CardTitle>
        <p className="text-sm text-muted-foreground">Today's biggest gainers & losers</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium text-sm text-foreground mb-3">Top Gainers</h4>
          <div className="space-y-2">
            {movers.gainers.slice(0, 5).map((gainer) => (
              <button 
                key={gainer.code} 
                onClick={() => onItemClick(gainer)}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
              >
                <TrendingUp className="w-5 h-5 text-success flex-shrink-0" />
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm text-foreground truncate" title={gainer.name}>{gainer.name}</p>
                    <Badge className="bg-success text-success-foreground text-xs">
                      +{gainer.change_pct.toFixed(2)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{gainer.code}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {movers.losers.length > 0 && (
          <div className="pt-6 border-t">
            <h4 className="font-medium text-sm text-foreground mb-3">Top Losers</h4>
            <div className="space-y-2">
              {movers.losers.slice(0, 5).map((loser) => (
                <button 
                  key={loser.code}
                  onClick={() => onItemClick(loser)}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                >
                  <TrendingDown className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm text-foreground truncate" title={loser.name}>{loser.name}</p>
                      <Badge variant="destructive" className="text-xs">
                        {loser.change_pct.toFixed(2)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{loser.code}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}