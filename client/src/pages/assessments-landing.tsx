import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Landmark, Building2, ArrowRight } from "lucide-react";

export default function AssessmentsLanding() {
  const [, setLocation] = useLocation();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Special Assessments</h1>
        <p className="text-muted-foreground mt-1">
          Select an assessment to view detailed payment tracking and status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* SA#1 Popular Loan Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary" onClick={() => setLocation("/assessments/sa1")}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Landmark className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">SA#1 Popular Loan</CardTitle>
                <CardDescription className="text-sm">$17,500 per unit</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Payment:</span>
                <span className="font-bold">$208/month</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Assessment:</span>
                <span className="font-bold">$17,500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status Tracking:</span>
                <span className="font-bold">July 2025</span>
              </div>
            </div>

            <Button className="w-full" onClick={() => setLocation("/assessments/sa1")}>
              View SA#1 Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* SA#2 2024 Assessment Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary" onClick={() => setLocation("/assessments/sa2")}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">SA#2 2024 Assessment</CardTitle>
                <CardDescription className="text-sm">$11,920.92 per unit</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Assessed:</span>
                <span className="font-bold">$286,102.08</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Per Unit Amount:</span>
                <span className="font-bold">$11,920.92</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Options:</span>
                <span className="font-bold">Lump Sum / 3-Year Plan</span>
              </div>
            </div>

            <Button className="w-full" onClick={() => setLocation("/assessments/sa2")}>
              View SA#2 Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="max-w-4xl bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Both assessments track payment status, collection rates, and unit-by-unit breakdown.
            SA#1 is a long-term loan with monthly payments, while SA#2 offers flexible payment options including a 3-year payment plan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
