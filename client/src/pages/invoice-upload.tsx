import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
import { ArrowLeft, Upload, FileText, Loader2, X } from "lucide-react";

const invoiceUploadSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(),
  dueDate: z.string().optional(),
  amount: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceUploadData = z.infer<typeof invoiceUploadSchema>;

interface Vendor {
  id: string;
  vendorName: string;
}

export default function InvoiceUpload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<InvoiceUploadData>({
    resolver: zodResolver(invoiceUploadSchema),
    defaultValues: {
      vendorId: "",
      invoiceNumber: "",
      invoiceDate: "",
      dueDate: "",
      amount: "",
      description: "",
      notes: "",
    },
  });

  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or image file (JPG, PNG)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedFileUrl(null);
  };

  const uploadMutation = useMutation({
    mutationFn: async (data: InvoiceUploadData) => {
      if (!uploadedFile && !uploadedFileUrl) {
        throw new Error("Please upload an invoice file");
      }

      let fileUrl = uploadedFileUrl;

      // Upload file if not already uploaded
      if (uploadedFile && !uploadedFileUrl) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', uploadedFile);

        const uploadRes = await fetch('/api/invoices/upload-file', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('heritage_auth_token')}`,
          },
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload file');
        }

        const uploadData = await uploadRes.json();
        fileUrl = uploadData.fileUrl;
        setUploadedFileUrl(fileUrl);
        setIsUploading(false);
      }

      // Create invoice with uploaded file
      const payload = {
        vendorId: data.vendorId,
        invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
        invoiceDate: data.invoiceDate || new Date().toISOString(),
        dueDate: data.dueDate || null,
        amount: data.amount ? parseFloat(data.amount) : 0,
        description: data.description || null,
        notes: data.notes || null,
        fileUrl,
        fileName: uploadedFile?.name || null,
        status: 'pending', // Always pending for board approval
      };

      return apiRequest("POST", "/api/invoices", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice uploaded successfully. Board members will be notified for approval.",
      });
      setLocation("/invoices");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload invoice",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const onSubmit = (data: InvoiceUploadData) => {
    uploadMutation.mutate(data);
  };

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
          <h1 className="text-3xl font-bold">Upload Invoice</h1>
          <p className="text-muted-foreground mt-1">
            Upload vendor invoice for board approval
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                <div className="text-center">
                  {!uploadedFile ? (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Upload Invoice File</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        PDF, JPG, or PNG (max 10MB)
                      </p>
                      <label htmlFor="file-upload">
                        <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                          Choose File
                        </Button>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

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
                      <FormDescription>
                        Who sent this invoice?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormDescription>
                        Total invoice amount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="INV-12345" />
                      </FormControl>
                      <FormDescription>
                        Optional - from vendor invoice
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormDescription>
                        When payment is due
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="What is this invoice for?"
                        rows={2}
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
                        placeholder="Any additional notes for the board..."
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-1">Approval Process</p>
                <p className="text-sm text-muted-foreground">
                  This invoice will be marked as "Pending" and board members will be notified via email and SMS to review and approve.
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/invoices")}
                  disabled={isUploading || uploadMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!uploadedFile || isUploading || uploadMutation.isPending}
                >
                  {(isUploading || uploadMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isUploading ? "Uploading..." : "Upload Invoice"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
