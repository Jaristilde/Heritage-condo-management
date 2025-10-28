import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { FinancialSummaryWidget } from "@/components/financial/FinancialSummaryWidget";
import { CriticalCollectionsAlert } from "@/components/financial/CriticalCollectionsAlert";
import { OverdrawnAccountWarning } from "@/components/financial/OverdrawnAccountWarning";

interface Unit {
  id: string;
  unitNumber: string;
  ownerName: string;
  totalOwed: string;
  delinquencyStatus: string;
  priorityLevel: string;
  notes: string;
}

interface DashboardStats {
  totalOutstanding: number;
  unitsInArrears: number;
  attorneyUnits: number;
  monthlyRevenue: number;
  collectionRate: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: units, isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const isLoading = statsLoading || unitsLoading;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate July 2025 financials
  const totalCash = 287516.86; // From July financial data
  const totalOwed = units?.reduce((sum, unit) => sum + parseFloat(unit.totalOwed || "0"), 0) || 0;
  const delinquentUnits = units?.filter(u => u.delinquencyStatus !== "current").length || 0;
  const attorneyUnits = units?.filter(u => u.priorityLevel === "attorney") || [];
  const criticalCollections = attorneyUnits.reduce((sum, unit) => sum + parseFloat(unit.totalOwed || "0"), 0);

  // Get top 5 delinquent units
  const topDelinquentUnits = [...(units || [])]
    .filter(u => parseFloat(u.totalOwed) > 0)
    .sort((a, b) => parseFloat(b.totalOwed) - parseFloat(a.totalOwed))
    .slice(0, 5)
    .map(unit => ({
      unitNumber: unit.unitNumber,
      ownerName: unit.ownerName,
      totalOwed: parseFloat(unit.totalOwed),
      status: unit.delinquencyStatus,
      notes: unit.notes,
    }));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Heritage Condo Dashboard
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            Logged in as: <span className="font-semibold">Dan Ward</span>
            <Badge variant="outline" className="ml-2">Board Member</Badge>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Financial data as of July 31, 2025
          </p>
        </div>
      </div>

      {/* Overdrawn Account Warning */}
      <OverdrawnAccountWarning
        accountName="Popular Loan Account"
        accountNumber="1343"
        balance={-1047.83}
        outstandingLoan={305520.96}
      />

      {/* Financial Summary */}
      <FinancialSummaryWidget
        totalCash={totalCash}
        totalOwed={totalOwed}
        criticalCollections={criticalCollections}
        delinquentUnits={delinquentUnits}
        totalUnits={24}
      />

      {/* Critical Collections Alert */}
      <CriticalCollectionsAlert
        topDelinquentUnits={topDelinquentUnits}
        attorneyCount={attorneyUnits.length}
        totalCritical={criticalCollections}
      />
    </div>
  );
}
