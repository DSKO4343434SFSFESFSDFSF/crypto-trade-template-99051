import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  name: string;
  icon: string;
  change: string;
  date: string;
  price: string;
  status: 'success' | 'pending' | 'failed';
  isPositive: boolean;
}

interface PaymentHistoryProps {
  transactions: Transaction[];
}

export const PaymentHistory = ({ transactions }: PaymentHistoryProps) => {
  return (
    <Card className="glass border-border p-6">
      <h3 className="text-lg font-semibold mb-4">Payment History</h3>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>NAME</TableHead>
            <TableHead>DATE</TableHead>
            <TableHead>PRICE</TableHead>
            <TableHead>STATUS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id} className="border-border">
              <TableCell>
                <div className="flex items-center gap-3">
                  <img src={tx.icon} alt={tx.name} className="w-8 h-8 rounded-full" />
                  <span className="font-medium">{tx.name}</span>
                  <span className={cn(
                    "text-sm font-medium",
                    tx.isPositive ? "text-primary" : "text-destructive"
                  )}>
                    {tx.change}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{tx.date}</TableCell>
              <TableCell className="font-medium">{tx.price}</TableCell>
              <TableCell>
                <span className={cn(
                  "inline-flex items-center gap-2 text-sm",
                  tx.status === 'success' && "text-primary"
                )}>
                  {tx.status === 'success' && <span className="w-2 h-2 bg-primary rounded-full" />}
                  {tx.status === 'success' ? 'Successfully' : tx.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
