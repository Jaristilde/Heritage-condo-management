import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Pencil, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";

interface Vendor {
  id: string;
  vendorName: string;
  serviceType: string;
  vendorType: string;
  contactEmail: string | null;
  contactPhone: string | null;
  monthlyCost: string | null;
  contractExpiration: string | null;
  paymentTerms: string | null;
  lastPaidDate: string | null;
  status: string;
  notes: string | null;
}

export default function Vendors() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

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

  const filteredVendors = vendors?.filter(vendor =>
    vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getPaymentStatus = (vendor: Vendor) => {
    if (!vendor.lastPaidDate || !vendor.paymentTerms) {
      return { status: "unknown", label: "Unknown", variant: "secondary" as const };
    }

    const lastPaid = new Date(vendor.lastPaidDate);
    const today = new Date();
    const daysSincePayment = Math.floor((today.getTime() - lastPaid.getTime()) / (1000 * 60 * 60 * 24));
    
    const paymentTermDays = vendor.paymentTerms.includes("30") ? 30 : 
                           vendor.paymentTerms.includes("15") ? 15 : 30;
    
    if (daysSincePayment <= paymentTermDays) {
      return { status: "paid", label: "Paid", variant: "default" as const };
    } else if (daysSincePayment <= paymentTermDays + 7) {
      return { status: "due_soon", label: "Due Soon", variant: "secondary" as const };
    } else {
      return { status: "overdue", label: "Overdue", variant: "destructive" as const };
    }
  };

  const getNextDueDate = (vendor: Vendor) => {
    if (!vendor.lastPaidDate) return "-";
    
    const lastPaid = new Date(vendor.lastPaidDate);
    const nextDue = new Date(lastPaid);
    nextDue.setMonth(nextDue.getMonth() + 1);
    
    return format(nextDue, "MMM d, yyyy");
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Vendor Management
          </h1>
          <p className="text-muted-foreground">
            Manage building service providers and contractors
          </p>
        </div>
        <Link href="/vendors/new">
          <Button data-testid="button-add-vendor">
            <Plus className="h-4 w-4 mr-2" />
            Add New Vendor
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors by name or service type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-vendors"
              />
            </div>
          </div>

          {filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Vendors Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No vendors match your search." : "No vendors have been added yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead className="text-right">Monthly Cost</TableHead>
                    <TableHead>Last Paid</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => {
                    const paymentStatus = getPaymentStatus(vendor);
                    return (
                      <TableRow key={vendor.id} data-testid={`row-vendor-${vendor.id}`}>
                        <TableCell className="font-medium">
                          <Link href={`/vendors/${vendor.id}`}>
                            <span className="text-primary hover:underline cursor-pointer">
                              {vendor.vendorName}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell>{vendor.serviceType}</TableCell>
                        <TableCell className="text-right font-mono">
                          {vendor.monthlyCost ? `$${parseFloat(vendor.monthlyCost).toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell>
                          {vendor.lastPaidDate
                            ? format(new Date(vendor.lastPaidDate), "MMM d, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>{getNextDueDate(vendor)}</TableCell>
                        <TableCell>
                          <Badge variant={paymentStatus.variant} data-testid={`badge-status-${vendor.id}`}>
                            {paymentStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/vendors/${vendor.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-edit-${vendor.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-delete-${vendor.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
