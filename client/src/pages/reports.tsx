import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  Users,
  PieChart
} from "lucide-react";

/**
 * Financial Reports Page
 *
 * Eliminates dependency on external accountants
 * Provides 5 key reports for board self-sufficiency:
 * 1. Balance Sheet
 * 2. Income Statement (P&L)
 * 3. Delinquency/Aging Report
 * 4. Three-Assessment Collection Report
 * 5. Budget vs Actual Report
 */

interface ReportData {
  month: number;
  year: number;
  reportDate: string;

  // Balance Sheet
  balanceSheet: {
    assets: {
      operatingCash: number;
      reserveCash: number;
      accountsReceivable: number;
      totalAssets: number;
    };
    liabilities: {
      accountsPayable: number;
      deferredRevenue: number;
      totalLiabilities: number;
    };
    equity: {
      reserveFund: number;
      operatingFund: number;
      totalEquity: number;
    };
  };

  // Income Statement
  incomeStatement: {
    revenue: {
      maintenanceFees: number;
      reserveAssessments: number;
      specialAssessments: number;
      lateFees: number;
      totalRevenue: number;
    };
    expenses: Array<{
      category: string;
      amount: number;
      budget: number;
      variance: number;
    }>;
    totalExpenses: number;
    netIncome: number;
  };

  // Delinquency Report
  delinquencyReport: {
    totalDelinquent: number;
    totalUnitsDelinquent: number;
    aging: {
      current: number;
      days0to30: number;
      days31to60: number;
      days61to90: number;
      days90plus: number;
    };
    units: Array<{
      unitNumber: string;
      ownerName: string;
      totalOwed: number;
      daysDelinquent: number;
      status: string;
    }>;
  };

  // Collection Report (Three Assessments)
  collectionReport: {
    maintenance: {
      expected: number;
      collected: number;
      rate: number;
    };
    reserve: {
      expected: number;
      collected: number;
      rate: number;
    };
    special: {
      expected: number;
      collected: number;
      rate: number;
    };
    overall: {
      expected: number;
      collected: number;
      rate: number;
    };
  };

  // Budget vs Actual
  budgetReport: {
    totalBudget: number;
    totalActual: number;
    totalVariance: number;
    variancePercent: number;
    categories: Array<{
      category: string;
      budget: number;
      actual: number;
      variance: number;
      variancePercent: number;
      status: "over" | "under" | "on-track";
    }>;
  };
}

