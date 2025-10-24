import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard } from "lucide-react";
import { getUser } from "@/lib/auth";

interface Payment {
  id: string;
  unitId: string;
  amount: string;
  paymentType: string;
  paymentMethod: string;
  status: string;
  paidAt: string;
}

interface Unit {
  id: string;
  unitNumber: string;
}

export default function PaymentsList() {
  const user = getUser();
  
  const { data: units } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const unit = units?.[0];
  
  const isOwner = user?.role === 'owner';
  
  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: isOwner && unit 
      ? [`/api/units/${unit.id}/payments`] 
      : ["/api/payments"],
    enabled: !isOwner || !!unit,
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUnitNumber = (unitId: string) => {
    return units?.find(u => u.id === unitId)?.unitNumber || "N/A";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (paymentsLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const totalPayments = payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Payment History
          </h1>
          <p className="text-muted-foreground">
            {isOwner && unit 
              ? `Unit ${unit.unitNumber} payment transaction history` 
              : "Complete payment transaction history"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {payments?.length || 0} Total Payments
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total {isOwner ? "Paid" : "Collected"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono" data-testid="text-total-collected">
              {formatCurrency(totalPayments.toString())}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Completed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {payments?.filter(p => p.status === "completed").length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {payments?.filter(p => p.status === "pending").length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Payments Found</h3>
              <p className="text-muted-foreground">
                {isOwner 
                  ? "You haven't made any payments yet." 
                  : "No payments have been recorded in the system."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    {!isOwner && <TableHead>Unit</TableHead>}
                    <TableHead>Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.map((payment) => (
                    <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                      <TableCell>{formatDate(payment.paidAt)}</TableCell>
                      {!isOwner && (
                        <TableCell className="font-medium">
                          {getUnitNumber(payment.unitId)}
                        </TableCell>
                      )}
                      <TableCell className="capitalize">
                        {payment.paymentType.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.paymentMethod}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
