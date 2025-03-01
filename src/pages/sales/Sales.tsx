
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SaleModal } from "./components/SaleModal";
import { SalesTable } from "./components/SalesTable";
import { SalesAnalytics } from "./components/SalesAnalytics";
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Store,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { useEffect } from "react";

export default function Sales() {
  const { user } = useAuth();

  // Log user and authentication state for debugging
  useEffect(() => {
    console.log("Auth state in Sales.tsx:", { user });
  }, [user]);

  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ["sales-metrics", user?.id],
    queryFn: async () => {
      console.log("Fetching sales metrics for user:", user?.id);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todaySales, error: todayError } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("vendor_id", user?.id)
        .gte("created_at", today.toISOString());

      if (todayError) {
        console.error("Error fetching today's sales:", todayError);
        throw todayError;
      }

      const { data: yesterdaySales, error: yesterdayError } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("vendor_id", user?.id)
        .gte("created_at", new Date(today.getTime() - 86400000).toISOString())
        .lt("created_at", today.toISOString());

      if (yesterdayError) {
        console.error("Error fetching yesterday's sales:", yesterdayError);
        throw yesterdayError;
      }

      console.log("Sales data:", { todaySales, yesterdaySales });

      const todayTotal = todaySales?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const yesterdayTotal = yesterdaySales?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const percentageChange = yesterdayTotal ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0;

      return {
        todayTotal,
        percentageChange,
      };
    },
    enabled: !!user?.id,
  });

  // Log any errors
  useEffect(() => {
    if (metricsError) {
      console.error("Metrics query error:", metricsError);
    }
  }, [metricsError]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground">
            Registre e gerencie suas vendas manuais e online.
          </p>
        </div>
        <SaleModal />
      </div>

      {/* Metrics cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Dia</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? "Carregando..." : formatCurrency(metrics?.todayTotal || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.percentageChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 inline mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 inline mr-1" />
              )}
              {metrics?.percentageChange?.toFixed(1) || 0}% em relação a ontem
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              <ArrowDownRight className="h-4 w-4 text-red-500 inline mr-1" />
              0 novos hoje
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">
              Média dos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online vs Manual</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0% / 0%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Distribuição das vendas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <SalesAnalytics />
      </div>

      {/* Sales table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTable />
        </CardContent>
      </Card>
    </div>
  );
}
