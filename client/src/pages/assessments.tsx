import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface Assessment {
  id: string;
  assessmentName: string;
  assessmentType: string;
  totalAmount: string;
  amountPerUnit: string;
  startDate: string;
  dueDate: string | null;
  description: string | null;
  status: string;
}

export default function Assessments() {
  const { data: assessments, isLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Special Assessments
        </h1>
        <p className="text-muted-foreground">
          Building-wide special assessments and capital improvements
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {assessments?.map((assessment) => (
          <Card key={assessment.id} data-testid={`card-assessment-${assessment.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{assessment.assessmentName}</CardTitle>
                  <CardDescription className="mt-2">
                    {assessment.description || "No description available"}
                  </CardDescription>
                </div>
                <Badge variant={assessment.status === "active" ? "default" : "secondary"}>
                  {assessment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-2xl font-bold font-mono">
                    {formatCurrency(assessment.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Per Unit</p>
                  <p className="text-2xl font-bold font-mono">
                    {formatCurrency(assessment.amountPerUnit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                  <p className="text-lg font-medium">
                    {formatDate(assessment.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                  <p className="text-lg font-medium">
                    {assessment.dueDate ? formatDate(assessment.dueDate) : "Ongoing"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!assessments || assessments.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Assessments</h3>
            <p className="text-muted-foreground">
              There are currently no special assessments configured.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
