import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Skull, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DelinquentUnit {
  unitNumber: string;
  ownerName: string;
  totalOwed: number;
  status: string;
  notes?: string;
}

interface CriticalCollectionsProps {
  topDelinquentUnits: DelinquentUnit[];
  attorneyCount: number;
  totalCritical: number;
}

export function CriticalCollectionsAlert({
  topDelinquentUnits,
  attorneyCount,
  totalCritical,
}: CriticalCollectionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    if (status === "attorney") {
      return <Badge variant="destructive">ATTORNEY</Badge>;
    }
    if (status === "90plus") {
      return <Badge variant="destructive">90+ DAYS</Badge>;
    }
    if (status === "30-60days") {
      return <Badge variant="secondary">30-60 DAYS</Badge>;
    }
    return <Badge variant="outline">{status.toUpperCase()}</Badge>;
  };

  const getUnitIcon = (notes?: string) => {
    if (notes?.includes("DECEASED")) {
      return <Skull className="h-5 w-5 text-red-600" />;
    }
    if (notes?.includes("LIVES ONSITE") || notes?.includes("Lives onsite")) {
      return <Home className="h-5 w-5 text-orange-600" />;
    }
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Main Alert */}
      {attorneyCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-lg font-bold">
            Critical: {attorneyCount} Units Need Attorney Action
          </AlertTitle>
          <AlertDescription className="text-base">
            Total critical collections: {formatCurrency(totalCritical)}.
            Immediate attention required for units in attorney status.
          </AlertDescription>
        </Alert>
      )}

      {/* Top Delinquent Units */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Top Delinquent Units
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topDelinquentUnits.map((unit, index) => (
              <div
                key={unit.unitNumber}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-sm">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getUnitIcon(unit.notes)}
                      <span className="font-semibold">Unit {unit.unitNumber}</span>
                      {getStatusBadge(unit.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {unit.ownerName}
                    </p>
                    {unit.notes && (
                      <div className="flex gap-2 flex-wrap mt-1">
                        {unit.notes.includes("DECEASED") && (
                          <Badge variant="outline" className="text-xs border-red-600 text-red-600">
                            <Skull className="h-3 w-3 mr-1" />
                            DECEASED
                          </Badge>
                        )}
                        {(unit.notes.includes("LIVES ONSITE") || unit.notes.includes("Lives onsite")) && (
                          <Badge variant="outline" className="text-xs border-orange-600 text-orange-600">
                            <Home className="h-3 w-3 mr-1" />
                            LIVES ONSITE
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(unit.totalOwed)}
                  </div>
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