export default function Reports() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: reportData, isLoading, refetch } = useQuery<ReportData>({
    queryKey: [`/api/reports/full?month=${selectedMonth}&year=${selectedYear}`],
  });

  const handleExportPDF = async (reportType: string) => {
    try {
      const response = await fetch(`/api/reports/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reportType,
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Heritage_Condo_${reportType}_${selectedMonth}_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1];
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Financial Reports</h1>
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Financial Reports
          </h1>
          <p className="text-muted-foreground">
            Automated financial reporting • Eliminates accountant dependency
          </p>
        </div>
        <Badge className="bg-green-600">
          Board Self-Sufficient
        </Badge>
      </div>

      {/* Month/Year Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div>
              <label className="text-sm font-medium">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="ml-2 border rounded px-3 py-1"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>{getMonthName(m)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="ml-2 border rounded px-3 py-1"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="ml-4">
              Generate Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="balance-sheet" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
          <TabsTrigger value="delinquency">Delinquency</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="budget">Budget vs Actual</TabsTrigger>
        </TabsList>

        {/* Balance Sheet Tab */}
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Balance Sheet
                  </CardTitle>
                  <CardDescription>
                    Assets, Liabilities, and Equity • {getMonthName(selectedMonth)} {selectedYear}
                  </CardDescription>
                </div>
                <Button onClick={() => handleExportPDF("balance-sheet")} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reportData ? (
                <div className="space-y-6">
                  {/* Assets */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Assets</h3>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Operating Cash</span>
                        <span className="font-medium">
                          ${reportData.balanceSheet.assets.operatingCash.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reserve Cash</span>
                        <span className="font-medium">
                          ${reportData.balanceSheet.assets.reserveCash.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accounts Receivable</span>
                        <span className="font-medium">
                          ${reportData.balanceSheet.assets.accountsReceivable.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span>Total Assets</span>
                        <span>${reportData.balanceSheet.assets.totalAssets.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Liabilities */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Liabilities</h3>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Accounts Payable</span>
                        <span className="font-medium">
                          ${reportData.balanceSheet.liabilities.accountsPayable.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deferred Revenue</span>
                        <span className="font-medium">
                          ${reportData.balanceSheet.liabilities.deferredRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span>Total Liabilities</span>
                        <span>${reportData.balanceSheet.liabilities.totalLiabilities.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Equity */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Equity</h3>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Reserve Fund</span>
                        <span className="font-medium">
                          ${reportData.balanceSheet.equity.reserveFund.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operating Fund</span>
                        <span className="font-medium">
                          ${reportData.balanceSheet.equity.operatingFund.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span>Total Equity</span>
                        <span>${reportData.balanceSheet.equity.totalEquity.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Balance Check */}
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Assets = Liabilities + Equity |
                      ${reportData.balanceSheet.assets.totalAssets.toLocaleString()} =
                      ${(reportData.balanceSheet.liabilities.totalLiabilities + reportData.balanceSheet.equity.totalEquity).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No data available for selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Statement Tab */}
        <TabsContent value="income-statement">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Income Statement (P&L)
                  </CardTitle>
                  <CardDescription>
                    Revenue and Expenses • {getMonthName(selectedMonth)} {selectedYear}
                  </CardDescription>
                </div>
                <Button onClick={() => handleExportPDF("income-statement")} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reportData ? (
                <div className="space-y-6">
                  {/* Revenue */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Revenue</h3>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Maintenance Fees</span>
                        <span className="font-medium">
                          ${reportData.incomeStatement.revenue.maintenanceFees.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reserve Assessments</span>
                        <span className="font-medium">
                          ${reportData.incomeStatement.revenue.reserveAssessments.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Special Assessments</span>
                        <span className="font-medium">
                          ${reportData.incomeStatement.revenue.specialAssessments.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Late Fees</span>
                        <span className="font-medium">
                          ${reportData.incomeStatement.revenue.lateFees.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold text-green-600">
                        <span>Total Revenue</span>
                        <span>${reportData.incomeStatement.revenue.totalRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Expenses</h3>
                    <div className="space-y-2 ml-4">
                      {reportData.incomeStatement.expenses.map((expense) => (
                        <div key={expense.category} className="flex justify-between">
                          <div className="flex-1">
                            <span>{expense.category}</span>
                            {expense.variance > 0 && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                +{expense.variance.toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                          <span className="font-medium">
                            ${expense.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t font-bold text-red-600">
                        <span>Total Expenses</span>
                        <span>${reportData.incomeStatement.totalExpenses.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Net Income</span>
                      <span className={`font-bold text-2xl ${reportData.incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${reportData.incomeStatement.netIncome.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No data available for selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delinquency Report Tab */}
        <TabsContent value="delinquency">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Delinquency & Aging Report
                  </CardTitle>
                  <CardDescription>
                    Units with outstanding balances • {getMonthName(selectedMonth)} {selectedYear}
                  </CardDescription>
                </div>
                <Button onClick={() => handleExportPDF("delinquency")} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reportData ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        ${reportData.delinquencyReport.totalDelinquent.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Delinquent</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {reportData.delinquencyReport.totalUnitsDelinquent}
                      </div>
                      <div className="text-sm text-muted-foreground">Units Delinquent</div>
                    </div>
                  </div>

                  {/* Aging Buckets */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Aging Analysis</h3>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Current</span>
                        <span className="font-medium">
                          ${reportData.delinquencyReport.aging.current.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>0-30 Days</span>
                        <span className="font-medium">
                          ${reportData.delinquencyReport.aging.days0to30.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>31-60 Days</span>
                        <span className="font-medium text-yellow-600">
                          ${reportData.delinquencyReport.aging.days31to60.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>61-90 Days</span>
                        <span className="font-medium text-orange-600">
                          ${reportData.delinquencyReport.aging.days61to90.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>90+ Days</span>
                        <span className="font-medium text-red-600">
                          ${reportData.delinquencyReport.aging.days90plus.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delinquent Units List */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Delinquent Units</h3>
                    <div className="space-y-2">
                      {reportData.delinquencyReport.units.map((unit) => (
                        <div key={unit.unitNumber} className="p-3 border rounded-lg flex justify-between items-center">
                          <div>
                            <span className="font-semibold">Unit {unit.unitNumber}</span>
                            <span className="text-sm text-muted-foreground ml-2">({unit.ownerName})</span>
                            <Badge variant="outline" className="ml-2">{unit.daysDelinquent} days</Badge>
                          </div>
                          <span className="font-bold text-red-600">
                            ${unit.totalOwed.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No data available for selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collections Report Tab */}
        <TabsContent value="collections">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Three-Assessment Collection Report
                  </CardTitle>
                  <CardDescription>
                    Maintenance, Reserve, and Special Assessment Collections • {getMonthName(selectedMonth)} {selectedYear}
                  </CardDescription>
                </div>
                <Button onClick={() => handleExportPDF("collections")} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reportData ? (
                <div className="space-y-6">
                  {/* Overall Collection Rate */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">
                        {reportData.collectionReport.overall.rate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">Overall Collection Rate</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ${reportData.collectionReport.overall.collected.toLocaleString()} of
                        ${reportData.collectionReport.overall.expected.toLocaleString()} expected
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Assessment */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">Monthly Maintenance Assessment</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Expected</span>
                        <span>${reportData.collectionReport.maintenance.expected.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Collected</span>
                        <span className="text-green-600 font-medium">
                          ${reportData.collectionReport.maintenance.collected.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">Collection Rate</span>
                        <Badge className={reportData.collectionReport.maintenance.rate >= 90 ? "bg-green-600" : "bg-yellow-600"}>
                          {reportData.collectionReport.maintenance.rate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Reserve Assessment */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">Monthly Reserve Assessment</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Expected</span>
                        <span>${reportData.collectionReport.reserve.expected.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Collected</span>
                        <span className="text-green-600 font-medium">
                          ${reportData.collectionReport.reserve.collected.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">Collection Rate</span>
                        <Badge className={reportData.collectionReport.reserve.rate >= 90 ? "bg-green-600" : "bg-yellow-600"}>
                          {reportData.collectionReport.reserve.rate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Special Assessment */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">Special Assessment (Florida Concrete Compliance)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Expected</span>
                        <span>${reportData.collectionReport.special.expected.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Collected</span>
                        <span className="text-green-600 font-medium">
                          ${reportData.collectionReport.special.collected.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">Collection Rate</span>
                        <Badge className={reportData.collectionReport.special.rate >= 90 ? "bg-green-600" : "bg-yellow-600"}>
                          {reportData.collectionReport.special.rate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No data available for selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget vs Actual Tab */}
        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Budget vs Actual Report
                  </CardTitle>
                  <CardDescription>
                    Budget performance analysis • {getMonthName(selectedMonth)} {selectedYear}
                  </CardDescription>
                </div>
                <Button onClick={() => handleExportPDF("budget")} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reportData ? (
                <div className="space-y-6">
                  {/* Overall Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        ${reportData.budgetReport.totalBudget.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Budget</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        ${reportData.budgetReport.totalActual.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Actual</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className={`text-2xl font-bold ${reportData.budgetReport.variancePercent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {reportData.budgetReport.variancePercent > 0 ? '+' : ''}
                        {reportData.budgetReport.variancePercent.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Variance</div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Category Performance</h3>
                    <div className="space-y-3">
                      {reportData.budgetReport.categories.map((category) => (
                        <div key={category.category} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-semibold">{category.category}</span>
                              <Badge
                                variant={category.status === "over" ? "destructive" : category.status === "under" ? "secondary" : "outline"}
                                className="ml-2"
                              >
                                {category.status === "over" ? "Over Budget" : category.status === "under" ? "Under Budget" : "On Track"}
                              </Badge>
                            </div>
                            <span className={`font-bold ${category.variancePercent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {category.variancePercent > 0 ? '+' : ''}
                              {category.variancePercent.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Budget: ${category.budget.toLocaleString()}</span>
                            <span>Actual: ${category.actual.toLocaleString()}</span>
                            <span>Variance: ${category.variance.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warnings */}
                  {reportData.budgetReport.categories.some(c => c.status === "over") && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Over Budget Alert</AlertTitle>
                      <AlertDescription>
                        {reportData.budgetReport.categories.filter(c => c.status === "over").length} categories are over budget. Review and adjust spending as needed.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No data available for selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-8 border-t">
        <p>
          <strong>Heritage Condominium Association</strong> • Automated Financial Reporting System
        </p>
        <p className="mt-1">
          Self-sufficient board operations • No external accountant required
        </p>
      </div>
    </div>
  );
}
