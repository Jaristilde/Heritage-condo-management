import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Documents() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Documents
        </h1>
        <p className="text-muted-foreground">
          Building documents, reports, and records
        </p>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Document Management</h3>
          <p className="text-muted-foreground">
            Document management feature coming soon. This will include budgets, reports, invoices, legal documents, and meeting minutes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
