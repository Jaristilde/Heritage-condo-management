import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUser } from "@/lib/auth";
import { DollarSign } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface Unit {
  id: string;
  unitNumber: string;
  totalOwed: string;
}

function PaymentForm({ unit, amount, onSuccess }: { unit: Unit; amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        await apiRequest("/payments", {
          method: "POST",
          body: JSON.stringify({
            unitId: unit.id,
            amount: amount.toFixed(2),
            paymentType: "maintenance",
            paymentMethod: "stripe",
            status: "completed",
            paidAt: new Date().toISOString(),
          }),
        });

        queryClient.invalidateQueries({ queryKey: ["/api/units"] });
        
        toast({
          title: "Payment successful!",
          description: `Payment of $${amount.toFixed(2)} has been processed.`,
        });
        
        onSuccess();
      }
    } catch (err) {
      toast({
        title: "Payment failed",
        description: "An error occurred while processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        data-testid="button-submit-payment"
      >
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}

export default function Payment() {
  const user = getUser();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const { data: units } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const unit = units?.[0];

  const createPaymentIntent = useMutation({
    mutationFn: async (amount: number) => {
      return apiRequest<{ clientSecret: string }>("/stripe/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({
          amount,
          unitId: unit?.id,
        }),
      });
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize payment",
        variant: "destructive",
      });
    },
  });

  const handleInitiatePayment = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    createPaymentIntent.mutate(amountNum);
  };

  const handleSuccess = () => {
    setAmount("");
    setClientSecret("");
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Make a Payment
        </h1>
        <p className="text-muted-foreground">
          Pay your maintenance fees and assessments
        </p>
      </div>

      {unit && (
        <Card>
          <CardHeader>
            <CardTitle>Unit {unit.unitNumber} - Current Balance</CardTitle>
            <CardDescription>Your current outstanding balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-3xl font-bold font-mono" data-testid="text-current-balance">
                  {formatCurrency(unit.totalOwed)}
                </p>
                <p className="text-sm text-muted-foreground">Total owed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Enter the amount you want to pay</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!clientSecret ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-payment-amount"
                />
              </div>
              <Button
                onClick={handleInitiatePayment}
                disabled={createPaymentIntent.isPending}
                className="w-full"
                data-testid="button-initiate-payment"
              >
                {createPaymentIntent.isPending ? "Processing..." : "Continue to Payment"}
              </Button>
            </>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                },
              }}
            >
              <PaymentForm
                unit={unit!}
                amount={parseFloat(amount)}
                onSuccess={handleSuccess}
              />
            </Elements>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
