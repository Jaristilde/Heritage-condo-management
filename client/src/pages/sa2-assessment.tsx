import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Users, AlertTriangle } from "lucide-react";

interface Unit {
  id: string;
  unitNumber: string;
  totalOwed: string;
  assessment2024Status: string;
  assessment2024Original: string;
  assessment2024Paid: string;
  assessment2024Remaining: string;
  onAssessmentPlan: boolean;
  assessmentPlanMonthsCompleted: number;
  assessmentPlanMonthsTotal: number;
  redFlag: boolean;
  withAttorney: boolean;
  inForeclosure: boolean;
}

interface Owner {
  fullName: string;
}

export default function Assessments() {
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

  const get2024AssessmentBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string; label?: string }> = {
      "PAID IN FULL": { variant: "default", className: "bg-green-600", label: "✅ PAID IN FULL" },
      "3-YEAR PLAN": { variant: "default", className: "bg-blue-600", label: "📋 3-YEAR PLAN" },
      "PARTIAL": { variant: "default", className: "bg-yellow-600", label: "📊 PARTIAL" },
      "UNPAID": { variant: "destructive", label: "🚩 UNPAID" },
      "pending": { variant: "outline", label: "Pending" },
    };

    const config = variants[status] || { variant: "outline", label: status };

    return (
      <Badge {...config}>
        {config.label}
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

  // Calculate totals
  const totalAssessment = 286102.08; // 24 units × $11,920.92
  const totalPaid = units?.reduce((sum, unit) => sum + parseFloat(unit.assessment2024Paid || "0"), 0) || 0;
  const totalOutstanding = units?.reduce((sum, unit) => sum + parseFloat(unit.assessment2024Remaining || "0"), 0) || 0;
  const collectionRate = (totalPaid / totalAssessment) * 100;

  // Group units by status
  const paidInFull = units?.filter(u => u.assessment2024Status === "PAID IN FULL") || [];
  const on3YearPlan = units?.filter(u => u.assessment2024Status === "3-YEAR PLAN") || [];
  const partialPayment = units?.filter(u => u.assessment2024Status === "PARTIAL") || [];
  const unpaid = units?.filter(u => u.assessment2024Status === "UNPAID") || [];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          2024 Special Assessment Tracking
        </h1>
        <p className="text-muted-foreground">
          Complete breakdown of the $11,920.92 per unit special assessment
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAssessment.toString())}</div>
            <p className="text-xs text-muted-foreground">
              24 units × $11,920.92
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid.toString())}</div>
            <p className="text-xs text-muted-foreground">
              {collectionRate.toFixed(1)}% collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding.toString())}</div>
            <p className="text-xs text-muted-foreground">
              {((totalOutstanding / totalAssessment) * 100).toFixed(1)}% remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Breakdown</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>✅ Paid:</span>
                <span className="font-bold">{paidInFull.length}</span>
              </div>
              <div className="flex justify-between">
                <span>🚩 Unpaid:</span>
                <span className="font-bold text-red-600">{unpaid.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paid in Full Section */}
      {paidInFull.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-green-600">✅ {paidInFull.length} Units</Badge>
              PAID IN FULL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidInFull.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">Unit {unit.unitNumber}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(unit.assessment2024Paid)}</TableCell>
                    <TableCell>{get2024AssessmentBadge(unit.assessment2024Status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 3-Year Plan Section */}
      {on3YearPlan.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-blue-600">📋 {on3YearPlan.length} Units</Badge>
              3-YEAR PAYMENT PLANS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {on3YearPlan.map((unit) => {
                  const progressPercent = unit.assessmentPlanMonthsTotal > 0
                    ? (unit.assessmentPlanMonthsCompleted / unit.assessmentPlanMonthsTotal) * 100
                    : 0;
                  return (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">Unit {unit.unitNumber}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(unit.assessment2024Paid)}</TableCell>
                      <TableCell className="text-right font-mono text-orange-600">{formatCurrency(unit.assessment2024Remaining)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {unit.assessmentPlanMonthsCompleted} of {unit.assessmentPlanMonthsTotal} months ({progressPercent.toFixed(0)}%)
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{get2024AssessmentBadge(unit.assessment2024Status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Partial Payment Section */}
      {partialPayment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-yellow-600">📊 {partialPayment.length} Units</Badge>
              PARTIAL PAYMENT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">% Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partialPayment.map((unit) => {
                  const paidPercent = (parseFloat(unit.assessment2024Paid) / parseFloat(unit.assessment2024Original)) * 100;
                  return (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">Unit {unit.unitNumber}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(unit.assessment2024Paid)}</TableCell>
                      <TableCell className="text-right font-mono text-orange-600">{formatCurrency(unit.assessment2024Remaining)}</TableCell>
                      <TableCell className="text-right font-bold">{paidPercent.toFixed(0)}%</TableCell>
                      <TableCell>{get2024AssessmentBadge(unit.assessment2024Status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Unpaid Section - RED FLAG */}
      {unpaid.length > 0 && (
        <Card className="border-red-500">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Badge variant="destructive">🚩 {unpaid.length} Units</Badge>
              UNPAID - RED FLAG
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Amount Owed</TableHead>
                  <TableHead>Special Flags</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaid.map((unit) => (
                  <TableRow key={unit.id} className="bg-red-50/50">
                    <TableCell className="font-medium">Unit {unit.unitNumber}</TableCell>
                    <TableCell className="text-right font-mono text-red-700 font-bold">
                      {formatCurrency(unit.assessment2024Remaining)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {unit.withAttorney && (
                          <Badge variant="destructive" className="text-xs">WITH ATTORNEY</Badge>
                        )}
                        {unit.inForeclosure && (
                          <Badge variant="destructive" className="text-xs">FORECLOSURE</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{get2024AssessmentBadge(unit.assessment2024Status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
