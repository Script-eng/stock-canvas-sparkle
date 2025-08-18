import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

// Define the structure of a single mover from your API
interface Mover {
  code: string;
  name: string;
  change_pct: number;
}

// Define the shape of the props this component will receive
interface MoversListProps {
  movers: {
    gainers: Mover[];
    losers: Mover[];
  } | null; // Allow null for the initial loading state
}

export function MoversList({ movers }: MoversListProps) {
  // A loading state to handle the initial fetch
  if (!movers) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Movers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading movers data...</p>
        </CardContent>
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
        {/* Gainers Section */}
        <div>
          <h4 className="font-medium text-sm text-foreground mb-3">Top Gainers</h4>
          <div className="space-y-4">
            {movers.gainers.slice(0, 5).map((gainer) => (
              <div key={gainer.code} className="flex items-center gap-3">
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
              </div>
            ))}
          </div>
        </div>

        {/* Losers Section (only renders if there are losers) */}
        {movers.losers.length > 0 && (
          <div className="pt-6 border-t">
            <h4 className="font-medium text-sm text-foreground mb-3">Top Losers</h4>
            <div className="space-y-4">
              {movers.losers.slice(0, 5).map((loser) => (
                <div key={loser.code} className="flex items-center gap-3">
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
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}