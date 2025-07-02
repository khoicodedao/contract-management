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
function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/hop-dong" component={Contracts} />
      <Route path="/can-bo" component={Staff} />
      <Route path="/nha-cung-cap" component={Suppliers} />
      <Route path="/chu-dau-tu" component={Investors} />
      <Route path="/tiep-nhan" component={Reception} />
      <Route path="/trang-bi" component={Equipment} />
      <Route path="/loai-ngan-sach" component={BudgetTypes} />
      <Route path="/thanh-toan" component={Payments} />
      <Route path="/tien-do" component={Progress} />
      <Route path="/tai-lieu" component={Documents} />
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
        <Footer />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
