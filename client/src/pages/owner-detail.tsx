import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  CreditCard,
  Ban,
  CalendarPlus,
  Send,
  FileCheck,
  History,
} from "lucide-react";

type Unit = {
  id: string;
  unitNumber: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  mailingAddress?: string;
  totalOwed: string;
  monthlyMaintenance: string;
  maintenanceBalance: string;
  firstAssessmentBalance: string;
  secondAssessmentBalance: string;
  delinquencyStatus: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: string;
};

type LedgerEntry = {
  id: string;
  unitId: string;
  date: string;
  description: string;
  chargeAmount: string;
  paymentAmount: string;
  balance: string;
  type: string;
};

export default function OwnerDetail() {
  const [, params] = useRoute("/owners/:unitNumber");
  const [, setLocation] = useLocation();
  const unitNumber = params?.unitNumber;

  // First, fetch all units
  const { data: units, isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  // Then, find the specific unit from the loaded units
  const unit = units?.find((u) => u.unitNumber === unitNumber);

  // Finally, fetch ledger entries using the unit ID (only after unit is defined)
  const { data: ledgerEntries, isLoading: ledgerLoading } = useQuery<LedgerEntry[]>({
    queryKey: [`/api/units/${unit?.id}/ledger`],
    enabled: !!unit?.id,
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount || "0"));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      current: { label: "Current", className: "bg-green-500" },
      "30-60days": { label: "30-60 Days", className: "bg-yellow-500" },
      "60-90days": { label: "61-90 Days", className: "bg-orange-500" },
      "90plus": { label: "90+ Days", className: "bg-red-500" },
      attorney: { label: "Attorney", className: "bg-red-900" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "bg-gray-500",
    };

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const calculateDaysPastDue = () => {
    if (!unit || parseFloat(unit.totalOwed) === 0) return 0;

    // Simple calculation based on status
    const statusToDays = {
      current: 0,
      "30-60days": 45,
      "60-90days": 75,
      "90plus": 120,
      attorney: 180,
    };

    return statusToDays[unit.delinquencyStatus as keyof typeof statusToDays] || 0;
  };

  // Show loading state while fetching units
  if (unitsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading owner details...</p>
        </div>
      </div>
    );
  }

  // Show error if unit not found
  if (!unit) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/owners")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Owners
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unit {unitNumber} not found. Please check the unit number and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const daysPastDue = calculateDaysPastDue();
  const hasBalance = parseFloat(unit.totalOwed) > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/owners")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Owners
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Unit {unit.unitNumber} - {unit.ownerName || "Owner"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(unit.delinquencyStatus)}
              {hasBalance && (
                <span className="text-sm text-red-600 font-semibold">
                  {daysPastDue} days past due
                </span>
              )}
              <span className="text-sm text-gray-500">
                • Financial data as of July 2025
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Edit Info
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                  <p className={`text-3xl font-bold ${hasBalance ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(unit.totalOwed)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Maintenance</p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(unit.monthlyMaintenance)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Payment</p>
                  <p className="text-lg font-medium">{formatDate(unit.lastPaymentDate)}</p>
                  {unit.lastPaymentAmount && (
                    <p className="text-sm text-gray-500">
                      {formatCurrency(unit.lastPaymentAmount)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Days Past Due</p>
                  <p className={`text-lg font-medium ${daysPastDue > 0 ? "text-red-600" : "text-green-600"}`}>
                    {daysPastDue} days
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Maintenance Balance:</span>
                  <span className="font-medium">{formatCurrency(unit.maintenanceBalance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Loan Assessment Balance:</span>
                  <span className="font-medium">{formatCurrency(unit.firstAssessmentBalance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Special Assessment Balance:</span>
                  <span className="font-medium">{formatCurrency(unit.secondAssessmentBalance)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Ledger */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Account Ledger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Charges</TableHead>
                      <TableHead className="text-right">Payments</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries && ledgerEntries.length > 0 ? (
                      ledgerEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-sm">
                            {formatDate(entry.date)}
                          </TableCell>
                          <TableCell className="text-sm">{entry.description}</TableCell>
                          <TableCell className="text-right text-sm">
                            {parseFloat(entry.chargeAmount) > 0 && (
                              <span className="text-red-600">
                                {formatCurrency(entry.chargeAmount)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {parseFloat(entry.paymentAmount) > 0 && (
                              <span className="text-green-600">
                                {formatCurrency(entry.paymentAmount)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatCurrency(entry.balance)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No ledger entries found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm font-medium">{unit.ownerEmail || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="text-sm font-medium">{unit.ownerPhone || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-600">Mailing Address</p>
                  <p className="text-sm font-medium">
                    {unit.mailingAddress || `645 NE 121st Street, Unit ${unit.unitNumber}, North Miami Beach, FL 33162`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="default" className="w-full justify-start" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Record Check Payment
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Ban className="h-4 w-4 mr-2" />
                Waive Late Fee
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Start Payment Plan
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Send Payment Reminder
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileCheck className="h-4 w-4 mr-2" />
                Generate Estoppel
              </Button>
            </CardContent>
          </Card>

          {/* Unit Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Unit Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 text-center py-4">
                No documents uploaded
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Upload Document
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
