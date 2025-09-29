import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./lib/auth";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard.tsx";
import Leads from "./pages/leads.tsx";
import Pipeline from "./pages/pipeline.tsx";
import Reminders from "./pages/reminders.tsx";
import Reports from "./pages/reports.tsx";
import Sidebar from "./components/layout/sidebar";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="h-full flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Component />
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/leads" component={() => <ProtectedRoute component={Leads} />} />
      <Route path="/pipeline" component={() => <ProtectedRoute component={Pipeline} />} />
      <Route path="/reminders" component={() => <ProtectedRoute component={Reminders} />} />
      <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
      <Route component={NotFound} />
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
