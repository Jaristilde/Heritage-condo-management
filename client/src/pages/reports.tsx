import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function Reports() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Financial Reports
        </h1>
        <p className="text-muted-foreground">
          Monthly reports, revenue trends, and financial analytics
        </p>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Financial Analytics</h3>
          <p className="text-muted-foreground">
            Advanced financial reporting with charts and trend analysis coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
