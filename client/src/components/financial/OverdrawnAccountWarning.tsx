import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CreditCard } from "lucide-react";

interface OverdrawnAccountProps {
  accountName: string;
  accountNumber: string;
  balance: number;
  outstandingLoan?: number;
}

export function OverdrawnAccountWarning({
  accountName,
  accountNumber,
  balance,
  outstandingLoan,
}: OverdrawnAccountProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (balance >= 0) {
    return null; // Don't show warning if account is not overdrawn
  }

  return (
    <Alert variant="destructive" className="border-red-600 bg-red-50">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold flex items-center gap-2">
        <CreditCard className="h-5 w-5" />
        Operating Account Overdrawn
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <div className="text-base">
          <strong>{accountName}</strong> ({accountNumber}) is currently{" "}
          <span className="font-bold text-red-700">{formatCurrency(balance)}</span>
        </div>
        {outstandingLoan && (
          <div className="text-sm text-muted-foreground">
            Outstanding loan balance: {formatCurrency(outstandingLoan)}
          </div>
        )}
        <div className="text-sm mt-2 p-3 bg-white rounded border border-red-200">
          <strong>⚠️ Action Required:</strong> This account needs immediate attention.
          Contact the bank to discuss payment arrangements and avoid additional fees.
        </div>
      </AlertDescription>
    </Alert>
  );
}
