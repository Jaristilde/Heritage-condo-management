import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Unit {
  id: string;
  unitNumber: string;
  totalOwed: string;
  notes: string | null;

  // 💳 Maintenance Fund
  maintenancePriorBalance: string;
  maintenancePaymentJuly: string;
  maintenanceBalance: string;
  maintenancePaid: boolean;

  // 💳 SA#1 Fund
  hasPopularLoan: boolean;
  sa1PriorBalance: string;
  sa1PaymentJuly: string;
  sa1Balance: string;
  sa1Paid: boolean;

  // 💳 SA#2 Fund
  sa2RemainingBalance: string;
  sa2PaymentJuly: string;
  sa2OnPaymentPlan: boolean;

  // Status flags
  redFlag: boolean;
  delinquent: boolean;
}

export default function Units() {
  const { data: units, isLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
    staleTime: 0,
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  // Fund Card Component
  const FundCard = ({ title, unit, fundType }: { title: string; unit: Unit; fundType: 'maintenance' | 'sa1' | 'sa2' }) => {
    const cardTitle = fundType === 'maintenance' ? '💳 Monthly Maintenance' :
                      fundType === 'sa1' ? '💳 SA#1 Popular Loan' :
                      '💳 SA#2 (2024 Assessment)';

    // SA#1 handling - check if loan is completely paid off or on-going
    if (fundType === 'sa1') {
      const loanCompletePaidOff = !unit.hasPopularLoan;

      if (loanCompletePaidOff) {
        // SA#1 is PAID OFF - show historical view
        return (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{cardTitle}</span>
                <Badge className="bg-green-600">✅ PAID OFF</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Loan:</span>
                  <span className="font-mono">$17,500.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Paid:</span>
                  <span className="font-mono text-green-600">$17,500.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Balance:</span>
                  <span className="font-mono text-green-600">$0.00</span>
                </div>
                <div className="text-xs text-green-700 mt-2 font-semibold">
                  Loan paid off in full
                </div>
              </div>
            </CardContent>
          </Card>
        );
      } else {
        // SA#1 is ON-GOING - show monthly activity
        const priorBalance = parseFloat(unit.sa1PriorBalance);
        const julyCharge = 208.00;
        const julyPayment = parseFloat(unit.sa1PaymentJuly);
        const newBalance = parseFloat(unit.sa1Balance);
        const isPaid = unit.sa1Paid;
        const status = isPaid ? "✅ JULY PAID" : "🚩 JULY UNPAID";

        return (
          <Card className={isPaid ? "border-green-200" : "border-red-200"}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{cardTitle}</span>
                <Badge variant={isPaid ? "default" : "destructive"} className={isPaid ? "bg-green-600" : ""}>
                  {status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prior Balance:</span>
                  <span className="font-mono">{formatCurrency(priorBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">July 2025 Charge:</span>
                  <span className="font-mono text-blue-600">+ {formatCurrency(julyCharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">July 2025 Payment:</span>
                  <span className="font-mono text-green-600">- {formatCurrency(julyPayment)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>New Balance:</span>
                  <span className={`font-mono ${newBalance === 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(newBalance)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  $208/month until paid off
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }
    }

    // SA#2 handling - check if completely paid off or on-going
    if (fundType === 'sa2') {
      const remaining = parseFloat(unit.sa2RemainingBalance);
      const isCompletePaidOff = remaining === 0 && !unit.sa2OnPaymentPlan;

      if (isCompletePaidOff) {
        // SA#2 is PAID OFF - show historical view
        return (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{cardTitle}</span>
                <Badge className="bg-green-600">✅ PAID OFF</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Assessment:</span>
                  <span className="font-mono">$11,920.92</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Paid:</span>
                  <span className="font-mono text-green-600">$11,920.92</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Balance:</span>
                  <span className="font-mono text-green-600">$0.00</span>
                </div>
                <div className="text-xs text-green-700 mt-2 font-semibold">
                  Assessment paid in full
                </div>
              </div>
            </CardContent>
          </Card>
        );
      } else {
        // SA#2 is ON-GOING - show remaining balance
        const status = unit.sa2OnPaymentPlan ? "📋 PAYMENT PLAN" : "🚩 OWES";
        const isPaid = false;

        return (
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{cardTitle}</span>
                <Badge variant={unit.sa2OnPaymentPlan ? "default" : "destructive"} className={unit.sa2OnPaymentPlan ? "bg-blue-600" : ""}>
                  {status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Assessment:</span>
                  <span className="font-mono">$11,920.92</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <span className="font-mono text-green-600">{formatCurrency(11920.92 - remaining)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Remaining Balance:</span>
                  <span className="font-mono text-red-600">{formatCurrency(remaining)}</span>
                </div>
                {unit.sa2OnPaymentPlan && (
                  <div className="text-xs text-blue-600 mt-2">
                    3-Year Payment Plan (Started April 2024)
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      }
    }

    // Maintenance Fund - always monthly tracking
    if (fundType === 'maintenance') {
      const priorBalance = parseFloat(unit.maintenancePriorBalance);
      const julyCharge = 578.45;
      const julyPayment = parseFloat(unit.maintenancePaymentJuly);
      const newBalance = parseFloat(unit.maintenanceBalance);
      const isPaid = unit.maintenancePaid;
      const status = isPaid ? "✅ JULY PAID" : "🚩 JULY UNPAID";

      return (
        <Card className={isPaid ? "border-green-200" : "border-red-200"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>{cardTitle}</span>
              <Badge variant={isPaid ? "default" : "destructive"} className={isPaid ? "bg-green-600" : ""}>
                {status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prior Balance:</span>
                <span className="font-mono">{formatCurrency(priorBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">July 2025 Charge:</span>
                <span className="font-mono text-blue-600">+ {formatCurrency(julyCharge)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">July 2025 Payment:</span>
                <span className="font-mono text-green-600">- {formatCurrency(julyPayment)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>New Balance:</span>
                <span className={`font-mono ${newBalance === 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(newBalance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
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
          <h1 className="text-3xl font-bold">
            Unit Owner Ledgers
          </h1>
          <p className="text-muted-foreground mt-2 font-bold">
            As of July 2025
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {units?.length || 0} Units Total
          </span>
        </div>
      </div>

      {/* Assessment Reference - Sticky Header */}
      <div className="sticky top-0 z-10 bg-blue-50 border-b-2 border-blue-200 p-4 mb-6">
        {/* Condensed version with just the key numbers */}
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="font-bold text-gray-800">Assessment Reference:</div>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-600">SA#1 Original:</span>
              <span className="font-bold ml-2">$17,500</span>
              <span className="text-blue-600 ml-2">($208/mo)</span>
            </div>
            <div className="border-l pl-6">
              <span className="text-gray-600">SA#2 Original:</span>
              <span className="font-bold ml-2">$11,920.92</span>
            </div>
          </div>
        </div>
      </div>

      {/* Units Grid - Each unit shows 3 separate fund cards */}
      <div className="space-y-8">
        {units?.map((unit) => (
          <Card key={unit.id} className={unit.redFlag ? "border-l-4 border-l-red-500" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {unit.redFlag && <AlertCircle className="h-5 w-5 text-red-600" />}
                  <div>
                    <CardTitle className="text-xl">Unit {unit.unitNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{unit.notes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">TOTAL AMOUNT DUE</div>
                  <div className={`text-2xl font-bold ${
                    parseFloat(unit.totalOwed) < 0 ? "text-green-600" :
                    parseFloat(unit.totalOwed) > 10000 ? "text-red-600" : ""
                  }`}>
                    {formatCurrency(unit.totalOwed)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Maintenance */}
                <FundCard title="Monthly Maintenance" unit={unit} fundType="maintenance" />

                {/* Card 2: SA#1 Popular Loan */}
                <FundCard title="SA#1 Popular Loan" unit={unit} fundType="sa1" />

                {/* Card 3: SA#2 (2024 Assessment) */}
                <FundCard title="SA#2 (2024 Assessment)" unit={unit} fundType="sa2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
