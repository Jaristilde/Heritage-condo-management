import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUser } from "@/lib/auth";
import { AlertTriangle, CreditCard, Building2, Info, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Unit {
  id: string;
  unitNumber: string;
  totalOwed: string;
  monthlyMaintenance: string;
  delinquencyStatus: string;
  firstAssessmentBalance?: string;
  secondAssessmentBalance?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

interface Payment {
  id: string;
  amount: string;
  paymentMethod: string;
  paidAt: string;
  paymentType: string;
}

// Heritage Condo specific constants
const MONTHLY_MAINTENANCE = 578.45;
const LOAN_POPULAR = 208.00;
const SPECIAL_ASSESSMENT_MONTHLY = 331.13; // 3-year payment plan ($11,920.83 / 36 months)
const PROCESSING_FEE = 4.99;

const ATTORNEY_INFO = {
  name: "Daniel C. Lopez, Esq.",
  address: "18205 Biscayne Blvd, Suite 2218",
  city: "Aventura, FL 33160",
  phone: "(305) 830-1811"
};

export default function Payment() {
  const user = getUser();
  const { toast } = useToast();

  // State
  const [selectedAccount, setSelectedAccount] = useState("monthly");
  const [paymentType, setPaymentType] = useState<"one-time" | "recurring">("one-time");
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "bank">("bank");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch unit data
  const { data: units, isLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  // 1. CHECK LOADING FIRST
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading payment information...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // 2. CHECK USER EXISTS
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 font-semibold">Not logged in</p>
          <p className="mt-2 text-gray-600">Please log in to make a payment</p>
        </div>
      </div>
    );
  }

  // 3. CHECK UNITS ARRAY EXISTS
  if (!units) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 font-semibold">Error loading data</p>
          <p className="mt-2 text-gray-600">Unable to load unit information</p>
        </div>
      </div>
    );
  }

  // 4. FIND UNIT SAFELY
  const unit = (units && user?.unitId)
    ? units.find(u => u?.id === user.unitId)
    : null;

  // 5. CHECK UNIT EXISTS
  if (!unit) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 font-semibold">Unit not found</p>
          <p className="mt-2 text-gray-600">We couldn't find your unit information</p>
        </div>
      </div>
    );
  }

  // 6. NOW IT'S SAFE TO ACCESS unit.id, unit.balance, etc.

  // Fetch recent payments
  const { data: recentPayments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    select: (data) => data.slice(0, 3), // Show only 3 most recent
  });

  // Calculate days past due
  const calculateDaysPastDue = () => {
    // This should be calculated from database
    // For now, check delinquency status
    if (unit?.delinquencyStatus === "30_days") return 30;
    if (unit?.delinquencyStatus === "60_days") return 60;
    if (unit?.delinquencyStatus === "90_days") return 90;
    return 0;
  };

  const daysPastDue = calculateDaysPastDue();
  const showDelinquencyAlert = daysPastDue >= 30;

  // Calculate totals
  const totalDue = parseFloat(unit?.totalOwed || "0");
  const selectedAmount = selectedAccount === "monthly" ? MONTHLY_MAINTENANCE :
                        selectedAccount === "loan" ? LOAN_POPULAR :
                        SPECIAL_ASSESSMENT_MONTHLY;

  const specialAssessmentBalance = parseFloat(unit?.secondAssessmentBalance || "0");

  const totalWithFee = (parseFloat(paymentAmount) || selectedAmount) + PROCESSING_FEE;

  // Submit payment
  const processPayment = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          unitId: unit?.id,
          amount: totalWithFee.toFixed(2),
          paymentType: selectedAccount,
          paymentMethod: paymentMethod === "credit" ? "credit_card" : "bank_account",
          status: "completed",
          paidAt: new Date(paymentDate).toISOString(),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });

      toast({
        title: "Payment Successful!",
        description: `Payment of $${totalWithFee.toFixed(2)} has been processed.`,
      });

      setShowConfirmModal(false);
      setPaymentAmount("");
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "An error occurred while processing your payment",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Make A Payment</h1>
          <p className="text-gray-600 mt-2">
            Make a payment now. Select your payment method and details below.
          </p>
        </div>

        {/* 30-Day Delinquency Alert */}
        {showDelinquencyAlert && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-900">
              <div className="font-bold text-lg mb-2">🚨 URGENT: PAYMENT REQUIRED</div>
              <p className="mb-3">
                Your account is {daysPastDue}+ days past due. If payment is not received within 5 business days,
                your account will be referred to our collections attorney:
              </p>
              <div className="bg-white p-4 rounded border border-red-200 mb-3">
                <p className="font-semibold">{ATTORNEY_INFO.name}</p>
                <p>{ATTORNEY_INFO.address}</p>
                <p>{ATTORNEY_INFO.city}</p>
                <p className="font-semibold mt-1">Phone: {ATTORNEY_INFO.phone}</p>
              </div>
              <p className="text-sm">
                Additional legal fees and collection costs will be added to your balance.
              </p>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setPaymentAmount(totalDue.toFixed(2));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Pay Full Balance Now
                </Button>
                <Button variant="outline" size="sm">
                  Contact Board
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Payment Form - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select which payment to make:</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">
                        ○ Monthly Maintenance - ${MONTHLY_MAINTENANCE.toFixed(2)}
                      </SelectItem>
                      {parseFloat(unit?.firstAssessmentBalance || "0") > 0 && (
                        <SelectItem value="loan">
                          ○ Loan Popular Assessment - ${LOAN_POPULAR.toFixed(2)}
                        </SelectItem>
                      )}
                      {parseFloat(unit?.secondAssessmentBalance || "0") > 0 && (
                        <SelectItem value="special">
                          ○ 2024 Special Assessment - ${SPECIAL_ASSESSMENT_MONTHLY.toFixed(2)}/month (Balance: ${parseFloat(unit?.secondAssessmentBalance || "0").toFixed(2)})
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAccount === "special" && specialAssessmentBalance > 0 && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900 text-sm">
                      <strong>Payment Plan:</strong> Monthly payment is ${SPECIAL_ASSESSMENT_MONTHLY.toFixed(2)}.
                      Remaining balance: ${specialAssessmentBalance.toFixed(2)}.
                      You can pay more than the monthly amount to pay off faster.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="bg-slate-50 p-3 rounded border">
                  <p className="text-xs text-gray-600 font-medium mb-1">Payment For:</p>
                  <p className="text-sm font-semibold">
                    HRT-{unit?.unitNumber} - Unit {unit?.unitNumber}
                  </p>
                  <p className="text-sm text-gray-700">
                    Heritage Condominium Association, Inc
                  </p>
                </div>

                <div className="pt-2 space-y-1 text-sm text-gray-700">
                  <p className="font-semibold">{unit?.ownerName || user?.username}</p>
                  <p>{unit?.ownerEmail || user?.email}</p>
                  <p>{unit?.ownerPhone || "(305) XXX-XXXX"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Type Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant={paymentType === "one-time" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setPaymentType("one-time")}
                  >
                    One-Time Payment
                  </Button>
                  <Button
                    variant={paymentType === "recurring" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setPaymentType("recurring")}
                  >
                    Recurring Payment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    variant={paymentMethod === "credit" ? "default" : "outline"}
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => setPaymentMethod("credit")}
                  >
                    <CreditCard className="h-4 w-4" />
                    Credit Card
                  </Button>
                  <Button
                    variant={paymentMethod === "bank" ? "default" : "outline"}
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => setPaymentMethod("bank")}
                  >
                    <Building2 className="h-4 w-4" />
                    Bank Account
                  </Button>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900 text-sm">
                    A ${PROCESSING_FEE.toFixed(2)} processing fee will be added to the final payment amount.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Balance Due */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Balance Due:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${totalDue.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      Upcoming Charges:
                      <Info className="h-4 w-4" />
                    </span>
                    <span className="text-lg font-semibold">
                      ${MONTHLY_MAINTENANCE.toFixed(2)}
                    </span>
                  </div>

                  {paymentType === "recurring" && (
                    <Alert className="bg-orange-50 border-orange-200">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-900 text-sm">
                        Auto-Draft payment scheduled for {format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "MMM dd, yyyy")}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Amount */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Payment Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={selectedAmount.toFixed(2)}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="mt-2 text-lg h-12"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Quick Select:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentAmount(MONTHLY_MAINTENANCE.toFixed(2))}
                    >
                      Monthly (${MONTHLY_MAINTENANCE.toFixed(2)})
                    </Button>
                    {parseFloat(unit?.firstAssessmentBalance || "0") > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentAmount(LOAN_POPULAR.toFixed(2))}
                      >
                        Loan Popular (${LOAN_POPULAR.toFixed(2)})
                      </Button>
                    )}
                    {parseFloat(unit?.secondAssessmentBalance || "0") > 0 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaymentAmount(SPECIAL_ASSESSMENT_MONTHLY.toFixed(2))}
                        >
                          Special Monthly (${SPECIAL_ASSESSMENT_MONTHLY.toFixed(2)})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPaymentAmount(specialAssessmentBalance.toFixed(2))}
                        >
                          Pay Off Special (${specialAssessmentBalance.toFixed(2)})
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentAmount(totalDue.toFixed(2))}
                    >
                      Full Balance (${totalDue.toFixed(2)})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Date */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="flex-1 h-12"
                  />
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4">
              <Button variant="outline" size="lg" className="px-8">
                ← Cancel
              </Button>
              <Button
                size="lg"
                className="px-8 bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowConfirmModal(true)}
                disabled={!paymentAmount && !selectedAmount}
              >
                Continue to Review →
              </Button>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPayments && recentPayments.length > 0 ? (
                  <>
                    {recentPayments.map((payment) => (
                      <div key={payment.id} className="border-b pb-3 last:border-0">
                        <p className="text-sm font-medium">Heritage Condominium Association, Inc</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-bold">${parseFloat(payment.amount).toFixed(2)}</span>
                          <span className="text-sm text-gray-600 capitalize">
                            {payment.paymentMethod.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(payment.paidAt), "MMMM d, yyyy")}
                        </p>
                      </div>
                    ))}
                    <Button variant="link" className="p-0 h-auto text-blue-600">
                      View all payments
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No recent payments</p>
                )}
              </CardContent>
            </Card>

            {/* Manage Payments Info Box */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Manage Your Payments</h3>
                <p className="text-sm text-blue-800 mb-4">
                  Manage your saved payment methods, recurring payments, and future one-time payments.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Manage Payments →
                </Button>
              </CardContent>
            </Card>

            {/* Support Note */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Seeing duplicate payments? Visit the Support Page for details.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium text-gray-700">
                HRT-{unit?.unitNumber} | Heritage Condominium Association, Inc
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Payment Date:</p>
              <p className="font-medium">{format(new Date(paymentDate), "MM/dd/yyyy")}</p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-1">Payment Amount</p>
              <p className="text-3xl font-bold text-blue-600">
                ${totalWithFee.toFixed(2)}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-semibold">${(parseFloat(paymentAmount) || selectedAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span className="font-semibold">${PROCESSING_FEE.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">
                {paymentMethod === "credit" ? "Credit Card" : "Bank Account"}
              </p>
              <p className="text-sm text-gray-600">XXXX-XXXX-XXXX-0000</p>
            </div>

            <p className="text-xs text-gray-600 pt-2">
              By clicking Confirm & Pay you consent to the payment conditions for your payment
              selection as described on the Payment Disclosure page.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={processPayment.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => processPayment.mutate()}
              disabled={processPayment.isPending}
            >
              {processPayment.isPending ? "Processing..." : "Confirm & Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
