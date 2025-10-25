import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft } from "lucide-react";

const vendorFormSchema = z.object({
  vendorName: z.string().min(1, "Vendor name is required"),
  serviceType: z.string().min(1, "Service type is required"),
  vendorType: z.string().min(1, "Vendor category is required"),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  monthlyCost: z.string().optional(),
  contractExpiration: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorFormSchema>;

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
  status: string;
  notes: string | null;
}

export default function VendorForm() {
  const [, params] = useRoute("/vendors/:id/edit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const vendorId = params?.id;
  const isEditing = !!vendorId && vendorId !== "new";

  const { data: vendor, isLoading } = useQuery<Vendor>({
    queryKey: [`/api/vendors/${vendorId}`],
    enabled: isEditing,
  });

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      vendorName: "",
      serviceType: "",
      vendorType: "",
      contactEmail: "",
      contactPhone: "",
      monthlyCost: "",
      contractExpiration: "",
      paymentTerms: "",
      notes: "",
    },
  });

  // Update form when vendor data loads (in useEffect to avoid render-time errors)
  useEffect(() => {
    if (vendor && isEditing) {
      form.reset({
        vendorName: vendor.vendorName,
        serviceType: vendor.serviceType,
        vendorType: vendor.vendorType,
        contactEmail: vendor.contactEmail || "",
        contactPhone: vendor.contactPhone || "",
        monthlyCost: vendor.monthlyCost || "",
        contractExpiration: vendor.contractExpiration ? 
          new Date(vendor.contractExpiration).toISOString().split('T')[0] : "",
        paymentTerms: vendor.paymentTerms || "",
        notes: vendor.notes || "",
      });
    }
  }, [vendor, isEditing, form]);

  const createMutation = useMutation({
    mutationFn: async (data: VendorFormData) => {
      const payload = {
        ...data,
        contractExpiration: data.contractExpiration ? new Date(data.contractExpiration).toISOString() : null,
        status: "active",
      };
      return apiRequest("POST", "/api/vendors", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({
        title: "Success",
        description: "Vendor created successfully",
      });
      setLocation("/vendors");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create vendor",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: VendorFormData) => {
      const payload = {
        ...data,
        contractExpiration: data.contractExpiration ? new Date(data.contractExpiration).toISOString() : null,
      };
      return apiRequest("PATCH", `/api/vendors/${vendorId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      queryClient.invalidateQueries({ queryKey: [`/api/vendors/${vendorId}`] });
      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });
      setLocation("/vendors");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update vendor",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VendorFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading && isEditing) {
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
          size="icon"
          onClick={() => setLocation("/vendors")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Vendor" : "Add New Vendor"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update vendor information" : "Add a new service provider or contractor"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vendorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Acadia Elevator"
                          data-testid="input-vendor-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Elevator Maintenance"
                          data-testid="input-service-type"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendorType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vendor-type">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="utility">Utility</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Cost</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          data-testid="input-monthly-cost"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="service@vendor.com"
                          data-testid="input-contact-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="(305) 555-0123"
                          data-testid="input-contact-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-payment-terms">
                            <SelectValue placeholder="Select payment terms" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Net 15">Net 15</SelectItem>
                          <SelectItem value="Net 30">Net 30</SelectItem>
                          <SelectItem value="Annual">Annual</SelectItem>
                          <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractExpiration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Expiration</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          data-testid="input-contract-expiration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes about this vendor..."
                        rows={4}
                        data-testid="textarea-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/vendors")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : isEditing
                    ? "Update Vendor"
                    : "Create Vendor"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
