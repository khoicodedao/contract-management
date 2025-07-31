import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Contracts from "@/pages/contracts";
import Staff from "@/pages/staff";
import Suppliers from "@/pages/suppliers";
import Investors from "@/pages/investors";
import Reception from "@/pages/reception";
import Equipment from "@/pages/equipment";
import BudgetTypes from "@/pages/budget-types";
import Payments from "@/pages/payments";
import Progress from "@/pages/progress";
import Documents from "@/pages/documents";
import NotFound from "@/pages/not-found";
import Footer from "./components/layout/footer";
import LoginPage from "@/pages/login"; // 👈 thêm trang login
import ProtectedRoute from "./lib/protected-route";
import Export from "@/pages/export";
function Router() {
  console.log("Current pathname:", window.location.hash); // 👈 debug ở đây
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />

      {/* protected routes */}
      <Route
        path="/"
        component={() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/hop-dong"
        component={() => (
          <ProtectedRoute>
            <Contracts />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/hop-dong/:id"
        component={() => (
          <ProtectedRoute>
            <Contracts />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/can-bo"
        component={() => (
          <ProtectedRoute>
            <Staff />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/nha-cung-cap"
        component={() => (
          <ProtectedRoute>
            <Suppliers />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/chu-dau-tu"
        component={() => (
          <ProtectedRoute>
            <Investors />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/tiep-nhan"
        component={() => (
          <ProtectedRoute>
            <Reception />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/trang-bi"
        component={() => (
          <ProtectedRoute>
            <Equipment />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/loai-ngan-sach"
        component={() => (
          <ProtectedRoute>
            <BudgetTypes />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/thanh-toan"
        component={() => (
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/tien-do"
        component={() => (
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/tai-lieu"
        component={() => (
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/xuat-du-lieu"
        component={() => (
          <ProtectedRoute>
            <Export />
          </ProtectedRoute>
        )}
      />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  console.log("App component loaded");
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <Footer />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
