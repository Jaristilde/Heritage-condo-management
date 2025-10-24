import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, FileText, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { getUser } from "@/lib/auth";

interface Unit {
  id: string;
  unitNumber: string;
  monthlyMaintenance: string;
  totalOwed: string;
  delinquencyStatus: string;
  priorityLevel: string;
  notes: string | null;
}

interface Payment {
  id: string;
  amount: string;
  paymentType: string;
  paymentMethod: string;
  status: string;
  paidAt: string;
}

export default function OwnerDashboard() {
  const user = getUser();
  
  const { data: units } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const unit = units?.[0];

  const { data: payments } = useQuery<Payment[]>({
    queryKey: unit ? [`/api/units/${unit.id}/payments`] : [],
    enabled: !!unit,
  });

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  if (!unit) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Unit Assigned</h2>
          <p className="text-muted-foreground">
            Please contact management to have a unit assigned to your account.
          </p>
        </div>
      </div>
    );
  }

  const totalOwed = parseFloat(unit.totalOwed);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          My Account
        </h1>
        <p className="text-muted-foreground">
          Unit {unit.unitNumber} - Heritage Condominium Association
        </p>
      </div>

      {totalOwed > 0 && unit.delinquencyStatus !== 'current' && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <CardTitle className="text-destructive">Payment Required</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Your account has an outstanding balance. Please make a payment to avoid late fees.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card data-testid="card-current-balance">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-3xl font-bold font-mono" data-testid="text-current-balance">
                  {formatCurrency(unit.totalOwed)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Total outstanding
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/payment">
                <Button className="w-full" data-testid="button-make-payment">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Make a Payment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Regular Fee</span>
                <span className="font-mono font-medium">
                  {formatCurrency(unit.monthlyMaintenance)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Account Status</span>
                {getStatusBadge(unit.delinquencyStatus)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                  data-testid={`payment-${payment.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium">{payment.paymentType.replace(/_/g, " ").toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(payment.paidAt)} • {payment.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium text-green-600">
                      {formatCurrency(payment.amount)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          {payments && payments.length > 5 && (
            <Link href="/history">
              <Button variant="outline" className="w-full mt-4">
                View All Payments
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {unit.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Account Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{unit.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
