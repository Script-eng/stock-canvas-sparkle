import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Trade {
  id: string
  symbol: string
  company: string
  price: number
  quantity: number
  status: "completed" | "pending" | "cancelled"
  timestamp: string
}

const mockTrades: Trade[] = [
  {
    id: "#TRD2457",
    symbol: "AAPL",
    company: "Apple Inc.",
    price: 175.20,
    quantity: 100,
    status: "completed",
    timestamp: "2 min ago"
  },
  {
    id: "#TRD2456",
    symbol: "GOOGL",
    company: "Alphabet Inc.",
    price: 2845.67,
    quantity: 25,
    status: "pending",
    timestamp: "5 min ago"
  },
  {
    id: "#TRD2455",
    symbol: "TSLA",
    company: "Tesla Inc.",
    price: 682.15,
    quantity: 50,
    status: "completed",
    timestamp: "12 min ago"
  },
  {
    id: "#TRD2454",
    symbol: "MSFT",
    company: "Microsoft Corp.",
    price: 398.43,
    quantity: 75,
    status: "cancelled",
    timestamp: "18 min ago"
  },
  {
    id: "#TRD2453",
    symbol: "NVDA",
    company: "NVIDIA Corp.",
    price: 875.90,
    quantity: 30,
    status: "completed",
    timestamp: "25 min ago"
  }
]

function getStatusBadge(status: Trade["status"]) {
  switch (status) {
    case "completed":
      return <Badge className="bg-success text-success-foreground">Completed</Badge>
    case "pending":
      return <Badge className="bg-warning text-warning-foreground">Pending</Badge>
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>
  }
}

export function TradingTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Recent Trades</CardTitle>
          <p className="text-sm text-muted-foreground">Today</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search trades..."
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Trade ID</TableHead>
              <TableHead className="font-semibold">Symbol</TableHead>
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold">Price</TableHead>
              <TableHead className="font-semibold">Quantity</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTrades.map((trade) => (
              <TableRow key={trade.id} className="hover:bg-muted/50">
                <TableCell className="font-medium text-primary">
                  {trade.id}
                </TableCell>
                <TableCell className="font-semibold">{trade.symbol}</TableCell>
                <TableCell className="text-muted-foreground">
                  {trade.company}
                </TableCell>
                <TableCell className="font-medium">
                  ${trade.price.toFixed(2)}
                </TableCell>
                <TableCell>{trade.quantity}</TableCell>
                <TableCell>{getStatusBadge(trade.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {trade.timestamp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 text-sm text-muted-foreground">
          Showing 1 to 5 of 5 entries
        </div>
      </CardContent>
    </Card>
  )
}