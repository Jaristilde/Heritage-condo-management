import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const invoiceFormSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be a positive number"
  ),
  glCode: z.string().optional(),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
  status: z.enum(["pending", "approved", "paid"]),
  paymentDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  checkNumber: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface Vendor {
  id: string;
  vendorName: string;
}

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
  notes: string | null;
}

export default function InvoiceForm() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditMode = !!id;

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      vendorId: "",
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      amount: "",
      glCode: "",
      description: "",
      fileUrl: "",
      status: "pending",
      paymentDate: "",
      paymentMethod: "",
      checkNumber: "",
      notes: "",
    },
  });

  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const { data: invoice, isLoading: invoiceLoading } = useQuery<Invoice>({
    queryKey: [`/api/invoices/${id}`],
    enabled: isEditMode,
  });

  // Populate form when editing
  if (isEditMode && invoice && !form.formState.isDirty) {
    form.reset({
      vendorId: invoice.vendorId,
      invoiceNumber: invoice.invoiceNumber || "",
      invoiceDate: invoice.invoiceDate.split('T')[0],
      dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : "",
      amount: invoice.amount,
      glCode: invoice.glCode || "",
      description: invoice.description || "",
      fileUrl: invoice.fileUrl || "",
      status: invoice.status as "pending" | "approved" | "paid",
      paymentDate: invoice.paymentDate ? invoice.paymentDate.split('T')[0] : "",
      paymentMethod: invoice.paymentMethod || "",
      checkNumber: invoice.checkNumber || "",
      notes: invoice.notes || "",
    });
  }

  const createMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        invoiceDate: new Date(data.invoiceDate).toISOString(),
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : null,
        invoiceNumber: data.invoiceNumber || null,
        glCode: data.glCode || null,
        description: data.description || null,
        fileUrl: data.fileUrl || null,
        paymentMethod: data.paymentMethod || null,
        checkNumber: data.checkNumber || null,
        notes: data.notes || null,
      };
      return apiRequest("POST", "/api/invoices", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      setLocation("/invoices");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        invoiceDate: new Date(data.invoiceDate).toISOString(),
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : null,
        invoiceNumber: data.invoiceNumber || null,
        glCode: data.glCode || null,
        description: data.description || null,
        fileUrl: data.fileUrl || null,
        paymentMethod: data.paymentMethod || null,
        checkNumber: data.checkNumber || null,
        notes: data.notes || null,
      };
      return apiRequest("PUT", `/api/invoices/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: [`/api/invoices/${id}`] });
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      setLocation("/invoices");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const status = form.watch("status");

  if (isEditMode && invoiceLoading) {
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/invoices")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Edit Invoice" : "Create Invoice"}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors?.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.vendorName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="INV-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="glCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GL Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="5000-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {status === "paid" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="ach">ACH</SelectItem>
                            <SelectItem value="wire">Wire Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1234" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter invoice description..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/invoices")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? "Update Invoice" : "Create Invoice"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
