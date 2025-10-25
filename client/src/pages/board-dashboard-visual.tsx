import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KPICard } from "@/components/KPICard";
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
  Label,
  ReferenceLine,
} from "recharts";

export default function BoardDashboardVisual() {
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
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
                  <Label
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            data-testid="button-generate-report"
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm text-center">Generate Monthly Report</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
