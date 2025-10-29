import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, TrendingUp, DollarSign, Info } from "lucide-react";

/**
 * Budget Management Page
 *
 * Placeholder for future budget management features
 * Currently the BudgetHealthWidget on dashboard provides real-time budget monitoring
 */

export default function Budgets() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
          <Calculator className="h-8 w-8" />
          Budget Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive budget planning and tracking tools
        </p>
      </div>

      {/* Current Budget Monitoring Available */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Budget monitoring is already available!</strong> Check the <strong>Budget Health Widget</strong> on your dashboard for real-time budget variance tracking.
        </AlertDescription>
      </Alert>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Available Now
            </CardTitle>
            <CardDescription>Budget features you can use today</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Budget Health Widget:</strong> Real-time variance tracking on dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Budget vs Actual Report:</strong> Available in Reports tab</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Automated Alerts:</strong> Monthly variance checks on 5th at 7:00 AM</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Category Tracking:</strong> Track spending by expense category</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Coming in Version 2.0
            </CardTitle>
            <CardDescription>Future budget management features</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span>⏳</span>
                <span>Annual budget creation and approval workflow</span>
              </li>
              <li className="flex items-start gap-2">
                <span>⏳</span>
                <span>Multi-year budget comparison and forecasting</span>
              </li>
              <li className="flex items-start gap-2">
                <span>⏳</span>
                <span>Budget amendments and revision tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span>⏳</span>
                <span>Budget line item drill-down with transaction details</span>
              </li>
              <li className="flex items-start gap-2">
                <span>⏳</span>
                <span>Budget proposal AI recommendations</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access to Existing Budget Features */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access to Budget Tools</CardTitle>
          <CardDescription>Use these existing features for budget management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Dashboard Budget Health Widget</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    View current month variance and critical/warning alerts
                  </p>
                </div>
                <a
                  href="/"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Go to Dashboard →
                </a>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Budget vs Actual Report</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Detailed category-level budget performance analysis
                  </p>
                </div>
                <a
                  href="/reports"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Go to Reports →
                </a>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Expense Tracking</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review and approve vendor invoices against budget
                  </p>
                </div>
                <a
                  href="/invoices"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Go to Invoices →
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Footer */}
      <div className="text-center text-sm text-muted-foreground pt-4 border-t">
        <p>
          <strong>Budget monitoring is fully operational.</strong> Advanced budget creation features coming in v2.0.
        </p>
      </div>
    </div>
  );
}
