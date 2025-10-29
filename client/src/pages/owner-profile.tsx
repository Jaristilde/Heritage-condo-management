import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUser } from "@/lib/auth";
import { User, Building2, Mail, Phone, Lock, CheckCircle2, AlertTriangle, Edit } from "lucide-react";

interface ProfileData {
  ownerName: string;
  email: string;
  phone: string;
  username: string;
}

interface UnitData {
  id: string;
  unitNumber: string;
  totalOwed: string;
  monthlyMaintenance: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

export default function OwnerProfile() {
  const user = getUser();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    ownerName: "",
    email: "",
    phone: "",
    username: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch unit data
  const { data: units, isLoading } = useQuery<UnitData[]>({
    queryKey: ["/api/units"],
  });

  // 1. CHECK LOADING FIRST
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700 font-medium">Loading profile information...</p>
            <p className="mt-2 text-sm text-gray-500">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. CHECK USER EXISTS
  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-xl text-red-600 font-semibold">Not logged in</p>
            <p className="mt-2 text-gray-600">Please log in to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. CHECK UNITS ARRAY EXISTS
  if (!units) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-xl text-red-600 font-semibold">Error loading data</p>
            <p className="mt-2 text-gray-600">Unable to load unit information</p>
          </div>
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
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-xl text-red-600 font-semibold">Unit not found</p>
            <p className="mt-2 text-gray-600">We couldn't find your unit information</p>
          </div>
        </div>
      </div>
    );
  }

  // 6. NOW IT'S SAFE TO ACCESS unit properties

  // Initialize form data when unit data loads
  useEffect(() => {
    if (unit) {
      setFormData({
        ownerName: unit.ownerName || "",
        email: unit.ownerEmail || user?.email || "",
        phone: unit.ownerPhone || "",
        username: user?.username || "",
      });
    }
  }, [unit, user]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileData) => {
      return apiRequest(`/api/profile`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: "Profile Updated!",
        description: "Your profile information has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePassword = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      return apiRequest("/api/profile/password", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Password Changed!",
        description: "Your password has been updated successfully.",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "An error occurred while changing your password",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    changePassword.mutate(passwordData);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Unit Information */}
        <div className="space-y-6">
          {/* Unit Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle>Unit Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Unit Number</p>
                <p className="text-2xl font-bold text-blue-600">#{unit?.unitNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Maintenance</p>
                <p className="text-lg font-semibold">${parseFloat(unit?.monthlyMaintenance || "0").toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className={`text-lg font-semibold ${parseFloat(unit?.totalOwed || "0") > 0 ? "text-red-600" : "text-green-600"}`}>
                  ${parseFloat(unit?.totalOwed || "0").toFixed(2)}
                </p>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => window.location.href = "/payment"}>
                Make a Payment
              </Button>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-semibold">Account Active</p>
              </div>
              <p className="text-sm text-green-600 mt-2">
                Your account is in good standing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <CardTitle>Profile Details</CardTitle>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Profile
                  </Button>
                )}
              </div>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {/* Username (Read-only) */}
                <div>
                  <Label>Username</Label>
                  <Input
                    value={formData.username}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Username cannot be changed
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <Label htmlFor="ownerName">Full Name</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>

                {/* Action Buttons (only visible when editing) */}
                {isEditing && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data
                        if (unit) {
                          setFormData({
                            ownerName: unit.ownerName || "",
                            email: unit.ownerEmail || user?.email || "",
                            phone: unit.ownerPhone || "",
                            username: user?.username || "",
                          });
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                <CardTitle>Password & Security</CardTitle>
              </div>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showPasswordChange ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordChange(true)}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900 text-sm">
                      Password must be at least 8 characters with uppercase, lowercase, and number
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={changePassword.isPending}
                    >
                      {changePassword.isPending ? "Updating..." : "Update Password"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Contact the board if you need to update information that cannot be changed here.
              </p>
              <Button variant="outline" size="sm">
                Contact Board
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
