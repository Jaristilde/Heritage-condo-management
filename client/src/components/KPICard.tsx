import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  sublabel?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  color?: "emerald" | "blue" | "amber" | "teal" | "red";
}

const colorConfig = {
  emerald: {
    iconBg: "bg-emerald-500",
    iconText: "text-white",
    trendUp: "text-emerald-600",
    trendDown: "text-red-600",
  },
  blue: {
    iconBg: "bg-blue-500",
    iconText: "text-white",
    trendUp: "text-emerald-600",
    trendDown: "text-red-600",
  },
  amber: {
    iconBg: "bg-amber-500",
    iconText: "text-white",
    trendUp: "text-emerald-600",
    trendDown: "text-red-600",
  },
  teal: {
    iconBg: "bg-teal-500",
    iconText: "text-white",
    trendUp: "text-emerald-600",
    trendDown: "text-red-600",
  },
  red: {
    iconBg: "bg-red-500",
    iconText: "text-white",
    trendUp: "text-emerald-600",
    trendDown: "text-red-600",
  },
};

export function KPICard({
  icon: Icon,
  value,
  label,
  sublabel,
  trend,
  trendDirection = "neutral",
  color = "blue",
}: KPICardProps) {
  const config = colorConfig[color];

  return (
    <Card className="hover-elevate active-elevate-2 transition-all" data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className={cn("inline-flex p-3 rounded-lg mb-4", config.iconBg)}>
              <Icon className={cn("h-6 w-6", config.iconText)} />
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-bold font-mono tracking-tight" data-testid={`value-${label.toLowerCase().replace(/\s+/g, "-")}`}>
                {value}
              </p>
              <p className="text-sm text-muted-foreground font-medium">{label}</p>
              {sublabel && (
                <p className="text-xs text-muted-foreground">{sublabel}</p>
              )}
            </div>
          </div>
          {trend && (
            <div
              className={cn(
                "text-sm font-semibold",
                trendDirection === "up" && config.trendUp,
                trendDirection === "down" && config.trendDown,
                trendDirection === "neutral" && "text-muted-foreground"
              )}
            >
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
