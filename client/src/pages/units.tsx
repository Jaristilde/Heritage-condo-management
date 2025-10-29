import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2 } from "lucide-react";

interface Unit {
  id: string;
  unitNumber: string;
  monthlyMaintenance: string;
  maintenanceBalance: string;
  firstAssessmentStatus: string;
  firstAssessmentBalance: string;
  secondAssessmentStatus: string;
  secondAssessmentBalance: string;
  totalOwed: string;
  delinquencyStatus: string;
  priorityLevel: string;
  notes: string | null;
}

export default function Units() {
  const { data: units, isLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      low: { variant: "secondary" },
      medium: { variant: "default", className: "bg-yellow-500" },
      high: { variant: "default", className: "bg-orange-500" },
      critical: { variant: "destructive" },
      attorney: { variant: "destructive" },
    };

    return (
      <Badge {...variants[priority] || { variant: "outline" }} data-testid={`badge-priority-${priority}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      current: { variant: "default", className: "bg-green-500" },
      pending: { variant: "default", className: "bg-yellow-500" },
      "30-60days": { variant: "default", className: "bg-orange-500" },
      "90plus": { variant: "destructive" },
      attorney: { variant: "destructive" },
    };

    return (
      <Badge {...variants[status] || { variant: "outline" }}>
        {status === "30-60days" ? "30-60 Days" : status === "90plus" ? "90+ Days" : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Units & Owners
          </h1>
          <p className="text-muted-foreground">
            Complete listing of all 24 Heritage condominium units • Financial data as of July 2025
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {units?.length || 0} Units Total
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unit Financial Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Monthly Maint.</TableHead>
                  <TableHead className="text-right">Total Owed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units?.map((unit) => (
                  <TableRow key={unit.id} data-testid={`row-unit-${unit.unitNumber}`}>
                    <TableCell className="font-medium" data-testid={`text-unit-number-${unit.unitNumber}`}>
                      {unit.unitNumber}
                    </TableCell>
                    <TableCell className="text-right font-mono" data-testid={`text-monthly-maint-${unit.unitNumber}`}>
                      {formatCurrency(unit.monthlyMaintenance)}
                    </TableCell>
                    <TableCell className="text-right font-mono" data-testid={`text-total-owed-${unit.unitNumber}`}>
                      {formatCurrency(unit.totalOwed)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(unit.delinquencyStatus)}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(unit.priorityLevel)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {unit.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">By Priority Level</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Attorney</span>
              <Badge variant="destructive">
                {units?.filter(u => u.priorityLevel === "attorney").length || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Critical</span>
              <Badge variant="destructive">
                {units?.filter(u => u.priorityLevel === "critical").length || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">High</span>
              <Badge className="bg-orange-500">
                {units?.filter(u => u.priorityLevel === "high").length || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Medium</span>
              <Badge className="bg-yellow-500">
                {units?.filter(u => u.priorityLevel === "medium").length || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Low</span>
              <Badge variant="secondary">
                {units?.filter(u => u.priorityLevel === "low").length || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">By Delinquency Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Current</span>
              <Badge className="bg-green-500">
                {units?.filter(u => u.delinquencyStatus === "current").length || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pending</span>
              <Badge className="bg-yellow-500">
                {units?.filter(u => u.delinquencyStatus === "pending").length || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">30-60 Days</span>
              <Badge className="bg-orange-500">
                {units?.filter(u => u.delinquencyStatus === "30-60days").length || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">90+ Days</span>
              <Badge variant="destructive">
                {units?.filter(u => u.delinquencyStatus === "90plus").length || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Attorney</span>
              <Badge variant="destructive">
                {units?.filter(u => u.delinquencyStatus === "attorney").length || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Assessment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium mb-2">First Assessment</p>
              <div className="flex justify-between items-center">
                <span className="text-sm">Paid</span>
                <span className="text-sm font-mono">
                  {units?.filter(u => u.firstAssessmentStatus === "paid").length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Paying</span>
                <span className="text-sm font-mono">
                  {units?.filter(u => u.firstAssessmentStatus === "paying").length || 0}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">Second Assessment</p>
              <div className="flex justify-between items-center">
                <span className="text-sm">Paid</span>
                <span className="text-sm font-mono">
                  {units?.filter(u => u.secondAssessmentStatus === "paid").length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Payment Plan</span>
                <span className="text-sm font-mono">
                  {units?.filter(u => u.secondAssessmentStatus === "plan").length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
