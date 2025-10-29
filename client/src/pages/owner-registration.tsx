import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building2, UserPlus, CheckCircle2, AlertTriangle } from "lucide-react";

interface RegistrationData {
  unitNumber: string;
  ownerName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function OwnerRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState<RegistrationData>({
    unitNumber: "",
    ownerName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegistrationData, string>> = {};

    // Unit number validation (101-302 for Heritage Condo)
    const unitNum = parseInt(formData.unitNumber);
    if (!formData.unitNumber) {
      newErrors.unitNumber = "Unit number is required";
    } else if (isNaN(unitNum) || unitNum < 101 || unitNum > 302) {
      newErrors.unitNumber = "Unit number must be between 101 and 302";
    }

    // Owner name validation
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "Full name is required";
    } else if (formData.ownerName.trim().length < 3) {
      newErrors.ownerName = "Name must be at least 3 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (e.g., 305-555-1234)";
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 4) {
      newErrors.username = "Username must be at least 4 characters";
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, dots, hyphens, and underscores";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Registration mutation
  const registerOwner = useMutation({
    mutationFn: async (data: RegistrationData) => {
      return apiRequest("/api/auth/register/owner", {
        method: "POST",
        body: JSON.stringify({
          unitNumber: data.unitNumber,
          ownerName: data.ownerName,
          email: data.email,
          phone: data.phone,
          username: data.username,
          password: data.password,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Your account has been created. Please login with your credentials.",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      registerOwner.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Heritage Condominium</h1>
          </div>
          <p className="text-gray-600">Owner Registration Portal</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
            </div>
            <CardDescription>
              Register to access your unit information, make payments, and manage your account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Unit Number */}
              <div>
                <Label htmlFor="unitNumber">
                  Unit Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unitNumber"
                  type="text"
                  placeholder="e.g., 202"
                  value={formData.unitNumber}
                  onChange={(e) => handleInputChange("unitNumber", e.target.value)}
                  className={errors.unitNumber ? "border-red-500" : ""}
                />
                {errors.unitNumber && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.unitNumber}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Enter your unit number (101-302)
                </p>
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="ownerName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ownerName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange("ownerName", e.target.value)}
                  className={errors.ownerName ? "border-red-500" : ""}
                />
                {errors.ownerName && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.ownerName}
                  </p>
                )}
              </div>

              {/* Email and Phone - Two columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="305-555-1234"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div>
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.username}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  At least 4 characters, letters, numbers, dots, hyphens, underscores
                </p>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Info Alert */}
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900 text-sm">
                  After registration, you'll be able to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>View your account balance and payment history</li>
                    <li>Make online payments securely</li>
                    <li>Access important documents and notices</li>
                    <li>Update your contact information</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                  disabled={registerOwner.isPending}
                >
                  {registerOwner.isPending ? (
                    "Creating Account..."
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-blue-600 font-semibold"
                    onClick={() => setLocation("/login")}
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Need help? Contact the board at board@heritagecondo.com</p>
        </div>
      </div>
    </div>
  );
}
