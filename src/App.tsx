
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/use-theme";
import DashboardLayout from "./components/layout/DashboardLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Orders from "./pages/orders/Orders";
import Calendar from "./pages/calendar/Calendar";
import Settings from "./pages/settings/Settings";
import Ingredients from "./pages/ingredients/Ingredients";
import Recipes from "./pages/recipes/Recipes";
import Customers from "./pages/customers/Customers";
import Store from "./pages/store/Store";
import Packages from "./pages/packages/Packages";
import Costs from "./pages/costs/Costs";
import Pricing from "./pages/pricing/Pricing";
import Reports from "./pages/reports/Reports";
import NotFound from "./pages/NotFound";

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="sweetapp-theme">
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/store/:vendorId" element={<Store />} />
                
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/ingredients" element={<Ingredients />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/packages" element={<Packages />} />
                  <Route path="/costs" element={<Costs />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
