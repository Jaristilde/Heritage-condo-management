import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { ArrowLeft, FileText } from "lucide-react";
import { format } from "date-fns";

interface LedgerEntry {
  id: string;
  unitId: string;
  entryType: string;
  amount: string;
  date: string;
  description: string;
  referenceId: string | null;
  balance: string;
  createdAt: string;
}

interface Unit {
  id: string;
  unitNumber: string;
  totalOwed: string;
  monthlyMaintenance: string;
  maintenanceBalance: string;
  firstAssessmentBalance: string;
  secondAssessmentBalance: string;
}

export default function UnitLedger() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: ledgerEntries, isLoading: ledgerLoading } = useQuery<LedgerEntry[]>({
    queryKey: [`/api/units/${id}/ledger`],
    enabled: !!id,
  });

  const { data: unit, isLoading: unitLoading } = useQuery<Unit>({
    queryKey: [`/api/units/${id}`],
    enabled: !!id,
  });

  if (ledgerLoading || unitLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Unit not found</h3>
          <Button onClick={() => setLocation("/units")}>
            Back to Units
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getEntryTypeColor = (entryType: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (entryType) {
      case "payment":
        return "default";
      case "assessment":
        return "secondary";
      case "late_fee":
      case "interest":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getEntryTypeLabel = (entryType: string): string => {
    const labels: Record<string, string> = {
      assessment: "Assessment",
      payment: "Payment",
      late_fee: "Late Fee",
      interest: "Interest",
      adjustment: "Adjustment",
    };
    return labels[entryType] || entryType;
  };

  const totalBalance = ledgerEntries && ledgerEntries.length > 0
    ? ledgerEntries[0].balance
    : unit.totalOwed;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/units")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Unit {unit.unitNumber} - Ledger</h1>
          <p className="text-muted-foreground mt-1">
            Transaction history and account balance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(unit.monthlyMaintenance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Maintenance Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(unit.maintenanceBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assessment Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                (parseFloat(unit.firstAssessmentBalance) + parseFloat(unit.secondAssessmentBalance)).toString()
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {!ledgerEntries || ledgerEntries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                No ledger entries exist for this unit yet.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {format(new Date(entry.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEntryTypeColor(entry.entryType)}>
                          {getEntryTypeLabel(entry.entryType)}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {entry.entryType === "payment" ? "-" : "+"}
                        {formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(entry.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-semibold">
                      Current Balance:
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {formatCurrency(totalBalance)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
