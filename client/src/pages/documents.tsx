import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Upload,
  Download,
  Search,
  X,
  Loader2,
  FolderOpen,
  File,
} from "lucide-react";
import { format } from "date-fns";
import { getUser } from "@/lib/auth";

// Industry-standard HOA/Condo document categories
const DOCUMENT_CATEGORIES = [
  { value: "governing", label: "Governing Documents", color: "bg-purple-100 text-purple-800" },
  { value: "financial", label: "Financial Reports", color: "bg-green-100 text-green-800" },
  { value: "board_meetings", label: "Board Meetings", color: "bg-blue-100 text-blue-800" },
  { value: "legal", label: "Legal Documents", color: "bg-red-100 text-red-800" },
  { value: "maintenance", label: "Maintenance & Repairs", color: "bg-orange-100 text-orange-800" },
  { value: "construction", label: "Construction & Plans", color: "bg-yellow-100 text-yellow-800" },
  { value: "insurance", label: "Insurance", color: "bg-indigo-100 text-indigo-800" },
  { value: "communications", label: "Communications", color: "bg-pink-100 text-pink-800" },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-800" },
];

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  relatedTo: string | null;
  relatedId: string | null;
}

export default function Documents() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const currentUser = getUser();
  const canUpload =
    currentUser?.role === "board_secretary" ||
    currentUser?.role === "board_treasurer" ||
    currentUser?.role === "board_member" ||
    currentUser?.role === "management";

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile || !selectedCategory) {
        throw new Error("Please select a file and category");
      }

      setIsUploading(true);

      // Upload file
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("fileType", selectedCategory);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("heritage_auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      setIsUploadDialogOpen(false);
      setUploadFile(null);
      setSelectedCategory("");
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 50MB for documents)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 50MB",
          variant: "destructive",
        });
        return;
      }
      setUploadFile(file);
    }
  };

  const filteredDocuments =
    documents?.filter((doc) => {
      const matchesSearch = doc.fileName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || doc.fileType === categoryFilter;
      return matchesSearch && matchesCategory;
    }) || [];

  const getCategoryInfo = (type: string) => {
    return (
      DOCUMENT_CATEGORIES.find((cat) => cat.value === type) ||
      DOCUMENT_CATEGORIES.find((cat) => cat.value === "other")!
    );
  };

  const getCategoryCount = (categoryValue: string) => {
    if (!documents) return 0;
    return documents.filter((doc) => doc.fileType === categoryValue).length;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Library</h1>
          <p className="text-muted-foreground mt-1">
            Centralized storage for all condo association documents
          </p>
        </div>
        {canUpload && (
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    {!uploadFile ? (
                      <>
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Choose a document
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          PDF, Word, Excel, Images (max 50MB)
                        </p>
                        <label htmlFor="document-upload">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("document-upload")?.click()
                            }
                          >
                            Select File
                          </Button>
                        </label>
                        <input
                          id="document-upload"
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        />
                      </>
                    ) : (
                      <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <File className="h-8 w-8 text-primary" />
                          <div className="text-left">
                            <p className="font-medium">{uploadFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Document Category *
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsUploadDialogOpen(false);
                      setUploadFile(null);
                      setSelectedCategory("");
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => uploadMutation.mutate()}
                    disabled={!uploadFile || !selectedCategory || isUploading}
                  >
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {DOCUMENT_CATEGORIES.map((category) => {
          const count = getCategoryCount(category.value);
          return (
            <Card
              key={category.value}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setCategoryFilter(category.value)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <FolderOpen className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">{count}</Badge>
                </div>
                <h3 className="font-semibold mt-4">{category.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {count} {count === 1 ? "document" : "documents"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : canUpload
                  ? "Get started by uploading your first document"
                  : "No documents have been uploaded yet"}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Uploaded Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    const categoryInfo = getCategoryInfo(doc.fileType);
                    return (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {doc.fileName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={categoryInfo.color}>
                            {categoryInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.fileUrl, "_blank")}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredDocuments.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredDocuments.length} of {documents?.length || 0} documents
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
