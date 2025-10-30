import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Users, CheckCircle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface Unit {
  id: string;
  unitNumber: string;
  ownerName: string | null;
  hasPopularLoan: boolean;
  sa1PriorBalance: string;
  sa1MonthlyCharge: string;
  sa1PaymentJuly: string;
  sa1Balance: string;
  sa1Paid: boolean;
  sa1Status: string;
}

export default function SA1Assessment() {
  const [, setLocation] = useLocation();
  const { data: units, isLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
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

  // Sort units by number
  const sortedUnits = [...(units || [])].sort((a, b) =>
    a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true })
  );

  // Group units by status
  const paidOff = sortedUnits.filter((u) => !u.hasPopularLoan);
  const unitsWithSA1 = sortedUnits.filter((u) => u.hasPopularLoan);
  const paidJuly = unitsWithSA1.filter((u) => u.sa1Paid);
  const unpaidJuly = unitsWithSA1.filter((u) => !u.sa1Paid);

  // Calculate totals
  const totalOriginalLoan = 17500; // Per unit
  const totalAssessed = totalOriginalLoan * 24; // All units originally had SA#1
  const totalCollectedAllTime = paidOff.length * totalOriginalLoan +
    unitsWithSA1.reduce((sum, u) => sum + (totalOriginalLoan - parseFloat(u.sa1Balance)), 0);
  const totalOutstanding = unitsWithSA1.reduce((sum, u) => sum + parseFloat(u.sa1Balance), 0);
  const collectionRate = (totalCollectedAllTime / totalAssessed) * 100;

  // July specific
  const julyExpected = unitsWithSA1.length * 208;
  const julyCollected = paidJuly.reduce((sum, u) => sum + parseFloat(u.sa1PaymentJuly), 0);
  const julyCollectionRate = unitsWithSA1.length > 0 ? (paidJuly.length / unitsWithSA1.length) * 100 : 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/assessments")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>
        <div>
          <h1 className="text-3xl font-bold">SA#1 Popular Loan Tracking</h1>
          <p className="text-muted-foreground">
            $17,500 per unit assessment with $208 monthly payments - July 2025 Status
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAssessed)}</div>
            <p className="text-xs text-muted-foreground">
              24 units × $17,500
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCollectedAllTime)}</div>
            <p className="text-xs text-muted-foreground">
              {collectionRate.toFixed(1)}% collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">
              {unitsWithSA1.length} units still paying
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">July 2025 Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{julyCollectionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {paidJuly.length} of {unitsWithSA1.length} paid July
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Paid Off Section */}
      {paidOff.length > 0 && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-green-600">✅ {paidOff.length} Units</Badge>
              LOAN PAID IN FULL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Original Loan</TableHead>
                  <TableHead className="text-right">Total Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidOff.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-bold">Unit {unit.unitNumber}</TableCell>
                    <TableCell>{unit.ownerName || `Owner ${unit.unitNumber}`}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(totalOriginalLoan)}</TableCell>
                    <TableCell className="text-right font-mono text-green-600 font-bold">
                      {formatCurrency(totalOriginalLoan)}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-600">✅ PAID OFF</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Paid July Section */}
      {paidJuly.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-blue-600">✅ {paidJuly.length} Units</Badge>
              JULY 2025 PAID ($208)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Prior Balance</TableHead>
                  <TableHead className="text-right">July Charge</TableHead>
                  <TableHead className="text-right">July Payment</TableHead>
                  <TableHead className="text-right">New Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidJuly.map((unit) => {
                  const priorBalance = parseFloat(unit.sa1PriorBalance);
                  const julyCharge = 208;
                  const julyPayment = parseFloat(unit.sa1PaymentJuly);
                  const newBalance = parseFloat(unit.sa1Balance);

                  return (
                    <TableRow key={unit.id}>
                      <TableCell className="font-bold">Unit {unit.unitNumber}</TableCell>
                      <TableCell>{unit.ownerName || `Owner ${unit.unitNumber}`}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(priorBalance)}</TableCell>
                      <TableCell className="text-right font-mono text-blue-600">
                        + {formatCurrency(julyCharge)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600 font-bold">
                        - {formatCurrency(julyPayment)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {formatCurrency(newBalance)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-600">✅ PAID</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-4">
              These units made their July 2025 payment of $208. Loan continues until fully paid off.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Unpaid July Section - RED FLAG */}
      {unpaidJuly.length > 0 && (
        <Card className="border-red-500">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Badge variant="destructive">🚩 {unpaidJuly.length} Units</Badge>
              JULY 2025 UNPAID - RED FLAG
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Prior Balance</TableHead>
                  <TableHead className="text-right">July Charge</TableHead>
                  <TableHead className="text-right">July Payment</TableHead>
                  <TableHead className="text-right">New Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidJuly.map((unit) => {
                  const priorBalance = parseFloat(unit.sa1PriorBalance);
                  const julyCharge = 208;
                  const julyPayment = parseFloat(unit.sa1PaymentJuly);
                  const newBalance = parseFloat(unit.sa1Balance);

                  return (
                    <TableRow key={unit.id} className="bg-red-50/50">
                      <TableCell className="font-bold">Unit {unit.unitNumber}</TableCell>
                      <TableCell>{unit.ownerName || `Owner ${unit.unitNumber}`}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(priorBalance)}</TableCell>
                      <TableCell className="text-right font-mono text-red-600">
                        + {formatCurrency(julyCharge)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-red-600 font-bold">
                        {formatCurrency(julyPayment)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-red-700">
                        {formatCurrency(newBalance)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">🚩 UNPAID</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="text-xs text-red-600 mt-4 font-semibold">
              ⚠️ These units did not make their July 2025 payment. Balance continues to accrue.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loan Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Original Loan Amount:</p>
              <p className="text-muted-foreground">$17,500 per unit from Popular Bank</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Monthly Payment:</p>
              <p className="text-muted-foreground">$208 per month until fully paid</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Current Status:</p>
              <p className="text-muted-foreground">
                {paidOff.length} units paid off, {unitsWithSA1.length} units still paying
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
