import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getUser } from "@/lib/auth";
import { AlertTriangle, Lock, Check } from "lucide-react";
import { useLocation } from "wouter";

export default function ChangePasswordRequired() {
  const user = getUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Password validation
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return errors;
  };

  const changePassword = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      return apiRequest("/api/auth/change-password-required", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Password Changed!",
        description: "Your password has been updated successfully. Redirecting...",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "An error occurred while changing your password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const errors = validatePassword(passwordData.newPassword);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Password Too Weak",
        description: "Please fix the password requirements below",
        variant: "destructive",
      });
      return;
    }

    setValidationErrors([]);
    changePassword.mutate(passwordData);
  };

  const passwordRequirements = [
    { text: "At least 8 characters long", met: passwordData.newPassword.length >= 8 },
    { text: "Contains lowercase letter (a-z)", met: /[a-z]/.test(passwordData.newPassword) },
    { text: "Contains uppercase letter (A-Z)", met: /[A-Z]/.test(passwordData.newPassword) },
    { text: "Contains number (0-9)", met: /[0-9]/.test(passwordData.newPassword) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Lock className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Password Change Required</CardTitle>
          </div>
          <CardDescription>
            For security reasons, you must change your temporary password before accessing your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Welcome, {user?.username}!</strong>
              <br />
              This is your first login. Please create a new secure password.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Temporary Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                required
                autoComplete="current-password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the temporary password provided to you
              </p>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                required
                autoComplete="new-password"
              />
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-sm mb-2">Password Requirements:</p>
              <ul className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    {req.met ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={req.met ? "text-green-700" : "text-gray-600"}>
                      {req.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? "Changing Password..." : "Change Password & Continue"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact the board at{" "}
              <a href="mailto:board@heritage-hoa.com" className="text-blue-600 hover:underline">
                board@heritage-hoa.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
