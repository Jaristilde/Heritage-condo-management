import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertTriangle, Building2 } from "lucide-react";

interface FinancialSummaryProps {
  totalCash: number;
  totalOwed: number;
  criticalCollections: number;
  delinquentUnits: number;
  totalUnits: number;
}

export function FinancialSummaryWidget({
  totalCash,
  totalOwed,
  criticalCollections,
  delinquentUnits,
  totalUnits,
}: FinancialSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const delinquencyRate = Math.round((delinquentUnits / totalUnits) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cash</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalCash)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All accounts combined
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Owed</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(totalOwed)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Outstanding balances
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Collections</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(criticalCollections)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Attorney cases
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delinquent Units</CardTitle>
          <Building2 className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {delinquentUnits} of {totalUnits}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {delinquencyRate}% delinquency rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
