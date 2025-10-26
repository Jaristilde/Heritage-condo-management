import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { isAuthenticated, getUser } from "./lib/auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Diagnostic from "@/pages/diagnostic";
import BoardDashboardVisual from "@/pages/board-dashboard-visual";
import OwnerDashboard from "@/pages/owner-dashboard";
import Units from "@/pages/units";
import Payment from "@/pages/payment";
import PaymentsList from "@/pages/payments-list";
import Assessments from "@/pages/assessments";
import Vendors from "@/pages/vendors";
import VendorForm from "@/pages/vendor-form";
import Invoices from "@/pages/invoices";
import InvoiceForm from "@/pages/invoice-form";
import UnitLedger from "@/pages/unit-ledger";
import Documents from "@/pages/documents";
import Reports from "@/pages/reports";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }
  
  return <Component />;
}

function AuthenticatedLayout() {
  const user = getUser();

  if (!user) {
    return <Redirect to="/login" />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar role={user.role} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
            <Switch>
              {user.role === 'owner' ? (
                <>
                  <Route path="/" component={() => <ProtectedRoute component={OwnerDashboard} />} />
                  <Route path="/payment" component={() => <ProtectedRoute component={Payment} />} />
                  <Route path="/history" component={() => <ProtectedRoute component={PaymentsList} />} />
                </>
              ) : (
                <>
                  <Route path="/" component={() => <ProtectedRoute component={BoardDashboardVisual} />} />
                  <Route path="/units/:id/ledger" component={() => <ProtectedRoute component={UnitLedger} />} />
                  <Route path="/units" component={() => <ProtectedRoute component={Units} />} />
                  <Route path="/payments" component={() => <ProtectedRoute component={PaymentsList} />} />
                  <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
                  <Route path="/assessments" component={() => <ProtectedRoute component={Assessments} />} />
                  <Route path="/vendors/new" component={() => <ProtectedRoute component={VendorForm} />} />
                  <Route path="/vendors/:id/edit" component={() => <ProtectedRoute component={VendorForm} />} />
                  <Route path="/vendors" component={() => <ProtectedRoute component={Vendors} />} />
                  <Route path="/invoices/new" component={() => <ProtectedRoute component={InvoiceForm} />} />
                  <Route path="/invoices/:id" component={() => <ProtectedRoute component={InvoiceForm} />} />
                  <Route path="/invoices" component={() => <ProtectedRoute component={Invoices} />} />
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
      <Route path="/diagnostic" component={Diagnostic} />
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
