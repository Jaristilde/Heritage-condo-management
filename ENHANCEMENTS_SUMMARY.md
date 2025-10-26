# Invoice & Units Enhancements - Implementation Summary

## ✅ COMPLETED BACKEND

### 1. File Upload Infrastructure
- ✅ Created `/server/middleware/upload.ts` with multer config
- ✅ Invoice PDFs only, 10MB max
- ✅ Saved to `./uploads/invoices/`
- ✅ Filename format: `invoice_${timestamp}_${originalname}`

### 2. Database Schema Updates
- ✅ Added to `invoices` table:
  - `fileName` - Original filename
  - `approvedAt` - Approval timestamp
  - `rejectedBy` - User ID who rejected
  - `rejectedAt` - Rejection timestamp
  - `rejectionReason` - Why rejected
  - `status` - Now includes 'rejected'

### 3. New API Endpoints
- ✅ `POST /api/invoices/:id/upload` - Upload PDF file
- ✅ `POST /api/invoices/:id/approve` - Approve invoice
- ✅ `POST /api/invoices/:id/reject` - Reject invoice (with reason)
- ✅ `POST /api/invoices/bulk-approve` - Approve multiple invoices
- ✅ `GET /api/invoices` - Now supports `startDate` and `endDate` query params

### 4. Storage Layer
- ✅ Added `getInvoicesWithFilters()` method with date range filtering
- ✅ Updated IStorage interface

### 5. Static File Serving
- ✅ Added `/uploads` route to serve uploaded files

---

## 🚧 TODO - FRONTEND

### 1. Update Invoice Form Component
**File:** `/client/src/pages/invoice-form.tsx`

**Changes Needed:**

1. **Add file upload state:**
```typescript
const [file, setFile] = useState<File | null>(null);
const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
```

2. **Add file input after Status field:**
```tsx
<FormField
  control={form.control}
  name="fileUrl"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Invoice PDF</FormLabel>
      <FormControl>
        <div className="space-y-2">
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                setFile(selectedFile);
              }
            }}
          />
          {uploading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Uploading... {uploadProgress}%</span>
            </div>
          )}
          {field.value && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <a
                href={field.value}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                View uploaded PDF
              </a>
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

3. **Add upload function after invoice create:**
```typescript
const handleFileUpload = async (invoiceId: string) => {
  if (!file) return;

  setUploading(true);
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/invoices/${invoiceId}/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    return data.fileUrl;
  } catch (error) {
    toast({
      title: "Upload Failed",
      description: "Could not upload PDF file",
      variant: "destructive",
    });
  } finally {
    setUploading(false);
  }
};
```

4. **Update create mutation to handle upload:**
```typescript
const createMutation = useMutation({
  mutationFn: async (data: InvoiceFormData) => {
    // Create invoice first
    const response = await apiRequest("POST", "/api/invoices", payload);
    const invoice = await response.json();

    // Then upload file if present
    if (file) {
      await handleFileUpload(invoice.id);
    }

    return invoice;
  },
  // ... rest of mutation
});
```

### 2. Add Date Range Filters to Invoice List
**File:** `/client/src/pages/invoices.tsx`

**Add above the table:**
```tsx
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format as formatDate } from "date-fns";

// Add state
const [startDate, setStartDate] = useState<Date | undefined>();
const [endDate, setEndDate] = useState<Date | undefined>();

// Update query
const { data: invoices, isLoading } = useQuery<Invoice[]>({
  queryKey: ["/api/invoices", statusFilter, startDate, endDate],
  queryFn: async () => {
    let url = "/api/invoices?";
    if (statusFilter !== "all") url += `status=${statusFilter}&`;
    if (startDate) url += `startDate=${startDate.toISOString()}&`;
    if (endDate) url += `endDate=${endDate.toISOString()}&`;

    const response = await fetch(url, { headers: getAuthHeaders() });
    return response.json();
  },
});

