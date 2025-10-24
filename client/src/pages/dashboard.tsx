import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertTriangle, Users, Building2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DashboardStats {
  totalOutstanding: number;
  unitsInArrears: number;
  attorneyUnits: number;
  monthlyRevenue: number;
  collectionRate: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Board Dashboard
          </h1>
          <p className="text-muted-foreground">
            Heritage Condominium Association - Financial Overview
          </p>
        </div>
      </div>

      {stats && stats.attorneyUnits > 0 && (
        <Alert variant="destructive" data-testid="alert-attorney-units">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical: Attorney Level Collections</AlertTitle>
          <AlertDescription>
            {stats.attorneyUnits} unit{stats.attorneyUnits > 1 ? "s" : ""} currently with attorney
            for collection action. Total outstanding: {formatCurrency(stats.totalOutstanding)}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="card-total-outstanding">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono" data-testid="text-total-outstanding">
              {stats ? formatCurrency(stats.totalOutstanding) : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all 24 units
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-delinquent-units">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units in Arrears</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-units-in-arrears">
              {stats?.unitsInArrears || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.attorneyUnits || 0} with attorney
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-collection-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-collection-rate">
              {stats ? Math.round(stats.collectionRate) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current payment compliance
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono" data-testid="text-monthly-revenue">
              {stats ? formatCurrency(stats.monthlyRevenue) : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expected monthly maintenance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Building Status</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total units managed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="mt-1">Profitable</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Building operations are stable
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Priorities</CardTitle>
          <CardDescription>
            Immediate action items for board attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 border rounded-md">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">Attorney Level Collections</h4>
              <p className="text-sm text-muted-foreground mt-1">
                3 units (305, 308, 405) with attorney. Total owed: ~$122,406
              </p>
            </div>
            <Badge variant="destructive">Critical</Badge>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-md">
            <DollarSign className="h-5 w-5 text-orange-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">High Priority Collections</h4>
              <p className="text-sm text-muted-foreground mt-1">
                7 units requiring demand letters and lien filing. Total: ~$77,548
              </p>
            </div>
            <Badge className="bg-orange-500">High</Badge>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-md">
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">Second Assessment Progress</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Only 1 unit (408) fully paid. 2 units on approved payment plans.
              </p>
            </div>
            <Badge className="bg-yellow-500">Monitor</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
