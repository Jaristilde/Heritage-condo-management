import { useQuery, useMutation } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Pencil, Trash2, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  vendorId: string;
  invoiceNumber: string | null;
  invoiceDate: string;
  dueDate: string | null;
  amount: string;
  glCode: string | null;
  description: string | null;
  fileUrl: string | null;
  status: string;
  paymentDate: string | null;
  paymentMethod: string | null;
  checkNumber: string | null;
  uploadedBy: string;
  approvedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Vendor {
  id: string;
  vendorName: string;
}

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      return apiRequest("DELETE", `/api/invoices/${invoiceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
      setInvoiceToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
      setInvoiceToDelete(null);
    },
  });

  if (invoicesLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const getVendorName = (vendorId: string) => {
    const vendor = vendors?.find(v => v.id === vendorId);
    return vendor?.vendorName || "Unknown Vendor";
  };

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch =
      getVendorName(invoice.vendorId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "paid":
        return "default";
      case "approved":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage vendor invoices
          </p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by vendor, invoice number, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first invoice"}
              </p>
              <Link href="/invoices/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>GL Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber || "—"}
                      </TableCell>
                      <TableCell>{getVendorName(invoice.vendorId)}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate
                          ? format(new Date(invoice.dueDate), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>{invoice.glCode || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.paymentDate
                          ? format(new Date(invoice.paymentDate), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {invoice.fileUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(invoice.fileUrl!, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Link href={`/invoices/${invoice.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInvoiceToDelete(invoice)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredInvoices.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredInvoices.length} of {invoices?.length || 0} invoices
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoiceToDelete?.invoiceNumber || 'this invoice'}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => invoiceToDelete && deleteMutation.mutate(invoiceToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
