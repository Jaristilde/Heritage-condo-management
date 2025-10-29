import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/auth";
import { Building2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      const user = await login(data.username, data.password);

      // TODO: PRODUCTION - Re-enable forced password change before going live!
      // DEMO MODE: Password change requirement is currently DISABLED for easier testing
      // BEFORE PRODUCTION:
      // 1. Uncomment the code below
      // 2. Run the password update script with mustChangePassword: true
      // 3. Use strong environment-based passwords
      // 4. Test with real users

      // Check if user needs to change password (DISABLED FOR DEMO)
      // if (user.mustChangePassword) {
      //   toast({
      //     title: "Password Change Required",
      //     description: "You must change your temporary password before continuing.",
      //   });
      //   setLocation("/change-password-required");
      //   return;
      // }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation("/");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Heritage HOA</CardTitle>
          <CardDescription>
            Sign in to access your condominium association portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter your username"
                        data-testid="input-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your password"
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          {/* Owner Registration Link */}
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">New Owner?</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setLocation("/register")}
            >
              Create Your Owner Account
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              First-time owners can register using their unit number
            </p>
          </div>

          <div className="mt-6 text-sm text-center text-muted-foreground">
            <p>Demo accounts:</p>
            <p>Board: <span className="font-mono">board / board1806</span></p>
            <p>Management: <span className="font-mono">management / management1806</span></p>
            <p>Owner: <span className="font-mono">owner201 / owner1806</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
