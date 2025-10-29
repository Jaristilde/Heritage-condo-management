import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";

interface BudgetHealthData {
  month: number;
  year: number;
  summary: string;
  totalVariancePercent: number;
  overBudgetCount: number;
  hasAlerts: boolean;
  criticalCount: number;
  warningCount: number;
  status: "critical" | "warning" | "ok";
}

export function BudgetHealthWidget() {
  const { data: budgetHealth, isLoading, error } = useQuery<BudgetHealthData>({
    queryKey: ["/api/budget/health"],
    refetchInterval: 60000, // Refresh every 60 seconds
    retry: false, // Don't retry on error
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading budget health...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !budgetHealth) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Health</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load budget health data. This may be because no budget has been set for the current year.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Validate data structure
  if (!budgetHealth.month || !budgetHealth.year || !budgetHealth.summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Health</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Budget data incomplete. Please set up a budget for this year.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (budgetHealth.status) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <TrendingUp className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (budgetHealth.status) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>;
      default:
        return <Badge className="bg-green-500">On Track</Badge>;
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 10) return "text-red-600";
    if (variance > 5) return "text-yellow-600";
    if (variance < -5) return "text-blue-600";
    return "text-green-600";
  };

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "Unknown";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          {getStatusIcon()}
          Budget Health
        </CardTitle>
        {getStatusBadge()}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Month and Year */}
          <div className="text-sm text-muted-foreground">
            {getMonthName(budgetHealth.month)} {budgetHealth.year}
          </div>

          {/* Variance Summary */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Variance</span>
            <div className="flex items-center gap-2">
              {budgetHealth.totalVariancePercent > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
              <span className={`text-lg font-bold ${getVarianceColor(budgetHealth.totalVariancePercent)}`}>
                {budgetHealth.totalVariancePercent > 0 ? "+" : ""}
                {budgetHealth.totalVariancePercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Summary Message */}
          <p className="text-sm text-muted-foreground border-t pt-3">
            {budgetHealth.summary}
          </p>

          {/* Alert Counts */}
          {budgetHealth.hasAlerts && (
            <div className="border-t pt-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Over-Budget Categories</div>
              <div className="flex gap-4">
                {budgetHealth.criticalCount > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600">
                      {budgetHealth.criticalCount} Critical
                    </span>
                  </div>
                )}
                {budgetHealth.warningCount > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600">
                      {budgetHealth.warningCount} Warning
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Required Alert */}
          {budgetHealth.status === "critical" && (
            <Alert variant="destructive" className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Immediate action required: {budgetHealth.criticalCount} categories are significantly over budget.
              </AlertDescription>
            </Alert>
          )}

          {budgetHealth.status === "warning" && (
            <Alert className="mt-3 bg-yellow-50 border-yellow-200">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-xs text-yellow-800">
                Monitor closely: {budgetHealth.warningCount} categories need attention.
              </AlertDescription>
            </Alert>
          )}

          {/* Auto-refresh indicator */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Auto-refreshes every 60 seconds
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