// Add filter UI
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

  {/* Date Range Picker */}
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
        <CalendarIcon className="mr-2 h-4 w-4" />
        {startDate ? formatDate(startDate, "MMM d, yyyy") : "Start date"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar
        mode="single"
        selected={startDate}
        onSelect={setStartDate}
      />
    </PopoverContent>
  </Popover>

  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
        <CalendarIcon className="mr-2 h-4 w-4" />
        {endDate ? formatDate(endDate, "MMM d, yyyy") : "End date"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar
        mode="single"
        selected={endDate}
        onSelect={setEndDate}
      />
    </PopoverContent>
  </Popover>

  {/* Quick Presets */}
  <Select value="" onValueChange={(value) => {
    const today = new Date();
    switch(value) {
      case "this-month":
        setStartDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setEndDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
        break;
      case "last-month":
        setStartDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
        setEndDate(new Date(today.getFullYear(), today.getMonth(), 0));
        break;
      case "this-quarter":
        const quarter = Math.floor(today.getMonth() / 3);
        setStartDate(new Date(today.getFullYear(), quarter * 3, 1));
        setEndDate(new Date(today.getFullYear(), (quarter + 1) * 3, 0));
        break;
      case "this-year":
        setStartDate(new Date(today.getFullYear(), 0, 1));
        setEndDate(new Date(today.getFullYear(), 11, 31));
        break;
    }
  }}>
    <SelectTrigger className="w-[150px]">
      <SelectValue placeholder="Quick filter" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="this-month">This Month</SelectItem>
      <SelectItem value="last-month">Last Month</SelectItem>
      <SelectItem value="this-quarter">This Quarter</SelectItem>
      <SelectItem value="this-year">This Year</SelectItem>
    </SelectContent>
  </Select>

  {/* Clear Filters */}
  {(startDate || endDate || statusFilter !== "all") && (
    <Button
      variant="ghost"
      onClick={() => {
        setStartDate(undefined);
        setEndDate(undefined);
        setStatusFilter("all");
      }}
    >
      Clear Filters
    </Button>
  )}

  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-[200px]">
      <SelectValue placeholder="Filter by status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Statuses</SelectItem>
      <SelectItem value="pending">Pending</SelectItem>
      <SelectItem value="approved">Approved</SelectItem>
      <SelectItem value="rejected">Rejected</SelectItem>
      <SelectItem value="paid">Paid</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### 3. Add Approval Workflow UI
**File:** `/client/src/pages/invoices.tsx`

**Add checkboxes for bulk selection:**
```tsx
// Add state
const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());

// Add checkbox column
<TableHead className="w-12">
  <Checkbox
    checked={selectedInvoices.size === filteredInvoices.length}
    onCheckedChange={(checked) => {
      if (checked) {
        setSelectedInvoices(new Set(filteredInvoices.map(i => i.id)));
      } else {
        setSelectedInvoices(new Set());
      }
    }}
  />
</TableHead>

// In table body
<TableCell>
  <Checkbox
    checked={selectedInvoices.has(invoice.id)}
    onCheckedChange={(checked) => {
      const newSet = new Set(selectedInvoices);
      if (checked) {
        newSet.add(invoice.id);
      } else {
        newSet.delete(invoice.id);
      }
      setSelectedInvoices(newSet);
    }}
  />
</TableCell>

// Add bulk approve button above table (when items selected)
{selectedInvoices.size > 0 && (
  <div className="mb-4 p-4 bg-muted rounded-lg flex items-center justify-between">
    <span>{selectedInvoices.size} invoices selected</span>
    <Button onClick={() => bulkApproveMutation.mutate()}>
      Approve Selected ({selectedInvoices.size})
    </Button>
  </div>
)}
```

**Add bulk approve mutation:**
```typescript
const bulkApproveMutation = useMutation({
  mutationFn: async () => {
    return apiRequest("POST", "/api/invoices/bulk-approve", {
      invoiceIds: Array.from(selectedInvoices),
    });
  },
  onSuccess: (response: any) => {
    queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    toast({
      title: "Success",
      description: `${response.approved} invoices approved`,
    });
    setSelectedInvoices(new Set());
  },
});
```

**Add approval buttons to invoice detail page** (create `/client/src/pages/invoice-detail.tsx`):
```tsx
{invoice.status === 'pending' && (
  <div className="flex gap-2">
    <Button onClick={() => approveMutation.mutate()}>
      <CheckCircle className="mr-2 h-4 w-4" />
      Approve
    </Button>
    <Button
      variant="destructive"
      onClick={() => setRejectDialogOpen(true)}
    >
      <XCircle className="mr-2 h-4 w-4" />
      Reject
    </Button>
  </div>
)}

{invoice.status === 'approved' && (
  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
    <p className="text-sm">
      Approved by {approver?.username} on {formatDate(new Date(invoice.approvedAt!), "MMM d, yyyy")}
    </p>
  </div>
)}

{invoice.status === 'rejected' && (
  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
    <p className="text-sm font-semibold">Rejected</p>
    <p className="text-sm">
      By {rejector?.username} on {formatDate(new Date(invoice.rejectedAt!), "MMM d, yyyy")}
    </p>
    <p className="text-sm mt-2">Reason: {invoice.rejectionReason}</p>
  </div>
)}
```

**Add rejection dialog:**
```tsx
<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Reject Invoice</DialogTitle>
      <DialogDescription>
        Please provide a reason for rejecting this invoice.
      </DialogDescription>
    </DialogHeader>
    <Textarea
      value={rejectionReason}
      onChange={(e) => setRejectionReason(e.target.value)}
      placeholder="Enter rejection reason..."
      rows={4}
    />
    <DialogFooter>
      <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={() => rejectMutation.mutate()}
        disabled={!rejectionReason}
      >
        Reject Invoice
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 4. Enhance Units Page with Ledger Access
**File:** `/client/src/pages/units.tsx`

**Add quick actions dropdown:**
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, FileText, DollarSign, Eye } from "lucide-react";

// In table row
<TableCell className="text-right">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => setLocation(`/units/${unit.id}/ledger`)}>
        <FileText className="mr-2 h-4 w-4" />
        View Ledger
      </DropdownMenuItem>
      <DropdownMenuItem>
        <DollarSign className="mr-2 h-4 w-4" />
        Record Payment
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setLocation(`/units/${unit.id}`)}>
        <Eye className="mr-2 h-4 w-4" />
        View Details
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>

// Add current balance column
<TableHead>Current Balance</TableHead>

// In table body
<TableCell className="font-mono">
  {formatCurrency(unit.totalOwed)}
</TableCell>

// Add status badge
<TableCell>
  <Badge variant={parseFloat(unit.totalOwed) > 0 ? "destructive" : "default"}>
    {parseFloat(unit.totalOwed) > 0 ? "Delinquent" : "Current"}
  </Badge>
</TableCell>
```

---

## 🗄️ MIGRATION

**Run this migration:**
```bash
psql $DATABASE_URL < migrations/0004_invoice_approval_workflow.sql
```

Or use Drizzle:
```bash
npm run db:push
```

---

## 📦 NPM PACKAGES TO INSTALL

```bash
npm install multer @types/multer
```

The calendar component from Radix UI should already be available via shadcn/ui.

---

## ✅ TESTING CHECKLIST

- [ ] Upload PDF file to invoice
- [ ] View uploaded PDF file
- [ ] Filter invoices by date range
- [ ] Use quick date presets (This Month, Last Month, etc.)
- [ ] Approve single invoice
- [ ] Reject invoice with reason
- [ ] Bulk approve multiple invoices
- [ ] View approval/rejection info on invoice detail
- [ ] Navigate to unit ledger from units page
- [ ] See current balance in units list
- [ ] Use quick actions dropdown on units page

---

This summary provides all the code needed to implement the enhancements. The backend is complete and ready. Frontend changes follow the existing patterns in your codebase.
