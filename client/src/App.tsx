import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { isAuthenticated, getUser, logout } from "./lib/auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import OwnerDashboard from "@/pages/owner-dashboard";
import Units from "@/pages/units";
import Payment from "@/pages/payment";
import PaymentsList from "@/pages/payments-list";
import Assessments from "@/pages/assessments";
import Vendors from "@/pages/vendors";
import Documents from "@/pages/documents";
import Reports from "@/pages/reports";

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
    >
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }
  
  return <Component />;
}

function AuthenticatedLayout() {
  const user = getUser();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (!user) {
    return <Redirect to="/login" />;
  }

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role={user.role} />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="text-sm">
                <span className="text-muted-foreground">Logged in as: </span>
                <span className="font-medium">{user.username}</span>
                <span className="text-muted-foreground ml-2">
                  ({user.role})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              {user.role === 'owner' ? (
                <>
                  <Route path="/" component={() => <ProtectedRoute component={OwnerDashboard} />} />
                  <Route path="/payment" component={() => <ProtectedRoute component={Payment} />} />
                  <Route path="/history" component={() => <ProtectedRoute component={PaymentsList} />} />
                </>
              ) : (
                <>
                  <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
                  <Route path="/units" component={() => <ProtectedRoute component={Units} />} />
                  <Route path="/payments" component={() => <ProtectedRoute component={PaymentsList} />} />
                  <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
                  <Route path="/assessments" component={() => <ProtectedRoute component={Assessments} />} />
                  <Route path="/vendors" component={() => <ProtectedRoute component={Vendors} />} />
                  <Route path="/documents" component={() => <ProtectedRoute component={Documents} />} />
                </>
              )}
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        {() => isAuthenticated() ? <AuthenticatedLayout /> : <Redirect to="/login" />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
