
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Package, ShoppingCart, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { RevenueChart } from "./components/RevenueChart";
import { RecentOrders } from "./components/RecentOrders";
import { PopularProducts } from "./components/PopularProducts";
import { OrderStatusChart } from "./components/OrderStatusChart";

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  description, 
  trend,
  color 
}: { 
  icon: any;
  label: string;
  value: string;
  description?: string;
  trend?: "up" | "down";
  color?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {label}
      </CardTitle>
      <div className={`w-8 h-8 rounded-lg ${color || 'bg-primary/10'} flex items-center justify-center`}>
        <Icon className={color ? 'text-white' : 'text-primary'} size={18} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      )}
      {trend && (
        <div className={`text-xs mt-1 ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? '↑' : '↓'} vs. mês anterior
        </div>
      )}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const { data: monthOrders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", firstDayOfMonth.toISOString())
        .lte("created_at", today.toISOString());

      if (ordersError) throw ordersError;

      const totalRevenue = monthOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const totalProfit = monthOrders?.reduce((sum, order) => sum + (order.estimated_profit || 0), 0) || 0;
      const pendingOrders = monthOrders?.filter(order => 
        order.delivery_status === 'pending' || order.delivery_status === 'preparing'
      ).length || 0;
      
      return {
        totalRevenue,
        totalProfit,
        totalOrders: monthOrders?.length || 0,
        pendingOrders,
        avgTicket: monthOrders?.length ? totalRevenue / monthOrders.length : 0
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Acompanhe seus resultados e pedidos em tempo real.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={TrendingUp}
          label="Faturamento do Mês"
          value={formatCurrency(stats?.totalRevenue || 0)}
          description="Receita total do período"
          trend="up"
          color="bg-emerald-500"
        />
        <StatCard 
          icon={ShoppingCart}
          label="Total de Pedidos"
          value={String(stats?.totalOrders || 0)}
          description={`${stats?.pendingOrders || 0} pedidos pendentes`}
          color="bg-blue-500"
        />
        <StatCard 
          icon={Package}
          label="Lucro Estimado"
          value={formatCurrency(stats?.totalProfit || 0)}
          description="Baseado nas margens definidas"
          trend="up"
          color="bg-violet-500"
        />
        <StatCard 
          icon={Clock}
          label="Ticket Médio"
          value={formatCurrency(stats?.avgTicket || 0)}
          description="Valor médio por pedido"
          color="bg-amber-500"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <RecentOrders />
        <PopularProducts />
      </div>
    </div>
  );
}
