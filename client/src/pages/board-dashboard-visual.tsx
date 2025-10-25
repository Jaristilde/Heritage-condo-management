import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KPICard } from "@/components/KPICard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Sparkles } from "lucide-react";
import {
  DollarSign,
  TrendingUp,
  Home,
  Scale,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Send,
  Receipt,
  BarChart3,
} from "lucide-react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Label as RechartsLabel,
  ReferenceLine,
} from "recharts";

export default function BoardDashboardVisual() {
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });
  const { toast } = useToast();

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("6");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [targetYear, setTargetYear] = useState("2026");
  const [budgetProposal, setBudgetProposal] = useState<any>(null);

  const generateReportMutation = useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      const response = await apiRequest("POST", "/api/reports/generate", { month, year });
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Heritage_Financial_Report_${selectedYear}_${selectedMonth.padStart(2, "0")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setReportDialogOpen(false);
      toast({
        title: "Report Generated",
        description: "Your financial report has been downloaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateBudgetMutation = useMutation({
    mutationFn: async ({ targetYear }: { targetYear: number }) => {
      const response = await apiRequest("POST", "/api/budget/propose", { targetYear });
      return response.json();
    },
    onSuccess: (data) => {
      setBudgetProposal(data);
      toast({
        title: "Budget Proposal Generated",
        description: "AI has analyzed your data and generated budget scenarios.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate budget proposal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // June 2025 Real Data from Heritage Financial Report
  const june2025Data = {
    totalCash: 286584,
    ytdNetIncome: 49805,
    unitsPaying: 20,
    totalUnits: 24,
    collectionRate: 83,
    
    // Revenue Collection
    revenueExpected: 13883,
    revenueCollected: 12988,
    revenueBreakdown: [
      { category: "Assessment", actual: 12983, budget: 12983 },
      { category: "Reserve", actual: 0, budget: 900 },
      { category: "Laundry", actual: 86, budget: 86 },
      { category: "Late Fees", actual: 5, budget: 150 },
      { category: "Interest", actual: 5, budget: 0 },
    ],
    
    // Expenses
    totalExpenses: 8930,
    expenseVariances: [
      { item: "Repairs", variance: 4558, fill: "#10b981" },
      { item: "Water/Sewer", variance: 1400, fill: "#10b981" },
      { item: "Fire Alarm", variance: 125, fill: "#10b981" },
      { item: "Loan Interest", variance: -1130, fill: "#ef4444" },
      { item: "Management", variance: -462, fill: "#ef4444" },
      { item: "Legal", variance: -342, fill: "#ef4444" },
    ],
    expenseBreakdown: [
      { name: "Insurance", value: 2487, fill: "#3b82f6" },
      { name: "Loan Interest", value: 1130, fill: "#10b981" },
      { name: "Management", value: 1012, fill: "#f59e0b" },
      { name: "Repairs", value: 860, fill: "#8b5cf6" },
      { name: "Accounting", value: 750, fill: "#ec4899" },
      { name: "Janitorial", value: 750, fill: "#ef4444" },
      { name: "Trash", value: 667, fill: "#6366f1" },
      { name: "Other", value: 1274, fill: "#9ca3af" },
    ],
    
    // 6-Month Trend
    monthlyTrend: [
      { month: "Jan", revenue: 13067, expenses: 5430, net: 7637 },
      { month: "Feb", revenue: 13067, expenses: 5430, net: 7637 },
      { month: "Mar", revenue: 13067, expenses: 5430, net: 7637 },
      { month: "Apr", revenue: 13067, expenses: 5430, net: 7637 },
      { month: "May", revenue: 13067, expenses: 5430, net: 7637 },
      { month: "Jun", revenue: 12988, expenses: 8930, net: 4058 },
    ],
  };

  const collectionPercentage = Math.round((june2025Data.revenueCollected / june2025Data.revenueExpected) * 100);

  return (
    <div className="p-8 space-y-8" data-testid="board-dashboard-visual">
      {/* SECTION 1: HERO STATS */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Board Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Financial snapshot for June 2025
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            icon={DollarSign}
            value={`$${june2025Data.totalCash.toLocaleString()}`}
            label="Total Cash On Hand"
            trend="+2.3%"
            trendDirection="up"
            color="emerald"
          />
          <KPICard
            icon={TrendingUp}
            value={`+$${june2025Data.ytdNetIncome.toLocaleString()}`}
            label="YTD Net Income"
            sublabel="$8,301/month average"
            color="blue"
          />
          <KPICard
            icon={Home}
            value={`${june2025Data.unitsPaying} / ${june2025Data.totalUnits}`}
            label="Units Paying"
            sublabel={`${june2025Data.totalUnits - june2025Data.unitsPaying} units delinquent`}
            color="amber"
          />
          <KPICard
            icon={Scale}
            value={`${june2025Data.collectionRate}%`}
            label="Collection Rate"
            sublabel="Target: 85%"
            trend="-2%"
            trendDirection="down"
            color="teal"
          />
        </div>
      </div>

      {/* SECTION 2: UNIT PAYMENT STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Payment Status Stacked Bar */}
        <Card data-testid="chart-unit-payment-status">
          <CardHeader>
            <CardTitle>Unit Payment Status</CardTitle>
            <CardDescription>Payment status breakdown by unit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: 'All Units',
                    current: 20,
                    days30: 2,
                    days90: 1,
                    attorney: 1,
                  },
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" stackId="a" fill="hsl(142, 76%, 36%)" name="Current (20)" />
                <Bar dataKey="days30" stackId="a" fill="hsl(48, 96%, 53%)" name="30-60 Days (2)" />
                <Bar dataKey="days90" stackId="a" fill="hsl(25, 95%, 53%)" name="90+ Days (1)" />
                <Bar dataKey="attorney" stackId="a" fill="hsl(0, 84%, 60%)" name="Attorney (1)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Collection Rate Gauge */}
        <Card data-testid="chart-collection-gauge">
          <CardHeader>
            <CardTitle>Collection Rate</CardTitle>
            <CardDescription>Overall collection performance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-sm">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Collected', value: june2025Data.collectionRate },
                      { name: 'Outstanding', value: 100 - june2025Data.collectionRate },
                    ]}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={80}
                    outerRadius={120}
                    dataKey="value"
                  >
                    <Cell fill="hsl(142, 76%, 36%)" />
                    <Cell fill="hsl(0, 0%, 90%)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold" data-testid="text-collection-rate">{june2025Data.collectionRate}%</div>
                  <div className="text-sm text-muted-foreground">Collected</div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2 w-full">
              <div className="flex justify-between items-center">
                <span className="text-sm">Monthly Maintenance Collected</span>
                <span className="font-semibold" data-testid="text-collected-amount">${june2025Data.revenueCollected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Outstanding Balance</span>
                <span className="font-semibold text-destructive" data-testid="text-outstanding-amount">${(june2025Data.revenueExpected - june2025Data.revenueCollected).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3: REVENUE COLLECTION VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <Card data-testid="chart-revenue-donut">
          <CardHeader>
            <CardTitle>June Revenue Collection</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total Expected: ${june2025Data.revenueExpected.toLocaleString()}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Collected", value: june2025Data.revenueCollected, fill: "#10b981" },
                    { name: "Uncollected", value: june2025Data.revenueExpected - june2025Data.revenueCollected, fill: "#ef4444" },
                  ]}
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="value"
                >
                  <RechartsLabel
                    value={`${collectionPercentage}%`}
                    position="center"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  />
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-3xl font-bold text-green-600">
                ${june2025Data.revenueCollected.toLocaleString()}
              </p>
              <p className="text-muted-foreground">Collected in June</p>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card data-testid="chart-revenue-by-category">
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <p className="text-sm text-muted-foreground">Actual vs Budget</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={june2025Data.revenueBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                <Bar dataKey="budget" fill="#e5e7eb" name="Budget" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3: EXPENSE PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variance Bar Chart */}
        <Card data-testid="chart-expense-variances">
          <CardHeader>
            <CardTitle>Budget Variances - Top 6</CardTitle>
            <p className="text-sm text-muted-foreground">Over/Under Budget (June)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={june2025Data.expenseVariances} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="item" type="category" width={120} />
                <Tooltip
                  formatter={(value: any) => `$${Math.abs(value).toLocaleString()}`}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="variance">
                  {june2025Data.expenseVariances.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                <ReferenceLine x={0} stroke="#666" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Pie Chart */}
        <Card data-testid="chart-expense-breakdown">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              Where money went in June
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={june2025Data.expenseBreakdown}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {june2025Data.expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 4: YEAR-TO-DATE TRENDS */}
      <Card data-testid="chart-ytd-trend">
        <CardHeader>
          <CardTitle>6-Month Financial Trend</CardTitle>
          <p className="text-sm text-muted-foreground">
            Revenue, Expenses, and Net Income
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={june2025Data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={3}
                strokeDasharray="5 5"
                name="Expenses"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#10b981"
                strokeWidth={3}
                name="Net Surplus"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* SECTION 5: ALERTS & ACTION ITEMS */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Alerts & Action Items</h2>
        
        {/* Critical Alerts */}
        <Alert variant="destructive" data-testid="alert-critical">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Alerts (3)</AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            <div className="pl-4">
              <p className="font-medium">• Popular Operating Account OVERDRAWN (-$1,457)</p>
              <p className="text-sm pl-4">Action: Transfer $2,000 from Truist immediately</p>
            </div>
            <div className="pl-4">
              <p className="font-medium">• Water Bill UNPAID - $1,400 due</p>
              <p className="text-sm pl-4">Action: Pay City of North Miami by July 5</p>
            </div>
            <div className="pl-4">
              <p className="font-medium">• 3 Units with Attorney (Total owed: $122,406)</p>
              <p className="text-sm pl-4">Units: 305, 308, 405 | Action: Review legal status</p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Warnings */}
        <Alert data-testid="alert-warnings">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Warnings (2)</AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            <div className="pl-4">
              <p className="font-medium">• Management Fees 84% Over Budget ($462 overage)</p>
              <p className="text-sm pl-4">Review: Why did Soppros charge $1,012 vs $550?</p>
            </div>
            <div className="pl-4">
              <p className="font-medium">• Legal Fees 86% Over Budget ($342 overage)</p>
              <p className="text-sm pl-4">Expected with active collections</p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Good News */}
        <Alert className="border-green-600 bg-green-50 dark:bg-green-950" data-testid="alert-good-news">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Good News (2)</AlertTitle>
          <AlertDescription className="space-y-2 mt-2 text-green-800 dark:text-green-300">
            <p className="pl-4">• $4,058 Monthly Surplus (468% above projection!)</p>
            <p className="pl-4">• Repairs came in $4,558 under budget</p>
          </AlertDescription>
        </Alert>
      </div>

      {/* SECTION 6: QUICK ACTIONS */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex flex-col items-center gap-2 whitespace-normal"
            data-testid="button-view-financials"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm text-center">View Full Financials</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex flex-col items-center gap-2 whitespace-normal"
            data-testid="button-pay-bills"
          >
            <Receipt className="h-5 w-5" />
            <span className="text-sm text-center">Pay Bills Queue (5)</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex flex-col items-center gap-2 whitespace-normal"
            data-testid="button-send-notices"
          >
            <Send className="h-5 w-5" />
            <span className="text-sm text-center">Send Delinquency Notices</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex flex-col items-center gap-2 whitespace-normal"
            onClick={() => setReportDialogOpen(true)}
            data-testid="button-generate-report"
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm text-center">Generate Monthly Report</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex flex-col items-center gap-2 whitespace-normal"
            onClick={() => setBudgetDialogOpen(true)}
            data-testid="button-propose-budget"
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-sm text-center">AI Budget Proposal</span>
          </Button>
        </div>
      </div>

      {/* GENERATE REPORT DIALOG */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent data-testid="dialog-generate-report">
          <DialogHeader>
            <DialogTitle>Generate Monthly Financial Report</DialogTitle>
            <DialogDescription>
              Create a comprehensive 7-page PDF report with AI-powered financial commentary.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="month">Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month" data-testid="select-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                data-testid="input-year"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
              data-testid="button-cancel-report"
            >
              Cancel
            </Button>
            <Button
              onClick={() => generateReportMutation.mutate({ 
                month: parseInt(selectedMonth), 
                year: parseInt(selectedYear) 
              })}
              disabled={generateReportMutation.isPending}
              data-testid="button-confirm-generate"
            >
              {generateReportMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate PDF Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BUDGET PROPOSAL DIALOG */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-budget-proposal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Budget Proposal
            </DialogTitle>
            <DialogDescription>
              Claude AI analyzes your historical data and proposes next year's budget with 3 scenarios.
            </DialogDescription>
          </DialogHeader>
          
          {!budgetProposal ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="targetYear">Budget Year</Label>
                <Input
                  id="targetYear"
                  type="number"
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  placeholder="2026"
                  data-testid="input-target-year"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setBudgetDialogOpen(false)}
                  data-testid="button-cancel-budget"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => generateBudgetMutation.mutate({ targetYear: parseInt(targetYear) })}
                  disabled={generateBudgetMutation.isPending}
                  className="flex-1"
                  data-testid="button-generate-budget"
                >
                  {generateBudgetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate AI Budget Proposal
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6" data-testid="budget-proposal-results">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Executive Summary</h3>
                <p className="text-sm">{budgetProposal.executiveSummary}</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended Assessment: ${budgetProposal.recommendedAssessment}/month</CardTitle>
                  <CardDescription>Change: {budgetProposal.assessmentChange}</CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {budgetProposal.scenarios?.conservative && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Conservative</CardTitle>
                      <CardDescription>
                        ${budgetProposal.scenarios.conservative.monthlyAssessment}/month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-sm">
                        <p>Revenue: ${budgetProposal.scenarios.conservative.annualRevenue?.toLocaleString()}</p>
                        <p>Expenses: ${budgetProposal.scenarios.conservative.annualExpenses?.toLocaleString()}</p>
                        <p>Net: ${budgetProposal.scenarios.conservative.netIncome?.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {budgetProposal.scenarios?.moderate && (
                  <Card className="border-purple-600">
                    <CardHeader>
                      <CardTitle className="text-base">Moderate (Recommended)</CardTitle>
                      <CardDescription>
                        ${budgetProposal.scenarios.moderate.monthlyAssessment}/month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-sm">
                        <p>Revenue: ${budgetProposal.scenarios.moderate.annualRevenue?.toLocaleString()}</p>
                        <p>Expenses: ${budgetProposal.scenarios.moderate.annualExpenses?.toLocaleString()}</p>
                        <p>Net: ${budgetProposal.scenarios.moderate.netIncome?.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {budgetProposal.scenarios?.optimistic && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Optimistic</CardTitle>
                      <CardDescription>
                        ${budgetProposal.scenarios.optimistic.monthlyAssessment}/month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-sm">
                        <p>Revenue: ${budgetProposal.scenarios.optimistic.annualRevenue?.toLocaleString()}</p>
                        <p>Expenses: ${budgetProposal.scenarios.optimistic.annualExpenses?.toLocaleString()}</p>
                        <p>Net: ${budgetProposal.scenarios.optimistic.netIncome?.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {budgetProposal.risks && budgetProposal.risks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Identified Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      {budgetProposal.risks.map((risk: string, i: number) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {budgetProposal.recommendations && budgetProposal.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      {budgetProposal.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setBudgetProposal(null);
                    setBudgetDialogOpen(false);
                  }}
                  data-testid="button-close-budget"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setBudgetProposal(null)}
                  data-testid="button-new-proposal"
                >
                  Generate New Proposal
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
