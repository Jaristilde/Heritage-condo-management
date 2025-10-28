import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, RefreshCw, Mail, Gavel, Clock } from "lucide-react";
import { useState } from "react";

/**
 * Delinquency Alerts Dashboard Widget
 *
 * Eliminates need for manual tracking by accountants
 * Shows real-time delinquency status and automated actions
 */

interface DelinquencyUnit {
  unitNumber: string;
  ownerName: string;
  email: string;
  totalOwed: number;
  daysDelinquent: number;
  currentStatus: string;
  recommendedAction: string;
  noticeType: "30_day" | "60_day" | "90_day" | "attorney" | null;
  isNewDelinquency: boolean;
}

interface DelinquencyResponse {
  success: boolean;
  count: number;
  units: DelinquencyUnit[];
}

export function DelinquencyAlertsWidget() {
  const [isManualCheckRunning, setIsManualCheckRunning] = useState(false);

  const { data, isLoading, refetch } = useQuery<DelinquencyResponse>({
    queryKey: ["/api/delinquency/check"],
    refetchInterval: 60000, // Refresh every minute
  });

  const handleManualCheck = async () => {
    setIsManualCheckRunning(true);
    try {
      await fetch("/api/delinquency/trigger", {
        method: "POST",
        credentials: "include",
      });
      await refetch();
    } catch (error) {
      console.error("Error triggering manual check:", error);
    } finally {
      setIsManualCheckRunning(false);
    }
  };

  const getNoticeIcon = (noticeType: string | null) => {
    if (noticeType === "attorney") return <Gavel className="h-4 w-4" />;
    if (noticeType === "90_day") return <AlertTriangle className="h-4 w-4" />;
    if (noticeType === "60_day") return <Mail className="h-4 w-4" />;
    if (noticeType === "30_day") return <Clock className="h-4 w-4" />;
    return null;
  };

  const getNoticeLabel = (noticeType: string | null) => {
    if (noticeType === "attorney") return "Attorney Referral";
    if (noticeType === "90_day") return "Final Notice (90-Day)";
    if (noticeType === "60_day") return "Second Notice (60-Day)";
    if (noticeType === "30_day") return "First Notice (30-Day)";
    return "No Notice";
  };

  const getNoticeBadgeVariant = (noticeType: string | null) => {
    if (noticeType === "attorney") return "destructive";
    if (noticeType === "90_day") return "destructive";
    if (noticeType === "60_day") return "secondary";
    return "outline";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Delinquency Alerts
          </CardTitle>
          <CardDescription>Loading delinquency data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unitsNeedingAction = data?.units || [];
  const attorneyReferrals = unitsNeedingAction.filter(u => u.noticeType === "attorney");
  const finalNotices = unitsNeedingAction.filter(u => u.noticeType === "90_day");
  const newDelinquencies = unitsNeedingAction.filter(u => u.isNewDelinquency);

  return (
    <div className="space-y-4">
      {/* Summary Alert */}
      {unitsNeedingAction.length > 0 && (
        <Alert variant={attorneyReferrals.length > 0 ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold">
            {unitsNeedingAction.length} Units Need Action
          </AlertTitle>
          <AlertDescription>
            Automated delinquency system is monitoring all 24 units.
            {attorneyReferrals.length > 0 && (
              <> <strong>{attorneyReferrals.length} units</strong> require attorney referral.</>
            )}
            {finalNotices.length > 0 && (
              <> <strong>{finalNotices.length} units</strong> at final notice stage.</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Automated Delinquency Management
              </CardTitle>
              <CardDescription>
                Daily automated checks • Eliminates manual accountant work
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualCheck}
              disabled={isManualCheckRunning}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isManualCheckRunning ? "animate-spin" : ""}`} />
              Run Check Now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold">{unitsNeedingAction.length}</div>
              <div className="text-sm text-muted-foreground">Units Need Action</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{attorneyReferrals.length}</div>
              <div className="text-sm text-muted-foreground">Attorney Referrals</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{finalNotices.length}</div>
              <div className="text-sm text-muted-foreground">Final Notices</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{newDelinquencies.length}</div>
              <div className="text-sm text-muted-foreground">New Today</div>
            </div>
          </div>

          {/* Units Needing Action */}
          {unitsNeedingAction.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ✅ All units current - No action needed
              <div className="text-xs mt-2">Next automated check: Tomorrow at 6:00 AM</div>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm mb-2">Units Requiring Action:</h4>
              {unitsNeedingAction.map((unit) => (
                <div
                  key={unit.unitNumber}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Unit {unit.unitNumber}</span>
                        <span className="text-sm text-muted-foreground">({unit.ownerName})</span>
                        {unit.isNewDelinquency && (
                          <Badge variant="secondary" className="text-xs">NEW</Badge>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">${unit.totalOwed.toFixed(2)}</span>
                        <span className="text-muted-foreground"> • {unit.daysDelinquent} days past due</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        📋 {unit.recommendedAction}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={getNoticeBadgeVariant(unit.noticeType)} className="flex items-center gap-1">
                        {getNoticeIcon(unit.noticeType)}
                        {getNoticeLabel(unit.noticeType)}
                      </Badge>
                      {unit.noticeType === "attorney" && (
                        <span className="text-xs text-red-600 font-medium">⚖️ Attorney Action Required</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Automation Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-sm space-y-2">
              <div className="font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Automated Actions Taken Daily:
              </div>
              <ul className="text-xs space-y-1 ml-6 list-disc">
                <li>Check all 24 units for delinquent balances</li>
                <li>Auto-send 30/60/90 day notices to owners</li>
                <li>Flag units for attorney referral at 90+ days</li>
                <li>Email board summary of actions taken</li>
                <li>Update delinquency status automatically</li>
              </ul>
              <div className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                <strong>Next automated check:</strong> Tomorrow at 6:00 AM
                <br />
                <strong>System status:</strong> <span className="text-green-600">● Active</span> - No manual accountant work needed
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
