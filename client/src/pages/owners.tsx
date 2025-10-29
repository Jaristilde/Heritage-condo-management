import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { FileDown, Search, Users } from "lucide-react";

type Unit = {
  id: string;
  unitNumber: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  totalOwed: string;
  delinquencyStatus: string;
  lastPaymentDate?: string;
};

export default function Owners() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: units, isLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

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

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const filteredUnits = units?.filter((unit) => {
    const matchesSearch =
      unit.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
      unit.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
      unit.ownerEmail?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || unit.delinquencyStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalUnits = units?.length || 0;
  const delinquentUnits = units?.filter((u) => parseFloat(u.totalOwed) > 0).length || 0;
  const totalOutstanding = units?.reduce((sum, u) => sum + parseFloat(u.totalOwed), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading owners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Owners & Units
          </h1>
          <p className="text-gray-600 mt-1">
            Manage owner information, balances, and communications • Financial data as of July 2025
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUnits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Units in Arrears
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{delinquentUnits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(totalOutstanding.toString())}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by unit, owner name, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="30-60days">30-60 Days</SelectItem>
                  <SelectItem value="60-90days">61-90 Days</SelectItem>
                  <SelectItem value="90plus">90+ Days</SelectItem>
                  <SelectItem value="attorney">Attorney</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Unit</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits && filteredUnits.length > 0 ? (
                  filteredUnits.map((unit) => (
                    <TableRow
                      key={unit.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setLocation(`/owners/${unit.unitNumber}`)}
                    >
                      <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                      <TableCell>{unit.ownerName || "—"}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {unit.ownerEmail || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {unit.ownerPhone || "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span
                          className={
                            parseFloat(unit.totalOwed) > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {formatCurrency(unit.totalOwed)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(unit.delinquencyStatus)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(unit.lastPaymentDate)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No units found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
